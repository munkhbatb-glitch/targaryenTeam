"use client";

import {
  ArrowRightOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  CloseOutlined,
  LeftOutlined,
  RightOutlined,
  StarFilled,
  TeamOutlined,
} from "@ant-design/icons";
import { Modal } from "antd";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

export type MentorForBooking = {
  name: string;
  email?: string;
  title: string;
  company?: string;
  avatarUrl?: string;
  price: string;
  pricePerSession: number;
  rating: number;
  reviews: number;
  meetings: number;
  years: number;
  tags: string[];
};

type Props = {
  mentor: MentorForBooking | null;
  open: boolean;
  onClose: () => void;
  /** Дуудлага эхлэх үед (төлбөр амжилттай) шууд дуудагдана */
  onCallInitiated?: (mentor: MentorForBooking, roomId: string) => void;
  /** Эхлүүлэгч видео уулзалтад орно */
  onJoinCall?: (mentor: MentorForBooking, roomId: string) => void;
  onBookingComplete?: (mentor: MentorForBooking) => void;
};

const WEEKDAYS_MN = ["Да", "Мя", "Лх", "Пү", "Ба", "Бя", "Ня"];
const MONTHS_MN = [
  "1 сар",
  "2 сар",
  "3 сар",
  "4 сар",
  "5 сар",
  "6 сар",
  "7 сар",
  "8 сар",
  "9 сар",
  "10 сар",
  "11 сар",
  "12 сар",
];

const TIME_SLOTS = [
  "09:00",
  "10:00",
  "11:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
];

const DURATIONS = [
  { minutes: 30, label: "30мин", multiplier: 0.55 },
  { minutes: 60, label: "60мин", multiplier: 1 },
  { minutes: 90, label: "90мин", multiplier: 1.45 },
] as const;

function formatPrice(amount: number) {
  return `${amount.toLocaleString("mn-MN")}₮`;
}

