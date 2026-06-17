import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/locales";
import { OrderDetailView } from "@/components/orders/order-detail-view";
import { PublicShell } from "@/components/public/public-shell";
import { resolveApiBaseUrl } from "@/lib/api";

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const isArabic = locale === "ar";
  
  try {
    const baseUrl = resolveApiBaseUrl();
    const res = await fetch(`${baseUrl}/public/requests/${id}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) {
        return {
          title: data.data.title,
          description: data.data.description.substring(0, 150)
        };
      }
    }
  } catch (e) {
    console.error("Failed to generate metadata for order details page", e);
  }

  return {
    title: isArabic ? "تفاصيل طلب الصيانة" : "Order Details"
  };
}

export default async function OrderDetailPage({
  params
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;

  if (!isLocale(locale)) notFound();

  return (
    <PublicShell locale={locale as Locale} pathname={`/orders/${id}`}>
      <div className="section-shell py-12">
        <OrderDetailView locale={locale as Locale} orderId={id} />
      </div>
    </PublicShell>
  );
}
