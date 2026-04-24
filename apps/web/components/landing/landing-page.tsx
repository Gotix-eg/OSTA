"use client";

import { useEffect, useMemo, useState } from "react";

import Image from "next/image";
import Link from "next/link";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Facebook,
  Hammer,
  Instagram,
  LocateFixed,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  MoveRight,
  Paintbrush,
  Phone,
  Search,
  ShieldCheck,
  Snowflake,
  Sparkles,
  Star,
  ThumbsUp,
  Wrench,
  Waves,
  X,
  Zap
} from "lucide-react";

import { serviceCategories } from "@/lib/shared";
import { LocaleSwitcher } from "@/components/shared/locale-switcher";
import { AdBanner } from "@/components/shared/ad-banner";
import { landingCopy } from "@/lib/copy";
import type { Locale } from "@/lib/locales";
import { cn } from "@/lib/utils";

const areaOptions = ["Nasr City", "New Cairo", "Maadi", "6th of October", "Alexandria"];

// Pastel backgrounds for image area (shown before image loads)
const categoryBg: Record<string, string> = {
  carpentry:             "#FEF9EE",
  plumbing:              "#DBEAFE",
  electrical:            "#FEF3C7",
  "ac-technician":       "#E0F2FE",
  "home-appliances":     "#F1F5F9",
  painting:              "#FDF2F8",
  aluminum:              "#F1F5F9",
  "computer-networks":   "#FEF3C7",
  "computer-repair":     "#F3F4F6",
  "camera-installation": "#F0FDF4"
};

// Generated service photos
const categoryImages: Record<string, string> = {
  carpentry:             "/services/carpentry.png",
  plumbing:              "/services/plumbing.png",
  electrical:            "/services/electrical.png",
  "ac-technician":       "/services/ac-appliances.png",
  "home-appliances":     "/services/home-appliances.png",
  painting:              "/services/painting.png",
  aluminum:              "/services/aluminum-welding.png",
  "computer-networks":   "/services/computer-networks.png",
  "computer-repair":     "/services/computer-repair.png",
  "camera-installation": "/services/camera-installation.png"
};

function AnimatedCounter({ value, suffix, locale }: { value: number; suffix: string; locale: Locale }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let frame = 0;
    const startedAt = performance.now();
    const duration = 1100;

    const tick = (time: number) => {
      const progress = Math.min((time - startedAt) / duration, 1);
      const next = value >= 10 ? Math.round(progress * value) : Number((progress * value).toFixed(1));
      setDisplayValue(next);
      if (progress < 1) frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [value]);

  return (
    <span>
      {locale === "ar" ? displayValue.toLocaleString("ar-EG") : displayValue.toLocaleString("en-US")}
      {suffix}
    </span>
  );
}

