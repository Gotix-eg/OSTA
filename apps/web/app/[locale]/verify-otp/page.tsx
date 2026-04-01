import { notFound } from "next/navigation";

import { VerifyOtpForm } from "@/components/auth/auth-forms";
import { AuthShell } from "@/components/auth/auth-shell";
import { authCopy } from "@/lib/copy";
import { isLocale } from "@/lib/locales";

export default async function VerifyOtpPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return (
    <AuthShell
      locale={locale}
      pathname="/verify-otp"
      title={authCopy[locale].otpTitle}
      description={
        locale === "ar"
          ? "واجهة تحقق من 6 أرقام مع عداد زمني وإعادة إرسال تلقائية عند الحاجة."
          : "A 6-digit verification flow with countdown timing and resend support."
      }
    >
      <VerifyOtpForm locale={locale} />
    </AuthShell>
  );
}
