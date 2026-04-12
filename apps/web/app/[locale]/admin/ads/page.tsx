import { notFound } from "next/navigation";

import { AdminAdsPage } from "@/components/dashboard/dashboard-pages";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { isLocale } from "@/lib/locales";

export const dynamic = "force-dynamic";

export default async function AdminAdsManagerPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return (
    <DashboardShell locale={locale} role="admin">
      <AdminAdsPage locale={locale} />
    </DashboardShell>
  );
}
