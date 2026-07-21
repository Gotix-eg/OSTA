"use client";

import Link from "next/link";
import {
  Lock,
  Eye,
  Gem,
  Trophy,
  Target,
  Compass,
  type LucideIcon,
} from "lucide-react";
import type { Locale } from "@/lib/locales";

type Copy = {
  heroTitle: string;
  heroSub: string;
  missionTitle: string;
  missionDesc: string;
  visionTitle: string;
  visionDesc: string;
  foundationTitle: string;
  foundationSub: string;
  values: { title: string; desc: string; Icon: LucideIcon }[];
  joinTitle: string;
  joinCta: string;
};

const copy: Record<"ar" | "en", Copy> = {
  ar: {
    heroTitle: "نعيد تعريف الحرفة في العصر الرقمي",
    heroSub: "أُسطفاي تربط أكثر الحرفيين مهارةً والخبراء التقنيين بالأفراد والشركات التي لا تقبل إلا التميز",

    missionTitle: "رسالتنا",
    missionDesc: "تمكين الحرفيين المتميزين من خلال منصة تُقدّر الجودة على الكمية، تضمن أن كل خدمة تُقدَّم هي شهادة على النزاهة المهنية والتميز التقني.",
    visionTitle: "رؤيتنا",
    visionDesc: "أن نصبح المعيار العالمي للعمالة الماهرة عند الطلب، نخلق عالماً حيث الحرفة المتميزة متاحة بنقرة واحدة، نبني الثقة والنمو الصناعي.",

    foundationTitle: "القيم الأساسية",
    foundationSub: "مبادئ تشغيلنا مصاغة من واقع الورشة ودقة المختبر",
    values: [
      { title: "الأمان", desc: "معايير صارمة في السلامة الجسدية وحماية البيانات الرقمية في كل تفاعل.", Icon: Lock },
      { title: "الشفافية", desc: "أسعار واضحة، تتبع فوري، وتقييمات حقيقية. نُزيل التخمين من التوظيف.", Icon: Eye },
      { title: "الجودة", desc: "لا نصلح المشكلات فحسب؛ نوفر حلولاً متينة تصمد أمام اختبار الزمن.", Icon: Gem },
      { title: "التميز", desc: "التزام بالتدريب التقني المستمر وأحدث المنهجيات الصناعية.", Icon: Trophy },
    ],

    joinTitle: "أنضم لأُسطفاي",
    joinCta: "يلا بينا !!",
  },
  en: {
    heroTitle: "REDEFINING CRAFTSMANSHIP FOR THE DIGITAL AGE",
    heroSub: "Ostafy connects the world's most skilled artisans and technical experts with individuals and businesses that demand nothing but excellence.",

    missionTitle: "OUR MISSION",
    missionDesc: "To empower master craftsmen by providing a platform that values quality over quantity, ensuring every service rendered is a testament to professional integrity and technical excellence.",
    visionTitle: "OUR VISION",
    visionDesc: "To become the global standard for on-demand skilled labor, creating a world where premium craftsmanship is accessible with a single tap, fostering trust and industrial growth.",

    foundationTitle: "THE FOUNDATION",
    foundationSub: "Our operating principles are forged in the reality of the workshop and the precision of the laboratory.",
    values: [
      { title: "SAFETY", desc: "Uncompromising standards in physical safety and digital data protection for every interaction.", Icon: Lock },
      { title: "TRANSPARENCY", desc: "Clear pricing, real-time tracking, and honest reviews. We eliminate the guesswork from hiring.", Icon: Eye },
      { title: "QUALITY", desc: "We don't just fix problems; we provide durable solutions that stand the test of time.", Icon: Gem },
      { title: "EXCELLENCE", desc: "A commitment to continuous technical training and the latest industrial methodologies.", Icon: Trophy },
    ],

    joinTitle: "JOIN OSTAFY",
    joinCta: "LET'S GO!!",
  },
};

