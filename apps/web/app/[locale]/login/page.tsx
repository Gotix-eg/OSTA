import { notFound } from "next/navigation";

import { LoginForm } from "@/components/auth/auth-forms";
import { AuthShell } from "@/components/auth/auth-shell";
import { authCopy } from "@/lib/copy";
import { isLocale } from "@/lib/locales";

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return (
    <AuthShell locale={locale} pathname="/login" title={authCopy[locale].loginTitle} description={authCopy[locale].loginBody}>
      <LoginForm locale={locale} />
    </AuthShell>
  );
}
