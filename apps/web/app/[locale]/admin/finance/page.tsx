import { notFound } from "next/navigation";

import { AdminFinancePage } from "@/components/admin/admin-extra-pages";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { isLocale } from "@/lib/locales";
import { getAdminFinanceData } from "@/lib/operations-data";

export default async function AdminFinanceRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  if (!isLocale(locale)) notFound();

  const data = await getAdminFinanceData();

  return (
    <DashboardShell locale={locale} role="admin">
      <AdminFinancePage locale={locale} initialData={data} />
    </DashboardShell>
  );
}
