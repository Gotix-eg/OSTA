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
      <div className="flex min-h-[70vh] items-center justify-center py-20 px-4 bg-[#f9f9f9] max-md:bg-gold">
        <div 
          className="relative z-10 w-full max-w-xl border border-white/10 bg-black p-8 sm:p-12 text-white text-start"
          style={{
            boxShadow: "6px 6px 0px #1a1c1c"
          }}
        >
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
    </PublicShell>
  );
}
