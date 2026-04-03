"use client";

import { useEffect, useMemo, useState } from "react";

import Link from "next/link";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
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
  MoveRight,
  Paintbrush,
  Phone,
  ShieldCheck,
  Snowflake,
  Sparkles,
  Star,
  Wrench,
  Waves,
  X,
  Zap
} from "lucide-react";

import { serviceCategories } from "@/lib/shared";

import { LocaleSwitcher } from "@/components/shared/locale-switcher";
import { landingCopy } from "@/lib/copy";
import type { Locale } from "@/lib/locales";
import { cn } from "@/lib/utils";

const areaOptions = ["Nasr City", "New Cairo", "Maadi", "6th of October", "Alexandria"];

const serviceIconMap = {
  electrical: Zap,
  plumbing: Waves,
  carpentry: Hammer,
  painting: Paintbrush,
  "ac-appliances": Snowflake,
  "aluminum-welding": Wrench,
  "general-services": ShieldCheck
} as const;

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

      if (progress < 1) {
        frame = window.requestAnimationFrame(tick);
      }
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

  const workerProfiles = useMemo(
    () => [
      {
        name: "Youssef El-Sharif",
        specialty: isArabic ? "فني كهرباء" : "Electrical Specialist",
        rating: 4.9,
        jobs: 312,
        area: isArabic ? "مدينة نصر" : "Nasr City"
      },
      {
        name: "Mostafa Adel",
        specialty: isArabic ? "سباك معتمد" : "Certified Plumber",
        rating: 4.8,
        jobs: 287,
        area: isArabic ? "المعادي" : "Maadi"
      },
      {
        name: "Ahmed Fawzy",
        specialty: isArabic ? "فني تكييف" : "AC Technician",
        rating: 4.9,
        jobs: 354,
        area: isArabic ? "القاهرة الجديدة" : "New Cairo"
      }
    ],
    [isArabic]
  );

  const testimonials = useMemo(
    () => [
      {
        name: isArabic ? "سارة حسن" : "Sara Hassan",
        service: isArabic ? "صيانة سباكة" : "Plumbing Fix",
        quote: isArabic
          ? "السباك وصل في الوقت، والسعر كان واضح، والدعم تابع معي بعد التنفيذ."
          : "The plumber arrived on time, pricing was clear, and support followed up after completion."
      },
      {
        name: isArabic ? "هاني محمود" : "Hany Mahmoud",
        service: isArabic ? "تركيب تكييف" : "AC Installation",
        quote: isArabic
          ? "أكثر شيء طمّنني هو نظام التوثيق وتفاصيل الطلب خطوة بخطوة."
          : "What impressed me most was the verification system and the clear job updates."
      },
      {
        name: isArabic ? "منى شريف" : "Mona Sherif",
        service: isArabic ? "دهانات داخلية" : "Interior Painting",
        quote: isArabic
          ? "جودة التنفيذ ممتازة، وقدرت أختار الفني المناسب بعد ما شفت التقييمات والصور."
          : "Execution quality was excellent and the ratings made it easy to choose the right pro."
      }
    ],
    [isArabic]
  );

  const quickServices = serviceCategories.slice(0, 5);
  const serviceSuggestions = serviceCategories.flatMap((category) => [
    category.name[locale],
    ...category.services.map((service) => service.name[locale])
  ]);

  const filteredSuggestions = serviceSuggestions
    .filter((item) => item.toLowerCase().includes(serviceQuery.toLowerCase()))
    .slice(0, 5);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 28);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const workerTimer = window.setInterval(
      () => setActiveWorker((current) => (current + 1) % workerProfiles.length),
      4500
    );
    const testimonialTimer = window.setInterval(
      () => setActiveTestimonial((current) => (current + 1) % testimonials.length),
      5200
    );

    return () => {
      window.clearInterval(workerTimer);
      window.clearInterval(testimonialTimer);
    };
  }, [testimonials.length, workerProfiles.length]);

  const navItems = [
    { href: `/${locale}/services`, label: copy.nav[0] },
    { href: `/${locale}/how-it-works`, label: copy.nav[1] },
    { href: `/${locale}/register/worker`, label: copy.nav[2] },
    { href: `/${locale}/contact`, label: copy.nav[3] }
  ];

  return (
    <main className="relative overflow-hidden text-dark-950">
      <div className="absolute inset-x-0 top-0 h-[32rem] bg-halo opacity-90" />

      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          isScrolled ? "px-4 pt-3" : "px-0 pt-0"
        )}
      >
        <div
          className={cn(
            "mx-auto flex max-w-7xl items-center justify-between rounded-none border border-transparent px-4 py-4 sm:px-6 lg:px-8",
            isScrolled && "rounded-[1.4rem] border-white/50 bg-white/75 py-3 shadow-card backdrop-blur-xl"
          )}
        >
          <Link href={`/${locale}`} className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-dark-950 text-lg font-semibold text-white shadow-glow">
              O
            </div>
            <div>
              <p className="font-serif text-2xl leading-none tracking-[0.22em]">OSTA</p>
              <p className="text-xs uppercase tracking-[0.3em] text-dark-500">{isArabic ? "أُسطى" : "Skilled service"}</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 lg:flex">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href as `/${string}`} className="text-sm font-medium text-dark-600 transition hover:text-primary-700">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href={`/${locale}/dashboards`}
              className="rounded-full border border-dark-200 px-5 py-2.5 text-sm font-semibold text-dark-700 transition hover:border-primary-300 hover:text-primary-700"
            >
              Dashboards
            </Link>
            <LocaleSwitcher
              locale={locale}
              pathname=""
              className="rounded-full border border-dark-200 px-4 py-2 text-sm font-semibold text-dark-700 transition hover:border-primary-300 hover:text-primary-700"
            />
            <Link
              href={`/${locale}/login`}
              className="rounded-full border border-dark-200 px-5 py-2.5 text-sm font-semibold text-dark-700 transition hover:border-primary-300 hover:text-primary-700"
            >
              {copy.login}
            </Link>
            <Link
              href={`/${locale}/register/client`}
              className="rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
            >
              {copy.getStarted}
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-dark-200 bg-white/80 text-dark-950 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-dark-950/50 backdrop-blur-sm lg:hidden"
          >
            <motion.div
              initial={{ x: isArabic ? -280 : 280 }}
              animate={{ x: 0 }}
              exit={{ x: isArabic ? -280 : 280 }}
              transition={{ type: "spring", stiffness: 280, damping: 28 }}
              className={cn(
                "absolute top-0 h-full w-[86vw] max-w-sm bg-white p-6 shadow-2xl",
                isArabic ? "left-0" : "right-0"
              )}
            >
              <div className="mb-8 flex items-center justify-between">
                <p className="font-serif text-2xl tracking-[0.18em]">OSTA</p>
                <button type="button" onClick={() => setMobileOpen(false)} className="rounded-full border border-dark-200 p-2">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href as `/${string}`}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-[1.1rem] border border-dark-200 px-4 py-3 font-medium text-dark-700"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              <div className="mt-8 grid gap-3">
                <Link href={`/${locale}/dashboards`} className="inline-flex justify-center rounded-full border border-dark-200 px-4 py-3 text-sm font-semibold text-dark-700">
                  Dashboards
                </Link>
                <LocaleSwitcher
                  locale={locale}
                  pathname=""
                  className="inline-flex justify-center rounded-full border border-dark-200 px-4 py-3 text-sm font-semibold text-dark-700"
                />
                <Link href={`/${locale}/login`} className="inline-flex justify-center rounded-full border border-dark-200 px-4 py-3 text-sm font-semibold text-dark-700">
                  {copy.login}
                </Link>
                <Link href={`/${locale}/register/client`} className="inline-flex justify-center rounded-full bg-primary-600 px-4 py-3 text-sm font-semibold text-white">
                  {copy.getStarted}
                </Link>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <section className="section-shell relative pt-28 sm:pt-32 lg:pt-36">
        <div className="grid items-center gap-golden-xl lg:grid-cols-[1.618fr_1fr]">
          <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="inline-flex rounded-full border border-primary-200 bg-primary-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-primary-700">
              {copy.heroEyebrow}
            </span>
            <h1 className="mt-6 max-w-3xl text-balance text-5xl font-semibold leading-[1.05] text-dark-950 sm:text-6xl xl:text-7xl">
              {copy.heroTitle}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-dark-600 sm:text-xl">{copy.heroSubtitle}</p>

            <div className="mt-10 rounded-[2rem] border border-white/70 bg-white/85 p-4 shadow-card backdrop-blur-xl sm:p-5">
              <div className="grid gap-3 lg:grid-cols-[1fr_0.8fr_auto]">
                <div className="relative">
                  <input
                    value={serviceQuery}
                    onChange={(event) => setServiceQuery(event.target.value)}
                    placeholder={copy.searchService}
                    className="h-14 w-full rounded-[1.2rem] border border-dark-200 bg-surface-base px-4 text-body text-dark-950 focus:border-primary-400 focus:ring-2 focus:ring-primary-500/30"
                  />
                  {serviceQuery ? (
                    <div className="absolute inset-x-0 top-[calc(100%+0.6rem)] z-10 rounded-[1.2rem] border border-dark-200 bg-white p-2 shadow-card">
                      {filteredSuggestions.length > 0 ? (
                        filteredSuggestions.map((item) => (
                          <button
                            key={item}
                            type="button"
                            onClick={() => setServiceQuery(item)}
                            className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-start text-sm text-dark-700 transition hover:bg-surface-soft"
                          >
                            <span>{item}</span>
                            <MoveRight className="h-4 w-4 text-dark-300" />
                          </button>
                        ))
                      ) : (
                        <p className="px-3 py-2 text-sm text-dark-400">{copy.searchHint}</p>
                      )}
                    </div>
                  ) : null}
                </div>
                <div className="relative">
                  <input
                    value={areaQuery}
                    onChange={(event) => setAreaQuery(event.target.value)}
                    placeholder={copy.searchArea}
                    className="h-14 w-full rounded-[1.2rem] border border-dark-200 bg-surface-base px-4 text-body text-dark-950 focus:border-primary-400 focus:ring-2 focus:ring-primary-500/30"
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    {areaOptions.map((area) => (
                      <button
                        key={area}
                        type="button"
                        onClick={() => setAreaQuery(area)}
                        className="rounded-full border border-dark-200 px-3 py-1.5 text-xs font-medium text-dark-500 transition hover:border-primary-300 hover:text-primary-700"
                      >
                        {area}
                      </button>
                    ))}
                  </div>
                </div>
                <button className="inline-flex h-14 items-center justify-center rounded-[1.2rem] bg-primary-600 px-8 text-sm font-semibold text-white transition hover:bg-primary-700">
                  {copy.searchAction}
                </button>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {quickServices.map((service) => {
                const Icon = serviceIconMap[service.slug as keyof typeof serviceIconMap];

                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => setServiceQuery(service.name[locale])}
                    className="inline-flex items-center gap-2 rounded-full border border-dark-200 bg-white/80 px-4 py-2.5 text-sm font-medium text-dark-700 shadow-sm transition hover:-translate-y-0.5 hover:border-primary-300 hover:text-primary-700"
                  >
                    <Icon className="h-4 w-4" />
                    {service.name[locale]}
                  </button>
                );
              })}
            </div>

            <div className="mt-8 flex flex-wrap gap-4 text-sm text-dark-600">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 shadow-sm">
                <CheckCircle2 className="h-4 w-4 text-success" />
                {copy.verifiedBadge}
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 shadow-sm">
                <ShieldCheck className="h-4 w-4 text-primary-600" />
                {copy.guaranteeBadge}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -inset-8 rounded-full bg-primary-600/10 blur-3xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-dark-200/60 bg-dark-950 p-6 text-white shadow-glow">
              <div className="absolute inset-0 bg-lattice bg-[size:38px_38px] opacity-10" />
              <div className="relative flex items-center justify-between rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.26em] text-white/45">{isArabic ? "طلب مباشر" : "Live request"}</p>
                  <p className="mt-2 text-lg font-semibold">{isArabic ? "صيانة كهرباء طارئة" : "Urgent electrical repair"}</p>
                </div>
                <span className="rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success">{isArabic ? "متصل الآن" : "Online"}</span>
              </div>

              <div className="mt-6 grid gap-4">
                <div className="grid gap-4 sm:grid-cols-[1.1fr_0.9fr]">
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                    <p className="text-sm text-white/55">{isArabic ? "الفني المقترح" : "Suggested worker"}</p>
                    <div className="mt-4 flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-[1.2rem] bg-primary-600 text-xl font-semibold">YK</div>
                      <div>
                        <p className="text-xl font-semibold">Youssef Khaled</p>
                        <p className="mt-1 text-sm text-white/60">{isArabic ? "خبرة 8 سنوات - كهرباء" : "8 years experience - electrical"}</p>
                        <div className="mt-3 flex items-center gap-2 text-sm text-warning">
                          <Star className="h-4 w-4 fill-current" /> 4.9
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-primary-600/20 to-white/5 p-5">
                    <p className="text-sm text-white/55">{isArabic ? "خطوات الحماية" : "Protection flow"}</p>
                    <div className="mt-4 space-y-3 text-sm text-white/80">
                      {[
                        isArabic ? "توثيق العامل" : "Worker verified",
                        isArabic ? "الدفع محجوز" : "Payment held",
                        isArabic ? "ضمان بعد التنفيذ" : "Post-job warranty"
                      ].map((item) => (
                        <div key={item} className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-success" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    [isArabic ? "زمن الوصول" : "ETA", isArabic ? "18 دقيقة" : "18 mins"],
                    [isArabic ? "التكلفة المتوقعة" : "Estimated price", isArabic ? "250 - 320 جنيه" : "EGP 250 - 320"],
                    [isArabic ? "نسبة الإنجاز" : "Completion rate", "98%"]
                  ].map(([label, value], index) => (
                    <motion.div
                      key={label}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                      className="rounded-[1.3rem] border border-white/10 bg-white/5 p-4"
                    >
                      <p className="text-xs uppercase tracking-[0.24em] text-white/45">{label}</p>
                      <p className="mt-3 text-lg font-semibold">{value}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mt-golden-2xl bg-primary-600 py-6 text-white">
        <div className="section-shell grid gap-6 md:grid-cols-4">
          {copy.trustStats.map((item) => (
            <div key={item.label} className="rounded-[1.4rem] border border-white/15 bg-white/10 px-5 py-5 text-center backdrop-blur-sm">
              <p className="text-3xl font-semibold sm:text-4xl">
                <AnimatedCounter value={item.value} suffix={item.suffix} locale={locale} />
              </p>
              <p className="mt-2 text-sm text-white/75">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      <motion.section
        id="services"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        className="section-shell py-golden-2xl"
      >
        <div className="mb-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary-700">{copy.trustTitle}</p>
            <h2 className="mt-4 text-4xl font-semibold text-dark-950">{copy.servicesTitle}</h2>
            <p className="mt-4 max-w-2xl text-body text-dark-500">{copy.servicesSubtitle}</p>
          </div>
          <Link href={`/${locale}/register/client`} className="inline-flex items-center gap-2 text-sm font-semibold text-primary-700">
            {copy.viewAllServices}
            {isArabic ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
          </Link>
        </div>

        <div className="grid gap-golden-md md:grid-cols-2 xl:grid-cols-3">
          {serviceCategories.map((category, index) => {
            const Icon = serviceIconMap[category.slug as keyof typeof serviceIconMap];

            return (
              <motion.article
                key={category.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.55, delay: index * 0.05 }}
                className={cn(
                  "group rounded-[1.8rem] border border-dark-200 bg-white p-6 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-xl",
                  index % 2 === 0 ? "bg-white" : "bg-surface-soft/70"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-[1.2rem] bg-primary-50 text-primary-700 transition group-hover:bg-primary-600 group-hover:text-white">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-sm text-dark-400">{category.workersAvailable}+ {isArabic ? "متاح" : "available"}</span>
                </div>
                <h3 className="mt-6 text-2xl font-semibold text-dark-950">{category.name[locale]}</h3>
                <p className="mt-3 text-body text-dark-500">{category.description[locale]}</p>
                <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary-700">
                  {category.services[0]?.name[locale]}
                  <MoveRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </div>
              </motion.article>
            );
          })}
        </div>
      </motion.section>

      <motion.section
        id="how-it-works"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        className="bg-dark-950 py-golden-2xl text-white"
      >
        <div className="section-shell">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary-200">{copy.howTitle}</p>
            <h2 className="mt-4 text-4xl font-semibold">{copy.howTitle}</h2>
            <p className="mt-4 text-body text-white/70">{copy.howSubtitle}</p>
          </div>

          <div className="relative mt-12 grid gap-6 lg:grid-cols-4">
            <div className="absolute inset-x-0 top-10 hidden h-px bg-white/10 lg:block" />
            {copy.steps.map((step, index) => (
              <div key={step.title} className="relative rounded-[1.7rem] border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary-600 text-lg font-semibold text-white">
                  {index + 1}
                </div>
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="mt-3 text-body text-white/65">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        className="section-shell py-golden-2xl"
      >
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary-700">{copy.whyTitle}</p>
          <h2 className="mt-4 text-4xl font-semibold text-dark-950">{copy.whyTitle}</h2>
          <p className="mt-4 text-body text-dark-500">{copy.whySubtitle}</p>
        </div>

        <div className="mt-12 grid gap-golden-md md:grid-cols-2 xl:grid-cols-3">
          {copy.whyCards.map(([title, description], index) => (
            <article
              key={title}
              className={cn(
                "rounded-[1.7rem] border border-dark-200 p-6 shadow-card",
                index % 2 === 0 ? "bg-white" : "bg-surface-soft"
              )}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-dark-950 text-white">
                {index % 3 === 0 ? <ShieldCheck className="h-5 w-5" /> : index % 3 === 1 ? <CircleDollarSign className="h-5 w-5" /> : <LocateFixed className="h-5 w-5" />}
              </div>
              <h3 className="mt-5 text-xl font-semibold text-dark-950">{title}</h3>
              <p className="mt-3 text-body text-dark-500">{description}</p>
            </article>
          ))}
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        className="section-shell pb-golden-2xl"
      >
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary-700">{copy.workersTitle}</p>
            <h2 className="mt-4 text-4xl font-semibold text-dark-950">{copy.workersTitle}</h2>
            <p className="mt-4 max-w-2xl text-body text-dark-500">{copy.workersSubtitle}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveWorker((current) => (current - 1 + workerProfiles.length) % workerProfiles.length)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-dark-200 bg-white"
            >
              {isArabic ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => setActiveWorker((current) => (current + 1) % workerProfiles.length)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-dark-200 bg-white"
            >
              {isArabic ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="grid gap-golden-md lg:grid-cols-[1.1fr_0.9fr]">
          <AnimatePresence mode="wait">
            <motion.article
              key={workerProfiles[activeWorker]?.name}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              className="rounded-[2rem] border border-dark-200 bg-white p-7 shadow-card"
            >
              <div className="grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
                <div className="flex h-28 w-28 items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-primary-600 to-dark-950 text-3xl font-semibold text-white">
                  {workerProfiles[activeWorker]?.name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-3xl font-semibold text-dark-950">{workerProfiles[activeWorker]?.name}</h3>
                    <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">{copy.verifiedBadge}</span>
                  </div>
                  <p className="mt-3 text-lg text-dark-600">{workerProfiles[activeWorker]?.specialty}</p>
                  <div className="mt-4 flex flex-wrap gap-4 text-sm text-dark-500">
                    <span className="inline-flex items-center gap-2 rounded-full bg-surface-soft px-3 py-2">
                      <Star className="h-4 w-4 fill-current text-warning" /> {workerProfiles[activeWorker]?.rating}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-surface-soft px-3 py-2">
                      <Sparkles className="h-4 w-4 text-primary-700" /> {workerProfiles[activeWorker]?.jobs} {isArabic ? "مهمة" : "jobs"}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-surface-soft px-3 py-2">
                      <MapPin className="h-4 w-4 text-primary-700" /> {workerProfiles[activeWorker]?.area}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {[
                  [isArabic ? "سرعة الرد" : "Response time", isArabic ? "5 دقائق" : "5 mins"],
                  [isArabic ? "معدل القبول" : "Acceptance", "96%"],
                  [isArabic ? "متوسط السعر" : "Avg. price", isArabic ? "300 جنيه" : "EGP 300"]
                ].map(([label, value]) => (
                  <div key={label} className="rounded-[1.3rem] border border-dark-200 bg-surface-soft p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-dark-400">{label}</p>
                    <p className="mt-3 text-lg font-semibold text-dark-950">{value}</p>
                  </div>
                ))}
              </div>

              <Link
                href={`/${locale}/register/client`}
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700"
              >
                {copy.bookNow}
                {isArabic ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
              </Link>
            </motion.article>
          </AnimatePresence>

          <div className="grid gap-4">
            {workerProfiles.map((worker, index) => (
              <button
                key={worker.name}
                type="button"
                onClick={() => setActiveWorker(index)}
                className={cn(
                  "rounded-[1.5rem] border p-5 text-start transition",
                  activeWorker === index
                    ? "border-primary-300 bg-primary-50 shadow-card"
                    : "border-dark-200 bg-white hover:border-primary-200"
                )}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-dark-950">{worker.name}</p>
                    <p className="mt-2 text-sm text-dark-500">{worker.specialty}</p>
                  </div>
                  <div className="text-end text-sm text-dark-500">
                    <p className="font-semibold text-dark-950">{worker.rating}★</p>
                    <p>{worker.jobs} {isArabic ? "مهمة" : "jobs"}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        className="bg-surface-soft py-golden-2xl"
      >
        <div className="section-shell">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary-700">{copy.testimonialsTitle}</p>
            <h2 className="mt-4 text-4xl font-semibold text-dark-950">{copy.testimonialsTitle}</h2>
            <p className="mt-4 text-body text-dark-500">{copy.testimonialsSubtitle}</p>
          </div>

          <div className="mt-10 grid gap-golden-md lg:grid-cols-[1fr_auto] lg:items-center">
            <AnimatePresence mode="wait">
              <motion.article
                key={testimonials[activeTestimonial]?.name}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                className="rounded-[2rem] border border-dark-200 bg-white p-7 shadow-card"
              >
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-dark-950 text-white">
                    {testimonials[activeTestimonial]?.name.slice(0, 1)}
                  </div>
                  <div>
                    <p className="text-xl font-semibold text-dark-950">{testimonials[activeTestimonial]?.name}</p>
                    <p className="text-sm text-dark-500">{testimonials[activeTestimonial]?.service}</p>
                  </div>
                </div>
                <div className="mt-6 flex items-center gap-1 text-warning">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="h-5 w-5 fill-current" />
                  ))}
                </div>
                <p className="mt-6 max-w-3xl text-xl leading-9 text-dark-700">“{testimonials[activeTestimonial]?.quote}”</p>
              </motion.article>
            </AnimatePresence>

            <div className="flex flex-row gap-3 lg:flex-col">
              {testimonials.map((item, index) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setActiveTestimonial(index)}
                  className={cn(
                    "h-3.5 w-12 rounded-full transition lg:h-12 lg:w-3.5",
                    activeTestimonial === index ? "bg-primary-600" : "bg-dark-200"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        id="worker-cta"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        className="section-shell py-golden-2xl"
      >
        <div className="grid items-center gap-golden-lg overflow-hidden rounded-[2.2rem] bg-dark-950 p-8 text-white shadow-glow lg:grid-cols-[1.1fr_0.9fr] lg:p-12">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary-200">{copy.workerCtaTitle}</p>
            <h2 className="mt-4 max-w-2xl text-4xl font-semibold">{copy.workerCtaTitle}</h2>
            <p className="mt-5 max-w-2xl text-body text-white/70">{copy.workerCtaBody}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              {copy.workerBenefits.map((item) => (
                <div key={item} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  {item}
                </div>
              ))}
            </div>

            <p className="mt-8 text-sm text-white/60">{copy.workerStats}</p>

            <Link
              href={`/${locale}/register/worker`}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700"
            >
              {copy.registerWorker}
              {isArabic ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
            </Link>
          </div>

          <div className="grid gap-4">
            <motion.div className="animate-float rounded-[1.7rem] border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-white/55">{isArabic ? "لوحة العامل" : "Worker dashboard"}</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.2rem] bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/45">{isArabic ? "طلبات اليوم" : "Today requests"}</p>
                  <p className="mt-3 text-2xl font-semibold">8</p>
                </div>
                <div className="rounded-[1.2rem] bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/45">{isArabic ? "الدخل" : "Earnings"}</p>
                  <p className="mt-3 text-2xl font-semibold">EGP 8,000</p>
                </div>
              </div>
            </motion.div>
            <div className="rounded-[1.7rem] border border-white/10 bg-gradient-to-br from-primary-600/20 to-white/5 p-5">
              <p className="text-sm text-white/55">{isArabic ? "تقدم التوثيق" : "Verification progress"}</p>
              <div className="mt-4 h-3 rounded-full bg-white/10">
                <div className="h-full w-4/5 rounded-full bg-primary-500" />
              </div>
              <p className="mt-3 text-sm text-white/70">{isArabic ? "80% مكتمل - خطوة أخيرة" : "80% complete - one step left"}</p>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        className="bg-dark-950 py-golden-2xl text-white"
      >
        <div className="section-shell grid items-center gap-golden-lg lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary-200">{copy.downloadTitle}</p>
            <h2 className="mt-4 text-4xl font-semibold">{copy.downloadTitle}</h2>
            <p className="mt-5 max-w-2xl text-body text-white/70">{copy.downloadBody}</p>

            <div className="mt-8 flex flex-wrap gap-4">
              <button className="rounded-[1.2rem] border border-white/10 bg-white/5 px-5 py-4 text-start">
                <p className="text-xs uppercase tracking-[0.24em] text-white/50">App Store</p>
                <p className="mt-2 text-lg font-semibold">iPhone</p>
              </button>
              <button className="rounded-[1.2rem] border border-white/10 bg-white/5 px-5 py-4 text-start">
                <p className="text-xs uppercase tracking-[0.24em] text-white/50">Google Play</p>
                <p className="mt-2 text-lg font-semibold">Android</p>
              </button>
            </div>
          </div>

          <div className="relative flex justify-center gap-6">
            <div className="relative h-[28rem] w-56 rounded-[2.4rem] border border-white/10 bg-white/5 p-4 shadow-card">
              <div className="h-full rounded-[2rem] bg-gradient-to-b from-white to-surface-soft p-4 text-dark-950">
                <div className="mb-4 h-2 w-20 rounded-full bg-dark-950/10" />
                <div className="rounded-[1.2rem] bg-dark-950 p-4 text-white">
                  <p className="text-sm text-white/55">OSTA</p>
                  <p className="mt-2 text-lg font-semibold">{isArabic ? "طلب جاري" : "Active request"}</p>
                </div>
                <div className="mt-4 space-y-3">
                  <div className="rounded-[1rem] bg-surface-soft p-4">
                    <p className="text-sm font-semibold">{isArabic ? "وصول العامل" : "Worker arrival"}</p>
                    <p className="mt-2 text-sm text-dark-500">{isArabic ? "خلال 12 دقيقة" : "Within 12 minutes"}</p>
                  </div>
                  <div className="rounded-[1rem] bg-surface-soft p-4">
                    <p className="text-sm font-semibold">{isArabic ? "الدفع المحمي" : "Protected payment"}</p>
                    <p className="mt-2 text-sm text-dark-500">Escrow enabled</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-10 hidden h-[24rem] w-48 rounded-[2.2rem] border border-white/10 bg-white/5 p-4 lg:block">
              <div className="h-full rounded-[1.8rem] bg-gradient-to-b from-primary-600 to-dark-950 p-4">
                <div className="mt-12 space-y-3">
                  <div className="rounded-[1rem] bg-white/10 p-4 text-white">{copy.comingSoon}</div>
                  <div className="rounded-[1rem] bg-white/10 p-4 text-white">{isArabic ? "رسائل فورية" : "Instant chat"}</div>
                  <div className="rounded-[1rem] bg-white/10 p-4 text-white">{isArabic ? "متابعة لحظية" : "Live tracking"}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        className="section-shell py-golden-2xl"
      >
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary-700">{copy.faqTitle}</p>
          <h2 className="mt-4 text-4xl font-semibold text-dark-950">{copy.faqTitle}</h2>
          <p className="mt-4 text-body text-dark-500">{copy.faqSubtitle}</p>
        </div>

        <div className="mt-10 grid gap-4">
          {copy.faqs.map(([question, answer], index) => {
            const isOpen = index === openFaq;

            return (
              <article key={question} className="overflow-hidden rounded-[1.6rem] border border-dark-200 bg-white shadow-sm">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? -1 : index)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-start"
                >
                  <span className="text-lg font-semibold text-dark-950">{question}</span>
                  <ChevronDown className={cn("h-5 w-5 text-dark-500 transition", isOpen && "rotate-180")} />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                    >
                      <p className="px-6 pb-6 text-body text-dark-500">{answer}</p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </article>
            );
          })}
        </div>
      </motion.section>

      <footer id="contact" className="bg-dark-950 py-12 text-white">
        <div className="section-shell grid gap-10 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <p className="font-serif text-3xl tracking-[0.22em]">OSTA</p>
            <p className="mt-4 max-w-sm text-body text-white/65">{copy.footerBody}</p>
            <div className="mt-6 flex items-center gap-3">
              {[Instagram, Facebook, Mail].map((Icon, index) => (
                <div key={index} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5">
                  <Icon className="h-4 w-4" />
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary-200">{copy.footerLinks.quick}</p>
            <div className="mt-5 grid gap-3 text-white/70">
              {[
                { label: copy.footerItems.quick[0], href: `/${locale}/services` },
                { label: copy.footerItems.quick[1], href: `/${locale}/how-it-works` },
                { label: copy.footerItems.quick[2], href: `/${locale}/about` },
                { label: copy.footerItems.quick[3], href: `/${locale}/contact` }
              ].map((item) => (
                <Link key={item.href} href={item.href as `/${string}`} className="hover:text-white">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary-200">{copy.footerLinks.workers}</p>
            <div className="mt-5 grid gap-3 text-white/70">
              {[
                { label: copy.footerItems.workers[0], href: `/${locale}/register/worker` },
                { label: copy.footerItems.workers[1], href: `/${locale}/faq` },
                { label: copy.footerItems.workers[2], href: `/${locale}/how-it-works` },
                { label: copy.footerItems.workers[3], href: `/${locale}/contact` }
              ].map((item) => (
                <Link key={item.href} href={item.href as `/${string}`} className="hover:text-white">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary-200">{copy.footerLinks.contact}</p>
            <div className="mt-5 grid gap-4 text-white/70">
              <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-primary-300" /> {copy.footerItems.contact[0]}</div>
              <div className="flex items-center gap-3"><Phone className="h-4 w-4 text-primary-300" /> {copy.footerItems.contact[1]}</div>
              <div className="flex items-center gap-3"><MapPin className="h-4 w-4 text-primary-300" /> {copy.footerItems.contact[2]}</div>
            </div>
          </div>
        </div>

        <div className="section-shell mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <p>{copy.footerBottom}</p>
          <div className="flex items-center gap-4">
            <Link href={`/${locale}/faq`} className="hover:text-white">{isArabic ? "FAQ" : "FAQ"}</Link>
            <Link href={`/${locale}/contact`} className="hover:text-white">{isArabic ? "Contact" : "Contact"}</Link>
            <LocaleSwitcher locale={locale} pathname="" className="font-semibold text-white" />
          </div>
        </div>
      </footer>
    </main>
  );
}
