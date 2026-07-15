"use client";

import { Banknote, CreditCard, ReceiptText, TrendingUp } from "lucide-react";

import {
  VendorStitchEmpty,
  VendorStitchHero,
  VendorStitchMetric,
  VendorStitchPanel,
  VendorStitchShell,
  VendorStitchTopStrip
} from "@/components/vendor/vendor-stitch-ui";
import type { Locale } from "@/lib/locales";

export function VendorWalletClientPage({ locale }: { locale: Locale }) {
  const isArabic = locale === "ar";

  return (
    <VendorStitchShell locale={locale}>
      <VendorStitchTopStrip locale={locale} title={isArabic ? "محفظة المورد" : "Vendor wallet"} />
      <VendorStitchHero
        locale={locale}
        eyebrow={isArabic ? "تسويات ومبيعات" : "Settlements and sales"}
        title={isArabic ? "محفظة" : "Wallet"}
        highlight={isArabic ? "المتجر" : "ledger"}
        subtitle={isArabic ? "رصيد المبيعات، مصروفات الإعلانات، وتسويات الطلبات في شاشة مالية واحدة بنفس ستايل Stitch." : "Sales balance, ad spend, and order settlements in one Stitch-aligned finance screen."}
        actionHref={`/${locale}/vendor/ads`}
        actionLabel={isArabic ? "إعلانات ممولة" : "Sponsored ads"}
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <VendorStitchMetric label={isArabic ? "الرصيد المتاح" : "Available balance"} value={isArabic ? "0 ج.م" : "EGP 0"} note={isArabic ? "جاهز للسحب" : "ready payout"} icon={Banknote} index="01" />
        <VendorStitchMetric label={isArabic ? "مبيعات الشهر" : "Monthly sales"} value={isArabic ? "0 ج.م" : "EGP 0"} note={isArabic ? "إجمالي الطلبات" : "gross sales"} icon={TrendingUp} index="02" />
        <VendorStitchMetric label={isArabic ? "مصروفات الإعلانات" : "Ad spend"} value={isArabic ? "0 ج.م" : "EGP 0"} note={isArabic ? "هذا الشهر" : "this month"} icon={CreditCard} index="03" />
        <VendorStitchMetric label={isArabic ? "تسويات معلقة" : "Pending settlements"} value="0" note={isArabic ? "قيد المراجعة" : "under review"} icon={ReceiptText} index="04" />
      </div>
      <VendorStitchPanel eyebrow={isArabic ? "سجل المعاملات" : "Transaction log"} title={isArabic ? "حركة المحفظة" : "Wallet activity"}>
        <VendorStitchEmpty
          title={isArabic ? "لا توجد معاملات مسجلة" : "No transactions yet"}
          text={isArabic ? "المبيعات المؤكدة، رسوم الإعلانات، والتسويات ستظهر هنا عندما تبدأ عمليات المتجر." : "Confirmed sales, ad charges, and settlements will appear here once vendor operations start."}
          actionLabel={isArabic ? "افتح المخزون" : "Open inventory"}
          actionHref={`/${locale}/vendor/inventory`}
        />
      </VendorStitchPanel>
    </VendorStitchShell>
  );
}
