import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LoginForm } from "@/components/auth/auth-forms";
import { AdminAuthShell } from "@/components/auth/auth-shell";
import { isLocale } from "@/lib/locales";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "تسجيل دخول الإدارة" : "Admin Login"
  };
}

export default async function AdminLoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return (
    <AdminAuthShell locale={locale}>
      <LoginForm locale={locale} isAdmin={true} />
    </AdminAuthShell>
  );
}
