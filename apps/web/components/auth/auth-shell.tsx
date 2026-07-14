"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Home, Lock, Menu, ShieldCheck, Headphones, Store, User, Wrench } from "lucide-react";
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
  const isLogin = pathname === "/login";
  const altLocale = isArabic ? "en" : "ar";

  const trustBadges = [
    { Icon: ShieldCheck, label: isArabic ? "دخول آمن" : "SECURE AUTH" },
    { Icon: Lock, label: isArabic ? "بيانات محمية" : "DATA PROTECTED" },
    { Icon: Headphones, label: isArabic ? "دعم مستمر" : "24/7 SUPPORT" },
  ];
  const navLinks = isArabic
    ? [
        { label: "الدليل", href: `/${locale}` },
        { label: "الخدمات", href: `/${locale}/services` },
        { label: "الحجوزات", href: `/${locale}/orders` },
        { label: "الدعم", href: `/${locale}/contact` },
      ]
    : [
        { label: "Directory", href: `/${locale}` },
        { label: "Services", href: `/${locale}/services` },
        { label: "Bookings", href: `/${locale}/orders` },
        { label: "Support", href: `/${locale}/contact` },
      ];
  const heroTitle = isArabic ? "دقة في كل اتصال." : "Precision in Every Connection.";
  const heroCopy = isArabic
    ? "نربط الحرفيين المحترفين بالعملاء الباحثين عن الجودة في كل المنطقة."
    : "Connecting professional craftsmen with quality-driven clients across the region.";
  const heading = isLogin
    ? (isArabic ? "أهلاً بك" : "WELCOME BACK")
    : (isArabic ? "إنشاء حساب" : "CREATE ACCOUNT");
  const subheading = isArabic ? "بوابة الخدمة المتميزة" : "Premium Service Portal";
  const mobileSubheading = isArabic
    ? "تسجيل دخول آمن للحرفيين والعملاء المعتمدين"
    : "Secure login for Egypt's elite tradesmen and clients";
  const registerPrompt = isArabic ? "ليس لديك حساب؟" : "Don't have an account?";
  const desktopRegisterPrompt = isArabic ? "جديد في أوستا؟ سجل كـ:" : "New to OSTA? Register as:";
  const registerLabels = {
    client: isArabic ? "عميل" : "Client",
    worker: isArabic ? "فني" : "Worker",
    vendor: isArabic ? "مورد" : "Vendor",
  };
  const registerPrefix = isArabic ? "تسجيل " : "Register ";
  const footerLinks = {
    privacy: isArabic ? "سياسة الخصوصية" : "Privacy Policy",
    terms: isArabic ? "شروط الخدمة" : "Terms of Service",
    contact: isArabic ? "تواصل معنا" : "Contact Us",
    careers: isArabic ? "الوظائف" : "Careers",
  };
  const bottomLinks = [
    { Icon: Home, label: isArabic ? "الرئيسية" : "Home", href: `/${locale}` },
    { Icon: Wrench, label: isArabic ? "الفنيون" : "Workers", href: `/${locale}/workers` },
    { Icon: Store, label: isArabic ? "الموردون" : "Vendors", href: `/${locale}/vendors` },
    { Icon: User, label: isArabic ? "حسابي" : "Profile", href: `/${locale}/login` },
  ];

  return (
    <main
      className="min-h-screen overflow-x-hidden"
      style={{ backgroundColor: "#f5bd18" }}
      dir="ltr"
    >
      <header className="fixed inset-x-0 top-0 z-50 h-16 border-b border-white/10 bg-black/80 text-white backdrop-blur-md">
        <nav className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 md:px-12">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4 text-[#f5bd18] md:hidden">
              <Menu className="h-6 w-6" />
              <span className="text-2xl font-black tracking-tight">OSTA</span>
            </div>
            <Link href={`/${locale}`} className="hidden items-center gap-3 md:flex">
              <img src="/logo.svg" alt="OSTA Logo" className="h-8 w-auto brightness-0 invert" />
            </Link>
            <div className="hidden gap-6 md:flex">
              {navLinks.map(({ label, href }) => (
                <Link
                  key={label}
                  href={href as `/${string}`}
                  className="text-sm font-black uppercase tracking-wide text-white hover:text-[#f5bd18]"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/${altLocale}${pathname}` as `/${string}`}
              className="px-1.5 py-2 text-sm font-black uppercase text-[#f5bd18] md:hidden"
            >
              {isArabic ? "الإنجليزية" : "Arabic"}
            </Link>
            <button className="hidden bg-white px-6 py-2 text-sm font-black uppercase text-black shadow-[4px_4px_0_#000] md:inline-flex">
              {isArabic ? "دخول" : "LOGIN"}
            </button>
          </div>
        </nav>
      </header>

      <div className="flex min-h-screen items-center justify-center px-4 pb-40 pt-32 md:px-12 md:pb-16 md:pt-24">
        <div
          className="relative z-10 grid w-full max-w-xl grid-cols-1 overflow-hidden border border-white/10 bg-black md:max-w-6xl md:grid-cols-2"
          style={{
            boxShadow: "6px 6px 0px #1a1c1c",
            direction: "ltr"
          }}
        >
          <div className="group relative hidden overflow-hidden md:block" style={{ minHeight: "600px" }}>
            <div
              className="absolute inset-0 z-10"
              style={{ background: "linear-gradient(to right, rgba(0,0,0,0.6), transparent)" }}
            />
            <div className="absolute inset-0 bg-black/20 z-10 group-hover:opacity-0 transition-opacity duration-700" />
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAbfJ-2IS0360vqfuhA-1NqheG3brCUZN76EodMJBKF9vokisslyWi0g1RYa1pqwr0_MOFfrHqLJJDwj3228wWUnrA02sMvWtljZz34nlB9m-lPPKzi9OW3vEu7MFeoJLIwwivipO15TWmhDAjdkRYMHCDAyy6fYNcv6MbRjHrrdWErxNnDtkkgN5nR94neVSIhHYNfrmkUUhNIzrBXIdYsaC3zHiCQ35GBv_nPGbiEWpTnd7ULVnkTwOVpH-yyfmCAUcDgTzMPvOE"
              alt="Master craftsman"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute bottom-12 left-12 z-20 max-w-md" dir={isArabic ? "rtl" : "ltr"}>
              <h2 className="mb-4 text-4xl font-black leading-tight text-white">
                {heroTitle}
              </h2>
              <p className="text-lg leading-relaxed text-white/70">
                {heroCopy}
              </p>
            </div>
          </div>

          <div
            className="flex flex-col justify-center p-8 md:p-16"
            style={{ backgroundColor: "#000000" }}
            dir={isArabic ? "rtl" : "ltr"}
          >
            <div className="mb-10 text-center md:text-start">
              <h1 className="mb-2 whitespace-nowrap text-[26px] font-black uppercase leading-tight text-[#f5bd18] md:text-5xl">
                {heading}
              </h1>
              <p className="mx-auto max-w-md text-base leading-relaxed text-white/70 md:mx-0 md:text-sm md:font-black md:uppercase md:tracking-[0.2em] md:text-white/50">
                <span className="md:hidden">
                  {mobileSubheading}
                </span>
                <span className="hidden md:inline">{subheading}</span>
              </p>
            </div>

            {children}

            {isLogin && (
              <div className="mt-10 grid gap-4 border-t border-white/10 pt-6">
                <p className="mb-2 text-center text-xs font-black uppercase tracking-[0.2em] text-white/40">
                  <span className="md:hidden">{registerPrompt}</span>
                  <span className="hidden md:inline">{desktopRegisterPrompt}</span>
                </p>
                <div className="grid grid-cols-1 gap-4 md:flex md:gap-3">
                  {(["client", "worker", "vendor"] as const).map((role) => {
                    return (
                      <Link
                        key={role}
                        href={`/${locale}/register/${role}`}
                        className="flex-1 border border-white/10 py-2 text-center text-[10px] font-black uppercase text-white transition-all hover:border-[#f5bd18]/40 hover:bg-white/5 md:py-3 md:hover:bg-[#f5bd18] md:hover:text-black"
                      >
                        <span className="md:hidden">{registerPrefix}</span>
                        {registerLabels[role]}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            <div
              className="mt-12 flex flex-wrap justify-center gap-8 border-t border-white/5 pt-8 opacity-50"
            >
              {trustBadges.map(({ Icon, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <Icon size={16} style={{ color: "#f5bd18" }} strokeWidth={2} />
                  <span className="font-black text-xs uppercase tracking-tight text-white">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <footer className="hidden border-t border-white/5 bg-[#2f3131] py-12 md:block">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-12">
          <div className="space-y-4">
            <img alt="OSTA Logo" className="h-6 w-auto brightness-0 invert" src="/logo.svg" />
            <p className="max-w-md text-base leading-relaxed text-white/45">
              {isArabic
                ? "سوق أوستا: منظومة متكاملة للعمالة الماهرة والحلول الصناعية، مدعومة بالجودة والتقنية."
                : "OSTA Marketplace: The premier ecosystem for skilled labor and industrial solutions. Powered by quality, driven by technology."}
            </p>
            <p className="text-base text-[#ffdf9a]">
              {isArabic ? "© 2026 أوستا. جميع الحقوق محفوظة." : "© 2026 OSTA Marketplace. All rights reserved."}
            </p>
          </div>
          <div className="grid grid-cols-2 justify-items-end gap-8">
            <div className="flex flex-col gap-3">
              <Link className="text-white/45 hover:text-white" href={`/${locale}/privacy`}>{footerLinks.privacy}</Link>
              <Link className="text-white/45 hover:text-white" href={`/${locale}/terms`}>{footerLinks.terms}</Link>
            </div>
            <div className="flex flex-col gap-3">
              <Link className="text-white/45 hover:text-white" href={`/${locale}/contact`}>{footerLinks.contact}</Link>
              <Link className="text-white/45 hover:text-white" href={`/${locale}/careers`}>{footerLinks.careers}</Link>
            </div>
          </div>
        </div>
      </footer>

      <nav className="fixed bottom-0 z-50 flex h-20 w-full items-center justify-around border-t border-white/10 bg-black/80 px-4 text-[#f5bd18] backdrop-blur-md md:hidden">
        {bottomLinks.map(({ Icon, label, href }, index) => (
          <Link key={label} href={href as `/${string}`} className={index === 0 ? "flex flex-col items-center gap-1 text-[#f5bd18]" : "flex flex-col items-center gap-1 text-white/45"}>
            <Icon className="h-5 w-5" />
            <span className="text-xs font-black">{label}</span>
          </Link>
        ))}
      </nav>
    </main>
  );
}
