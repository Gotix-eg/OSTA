"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Activity, CircleHelp, FileWarning, Home, Lock, Menu, Scale, Shield, ShieldCheck, Headphones, Store, User, Wrench } from "lucide-react";
import type { Locale } from "@/lib/locales";
import { PublicShell } from "@/components/public/public-shell";

interface AuthShellProps {
  locale: Locale;
  pathname: string;
  title: string;
  description: string;
  children: ReactNode;
}

export function AuthShell({ locale, pathname, title, description, children }: AuthShellProps) {
  const isArabic = locale === "ar";
  const isLogin = pathname === "/login";
  const isRegisterChoice = pathname === "/register" || pathname.endsWith("/register");

  const heading = isLogin
    ? (isArabic ? "أهلاً بك" : "WELCOME BACK")
    : pathname.includes("/register/client")
      ? (isArabic ? "إنشاء حساب عميل" : "CREATE CLIENT ACCOUNT")
      : pathname.includes("/register/worker")
        ? (isArabic ? "إنشاء حساب فني" : "CREATE WORKER ACCOUNT")
        : pathname.includes("/register/vendor")
          ? (isArabic ? "إنشاء حساب مورد" : "CREATE VENDOR ACCOUNT")
          : isRegisterChoice
            ? (isArabic ? "إنشأ حسابك علي أُسطفاي" : "CREATE YOUR ACCOUNT")
            : null;



  const photoSrc = pathname.includes("/register/client")
    ? "/images/auth-client.jpg"
    : pathname.includes("/register/worker")
    ? "/images/auth-worker.jpg"
    : pathname.includes("/register/vendor")
    ? "/images/auth-vendor.jpg"
    : "https://lh3.googleusercontent.com/aida-public/AB6AXuAbfJ-2IS0360vqfuhA-1NqheG3brCUZN76EodMJBKF9vokisslyWi0g1RYa1pqwr0_MOFfrHqLJJDwj3228wWUnrA02sMvWtljZz34nlB9m-lPPKzi9OW3vEu7MFeoJLIwwivipO15TWmhDAjdkRYMHCDAyy6fYNcv6MbRjHrrdWErxNnDtkkgN5nR94neVSIhHYNfrmkUUhNIzrBXIdYsaC3zHiCQ35GBv_nPGbiEWpTnd7ULVnkTwOVpH-yyfmCAUcDgTzMPvOE";

  return (
    <PublicShell locale={locale} pathname={pathname}>
      <div className="flex items-center justify-center py-6 md:py-10 px-4 bg-gold min-h-[60vh]">
        <div
          className="relative z-10 grid w-full max-w-xl grid-cols-1 overflow-hidden border border-white/10 bg-black md:max-w-5xl md:grid-cols-2 md:h-[560px] text-start rounded-none"
          dir={isArabic ? "rtl" : "ltr"}
        >
          <div className="relative hidden md:block h-full w-full overflow-hidden">
            <img
              src={photoSrc}
              alt="Ostafy Auth"
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
          </div>

          <div
            className="flex flex-col justify-center p-4 sm:p-5 md:px-7 md:py-5 md:h-full md:overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{ backgroundColor: "#000000" }}
            dir={isArabic ? "rtl" : "ltr"}
          >
            {heading && (
              <div className="mb-2 flex items-center gap-2 text-center md:text-start">
                {pathname.includes("/register/vendor") && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center border border-gold bg-gold/10 text-gold">
                    <Store className="h-4 w-4" />
                  </div>
                )}
                {pathname.includes("/register/worker") && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center border border-gold bg-gold/10 text-gold">
                    <Wrench className="h-4 w-4" />
                  </div>
                )}
                {pathname.includes("/register/client") && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center border border-gold bg-gold/10 text-gold">
                    <User className="h-4 w-4" />
                  </div>
                )}
                <h1 className="whitespace-nowrap text-lg font-black uppercase leading-tight text-gold md:text-xl">
                  {heading}
                </h1>
              </div>
            )}

            {children}
          </div>
        </div>
      </div>
    </PublicShell>
  );
}

