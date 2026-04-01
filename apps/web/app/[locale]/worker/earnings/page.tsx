import { notFound } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { WorkerEarningsPage } from "@/components/worker/worker-earnings-page";
import { isLocale } from "@/lib/locales";
import { getWorkerEarningsData } from "@/lib/operations-data";

export default async function WorkerEarningsRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const data = await getWorkerEarningsData();

  return (
    <DashboardShell locale={locale} role="worker">
      <WorkerEarningsPage locale={locale} initialData={data} />
    </DashboardShell>
  );
}
