import { ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Locale } from "@/lib/locales";

export default async function ClientLayout({
  children,
  params
}: {
  children: ReactNode;
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  
  return (
    <DashboardShell locale={locale} role="client">
      {children}
    </DashboardShell>
  );
}
