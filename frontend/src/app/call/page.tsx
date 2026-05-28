"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import VideoCallRoom from "@/components/VideoCallRoom";
import type { MentorForBooking } from "@/components/MentorBookingModal";

const STORAGE_MENTOR = "activeCallMentor";
const STORAGE_ROOM = "activeCallRoom";

const FALLBACK_MENTOR: MentorForBooking = {
  name: "Зочин",
  email: undefined,
  title: "Video call",
  price: "—",
  pricePerSession: 0,
  rating: 5,
  reviews: 0,
  meetings: 0,
  years: 0,
  tags: ["Demo"],
};

function CallPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mentor, setMentor] = useState<MentorForBooking | null>(null);
  const [roomId, setRoomId] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const roomFromUrl = searchParams.get("room")?.trim() || "";
    let nextMentor: MentorForBooking | null = null;
    let nextRoomId = "";

    if (roomFromUrl) {
      sessionStorage.setItem(STORAGE_ROOM, roomFromUrl);
    }

    try {
      const rawMentor = sessionStorage.getItem(STORAGE_MENTOR);
      if (rawMentor) {
        nextMentor = JSON.parse(rawMentor) as MentorForBooking;
      } else if (roomFromUrl) {
        nextMentor = FALLBACK_MENTOR;
      }
    } catch {
      nextMentor = roomFromUrl ? FALLBACK_MENTOR : null;
    }

    const roomFromStorage = sessionStorage.getItem(STORAGE_ROOM) || "";
    nextRoomId = roomFromUrl || roomFromStorage;

    queueMicrotask(() => {
      setMentor(nextMentor);
      setRoomId(nextRoomId);
      setLoaded(true);
    });
  }, [searchParams]);

  useEffect(() => {
    if (loaded && !roomId) {
      router.replace("/");
    }
  }, [loaded, roomId, router]);

  if (!loaded || !roomId) {
    return (
      <div className="flex h-dvh items-center justify-center bg-[#eceae6] text-sm text-slate-600">
        Уулзалт ачаалж байна...
      </div>
    );
  }

  return <VideoCallRoom mentor={mentor ?? FALLBACK_MENTOR} roomId={roomId} />;
}

export default function CallPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-dvh items-center justify-center bg-[#eceae6] text-sm text-slate-600">
          Уулзалт ачаалж байна...
        </div>
      }
    >
      <CallPageContent />
    </Suspense>
  );
}