function formatDateDisplay(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}.${m}.${d}`;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getCalendarDays(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startOffset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];

  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return cells;
}

function hashAvailable(day: number, month: number) {
  return (day * 7 + month * 3) % 5 !== 0;
}

function isFinderModule(row: number, col: number, size: number) {
  const inTopLeft = row < 7 && col < 7;
  const inTopRight = row < 7 && col >= size - 7;
  const inBottomLeft = row >= size - 7 && col < 7;
  if (!inTopLeft && !inTopRight && !inBottomLeft) return false;

  let localRow = row;
  let localCol = col;
  if (inTopRight) localCol -= size - 7;
  if (inBottomLeft) localRow -= size - 7;

  const border = localRow === 0 || localCol === 0 || localRow === 6 || localCol === 6;
  const core =
    localRow >= 2 && localRow <= 4 && localCol >= 2 && localCol <= 4;
  return border || core;
}

function buildQrGrid(seedText: string, size = 25) {
  let seed = 0;
  for (let i = 0; i < seedText.length; i++) {
    seed = (seed + seedText.charCodeAt(i) * (i + 17)) % 100000;
  }

  const grid: boolean[][] = [];
  for (let row = 0; row < size; row++) {
    const line: boolean[] = [];
    for (let col = 0; col < size; col++) {
      if (isFinderModule(row, col, size)) {
        line.push(true);
        continue;
      }
      seed = (seed * 1103515245 + 12345) % 2147483647;
      line.push(seed % 3 !== 0);
    }
    grid.push(line);
  }
  return grid;
}

function QrCodeDisplay({ value }: { value: string }) {
  const grid = useMemo(() => buildQrGrid(value), [value]);
  const moduleSize = 8;

  return (
    <svg
      viewBox={`0 0 ${grid.length * moduleSize} ${grid.length * moduleSize}`}
      className="h-auto w-full max-w-[220px]"
      role="img"
      aria-label="Төлбөрийн QR код"
    >
      <rect width="100%" height="100%" fill="white" />
      {grid.map((row, r) =>
        row.map((filled, c) =>
          filled ? (
            <rect
              key={`${r}-${c}`}
              x={c * moduleSize}
              y={r * moduleSize}
              width={moduleSize}
              height={moduleSize}
              fill="#111827"
            />
          ) : null,
        ),
      )}
    </svg>
  );
}

type BookingStep = "booking" | "payment";
type PaymentPhase = "qr" | "checking" | "success";

const CONFETTI_PIECES = [
  { top: "6%", left: "20%", rotate: 18, color: "#CC553B", w: 10, h: 10, round: false, delay: "0s" },
  { top: "12%", left: "74%", rotate: -24, color: "#1f2937", w: 8, h: 14, round: false, delay: "0.15s" },
  { top: "20%", left: "10%", rotate: 42, color: "#d4a574", w: 12, h: 6, round: false, delay: "0.3s" },
  { top: "16%", left: "56%", rotate: -8, color: "#CC553B", w: 7, h: 7, round: true, delay: "0.08s" },
  { top: "30%", left: "80%", rotate: 30, color: "#B64A33", w: 9, h: 9, round: false, delay: "0.22s" },
  { top: "36%", left: "14%", rotate: -35, color: "#1f2937", w: 6, h: 6, round: true, delay: "0.4s" },
  { top: "46%", left: "86%", rotate: 12, color: "#fde2d2", w: 11, h: 5, round: false, delay: "0.12s" },
  { top: "50%", left: "6%", rotate: -18, color: "#CC553B", w: 8, h: 12, round: false, delay: "0.28s" },
  { top: "60%", left: "68%", rotate: 45, color: "#d4a574", w: 10, h: 10, round: false, delay: "0.35s" },
  { top: "66%", left: "26%", rotate: -12, color: "#1f2937", w: 7, h: 7, round: true, delay: "0.18s" },
] as const;

function PaymentFlowCard({
  phase,
  isClosing,
  totalPrice,
  qrPayload,
  onCheckPayment,
  onBack,
  onJoinCall,
}: {
  phase: PaymentPhase;
  isClosing: boolean;
  totalPrice: number;
  qrPayload: string;
  onCheckPayment: () => void;
  onBack: () => void;
  onJoinCall: () => void;
}) {
  const isSuccess = phase === "success";
  const isChecking = phase === "checking";

  return (
    <div
      className={`booking-payment-card relative overflow-hidden rounded-2xl bg-[#fbfaf8] px-6 py-8 text-center transition-[min-height] duration-500 ease-out sm:px-8 sm:py-10 ${
        isSuccess ? "booking-payment-card--success min-h-[380px]" : "min-h-[520px]"
      } ${isClosing ? "booking-payment-card--closing" : ""}`}
    >
      {isSuccess &&
        CONFETTI_PIECES.map((piece, i) => (
          <span
            key={i}
            className="booking-confetti-piece pointer-events-none absolute block"
            style={{
              top: piece.top,
              left: piece.left,
              width: piece.w,
              height: piece.h,
              backgroundColor: piece.color,
              borderRadius: piece.round ? "9999px" : "2px",
              ["--confetti-rotate" as string]: `${piece.rotate}deg`,
              animationDelay: piece.delay,
            }}
          />
        ))}

      <div
        className={`grid transition-all duration-500 ease-out ${
          isSuccess
            ? "pointer-events-none grid-rows-[0fr] opacity-0"
            : "grid-rows-[1fr] opacity-100"
        }`}
      >
        <div className="overflow-hidden">
          <div className={isChecking && !isSuccess ? "booking-qr-exit" : ""}>
            <h3 className="text-lg font-semibold text-slate-900">
              QR кодоор төлбөр төлөх
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Банкны апп ашиглан QR-аа уншуулна уу
            </p>

            <div
              className={`mx-auto mt-8 max-w-[260px] rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 transition-all duration-500 ${
                isChecking ? "scale-[0.97] opacity-40 blur-[1px]" : "scale-100 opacity-100"
              }`}
            >
              <QrCodeDisplay value={qrPayload} />
            </div>

            <div className="mt-8">
              <p className="text-sm text-slate-500">Захиалгын дүн</p>
              <p className="mt-1 text-3xl font-bold text-[#c45c3e]">
                {formatPrice(totalPrice)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`absolute inset-0 flex items-center justify-center bg-[#fbfaf8]/70 transition-opacity duration-300 ${
          isChecking ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div className="flex flex-col items-center gap-3">
          <span className="size-10 animate-spin rounded-full border-[3px] border-[#CC553B]/25 border-t-[#CC553B]" />
          <p className="text-sm font-medium text-slate-600">Төлбөр шалгаж байна...</p>
        </div>
      </div>

      <div
        className={`absolute inset-x-6 top-1/2 flex -translate-y-1/2 flex-col items-center sm:inset-x-8 ${
          isSuccess
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        <div className="relative flex size-28 items-center justify-center">
          <span className="booking-success-ring absolute inset-0 rounded-full bg-[#fde2d2]/80" />
          <span className="booking-success-icon relative grid size-[72px] place-items-center rounded-full bg-[#CC553B] shadow-md">
            <CheckOutlined className="text-3xl text-white" />
          </span>
        </div>

        <h3 className="booking-success-title mt-8 text-xl font-bold text-slate-900 sm:text-2xl">
          Захиалга амжилттай бүртгэгдлээ
        </h3>
        <p className="booking-success-desc mx-auto mt-4 max-w-xs text-sm leading-relaxed text-slate-500">
          Таны 1-1 гишүүншипын уулзалт амжилттай захиалагдлаа.
          <br />
          Баталгаажуулалтыг и-мэйлээр илгээлээ.
        </p>
        <button
          type="button"
          onClick={onJoinCall}
          className="booking-success-title mt-6 rounded-xl bg-[#CC553B] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#B64A33]"
        >
          Видео уулзалт эхлүүлэх
        </button>
      </div>

      <div
        className={`space-y-3 transition-all duration-500 ${
          isSuccess ? "hidden" : "mt-8 opacity-100"
        }`}
      >
        <button
          type="button"
          disabled={isChecking}
          onClick={onCheckPayment}
          className="w-full rounded-xl bg-[#CC553B] py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#B64A33] disabled:opacity-70"
        >
          Төлбөр шалгах
        </button>
        <button
          type="button"
          disabled={isChecking}
          onClick={onBack}
          className="w-full rounded-xl border border-black/10 bg-white py-3.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 disabled:opacity-50"
        >
          Буцах
        </button>
      </div>
    </div>
  );
}

function BookingModalShell({
  open,
  onClose,
  width,
  children,
}: {
  open: boolean;
  onClose: () => void;
  width: number;
  children: ReactNode;
}) {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      closable={false}
      width={width}
      centered
      destroyOnHidden
      className="[&_.ant-modal-content]:overflow-hidden [&_.ant-modal-content]:rounded-2xl [&_.ant-modal-content]:p-0"
      classNames={{ body: "!p-0" }}
      styles={{ mask: { backdropFilter: "blur(4px)" } }}
    >
      {children}
    </Modal>
  );
}

export default function MentorBookingModal({
  mentor,
  open,
  onClose,
  onCallInitiated,
  onJoinCall,
  onBookingComplete,
}: Props) {
  const today = useMemo(() => new Date(), []);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date(today));
  const [selectedTime, setSelectedTime] = useState("09:00");
  const [durationMinutes, setDurationMinutes] = useState<30 | 60 | 90>(90);
  const [notes, setNotes] = useState(
    "Портфолиогоо шүүлгэж, case study-нхуудаа санал хүсэлт авмаар байна.",
  );
  const [step, setStep] = useState<BookingStep>("booking");
  const [paymentPhase, setPaymentPhase] = useState<PaymentPhase>("qr");
  const [isClosing, setIsClosing] = useState(false);
  const closeTimerRef = useRef<number | null>(null);
  const completedRef = useRef(false);
  const callInitiatedRef = useRef(false);
  const pendingRoomIdRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!open) {
      queueMicrotask(() => {
        setStep("booking");
        setPaymentPhase("qr");
        setIsClosing(false);
      });
      completedRef.current = false;
      callInitiatedRef.current = false;
      pendingRoomIdRef.current = null;
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    }
  }, [open]);

  function initiateCallAlert() {
    if (!mentor || callInitiatedRef.current) return;
    callInitiatedRef.current = true;
    const roomId = pendingRoomIdRef.current ?? `call-${Date.now()}`;
    pendingRoomIdRef.current = roomId;
    onCallInitiated?.(mentor, roomId);
  }

  const calendarDays = useMemo(
    () => getCalendarDays(viewYear, viewMonth),
    [viewYear, viewMonth],
  );

  const durationConfig = DURATIONS.find((d) => d.minutes === durationMinutes)!;
  const totalPrice = mentor
    ? Math.round(mentor.pricePerSession * durationConfig.multiplier)
    : 0;

  const disabledTimesForDay = useMemo(() => {
    const seed = selectedDate.getDate() + selectedDate.getMonth();
    return new Set(
      TIME_SLOTS.filter((_, i) => (seed + i) % 4 === 0),
    );
  }, [selectedDate]);

  function goMonth(delta: number) {
    const next = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  }

  function selectDay(day: number) {
    const next = new Date(viewYear, viewMonth, day);
    if (next < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
      return;
    }
    setSelectedDate(next);
    setSelectedTime("09:00");
  }

  const qrPayload = `${mentor?.name}-${formatDateDisplay(selectedDate)}-${selectedTime}-${totalPrice}`;

  function closeModal() {
    if (isClosing) return;
    setIsClosing(true);
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => {
      setIsClosing(false);
      setPaymentPhase("qr");
      onClose();
    }, 420);
  }

  function joinVideoCall() {
    if (!mentor || isClosing) return;
    const roomId = pendingRoomIdRef.current;
    if (!roomId) return;
    if (!callInitiatedRef.current) initiateCallAlert();
    if (!completedRef.current) {
      completedRef.current = true;
      onBookingComplete?.(mentor);
    }
    onJoinCall?.(mentor, roomId);
    closeModal();
  }

  function handleCheckPayment() {
    if (paymentPhase !== "qr") return;
    pendingRoomIdRef.current = `call-${Date.now()}`;
    setPaymentPhase("checking");
    window.setTimeout(() => {
      setPaymentPhase("success");
      initiateCallAlert();
      closeTimerRef.current = window.setTimeout(() => {
        joinVideoCall();
      }, 3200);
    }, 1400);
  }

  if (!mentor) return null;

  if (step === "payment") {
    return (
      <BookingModalShell open={open} onClose={closeModal} width={420}>
        <PaymentFlowCard
          phase={paymentPhase}
          isClosing={isClosing}
          totalPrice={totalPrice}
          qrPayload={qrPayload}
          onCheckPayment={handleCheckPayment}
          onJoinCall={joinVideoCall}
          onBack={() => {
            if (paymentPhase !== "qr") return;
            setStep("booking");
          }}
        />
      </BookingModalShell>
    );
  }

  return (
    <BookingModalShell open={open} onClose={onClose} width={920}>
      <div className="flex max-h-[min(90vh,720px)] flex-col overflow-hidden bg-[#f5f4f2] md:flex-row">
        {/* Left: mentor + calendar + times */}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto border-black/5 p-5 md:border-r md:p-6">
          <div className="flex items-start gap-3">
            {mentor.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={mentor.avatarUrl}
                alt={`${mentor.name} avatar`}
                className="size-14 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div
                className="grid size-14 shrink-0 place-items-center rounded-full text-lg font-semibold text-[#CC553B]"
                style={{ backgroundColor: "#fff1f0" }}
                aria-hidden="true"
              >
                {mentor.name.slice(0, 1)}
              </div>
            )}
            <div className="min-w-0">
              <div className="text-base font-semibold text-slate-900">{mentor.name}</div>
              <div className="text-sm text-slate-500">{mentor.title}</div>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                <span className="inline-flex items-center gap-1">
                  <StarFilled className="text-amber-400" />
                  <span className="font-medium text-slate-900">{mentor.rating}</span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <TeamOutlined />
                  {mentor.meetings} уулзалт
                </span>
                <span className="inline-flex items-center gap-1">
                  <ClockCircleOutlined />
                  {mentor.years} жил
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-white p-4 ring-1 ring-black/5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-900">
                {viewYear} оны {MONTHS_MN[viewMonth]}
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => goMonth(-1)}
                  className="grid size-8 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100"
                  aria-label="Өмнөх сар"
                >
                  <LeftOutlined className="text-xs" />
                </button>
                <button
                  type="button"
                  onClick={() => goMonth(1)}
                  className="grid size-8 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100"
                  aria-label="Дараагийн сар"
                >
                  <RightOutlined className="text-xs" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-slate-400">
              {WEEKDAYS_MN.map((d) => (
                <div key={d} className="py-1">
                  {d}
                </div>
              ))}
            </div>

            <div className="mt-1 grid grid-cols-7 gap-1">
              {calendarDays.map((day, i) => {
                if (day === null) {
                  return <div key={`empty-${i}`} className="aspect-square" />;
                }

                const date = new Date(viewYear, viewMonth, day);
                const isPast =
                  date <
                  new Date(today.getFullYear(), today.getMonth(), today.getDate());
                const isSelected = isSameDay(date, selectedDate);
                const hasSlots = !isPast && hashAvailable(day, viewMonth);

                return (
                  <button
                    key={day}
                    type="button"
                    disabled={isPast}
                    onClick={() => selectDay(day)}
                    className={`relative flex aspect-square flex-col items-center justify-center rounded-full text-sm transition ${
                      isSelected
                        ? "bg-slate-900 font-medium text-white"
                        : isPast
                          ? "cursor-not-allowed text-slate-300"
                          : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {day}
                    {hasSlots && !isSelected && (
                      <span className="absolute bottom-1 size-1 rounded-full bg-[#CC553B]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5">
            <p className="text-sm font-semibold text-slate-900">Сул цаг</p>
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {TIME_SLOTS.map((time) => {
                const disabled = disabledTimesForDay.has(time);
                const isSelected = selectedTime === time;
                return (
                  <button
                    key={time}
                    type="button"
                    disabled={disabled}
                    onClick={() => setSelectedTime(time)}
                    className={`rounded-xl border px-2 py-2.5 text-sm font-medium transition ${
                      disabled
                        ? "cursor-not-allowed border-transparent bg-transparent text-slate-300"
                        : isSelected
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-black/10 bg-white text-slate-700 hover:border-black/20"
                    }`}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: confirmation */}
        <div className="flex w-full shrink-0 flex-col bg-white md:w-[380px]">
          <div className="flex items-start justify-between border-b border-black/5 px-5 py-4 md:px-6">
            <h3 className="pr-4 text-base font-semibold leading-snug text-slate-900">
              Захиалгаа баталгаажуулна уу
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="grid size-8 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Хаах"
            >
              <CloseOutlined />
            </button>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 py-4 md:px-6">
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Огноо</dt>
                <dd className="font-medium text-slate-900">
                  {formatDateDisplay(selectedDate)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Цаг</dt>
                <dd className="font-medium text-slate-900">{selectedTime}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Үргэлжлэх хугацаа</dt>
                <dd className="mt-2 flex gap-2">
                  {DURATIONS.map((d) => (
                    <button
                      key={d.minutes}
                      type="button"
                      onClick={() => setDurationMinutes(d.minutes)}
                      className={`flex-1 rounded-full px-2 py-2 text-xs font-medium transition sm:text-sm ${
                        durationMinutes === d.minutes
                          ? "bg-slate-900 text-white"
                          : "bg-[#f5f4f2] text-slate-700 ring-1 ring-black/5 hover:ring-black/15"
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </dd>
              </div>
            </dl>

            <div className="mt-5">
              <label
                htmlFor="booking-notes"
                className="text-sm font-medium text-slate-900"
              >
                Уулзалтын тэмдэглэл
              </label>
              <textarea
                id="booking-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="mt-2 w-full resize-none rounded-xl border border-black/10 bg-[#fafaf9] px-3 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10"
                placeholder="Уулзалтаас өмнө гишүүнтэй хуваалцах зүйлээ бичнэ үү..."
              />
            </div>

            <div className="mt-6">
              <p className="text-sm text-slate-500">Нийт</p>
              <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                {formatPrice(totalPrice)}
              </p>
              <p className="mt-1 text-xs text-slate-500">Платформын төлбөр багтсан</p>
            </div>
          </div>

          <div className="border-t border-black/5 px-5 py-4 md:px-6">
            <button
              type="button"
              onClick={() => setStep("payment")}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#CC553B] py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#B64A33]"
            >
              Төлбөр төлөх
              <ArrowRightOutlined />
            </button>
            <p className="mt-3 text-center text-xs text-slate-500">
              Уулзалтаас 12 цагийн өмнө үнэгүй өөрчилж болно
            </p>
          </div>
        </div>
      </div>
    </BookingModalShell>
  );
}
