"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, AlertCircle } from "lucide-react";

import { PublicShell } from "@/components/public/public-shell";
import { isLocale, type Locale } from "@/lib/locales";

export function NotFoundView() {
  const pathname = usePathname() || "";
  
  // Extract locale from pathname (e.g., "/ar/xyz" -> "ar")
  const segments = pathname.split("/");
  const potentialLocale = segments[1] || "";
  const locale: Locale = isLocale(potentialLocale) ? (potentialLocale as Locale) : "ar";
  const isArabic = locale === "ar";

  return (
    <PublicShell locale={locale} pathname="/404">
      <div className="section-shell min-h-[60vh] flex flex-col items-center justify-center py-20 text-center relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[350px] w-[350px] rounded-full bg-gold-500/10 blur-[100px] pointer-events-none" />

        <div className="relative z-10 space-y-8 max-w-lg">
          {/* Stylized Icon */}
          <div className="h-24 w-24 rounded-3xl bg-onyx-800 border border-onyx-700 flex items-center justify-center text-gold-500 mx-auto shadow-2xl animate-bounce">
            <AlertCircle className="h-12 w-12" />
          </div>

          <div className="space-y-4">
            <h1 className="text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-gold-500 to-amber-600 tracking-tight">
              404
            </h1>
            <h2 className="text-2xl md:text-3xl font-black text-white">
              {isArabic ? "عذراً، لم نجد هذه الصفحة" : "Oops! Page Not Found"}
            </h2>
            <p className="text-onyx-400 text-sm md:text-base leading-relaxed">
              {isArabic 
                ? "الصفحة التي تبحث عنها قد تكون تم نقلها، حذفها، أو أن الرابط غير صحيح." 
                : "The page you are looking for might have been removed, had its name changed, or is temporarily unavailable."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link 
              href={`/${locale}`}
              className="btn-gold h-14 px-8 w-full sm:w-auto flex items-center justify-center gap-2 text-base font-black rounded-2xl shadow-xl shadow-gold-500/10"
            >
              <Home className="h-5 w-5" />
              {isArabic ? "الرئيسية" : "Home"}
            </Link>
            <Link 
              href={`/${locale}/services`}
              className="btn-ghost h-14 px-8 w-full sm:w-auto flex items-center justify-center gap-2 text-base font-black rounded-2xl border-white/10 text-white hover:bg-white/5"
            >
              <Compass className="h-5 w-5 text-gold-500" />
              {isArabic ? "تصفح الخدمات" : "Browse Services"}
            </Link>
          </div>
        </div>
      </div>
    </PublicShell>
  );
}
