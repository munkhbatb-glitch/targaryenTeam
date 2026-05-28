import type { MentorForBooking } from "@/components/MentorBookingModal";

/** Short label for video overlay (e.g. "Г. Саруул" → "Саруул"). */
export function getMentorDisplayName(mentor: MentorForBooking): string {
  const parts = mentor.name.trim().split(/\s+/);
  const last = parts[parts.length - 1];
  return last.replace(/^\./, "") || mentor.name;
}
