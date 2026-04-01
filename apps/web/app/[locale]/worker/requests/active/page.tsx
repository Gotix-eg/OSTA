import { notFound } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { WorkerActiveRequestsPage } from "@/components/worker/worker-requests-pages";
import { isLocale } from "@/lib/locales";
import { getWorkerActiveRequestsData } from "@/lib/operations-data";

export default async function WorkerActiveRequestsRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const data = await getWorkerActiveRequestsData();

  return (
    <DashboardShell locale={locale} role="worker">
      <WorkerActiveRequestsPage locale={locale} initialData={data} />
    </DashboardShell>
  );
}
