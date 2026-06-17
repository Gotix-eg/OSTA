import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AboutProfileCustom } from "@/components/public/about-profile-custom";
import { PublicShell } from "@/components/public/public-shell";
import { isLocale, type Locale } from "@/lib/locales";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "من نحن" : "About Us"
  };
}

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

