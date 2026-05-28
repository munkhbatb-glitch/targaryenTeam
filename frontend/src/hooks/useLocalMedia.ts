"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type UseLocalMediaOptions = {
  autoStart?: boolean;
};

/**
 * Local camera/mic via WebRTC getUserMedia / getDisplayMedia.
 * @see https://webrtc.org/
 */
export function useLocalMedia({ autoStart = true }: UseLocalMediaOptions = {}) {
  const streamRef = useRef<MediaStream | null>(null);
  const cameraVideoTrackRef = useRef<MediaStreamTrack | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [tracksRevision, setTracksRevision] = useState(0);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bumpTracksRevision = useCallback(() => {
    setTracksRevision((v) => v + 1);
  }, []);

  const attachToVideo = useCallback((el: HTMLVideoElement | null) => {
    if (el && streamRef.current) {
      el.srcObject = streamRef.current;
      void el.play().catch(() => {});
    }
  }, []);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    cameraVideoTrackRef.current = null;
    setStream(null);
    setReady(false);
    setScreenSharing(false);
  }, []);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = stream;
      setStream(stream);
      const videoTrack = stream.getVideoTracks()[0] ?? null;
      cameraVideoTrackRef.current = videoTrack;
      setMicOn(true);
      setCameraOn(!!videoTrack);
      setScreenSharing(false);
      setReady(true);
      return stream;
    } catch {
      setError(
        "Камер эсвэл микрофонд хандах эрх олгогдсонгүй. Тохиргоогоо шалгана уу.",
      );
      return null;
    }
  }, []);

  useEffect(() => {
    if (!autoStart) return;
    queueMicrotask(() => {
      void startCamera();
    });
    return () => stopStream();
  }, [autoStart, startCamera, stopStream]);

  const toggleMic = useCallback(() => {
    const tracks = streamRef.current?.getAudioTracks() ?? [];
    if (!tracks.length) return;
    const next = !micOn;
    tracks.forEach((t) => {
      t.enabled = next;
    });
    setMicOn(next);
  }, [micOn]);

  const toggleCamera = useCallback(async () => {
    const stream = streamRef.current;
    if (!stream || screenSharing) return;

    if (cameraOn) {
      stream.getVideoTracks().forEach((t) => {
        t.stop();
        stream.removeTrack(t);
      });
      cameraVideoTrackRef.current = null;
      setCameraOn(false);
      bumpTracksRevision();
      return;
    }

    try {
      const videoOnly = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      const track = videoOnly.getVideoTracks()[0];
      if (!track) return;
      cameraVideoTrackRef.current = track;
      stream.addTrack(track);
      setCameraOn(true);
      bumpTracksRevision();
    } catch {
      setError("Камер асаахад алдаа гарлаа.");
    }
  }, [bumpTracksRevision, cameraOn, screenSharing]);

  const toggleScreenShare = useCallback(async () => {
    const stream = streamRef.current;
    if (!stream) return;

    if (screenSharing) {
      stream.getVideoTracks().forEach((t) => {
        t.stop();
        stream.removeTrack(t);
      });
      if (cameraVideoTrackRef.current) {
        try {
          const fresh = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
          const track = fresh.getVideoTracks()[0];
          if (track) {
            cameraVideoTrackRef.current = track;
            stream.addTrack(track);
            setCameraOn(true);
          }
        } catch {
          setCameraOn(false);
        }
      }
      setScreenSharing(false);
      bumpTracksRevision();
      return;
    }

    try {
      const display = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });
      const screenTrack = display.getVideoTracks()[0];
      if (!screenTrack) return;

      stream.getVideoTracks().forEach((t) => {
        t.stop();
        stream.removeTrack(t);
      });
      stream.addTrack(screenTrack);
      screenTrack.onended = () => {
        setScreenSharing(false);
        void (async () => {
          stream.getVideoTracks().forEach((t) => {
            t.stop();
            stream.removeTrack(t);
          });
          try {
            const fresh = await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: false,
            });
            const track = fresh.getVideoTracks()[0];
            if (track) {
              cameraVideoTrackRef.current = track;
              stream.addTrack(track);
              setCameraOn(true);
            }
          } catch {
            setCameraOn(false);
          }
        })();
      };
      setScreenSharing(true);
      setCameraOn(true);
      bumpTracksRevision();
    } catch {
      /* user cancelled picker */
    }
  }, [bumpTracksRevision, screenSharing]);

  return {
    stream,
    tracksRevision,
    streamRef,
    micOn,
    cameraOn,
    screenSharing,
    ready,
    error,
    attachToVideo,
    startCamera,
    stopStream,
    toggleMic,
    toggleCamera,
    toggleScreenShare,
  };
}
