import { notFound } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { WorkerIncomingRequestsPage } from "@/components/worker/worker-requests-pages";
import { isLocale } from "@/lib/locales";
import { getWorkerIncomingRequestsData } from "@/lib/operations-data";

export default async function WorkerIncomingRequestsRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const data = await getWorkerIncomingRequestsData();

  return (
    <DashboardShell locale={locale} role="worker">
      <WorkerIncomingRequestsPage locale={locale} initialData={data} />
    </DashboardShell>
  );
}
