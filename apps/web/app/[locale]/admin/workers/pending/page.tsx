import { notFound } from "next/navigation";

import { PendingWorkersPage } from "@/components/admin/pending-workers-page";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { isLocale } from "@/lib/locales";
import { getPendingWorkersData } from "@/lib/operations-data";

export default async function AdminPendingWorkersRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const data = await getPendingWorkersData();

  return (
    <DashboardShell locale={locale} role="admin">
      <PendingWorkersPage locale={locale} initialData={data} />
    </DashboardShell>
  );
}
