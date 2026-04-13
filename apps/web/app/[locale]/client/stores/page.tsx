import { notFound } from "next/navigation";
import { ClientStoresPage } from "@/components/dashboard/client-stores";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { isLocale } from "@/lib/locales";

export const dynamic = "force-dynamic";

export default async function ClientStoresRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <DashboardShell locale={locale} role="client">
      <ClientStoresPage locale={locale} />
    </DashboardShell>
  );
}
