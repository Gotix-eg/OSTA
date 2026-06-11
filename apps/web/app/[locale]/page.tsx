import { notFound } from "next/navigation";
import { LandingPage } from "@/components/landing/landing-page";
import { isLocale, type Locale } from "@/lib/locales";
import { PublicShell } from "@/components/public/public-shell";

export default async function LocaleHomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return (
    <PublicShell locale={locale as Locale} pathname="/">
      <LandingPage locale={locale as Locale} />
    </PublicShell>
  );
}
