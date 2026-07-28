import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PublicContentPage } from "@/components/public/public-pages";
import { PublicShell } from "@/components/public/public-shell";
import { isLocale, type Locale } from "@/lib/locales";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "سياسة الاشتراكات والفوترة" : "Subscription & Billing Policy"
  };
}

export default async function BillingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  if (!isLocale(locale)) notFound();

  // Disabled for now
  notFound();

  const validatedLocale = locale as Locale;

  return (
    <PublicShell locale={validatedLocale} pathname="/billing">
      <div className="section-shell py-12">
        <PublicContentPage locale={validatedLocale} pageKey="billing" />
      </div>
    </PublicShell>
  );
}
