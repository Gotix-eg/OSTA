import { notFound } from "next/navigation";

import { NewRequestPage } from "@/components/client/new-request-page";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { isLocale } from "@/lib/locales";

export default async function ClientNewRequestPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return (
    <DashboardShell locale={locale} role="client">
      <NewRequestPage locale={locale} />
    </DashboardShell>
  );
}
