"use client";

import { useEffect, useRef } from "react";
import { getWebSocketUrl } from "@/lib/backend";

type IncomingCallPayload = {
  roomId: string;
  hostName: string;
  hostAvatar?: string;
  createdAt: number;
};

type UseLobbyWebSocketOptions = {
  /** Called when server pushes an incoming-call event */
  onIncomingCall: (payload: IncomingCallPayload) => void;
  /** Called when server clears a call (call-clear event) */
  onCallClear?: (roomId: string) => void;
};

/**
 * Maintains a persistent WebSocket connection to the backend "lobby".
 * Any user on the home page stays connected here so they can receive
 * call notifications pushed by the server — works across devices/browsers.
 *
 * Returns a `sendCallNotify` function the caller uses to notify everyone.
 */
export function useLobbyWebSocket({
  onIncomingCall,
  onCallClear,
}: UseLobbyWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  // Stable refs so reconnect closure always calls the latest callbacks
  const onIncomingCallRef = useRef(onIncomingCall);
  const onCallClearRef = useRef(onCallClear);
  useEffect(() => {
    onIncomingCallRef.current = onIncomingCall;
    onCallClearRef.current = onCallClear;
  });

  useEffect(() => {
    mountedRef.current = true;

    function connect() {
      if (!mountedRef.current) return;
      const ws = new WebSocket(getWebSocketUrl());
      wsRef.current = ws;

      ws.onopen = () => {
        // Register in lobby (no email required — server broadcasts to all lobby clients)
        ws.send(JSON.stringify({ type: "lobby-register" }));
      };

      ws.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data as string);
          if (data.type === "incoming-call") {
            onIncomingCallRef.current(data as IncomingCallPayload);
          } else if (data.type === "call-clear") {
            onCallClearRef.current?.(data.roomId as string);
          }
        } catch {
          // ignore parse errors
        }
      };

      ws.onclose = () => {
        wsRef.current = null;
        if (!mountedRef.current) return;
        // Reconnect after 3 seconds
        reconnectTimerRef.current = setTimeout(connect, 3000);
      };

      ws.onerror = () => {
        ws.close();
      };
    }

    connect();

    return () => {
      mountedRef.current = false;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, []);

  /** Caller invokes this to push a call notification to all connected lobby users */
  function sendCallNotify(payload: {
    roomId: string;
    hostName: string;
    hostAvatar?: string;
  }) {
    const message = JSON.stringify({
      type: "call-notify",
      ...payload,
      createdAt: Date.now(),
    });

    const trySend = () => {
      const ws = wsRef.current;
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(message);
        return true;
      }
      return false;
    };

    if (trySend()) return;

    let attempts = 0;
    const retry = setInterval(() => {
      if (trySend() || ++attempts >= 15) {
        clearInterval(retry);
      }
    }, 200);
  }

  function sendCallClear(roomId: string) {
    const message = JSON.stringify({ type: "call-clear", roomId });
    const ws = wsRef.current;
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  }

  return { sendCallNotify, sendCallClear };
}
