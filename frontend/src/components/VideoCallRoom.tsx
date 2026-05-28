"use client";

import {
  AudioMutedOutlined,
  AudioOutlined,
  DesktopOutlined,
  MessageOutlined,
  PhoneOutlined,
  SendOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { MentorForBooking } from "@/components/MentorBookingModal";
import { useLocalMedia } from "@/hooks/useLocalMedia";
import { useVideoCall } from "@/hooks/useVideoCall";
import { getMentorDisplayName } from "@/lib/mentor-display";
import { getApiBase, getInviteUrl } from "@/lib/backend";
import { clearIncomingCallAlert } from "@/lib/incoming-call-alert";

type Props = {
  mentor: MentorForBooking;
  roomId: string;
};

export default function VideoCallRoom({ mentor, roomId }: Props) {
  const router = useRouter();
  const displayName = getMentorDisplayName(mentor);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [chatOpen, setChatOpen] = useState(true);
  const [draft, setDraft] = useState("");
  const [inviteStatus, setInviteStatus] = useState("");
  const [emailConfigured, setEmailConfigured] = useState<boolean | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const {
    stream: localStream,
    tracksRevision,
    micOn,
    cameraOn,
    screenSharing,
    ready,
    error,
    attachToVideo,
    stopStream,
    toggleMic,
    toggleCamera,
    toggleScreenShare,
    startCamera,
  } = useLocalMedia();

  const {
    messages,
    connected,
    remoteVideoReady,
    waiting,
    roomJoined,
    error: callError,
    sendChat,
    attachRemoteVideo,
    cleanup,
  } = useVideoCall({
    roomId,
    displayName,
    localStream,
    tracksRevision,
  });

  const bindLocalVideo = useCallback(
    (el: HTMLVideoElement | null) => {
      localVideoRef.current = el;
      attachToVideo(el);
    },
    [attachToVideo],
  );

  const bindLocalVideoPreview = useCallback(
    (el: HTMLVideoElement | null) => {
      attachToVideo(el);
    },
    [attachToVideo],
  );

  const bindRemoteVideo = useCallback(
    (el: HTMLVideoElement | null) => {
      remoteVideoRef.current = el;
      attachRemoteVideo(el);
    },
    [attachRemoteVideo],
  );

  useEffect(() => {
    attachToVideo(localVideoRef.current);
  }, [ready, cameraOn, screenSharing, attachToVideo]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    fetch(`${getApiBase()}/api/invite/status`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("status failed"))))
      .then((data: { configured?: boolean }) =>
        setEmailConfigured(Boolean(data.configured)),
      )
      .catch(() => setEmailConfigured(null));
  }, []);

  function sendMessage() {
    const text = draft.trim();
    if (!text) return;
    sendChat(text);
    setDraft("");
  }

  function endCall() {
    cleanup();
    stopStream();
    clearIncomingCallAlert(roomId);
    router.push("/");
  }

  const showRemoteVideo = remoteVideoReady || connected;
  const statusError = error || callError;
  const renderMessageText = useCallback((text: string): ReactNode => {
    const urlRegex = /((?:https?:\/\/|www\.)[^\s<]+)/gi;
    const parts = text.split(urlRegex);

    return parts.map((part, idx) => {
      if (!part) return null;

      if (urlRegex.test(part)) {
        const href = part.startsWith("http") ? part : `https://${part}`;
        return (
          <a
            key={`${idx}-${href}`}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:opacity-90"
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </a>
        );
      }

      return <span key={idx}>{part}</span>;
    });
  }, []);

  return (
    <div className="video-call-root relative flex h-dvh flex-col overflow-hidden bg-[#eceae6] p-3 sm:min-h-[600px] sm:p-4">
      <div className="flex min-h-0 flex-1 flex-col gap-3 sm:flex-row sm:gap-4">
        <div className="relative min-w-0 flex-1 overflow-hidden rounded-2xl bg-slate-900 shadow-sm ring-1 ring-black/5">
          <video
            ref={bindRemoteVideo}
            autoPlay
            playsInline
            muted={false}
            className={`size-full object-cover ${showRemoteVideo ? "opacity-100" : "pointer-events-none absolute inset-0 opacity-0"}`}
          />
          {!showRemoteVideo && ready && (cameraOn || screenSharing) && (
            <video
              ref={bindLocalVideoPreview}
              autoPlay
              playsInline
              muted
              className="size-full object-cover"
            />
          )}
          {!showRemoteVideo && !(cameraOn || screenSharing) && (
            <div className="absolute inset-0 bg-[#f0a8c8]/25" />
          )}
          {!showRemoteVideo && waiting && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/35 text-sm font-medium text-white">
              Холбогдохыг хүлээж байна...
            </div>
          )}

          <div className="absolute bottom-4 left-4 rounded-full bg-black/45 px-3.5 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
            {showRemoteVideo ? "Харилцагч" : displayName}
          </div>
        </div>

        <aside
          className={`flex w-full shrink-0 flex-col gap-3 transition-all duration-300 sm:max-w-[360px] ${
            chatOpen
              ? "opacity-100"
              : "pointer-events-none h-0 overflow-hidden opacity-0 sm:h-auto sm:w-0 sm:max-w-0"
          }`}
        >
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
            <header className="flex shrink-0 items-center justify-between gap-2 border-b border-black/5 px-4 py-3.5">
              <div className="flex items-center gap-2">
                <span
                  className={`size-2 rounded-full ${roomJoined ? "bg-emerald-500" : "bg-amber-400"}`}
                />
                <h2 className="text-sm font-semibold text-slate-900">Live Chat</h2>
              </div>
              <span className="text-xs text-slate-400">{roomId}</span>
            </header>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-4">
              {messages.length === 0 && (
                <p className="text-center text-sm text-slate-400">
                  Мессеж бичээрэй
                </p>
              )}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.self ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      msg.self
                        ? "rounded-tr-md bg-[#3b82f6] text-white"
                        : "rounded-tl-md bg-[#f3f2f0] text-slate-800"
                    }`}
                  >
                    {!msg.self && (
                      <div className="mb-1 text-xs font-medium opacity-70">
                        {msg.sender}
                      </div>
                    )}
                    {renderMessageText(msg.text)}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div className="shrink-0 space-y-2 border-t border-black/5 p-3">
              <div className="flex items-center gap-2 rounded-xl bg-[#f5f4f2] px-3 py-2 ring-1 ring-black/5">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Мессеж бичих..."
                  className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={sendMessage}
                  disabled={!draft.trim()}
                  className="shrink-0 text-[#CC553B] transition hover:text-[#B64A33] disabled:opacity-40"
                  aria-label="Илгээх"
                >
                  <SendOutlined className="text-base" />
                </button>
              </div>

              <div className="flex items-center justify-between gap-2 rounded-xl bg-[#f5f4f2] px-3 py-2 text-xs text-slate-600 ring-1 ring-black/5">
                <span className="min-w-0 truncate">
                  Уулзалтын линк {mentor.email ? `${mentor.email} руу` : ""} автоматаар
                  илгээгдэнэ
                </span>
                <button
                  type="button"
                  className="shrink-0 underline underline-offset-2"
                  onClick={() => {
                    void navigator.clipboard.writeText(getInviteUrl(roomId));
                    setInviteStatus("Link хуулагдлаа");
                  }}
                >
                  link хуулах
                </button>
              </div>
              {emailConfigured === false && (
                <p className="px-1 text-xs text-amber-700">
                  И-мэйл тохиргоо дутуу байж магадгүй. Render → Environment шалгана уу.
                  Эсвэл{" "}
                  <button
                    type="button"
                    className="underline"
                    onClick={() => {
                      void navigator.clipboard.writeText(getInviteUrl(roomId));
                      setInviteStatus("Link хуулагдлаа");
                    }}
                  >
                    link хуулах
                  </button>
                </p>
              )}
              {inviteStatus && (
                <p className="px-1 text-xs text-slate-500">{inviteStatus}</p>
              )}
            </div>
          </div>

          <div className="relative aspect-video shrink-0 overflow-hidden rounded-2xl bg-slate-900 shadow-sm ring-1 ring-black/10">
            {ready && (cameraOn || screenSharing) ? (
              <video
                ref={bindLocalVideo}
                autoPlay
                playsInline
                muted
                className="size-full object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center bg-slate-800 text-slate-400">
                <VideoCameraOutlined className="text-3xl" />
              </div>
            )}
            <span className="absolute bottom-2 left-2 rounded-md bg-black/50 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
              Таны видео
            </span>
            {!micOn && (
              <span className="absolute bottom-2 right-2 grid size-7 place-items-center rounded-full bg-black/50 text-white">
                <AudioMutedOutlined className="text-xs" />
              </span>
            )}
          </div>
        </aside>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-20 flex justify-center px-4">
        <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-white/95 px-3 py-2.5 shadow-lg ring-1 ring-black/8 backdrop-blur-md sm:gap-3 sm:px-4">
          <ControlButton
            active={micOn}
            onClick={toggleMic}
            label={micOn ? "Микрофон унтраах" : "Микрофон асаах"}
            icon={micOn ? <AudioOutlined /> : <AudioMutedOutlined />}
          />
          <ControlButton
            active={cameraOn}
            onClick={() => void toggleCamera()}
            label={cameraOn ? "Камер унтраах" : "Камер асаах"}
            icon={<VideoCameraOutlined />}
          />
          <ControlButton
            active={chatOpen}
            onClick={() => setChatOpen((v) => !v)}
            label="Чат"
            icon={<MessageOutlined />}
          />
          <ControlButton
            active={screenSharing}
            onClick={() => void toggleScreenShare()}
            label="Дэлгэц хуваалцах"
            icon={<DesktopOutlined />}
          />
          <button
            type="button"
            onClick={endCall}
            className="ml-1 grid size-11 place-items-center rounded-full bg-red-500 text-white shadow-md transition hover:bg-red-600 sm:size-12"
            aria-label="Дуудлага дуусгах"
          >
            <PhoneOutlined className="rotate-[135deg] text-lg" />
          </button>
        </div>
      </div>

      {(statusError || !ready) && (
        <div className="absolute left-1/2 top-4 z-30 max-w-md -translate-x-1/2 rounded-xl bg-white px-4 py-3 text-center text-sm shadow-lg ring-1 ring-black/10">
          {statusError ? (
            <>
              <p className="text-red-600">{statusError}</p>
              <button
                type="button"
                onClick={() => void startCamera()}
                className="mt-2 font-medium text-[#CC553B] hover:underline"
              >
                Дахин оролдох
              </button>
            </>
          ) : (
            <p className="text-slate-600">Камер холбогдож байна...</p>
          )}
        </div>
      )}
    </div>
  );
}

function ControlButton({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`grid size-10 place-items-center rounded-full text-base transition sm:size-11 ${
        active
          ? "bg-[#f5f4f2] text-slate-800 hover:bg-slate-200"
          : "bg-red-50 text-red-500 hover:bg-red-100"
      }`}
    >
      {icon}
    </button>
  );
}
