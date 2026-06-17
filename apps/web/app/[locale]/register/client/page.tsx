import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ClientRegisterForm } from "@/components/auth/auth-forms";
import { AuthShell } from "@/components/auth/auth-shell";
import { authCopy } from "@/lib/copy";
import { isLocale } from "@/lib/locales";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "إنشاء حساب عميل" : "Create Client Account",
    description:
      locale === "ar"
        ? "أنشئ حساب عميل مجاني على أُسطفاي في دقائق واطلب فنيين موثقين بالقرب منك."
        : "Create your free Ostafy client account in minutes and book verified technicians near you."
  };
}

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
