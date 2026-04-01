import { notFound } from "next/navigation";

import { AdminSettingsPage } from "@/components/admin/admin-extra-pages";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { isLocale } from "@/lib/locales";
import { getAdminSettingsData } from "@/lib/operations-data";

export default async function AdminSettingsRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  if (!isLocale(locale)) notFound();

  const data = await getAdminSettingsData();

  return (
    <DashboardShell locale={locale} role="admin">
      <AdminSettingsPage locale={locale} initialData={data} />
    </DashboardShell>
  );
}
