import { notFound } from "next/navigation";
import { ClientStoreDetailPage } from "@/components/dashboard/client-store-detail";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { isLocale } from "@/lib/locales";

export const dynamic = "force-dynamic";

export default async function ClientStoreDetailRoute({
  params,
}: {
  params: Promise<{ locale: string; vendorId: string }>;
}) {
  const { locale, vendorId } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <DashboardShell locale={locale} role="client">
      <ClientStoreDetailPage locale={locale} vendorId={vendorId} />
    </DashboardShell>
  );
}
