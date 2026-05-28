"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getApiBase, getWebSocketUrl } from "@/lib/backend";
import { clearIncomingCallAlert } from "@/lib/incoming-call-alert";

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
  /** Increments when local audio/video tracks are added or removed */
  tracksRevision?: number;
};

export function useVideoCall({
  roomId,
  displayName,
  localStream,
  tracksRevision = 0,
}: UseVideoCallOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const hasPeerRef = useRef(false);
  const wsReadyRef = useRef(false);
  const offerSentRef = useRef(false);
  const shouldOfferRef = useRef(false);
  const displayNameRef = useRef(displayName);
  const pendingOfferRef = useRef<RTCSessionDescriptionInit | null>(null);
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const [remoteVideoReady, setRemoteVideoReady] = useState(false);
  const [roomJoined, setRoomJoined] = useState(false);
  const [waiting, setWaiting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const clearSignalSentRef = useRef(false);

  useEffect(() => {
    localStreamRef.current = localStream;
    displayNameRef.current = displayName;
  }, [localStream, displayName]);

  const appendMessage = useCallback((message: Omit<ChatMessage, "id">) => {
    setMessages((prev) => [
      ...prev,
      { ...message, id: `${message.at}-${prev.length}` },
    ]);
  }, []);

  const attachRemoteMedia = useCallback((el: HTMLVideoElement | null) => {
    remoteVideoRef.current = el;
    if (el && remoteStreamRef.current) {
      el.srcObject = remoteStreamRef.current;
      el.muted = false;
      void el.play().catch(() => {});
    }
  }, []);

  const refreshRemoteMediaState = useCallback(() => {
    const stream = remoteStreamRef.current;
    const hasVideo = Boolean(
      stream
        ?.getVideoTracks()
        .some((t) => t.readyState === "live" && t.enabled),
    );
    const hasMedia = Boolean(
      stream?.getTracks().some((t) => t.readyState === "live"),
    );
    setRemoteVideoReady(hasVideo);
    setConnected(hasMedia);
    setWaiting(!hasMedia);
  }, []);

  const bindRemoteStream = useCallback(() => {
    const el = remoteVideoRef.current;
    if (!el || !remoteStreamRef.current) return;
    el.srcObject = remoteStreamRef.current;
    el.muted = false;
    void el.play().catch(() => {});
    refreshRemoteMediaState();
  }, [refreshRemoteMediaState]);

  const addRemoteTrack = useCallback(
    (track: MediaStreamTrack) => {
      if (!remoteStreamRef.current) {
        remoteStreamRef.current = new MediaStream();
      }
      const exists = remoteStreamRef.current
        .getTracks()
        .some((t) => t.id === track.id);
      if (!exists) {
        remoteStreamRef.current.addTrack(track);
      }
      track.onunmute = () => {
        refreshRemoteMediaState();
        bindRemoteStream();
      };
      refreshRemoteMediaState();
      bindRemoteStream();
    },
    [bindRemoteStream, refreshRemoteMediaState],
  );

  const flushPendingCandidates = useCallback(async (pc: RTCPeerConnection) => {
    const pending = pendingCandidatesRef.current;
    pendingCandidatesRef.current = [];
    for (const candidate of pending) {
      try {
        await pc.addIceCandidate(candidate);
      } catch {
        // ignore stale candidates
      }
    }
  }, []);

  const cleanupPeer = useCallback(() => {
    pcRef.current?.close();
    pcRef.current = null;
    offerSentRef.current = false;
    shouldOfferRef.current = false;
    pendingOfferRef.current = null;
    pendingCandidatesRef.current = [];
    remoteStreamRef.current = null;
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    setConnected(false);
    setRemoteVideoReady(false);
    setWaiting(true);
  }, []);

  const broadcastClearIncomingCallAlert = useCallback(() => {
    clearIncomingCallAlert(roomId);
  }, [roomId]);

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
    stream.getAudioTracks().forEach((track) => pc.addTrack(track, stream));
    stream.getVideoTracks().forEach((track) => pc.addTrack(track, stream));

    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      if (remoteStream) {
        remoteStreamRef.current = remoteStream;
        remoteStream.onaddtrack = () => bindRemoteStream();
        bindRemoteStream();
      } else {
        const track = event.track;
        if (track.kind === "audio" || track.kind === "video") {
          addRemoteTrack(track);
        }
      }
      if (!clearSignalSentRef.current) {
        clearSignalSentRef.current = true;
        broadcastClearIncomingCallAlert();
      }
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
  }, [addRemoteTrack, bindRemoteStream, cleanupPeer, broadcastClearIncomingCallAlert]);

  const createOffer = useCallback(async () => {
    if (offerSentRef.current || !localStreamRef.current) return;

    const pc = createPeerConnection();
    if (!pc || !wsRef.current) return;

    offerSentRef.current = true;
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    wsRef.current.send(JSON.stringify({ type: "offer", offer }));
  }, [createPeerConnection]);

  const handleOffer = useCallback(
    async (offer: RTCSessionDescriptionInit) => {
      if (!localStreamRef.current) {
        hasPeerRef.current = true;
        pendingOfferRef.current = offer;
        return;
      }

      const pc = createPeerConnection();
      if (!pc || !wsRef.current) return;

      await pc.setRemoteDescription(offer);
      await flushPendingCandidates(pc);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      wsRef.current.send(JSON.stringify({ type: "answer", answer }));
    },
    [createPeerConnection, flushPendingCandidates],
  );

  useEffect(() => {
    if (!roomId) return;

    queueMicrotask(() => {
      setError(null);
      setMessages([]);
      setWaiting(true);
      setConnected(false);
      setRoomJoined(false);
    });
    hasPeerRef.current = false;
    offerSentRef.current = false;
    shouldOfferRef.current = false;
    clearSignalSentRef.current = false;

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
            shouldOfferRef.current = false;
          }
          break;
        case "peer-joined":
          hasPeerRef.current = true;
          shouldOfferRef.current = true;
          if (localStreamRef.current) {
            await createOffer();
          }
          break;
        case "offer":
          await handleOffer(data.offer);
          break;
        case "answer":
          if (pcRef.current) {
            await pcRef.current.setRemoteDescription(data.answer);
            await flushPendingCandidates(pcRef.current);
          }
          break;
        case "ice-candidate":
          if (data.candidate) {
            const pc = pcRef.current;
            if (!pc || !pc.remoteDescription) {
              pendingCandidatesRef.current.push(data.candidate);
            } else {
              try {
                await pc.addIceCandidate(data.candidate);
              } catch {
                // ignore
              }
            }
          }
          break;
        case "peer-left":
          broadcastClearIncomingCallAlert();
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
  }, [
    appendMessage,
    cleanupAll,
    cleanupPeer,
    createOffer,
    broadcastClearIncomingCallAlert,
    flushPendingCandidates,
    handleOffer,
    roomId,
  ]);

  useEffect(() => {
    if (!localStream || !roomJoined) return;

    void (async () => {
      if (pendingOfferRef.current) {
        const offer = pendingOfferRef.current;
        pendingOfferRef.current = null;
        await handleOffer(offer);
        return;
      }

      if (
        shouldOfferRef.current &&
        hasPeerRef.current &&
        !offerSentRef.current &&
        localStreamRef.current
      ) {
        await createOffer();
        return;
      }

      const pc = pcRef.current;
      const stream = localStreamRef.current;
      if (!pc || !stream || !wsRef.current) return;

      let needsRenegotiate = false;
      for (const track of stream.getTracks()) {
        const sender = pc
          .getSenders()
          .find((s) => s.track?.kind === track.kind);
        if (sender) {
          if (sender.track?.id !== track.id) {
            await sender.replaceTrack(track);
          }
        } else if (track.readyState === "live") {
          pc.addTrack(track, stream);
          needsRenegotiate = true;
        }
      }

      if (
        needsRenegotiate &&
        offerSentRef.current &&
        wsRef.current.readyState === WebSocket.OPEN
      ) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        wsRef.current.send(JSON.stringify({ type: "offer", offer }));
      }
    })();
  }, [localStream, tracksRevision, roomJoined, createOffer, handleOffer]);

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
    remoteVideoReady,
    roomJoined,
    waiting,
    error,
    sendChat,
    sendInvite,
    attachRemoteVideo: attachRemoteMedia,
    cleanup: cleanupAll,
  };
}
