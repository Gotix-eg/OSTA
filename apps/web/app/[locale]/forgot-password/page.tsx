import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ForgotPasswordForm } from "@/components/auth/auth-forms";
import { AuthShell } from "@/components/auth/auth-shell";
import { authCopy } from "@/lib/copy";
import { isLocale } from "@/lib/locales";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "استعادة كلمة المرور" : "Reset Password"
  };
}

export default async function ForgotPasswordPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return (
    <AuthShell
      locale={locale}
      pathname="/forgot-password"
      title={authCopy[locale].forgotPasswordTitle}
      description={
        locale === "ar"
          ? "استرجاع كلمة المرور من خلال التواصل المباشر مع خدمة العملاء عبر واتساب برقم هاتفك المسجل."
          : "Recover access by contacting customer support on WhatsApp using your registered phone number."
      }
    >
      <ForgotPasswordForm locale={locale} />
    </AuthShell>
  );
}
