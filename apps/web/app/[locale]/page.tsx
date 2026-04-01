import { notFound } from "next/navigation";

import { LandingPage } from "@/components/landing/landing-page";
import { isLocale } from "@/lib/locales";

export default async function LocaleHomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return <LandingPage locale={locale} />;
}
