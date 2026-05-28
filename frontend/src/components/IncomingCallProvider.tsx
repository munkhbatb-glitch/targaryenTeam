"use client";

import { ArrowRightOutlined } from "@ant-design/icons";
import { Avatar } from "antd";
import Lottie from "lottie-react";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import callAnimation from "../../animation.json";
import { useLobbyWebSocket } from "@/hooks/useLobbyWebSocket";
import {
  CALL_ALERT_CLEAR_EVENT_KEY,
  CALL_ALERT_EVENT_KEY,
  clearIncomingCallAlert,
  isCallInitiator,
  parseIncomingCallAlert,
  publishIncomingCallAlert,
  type IncomingCallAlert,
} from "@/lib/incoming-call-alert";

const CALL_MENTOR_KEY = "activeCallMentor";
const ROOM_KEY = "activeCallRoom";
const ALERT_MAX_AGE_MS = 30 * 60 * 1000;

type IncomingCallContextValue = {
  activeAlert: IncomingCallAlert | null;
  broadcastCallToLobby: (payload: {
    roomId: string;
    hostName: string;
    hostAvatar?: string;
  }) => void;
};

const IncomingCallContext = createContext<IncomingCallContextValue>({
  activeAlert: null,
  broadcastCallToLobby: () => {},
});

export function useIncomingCallAlert() {
  return useContext(IncomingCallContext);
}

function isAlertSuppressed(event: IncomingCallAlert): boolean {
  const rawClear = localStorage.getItem(CALL_ALERT_CLEAR_EVENT_KEY);
  if (!rawClear) return false;
  try {
    const clearData = JSON.parse(rawClear) as { roomId?: string; at?: number };
    return (
      clearData.roomId === event.roomId &&
      typeof clearData.at === "number" &&
      clearData.at >= event.createdAt
    );
  } catch {
    return false;
  }
}

function isAlertFresh(event: IncomingCallAlert): boolean {
  return Date.now() - event.createdAt <= ALERT_MAX_AGE_MS;
}

export default function IncomingCallProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [incomingCall, setIncomingCall] = useState<IncomingCallAlert | null>(null);

  const applyIncomingCall = useCallback((event: IncomingCallAlert | null) => {
    if (!event) {
      setIncomingCall(null);
      return;
    }
    if (
      !isAlertFresh(event) ||
      isAlertSuppressed(event) ||
      isCallInitiator(event.roomId)
    ) {
      setIncomingCall(null);
      return;
    }
    setIncomingCall(event);
  }, []);

  const { sendCallNotify, sendCallClear } = useLobbyWebSocket({
    onIncomingCall: (payload) => {
      if (isCallInitiator(payload.roomId)) return;
      publishIncomingCallAlert(payload);
    },
    onCallClear: (roomId) => {
      clearIncomingCallAlert(roomId);
    },
  });

  const broadcastCallToLobby = useCallback(
    (payload: { roomId: string; hostName: string; hostAvatar?: string }) => {
      sendCallNotify(payload);
    },
    [sendCallNotify],
  );

  useEffect(() => {
    const onClearBroadcast = (ev: Event) => {
      const roomId = (ev as CustomEvent<{ roomId: string }>).detail?.roomId;
      if (roomId) sendCallClear(roomId);
    };
    window.addEventListener("call-clear-broadcast", onClearBroadcast);

    applyIncomingCall(
      parseIncomingCallAlert(localStorage.getItem(CALL_ALERT_EVENT_KEY)),
    );

    const onStorage = (ev: StorageEvent) => {
      if (ev.key === CALL_ALERT_EVENT_KEY) {
        applyIncomingCall(parseIncomingCallAlert(ev.newValue));
      }
      if (ev.key === CALL_ALERT_CLEAR_EVENT_KEY) {
        applyIncomingCall(
          parseIncomingCallAlert(localStorage.getItem(CALL_ALERT_EVENT_KEY)),
        );
      }
    };

    const onCustomStorage = (ev: Event) => {
      const detail = (ev as CustomEvent).detail as {
        key?: string;
        newValue?: string;
      };
      if (detail.key === CALL_ALERT_EVENT_KEY) {
        applyIncomingCall(parseIncomingCallAlert(detail.newValue ?? null));
      }
      if (detail.key === CALL_ALERT_CLEAR_EVENT_KEY) {
        applyIncomingCall(
          parseIncomingCallAlert(localStorage.getItem(CALL_ALERT_EVENT_KEY)),
        );
      }
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("local-storage-sync", onCustomStorage);

    const pollInterval = window.setInterval(() => {
      applyIncomingCall(
        parseIncomingCallAlert(localStorage.getItem(CALL_ALERT_EVENT_KEY)),
      );
    }, 1000);

    return () => {
      window.removeEventListener("call-clear-broadcast", onClearBroadcast);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("local-storage-sync", onCustomStorage);
      window.clearInterval(pollInterval);
    };
  }, [applyIncomingCall, sendCallClear]);

  const joinIncomingCall = useCallback(() => {
    if (!incomingCall) return;
    clearIncomingCallAlert(incomingCall.roomId, { broadcastToLobby: false });
    sendCallClear(incomingCall.roomId);
    sessionStorage.setItem(ROOM_KEY, incomingCall.roomId);
    router.push(`/call/?room=${encodeURIComponent(incomingCall.roomId)}`);
    setIncomingCall(null);
  }, [incomingCall, router, sendCallClear]);

  const dismissIncomingCall = useCallback(() => {
    if (!incomingCall) return;
    clearIncomingCallAlert(incomingCall.roomId, { broadcastToLobby: false });
    sendCallClear(incomingCall.roomId);
    setIncomingCall(null);
  }, [incomingCall, sendCallClear]);

  return (
    <IncomingCallContext.Provider
      value={{ activeAlert: incomingCall, broadcastCallToLobby }}
    >
      {children}
      {incomingCall && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-[480px] rounded-3xl bg-white p-10 text-center shadow-2xl">
            <div className="relative mx-auto mb-6 flex w-fit justify-center">
              <div className="relative z-10 size-[140px] rounded-full">
                <Lottie animationData={callAnimation} loop className="size-full" />
              </div>
              <div className="absolute -right-4 top-2 z-20 flex flex-col items-center gap-1">
                <span className="text-3xl">👋</span>
                <Avatar
                  src={incomingCall.hostAvatar || "/boldko.png"}
                  size={56}
                  className="rounded-2xl border-4 border-white shadow-lg"
                />
              </div>
            </div>

            <p className="mb-2 text-sm font-medium text-[#CC553B]">
              {incomingCall.hostName}
            </p>
            <h3 className="mb-8 text-xl font-medium text-slate-900">
              Таны уулзалтын цаг болсон байна
            </h3>

            <button
              type="button"
              onClick={joinIncomingCall}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#CC553B] py-4 text-base font-semibold text-white transition hover:bg-[#B64A33]"
            >
              Уулзалтанд оролцох <ArrowRightOutlined />
            </button>
            <button
              type="button"
              onClick={dismissIncomingCall}
              className="mt-3 w-full rounded-2xl py-3 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
            >
              Хаах
            </button>
          </div>
        </div>
      )}
    </IncomingCallContext.Provider>
  );
}

export { CALL_MENTOR_KEY, ROOM_KEY };
