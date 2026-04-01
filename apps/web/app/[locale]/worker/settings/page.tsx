import { notFound } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { WorkerSettingsPage } from "@/components/worker/worker-extra-pages";
import { isLocale } from "@/lib/locales";
import { getWorkerSettingsData } from "@/lib/operations-data";

export default async function WorkerSettingsRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  if (!isLocale(locale)) notFound();

  const data = await getWorkerSettingsData();

  return (
    <DashboardShell locale={locale} role="worker">
      <WorkerSettingsPage locale={locale} initialData={data} />
    </DashboardShell>
  );
}
