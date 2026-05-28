"use client";

import {
  AppstoreOutlined,
  ArrowRightOutlined,
  BarChartOutlined,
  BgColorsOutlined,
  CheckCircleFilled,
  CodeOutlined,
  CreditCardOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  FacebookOutlined,
  InstagramOutlined,
  MailOutlined,
  PhoneOutlined,
  PlayCircleOutlined,
  RocketOutlined,
  RobotOutlined,
  SearchOutlined,
  StarFilled,
  StarOutlined,
  VideoCameraOutlined,
  YoutubeOutlined,
} from "@ant-design/icons";
import type { ReactNode } from "react";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Avatar, Button, Collapse, Rate, Tag } from "antd";
import MentorBookingModal, {
  type MentorForBooking,
} from "@/components/MentorBookingModal";

const CALL_MENTOR_KEY = "activeCallMentor";

export default function HomeContent() {
  const router = useRouter();
  const [bookingMentor, setBookingMentor] = useState<MentorForBooking | null>(
    null,
  );
  const stats = [
    { label: "Ментор", value: "5K+" },
    { label: "Салбар", value: "100+" },
    { label: "Үнэлгээ", value: "4.8" },
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
      name: "Г. Саруул",
      title: "Product Designer · 7 жил",
      price: "₮45,000",
      pricePerSession: 45000,
      rating: 4.9,
      reviews: 128,
      meetings: 412,
      years: 7,
      tags: ["UX", "Portfolio", "Career"],
    },
    {
      name: "Б. Тэмүүлэн",
      title: "Software Engineer · 6 жил",
      price: "₮60,000",
      pricePerSession: 60000,
      rating: 4.8,
      reviews: 94,
      meetings: 318,
      years: 6,
      tags: ["React", "Interview", "System"],
    },
    {
      name: "Н. Энхжин",
      title: "Growth Marketer · 5 жил",
      price: "₮50,000",
      pricePerSession: 50000,
      rating: 4.9,
      reviews: 71,
      meetings: 256,
      years: 5,
      tags: ["Ads", "Analytics", "Funnel"],
    },
    {
      name: "Д. Бат-Оргил",
      title: "Sales Lead · 8 жил",
      price: "₮55,000",
      pricePerSession: 55000,
      rating: 4.7,
      reviews: 63,
      meetings: 289,
      years: 8,
      tags: ["CRM", "Pitch", "Negotiation"],
    },
    {
      name: "Ц. Мөнх-Эрдэнэ",
      title: "Finance Manager · 9 жил",
      price: "₮70,000",
      pricePerSession: 70000,
      rating: 4.8,
      reviews: 52,
      meetings: 198,
      years: 9,
      tags: ["Budget", "KPI", "Reporting"],
    },
    {
      name: "О. Номин",
      title: "HRBP · 6 жил",
      price: "₮48,000",
      pricePerSession: 48000,
      rating: 4.9,
      reviews: 86,
      meetings: 334,
      years: 6,
      tags: ["CV", "Hiring", "Culture"],
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
      title: "Mentor олох",
      desc: "AI-д асуулт тавь эсвэл 5,000+ mentor-аас хайж тохирохыг ол. Ур чадвар, үнэ, цаг зэргийг шүүж болно.",
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
      desc: "HD чанартай видео уулзалтаар ментороосоо шууд зөвлөгөө ав. Автоматаар бичлэг хадгалагдана.",
      icon: <VideoCameraOutlined />,
      stats: [
        { value: "1080p", label: "HD Quality" },
        { value: "auto", label: "Recorded" },
      ],
    },
  ];

  const faqs = [
    {
      q: "Ментортой уулзалт хэр удаан үргэлжилдэг вэ?",
      a: "Ихэнх уулзалт 45–60 минут байна. Зарим ментор 30 минутын хурдан зөвлөгөө санал болгодог.",
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
      a: "CV/портфолио, interview prep, roadmap, карьер шилжилт, баг/менежмент, өсөлтийн стратеги зэрэг.",
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
          router.push(`/call/?room=${encodeURIComponent(roomId)}`);
        }}
      />
      <div className="sticky top-0 z-30 border-b border-black/5 bg-[#fbfaf8]/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-linear-to-br from-orange-500 to-rose-500 text-white shadow-sm">
              <PlayCircleOutlined />
            </span>
            <div className="leading-tight">
              <div className="text-sm font-semibold">Видео</div>
              <div className="text-[12px] text-slate-500">Карьер менторшип</div>
            </div>
          </div>

          <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
            <a className="hover:text-slate-900" href="#angilal">
              Ангилал
            </a>
            <a className="hover:text-slate-900" href="#meregjiltnuud">
              Мэрэгжилтнүүд
            </a>
            <a className="hover:text-slate-900" href="#herhen-ajilladag">
              Хэрхэн ажилладаг
            </a>
            <a className="hover:text-slate-900" href="#">
            Мэргэжилтэн болох
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Button className="hidden rounded-full md:inline-flex">Нэвтрэх</Button>
            <Button
              type="primary"
              className="rounded-full bg-[#ff4d2d] shadow-sm hover:!bg-[#ff3b18]"
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
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <Tag color="orange" className="rounded-full">
                  Шинэ
                </Tag>
                <span className="text-sm text-slate-600">
                  Хамгийн зөв ментортойгоо холбогдоорой
                </span>
              </div>
              <h1 className="text-balance text-3xl font-semibold leading-tight md:text-5xl">
                Карьераа өсгөх хамгийн зөв менторшип
              </h1>
              <p className="mt-4 text-pretty text-base leading-relaxed text-slate-600 md:text-lg">
                Таны зорилгод тохирсон менторыг ол. CV/портфолио, interview prep,
                roadmap, чиглэл сонголт гээд бодитоор ахиулна.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button
                  type="primary"
                  size="large"
                  className="rounded-full bg-[#ff4d2d] shadow-sm hover:!bg-[#ff3b18]"
                  icon={<ArrowRightOutlined />}
                >
                  Ментор хайх
                </Button>
                <Button
                  size="large"
                  className="rounded-full border border-black/10 bg-white"
                  icon={<SearchOutlined />}
                >
                  Демо үзэх
                </Button>
              </div>

              <div className="mt-6 flex flex-wrap gap-6 text-sm text-slate-600">
                {["Шуурхай уулзалт", "Verified менторууд", "Тодорхой roadmap"].map(
                  (t) => (
                    <div key={t} className="flex items-center gap-2">
                      <CheckCircleFilled className="text-emerald-600" />
                      {t}
                    </div>
                  ),
                )}
              </div>

              <div className="mt-8 flex items-center gap-6">
                {stats.map((s) => (
                  <div key={s.label} className="min-w-0">
                    <div className="text-xl font-semibold md:text-2xl">
                      {s.value}
                    </div>
                    <div className="text-[12px] text-slate-500">{s.label}</div>
                  </div>
                ))}
                <div className="ml-auto hidden items-center gap-2 text-sm text-slate-600 md:flex">
                  <StarFilled className="text-amber-500" />
                  <span className="font-medium text-slate-900">4.8</span>
                  <span className="text-slate-500">Дундаж үнэлгээ</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-6 -z-10 rounded-3xl bg-linear-to-br from-orange-100 via-rose-50 to-indigo-50 blur-2xl" />
              <div className="relative mx-auto aspect-[4/3] w-full max-w-[460px]">
                <div className="pointer-events-none absolute -left-2 top-3 size-28 rounded-full bg-linear-to-br from-orange-200/70 to-rose-200/70 blur-2xl" />
                <div className="pointer-events-none absolute -bottom-2 right-0 size-28 rounded-full bg-linear-to-br from-indigo-200/60 to-cyan-200/60 blur-2xl" />

                <div className="absolute left-0 top-0 w-[58%] -rotate-[9deg]">
                  <div className="relative overflow-hidden rounded-[26px] shadow-[0_20px_60px_rgba(0,0,0,0.18)] ring-1 ring-black/10">
                    <Image
                      src="/images/hero/expert.png"
                      alt="Expert"
                      width={640}
                      height={720}
                      className="h-auto w-full"
                      priority
                    />
                  </div>
                </div>

                <div className="absolute bottom-0 right-0 w-[66%] rotate-[7deg]">
                  <div className="relative overflow-hidden rounded-[28px] shadow-[0_22px_70px_rgba(0,0,0,0.18)] ring-1 ring-black/10">
                    <Image
                      src="/images/hero/learner.png"
                      alt="Learner"
                      width={740}
                      height={760}
                      className="h-auto w-full"
                      priority
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="angilal"
          className="mx-auto w-full max-w-6xl scroll-mt-24 px-5 py-12 md:py-14"
        >
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#fde2d2] px-4 py-1.5 text-sm font-medium text-[#3d2a24]">
              <span className="size-2 rounded-full bg-[#d6684a]" />
              Салбараар харах
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
                    <span className="text-slate-500">mentor</span>
                  </p>
                </div>
              ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-5 py-12 md:py-14">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#fde2d2] px-4 py-1.5 text-sm font-medium text-[#3d2a24]">
              <span className="size-2 rounded-full bg-[#d6684a]" />
              60 секундэд тохируулах
            </div>
            <h2 className="mt-5 text-balance text-3xl font-semibold text-slate-900 md:text-4xl">
              Зорилгоо хуваалцана уу
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base">
              Таны карьерын зорилго, туршлага, ур чадвар болон сонирхолд
              үндэслэн хамгийн тохирох менторыг олно.
            </p>
          </div>

          <div className="mt-10 rounded-3xl border border-black/10 bg-white p-6 shadow-sm md:p-10 lg:p-12">
              <div className="grid gap-10 md:grid-cols-2 md:items-center lg:gap-14">
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-[#d6684a]">
                    <StarOutlined className="text-base" />
                    AI-аар тохируулсан менторууд
                  </div>
                  <h3 className="mt-4 text-balance text-2xl font-semibold leading-snug text-black md:text-3xl">
                    5 богино асуултанд хариулаарай. Хамгийн төгс санал авна.
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-slate-600 md:text-base">
                    Таны карьерын зорилго, туршлага, ур чадвар болон сонирхолд
                    үндэслэн манай AI систем хамгийн тохирох менторыг санал
                    болгоно.
                  </p>
                  <Button
                    type="primary"
                    size="large"
                    className="mt-6 h-12 rounded-full border-0 bg-[#d6684a] px-8 shadow-sm hover:!bg-[#c45a3f]"
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
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[#ff4d2d]">Шилдэг менторууд</p>
              <h2 className="mt-2 text-2xl font-semibold md:text-3xl">
                Танд тохирох менторыг сонго
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-600 md:text-base">
                Туршлагатай менторууд — карьер, ур чадвар, interview, өсөлтөд
                чиглэсэн зөвлөгөө.
              </p>
            </div>
            <Button className="rounded-full">Бүгдийг харах</Button>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mentors.map((m) => (
              <div
                key={m.name}
                className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar
                      size={44}
                      style={{
                        backgroundColor: "#fff1f0",
                        color: "#ff4d2d",
                        fontWeight: 600,
                      }}
                    >
                      {m.name.slice(0, 1)}
                    </Avatar>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">{m.name}</div>
                      <div className="truncate text-xs text-slate-500">{m.title}</div>
                    </div>
                  </div>
                  <div className="shrink-0 text-sm font-semibold text-slate-900">
                    {m.price}
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2 text-sm">
                  <Rate disabled allowHalf defaultValue={m.rating} />
                  <span className="font-medium text-slate-900">{m.rating}</span>
                  <span className="text-slate-500">({m.reviews})</span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {m.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-[#fbfaf8] px-3 py-1 text-xs text-slate-700 ring-1 ring-black/5"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div className="mt-5 grid gap-2">
                  <Button
                    type="primary"
                    className="rounded-xl bg-[#ff4d2d] shadow-sm hover:!bg-[#ff3b18]"
                    icon={<ArrowRightOutlined />}
                    block
                    onClick={() => setBookingMentor(m)}
                  >
                    Уулзалт товлох
                  </Button>
                  <Button className="rounded-xl" block>
                    Профайл үзэх
                  </Button>
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
              Ментор олох, захиалах, уулзалтаа эхлэх — бүгдийг хэдхэн алхмаар
              хий.
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
            <p className="text-sm font-medium text-[#ff4d2d]">
              Хамгийн түгээмэл асуултууд
            </p>
            <h2 className="mt-2 text-2xl font-semibold md:text-3xl">
              Асуулт асуух уу?
            </h2>
          </div>

          <div className="mx-auto mt-8 max-w-3xl">
            <Collapse
              bordered={false}
              className="bg-transparent"
              items={faqs.map((f) => ({
                key: f.q,
                label: <span className="font-medium">{f.q}</span>,
                children: <p className="text-sm text-slate-600">{f.a}</p>,
                className:
                  "mb-3 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm",
              }))}
            />
          </div>
        </section>
      </main>

      <footer className="bg-black text-white">
        <div className="mx-auto w-full max-w-6xl px-5 py-14">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2">
                <span className="grid size-9 place-items-center rounded-xl bg-linear-to-br from-orange-500 to-rose-500 text-white shadow-sm">
                  <PlayCircleOutlined />
                </span>
                <span className="text-lg font-semibold">Видео</span>
              </div>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
                Карьерын зөвлөгөө, roadmap, interview prep — танд тохирох
                ментортой холбогдох хамгийн хурдан арга.
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
                links: ["Мэрэгжилтнүүд", "Ангилал", "Хэрхэн ажилладаг", "Мэргэжилтэн болох"],
              },
              {
                title: "Компан",
                links: ["Бидний тухай", "Ментор болох", "Мэдээ", "Холбоо"],
              },
              {
                title: "Тусламж",
                links: ["Тусламж төв", "Дүрэм", "Нууцлал", "Нөхцөл"],
              },
            ].map((c) => (
              <div key={c.title}>
                <div className="text-sm font-semibold text-white">{c.title}</div>
                <ul className="mt-4 grid gap-2.5 text-sm text-white/55">
                  {c.links.map((l) => (
                    <li key={l}>
                      <a className="transition hover:text-white" href="#">
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div>
              <div className="text-sm font-semibold text-white">Холбоо барих</div>
              <ul className="mt-4 grid gap-3 text-sm text-white/55">
                <li className="flex gap-2.5">
                  <EnvironmentOutlined className="mt-0.5 shrink-0 text-white/70" />
                  <span>Улаанбаатар хот, Сүхбаатар дүүрэг</span>
                </li>
                <li className="flex gap-2.5">
                  <PhoneOutlined className="mt-0.5 shrink-0 text-white/70" />
                  <a className="transition hover:text-white" href="tel:+97611123456">
                    (+976) 1112 - 3456
                  </a>
                </li>
                <li className="flex gap-2.5">
                  <MailOutlined className="mt-0.5 shrink-0 text-white/70" />
                  <a
                    className="transition hover:text-white"
                    href="mailto:info@mlearn.mn"
                  >
                    info@mlearn.mn
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 text-sm text-white/45">
            <span>© 2026 Video</span>
            <div className="flex flex-wrap gap-6">
              <a className="transition hover:text-white" href="#">
                Нууцлалын гэрээ
              </a>
              <a className="transition hover:text-white" href="#">
                Үйлчилгээний нөхцөл
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
