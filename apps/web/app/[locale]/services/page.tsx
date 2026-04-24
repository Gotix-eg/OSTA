import { notFound } from "next/navigation";

import { ServicesListing } from "@/components/public/services-listing";
import { PublicShell } from "@/components/public/public-shell";
import { isLocale } from "@/lib/locales";

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  if (!isLocale(locale)) notFound();

  return (
    <PublicShell locale={locale} pathname="/services">
      <ServicesListing locale={locale} />
    </PublicShell>
  );
}
