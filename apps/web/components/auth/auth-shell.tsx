"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ShieldCheck, Lock, Headphones } from "lucide-react";
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
  const isLogin = pathname === "/login";

  const trustBadges = [
    { Icon: ShieldCheck, label: isArabic ? "توثيق آمن" : "SECURE AUTH" },
    { Icon: Lock,        label: isArabic ? "بيانات محمية" : "DATA PROTECTED" },
    { Icon: Headphones,  label: isArabic ? "دعم مستمر" : "24/7 SUPPORT" },
  ];

  return (
    <main
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#f5bd18" }}
      dir={isArabic ? "rtl" : "ltr"}
    >
      {/* ── Split Panel ── */}
      <div className="flex-1 flex items-center justify-center px-4 md:px-12 py-8">
        <div
          className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 overflow-hidden"
          style={{
            backgroundColor: "#000000",
            boxShadow: "6px 6px 0px #1a1c1c",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {/* ── Left: Cinematic Image Panel ── */}
          <div className="relative hidden md:block group overflow-hidden" style={{ minHeight: "600px" }}>
            {/* Gradient overlay */}
            <div
              className="absolute inset-0 z-10"
              style={{ background: "linear-gradient(to right, rgba(0,0,0,0.6), transparent)" }}
            />
            <div className="absolute inset-0 bg-black/20 z-10 group-hover:opacity-0 transition-opacity duration-700" />

            {/* Cinematic craftsman image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAbfJ-2IS0360vqfuhA-1NqheG3brCUZN76EodMJBKF9vokisslyWi0g1RYa1pqwr0_MOFfrHqLJJDwj3228wWUnrA02sMvWtljZz34nlB9m-lPPKzi9OW3vEu7MFeoJLIwwivipO15TWmhDAjdkRYMHCDAyy6fYNcv6MbRjHrrdWErxNnDtkkgN5nR94neVSIhHYNfrmkUUhNIzrBXIdYsaC3zHiCQ35GBv_nPGbiEWpTnd7ULVnkTwOVpH-yyfmCAUcDgTzMPvOE"
              alt="Master craftsman"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />

            {/* Caption at bottom */}
            <div className="absolute bottom-12 left-12 z-20 max-w-md" style={isArabic ? { right: "48px", left: "auto" } : {}}>
              <h2 className="font-black text-white text-3xl md:text-4xl mb-3 leading-tight uppercase">
                {isArabic ? "دقة في كل اتصال" : "Precision in Every Connection."}
              </h2>
              <p className="text-white/70 text-base leading-relaxed">
                {isArabic
                  ? "نربط الحرفيين المحترفين بالعملاء الباحثين عن الجودة في كل المنطقة."
                  : "Connecting professional craftsmen with quality-driven clients across the region."}
              </p>
            </div>
          </div>

          {/* ── Right: Form Panel ── */}
          <div
            className="p-8 md:p-14 flex flex-col justify-center"
            style={{ backgroundColor: "#000000" }}
          >
            {/* Header */}
            <div className="mb-8 flex items-start justify-between gap-4">
              <div>
                <h1
                  className="font-black uppercase text-2xl md:text-3xl mb-1 leading-tight"
                  style={{ color: "#f5bd18" }}
                >
                  {isArabic
                    ? <>{isLogin ? "أهلاً بك مجدداً" : "إنشاء حساب"}</>
                    : <>{isLogin ? <>WELCOME BACK /<br /><span>أهلاً بك</span></> : <>CREATE ACCOUNT /<br /><span>إنشاء حساب</span></>}</>
                  }
                </h1>
                <p className="font-black text-xs uppercase tracking-widest text-white/50">
                  {isArabic ? "بوابة الخدمة المتميزة" : "Premium Service Portal"}
                </p>
              </div>
              <LocaleSwitcher
                locale={locale}
                pathname={pathname}
                className="border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white shrink-0"
              />
            </div>

            {/* Form content — LoginForm / RegisterForm injected here */}
            {children}

            {/* Register links (login page only) */}
            {isLogin && (
              <div className="mt-8">
                <p className="font-black text-xs uppercase tracking-widest text-white/40 text-center mb-3">
                  {isArabic ? "جديد في أوستا؟ سجل كـ:" : "New to OSTA? Register as:"}
                </p>
                <div className="flex gap-3">
                  {(["client", "worker", "vendor"] as const).map((role) => {
                    const labels: Record<string, { en: string; ar: string }> = {
                      client: { en: "Client", ar: "عميل" },
                      worker: { en: "Worker", ar: "فني" },
                      vendor: { en: "Vendor", ar: "مورد" },
                    };
                    return (
                      <Link
                        key={role}
                        href={`/${locale}/register/${role}`}
                        className="flex-1 py-3 text-center font-black text-xs uppercase text-white transition-all duration-200"
                        style={{ border: "1px solid rgba(255,255,255,0.1)" }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#f5bd18";
                          (e.currentTarget as HTMLAnchorElement).style.color = "#1a1c1c";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "transparent";
                          (e.currentTarget as HTMLAnchorElement).style.color = "#ffffff";
                        }}
                      >
                        {isArabic ? labels[role]!.ar : labels[role]!.en}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Trust badges */}
            <div
              className="mt-10 pt-6 flex flex-wrap justify-center gap-6"
              style={{ borderTop: "1px solid rgba(255,255,255,0.05)", opacity: 0.5 }}
            >
              {trustBadges.map(({ Icon, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <Icon size={16} style={{ color: "#f5bd18" }} strokeWidth={2} />
                  <span className="font-black text-xs uppercase tracking-tight text-white">{label}</span>
                </div>
              ))}
            </div>

            {/* Terms */}
            <p className="mt-6 text-center text-xs text-white/30">
              {isArabic ? (
                <>
                  بالمتابعة، أنت توافق على{" "}
                  <Link href={`/${locale}/terms`} className="underline" style={{ color: "#f5bd18" }}>
                    شروط الخدمة
                  </Link>
                </>
              ) : (
                <>
                  By continuing, you agree to our{" "}
                  <Link href={`/${locale}/terms`} className="underline" style={{ color: "#f5bd18" }}>
                    Terms of Service
                  </Link>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
