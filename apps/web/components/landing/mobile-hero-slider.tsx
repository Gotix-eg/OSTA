"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/locales";
import { resolveApiBaseUrl } from "@/lib/api";
import { ChevronLeft, ChevronRight } from "lucide-react";

// ─── Default mobile slides (yellow-theme, portrait-friendly) ───────────────
const DEFAULT_MOBILE_SLIDES = [
  {
    id: "m-slide-1",
    eyebrowAr: "منصة رقم 1 في مصر",
    eyebrowEn: "Egypt's #1 Platform",
    titleAr: "صنايعيك\nبنقرة واحدة",
    titleEn: "Your Pro\nin One Tap",
    descAr: "أمهر الفنيين والمتاجر الموثوقة في مصر.",
    descEn: "Top craftsmen and verified stores in Egypt.",
    imageUrl: "",
    btn1TextAr: "اطلب فني الآن",
    btn1TextEn: "Book a Pro",
    btn1Link: "/register/client",
    btn2TextAr: "انضم كصنايعي",
    btn2TextEn: "Join as Pro",
    btn2Link: "/register/worker",
    isActive: true,
  },
  {
    id: "m-slide-2",
    eyebrowAr: "دفع آمن • ضمان حقيقي",
    eyebrowEn: "Secure Pay • Real Guarantee",
    titleAr: "صيانة بدون\nقلق أو مفاجآت",
    titleEn: "Maintenance\nWorry-Free",
    descAr: "نظام Escrow يحمي أموالك حتى رضاك التام.",
    descEn: "Escrow payment keeps your money safe.",
    imageUrl: "",
    btn1TextAr: "اطلب الآن",
    btn1TextEn: "Order Now",
    btn1Link: "/register/client",
    btn2TextAr: "تصفح الخدمات",
    btn2TextEn: "Browse Services",
    btn2Link: "/services",
    isActive: true,
  },
];

function cleanImageUrl(url: string): string {
  if (!url) return "";
  let cleaned = url.trim();
  if (cleaned.startsWith("/") && cleaned.includes(".com")) {
    cleaned = "https://" + cleaned.substring(1);
  }
  if (
    !cleaned.startsWith("http://") &&
    !cleaned.startsWith("https://") &&
    !cleaned.startsWith("data:") &&
    !cleaned.startsWith("/")
  ) {
    cleaned = "https://" + cleaned;
  }
  return cleaned;
}

interface MobileHeroSliderProps {
  locale: Locale;
}

