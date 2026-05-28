export const CALL_ALERT_EVENT_KEY = "incomingCallEvent";
export const CALL_ALERT_CLEAR_EVENT_KEY = "incomingCallClearEvent";
const CALL_INITIATED_ROOMS_KEY = "initiatedCallRooms";
const DISMISSED_CALL_ROOMS_KEY = "dismissedCallRooms";

export type IncomingCallAlert = {
  roomId: string;
  hostName: string;
  hostAvatar?: string;
  createdAt: number;
};

export function publishIncomingCallAlert(
  alert: Omit<IncomingCallAlert, "createdAt"> & { createdAt?: number },
) {
  if (typeof window === "undefined") return;

  const payload: IncomingCallAlert = {
    ...alert,
    createdAt: alert.createdAt ?? Date.now(),
  };
  const value = JSON.stringify(payload);

  localStorage.removeItem(CALL_ALERT_CLEAR_EVENT_KEY);
  localStorage.setItem(CALL_ALERT_EVENT_KEY, value);
  window.dispatchEvent(
    new CustomEvent("local-storage-sync", {
      detail: { key: CALL_ALERT_EVENT_KEY, newValue: value },
    }),
  );
}

export function markCallDismissed(roomId: string) {
  if (typeof window === "undefined") return;
  try {
    const raw = sessionStorage.getItem(DISMISSED_CALL_ROOMS_KEY);
    const rooms: string[] = raw ? (JSON.parse(raw) as string[]) : [];
    if (!rooms.includes(roomId)) {
      rooms.push(roomId);
      sessionStorage.setItem(DISMISSED_CALL_ROOMS_KEY, JSON.stringify(rooms));
    }
  } catch {
    sessionStorage.setItem(DISMISSED_CALL_ROOMS_KEY, JSON.stringify([roomId]));
  }
}

export function isCallDismissed(roomId: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = sessionStorage.getItem(DISMISSED_CALL_ROOMS_KEY);
    if (!raw) return false;
    return (JSON.parse(raw) as string[]).includes(roomId);
  } catch {
    return false;
  }
}

export function clearIncomingCallAlert(
  roomId: string,
  options?: { broadcastToLobby?: boolean },
) {
  if (typeof window === "undefined") return;

  markCallDismissed(roomId);

  const rawEvent = localStorage.getItem(CALL_ALERT_EVENT_KEY);
  if (rawEvent) {
    try {
      const event = JSON.parse(rawEvent) as IncomingCallAlert;
      if (event.roomId === roomId) {
        localStorage.removeItem(CALL_ALERT_EVENT_KEY);
        window.dispatchEvent(
          new CustomEvent("local-storage-sync", {
            detail: { key: CALL_ALERT_EVENT_KEY, newValue: null },
          }),
        );
      }
    } catch {
      localStorage.removeItem(CALL_ALERT_EVENT_KEY);
    }
  }

  const clearValue = JSON.stringify({ roomId, at: Date.now() });
  localStorage.setItem(CALL_ALERT_CLEAR_EVENT_KEY, clearValue);
  window.dispatchEvent(
    new CustomEvent("local-storage-sync", {
      detail: { key: CALL_ALERT_CLEAR_EVENT_KEY, newValue: clearValue },
    }),
  );
  if (options?.broadcastToLobby !== false) {
    window.dispatchEvent(
      new CustomEvent("call-clear-broadcast", { detail: { roomId } }),
    );
  }
}

/** Энэ таб дээр эхлүүлсэн дуудлагыг тэмдэглэнэ (эхлүүлэгчид мэдэгдэл харуулахгүй). */
export function markCallInitiated(roomId: string) {
  if (typeof window === "undefined") return;
  try {
    const raw = sessionStorage.getItem(CALL_INITIATED_ROOMS_KEY);
    const rooms: string[] = raw ? (JSON.parse(raw) as string[]) : [];
    if (!rooms.includes(roomId)) {
      rooms.push(roomId);
      sessionStorage.setItem(CALL_INITIATED_ROOMS_KEY, JSON.stringify(rooms));
    }
  } catch {
    sessionStorage.setItem(CALL_INITIATED_ROOMS_KEY, JSON.stringify([roomId]));
  }
}

export function isCallInitiator(roomId: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = sessionStorage.getItem(CALL_INITIATED_ROOMS_KEY);
    if (!raw) return false;
    return (JSON.parse(raw) as string[]).includes(roomId);
  } catch {
    return false;
  }
}

export function parseIncomingCallAlert(
  raw: string | null,
): IncomingCallAlert | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as IncomingCallAlert;
    if (!data.roomId || !data.createdAt) return null;
    return data;
  } catch {
    return null;
  }
}
