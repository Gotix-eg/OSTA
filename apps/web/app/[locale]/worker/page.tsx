import { notFound } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { WorkerDashboardHome } from "@/components/dashboard/dashboard-pages";
import { isLocale } from "@/lib/locales";

export const dynamic = "force-dynamic";

export default async function WorkerDashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return (
    <DashboardShell locale={locale} role="worker">
      <WorkerDashboardHome locale={locale} />
    </DashboardShell>
  );
}
