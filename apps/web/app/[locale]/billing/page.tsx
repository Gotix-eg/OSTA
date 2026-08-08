import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BillingPage as BillingPageContent } from "@/components/public/billing-page";
import { PublicShell } from "@/components/public/public-shell";
import { isLocale } from "@/lib/locales";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "سياسة الاشتراكات" : "Order Credit & Billing Policy"
  };
}

export default async function BillingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  if (!isLocale(locale)) notFound();

  return (
    <PublicShell locale={locale} pathname="/billing">
      <BillingPageContent locale={locale} />
    </PublicShell>
  );
}
