import { notFound } from "next/navigation";
import { VendorInventoryPage } from "@/components/dashboard/vendor-inventory";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { isLocale } from "@/lib/locales";

export const dynamic = "force-dynamic";

export default async function VendorInventoryRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <DashboardShell locale={locale} role="vendor">
      <VendorInventoryPage locale={locale} />
    </DashboardShell>
  );
}
