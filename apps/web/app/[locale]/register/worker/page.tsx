import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { WorkerRegisterForm } from "@/components/auth/auth-forms";
import { AuthShell } from "@/components/auth/auth-shell";
import { authCopy } from "@/lib/copy";
import { isLocale } from "@/lib/locales";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "حساب فني جديد" : "Worker Signup"
  };
}

export default async function RegisterWorkerPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ phone?: string; firstName?: string; lastName?: string }>;
}) {
  const { locale } = await params;
  const { phone, firstName, lastName } = await searchParams;

  if (!isLocale(locale)) {
    notFound();
  }

  return (
    <AuthShell
      locale={locale}
      pathname="/register/worker"
      title={authCopy[locale].registerWorkerTitle}
      description={
        locale === "ar"
          ? "سجّل بياناتك الأساسية كفني أو صنايعي معتمد للبدء في استقبال طلبات العملاء فوراً."
          : "Register your basic info as a verified technician and start receiving client requests."
      }
    >
      <WorkerRegisterForm locale={locale} initial={{ phone, firstName, lastName }} />
    </AuthShell>
  );
}
