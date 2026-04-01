import { notFound } from "next/navigation";

import { ClientRequestDetailPage } from "@/components/client/client-requests-pages";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { isLocale } from "@/lib/locales";
import { getClientRequestDetailData } from "@/lib/operations-data";

export default async function ClientRequestDetailRoute({
  params
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const data = await getClientRequestDetailData(id);

  return (
    <DashboardShell locale={locale} role="client">
      <ClientRequestDetailPage locale={locale} requestId={id} initialData={data} />
    </DashboardShell>
  );
}
