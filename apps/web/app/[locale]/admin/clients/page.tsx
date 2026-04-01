import { notFound } from "next/navigation";

import { AdminClientsPage } from "@/components/admin/admin-extra-pages";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { isLocale } from "@/lib/locales";
import { getAdminClientsData } from "@/lib/operations-data";

export default async function AdminClientsRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  if (!isLocale(locale)) notFound();

  const data = await getAdminClientsData();

  return (
    <DashboardShell locale={locale} role="admin">
      <AdminClientsPage locale={locale} initialData={data} />
    </DashboardShell>
  );
}
