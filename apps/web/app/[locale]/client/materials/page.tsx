import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/locales";
import ClientMaterialsClientPage from "./client-page";

export const dynamic = "force-dynamic";

export default async function ClientMaterialsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return <ClientMaterialsClientPage locale={locale as Locale} />;
}
