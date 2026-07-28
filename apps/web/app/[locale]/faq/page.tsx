import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FaqPage as FaqPageContent } from "@/components/public/faq-page";
import { PublicShell } from "@/components/public/public-shell";
import { isLocale } from "@/lib/locales";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "مركز المساعدة والأسئلة الشائعة" : "Help Center & FAQ"
  };
}

export default async function FaqPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  if (!isLocale(locale)) notFound();

  return (
    <PublicShell locale={locale} pathname="/faq">
      <FaqPageContent locale={locale} />
    </PublicShell>
  );
}
