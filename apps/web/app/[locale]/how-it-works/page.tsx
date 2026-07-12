import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { HowItWorksCustom } from "@/components/public/how-it-works-custom";
import { PublicShell } from "@/components/public/public-shell";
import { isLocale, type Locale } from "@/lib/locales";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "كيف يعمل" : "How It Works"
  };
}

export default async function HowItWorksPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  if (!isLocale(locale)) notFound();

  return (
    <PublicShell locale={locale as Locale} pathname="/how-it-works">
      <HowItWorksCustom locale={locale as Locale} />
    </PublicShell>
  );
}

