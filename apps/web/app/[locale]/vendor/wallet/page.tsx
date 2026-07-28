import { notFound } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { isLocale } from "@/lib/locales";
import { VendorWalletClientPage } from "./client-page";

export const dynamic = "force-dynamic";

export default async function VendorWalletPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <DashboardShell locale={locale} role="vendor">
      <VendorWalletClientPage locale={locale} />
    </DashboardShell>
  );
}
