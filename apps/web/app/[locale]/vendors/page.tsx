import { notFound } from "next/navigation";
import { isLocale } from "@/lib/locales";
import { VendorsDirectory } from "@/components/vendors/vendors-directory";
import { PublicShell } from "@/components/public/public-shell";

export default async function VendorsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  if (!isLocale(locale)) notFound();

  return (
    <PublicShell locale={locale} pathname="/vendors">
      <VendorsDirectory locale={locale} />
    </PublicShell>
  );
}
