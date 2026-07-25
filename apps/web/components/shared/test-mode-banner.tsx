"use client";

import type { Locale } from "@/lib/locales";

export function TestModeBanner({ locale }: { locale: Locale }) {
  const isArabic = locale === "ar";

  return (
    <div className="relative z-30 w-full bg-gold-800 px-4 py-2 text-center shadow-sm">
      <p className="mx-auto max-w-5xl text-xs font-extrabold leading-snug tracking-wide text-white sm:text-sm">
        {isArabic
          ? "الموقع حاليًا في المرحلة التجريبية — يتوفر الآن تسجيل حسابات الفنيين والصنايعية فقط."
          : "This site is currently in the testing phase — only worker and pro registration is available for now."}
      </p>
    </div>
  );
}
