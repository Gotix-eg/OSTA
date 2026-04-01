import { notFound } from "next/navigation";

import { DashboardHubPage } from "@/components/public/public-pages";
import { PublicShell } from "@/components/public/public-shell";
import { isLocale } from "@/lib/locales";

export default async function DashboardsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  if (!isLocale(locale)) notFound();

  return (
    <PublicShell locale={locale} pathname="/dashboards">
      <DashboardHubPage locale={locale} />
    </PublicShell>
  );
}
