"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getApiBase, getWebSocketUrl } from "@/lib/backend";

const ICE_SERVERS = [{ urls: "stun:stun.l.google.com:19302" }];

export type ChatMessage = {
  id: string;
  sender: string;
  text: string;
  at: number;
  self: boolean;
};

type UseVideoCallOptions = {
  roomId: string;
  displayName: string;
  localStream: MediaStream | null;
};

export function useVideoCall({
  roomId,
  displayName,
  localStream,
}: UseVideoCallOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const hasPeerRef = useRef(false);
  const wsReadyRef = useRef(false);
  const offerSentRef = useRef(false);
  const displayNameRef = useRef(displayName);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const [roomJoined, setRoomJoined] = useState(false);
  const [waiting, setWaiting] = useState(true);
  const [error, setError] = useState<string | null>(null);

  localStreamRef.current = localStream;
  displayNameRef.current = displayName;

  const appendMessage = useCallback((message: Omit<ChatMessage, "id">) => {
    setMessages((prev) => [
      ...prev,
      { ...message, id: `${message.at}-${prev.length}` },
    ]);
  }, []);

  const attachRemoteVideo = useCallback((el: HTMLVideoElement | null) => {
    remoteVideoRef.current = el;
    const stream = pcRef.current
      ? (() => {
          const tracks = pcRef
            .current!.getReceivers()
            .map((r) => r.track)
            .filter((t): t is MediaStreamTrack => t !== null);
          return tracks.length ? new MediaStream(tracks) : null;
        })()
      : null;

    if (el && stream) {
      el.srcObject = stream;
      void el.play().catch(() => {});
    }
  }, []);

  const cleanupPeer = useCallback(() => {
    pcRef.current?.close();
    pcRef.current = null;
    offerSentRef.current = false;
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    setConnected(false);
    setWaiting(true);
  }, []);

  const cleanupAll = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "leave" }));
      wsRef.current.close();
    }
    wsRef.current = null;
    wsReadyRef.current = false;
    hasPeerRef.current = false;
    cleanupPeer();
    setRoomJoined(false);
  }, [cleanupPeer]);

  const createPeerConnection = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return null;

    cleanupPeer();

    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
        void remoteVideoRef.current.play().catch(() => {});
      }
      setWaiting(false);
      setConnected(true);
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "ice-candidate",
            candidate: event.candidate,
          }),
        );
      }
    };

    pc.onconnectionstatechange = () => {
      if (
        pc.connectionState === "failed" ||
        pc.connectionState === "disconnected"
      ) {
        setWaiting(true);
        setConnected(false);
        setError("Видео холболт тасарлаа.");
      }
    };

    pcRef.current = pc;
    return pc;
  }, [cleanupPeer]);

  const createOfferRef = useRef<() => Promise<void>>(async () => {});
  createOfferRef.current = async () => {
    if (offerSentRef.current || !localStreamRef.current) return;

    const pc = createPeerConnection();
    if (!pc || !wsRef.current) return;

    offerSentRef.current = true;
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    wsRef.current.send(JSON.stringify({ type: "offer", offer }));
  };

  const handleOfferRef = useRef<
    (offer: RTCSessionDescriptionInit) => Promise<void>
  >(async () => {});
  handleOfferRef.current = async (offer: RTCSessionDescriptionInit) => {
    if (!localStreamRef.current) {
      hasPeerRef.current = true;
      return;
    }

    const pc = createPeerConnection();
    if (!pc || !wsRef.current) return;

    await pc.setRemoteDescription(offer);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    wsRef.current.send(JSON.stringify({ type: "answer", answer }));
  };

  const tryStartVideoRef = useRef<() => Promise<void>>(async () => {});
  tryStartVideoRef.current = async () => {
    if (!wsReadyRef.current || !localStreamRef.current) return;
    if (hasPeerRef.current && !pcRef.current && !offerSentRef.current) {
      await createOfferRef.current();
    }
  };

  useEffect(() => {
    if (!roomId) return;

    setError(null);
    setMessages([]);
    setWaiting(true);
    setConnected(false);
    setRoomJoined(false);
    hasPeerRef.current = false;
    offerSentRef.current = false;

    const ws = new WebSocket(getWebSocketUrl());
    wsRef.current = ws;

    ws.onopen = () => {
      wsReadyRef.current = true;
      ws.send(JSON.stringify({ type: "join", roomId }));
    };

    ws.onmessage = async (event) => {
      const data = JSON.parse(event.data as string);

      switch (data.type) {
        case "joined":
          setRoomJoined(true);
          if (data.peers >= 1) {
            hasPeerRef.current = true;
            await tryStartVideoRef.current();
          }
          break;
        case "peer-joined":
          hasPeerRef.current = true;
          await createOfferRef.current();
          break;
        case "offer":
          await handleOfferRef.current(data.offer);
          break;
        case "answer":
          await pcRef.current?.setRemoteDescription(data.answer);
          break;
        case "ice-candidate":
          if (data.candidate) {
            await pcRef.current?.addIceCandidate(data.candidate);
          }
          break;
        case "peer-left":
          cleanupPeer();
          break;
        case "chat":
          appendMessage({
            text: data.text,
            sender: data.sender || "Guest",
            at: data.at || Date.now(),
            self: data.sender === displayNameRef.current,
          });
          break;
        case "chat-history":
          setMessages(
            (data.messages || []).map(
              (
                message: { text: string; sender: string; at: number },
                index: number,
              ) => ({
                id: `history-${index}-${message.at}`,
                text: message.text,
                sender: message.sender,
                at: message.at,
                self: message.sender === displayNameRef.current,
              }),
            ),
          );
          break;
      }
    };

    ws.onerror = () => {
      setError("Чат server-т холбогдож чадсангүй.");
    };

    ws.onclose = () => {
      wsReadyRef.current = false;
      setRoomJoined(false);
    };

    return () => {
      cleanupAll();
    };
  }, [appendMessage, cleanupAll, cleanupPeer, roomId]);

  useEffect(() => {
    if (!localStream || !roomJoined) return;
    void tryStartVideoRef.current();
  }, [localStream, roomJoined]);

  const sendChat = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      if (wsRef.current?.readyState !== WebSocket.OPEN) {
        setError("Чат холбогдоогүй байна. Хуудсыг refresh хийнэ үү.");
        return;
      }

      const message = {
        type: "chat",
        text: trimmed,
        sender: displayName,
        at: Date.now(),
      };

      wsRef.current.send(JSON.stringify(message));
      appendMessage({
        text: trimmed,
        sender: displayName,
        at: message.at,
        self: true,
      });
    },
    [appendMessage, displayName],
  );

  const sendInvite = useCallback(
    async (email: string) => {
      const response = await fetch(`${getApiBase()}/api/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          roomId,
          hostName: displayName,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(
          Array.isArray(data.message)
            ? data.message.join(", ")
            : data.message || "Урилга илгээхэд алдаа гарлаа.",
        );
      }

      return data as { provider: string; message: string; messageId?: string };
    },
    [displayName, roomId],
  );

  return {
    messages,
    connected,
    roomJoined,
    waiting,
    error,
    sendChat,
    sendInvite,
    attachRemoteVideo,
    cleanup: cleanupAll,
  };
}
