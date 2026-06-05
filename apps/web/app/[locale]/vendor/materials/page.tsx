import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/locales";
import VendorMaterialsClientPage from "./client-page";

export const dynamic = "force-dynamic";

export default async function VendorMaterialsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return <VendorMaterialsClientPage locale={locale as Locale} />;
}
