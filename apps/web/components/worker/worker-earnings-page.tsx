"use client";

import { Banknote, CalendarDays, CreditCard, Download, Sparkles, TrendingUp, Wallet } from "lucide-react";

import {
  WorkerProAction,
  WorkerProBadge,
  WorkerProHero,
  WorkerProMetric,
  WorkerProPanel,
  WorkerProShell,
  WorkerProTopStrip
} from "@/components/worker/worker-pro-ui";
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
    { label: isArabic ? "اليوم" : "Today", value: data.today, note: isArabic ? "دخل اليوم" : "cash today", icon: Wallet },
    { label: isArabic ? "هذا الأسبوع" : "This week", value: data.week, note: isArabic ? "حركة أسبوعية" : "weekly pace", icon: TrendingUp },
    { label: isArabic ? "هذا الشهر" : "This month", value: data.month, note: isArabic ? `نمو +${formatNumber(locale, data.growth)}%` : `+${formatNumber(locale, data.growth)}% growth`, icon: Sparkles },
    { label: isArabic ? "سحب معلق" : "Pending withdrawal", value: data.pendingWithdrawal, note: isArabic ? "الدورة القادمة" : "next payout", icon: CreditCard }
  ];

  const maxChartValue = Math.max(...data.chart.map((item) => item.amount), 1);

  return (
    <WorkerProShell locale={locale}>
      <WorkerProTopStrip locale={locale} title={isArabic ? "الأرباح" : "Earnings"} actionHref={`/${locale}/worker/requests/active`} actionLabel={isArabic ? "الطلبات النشطة" : "Active jobs"} />
      <WorkerProHero
        locale={locale}
        eyebrow={isArabic ? "مالية الفني" : "Worker finance"}
        title={isArabic ? "لوحة" : "Earnings"}
        highlight={isArabic ? "الأرباح" : "command"}
        subtitle={isArabic ? "تتبع الدخل ومواعيد الدفع وحركة الأموال من شاشة مالية حادة وواضحة." : "Track income, payout timing, and money movement from a sharp finance command screen."}
        actionHref={`/${locale}/worker/requests/active`}
        actionLabel={isArabic ? "راجع التنفيذ" : "Review jobs"}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item, index) => (
          <WorkerProMetric key={item.label} label={item.label} value={formatCurrency(locale, item.value)} note={item.note} icon={item.icon} index={`0${index + 1}`} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <WorkerProPanel title={isArabic ? "وتيرة الأرباح" : "Earnings rhythm"} eyebrow={isArabic ? "الصعود الشهري" : "monthly climb"}>
          <div className="grid grid-cols-4 items-end gap-4">
            {data.chart.map((item, index) => (
              <div key={item.label} className="flex flex-col items-center gap-3">
                <div className="flex h-60 w-full items-end border border-white/10 bg-[#111] p-3">
                  <div className={index % 2 === 0 ? "w-full bg-gold" : "w-full bg-white"} style={{ height: `${Math.max((item.amount / maxChartValue) * 220, 28)}px` }} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-black text-white">{item.label}</p>
                  <p className="mt-1 text-xs font-semibold text-white/45">{formatCurrency(locale, item.amount)}</p>
                </div>
              </div>
            ))}
          </div>
        </WorkerProPanel>

        <WorkerProPanel title={isArabic ? "مسار الدفع" : "Payout lane"} eyebrow={isArabic ? "حركة النقد" : "cash movement"}>
          <div className="space-y-4">
            {data.payouts.map((item) => (
              <div key={item.id} className="border border-white/10 bg-[#111] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-black text-white">{formatCurrency(locale, item.amount)}</p>
                    <p className="mt-1 text-sm text-white/50">{item.date}</p>
                  </div>
                  <WorkerProBadge tone={item.status === "paid" ? "green" : "gold"}>{item.status === "paid" ? (isArabic ? "مدفوع" : "Paid") : isArabic ? "مجدول" : "Scheduled"}</WorkerProBadge>
                </div>
              </div>
            ))}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="border border-white/10 bg-white/5 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">{isArabic ? "النمو" : "Growth"}</p>
                <p className="mt-2 text-2xl font-black text-gold">+{formatNumber(locale, data.growth)}%</p>
              </div>
              <div className="border border-white/10 bg-white/5 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">{isArabic ? "القيود" : "Entries"}</p>
                <p className="mt-2 text-2xl font-black text-white">{formatNumber(locale, data.transactions.length)}</p>
              </div>
            </div>
          </div>
        </WorkerProPanel>
      </div>

      <WorkerProPanel
        title={isArabic ? "أحدث المعاملات" : "Latest transactions"}
        eyebrow={isArabic ? "تدفق الأموال" : "money stream"}
        action={<WorkerProAction tone="light"><Download className="h-4 w-4" />{isArabic ? "تصدير" : "Export"}</WorkerProAction>}
      >
        <div className="grid gap-4">
          {data.transactions.map((item, index) => (
            <div key={item.id} className={index % 2 === 0 ? "flex flex-wrap items-center justify-between gap-3 border border-white/10 bg-[#111] p-4" : "flex flex-wrap items-center justify-between gap-3 border border-gold/30 bg-[#2a2207] p-4"}>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center border border-gold/35 bg-gold/10 text-gold">
                  {item.type === "bonus" ? <Sparkles className="h-5 w-5" /> : item.type === "withdrawal" ? <CalendarDays className="h-5 w-5" /> : <Banknote className="h-5 w-5" />}
                </div>
                <div>
                  <p className="font-black text-white">{item.label}</p>
                  <p className="mt-1 text-xs font-black uppercase tracking-[0.16em] text-white/35">{item.type}</p>
                </div>
              </div>
              <p className={item.amount < 0 ? "text-lg font-black text-red-300" : "text-lg font-black text-gold"}>{formatCurrency(locale, item.amount)}</p>
            </div>
          ))}
        </div>
      </WorkerProPanel>
    </WorkerProShell>
  );
}
