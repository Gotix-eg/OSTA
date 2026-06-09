import { notFound } from "next/navigation";

import { HowItWorksCustom } from "@/components/public/how-it-works-custom";
import { PublicShell } from "@/components/public/public-shell";
import { isLocale, type Locale } from "@/lib/locales";

export default async function HowItWorksPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  if (!isLocale(locale)) notFound();

  return (
    <PublicShell locale={locale as Locale} pathname="/how-it-works">
      <div className="section-shell py-12">
        <HowItWorksCustom locale={locale as Locale} />
      </div>
    </PublicShell>
  );
}