export function LandingPage({ locale }: { locale: Locale }) {
  const copy = landingCopy[locale];
  const isArabic = locale === "ar";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [serviceQuery, setServiceQuery] = useState("");
  const [areaQuery, setAreaQuery] = useState(isArabic ? "القاهرة الجديدة" : "New Cairo");
  const [activeWorker, setActiveWorker] = useState(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [openFaq, setOpenFaq] = useState(0);

  const workerProfiles = useMemo(() => [
    { name: "Youssef El-Sharif", specialty: isArabic ? "فني كهرباء" : "Electrical Specialist", rating: 4.9, jobs: 312, area: isArabic ? "مدينة نصر" : "Nasr City" },
    { name: "Mostafa Adel",      specialty: isArabic ? "سباك معتمد" : "Certified Plumber",     rating: 4.8, jobs: 287, area: isArabic ? "المعادي" : "Maadi" },
    { name: "Ahmed Fawzy",       specialty: isArabic ? "فني تكييف" : "AC Technician",           rating: 4.9, jobs: 354, area: isArabic ? "القاهرة الجديدة" : "New Cairo" }
  ], [isArabic]);

  const testimonials = useMemo(() => [
    { name: isArabic ? "سارة حسن" : "Sara Hassan",   service: isArabic ? "صيانة سباكة" : "Plumbing Fix",    quote: isArabic ? "السباك وصل في الوقت، والسعر كان واضح، والدعم تابع معي بعد التنفيذ." : "The plumber arrived on time, pricing was clear, and support followed up after completion." },
    { name: isArabic ? "هاني محمود" : "Hany Mahmoud", service: isArabic ? "تركيب تكييف" : "AC Installation", quote: isArabic ? "أكثر شيء طمّنني هو نظام التوثيق وتفاصيل الطلب خطوة بخطوة." : "What impressed me most was the verification system and the clear job updates." },
    { name: isArabic ? "منى شريف" : "Mona Sherif",   service: isArabic ? "دهانات داخلية" : "Interior Painting", quote: isArabic ? "جودة التنفيذ ممتازة، وقدرت أختار الفني المناسب بعد ما شفت التقييمات والصور." : "Execution quality was excellent and the ratings made it easy to choose the right pro." }
  ], [isArabic]);

  const serviceSuggestions = serviceCategories.flatMap((cat) => [cat.name[locale], ...cat.services.map((s) => s.name[locale])]);
  const filteredSuggestions = serviceSuggestions.filter((s) => s.toLowerCase().includes(serviceQuery.toLowerCase())).slice(0, 5);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 28);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const wt = window.setInterval(() => setActiveWorker((c) => (c + 1) % workerProfiles.length), 4500);
    const tt = window.setInterval(() => setActiveTestimonial((c) => (c + 1) % testimonials.length), 5200);
    return () => { window.clearInterval(wt); window.clearInterval(tt); };
  }, [testimonials.length, workerProfiles.length]);

  const navItems = [
    { href: `/${locale}/services`,        label: copy.nav[0] },
    { href: `/${locale}/vendors`,         label: copy.nav[1] },
    { href: `/${locale}/how-it-works`,    label: copy.nav[2] },
    { href: `/${locale}/register/worker`, label: copy.nav[3] },
    { href: `/${locale}/contact`,         label: copy.nav[4] }
  ];

  // profi.ru-style trust features
  const trustFeatures = isArabic
    ? [
        { icon: MessageCircle, title: "الفنيون يتواصلون معك",   body: "شارك المشكلة وانتظر عروض الفنيين المتاحين." },
        { icon: CircleDollarSign, title: "أفضل الأسعار",         body: "قارن العروض واختر الأنسب لميزانيتك." },
        { icon: BadgeCheck,       title: "عمال موثقون ومدربون", body: "كل فني يمر بفحص هوية ومستندات قبل التفعيل." },
        { icon: ThumbsUp,         title: "تقييمات حقيقية فقط",  body: "كل تقييم مرتبط بطلب منجز مؤكد." }
      ]
    : [
        { icon: MessageCircle, title: "Pros reach out to you",  body: "Describe the job and receive offers from available workers." },
        { icon: CircleDollarSign, title: "Best prices",          body: "Compare quotes and choose what fits your budget." },
        { icon: BadgeCheck,       title: "Verified & trained",   body: "Every worker passes identity and document checks." },
        { icon: ThumbsUp,         title: "Real reviews only",    body: "Every rating is tied to a confirmed completed job." }
      ];

  return (
    <main className="relative overflow-hidden bg-white text-gray-900">

      {/* ── NAVBAR ── */}
      <header className={cn("fixed inset-x-0 top-0 z-50 transition-all duration-300", isScrolled ? "px-4 pt-3" : "px-0 pt-0")}>
        <div className={cn(
          "mx-auto flex max-w-7xl items-center justify-between rounded-none border border-transparent px-4 py-4 sm:px-6 lg:px-8",
          isScrolled && "rounded-2xl border-gray-200 bg-white/90 py-3 shadow-sm backdrop-blur-md"
        )}>
          <Link href={`/${locale}`} className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900 text-base font-semibold text-white">O</div>
            <div>
              <p className="text-xl font-semibold tracking-widest text-gray-900">OSTA</p>
              <p className="text-[10px] uppercase tracking-widest text-gray-400">{isArabic ? "أُسطى" : "Service platform"}</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 lg:flex">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href as `/${string}`} className="text-sm text-gray-600 transition hover:text-gray-900">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <Link href={`/${locale}/dashboards`} className="rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
              {isArabic ? "الداشبوردات" : "Dashboards"}
            </Link>
            <LocaleSwitcher locale={locale} pathname="" className="rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50" />
            <Link href={`/${locale}/login`} className="rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
              {copy.login}
            </Link>
            <Link href={`/${locale}/register/client`} className="rounded-full bg-primary-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary-700">
              {copy.getStarted}
            </Link>
          </div>

          <button type="button" onClick={() => setMobileOpen(true)} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-900 lg:hidden">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* ── MOBILE DRAWER ── */}
      <AnimatePresence>
        {mobileOpen ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-black/30 lg:hidden" onClick={() => setMobileOpen(false)}>
            <motion.div initial={{ x: isArabic ? -280 : 280 }} animate={{ x: 0 }} exit={{ x: isArabic ? -280 : 280 }} transition={{ type: "spring", stiffness: 280, damping: 28 }}
              className={cn("absolute top-0 h-full w-[82vw] max-w-sm bg-white p-6 shadow-xl", isArabic ? "left-0" : "right-0")}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-8 flex items-center justify-between">
                <p className="text-xl font-semibold tracking-widest">OSTA</p>
                <button type="button" onClick={() => setMobileOpen(false)} className="rounded-full border border-gray-200 p-2"><X className="h-4 w-4" /></button>
              </div>
              <div className="space-y-3">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href as `/${string}`} onClick={() => setMobileOpen(false)} className="block rounded-xl border border-gray-100 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    {item.label}
                  </Link>
                ))}
              </div>
              <div className="mt-6 grid gap-2">
                <Link href={`/${locale}/login`} className="flex justify-center rounded-full border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700">{copy.login}</Link>
                <Link href={`/${locale}/register/client`} className="flex justify-center rounded-full bg-primary-600 px-4 py-3 text-sm font-semibold text-white">{copy.getStarted}</Link>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* ── HERO — profi.ru style: big heading + prominent search ── */}
      <section className="section-shell pt-32 pb-12 sm:pt-36">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl">
          <p className="mb-4 text-sm font-semibold text-gray-400">{copy.heroEyebrow}</p>
          <h1 className="text-5xl font-medium leading-tight text-gray-900 sm:text-6xl">{copy.heroTitle}</h1>
          <p className="mt-5 text-lg text-gray-500 sm:text-xl">{copy.heroSubtitle}</p>
        </motion.div>

        {/* Big search bar – the hero centrepiece */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-8 flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm sm:flex-row"
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              value={serviceQuery}
              onChange={(e) => setServiceQuery(e.target.value)}
              placeholder={copy.searchService}
              className="h-14 w-full rounded-xl border border-gray-100 bg-gray-50 ps-12 pe-4 text-gray-900 placeholder-gray-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
            {serviceQuery ? (
              <div className="absolute inset-x-0 top-[calc(100%+0.5rem)] z-10 rounded-xl border border-gray-100 bg-white p-2 shadow-md">
                {filteredSuggestions.length > 0
                  ? filteredSuggestions.map((item) => (
                      <button key={item} type="button" onClick={() => setServiceQuery(item)}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-start text-sm text-gray-700 hover:bg-gray-50">
                        <Search className="h-4 w-4 text-gray-300" />
                        {item}
                      </button>
                    ))
                  : <p className="px-3 py-2 text-sm text-gray-400">{copy.searchHint}</p>
                }
              </div>
            ) : null}
          </div>

          <div className="relative flex-1">
            <MapPin className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              value={areaQuery}
              onChange={(e) => setAreaQuery(e.target.value)}
              placeholder={copy.searchArea}
              className="h-14 w-full rounded-xl border border-gray-100 bg-gray-50 ps-12 pe-4 text-gray-900 placeholder-gray-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          <button className="inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-primary-600 px-8 text-sm font-semibold text-white transition hover:bg-primary-700 sm:w-auto w-full">
            <Search className="h-4 w-4" />
            {copy.searchAction}
          </button>
        </motion.div>

        {/* Area quick picks */}
        <div className="mt-3 flex flex-wrap gap-2">
          {areaOptions.map((area) => (
            <button key={area} type="button" onClick={() => setAreaQuery(area)}
              className="rounded-full border border-gray-200 px-3 py-1.5 text-xs text-gray-500 transition hover:border-primary-300 hover:text-primary-700">
              {area}
            </button>
          ))}
        </div>

        {/* 4 trust features row – profi.ru inspired */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {trustFeatures.map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex flex-col gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100">
                <Icon className="h-6 w-6 text-gray-900" strokeWidth={1.5} />
              </div>
              <p className="text-base font-semibold text-gray-900">{title}</p>
              <p className="text-sm leading-relaxed text-gray-500">{body}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="bg-primary-600 py-6 text-white">
        <div className="section-shell grid gap-4 md:grid-cols-4">
          {copy.trustStats.map((item) => (
            <div key={item.label} className="rounded-2xl border border-white/15 bg-white/10 px-5 py-5 text-center">
              <p className="text-3xl font-semibold sm:text-4xl">
                <AnimatedCounter value={item.value} suffix={item.suffix} locale={locale} />
              </p>
              <p className="mt-2 text-sm text-white/75">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PASTEL SERVICE CATEGORIES – profi.ru card strip ── */}
      <motion.section id="services" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} className="py-16 bg-white">
        <div className="section-shell">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-medium text-gray-900">{copy.servicesTitle}</h2>
              <p className="mt-2 text-gray-500">{copy.servicesSubtitle}</p>
            </div>
            <Link href={`/${locale}/register/client`} className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700">
              {copy.viewAllServices}
              {isArabic ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
            </Link>
          </div>

          {/* Photo cards – profi.ru style */}
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {serviceCategories.map((category, index) => {
              const bg = categoryBg[category.slug] ?? "#F3F4F6";
              const img = categoryImages[category.slug];

              return (
                <Link key={category.id} href={`/${locale}/services/${category.slug}`}>
                  <motion.article
                    initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.45, delay: index * 0.04 }}
                    className="group cursor-pointer overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    {/* Photo top – profi.ru style */}
                    <div className="relative h-44 w-full overflow-hidden" style={{ background: bg }}>
                      {img ? (
                        <Image
                          src={img}
                          alt={category.name[locale]}
                          fill
                          className="object-cover transition duration-500 group-hover:scale-105"
                          sizes="(max-width: 768px) 50vw, 25vw"
                        />
                      ) : null}
                    </div>
                    {/* Text below */}
                    <div className="p-4">
                      <h3 className="text-base font-semibold text-gray-900">{category.name[locale]}</h3>
                      <p className="mt-1 text-sm text-gray-400">{category.services[0]?.name[locale]}</p>
                      <p className="mt-2 text-xs text-gray-400">{category.workersAvailable}+ {isArabic ? "متاح" : "available"}</p>
                    </div>
                  </motion.article>
                </Link>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* ── HOW IT WORKS ── */}
      <motion.section id="how-it-works" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} className="bg-gray-50 py-16">
        <div className="section-shell">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-medium text-gray-900">{copy.howTitle}</h2>
            <p className="mt-3 text-gray-500">{copy.howSubtitle}</p>
          </div>
          <div className="mt-10 grid gap-6 lg:grid-cols-4">
            {copy.steps.map((step, index) => (
              <div key={step.title} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-sm font-semibold text-white">
                  {index + 1}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── AD BANNER (HOMEPAGE) ── */}
      <section className="bg-white py-4">
        <div className="section-shell">
          <AdBanner placement="HOMEPAGE" locale={locale} />
        </div>
      </section>

      {/* ── WHY OSTA ── */}
      <motion.section initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} className="py-16 bg-white">
        <div className="section-shell">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-medium text-gray-900">{copy.whyTitle}</h2>
            <p className="mt-3 text-gray-500">{copy.whySubtitle}</p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {copy.whyCards.map(([title, description], index) => (
              <article key={title} className={cn("rounded-2xl border border-gray-100 p-6 shadow-sm", index % 2 === 0 ? "bg-white" : "bg-gray-50")}>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900">
                  {index % 3 === 0 ? <ShieldCheck className="h-5 w-5 text-white" /> : index % 3 === 1 ? <CircleDollarSign className="h-5 w-5 text-white" /> : <LocateFixed className="h-5 w-5 text-white" />}
                </div>
                <h3 className="mt-5 text-lg font-semibold text-gray-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── FEATURED STORES ── */}
      <motion.section initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} className="py-16 bg-gray-50/50">
        <div className="section-shell">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-medium text-gray-900">{isArabic ? "متاجر قطع الغيار والمعدات" : "Parts & Equipment Stores"}</h2>
              <p className="mt-2 text-gray-500">{isArabic ? "اشترِ لوازم السباكة، الكهرباء، والدهانات من أفضل الموردين القريبين منك." : "Buy plumbing, electrical, and painting supplies from top nearby vendors."}</p>
            </div>
            <Link href={`/${locale}/vendors`} className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700">
              {isArabic ? "تصفح كل المتاجر" : "Browse all stores"}
              {isArabic ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[
              { id: "s1", name: isArabic ? "بيت السباكة الحديث" : "Modern Plumbing House", cat: isArabic ? "مستلزمات سباكة" : "Plumbing Supplies", rating: 4.8, area: isArabic ? "مدينة نصر" : "Nasr City", img: "/vendors/v1.png" },
              { id: "s2", name: isArabic ? "الإسراء للكهرباء" : "Al-Israa Electrical", cat: isArabic ? "أدوات كهربائية" : "Electrical Tools", rating: 4.9, area: isArabic ? "المعادي" : "Maadi", img: "/vendors/v2.png" },
              { id: "s3", name: isArabic ? "عالم الدهانات" : "Paint World", cat: isArabic ? "دهانات ومواد بناء" : "Paints & Materials", rating: 4.7, area: isArabic ? "القاهرة الجديدة" : "New Cairo", img: "/vendors/v3.png" },
              { id: "s4", name: isArabic ? "تكنو كول" : "Techno Cool", cat: isArabic ? "قطع غيار تكييف" : "AC Spare Parts", rating: 4.6, area: isArabic ? "6 أكتوبر" : "6th Oct", img: "/vendors/v4.png" }
            ].map((store) => (
              <Link key={store.id} href={`/${locale}/vendors/${store.id}`}>
                <article className="group overflow-hidden rounded-3xl border border-gray-100 bg-white p-2 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                  <div className="relative h-40 w-full overflow-hidden rounded-2xl bg-gray-100">
                    <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-gray-200">STORE</div>
                    {/* Image placeholder */}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-gray-900 group-hover:text-primary-600 transition">{store.name}</h3>
                        <p className="mt-1 text-xs text-gray-500 font-medium">{store.cat}</p>
                      </div>
                      <div className="flex items-center gap-1 rounded-full bg-sun-50 px-2 py-0.5 text-xs font-bold text-sun-700">
                        <Star className="h-3 w-3 fill-current" /> {store.rating}
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs text-gray-400">
                        <MapPin className="h-3.5 w-3.5" /> {store.area}
                      </span>
                      <span className="text-xs font-bold text-gray-900 flex items-center gap-1">
                        {isArabic ? "زيارة المتجر" : "Visit Store"}
                        {isArabic ? <ArrowLeft className="h-3 w-3" /> : <ArrowRight className="h-3 w-3" />}
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── TOP WORKERS ── */}
      <motion.section initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} className="bg-gray-50 py-16">
        <div className="section-shell">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-medium text-gray-900">{copy.workersTitle}</h2>
              <p className="mt-2 text-gray-500">{copy.workersSubtitle}</p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setActiveWorker((c) => (c - 1 + workerProfiles.length) % workerProfiles.length)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm transition hover:bg-gray-50">
                {isArabic ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </button>
              <button type="button" onClick={() => setActiveWorker((c) => (c + 1) % workerProfiles.length)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm transition hover:bg-gray-50">
                {isArabic ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <AnimatePresence mode="wait">
              <motion.article key={workerProfiles[activeWorker]?.name}
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }}
                className="rounded-2xl border border-gray-100 bg-white p-7 shadow-sm"
              >
                <div className="flex items-center gap-5">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gray-900 text-2xl font-semibold text-white">
                    {workerProfiles[activeWorker]?.name.split(" ").map((p) => p[0]).join("")}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-2xl font-semibold text-gray-900">{workerProfiles[activeWorker]?.name}</h3>
                      <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">{copy.verifiedBadge}</span>
                    </div>
                    <p className="mt-1.5 text-gray-500">{workerProfiles[activeWorker]?.specialty}</p>
                    <div className="mt-3 flex flex-wrap gap-3 text-sm">
                      <span className="flex items-center gap-1.5 rounded-full bg-gray-50 px-3 py-1.5 text-gray-600">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /> {workerProfiles[activeWorker]?.rating}
                      </span>
                      <span className="flex items-center gap-1.5 rounded-full bg-gray-50 px-3 py-1.5 text-gray-600">
                        <Sparkles className="h-4 w-4 text-primary-600" /> {workerProfiles[activeWorker]?.jobs} {isArabic ? "مهمة" : "jobs"}
                      </span>
                      <span className="flex items-center gap-1.5 rounded-full bg-gray-50 px-3 py-1.5 text-gray-600">
                        <MapPin className="h-4 w-4 text-primary-600" /> {workerProfiles[activeWorker]?.area}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  {[[isArabic ? "سرعة الرد" : "Response", isArabic ? "5 دقائق" : "5 mins"],
                    [isArabic ? "معدل القبول" : "Acceptance", "96%"],
                    [isArabic ? "متوسط السعر" : "Avg. price", isArabic ? "300 جنيه" : "EGP 300"]
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                      <p className="text-xs text-gray-400">{label}</p>
                      <p className="mt-2 text-lg font-semibold text-gray-900">{value}</p>
                    </div>
                  ))}
                </div>

                <Link href={`/${locale}/register/client`} className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700">
                  {copy.bookNow}
                  {isArabic ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                </Link>
              </motion.article>
            </AnimatePresence>

            <div className="grid gap-3 content-start">
              {workerProfiles.map((worker, index) => (
                <button key={worker.name} type="button" onClick={() => setActiveWorker(index)}
                  className={cn("rounded-2xl border p-5 text-start transition", activeWorker === index ? "border-primary-200 bg-primary-50 shadow-sm" : "border-gray-100 bg-white hover:border-gray-200")}>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-gray-900">{worker.name}</p>
                      <p className="mt-1 text-sm text-gray-500">{worker.specialty}</p>
                    </div>
                    <div className="text-end text-sm">
                      <p className="font-semibold text-gray-900">{worker.rating}★</p>
                      <p className="text-gray-400">{worker.jobs} {isArabic ? "مهمة" : "jobs"}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── TESTIMONIALS ── */}
      <motion.section initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} className="py-16 bg-white">
        <div className="section-shell">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-medium text-gray-900">{copy.testimonialsTitle}</h2>
            <p className="mt-3 text-gray-500">{copy.testimonialsSubtitle}</p>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
            <AnimatePresence mode="wait">
              <motion.article key={testimonials[activeTestimonial]?.name}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                className="rounded-2xl border border-gray-100 bg-white p-7 shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gray-900 text-lg font-semibold text-white">
                    {testimonials[activeTestimonial]?.name.slice(0, 1)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonials[activeTestimonial]?.name}</p>
                    <p className="text-sm text-gray-400">{testimonials[activeTestimonial]?.service}</p>
                  </div>
                </div>
                <div className="mt-5 flex gap-1 text-yellow-400">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-5 w-5 fill-current" />)}
                </div>
                <p className="mt-5 text-xl leading-9 text-gray-700">&ldquo;{testimonials[activeTestimonial]?.quote}&rdquo;</p>
              </motion.article>
            </AnimatePresence>
            <div className="flex flex-row gap-2 lg:flex-col">
              {testimonials.map((item, index) => (
                <button key={item.name} type="button" onClick={() => setActiveTestimonial(index)}
                  className={cn("h-3 w-10 rounded-full transition lg:h-10 lg:w-3", activeTestimonial === index ? "bg-primary-600" : "bg-gray-200")} />
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── WORKER CTA ── */}
      <motion.section id="worker-cta" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} className="section-shell py-16">
        <div className="grid items-center gap-10 overflow-hidden rounded-3xl bg-gray-900 p-8 text-white lg:grid-cols-2 lg:p-12">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-primary-300">{copy.workerCtaTitle}</p>
            <h2 className="mt-4 text-3xl font-medium">{copy.workerCtaTitle}</h2>
            <p className="mt-4 text-gray-400">{copy.workerCtaBody}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {copy.workerBenefits.map((item) => (
                <span key={item} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80">{item}</span>
              ))}
            </div>
            <p className="mt-6 text-sm text-gray-500">{copy.workerStats}</p>
            <Link href={`/${locale}/register/worker`} className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700">
              {copy.registerWorker}
              {isArabic ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
            </Link>
          </div>
          <div className="grid gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-white/50">{isArabic ? "لوحة العامل" : "Worker dashboard"}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-white/5 p-4"><p className="text-xs text-white/40">{isArabic ? "طلبات اليوم" : "Today"}</p><p className="mt-2 text-2xl font-semibold">8</p></div>
                <div className="rounded-xl bg-white/5 p-4"><p className="text-xs text-white/40">{isArabic ? "الدخل" : "Earnings"}</p><p className="mt-2 text-2xl font-semibold">EGP 8,000</p></div>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-white/50">{isArabic ? "تقدم التوثيق" : "Verification"}</p>
              <div className="mt-4 h-2.5 rounded-full bg-white/10"><div className="h-full w-4/5 rounded-full bg-primary-500" /></div>
              <p className="mt-2 text-sm text-white/60">{isArabic ? "80% مكتمل" : "80% complete"}</p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── FAQ ── */}
      <motion.section initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} className="bg-gray-50 py-16">
        <div className="section-shell">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-medium text-gray-900">{copy.faqTitle}</h2>
            <p className="mt-3 text-gray-500">{copy.faqSubtitle}</p>
          </div>
          <div className="mt-8 grid gap-3">
            {copy.faqs.map(([question, answer], index) => {
              const isOpen = index === openFaq;
              return (
                <article key={question} className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                  <button type="button" onClick={() => setOpenFaq(isOpen ? -1 : index)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-start">
                    <span className="font-semibold text-gray-900">{question}</span>
                    <ChevronDown className={cn("h-5 w-5 shrink-0 text-gray-400 transition", isOpen && "rotate-180")} />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen ? (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                        <p className="px-6 pb-6 text-sm leading-relaxed text-gray-500">{answer}</p>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </article>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* ── FOOTER ── */}
      <footer id="contact" className="bg-gray-900 py-14 text-white">
        <div className="section-shell grid gap-10 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <p className="text-xl font-semibold tracking-widest">OSTA</p>
            <p className="mt-4 text-sm leading-relaxed text-gray-400">{copy.footerBody}</p>
            <div className="mt-6 flex gap-3">
              {[Instagram, Facebook, Mail].map((Icon, i) => (
                <div key={i} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5">
                  <Icon className="h-4 w-4" />
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">{copy.footerLinks.quick}</p>
            <div className="mt-4 grid gap-3 text-sm text-gray-400">
              {[
                { label: copy.footerItems.quick[0], href: `/${locale}/services` },
                { label: copy.footerItems.quick[1], href: `/${locale}/how-it-works` },
                { label: copy.footerItems.quick[2], href: `/${locale}/about` },
                { label: copy.footerItems.quick[3], href: `/${locale}/contact` }
              ].map((item) => <Link key={item.href} href={item.href as `/${string}`} className="hover:text-white">{item.label}</Link>)}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">{copy.footerLinks.workers}</p>
            <div className="mt-4 grid gap-3 text-sm text-gray-400">
              {[
                { label: copy.footerItems.workers[0], href: `/${locale}/register/worker` },
                { label: copy.footerItems.workers[1], href: `/${locale}/faq` },
                { label: copy.footerItems.workers[2], href: `/${locale}/how-it-works` },
                { label: copy.footerItems.workers[3], href: `/${locale}/contact` }
              ].map((item) => <Link key={item.href} href={item.href as `/${string}`} className="hover:text-white">{item.label}</Link>)}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">{copy.footerLinks.contact}</p>
            <div className="mt-4 grid gap-3 text-sm text-gray-400">
              <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary-400" /> {copy.footerItems.contact[0]}</div>
              <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary-400" /> {copy.footerItems.contact[1]}</div>
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary-400" /> {copy.footerItems.contact[2]}</div>
            </div>
          </div>
        </div>

        <div className="section-shell mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <p>{copy.footerBottom}</p>
          <div className="flex gap-4">
            <Link href={`/${locale}/faq`} className="hover:text-white">FAQ</Link>
            <Link href={`/${locale}/contact`} className="hover:text-white">Contact</Link>
            <LocaleSwitcher locale={locale} pathname="" className="font-semibold text-white" />
          </div>
        </div>
      </footer>
    </main>
  );
}
