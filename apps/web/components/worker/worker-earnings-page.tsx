"use client";

import Link from "next/link";

import { Banknote, CalendarDays, CreditCard, Sparkles, TrendingUp, Wallet } from "lucide-react";

import {
  DashboardBlock,
  MiniMetric,
  SoftBadge,
  SoftCard,
  SplitInfo,
  SubpageHero
} from "@/components/dashboard/dashboard-subpage-primitives";
import { useLiveApiData } from "@/hooks/use-live-api-data";
import type { Locale } from "@/lib/locales";
import type { WorkerEarningsData } from "@/lib/operations-data";

function formatNumber(locale: Locale, value: number) {
  return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US", { maximumFractionDigits: 0 }).format(value);
}

function formatCurrency(locale: Locale, value: number) {
  const formatted = formatNumber(locale, Math.abs(value));
  const prefix = value < 0 ? "-" : "";
  return locale === "ar" ? `${prefix}${formatted} ج.م` : `${prefix}EGP ${formatted}`;
}

export function WorkerEarningsPage({ locale, initialData }: { locale: Locale; initialData: WorkerEarningsData }) {
  const isArabic = locale === "ar";
  const data = useLiveApiData("/workers/earnings/summary", initialData);

  const stats = [
    { label: isArabic ? "اليوم" : "Today", value: data.today, note: isArabic ? "الأموال المكتسبة الآن" : "cash generated now", icon: Wallet, tone: "accent" as const },
    { label: isArabic ? "هذا الأسبوع" : "This week", value: data.week, note: isArabic ? "الحركة الأسبوعية" : "weekly momentum", icon: TrendingUp, tone: "primary" as const },
    { label: isArabic ? "هذا الشهر" : "This month", value: data.month, note: isArabic ? `نمو +${formatNumber(locale, data.growth)}%` : `+${formatNumber(locale, data.growth)}% growth`, icon: CircleDollarSignProxy, tone: "sun" as const },
    { label: isArabic ? "سحب معلق" : "Pending withdrawal", value: data.pendingWithdrawal, note: isArabic ? "دورة الدفع القادمة" : "next payout rail", icon: CreditCard, tone: "dark" as const }
  ];

  const maxChartValue = Math.max(...data.chart.map((item) => item.amount), 1);

  return (
    <div>
      <SubpageHero
        eyebrow={isArabic ? "مالية العامل" : "Worker finance"}
        title={isArabic ? "الأرباح" : "Earnings"}
        subtitle={
          isArabic
            ? "تتبع الدخل، مواعيد الدفع، وحركة الأموال من خلال عرض مالي أكثر تفصيلاً ووضوحاً."
            : "Track income, payout timing, and transaction motion through a richer finance view."
        }
        actionLabel={isArabic ? "الطلبات النشطة" : "Active jobs"}
        actionHref={`/${locale}/worker/requests/active`}
        tone="accent"
      />

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <MiniMetric key={item.label} label={item.label} value={formatCurrency(locale, item.value)} note={item.note} icon={item.icon} tone={item.tone} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <DashboardBlock title={isArabic ? "وتيرة الأرباح" : "Earnings rhythm"} eyebrow={isArabic ? "الصعود الشهري" : "monthly climb"}>
          <div className="grid grid-cols-4 items-end gap-4">
            {data.chart.map((item, index) => (
              <div key={item.label} className="flex flex-col items-center gap-3">
                <div className={index % 2 === 0 ? "onyx-card flex h-60 w-full items-end p-3" : "onyx-card flex h-60 w-full items-end bg-onyx-800/80 p-3"}>
                  <div
                    className={index % 2 === 0 ? "w-full rounded-[1rem] bg-gradient-to-t from-primary-700 via-primary-500 to-sun-300" : "w-full rounded-[1rem] bg-gradient-to-t from-accent-700 via-accent-500 to-accent-200"}
                    style={{ height: `${Math.max((item.amount / maxChartValue) * 220, 28)}px` }}
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-white/80">{item.label}</p>
                  <p className="mt-1 text-xs text-onyx-400">{formatCurrency(locale, item.amount)}</p>
                </div>
              </div>
            ))}
          </div>
        </DashboardBlock>

        <DashboardBlock title={isArabic ? "مسار الدفع" : "Payout lane"} eyebrow={isArabic ? "حركة النقد" : "cash movement"} dark>
          <div className="space-y-4">
            {data.payouts.map((item) => (
              <div key={item.id} className="rounded-[1.35rem] border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-white">{formatCurrency(locale, item.amount)}</p>
                    <p className="mt-1 text-sm text-white/60">{item.date}</p>
                  </div>
                  <SoftBadge label={item.status === "paid" ? (isArabic ? "مدفوع" : "Paid") : isArabic ? "مجدول" : "Scheduled"} tone={item.status === "paid" ? "success" : "sun"} />
                </div>
              </div>
            ))}
            <SplitInfo
              items={[
                { label: isArabic ? "النمو" : "Growth", value: `+${formatNumber(locale, data.growth)}%` },
                { label: isArabic ? "القيود" : "Entries", value: formatNumber(locale, data.transactions.length) }
              ]}
            />
          </div>
        </DashboardBlock>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <DashboardBlock title={isArabic ? "أحدث المعاملات" : "Latest transactions"} eyebrow={isArabic ? "تدفق الأموال" : "money stream"}>
          <div className="grid gap-4">
            {data.transactions.map((item, index) => (
              <div key={item.id} className={index % 2 === 0 ? "onyx-card flex flex-wrap items-center justify-between gap-3 p-4" : "onyx-card flex flex-wrap items-center justify-between gap-3 bg-onyx-800/80 p-4"}>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-onyx-800/50 text-primary-700 shadow-soft">
                    {item.type === "bonus" ? <Sparkles className="h-5 w-5" /> : item.type === "withdrawal" ? <CalendarDays className="h-5 w-5" /> : <Banknote className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{item.label}</p>
                    <p className="mt-1 text-sm text-onyx-400">{item.type}</p>
                  </div>
                </div>
                <p className={item.amount < 0 ? "text-lg font-semibold text-error" : "text-lg font-semibold text-white"}>{formatCurrency(locale, item.amount)}</p>
              </div>
            ))}
          </div>
        </DashboardBlock>

        <DashboardBlock title={isArabic ? "إجراءات مالية سريعة" : "Quick finance actions"} eyebrow={isArabic ? "الخطوة التالية" : "next step"}>
          <div className="grid gap-4">
            <SoftCard>
              <p className="text-xs uppercase tracking-[0.22em] text-onyx-500">{isArabic ? "مسار معلق" : "Pending rail"}</p>
              <p className="mt-3 text-lg font-semibold text-white">{formatCurrency(locale, data.pendingWithdrawal)}</p>
              <p className="mt-2 text-sm leading-7 text-onyx-300">{isArabic ? "هذا المبلغ بانتظار دورة الدفع القادمة." : "This amount is waiting for the next payout cycle."}</p>
            </SoftCard>
            <SoftCard>
              <p className="text-xs uppercase tracking-[0.22em] text-onyx-500">{isArabic ? "روابط العمليات" : "Ops links"}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link href={`/${locale}/worker/requests/incoming`} className="rounded-full border border-onyx-700 bg-onyx-800/50 px-4 py-2 text-sm font-semibold text-onyx-200 shadow-soft">
                  {isArabic ? "الطلبات الواردة" : "Incoming jobs"}
                </Link>
                <Link href={`/${locale}/worker/requests/active`} className="rounded-full border border-onyx-700 bg-onyx-800/50 px-4 py-2 text-sm font-semibold text-onyx-200 shadow-soft">
                  {isArabic ? "الطلبات النشطة" : "Active jobs"}
                </Link>
              </div>
            </SoftCard>
          </div>
        </DashboardBlock>
      </div>
    </div>
  );
}

function CircleDollarSignProxy(props: { className?: string }) {
  return <Wallet {...props} />;
}
