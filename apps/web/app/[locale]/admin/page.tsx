import { notFound } from "next/navigation";
import { AdminDashboardView } from "@/components/admin/admin-dashboard-view";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { isLocale, type Locale } from "@/lib/locales";

export const metadata = {
  title: "Super Admin Dashboard | OSTA",
};

export default async function AdminPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return (
    <DashboardShell locale={locale as Locale} role="admin">
      <AdminDashboardView />
    </DashboardShell>
  );
}
