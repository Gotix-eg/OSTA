import { notFound } from "next/navigation";

import { AdminDashboardHome } from "@/components/dashboard/dashboard-pages";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getAdminDashboardData } from "@/lib/dashboard-data";
import { isLocale } from "@/lib/locales";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const data = await getAdminDashboardData();

  return (
    <DashboardShell locale={locale} role="admin">
      <AdminDashboardHome locale={locale} initialData={data} />
    </DashboardShell>
  );
}
