import { notFound } from "next/navigation";

import { AdminRequestsPage } from "@/components/admin/admin-extra-pages";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { isLocale } from "@/lib/locales";
import { getAdminRequestsData } from "@/lib/operations-data";

export default async function AdminRequestsRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  if (!isLocale(locale)) notFound();

  const data = await getAdminRequestsData();

  return (
    <DashboardShell locale={locale} role="admin">
      <AdminRequestsPage locale={locale} initialData={data} />
    </DashboardShell>
  );
}
