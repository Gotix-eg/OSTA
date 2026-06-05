import { AdminVendorsManagement } from "@/components/admin/admin-vendors";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import type { Locale } from "@/lib/locales";

export default async function AdminVendorsPage({
  params
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params;
  return (
    <DashboardShell locale={locale} role="admin">
      <AdminVendorsManagement locale={locale} />
    </DashboardShell>
  );
}
