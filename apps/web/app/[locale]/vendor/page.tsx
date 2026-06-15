import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { VendorDashboardHome } from "@/components/dashboard/dashboard-pages";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { isLocale } from "@/lib/locales";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "لوحة تحكم المتجر" : "Vendor Dashboard"
  };
}

export const dynamic = "force-dynamic";

export default async function VendorDashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return (
    <DashboardShell locale={locale} role="vendor">
      <VendorDashboardHome locale={locale} />
    </DashboardShell>
  );
}
