"use client";

import React, { useEffect, useState } from "react";
import { Download, Smartphone, CheckCircle2, Share, PlusSquare, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Locale } from "@/lib/locales";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstallButton({
  locale = "ar",
  className = "",
  variant = "default",
}: {
  locale?: Locale;
  className?: string;
  variant?: "default" | "compact" | "badge";
}) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIosModal, setShowIosModal] = useState(false);
  const isArabic = locale === "ar";

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check standalone mode
    const isStandaloneApp =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    if (isStandaloneApp) {
      setIsStandalone(true);
      return;
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setIsStandalone(true);
        setDeferredPrompt(null);
      }
    } else {
      setShowIosModal(true);
    }
  };

  if (isStandalone) {
    return (
      <div className={`inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-400 ${className}`}>
        <CheckCircle2 className="h-4 w-4" />
        <span>{isArabic ? "التطبيق مضاف للشاشة" : "App Installed"}</span>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handleClick}
        className={
          className ||
          `inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 px-4 py-2.5 text-xs font-extrabold text-onyx-950 shadow-md transition-all hover:brightness-110 active:scale-95`
        }
      >
        <Smartphone className="h-4 w-4 animate-bounce" />
        <span>{isArabic ? "إضافة للشاشة الرئيسية 📲" : "Add to Home Screen 📲"}</span>
      </button>

      {/* iOS & General Install Guide Modal */}
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
                  {isArabic ? "تثبيت أُسطفاي على الموبايل 📲" : "Install Ostafy on Mobile 📲"}
                </h3>
                <p className="mt-1 text-xs text-onyx-300">
                  {isArabic
                    ? "أضف الموقع على شاشة الموبايل للوصول السريع واستقبال الإشعارات مباشرة:"
                    : "Add to home screen for quick access and instant notifications:"}
                </p>

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
                          ? "موجود أسفل أو أعلى المتصفح (Safari / Chrome)."
                          : "Located at the bottom or top of your browser."}
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
                          ? "اختر 'إضافة إلى الشاشة الرئيسية' أو 'Add to Home Screen'."
                          : "Choose 'Add to Home Screen'."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold-500/20 text-gold-400 font-bold text-sm">
                      3
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-white flex items-center gap-1.5">
                        {isArabic ? "اضغط إضافة (Add)" : "Tap Add"}
                        <CheckCircle2 className="h-4 w-4 text-gold-400 inline" />
                      </p>
                      <p className="text-[11px] text-onyx-400">
                        {isArabic
                          ? "ستظهر أيقونة أُسطفاي على شاشة الموبايل كأنه تطبيق تماماً!"
                          : "Ostafy icon will appear on your home screen like a native app!"}
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
