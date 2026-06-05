import { notFound } from "next/navigation";

import { ClientRegisterForm } from "@/components/auth/auth-forms";
import { AuthShell } from "@/components/auth/auth-shell";
import { authCopy } from "@/lib/copy";
import { isLocale } from "@/lib/locales";

export default async function RegisterClientPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return (
    <AuthShell
      locale={locale}
      pathname="/register/client"
      title={authCopy[locale].registerClientTitle}
      description={
        locale === "ar"
          ? "ابدأ كعميل بخطوات قصيرة تشمل التحقق والبيانات الشخصية."
          : "Start as a client with a short flow covering verification and personal details."
      }
    >
      <ClientRegisterForm locale={locale} />
    </AuthShell>
  );
}
