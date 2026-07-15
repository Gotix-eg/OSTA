"use client";

import { ClipboardCheck, PackageCheck, Truck, Wallet } from "lucide-react";

import {
  VendorStitchEmpty,
  VendorStitchHero,
  VendorStitchMetric,
  VendorStitchPanel,
  VendorStitchShell,
  VendorStitchTopStrip
} from "@/components/vendor/vendor-stitch-ui";
import type { Locale } from "@/lib/locales";

export function VendorActiveOrdersClientPage({ locale }: { locale: Locale }) {
  const isArabic = locale === "ar";

  return (
    <VendorStitchShell locale={locale}>
      <VendorStitchTopStrip locale={locale} title={isArabic ? "الطلبات النشطة" : "Active orders"} />
      <VendorStitchHero
        locale={locale}
        eyebrow={isArabic ? "تنفيذ وتوصيل" : "Fulfillment board"}
        title={isArabic ? "طلبات المتجر" : "Live order"}
        highlight={isArabic ? "النشطة" : "pipeline"}
        subtitle={isArabic ? "تابع تجهيز الطلبات المقبولة، الشحن، والتسليم بنفس نظام تشغيل المورد." : "Monitor accepted orders, preparation, shipping, and delivery in the vendor operating style."}
        actionHref={`/${locale}/vendor/materials`}
        actionLabel={isArabic ? "طلبات الخامات" : "Material bids"}
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <VendorStitchMetric label={isArabic ? "مقبولة" : "Accepted"} value="0" note={isArabic ? "بانتظار التجهيز" : "waiting prep"} icon={ClipboardCheck} index="01" />
        <VendorStitchMetric label={isArabic ? "قيد التجهيز" : "Preparing"} value="0" note={isArabic ? "داخل المتجر" : "in store"} icon={PackageCheck} index="02" />
        <VendorStitchMetric label={isArabic ? "قيد التوصيل" : "Shipping"} value="0" note={isArabic ? "في الطريق" : "on route"} icon={Truck} index="03" />
        <VendorStitchMetric label={isArabic ? "قيمة الطلبات" : "Order value"} value={isArabic ? "0 ج.م" : "EGP 0"} note={isArabic ? "نشط الآن" : "active now"} icon={Wallet} index="04" />
      </div>
      <VendorStitchPanel eyebrow={isArabic ? "قائمة التنفيذ" : "Execution queue"} title={isArabic ? "لا توجد طلبات قيد التنفيذ" : "No active fulfillment orders"}>
        <VendorStitchEmpty
          title={isArabic ? "الطابور فارغ حالياً" : "The queue is currently clear"}
          text={isArabic ? "عندما يقبل العميل عرض سعر أو يشتري من مخزونك، سيظهر الطلب هنا بمراحل التجهيز والتوصيل." : "When a client accepts a quote or buys from your inventory, the order will appear here with preparation and delivery stages."}
          actionLabel={isArabic ? "افتح المزايدات" : "Open bidding"}
          actionHref={`/${locale}/vendor/materials`}
        />
      </VendorStitchPanel>
    </VendorStitchShell>
  );
}
