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
    imageUrl: "/mobile_slide_1.png",
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
    imageUrl: "/mobile_slide_2.png",
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

  return (
    <div className="relative w-full overflow-hidden md:hidden" style={{ minHeight: "88svh" }}>
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
            backgroundColor: "oklch(93% 0.12 85)", // fallback
          }}
        />
      ))}

      {/* Gradient overlay - bottom fade for text readability */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background:
            "linear-gradient(to top, oklch(92% 0.10 85) 0%, oklch(92% 0.10 85 / 0.85) 35%, oklch(92% 0.10 85 / 0.3) 65%, transparent 100%)",
        }}
      />

      {/* Slide Content */}
      <div className="relative z-20 flex flex-col justify-end h-full px-6 pb-28 pt-20" style={{ minHeight: "88svh" }}>
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
              className="inline-block mb-3 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest"
              style={{
                background: "oklch(45% 0.11 85)",
                color: "white",
              }}
            >
              {isArabic ? current.eyebrowAr : current.eyebrowEn}
            </motion.span>

            {/* Title */}
            <motion.h1
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="text-4xl font-black leading-tight mb-3 whitespace-pre-line"
              style={{ color: "oklch(10% 0.005 60)" }}
            >
              {isArabic ? current.titleAr : current.titleEn}
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-base mb-6 leading-relaxed max-w-xs"
              style={{ color: "oklch(25% 0.01 60)" }}
            >
              {isArabic ? current.descAr : current.descEn}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="flex flex-col gap-3"
            >
              <Link
                href={`/${locale}${current.btn1Link}`}
                className="block w-full text-center py-4 px-6 rounded-2xl text-base font-extrabold shadow-lg transition-all active:scale-95"
                style={{
                  background: "oklch(10% 0.005 60)",
                  color: "oklch(93% 0.005 60)",
                }}
              >
                {isArabic ? current.btn1TextAr : current.btn1TextEn}
              </Link>

              {(current.btn2Link) && (
                <Link
                  href={`/${locale}${current.btn2Link}`}
                  className="block w-full text-center py-4 px-6 rounded-2xl text-base font-extrabold border-2 transition-all active:scale-95"
                  style={{
                    borderColor: "oklch(10% 0.005 60 / 0.25)",
                    color: "oklch(10% 0.005 60)",
                    background: "oklch(10% 0.005 60 / 0.06)",
                  }}
                >
                  {isArabic ? current.btn2TextAr : current.btn2TextEn}
                </Link>
              )}
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Dots + nav */}
        {slides.length > 1 && (
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={goPrev}
              className="h-10 w-10 rounded-full flex items-center justify-center transition-all active:scale-90"
              style={{
                background: "oklch(10% 0.005 60 / 0.1)",
                color: "oklch(10% 0.005 60)",
              }}
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
                    background:
                      idx === currentIndex
                        ? "oklch(10% 0.005 60)"
                        : "oklch(10% 0.005 60 / 0.25)",
                  }}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={goNext}
              className="h-10 w-10 rounded-full flex items-center justify-center transition-all active:scale-90"
              style={{
                background: "oklch(10% 0.005 60 / 0.1)",
                color: "oklch(10% 0.005 60)",
              }}
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
