import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LoginForm } from "@/components/auth/auth-forms";
import { PublicShell } from "@/components/public/public-shell";
import { authCopy } from "@/lib/copy";
import { isLocale } from "@/lib/locales";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "تسجيل الدخول" : "Login"
  };
}

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return (
    <PublicShell locale={locale} pathname="/login">
      <div className="flex min-h-[70vh] items-center justify-center py-20 px-4 bg-gold">
        <div 
          className="relative z-10 grid w-full max-w-6xl grid-cols-1 md:grid-cols-2 border border-white/10 bg-black text-white text-start overflow-hidden rounded-none"
          dir={locale === "ar" ? "rtl" : "ltr"}
          style={{
            boxShadow: "6px 6px 0px #1a1c1c"
          }}
        >
          {/* Photo Column */}
          <div className="relative hidden md:block min-h-[500px]">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAbfJ-2IS0360vqfuhA-1NqheG3brCUZN76EodMJBKF9vokisslyWi0g1RYa1pqwr0_MOFfrHqLJJDwj3228wWUnrA02sMvWtljZz34nlB9m-lPPKzi9OW3vEu7MFeoJLIwwivipO15TWmhDAjdkRYMHCDAyy6fYNcv6MbRjHrrdWErxNnDtkkgN5nR94neVSIhHYNfrmkUUhNIzrBXIdYsaC3zHiCQ35GBv_nPGbiEWpTnd7ULVnkTwOVpH-yyfmCAUcDgTzMPvOE"
              alt="Ostafy Login"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>

          {/* Form Column */}
          <div className="p-8 sm:p-12 flex flex-col justify-center">
            <div className="mb-8">
              <h1 className="text-3xl font-black text-gold uppercase mb-2">
                {locale === "ar" ? "تسجيل الدخول" : "WELCOME BACK"}
              </h1>
              <p className="text-neutral-400 text-sm">
                {authCopy[locale].loginBody}
              </p>
            </div>
            <LoginForm locale={locale} />
          </div>
        </div>
      </div>
    </PublicShell>
  );
}
