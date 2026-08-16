"use client";

import { useState } from "react";
import { Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/locales";
import { postApiData } from "@/lib/api";

type WaitlistModalProps = {
  isOpen: boolean;
  onClose: () => void;
  locale: Locale;
  role: "CLIENT" | "VENDOR";
};

export function WaitlistModal({ isOpen, onClose, locale, role }: WaitlistModalProps) {
  const isArabic = locale === "ar";
  const [phone, setPhone] = useState("+20");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await postApiData("/waitlist", { phone, email, role });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || (isArabic ? "حدث خطأ أثناء التسجيل" : "An error occurred"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn" style={{ zIndex: 9999 }}>
      <div className="relative w-full max-w-md bg-[#121212] border border-white/10 p-6 shadow-2xl">
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-black text-gold mb-2 uppercase tracking-wide">
          {isArabic ? "أخبرني عندما تكون متاحة" : "Inform me when available"}
        </h2>
        
        {success ? (
          <div className="py-8 text-center space-y-4">
            <div className="text-success font-bold">
              {isArabic ? "تم تسجيل بياناتك بنجاح. سنتواصل معك قريباً!" : "Your details have been saved. We will contact you soon!"}
            </div>
            <button
              onClick={onClose}
              type="button"
              className="mt-4 px-6 py-2 bg-gold text-black font-black uppercase text-sm"
            >
              {isArabic ? "إغلاق" : "Close"}
            </button>
          </div>
        ) : (
          <>
            <p className="text-white/70 text-sm mb-6">
              {isArabic
                ? "اترك بياناتك وسنقوم بإبلاغك فور إتاحة التسجيل."
                : "Leave your details and we will notify you as soon as registration is available."}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2 text-start">
                <label className="text-xs font-black uppercase tracking-widest text-white">
                  {isArabic ? "رقم الهاتف" : "Phone Number"}
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  dir="ltr"
                  className="h-11 w-full rounded-none border border-white/20 bg-black px-3 text-sm font-semibold text-white focus:border-gold outline-none"
                />
              </div>

              <div className="space-y-2 text-start">
                <label className="text-xs font-black uppercase tracking-widest text-white">
                  {isArabic ? "البريد الإلكتروني (اختياري)" : "Email (Optional)"}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 w-full rounded-none border border-white/20 bg-black px-3 text-sm font-semibold text-white focus:border-gold outline-none"
                />
              </div>

              {error && (
                <div className="text-red-500 text-xs font-bold">{error}</div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-4 h-11 bg-gold text-black font-black uppercase text-sm flex items-center justify-center gap-2 transition-transform active:scale-95"
                style={{ boxShadow: "3px 3px 0px #ffffff30" }}
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {isArabic ? "إرسال" : "Submit"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
