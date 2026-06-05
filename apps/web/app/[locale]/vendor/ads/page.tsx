import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/locales";
import VendorAdsClientPage from "./client-page";

export const dynamic = "force-dynamic";

export default async function VendorAdsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return <VendorAdsClientPage locale={locale as Locale} />;
}
