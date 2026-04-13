import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { isLocale } from "@/lib/locales";
import { Construction } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function VendorWalletPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <DashboardShell locale={locale} role="vendor">
      <div className="flex h-[60vh] flex-col items-center justify-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-surface-soft text-dark-400">
          <Construction className="h-10 w-10" />
        </div>
        <h2 className="mt-6 text-2xl font-semibold text-dark-950">
          {locale === "ar" ? "قريباً - المحفظة" : "Coming Soon - Wallet"}
        </h2>
        <p className="mt-2 text-dark-500 max-w-md">
          {locale === "ar"
            ? "سيتم ربط وإظهار جميع مبيعاتك وحساباتك المالية في هذه الصفحة."
            : "All your sales and financial accounts will be shown on this page."}
        </p>
      </div>
    </DashboardShell>
  );
}
