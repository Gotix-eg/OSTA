"use client";

import { usePathname } from "next/navigation";

import type { Locale } from "@/lib/locales";

export function TestModeBanner({ locale }: { locale: Locale }) {
  const isArabic = locale === "ar";
  const pathname = usePathname();
  const dashboardPathPattern = /^\/(?:ar|en)\/(?:client|worker|vendor|admin)(?:\/|$)/;
  const authPathPattern = /^\/(?:ar|en)\/(?:login|register|forgot-password|verify-otp)(?:\/|$)/;

  if (dashboardPathPattern.test(pathname || "") || authPathPattern.test(pathname || "")) {
    return null;
  }

  return (
    <div className="w-full bg-gold-800 px-4 py-2.5 text-center">
      <p className="text-xs font-extrabold tracking-wide text-white sm:text-sm md:whitespace-nowrap">
        {isArabic
          ? "الموقع حاليًا في المرحلة التجريبية — يتوفر الآن تسجيل حسابات الفنيين والصنايعية فقط."
          : "This site is currently in the testing phase — only worker and pro registration is available for now."}
      </p>
    </div>
  );
}
