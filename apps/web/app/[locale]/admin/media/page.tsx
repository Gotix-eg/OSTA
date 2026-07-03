import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminMediaView } from "@/components/admin/admin-media-view";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { isLocale, type Locale } from "@/lib/locales";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "معرض الوسائط والملفات" : "Media Library"
  };
}

export default async function AdminMediaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return (
    <DashboardShell locale={locale as Locale} role="admin">
      <AdminMediaView locale={locale} />
    </DashboardShell>
  );
}
