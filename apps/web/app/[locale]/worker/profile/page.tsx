import { notFound } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { WorkerProfileEditor } from "@/components/worker/worker-profile-editor";
import { isLocale, type Locale } from "@/lib/locales";

export default async function WorkerProfileEditorRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  if (!isLocale(locale)) notFound();

  return (
    <DashboardShell locale={locale as Locale} role="worker">
      <WorkerProfileEditor locale={locale as Locale} />
    </DashboardShell>
  );
}
