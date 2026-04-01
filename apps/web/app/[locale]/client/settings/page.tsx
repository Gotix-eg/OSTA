import { notFound } from "next/navigation";

import { ClientSettingsPage } from "@/components/client/client-account-pages";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { isLocale } from "@/lib/locales";
import { getClientSettingsData } from "@/lib/operations-data";

export default async function ClientSettingsRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  if (!isLocale(locale)) notFound();

  const data = await getClientSettingsData();

  return (
    <DashboardShell locale={locale} role="client">
      <ClientSettingsPage locale={locale} initialData={data} />
    </DashboardShell>
  );
}