export function AdminAuthShell({ locale, children }: { locale: Locale; children: ReactNode }) {
  const isArabic = locale === "ar";
  const labels = {
    brand: isArabic ? "إدارة أوستا" : "OSTA ADMIN",
    status: isArabic ? "حالة النظام: مستقرة" : "System Status: Optimal",
    title: isArabic ? "دخول آمن" : "Secure Access",
    tier: isArabic ? "مستوى النظام: تحقق إداري متقدم" : "System Level: Tier 1 Auth Required",
    ssl: isArabic ? "تشفير SSL آمن نشط" : "Secure SSL Encryption Active",
    node: isArabic ? "بوابة الاتصال" : "Gateway Node",
    region: isArabic ? "نطاق الوصول" : "Access Region",
    legal: isArabic ? "السياسات" : "Legal",
    breach: isArabic ? "بوابة البلاغات" : "Breach Portal",
    copyright: isArabic ? "© 2026 أنظمة أوستا الآمنة" : "© 2026 OSTA Secure Systems",
    mobileTitle: isArabic ? "بوابة التحكم" : "Access Control",
    watermark: isArabic ? "بوابة آمنة" : "SECURE PORTAL",
    mobileCopy: isArabic
      ? "الوصول إلى هذا النظام مقصور على موظفي أوستا المخولين فقط. يتم تسجيل كل الأنشطة ومراجعتها."
      : "Access to this system is restricted to authorized OSTA personnel only. All activities are logged and monitored."
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#0a0a0a] text-white" dir={isArabic ? "rtl" : "ltr"}>
      <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:radial-gradient(rgba(245,189,24,0.12)_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="pointer-events-none absolute bottom-[8%] end-[-8%] hidden select-none text-[9rem] font-black uppercase leading-none text-white/[0.03] -rotate-12 sm:block lg:text-[13rem]">
        {labels.watermark}
      </div>

      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-[#0a0a0a]/80 px-4 py-5 backdrop-blur-md md:px-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="h-8 w-2 bg-gold" />
            <a href={`/${locale}`} className="flex items-center gap-3">
              <img src="/logo.svg" alt="OSTA Logo" className="h-8 w-auto brightness-0 invert" />
              <span className="text-xl font-black uppercase tracking-tight text-gold md:text-2xl">{labels.brand}</span>
            </a>
          </div>
          <div className="flex items-center gap-5 md:gap-8">
            <div className="hidden items-center gap-2 border border-gold/20 bg-gold/5 px-4 py-1.5 md:flex">
              <span className="h-2 w-2 animate-pulse rounded-full bg-gold shadow-[0_0_8px_#f5bd18]" />
              <span className="text-[11px] font-black uppercase tracking-[0.18em] text-gold">{labels.status}</span>
            </div>
            <div className="flex items-center gap-4 text-white/55">
              <Lock className="h-5 w-5 transition-colors hover:text-gold" />
              <CircleHelp className="h-5 w-5 transition-colors hover:text-gold" />
            </div>
          </div>
        </div>
      </header>

      <section className="relative z-10 flex min-h-screen items-center justify-center px-4 pb-28 pt-24 md:pb-24">
        <div className="w-full max-w-md">
          <div className="relative overflow-hidden border border-gold/10 bg-[#111111] p-6 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] md:p-12">
            <Shield className="pointer-events-none absolute end-4 top-4 h-16 w-16 text-gold/20 md:h-20 md:w-20" />

            <div className="mb-9 text-center md:mb-10">
              <img src="/logo.svg" alt="OSTA Logo" className="mx-auto mb-5 h-10 w-auto brightness-0 invert" />
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center bg-gold text-black shadow-[4px_4px_0_#fff] md:shadow-none">
                <ShieldCheck className="h-9 w-9" />
              </div>
              <h1 className="text-3xl font-black uppercase tracking-widest text-white md:text-4xl">
                <span className="hidden md:inline">{labels.title}</span>
                <span className="md:hidden">{labels.mobileTitle}</span>
              </h1>
              <div className="mt-4 inline-flex items-center gap-2 border border-white/10 bg-white/5 px-3 py-1">
                <Activity className="h-4 w-4 text-gold" />
                <p className="text-[11px] font-black uppercase tracking-tight text-white/70">{labels.tier}</p>
              </div>
            </div>

            {children}

            <div className="mt-10 border-t border-white/5 pt-7 md:mt-12 md:pt-8">
              <div className="mb-7 flex items-center justify-center gap-3 text-white/60 md:mb-8">
                <ShieldCheck className="h-5 w-5 text-gold" />
                <span className="text-[11px] font-black uppercase tracking-[0.18em]">{labels.ssl}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-white/5 bg-black/50 p-4 text-center">
                  <p className="mb-1 text-[10px] font-black uppercase tracking-tight text-white/30">{labels.node}</p>
                  <p className="text-sm font-black uppercase text-gold">OS-PRIME-01</p>
                </div>
                <div className="border border-white/5 bg-black/50 p-4 text-center">
                  <p className="mb-1 text-[10px] font-black uppercase tracking-tight text-white/30">{labels.region}</p>
                  <p className="text-sm font-black uppercase text-gold">GLOBAL-SEC</p>
                </div>
              </div>
            </div>
          </div>

          <p className="mx-auto mt-6 max-w-sm text-center text-[10px] font-bold uppercase leading-relaxed text-white/60 md:hidden">
            {labels.mobileCopy}
          </p>

          <div className="mt-8 flex flex-col items-center justify-between gap-5 px-2 text-white/25 md:mt-10 md:flex-row">
            <div className="text-[11px] font-black uppercase tracking-[0.24em]">{labels.copyright}</div>
            <div className="flex gap-6 text-[11px] font-black uppercase tracking-widest">
              <a className="transition-colors hover:text-gold" href={`/${locale}/terms`}>
                <Scale className="me-1 inline h-3.5 w-3.5" />
                {labels.legal}
              </a>
              <a className="transition-colors hover:text-gold" href={`/${locale}/contact`}>
                <FileWarning className="me-1 inline h-3.5 w-3.5" />
                {labels.breach}
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="fixed bottom-0 left-0 h-1 w-full bg-gold shadow-[0_-5px_15px_rgba(245,189,24,0.3)]" />
    </main>
  );
}
