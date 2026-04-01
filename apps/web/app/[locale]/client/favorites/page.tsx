import { notFound } from "next/navigation";

import { ClientFavoritesPage } from "@/components/client/client-account-pages";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { isLocale } from "@/lib/locales";
import { getClientFavoritesData } from "@/lib/operations-data";

export default async function ClientFavoritesRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  if (!isLocale(locale)) notFound();

  const data = await getClientFavoritesData();

  return (
    <DashboardShell locale={locale} role="client">
      <ClientFavoritesPage locale={locale} initialData={data} />
    </DashboardShell>
  );
}
