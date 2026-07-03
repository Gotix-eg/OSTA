"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, MessageSquare, X, Shield, Sparkles } from "lucide-react";
import type { Locale } from "@/lib/locales";
import { cn } from "@/lib/utils";

export function FloatingSupport({ locale }: { locale: Locale }) {
  const isArabic = locale === "ar";
  const [isOpen, setIsOpen] = useState(false);

  // WhatsApp Support Number and custom greeting message
  const whatsappNumber = "201009410112";
  const welcomeText = isArabic 
    ? encodeURIComponent("مرحباً دعم أُسطفاي، أرغب في الاستفسار عن خدمات المنصة.")
    : encodeURIComponent("Hello Ostafy Support, I'd like to inquire about the platform services.");
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${welcomeText}`;
  const emailUrl = "mailto:info@ostafy.com?subject=Ostafy%20Support%20Request";

  return (
    <div className={cn(
      "fixed z-[9999] flex flex-col gap-4 font-sans transition-all duration-300 ease-out",
      "md:bottom-6 md:right-6 md:left-auto md:top-auto md:items-end md:translate-x-0",
      isOpen 
        ? "bottom-0 left-0 right-0 top-auto w-full items-center translate-x-0" 
        : "bottom-auto top-[45%] right-0 left-auto items-end translate-x-[40%] hover:translate-x-0 focus:translate-x-0 active:translate-x-0"
    )}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: "100%", scale: 1 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: "100%", scale: 1 }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="border border-white/10 bg-onyx-950/95 backdrop-blur-2xl p-6 shadow-2xl shadow-black/50
              md:absolute md:bottom-20 md:right-0 md:left-auto md:w-80 md:rounded-[2rem]
              fixed bottom-0 left-0 right-0 w-full rounded-t-[2.5rem] rounded-b-none"
          >
            {/* Drag handle for mobile */}
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-white/15 md:hidden" />

            {/* Header */}
            <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-500 border border-gold-500/20">
                  <Shield className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">
                    {isArabic ? "الدعم الفني لأُسطفاي" : "Ostafy Support"}
                  </h4>
                  <p className="text-[10px] text-onyx-400 font-bold uppercase tracking-wider">
                    {isArabic ? "متاحون لمساعدتك دائماً" : "We're here to help"}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-onyx-400 hover:text-white transition-colors p-1 hover:bg-white/5 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Description */}
            <p className="text-xs text-onyx-300 mb-5 leading-relaxed">
              {isArabic 
                ? "أهلاً بك! نسعد بخدمتك. يمكنك التواصل معنا مباشرة لحل أي مشكلة أو الرد على استفساراتك."
                : "Welcome! We're glad to serve you. Reach out to us directly for help or inquiries."}
            </p>

            {/* Support Actions */}
            <div className="space-y-3">
              {/* WhatsApp Support Button */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 w-full p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-sm transition-all duration-300 shadow-lg shadow-emerald-600/15 hover:-translate-y-0.5"
              >
                <div className="bg-white/20 p-2 rounded-xl">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.859-4.42 9.863-9.864.002-2.637-1.023-5.115-2.887-6.979C16.582 1.9 14.1 1.05 11.999 1.05c-5.444 0-9.866 4.42-9.87 9.867a9.81 9.81 0 001.5 5.17l-.988 3.606 3.692-.969zm10.741-6.155c-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.668.149-.198.297-.766.967-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.15-.173.198-.297.298-.495.099-.198.05-.371-.025-.521-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  </svg>
                </div>
                <div className="text-start">
                  <span className="block text-xs text-emerald-100 font-bold opacity-80">{isArabic ? "واتساب سريع" : "Instant WhatsApp"}</span>
                  <span>{isArabic ? "تواصل عبر واتساب" : "Chat on WhatsApp"}</span>
                </div>
              </a>

              {/* Email Support Button */}
              <a
                href={emailUrl}
                className="flex items-center gap-3 w-full p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-gold-500/30 hover:bg-gold-500/[0.03] text-white font-extrabold text-sm transition-all duration-300 shadow-lg hover:-translate-y-0.5 group"
              >
                <div className="bg-white/5 p-2 rounded-xl text-gold-500 group-hover:bg-gold-500 group-hover:text-onyx-950 transition-colors">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="text-start">
                  <span className="block text-xs text-onyx-400 font-bold tracking-wide group-hover:text-gold-500 transition-colors">
                    {isArabic ? "البريد الإلكتروني" : "Email Support"}
                  </span>
                  <span className="font-extrabold group-hover:text-gold-400 transition-colors">info@ostafy.com</span>
                </div>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Floating Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="h-16 w-16 rounded-full bg-gradient-to-tr from-gold-600 to-gold-400 hover:from-gold-500 hover:to-gold-300 text-onyx-950 flex items-center justify-center shadow-xl shadow-gold-500/20 relative group overflow-hidden border border-gold-400/20"
      >
        <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        
        {/* Radar pulsating background glow */}
        <span className="absolute -inset-1 rounded-full bg-gold-500/20 animate-ping opacity-60 pointer-events-none" />

        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="h-7 w-7" />
            </motion.div>
          ) : (
            <motion.div
              key="support"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <MessageSquare className="h-7 w-7" />
              <span className="absolute -top-1 -end-1 h-3.5 w-3.5 bg-emerald-500 border-2 border-onyx-950 rounded-full" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
