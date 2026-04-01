import { notFound } from "next/navigation";

import { PublicContentPage } from "@/components/public/public-pages";
import { PublicShell } from "@/components/public/public-shell";
import { isLocale } from "@/lib/locales";

export default async function HowItWorksPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  if (!isLocale(locale)) notFound();

  return (
    <PublicShell locale={locale} pathname="/how-it-works">
      <PublicContentPage locale={locale} pageKey="how-it-works" />
    </PublicShell>
  );
}
