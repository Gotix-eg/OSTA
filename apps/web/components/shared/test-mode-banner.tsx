"use client";

import type { Locale } from "@/lib/locales";

export function TestModeBanner({ locale }: { locale: Locale }) {
  const isArabic = locale === "ar";

  return (
    <div className="w-full bg-gold-800 px-4 py-2.5 text-center">
      <p className="text-xs font-extrabold tracking-wide text-white sm:text-sm md:whitespace-nowrap">
        {isArabic
          ? "الموقع حاليًا في المرحلة التجريبية — سجّل الآن كعميل أو فني أو مورد."
          : "This site is currently in the testing phase — register now as a client, technician, or vendor."}
      </p>
    </div>
  );
}
