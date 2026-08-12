"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Smartphone, Share, PlusSquare, X, CheckCircle2, Sparkles, Download, ArrowDown } from "lucide-react";
import type { Locale } from "@/lib/locales";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstallPrompt({ locale = "ar" }: { locale?: Locale }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showIosModal, setShowIosModal] = useState(false);
  const isArabic = locale === "ar";

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Check if already installed as PWA / Standalone
    const isStandaloneApp =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    if (isStandaloneApp) {
      setIsStandalone(true);
      return;
    }

    // 2. Detect mobile device & iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isMobileDevice =
      /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent) ||
      window.innerWidth <= 768;
    setIsIOS(iosDevice);

    // 3. Listen to Android / Desktop Chrome beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // 4. Show prompt banner ONLY on mobile devices if user hasn't dismissed it in the last 24h
    const dismissedAt = localStorage.getItem("osta_pwa_install_dismissed");
    const hoursSinceDismissed = dismissedAt
      ? (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60)
      : 999;

    if (isMobileDevice && hoursSinceDismissed > 24) {
      const timer = setTimeout(() => setShowBanner(true), 2500);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      };
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Android / Chrome / Edge direct prompt
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setShowBanner(false);
        setDeferredPrompt(null);
      }
    } else if (isIOS) {
      // Show iOS step-by-step visual instructions
      setShowIosModal(true);
    } else {
      // Generic browser fallback: show iOS/General instructions modal
      setShowIosModal(true);
    }
  };

  const dismissBanner = () => {
    setShowBanner(false);
    localStorage.setItem("osta_pwa_install_dismissed", Date.now().toString());
  };

  if (isStandalone) return null;

  return (
    <>
      {/* Floating Bottom Installation Banner */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ opacity: 0, y: 80, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 80, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-4 left-3 right-3 z-[9990] mx-auto max-w-lg rounded-2xl border border-gold-500/40 bg-onyx-950/95 p-3.5 shadow-2xl backdrop-blur-xl md:left-auto md:right-6 md:w-96"
          >
            <div className="flex items-start gap-3">
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-gold-400/20 to-gold-600/30 border border-gold-500/50 text-gold-400 shadow-inner">
                <img src="/icon-192.png" alt="Osta Icon" className="h-8 w-8 rounded-xl object-contain shadow-md" />
                <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gold-500 text-onyx-950">
                  <Sparkles className="h-2.5 w-2.5" />
                </span>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-white">
                    {isArabic ? "أَضِف أُسطفاي لشاشة الموبايل 📲" : "Add Ostafy to Home Screen 📲"}
                  </h4>
                  <span className="rounded-md bg-gold-500/20 border border-gold-500/30 px-1.5 py-0.5 text-[9px] font-extrabold text-gold-400">
                    PWA
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-onyx-300 leading-relaxed">
                  {isArabic
                    ? "تصفح أسرع وإشعارات فورية على شاشتك بدون الحاجة لتحميل تطبيق من المتجر!"
                    : "Faster access and instant notifications directly on your home screen!"}
                </p>

                <div className="mt-2.5 flex items-center gap-2">
                  <button
                    onClick={handleInstallClick}
                    className="flex-1 rounded-xl bg-gradient-to-r from-gold-500 via-gold-400 to-gold-600 px-3 py-2 text-xs font-black text-onyx-950 shadow-md transition-all hover:brightness-110 active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <Download className="h-3.5 w-3.5" />
                    {isArabic ? "إضافة للشاشة الرئيسية" : "Add to Home Screen"}
                  </button>
                  <button
                    onClick={dismissBanner}
                    className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-2 text-xs font-medium text-onyx-300 hover:bg-white/10 hover:text-white transition-all"
                  >
                    {isArabic ? "لاحقاً" : "Later"}
                  </button>
                </div>
              </div>

              <button
                onClick={dismissBanner}
                className="text-onyx-400 hover:text-white transition-colors p-1"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* iOS & Manual Installation Instructions Modal */}
      <AnimatePresence>
        {showIosModal && (
          <div className="fixed inset-0 z-[10000] flex items-end justify-center sm:items-center bg-black/80 backdrop-blur-md p-4">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="relative w-full max-w-md rounded-3xl border border-gold-500/40 bg-onyx-950 p-6 shadow-2xl text-white"
            >
              <button
                onClick={() => setShowIosModal(false)}
                className="absolute top-4 left-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-gold-400/20 to-gold-600/30 border border-gold-500/50 shadow-inner mb-4">
                  <img src="/icon-192.png" alt="Osta" className="h-10 w-10 rounded-2xl object-contain" />
                </div>

                <h3 className="text-base font-bold text-white">
                  {isArabic ? "إضافة أُسطفاي إلى الشاشة الرئيسية 📱" : "Add Ostafy to Home Screen 📱"}
                </h3>
                <p className="mt-1 text-xs text-onyx-300">
                  {isArabic
                    ? "اتبع الخطوات البسيطة التالية لإضافة الأيقونة واستقبال الإشعارات:"
                    : "Follow these simple steps to add the app icon and receive notifications:"}
                </p>

                {/* Steps */}
                <div className="mt-5 w-full space-y-3 text-right">
                  <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold-500/20 text-gold-400 font-bold text-sm">
                      1
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-white flex items-center gap-1.5">
                        {isArabic ? "اضغط على زر المشاركة" : "Tap the Share button"}
                        <Share className="h-4 w-4 text-gold-400 inline" />
                      </p>
                      <p className="text-[11px] text-onyx-400">
                        {isArabic
                          ? "موجود في أسفل شاشة المتصفح (Safari) أو أعلاها."
                          : "Located at the bottom or top of your Safari browser."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold-500/20 text-gold-400 font-bold text-sm">
                      2
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-white flex items-center gap-1.5">
                        {isArabic ? "اختر إضافة إلى الشاشة الرئيسية" : "Select Add to Home Screen"}
                        <PlusSquare className="h-4 w-4 text-gold-400 inline" />
                      </p>
                      <p className="text-[11px] text-onyx-400">
                        {isArabic
                          ? "مرر القائمة لأسفل ثم اضغط على 'Add to Home Screen'."
                          : "Scroll down the menu and tap 'Add to Home Screen'."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold-500/20 text-gold-400 font-bold text-sm">
                      3
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-white flex items-center gap-1.5">
                        {isArabic ? "اضغط على إضافة (Add)" : "Tap Add"}
                        <CheckCircle2 className="h-4 w-4 text-gold-400 inline" />
                      </p>
                      <p className="text-[11px] text-onyx-400">
                        {isArabic
                          ? "ستظهر أيقونة التطبيق فوراً على شاشة الموبايل مع تفعيل الإشعارات!"
                          : "The app icon will instantly appear on your home screen with notifications enabled!"}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowIosModal(false)}
                  className="mt-6 w-full rounded-2xl bg-gradient-to-r from-gold-500 to-gold-600 py-3 text-xs font-bold text-onyx-950 shadow-lg hover:brightness-110 active:scale-95 transition-all"
                >
                  {isArabic ? "حسناً، فهمت" : "Got it!"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
