import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { WorkerDashboardHome } from "@/components/dashboard/dashboard-pages";
import { isLocale } from "@/lib/locales";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "لوحة تحكم الفني" : "Worker Dashboard"
  };
}

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
