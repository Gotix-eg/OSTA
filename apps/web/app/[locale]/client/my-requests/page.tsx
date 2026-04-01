import { notFound } from "next/navigation";

import { ClientRequestsPage } from "@/components/client/client-requests-pages";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { isLocale } from "@/lib/locales";
import { getClientRequestsData } from "@/lib/operations-data";

export default async function ClientRequestsRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const data = await getClientRequestsData();

  return (
    <DashboardShell locale={locale} role="client">
      <ClientRequestsPage locale={locale} initialData={data} />
    </DashboardShell>
  );
}
