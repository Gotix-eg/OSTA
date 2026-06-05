import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/locales";
import WorkerAdsClientPage from "./client-page";

export const dynamic = "force-dynamic";

export default async function WorkerAdsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return <WorkerAdsClientPage locale={locale as Locale} />;
}
