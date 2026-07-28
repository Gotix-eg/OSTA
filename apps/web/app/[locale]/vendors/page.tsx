import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/locales";
import { VendorsDirectory } from "@/components/vendors/vendors-directory";
import { PublicShell } from "@/components/public/public-shell";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "المتاجر والورش" : "Verified Vendors"
  };
}

export default async function VendorsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  if (!isLocale(locale)) notFound();

  return (
    <PublicShell locale={locale} pathname="/vendors">
      <VendorsDirectory locale={locale} />
    </PublicShell>
  );
}