export function MobileHeroSlider({ locale }: MobileHeroSliderProps) {
  const isArabic = locale === "ar";
  const [slides, setSlides] = useState<any[]>(DEFAULT_MOBILE_SLIDES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  // Fetch mobile slides from API
  useEffect(() => {
    const baseUrl = resolveApiBaseUrl();
    fetch(`${baseUrl}/public/mobile-slides`)
      .then((r) => r.json())
      .then((payload) => {
        if (
          payload.success &&
          Array.isArray(payload.data) &&
          payload.data.length > 0
        ) {
          const active = payload.data.filter((s: any) => s.isActive !== false);
          setSlides(active.length > 0 ? active : DEFAULT_MOBILE_SLIDES);
        }
      })
      .catch(() => {});
  }, []);

  // Auto-advance
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides]);

  const goTo = (idx: number) => {
    setDirection(idx > currentIndex ? 1 : -1);
    setCurrentIndex(idx);
  };

  const goNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const goPrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const current = slides[currentIndex] || DEFAULT_MOBILE_SLIDES[0];

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({
      x: dir > 0 ? "-100%" : "100%",
      opacity: 0,
    }),
  };

  const isCampaign = current?.eyebrowAr === "إعلان ممول" || current?.eyebrowEn === "Sponsored Ad";

  if (isCampaign) {
    const linkUrl = current.btn1Link ? (current.btn1Link.startsWith("http") ? current.btn1Link : `/${locale}${current.btn1Link.startsWith("/") ? "" : "/"}${current.btn1Link}`) : "#";
    return (
      <div className="relative h-[430px] w-full overflow-hidden bg-black md:hidden">
        <Link href={linkUrl} className="absolute inset-0 z-30 cursor-pointer">
          {/* Background Image with cross-fade */}
          {slides.map((slide, idx) => (
            <div
              key={slide.id}
              className={cn(
                "absolute inset-0 bg-contain bg-no-repeat bg-center bg-black transition-opacity duration-700",
                idx === currentIndex ? "opacity-100" : "opacity-0"
              )}
              style={{
                backgroundImage: slide.imageUrl
                  ? `url('${cleanImageUrl(slide.imageUrl)}')`
                  : "none",
                backgroundColor: "#000000",
              }}
            />
          ))}
          {/* Small elegant Ad badge in the corner */}
          <div className="absolute top-4 right-4 z-40">
            <span className="border border-white/10 bg-black/70 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-gold shadow-md backdrop-blur-sm">
              {isArabic ? "ممول" : "Sponsored"}
            </span>
          </div>
        </Link>

        {/* Dots + nav overlaid on the bottom */}
        {slides.length > 1 && (
          <div className="absolute bottom-5 left-0 right-0 z-40 flex items-center justify-between px-5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                goPrev();
              }}
              className="flex h-9 w-9 items-center justify-center border border-white/10 bg-black/45 text-white transition-all active:scale-90"
              aria-label="Previous slide"
            >
              {isArabic ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </button>

            <div className="flex gap-2">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    goTo(idx);
                  }}
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    width: idx === currentIndex ? "2rem" : "0.5rem",
                    background:
                      idx === currentIndex
                        ? "white"
                        : "white/40",
                  }}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                goNext();
              }}
              className="flex h-9 w-9 items-center justify-center border border-white/10 bg-black/45 text-white transition-all active:scale-90"
              aria-label="Next slide"
            >
              {isArabic ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative h-[430px] w-full overflow-hidden bg-black md:hidden">
      {/* Background Image with cross-fade */}
      {slides.map((slide, idx) => (
        <div
          key={slide.id}
          className={cn(
            "absolute inset-0 bg-cover bg-center transition-opacity duration-700",
            idx === currentIndex ? "opacity-100" : "opacity-0"
          )}
          style={{
            backgroundImage: slide.imageUrl
              ? `url('${cleanImageUrl(slide.imageUrl)}')`
              : "none",
            backgroundColor: "#000000",
          }}
        />
      ))}

      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black via-black/55 to-transparent" />

      {/* Slide Content */}
      <div className="relative z-20 flex h-full flex-col justify-end px-5 pb-8 pt-12">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {/* Eyebrow */}
            <motion.span
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="mb-3 inline-block border border-gold/30 bg-black/65 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-gold backdrop-blur-sm"
            >
              {isArabic ? current.eyebrowAr : current.eyebrowEn}
            </motion.span>

            {/* Title */}
            <motion.h1
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="mb-2 max-w-[19rem] whitespace-pre-line text-4xl font-black leading-[1.05] text-white"
            >
              {isArabic ? current.titleAr : current.titleEn}
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-5 max-w-xs text-base font-bold leading-relaxed text-white/80"
            >
              {isArabic ? current.descAr : current.descEn}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="flex flex-wrap gap-3"
            >
              <Link
                href={current.btn1Link ? (current.btn1Link.startsWith("http") ? current.btn1Link : `/${locale}${current.btn1Link.startsWith("/") ? "" : "/"}${current.btn1Link}`) : "#"}
                className="inline-flex min-h-12 items-center justify-center bg-white px-7 py-3 text-sm font-black uppercase text-black shadow-[4px_4px_0_#000] transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
              >
                {isArabic ? current.btn1TextAr : current.btn1TextEn}
              </Link>

              {(current.btn2Link) && (
                <Link
                  href={current.btn2Link.startsWith("http") ? current.btn2Link : `/${locale}${current.btn2Link.startsWith("/") ? "" : "/"}${current.btn2Link}`}
                  className="inline-flex min-h-12 items-center justify-center border border-white/30 bg-black/45 px-5 py-3 text-sm font-black uppercase text-white backdrop-blur-sm transition-all active:scale-95"
                >
                  {isArabic ? current.btn2TextAr : current.btn2TextEn}
                </Link>
              )}
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Dots + nav */}
        {slides.length > 1 && (
          <div className="mt-5 flex items-center justify-between">
            <button
              onClick={goPrev}
              className="flex h-9 w-9 items-center justify-center border border-white/10 bg-black/45 text-white transition-all active:scale-90"
              aria-label="Previous slide"
            >
              {isArabic ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </button>

            <div className="flex gap-2">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goTo(idx)}
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    width: idx === currentIndex ? "2rem" : "0.5rem",
                    background: idx === currentIndex ? "#f5bd18" : "rgba(255,255,255,0.35)",
                  }}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={goNext}
              className="flex h-9 w-9 items-center justify-center border border-white/10 bg-black/45 text-white transition-all active:scale-90"
              aria-label="Next slide"
            >
              {isArabic ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
