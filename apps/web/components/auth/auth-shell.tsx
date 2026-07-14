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
  const isLogin = pathname === "/login";
  const altLocale = locale === "ar" ? "en" : "ar";

  const trustBadges = [
    { Icon: ShieldCheck, label: "SECURE AUTH" },
    { Icon: Lock, label: "DATA PROTECTED" },
    { Icon: Headphones, label: "24/7 SUPPORT" },
  ];
  const navLinks = ["Directory", "Services", "Bookings", "Support"];

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
              {navLinks.map((label) => (
                <Link
                  key={label}
                  href={`/${locale}`}
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
              AR/EN
            </Link>
            <button className="hidden bg-white px-6 py-2 text-sm font-black uppercase text-black shadow-[4px_4px_0_#000] md:inline-flex">
              LOGIN
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
            <div className="absolute bottom-12 left-12 z-20 max-w-md">
              <h2 className="mb-4 text-4xl font-black leading-tight text-white">
                Precision in Every Connection.
              </h2>
              <p className="text-lg leading-relaxed text-white/70">
                Connecting professional craftsmen with quality-driven clients across the region.
              </p>
            </div>
          </div>

          <div
            className="flex flex-col justify-center p-8 md:p-16"
            style={{ backgroundColor: "#000000" }}
            dir="ltr"
          >
            <div className="mb-10 text-center md:text-start">
              <h1 className="mb-2 whitespace-nowrap text-[26px] font-black uppercase leading-tight text-[#f5bd18] md:text-5xl">
                {isLogin ? (
                  <>
                    WELCOME BACK / <span className="md:mt-1 md:block">أهلاً بك</span>
                  </>
                ) : (
                  <>
                    CREATE ACCOUNT / <span className="md:mt-1 md:block">إنشاء حساب</span>
                  </>
                )}
              </h1>
              <p className="mx-auto max-w-md text-base leading-relaxed text-white/70 md:mx-0 md:text-sm md:font-black md:uppercase md:tracking-[0.2em] md:text-white/50">
                <span className="md:hidden">
                  Secure login for Egypt&apos;s elite tradesmen and clients / منصة الحرفيين الموثقة
                </span>
                <span className="hidden md:inline">Premium Service Portal</span>
              </p>
            </div>

            {children}

            {isLogin && (
              <div className="mt-10 grid gap-4 border-t border-white/10 pt-6">
                <p className="mb-2 text-center text-xs font-black uppercase tracking-[0.2em] text-white/40">
                  <span className="md:hidden">Don&apos;t have an account? / ليس لديك حساب؟</span>
                  <span className="hidden md:inline">New to OSTA? Register as:</span>
                </p>
                <div className="grid grid-cols-1 gap-4 md:flex md:gap-3">
                  {(["client", "worker", "vendor"] as const).map((role) => {
                    const labels: Record<string, string> = {
                      client: "Client",
                      worker: "Worker",
                      vendor: "Vendor",
                    };
                    return (
                      <Link
                        key={role}
                        href={`/${locale}/register/${role}`}
                        className="flex-1 border border-white/10 py-2 text-center text-[10px] font-black uppercase text-white transition-all hover:border-[#f5bd18]/40 hover:bg-white/5 md:py-3 md:hover:bg-[#f5bd18] md:hover:text-black"
                      >
                        <span className="md:hidden">Register </span>
                        {labels[role]}
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
              OSTA Marketplace: The premier ecosystem for skilled labor and industrial solutions. Powered by quality, driven by technology.
            </p>
            <p className="text-base text-[#ffdf9a]">© 2026 OSTA Marketplace. All rights reserved.</p>
          </div>
          <div className="grid grid-cols-2 justify-items-end gap-8">
            <div className="flex flex-col gap-3">
              <Link className="text-white/45 hover:text-white" href={`/${locale}/privacy`}>Privacy Policy</Link>
              <Link className="text-white/45 hover:text-white" href={`/${locale}/terms`}>Terms of Service</Link>
            </div>
            <div className="flex flex-col gap-3">
              <Link className="text-white/45 hover:text-white" href={`/${locale}/contact`}>Contact Us</Link>
              <Link className="text-white/45 hover:text-white" href={`/${locale}/careers`}>Careers</Link>
            </div>
          </div>
        </div>
      </footer>

      <nav className="fixed bottom-0 z-50 flex h-20 w-full items-center justify-around border-t border-white/10 bg-black/80 px-4 text-[#f5bd18] backdrop-blur-md md:hidden">
        {[
          { Icon: Home, label: "Home", href: `/${locale}` },
          { Icon: Wrench, label: "Workers", href: `/${locale}/workers` },
          { Icon: Store, label: "Vendors", href: `/${locale}/vendors` },
          { Icon: User, label: "Profile", href: `/${locale}/login` },
        ].map(({ Icon, label, href }, index) => (
          <Link key={label} href={href as `/${string}`} className={index === 0 ? "flex flex-col items-center gap-1 text-[#f5bd18]" : "flex flex-col items-center gap-1 text-white/45"}>
            <Icon className="h-5 w-5" />
            <span className="text-xs font-black">{label}</span>
          </Link>
        ))}
      </nav>
    </main>
  );
}
