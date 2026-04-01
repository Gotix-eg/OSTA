import type { ReactNode } from "react";

import Link from "next/link";

import { LocaleSwitcher } from "@/components/shared/locale-switcher";
import type { Locale } from "@/lib/locales";

interface AuthShellProps {
  locale: Locale;
  pathname: string;
  title: string;
  description: string;
  children: ReactNode;
}

export function AuthShell({ locale, pathname, title, description, children }: AuthShellProps) {
  const isArabic = locale === "ar";

  return (
    <main className="relative min-h-screen overflow-hidden bg-surface-base text-dark-950">
      <div className="absolute inset-0 bg-halo opacity-80" />
      <div className="absolute inset-0 bg-lattice bg-[size:42px_42px] opacity-25" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full gap-golden-lg lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-[2rem] border border-white/50 bg-dark-950 p-8 text-white shadow-glow sm:p-10 lg:p-12">
            <div className="mb-8 flex items-center justify-between">
              <Link href={`/${locale}`} className="font-serif text-2xl tracking-[0.2em] text-surface-base">
                OSTA
              </Link>
              <LocaleSwitcher
                locale={locale}
                pathname={pathname}
                className="rounded-full border border-white/20 px-4 py-2 text-sm font-medium transition hover:border-white/50 hover:bg-white/10"
              />
            </div>
            <span className="inline-flex rounded-full border border-primary-400/40 bg-primary-600/15 px-4 py-2 text-xs uppercase tracking-[0.28em] text-primary-100">
              {isArabic ? "منصة حجز موثوقة" : "Trusted Booking Platform"}
            </span>
            <h1 className="mt-6 max-w-lg text-4xl font-semibold leading-tight sm:text-5xl">{title}</h1>
            <p className="mt-4 max-w-xl text-base leading-8 text-white/70">{description}</p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                [isArabic ? "توثيق شامل" : "Full verification", isArabic ? "مستندات + هوية" : "Docs + identity"],
                [isArabic ? "دفع محمي" : "Protected payments", isArabic ? "نظام حجز آمن" : "Escrow-style flow"],
                [isArabic ? "دعم سريع" : "Fast support", isArabic ? "فريق متابع" : "Human follow-up"]
              ].map(([label, value]) => (
                <div key={label} className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <p className="text-sm text-white/55">{label}</p>
                  <p className="mt-2 text-lg font-medium text-white">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={`/${locale}/dashboards`}
                className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                {isArabic ? "dashboards" : "Dashboards"}
              </Link>
              <Link
                href={`/${locale}`}
                className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                {isArabic ? "home" : "Home"}
              </Link>
            </div>
          </section>

          <section className="rounded-[2rem] border border-dark-200/70 bg-white/90 p-6 shadow-card backdrop-blur sm:p-8 lg:p-10">
            {children}
          </section>
        </div>
      </div>
    </main>
  );
}
