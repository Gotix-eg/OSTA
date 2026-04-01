import { notFound } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { WorkerRatingsPage } from "@/components/worker/worker-extra-pages";
import { isLocale } from "@/lib/locales";
import { getWorkerRatingsData } from "@/lib/operations-data";

export default async function WorkerRatingsRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  if (!isLocale(locale)) notFound();

  const data = await getWorkerRatingsData();

  return (
    <DashboardShell locale={locale} role="worker">
      <WorkerRatingsPage locale={locale} initialData={data} />
    </DashboardShell>
  );
}
