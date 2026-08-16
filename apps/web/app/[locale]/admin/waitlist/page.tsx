import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminWaitlistPage } from "@/components/admin/admin-waitlist-page";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { isLocale, type Locale } from "@/lib/locales";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "قائمة الانتظار - الإدارة" : "Waitlist - Admin Dashboard"
  };
}

export default async function WaitlistRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return (
    <DashboardShell locale={locale as Locale} role="admin">
      <AdminWaitlistPage locale={locale as Locale} />
    </DashboardShell>
  );
}
