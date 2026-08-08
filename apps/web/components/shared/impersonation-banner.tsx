"use client";

import { useState, useEffect } from "react";
import { ShieldAlert, LogOut, Loader2 } from "lucide-react";
import { postApiData } from "@/lib/api";
import type { Locale } from "@/lib/locales";

export function ImpersonationBanner({ locale }: { locale: Locale }) {
  const isArabic = locale === "ar";
  const [impersonatingName, setImpersonatingName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof document !== "undefined") {
      const match = document.cookie.match(/(?:^|; )osta_impersonating_name=([^;]*)/);
      if (match && match[1]) {
        try {
          setImpersonatingName(decodeURIComponent(match[1]));
        } catch (e) {
          setImpersonatingName(match[1]);
        }
      }
    }
  }, []);

  if (!impersonatingName) return null;

  const handleStopImpersonation = async () => {
    setLoading(true);
    try {
      await postApiData<{ redirectUrl?: string }, any>("/auth/stop-impersonation", {});
      window.location.assign(`/${locale}/admin/workers`);
    } catch (err) {
      try {
        await postApiData<any, any>(`/admin/stop-impersonation`, {});
      } catch (e) {}
      window.location.assign(`/${locale}/admin/workers`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-onyx-950 px-6 py-3 font-bold text-xs flex flex-wrap items-center justify-between gap-4 shadow-2xl z-[99999] relative border-b-2 border-onyx-950">
      <div className="flex items-center gap-3 text-sm font-black">
        <ShieldAlert className="h-5 w-5 shrink-0 text-onyx-950 animate-pulse" />
        <span>
          {isArabic 
            ? `وضع محاكاة الأدمن: أنت تسجل الدخول حالياً بحساب الصنايعي (${impersonatingName}) وتستطيع معاينة وتعديل الملف بالكامل` 
            : `Admin Impersonation Mode: Logged in as worker (${impersonatingName}) to view and edit profile`}
        </span>
      </div>
      <button
        type="button"
        onClick={handleStopImpersonation}
        disabled={loading}
        className="inline-flex items-center gap-2 bg-onyx-950 text-gold-400 border border-gold-500/40 px-4 py-2 rounded-xl text-xs font-black hover:bg-onyx-900 transition-all cursor-pointer shadow-lg hover:scale-105 shrink-0"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin text-gold-400" /> : <LogOut className="h-4 w-4 text-gold-400" />}
        <span>{isArabic ? "إنهاء المحاكاة والعودة لـ لوحة الأدمن" : "Exit Impersonation & Return to Admin"}</span>
      </button>
    </div>
  );
}
