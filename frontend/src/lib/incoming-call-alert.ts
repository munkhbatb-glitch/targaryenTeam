export const CALL_ALERT_EVENT_KEY = "incomingCallEvent";
export const CALL_ALERT_CLEAR_EVENT_KEY = "incomingCallClearEvent";

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

export function clearIncomingCallAlert(roomId: string) {
  if (typeof window === "undefined") return;

  const clearValue = JSON.stringify({ roomId, at: Date.now() });
  localStorage.setItem(CALL_ALERT_CLEAR_EVENT_KEY, clearValue);
  window.dispatchEvent(
    new CustomEvent("local-storage-sync", {
      detail: { key: CALL_ALERT_CLEAR_EVENT_KEY, newValue: clearValue },
    }),
  );
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
