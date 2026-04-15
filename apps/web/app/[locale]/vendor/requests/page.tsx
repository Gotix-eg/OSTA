import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { VendorRequestsPage } from "@/components/dashboard/vendor-requests";
import { isLocale } from "@/lib/locales";

export const dynamic = "force-dynamic";

export default async function VendorRequestsRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <DashboardShell locale={locale} role="vendor">
      <VendorRequestsPage locale={locale} />
    </DashboardShell>
  );
}
