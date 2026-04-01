import { notFound } from "next/navigation";

import { WorkerRegisterForm } from "@/components/auth/auth-forms";
import { AuthShell } from "@/components/auth/auth-shell";
import { authCopy } from "@/lib/copy";
import { isLocale } from "@/lib/locales";

export default async function RegisterWorkerPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

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
          ? "رحلة مهنية من 5 خطوات تشمل المعلومات المهنية، مناطق العمل، والمستندات المطلوبة للتوثيق."
          : "A 5-step professional onboarding flow including work details, service areas, and verification documents."
      }
    >
      <WorkerRegisterForm locale={locale} />
    </AuthShell>
  );
}
