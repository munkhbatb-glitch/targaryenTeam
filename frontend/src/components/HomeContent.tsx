"use client";

import {
  AppstoreOutlined,
  ArrowRightOutlined,
  BarChartOutlined,
  BgColorsOutlined,
  CodeOutlined,
  CreditCardOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  FacebookOutlined,
  InstagramOutlined,
  ClockCircleOutlined,
  MailOutlined,
  PhoneOutlined,
  PlayCircleOutlined,
  RocketOutlined,
  RobotOutlined,
  SearchOutlined,
  StarFilled,
  StarOutlined,
  TeamOutlined,
  VideoCameraOutlined,
  YoutubeOutlined,
} from "@ant-design/icons";
import type { ReactNode } from "react";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Avatar, Button } from "antd";
import MentorBookingModal, {
  type MentorForBooking,
} from "@/components/MentorBookingModal";
import { getApiBase } from "@/lib/backend";

const CALL_MENTOR_KEY = "activeCallMentor";

export default function HomeContent() {
  const router = useRouter();
  const [bookingMentor, setBookingMentor] = useState<MentorForBooking | null>(
    null,
  );
  const stats = [
    { label: "Онлайн уулзалт", value: "50K+" },
    { label: "Бодит сэтгэгдэл", value: "50K+" },
    { label: "Мэргэжилтэн", value: "120" },
    { label: "Нийт дүн", value: "1.5B" },
    { label: "Дахин ашигласан хэрэглэгч", value: "50k" },
  ];

  const categories: {
    title: string;
    count: string;
    icon: ReactNode;
  }[] = [
    { title: "UI/UX Design", count: "340+", icon: <BgColorsOutlined /> },
    { title: "Front-end Dev", count: "520+", icon: <CodeOutlined /> },
    { title: "Product Management", count: "280+", icon: <AppstoreOutlined /> },
    { title: "Startup & Growth", count: "190+", icon: <RocketOutlined /> },
    { title: "Marketing", count: "410+", icon: <BarChartOutlined /> },
    { title: "Finance", count: "230+", icon: <DollarOutlined /> },
    { title: "Data / AI", count: "370+", icon: <RobotOutlined /> },
    { title: "YouTube & Content", count: "160+", icon: <PlayCircleOutlined /> },
  ];

  const goalSteps = [
    "Туршлагын түвшин",
    "Юунд тусламж хэрэгтэй вэ?",
    "Сонирхож буй чиглэл",
    "Уулзалтын төрөл",
    "Төсвийн хязгаар",
  ];

  const mentors: MentorForBooking[] = [
    {
      name: "Ч.Анар",
      title: "УИХ-н гишүүн, And Global Founder",
      avatarUrl: "/Anar.png",
      price: "500,000 ₮",
      pricePerSession: 45000,
      rating: 3.9,
      reviews: 128,
      meetings: 412,
      years: 25,
      tags: ["Startup Business", "Технологийг давуу тал болгох"],
    },
    {
      name: "Nomad Amaraa",
      title: "Digital Nomad, Freelancer",
      avatarUrl: "/nomad.png",
      price: "350,000 ₮",
      pricePerSession: 60000,
      rating: 4.8,
      reviews: 94,
      meetings: 318,
      years: 15,
      tags: ["Гадны зах зээл", "Remote Working", "Software Architect"],
    },
    {
      name: "Gremix",
      title: "Content Creator, Streamer",
      avatarUrl: "/gremix.png",
      price: "350,000 ₮",
      pricePerSession: 70000,
      rating: 5,
      reviews: 52,
      meetings: 412,
      years: 12,
      tags: ["Content","Дуу зохиох"],
    },
    {
      name: "Д.Баатар",
      title: "Senior Software Developer",
      avatarUrl: "/Baatar.png",
      price: "₮300,000",
      pricePerSession: 55000,
      rating: 4.7,
      reviews: 63,
      meetings: 400,
      years: 15,
      tags: ["Архитект", "GOOGLE-н туршлага", "Cross-Functional баг бүрдүүлэх"],
    },
    {
      name: "Г.Аюурзана",
      title: "МУСГЗ, Зохиолч",
      avatarUrl: "/Ayur.png",
      price: "₮400,000",
      pricePerSession: 70000,
      rating: 4.8,
      reviews: 52,
      meetings: 198,
      years: 15,
      tags: ["Мэдрэмжээ илэрхийлэх", "Тэмдэглэл хөтлөх"],
    },
    {
      name: "У. Гүндсамбуу",
      email: "gundsambuu@blueprint.mn",
      title: "Software Engineer, Product Designer",
      company: "BluePrint",
      avatarUrl: "/Picture.png",
      price: "₮50,000",
      pricePerSession: 45000,
      rating: 4.9,
      reviews: 128,
      meetings: 412,
      years: 12,
      tags: ["Гадны зах зээл", "Remote Working", "Software Architect"],
    },
  ];

  const steps: {
    number: string;
    title: string;
    desc: string;
    icon: ReactNode;
    stats: { value: string; label: string }[];
  }[] = [
    {
      number: "01",
      title: "Гишүүн олох",
      desc: "AI-д асуулт тавь эсвэл 5,000+ гишүүнээс хайж тохирохыг ол. Ур чадвар, үнэ, цаг зэргийг шүүж болно.",
      icon: <SearchOutlined />,
      stats: [
        { value: "96%", label: "AI Match" },
        { value: "342", label: "Available now" },
      ],
    },
    {
      number: "02",
      title: "Төлбөр төлж захиалах",
      desc: "Calendar дээрээс цаг сонгоод Visa, Apple Pay эсвэл Google Pay-ээр аюулгүй төлбөр төл.",
      icon: <CreditCardOutlined />,
      stats: [
        { value: "256-bit", label: "Secure" },
        { value: "confirm", label: "Instant" },
      ],
    },
    {
      number: "03",
      title: "Уулзалтаа эхлэх",
      desc: "HD чанартай видео уулзалтаар гишүүнээсээ шууд зөвлөгөө ав. Автоматаар бичлэг хадгалагдана.",
      icon: <VideoCameraOutlined />,
      stats: [
        { value: "1080p", label: "HD Quality" },
        { value: "auto", label: "Recorded" },
      ],
    },
  ];

  const faqs = [
    {
      q: "Гишүүнтэй уулзалт хэр удаан үргэлжилдэг вэ?",
      a: "Ихэнх уулзалт 45–60 минут байна. Зарим гишүүн 30 минутын хурдан зөвлөгөө санал болгодог.",
    },
    {
      q: "Төлбөр хэрхэн төлөх вэ?",
      a: "Карт/дансаар төлнө. Төлбөр баталгаажсаны дараа уулзалтын линк автоматаар илгээгдэнэ.",
    },
    {
      q: "Уулзалтаа цуцалж болох уу?",
      a: "Уулзалтаас 24 цагийн өмнө цуцалбал бүрэн буцаалт хийгдэнэ. 24 цагийн дотор хэсэгчилсэн нөхцөл үйлчилнэ.",
    },
    {
      q: "Ямар төрлийн зөвлөгөө авч болох вэ?",
      a: "CV/portfolio, interview prep, roadmap, career change, management, growth strategy.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#fbfaf8] text-slate-900">
      <MentorBookingModal
        mentor={bookingMentor}
        open={bookingMentor !== null}
        onClose={() => setBookingMentor(null)}
        onBookingComplete={(m) => {
          const roomId = `call-${Date.now()}`;
          sessionStorage.setItem(CALL_MENTOR_KEY, JSON.stringify(m));
          sessionStorage.setItem("activeCallRoom", roomId);
          if (m.email?.trim()) {
            fetch(`${getApiBase()}/api/invite`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: m.email.trim(),
                roomId,
                hostName: "Захиалагч",
              }),
            }).catch(() => {});
          }
          router.push(`/call/?room=${encodeURIComponent(roomId)}`);
        }}
      />
      <div className="sticky top-0 z-30 border-b border-black/5 bg-[#fbfaf8]/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2">
            <Image
              src="/NEXORA.png"
              alt="NEXORA"
              width={130}
              height={40}
              className="h-auto w-[120px] md:w-[140px]"
              priority
            />
          </div>

          <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
            <a className="hover:text-slate-900" href="#angilal">
              Ангилал
            </a>
            <a className="hover:text-slate-900" href="#meregjiltnuud">
            Nexora’s онцлох гишүүд
            </a>
            <a className="hover:text-slate-900" href="#herhen-ajilladag">
              Хэрхэн ажилладаг
            </a>
            <a className="hover:text-slate-900" href="#">
            Судалгаа бөглөх
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Button className="hidden rounded-full md:inline-flex">Нэвтрэх</Button>
            <Button
              type="primary"
              className="rounded-full bg-[#CC553B] shadow-sm hover:!bg-[#B64A33]"
              icon={<ArrowRightOutlined />}
            >
              Эхлэх
            </Button>
          </div>
        </div>
      </div>

      <main>
        <section className="mx-auto w-full max-w-6xl px-5 pb-10 pt-10 md:pb-14 md:pt-14">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#fde2d2] px-4 py-2 text-sm font-medium text-[#3d2a24]">
                Networking  😎
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-[#fde2d2] px-4 py-2 text-sm font-medium text-[#3d2a24]">
                Khowledge  🧠
                </span>
              </div>
              <h1 className="text-balance text-3xl font-semibold leading-tight md:text-5xl">
                Туршлага дээр тулгуурлаж асуудлаа шийдье ✨
              </h1>
              <p className="mt-4 text-pretty text-base leading-relaxed text-slate-600 md:text-lg">
                Та өөр туршлагатай хүмүүсээс бодит 1‑on‑1 уулзалтад хийж,
                асуудлаа шийдвэрлээрэй.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button
                  type="primary"
                  size="large"
                  className="rounded-full bg-[#CC553B] shadow-sm hover:!bg-[#B64A33]"
                  icon={<ArrowRightOutlined />}
                >
                  Өөрийн мэдлэгээ оруулах
                </Button>
                <Button
                  size="large"
                  className="rounded-full border border-black/10 bg-white"
                  icon={<VideoCameraOutlined />}
                  onClick={() => {
                    document
                      .getElementById("meregjiltnuud")
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                >
                  Онлайн уулзалт хийх
                </Button>
              </div>

              <div className="mt-8 flex items-center gap-4">
                <div className="flex -space-x-3">
                  {["/Picture.png", "/gremix.png", "/Saruul.png"].map((src) => (
                    <Avatar
                      key={src}
                      size={40}
                      src={src}
                      style={{ border: "2px solid #fbfaf8" }}
                    />
                  ))}
                </div>
                <div className="text-sm text-slate-600">
                  <span className="font-semibold text-slate-900">2,400+</span>{" "}
                  хүмүүс мэдлэгээ хуваалцсан байна
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-6 -z-10 rounded-3xl bg-linear-to-br from-orange-100 via-rose-50 to-indigo-50 blur-2xl" />
              <div className="relative mx-auto h-[clamp(280px,38vw,450px)] w-full max-w-[450px]">
                <div className="pointer-events-none absolute -left-2 top-3 size-28 rounded-full bg-linear-to-br from-orange-200/70 to-rose-200/70 blur-2xl" />
                <div className="pointer-events-none absolute -bottom-2 right-0 size-28 rounded-full bg-linear-to-br from-indigo-200/60 to-cyan-200/60 blur-2xl" />

                <div className="absolute left-0 top-0 h-[clamp(190px,26vw,250px)] w-[48%] -rotate-[6deg]">
                  <div className="relative size-full overflow-hidden rounded-[22px] shadow-[0_18px_55px_rgba(0,0,0,0.16)] ring-1 ring-black/10">
                    <Image
                      src="/gremix.png"
                      alt="Gremix"
                      fill
                      sizes="(max-width: 768px) 45vw, 230px"
                      className="object-cover"
                      priority
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/60 to-transparent p-3">
                      <div className="text-xs font-semibold text-white">Gremix</div>
                      <div className="text-[11px] text-white/85">
                        Content Creator
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute right-0 top-9 h-[clamp(190px,26vw,250px)] w-[48%] rotate-[6deg]">
                  <div className="relative size-full overflow-hidden rounded-[22px] shadow-[0_18px_55px_rgba(0,0,0,0.16)] ring-1 ring-black/10">
                    <Image
                      src="/Saruul.png"
                      alt="Mentor"
                      fill
                      sizes="(max-width: 768px) 45vw, 230px"
                      className="object-cover"
                      priority
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/60 to-transparent p-3">
                      <div className="text-[11px] font-semibold text-white">
                        S Johnson
                      </div>
                      <div className="text-[10px] text-white/85">Web Developer</div>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-0 left-[16%] h-[clamp(220px,30vw,290px)] w-[60%] -rotate-[1deg]">
                  <div className="relative size-full overflow-hidden rounded-[26px] shadow-[0_22px_70px_rgba(0,0,0,0.18)] ring-1 ring-black/10">
                    <Image
                      src="/Picture.png"
                      alt="Mentor"
                      fill
                      sizes="(max-width: 768px) 60vw, 290px"
                      className="object-cover"
                      priority
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/60 to-transparent p-4">
                      <div className="text-xs font-semibold text-white">
                      У. Гүндсамбуу
                      </div>
                      <div className="text-[11px] text-white/85">Product Designer (9y)</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-8 border-t border-black/5 pt-10 md:mt-14 md:grid-cols-5 md:gap-6">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-xl font-semibold md:text-2xl">{s.value}</div>
                <div className="mt-1 text-xs text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section
          id="angilal"
          className="mx-auto w-full max-w-6xl scroll-mt-24 px-5 py-12 md:py-14"
        >
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#fde2d2] px-4 py-1.5 text-sm font-medium text-[#3d2a24]">
              <span className="size-2 rounded-full bg-[#CC553B]" />
              Сэдвээр харах
            </div>
            <h2 className="mt-5 text-balance text-3xl font-semibold text-slate-900 md:text-4xl">
              Бүх салбарт мэргэжилтэн
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base">
              Өөрийн карьерын зорилгод нийцсэн мэргэжилтнийг хайж ол
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((c) => (
              <div
                key={c.title}
                className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                  <span className="grid size-11 place-items-center rounded-xl bg-black text-lg text-white">
                    {c.icon}
                  </span>
                  <div className="mt-5 text-base font-semibold text-black">
                    {c.title}
                  </div>
                  <p className="mt-2 text-sm">
                    <span className="font-semibold text-[#e67e5f]">
                      {c.count}
                    </span>{" "}
                    <span className="text-slate-500">гишүүн</span>
                  </p>
                </div>
              ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-5 py-12 md:py-14">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#fde2d2] px-4 py-1.5 text-sm font-medium text-[#3d2a24]">
              <span className="size-2 rounded-full bg-[#CC553B]" />
              60 сэкундэд тохируулах
            </div>
            <h2 className="mt-5 text-balance text-3xl font-semibold text-slate-900 md:text-4xl">
            Зорилгоо хуваалцана уу
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base">
            Lorem ipsum dolor sit amet consectetur. Proin ut eu pretium risus interdum quis ac aliquet.
            </p>
          </div>

          <div className="mt-10 rounded-3xl border border-black/10 bg-white p-6 shadow-sm md:p-10 lg:p-12">
              <div className="grid gap-10 md:grid-cols-2 md:items-center lg:gap-14">
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-[#CC553B]">
                    <StarOutlined className="text-base" />
                    AI-аар тохируулсан гишүүд
                  </div>
                  <h3 className="mt-4 text-balance text-2xl font-semibold leading-snug text-black md:text-3xl">
                    5 богино асуултанд хариулаарай. Хамгийн төгс санал авна.
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-slate-600 md:text-base">
                    Таны карьерын зорилго, туршлага, ур чадвар болон сонирхолд
                    үндэслэн манай AI систем хамгийн тохирох гишүүнийг санал
                    болгоно.
                  </p>
                  <Button
                    type="primary"
                    size="large"
                    className="mt-6 h-12 rounded-full border-0 bg-[#CC553B] px-8 shadow-sm hover:!bg-[#B64A33]"
                    icon={<ArrowRightOutlined />}
                    iconPlacement="end"
                  >
                    Мэргэжилтэн олох
                  </Button>
                </div>

                <div className="flex flex-col gap-3 py-2 md:py-4">
                  {goalSteps.map((step, i) => (
                    <div
                      key={step}
                      className="w-fit max-w-full rounded-full bg-[#f5f5f5] px-5 py-3 text-sm font-medium text-slate-700"
                      style={{ marginLeft: `${i * 28}px` }}
                    >
                      {i + 1}. {step}
                    </div>
                  ))}
                </div>
              </div>
            </div>
        </section>

        <section
          id="meregjiltnuud"
          className="mx-auto w-full max-w-6xl scroll-mt-24 px-5 py-12 md:py-14"
        >
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#fde2d2] px-4 py-1.5 text-sm font-medium text-[#3d2a24]">
              <span className="size-2 rounded-full bg-[#CC553B]" />
              Санал болгох
            </div>
            <h2 className="mt-5 text-balance text-3xl font-semibold text-slate-900 md:text-4xl">
            Шилдэг гишүүд
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base">
            Verified, top-rated мэргэжилтнүүдтэй холбогд
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mentors.map((m, i) => (
              <div
                key={`${m.name}-${i}`}
                className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <Avatar
                    size={80}
                    src={m.avatarUrl ?? "/images/hero/expert.png"}
                    className="shrink-0"
                    style={{ borderRadius: 18 }}
                  />
                  <div className="min-w-0">
                    <div className="truncate text-base font-semibold text-slate-900">
                      {m.name}
                    </div>
                    <div className="mt-0.5 truncate text-sm text-slate-500">
                      {m.title}
                    </div>
                    {m.company ? (
                      <div className="mt-0.5 truncate text-sm text-slate-500">
                        {m.company}
                      </div>
                    ) : null}
                    {m.email ? (
                      <a
                        className="mt-1 inline-flex max-w-full items-center gap-2 truncate text-sm text-slate-500 hover:text-slate-900"
                        href={`mailto:${m.email}`}
                        title={m.email}
                      >
                        <MailOutlined className="shrink-0 text-slate-400" />
                        <span className="truncate">{m.email}</span>
                      </a>
                    ) : null}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <StarFilled className="text-yellow-400" />
                    <span className="font-medium text-slate-900">{m.rating}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TeamOutlined className="text-slate-400" />
                    <span>{m.meetings} уулзалт</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ClockCircleOutlined className="text-slate-400" />
                    <span>{m.years} жил</span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {m.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div className="mt-5 border-t border-dashed border-black/10 pt-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-base font-semibold text-slate-900">
                      {m.price}{" "}
                      <span className="text-sm font-medium text-slate-500">
                        /уулзалт
                      </span>
                    </div>
                    <Button
                      type="primary"
                      className="h-9 rounded-full !border-0 !bg-black px-5 text-sm font-medium !text-white hover:!bg-black/90 active:!bg-black"
                      onClick={() => setBookingMentor(m)}
                    >
                      Цаг товлох
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section
          id="herhen-ajilladag"
          className="mx-auto w-full max-w-6xl scroll-mt-24 px-5 py-12 md:py-14"
        >
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#fde2d2] px-4 py-1.5 text-sm font-medium text-[#3d2a24]">
              <span className="size-2 rounded-full bg-[#d6684a]" />
              Хэрхэн ашиглах вэ?
            </div>
            <h2 className="mt-5 text-balance text-3xl font-semibold text-slate-900 md:text-4xl">
              Гурван алхам жинхэнэ өсөлт
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base">
            Lorem ipsum dolor sit amet consectetur. Proin ut eu pretium risus interdum quis ac aliquet.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {steps.map((s) => (
              <div
                key={s.number}
                className="relative flex flex-col rounded-2xl border border-black/10 bg-white p-6 shadow-sm md:p-7"
              >
                  <div className="flex items-start justify-between gap-4">
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-black text-lg text-white">
                      {s.icon}
                    </span>
                    <span className="select-none text-5xl font-bold leading-none text-slate-100">
                      {s.number}
                    </span>
                  </div>

                  <h3 className="mt-6 text-lg font-semibold text-black">
                    {s.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                    {s.desc}
                  </p>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    {s.stats.map((stat) => (
                      <div
                        key={stat.label}
                        className="rounded-xl bg-[#f5f5f5] px-4 py-3"
                      >
                        <div className="text-base font-semibold text-black">
                          {stat.value}
                        </div>
                        <div className="mt-0.5 text-xs text-slate-500">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-5 pb-14">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#fde2d2] px-4 py-1.5 text-sm font-medium text-[#3d2a24]">
              <span className="size-2 rounded-full bg-[#CC553B]" />
              Түгээмэл асуулт хариулт
            </div>
            <h2 className="mt-5 text-balance text-3xl font-semibold text-slate-900 md:text-4xl">
              Хамгийм түгээмэл асуудаг асуултууд
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base">
              Хурдан ойлгомжтой хариултууд — танд хэрэгтэй мэдээллийг нэг дороос.
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-5xl">
            <div className="border-t border-black/10">
              {faqs.map((f) => (
                <div
                  key={f.q}
                  className="grid gap-4 border-b border-black/10 py-8 md:grid-cols-[1fr_1.35fr] md:gap-10"
                >
                  <div className="text-sm font-medium text-slate-900 md:text-base">
                    {f.q}
                  </div>
                  <div className="text-sm leading-relaxed text-slate-600 md:text-base">
                    {f.a}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-black/10 bg-white text-slate-900">
        <div className="mx-auto w-full max-w-6xl px-5 py-14">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2">
                <Image
                  src="/NEXORA.png"
                  alt="NEXORA"
                  width={150}
                  height={42}
                  className="h-auto w-[140px]"
                />
              </div>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-600">
                Карьерын зөвлөгөө, roadmap, interview prep — танд тохирох
                гишүүнтэй холбогдох хамгийн хурдан арга.
              </p>
              <div className="mt-5 flex gap-2">
                <a
                  href="#"
                  aria-label="Facebook"
                  className="grid size-9 place-items-center rounded-full bg-[#1877f2] text-white transition hover:opacity-90"
                >
                  <FacebookOutlined />
                </a>
                <a
                  href="#"
                  aria-label="Instagram"
                  className="grid size-9 place-items-center rounded-full bg-linear-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af] text-white transition hover:opacity-90"
                >
                  <InstagramOutlined />
                </a>
                <a
                  href="#"
                  aria-label="YouTube"
                  className="grid size-9 place-items-center rounded-full bg-[#ff0000] text-white transition hover:opacity-90"
                >
                  <YoutubeOutlined />
                </a>
              </div>
            </div>

            {[
              {
                title: "Платформ",
                links: ["Ангилал", "Nexora’s онцлох гишүүд", "Хэрхэн ажилладаг", "Мэргэжилтэн болох"],
              },
              {
                title: "Компан",
                links: ["Бидний тухай", "Гишүүн болох", "Мэдээ", "Холбоо"],
              },
              {
                title: "Тусламж",
                links: ["Тусламж төв", "Дүрэм", "Нууцлал", "Нөхцөл"],
              },
            ].map((c) => (
              <div key={c.title}>
                <div className="text-sm font-semibold text-slate-900">{c.title}</div>
                <ul className="mt-4 grid gap-2.5 text-sm text-slate-600">
                  {c.links.map((l) => (
                    <li key={l}>
                      <a className="transition hover:text-slate-900" href="#">
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div>
              <div className="text-sm font-semibold text-slate-900">Холбоо барих</div>
              <ul className="mt-4 grid gap-3 text-sm text-slate-600">
                <li className="flex gap-2.5">
                  <EnvironmentOutlined className="mt-0.5 shrink-0 text-slate-400" />
                  <span>Улаанбаатар хот, Сүхбаатар дүүрэг</span>
                </li>
                <li className="flex gap-2.5">
                  <PhoneOutlined className="mt-0.5 shrink-0 text-slate-400" />
                  <a className="transition hover:text-slate-900" href="tel:+97611123456">
                    (+976) 1112 - 3456
                  </a>
                </li>
                <li className="flex gap-2.5">
                  <MailOutlined className="mt-0.5 shrink-0 text-slate-400" />
                  <a
                    className="transition hover:text-slate-900"
                    href="mailto:info@mlearn.mn"
                  >
                    info@mlearn.mn
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-black/10 pt-6 text-sm text-slate-500">
            <span>© 2026 Nexora</span>
            <div className="flex flex-wrap gap-6">
              <a className="transition hover:text-slate-900" href="#">
                Нууцлалын гэрээ
              </a>
              <a className="transition hover:text-slate-900" href="#">
                Үйлчилгээний нөхцөл
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
