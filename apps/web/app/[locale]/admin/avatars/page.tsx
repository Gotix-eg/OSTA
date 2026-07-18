import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminAvatarLibrary } from "@/components/admin/admin-avatar-library";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { isLocale, type Locale } from "@/lib/locales";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "مكتبة الصور الشخصية" : "Avatar Library"
  };
}

export default async function AdminAvatarsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return (
    <DashboardShell locale={locale as Locale} role="admin">
      <AdminAvatarLibrary locale={locale} />
    </DashboardShell>
  );
}
