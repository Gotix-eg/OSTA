import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PrivacyPage as PrivacyPageContent } from "@/components/public/privacy-page";
import { PublicShell } from "@/components/public/public-shell";
import { isLocale } from "@/lib/locales";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "سياسة الخصوصية" : "Privacy Policy"
  };
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  if (!isLocale(locale)) notFound();

  return (
    <PublicShell locale={locale} pathname="/privacy">
      <PrivacyPageContent locale={locale} />
    </PublicShell>
  );
}
