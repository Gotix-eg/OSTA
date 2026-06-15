import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/locales";
import { OrdersDirectory } from "@/components/orders/orders-directory";
import { PublicShell } from "@/components/public/public-shell";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "طلبات الصيانة المتاحة" : "Open Orders"
  };
}

export default async function OrdersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <PublicShell locale={locale as Locale} pathname="/orders">
      <div className="section-shell py-12">
        <OrdersDirectory locale={locale as Locale} />
      </div>
    </PublicShell>
  );
}
