import { notFound } from "next/navigation";

import { AboutProfileCustom } from "@/components/public/about-profile-custom";
import { PublicShell } from "@/components/public/public-shell";
import { isLocale, type Locale } from "@/lib/locales";

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  if (!isLocale(locale)) notFound();

  return (
    <PublicShell locale={locale as Locale} pathname="/about">
      <div className="section-shell py-12">
        <AboutProfileCustom locale={locale as Locale} />
      </div>
    </PublicShell>
  );
}

