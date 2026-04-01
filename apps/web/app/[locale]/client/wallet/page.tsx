import { notFound } from "next/navigation";

import { ClientWalletPage } from "@/components/client/client-account-pages";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { isLocale } from "@/lib/locales";
import { getClientWalletData } from "@/lib/operations-data";

export default async function ClientWalletRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  if (!isLocale(locale)) notFound();

  const data = await getClientWalletData();

  return (
    <DashboardShell locale={locale} role="client">
      <ClientWalletPage locale={locale} initialData={data} />
    </DashboardShell>
  );
}
