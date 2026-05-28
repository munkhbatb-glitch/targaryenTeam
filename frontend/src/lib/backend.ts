function getBrowserOrigin() {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "";
}

export function getApiBase() {
  const configured = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (configured) return configured;
  return getBrowserOrigin() || "https://localhost:3443";
}

export function getWebSocketUrl() {
  const base = getApiBase();
  if (base.startsWith("https://")) {
    return base.replace("https://", "wss://");
  }
  if (base.startsWith("http://")) {
    return base.replace("http://", "ws://");
  }
  return base;
}

export function getInviteUrl(roomId: string) {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    getBrowserOrigin() ||
    "https://localhost:3443";
  return `${appUrl}/call/?room=${encodeURIComponent(roomId)}`;
}