export function AboutProfileCustom({ locale }: { locale: Locale }) {
  const isArabic = locale === "ar";
  const c = copy[locale] ?? copy.en;

  return (
    <div dir={isArabic ? "rtl" : "ltr"} className="min-h-screen bg-gold">
      {/* ── Hero Banner (Obsidian Card) ── */}
      <section className="mx-auto max-w-[1280px] px-4 pb-8 pt-6 md:px-12 md:py-12">
        <div className="relative overflow-hidden border border-white/10 bg-black p-6 text-start md:p-24 md:text-center">
          {/* Logo */}
          <div className="mb-6 flex justify-center">
            <img
              alt="OSTA Logo"
              className="h-12 md:h-16 w-auto object-contain"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBu1Cr2Qb5XunsgNS63dL1yEu4iHVLV6I3gwxqInM8Qta47OxMPmanPnMaXI4SZTFZ9dd-0mEKbHsea4YqRFxqIE2duNvIPoYz5BsUrqf7JDfyAa2YxISdPTRtHV_FiLJgTl1xPi1VjLTpfwMBV9I8USHf_6dTSqD3mfsO2wIhvkC4TU6ipJSOZaUi3B2soFz85UQDUGwK8hTIeEcpBCPtKvahUwI4bhwqX7vHaLypDKtuHfoAuTOIV-UsxJjXrx4QL9sU0ng_2hvU"
            />
          </div>

          {/* Title */}
          <h1 className="mx-auto mb-4 max-w-4xl text-4xl font-black uppercase leading-tight tracking-tight md:mb-6 md:text-6xl">
            <span className="inline-block bg-gold px-4 py-2 text-ink">
              {c.heroTitle}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto max-w-2xl text-sm font-semibold leading-7 text-white md:text-lg">
            {c.heroSub}
          </p>
        </div>
      </section>

      {/* ── Mission & Vision (White Cards) ── */}
      <section id="our-mission" className="mx-auto max-w-[1280px] px-4 py-8 md:px-12 md:py-12 scroll-mt-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mission */}
          <div className="border border-black/10 bg-white p-6 md:p-12">
            <Target size={40} className="mb-6 text-ink" strokeWidth={1.5} />
            <h3 className="font-black text-ink uppercase text-2xl md:text-3xl mb-4">
              {c.missionTitle}
            </h3>
            <p className="text-ink/80 text-base leading-relaxed">
              {c.missionDesc}
            </p>
          </div>

          {/* Vision */}
          <div className="border border-black/10 bg-white p-6 md:p-12">
            <Compass size={40} className="mb-6 text-ink" strokeWidth={1.5} />
            <h3 className="font-black text-ink uppercase text-2xl md:text-3xl mb-4">
              {c.visionTitle}
            </h3>
            <p className="text-ink/80 text-base leading-relaxed">
              {c.visionDesc}
            </p>
          </div>
        </div>
      </section>

      {/* ── Core Values Grid ── */}
      <section className="mx-auto max-w-[1280px] px-4 py-8 md:px-12 md:py-12">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 md:mb-12 md:flex-row md:items-end">
          <div>
            <h2 className="mb-2 text-3xl font-black uppercase text-ink md:text-4xl">
              {c.foundationTitle}
            </h2>
            <p className="text-ink/80 text-base max-w-xl">{c.foundationSub}</p>
          </div>
          <div className="mb-2 h-1 w-24 bg-ink md:w-48" />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-4">
          {c.values.map((val, i) => {
            const { Icon } = val;
            return (
              <div
                key={i}
                className="border border-white/10 bg-black p-6 md:p-8"
              >
                {/* Icon box */}
                <div className="w-12 h-12 flex items-center justify-center mb-8 bg-gold">
                  <Icon
                    size={22}
                    strokeWidth={2}
                    className="text-black"
                  />
                </div>
                <h4 className="font-black text-white uppercase text-xl mb-3">
                  {val.title}
                </h4>
                <p className="text-white/60 text-sm leading-relaxed">
                  {val.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Join Ostafy (Photo Banner) ── */}
      <section className="mx-auto max-w-[1280px] px-4 pb-8 md:px-12 md:pb-12">
        <div className="grid grid-cols-1 overflow-hidden border border-white/10 bg-black md:grid-cols-2 md:h-[420px]">
          <div className="relative h-56 w-full overflow-hidden md:h-full">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAbfJ-2IS0360vqfuhA-1NqheG3brCUZN76EodMJBKF9vokisslyWi0g1RYa1pqwr0_MOFfrHqLJJDwj3228wWUnrA02sMvWtljZz34nlB9m-lPPKzi9OW3vEu7MFeoJLIwwivipO15TWmhDAjdkRYMHCDAyy6fYNcv6MbRjHrrdWErxNnDtkkgN5nR94neVSIhHYNfrmkUUhNIzrBXIdYsaC3zHiCQ35GBv_nPGbiEWpTnd7ULVnkTwOVpH-yyfmCAUcDgTzMPvOE"
              alt="Ostafy"
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
          </div>

          <div className="flex flex-col items-start justify-center gap-6 p-6 text-start md:p-12">
            <h2 className="text-3xl font-black uppercase text-white md:text-5xl">
              {c.joinTitle}
            </h2>
            <Link
              href={`/${locale}/register`}
              className="inline-block font-black uppercase text-lg px-10 py-4 bg-gold text-ink transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5"
            >
              {c.joinCta}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
