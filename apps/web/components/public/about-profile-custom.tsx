"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  GitBranch,
  BadgeCheck,
  Cpu,
  Rocket,
  Eye,
  type LucideIcon,
} from "lucide-react";
import type { Locale } from "@/lib/locales";

type Copy = {
  badge: string;
  heroTitle: string;
  heroSub: string;
  journeyBtn: string;
  joinBtn: string;
  statsTitle: string;
  stats: { value: string; label: string }[];
  missionTitle: string;
  missionDesc: string;
  visionTitle: string;
  visionDesc: string;
  foundationTitle: string;
  foundationSub: string;
  values: { title: string; desc: string; Icon: LucideIcon }[];
  ctaTitle: string;
  ctaBtn: string;
};

const copy: Record<"ar" | "en", Copy> = {
  ar: {
    badge: "تأسست 2024",
    heroTitle: "نعيد تعريف الحرفة في العصر الرقمي",
    heroSub: "أوستا تربط أكثر الحرفيين مهارةً والخبراء التقنيين بالأفراد والشركات التي لا تقبل إلا التميز.",
    journeyBtn: "رحلتنا",
    joinBtn: "انضم كمحترف",

    statsTitle: "أوستا بالأرقام",
    stats: [
      { value: "5K+", label: "محترف موثق" },
      { value: "12K+", label: "طلب منجز" },
      { value: "15+", label: "محافظة مغطاة" },
      { value: "98%", label: "نسبة الرضا" },
    ],

    missionTitle: "رسالتنا",
    missionDesc: "تمكين الحرفيين المتميزين من خلال منصة تُقدّر الجودة على الكمية، تضمن أن كل خدمة تُقدَّم هي شهادة على النزاهة المهنية والتميز التقني.",
    visionTitle: "رؤيتنا",
    visionDesc: "أن نصبح المعيار العالمي للعمالة الماهرة عند الطلب، نخلق عالماً حيث الحرفة المتميزة متاحة بنقرة واحدة، نبني الثقة والنمو الصناعي.",

    foundationTitle: "القيم الأساسية",
    foundationSub: "مبادئ تشغيلنا مصاغة من واقع الورشة ودقة المختبر.",
    values: [
      { title: "الأمان", desc: "معايير صارمة في السلامة الجسدية وحماية البيانات الرقمية في كل تفاعل.", Icon: ShieldCheck },
      { title: "الشفافية", desc: "أسعار واضحة، تتبع فوري، وتقييمات حقيقية. نُزيل التخمين من التوظيف.", Icon: GitBranch },
      { title: "الجودة", desc: "لا نصلح المشكلات فحسب؛ نوفر حلولاً متينة تصمد أمام اختبار الزمن.", Icon: BadgeCheck },
      { title: "التميز", desc: "التزام بالتدريب التقني المستمر وأحدث المنهجيات الصناعية.", Icon: Cpu },
    ],

    ctaTitle: "هل أنت مستعد للعمل؟",
    ctaBtn: "استأجر خبيراً الآن",
  },
  en: {
    badge: "ESTABLISHED 2024",
    heroTitle: "REDEFINING CRAFTSMANSHIP FOR THE DIGITAL AGE",
    heroSub: "Ostafy connects the world's most skilled artisans and technical experts with individuals and businesses that demand nothing but excellence.",
    journeyBtn: "OUR JOURNEY",
    joinBtn: "JOIN AS A PRO",

    statsTitle: "OSTAFY IN NUMBERS",
    stats: [
      { value: "5K+", label: "VERIFIED PROS" },
      { value: "12K+", label: "ORDERS COMPLETED" },
      { value: "15+", label: "PROVINCES COVERED" },
      { value: "98%", label: "SATISFACTION RATE" },
    ],

    missionTitle: "OUR MISSION",
    missionDesc: "To empower master craftsmen by providing a platform that values quality over quantity, ensuring every service rendered is a testament to professional integrity and technical excellence.",
    visionTitle: "OUR VISION",
    visionDesc: "To become the global standard for on-demand skilled labor, creating a world where premium craftsmanship is accessible with a single tap, fostering trust and industrial growth.",

    foundationTitle: "THE FOUNDATION",
    foundationSub: "Our operating principles are forged in the reality of the workshop and the precision of the laboratory.",
    values: [
      { title: "SAFETY", desc: "Uncompromising standards in physical safety and digital data protection for every interaction.", Icon: ShieldCheck },
      { title: "TRANSPARENCY", desc: "Clear pricing, real-time tracking, and honest reviews. We eliminate the guesswork from hiring.", Icon: GitBranch },
      { title: "QUALITY", desc: "We don't just fix problems; we provide durable solutions that stand the test of time.", Icon: BadgeCheck },
      { title: "EXCELLENCE", desc: "A commitment to continuous technical training and the latest industrial methodologies.", Icon: Cpu },
    ],

    ctaTitle: "READY TO WORK?",
    ctaBtn: "HIRE AN EXPERT NOW",
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
          {/* Badge */}
          <span className="mb-5 inline-block bg-gold px-3 py-1 text-[10px] font-black uppercase tracking-widest text-ink md:mb-6 md:px-4 md:text-xs">
            {c.badge}
          </span>

          {/* Title */}
          <h1 className="mx-auto mb-4 max-w-4xl text-4xl font-black uppercase leading-tight tracking-tight text-white md:mb-6 md:text-6xl">
            {c.heroTitle}
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mb-8 max-w-2xl text-sm font-semibold leading-7 text-white/70 md:mb-10 md:text-lg">
            {c.heroSub}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3 md:flex-row md:justify-center md:gap-4">
            <a
              href="#our-mission"
              className="font-black uppercase text-sm px-10 py-4 bg-white text-black shadow-[4px_4px_0px_rgba(255,255,255,0.25)] transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5"
            >
              {c.journeyBtn}
            </a>
            <Link
              href={`/${locale}/register/worker`}
              className="inline-block font-black uppercase text-sm px-10 py-4 border-2 border-white text-white hover:bg-white/10 transition-all duration-200"
            >
              {c.joinBtn}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats Block (Dark Band) ── */}
      <section className="w-full bg-ink py-8 md:py-16">
        <div className="max-w-[1280px] mx-auto px-4 md:px-12">
          <h2 className="mb-6 text-start text-2xl font-black uppercase text-white md:mb-12 md:text-4xl">
            {c.statsTitle}
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {c.stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="border-s-4 border-gold py-3 ps-4 md:py-4 md:ps-6"
              >
                <div className="mb-2 text-3xl font-black text-gold md:text-5xl">
                  {stat.value}
                </div>
                <div className="font-black text-xs uppercase text-white/60 tracking-widest">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mission & Vision (White Cards) ── */}
      <section id="our-mission" className="mx-auto max-w-[1280px] px-4 py-8 md:px-12 md:py-12 scroll-mt-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mission */}
          <div className="border-4 border-black bg-white p-6 shadow-[4px_4px_0px_#000000] md:p-12">
            <Rocket size={40} className="mb-6 text-ink" strokeWidth={1.5} />
            <h3 className="font-black text-ink uppercase text-2xl md:text-3xl mb-4">
              {c.missionTitle}
            </h3>
            <p className="text-ink/80 text-base leading-relaxed">
              {c.missionDesc}
            </p>
          </div>

          {/* Vision */}
          <div className="border-4 border-black bg-white p-6 shadow-[4px_4px_0px_#000000] md:p-12">
            <Eye size={40} className="mb-6 text-ink" strokeWidth={1.5} />
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
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="group cursor-default border border-white/10 bg-black p-6 transition-colors duration-300 hover:bg-gold md:p-8"
              >
                {/* Icon box */}
                <div className="w-12 h-12 flex items-center justify-center mb-8 bg-gold transition-colors duration-300 group-hover:bg-black">
                  <Icon
                    size={22}
                    strokeWidth={2}
                    className="text-black group-hover:text-gold transition-colors duration-300"
                  />
                </div>
                <h4 className="font-black text-white group-hover:text-black uppercase text-xl mb-3 transition-colors duration-300">
                  {val.title}
                </h4>
                <p className="text-white/60 group-hover:text-black/80 text-sm leading-relaxed transition-colors duration-300">
                  {val.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── CTA Banner (Dark) ── */}
      <section className="relative flex h-72 w-full items-center justify-center overflow-hidden bg-ink pb-16 md:h-80 md:pb-0">
        <div className="absolute -right-20 -bottom-20 h-80 w-80 rounded-full bg-gold opacity-[0.08] blur-3xl pointer-events-none" />

        <div className="text-center relative z-10">
          <h2 className="font-black text-white uppercase text-3xl md:text-5xl mb-8">
            {c.ctaTitle}
          </h2>
          <Link
            href={`/${locale}/workers`}
            className="inline-block font-black uppercase text-sm px-12 py-5 bg-gold text-ink shadow-[4px_4px_0px_rgba(255,255,255,0.2)] transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5"
          >
            {c.ctaBtn}
          </Link>
        </div>
      </section>
    </div>
  );
}
