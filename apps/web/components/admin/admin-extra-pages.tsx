"use client";

import { useEffect, useState } from "react";

import { Building2, CreditCard, Save, ShieldCheck, Sparkles, Users, Wallet, Wrench } from "lucide-react";

import {
  DashboardBlock,
  EmptyState,
  MiniMetric,
  SoftBadge,
  SoftCard,
  SplitInfo,
  SubpageHero
} from "@/components/dashboard/dashboard-subpage-primitives";
import { useLiveApiData } from "@/hooks/use-live-api-data";
import type { Locale } from "@/lib/locales";
import type { AdminClientsData, AdminFinanceData, AdminRequestsData, AdminSettingsData } from "@/lib/operations-data";

function formatNumber(locale: Locale, value: number) {
  return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US", { maximumFractionDigits: 0 }).format(value);
}

function formatCurrency(locale: Locale, value: number) {
  const formatted = formatNumber(locale, value);
  return locale === "ar" ? `${formatted} ج.م` : `EGP ${formatted}`;
}

export function AdminClientsPage({ locale, initialData }: { locale: Locale; initialData: AdminClientsData }) {
  const isArabic = locale === "ar";
  const data = useLiveApiData("/admin/clients", initialData);

  return (
    <div>
      <SubpageHero
        eyebrow={isArabic ? "قاعدة العملاء" : "Client base"}
        title={isArabic ? "العملاء" : "Clients"}
        subtitle={
          isArabic
            ? "راجع كثافة العملاء والنشاط الحالي وصورة المحفظة والتقسيم من مساحة إدارية أوضح."
            : "Review client density, activity, wallet signals, and segmentation from a cleaner admin layer."
        }
        tone="accent"
      />

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MiniMetric label={isArabic ? "إجمالي العملاء" : "Total clients"} value={formatNumber(locale, data.summary.totalClients)} note={isArabic ? "إجمالي القاعدة" : "full base"} icon={Users} tone="dark" />
        <MiniMetric label={isArabic ? "النشط هذا الأسبوع" : "Active this week"} value={formatNumber(locale, data.summary.activeThisWeek)} note={isArabic ? "الحركة الأسبوعية" : "weekly motion"} icon={Sparkles} tone="accent" />
        <MiniMetric label={isArabic ? "عملاء كبار" : "VIP clients"} value={formatNumber(locale, data.summary.vipClients)} note={isArabic ? "شريحة مميزة" : "premium segment"} icon={ShieldCheck} tone="sun" />
        <MiniMetric label={isArabic ? "متوسط التقييم" : "Avg rating"} value={formatNumber(locale, data.summary.averageRating)} note={isArabic ? "مؤشر الثقة" : "service trust"} icon={Wallet} tone="primary" />
      </div>

      <DashboardBlock title={isArabic ? "قائمة العملاء" : "Client roster"} eyebrow={isArabic ? "بطاقات الحسابات" : "account deck"}>
        {data.clients.length === 0 ? (
          <EmptyState>{isArabic ? "لا توجد سجلات عملاء" : "No client records"}</EmptyState>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {data.clients.map((client, index) => (
              <div key={client.id} className={index % 2 === 0 ? "onyx-card p-5" : "onyx-card bg-onyx-800/80 p-5"}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-semibold text-white">{client.name}</h2>
                    <p className="mt-2 text-onyx-400">{client.city}</p>
                  </div>
                  <SoftBadge label={client.status} tone={client.status === "VIP" ? "sun" : "accent"} />
                </div>
                <div className="mt-4">
                  <SplitInfo
                    items={[
                      { label: isArabic ? "الطلبات" : "Requests", value: formatNumber(locale, client.requests) },
                      { label: isArabic ? "المحفظة" : "Wallet", value: formatCurrency(locale, client.walletBalance) }
                    ]}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardBlock>
    </div>
  );
}

export function AdminRequestsPage({ locale, initialData }: { locale: Locale; initialData: AdminRequestsData }) {
  const isArabic = locale === "ar";
  const data = useLiveApiData("/admin/requests", initialData);

  return (
    <div>
      <SubpageHero
        eyebrow={isArabic ? "حركة التشغيل" : "Ops traffic"}
        title={isArabic ? "الطلبات" : "Requests"}
        subtitle={
          isArabic
            ? "تابع الطلبات النشطة وحالات النزاع ومتوسط قيمة التذكرة من لوحة تشغيل أوضح."
            : "Track active requests, disputes, and ticket size from a stronger operational board."
        }
        tone="primary"
      />

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MiniMetric label={isArabic ? "نشط الآن" : "Active"} value={formatNumber(locale, data.summary.active)} note={isArabic ? "طلبات حية" : "live jobs"} icon={Wrench} tone="primary" />
        <MiniMetric label={isArabic ? "المكتمل اليوم" : "Completed today"} value={formatNumber(locale, data.summary.completedToday)} note={isArabic ? "مخرجات التنفيذ" : "delivery output"} icon={ShieldCheck} tone="accent" />
        <MiniMetric label={isArabic ? "متنازع عليه" : "Disputed"} value={formatNumber(locale, data.summary.disputed)} note={isArabic ? "يحتاج انتباه" : "attention rail"} icon={Building2} tone="sun" />
        <MiniMetric label={isArabic ? "متوسط التذكرة" : "Avg ticket"} value={formatCurrency(locale, data.summary.averageTicket)} note={isArabic ? "كثافة التسعير" : "pricing density"} icon={CreditCard} tone="dark" />
      </div>

      <DashboardBlock title={isArabic ? "تدفق الطلبات" : "Request stream"} eyebrow={isArabic ? "بطاقات التشغيل" : "ops deck"}>
        <div className="grid gap-4">
          {data.requests.map((request, index) => (
            <div key={request.id} className={index % 2 === 0 ? "onyx-card p-5" : "onyx-card bg-onyx-800/80 p-5"}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-white">{request.title}</h2>
                  <p className="mt-2 text-onyx-400">{request.city}</p>
                </div>
                <SoftBadge label={isArabic ? (request.status === "PENDING" ? "قيد المراجعة" : request.status === "IN_PROGRESS" ? "قيد التنفيذ" : "في الطريق") : request.status} tone={request.status === "PENDING" ? "sun" : request.status === "IN_PROGRESS" ? "accent" : "primary"} />
              </div>
              <div className="mt-4">
                <SplitInfo items={[{ label: "ID", value: request.id }, { label: isArabic ? "القيمة" : "Amount", value: formatCurrency(locale, request.amount) }]} />
              </div>
            </div>
          ))}
        </div>
      </DashboardBlock>
    </div>
  );
}

export function AdminFinancePage({ locale, initialData }: { locale: Locale; initialData: AdminFinanceData }) {
  const isArabic = locale === "ar";
  const data = useLiveApiData("/admin/finance", initialData);

  return (
    <div>
      <SubpageHero
        eyebrow={isArabic ? "التحكم المالي" : "Finance control"}
        title={isArabic ? "المالية" : "Finance"}
        subtitle={
          isArabic
            ? "راجع الإيراد والعمولات والأموال المحجوزة ومسار التحويل من مساحة مالية أوضح."
            : "Review revenue, commissions, escrow, and payout flow from a cleaner finance cockpit."
        }
        tone="sun"
      />

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MiniMetric label={isArabic ? "الإيراد" : "Revenue"} value={formatCurrency(locale, data.summary.totalRevenue)} note={isArabic ? "إجمالي الحجم" : "gross volume"} icon={Wallet} tone="dark" />
        <MiniMetric label={isArabic ? "العمولات" : "Commissions"} value={formatCurrency(locale, data.summary.commissions)} note={isArabic ? "حصة المنصة" : "platform take"} icon={CreditCard} tone="primary" />
        <MiniMetric label={isArabic ? "الأموال المحجوزة" : "Escrow held"} value={formatCurrency(locale, data.summary.escrowHeld)} note={isArabic ? "أموال محمية" : "protected funds"} icon={ShieldCheck} tone="accent" />
        <MiniMetric label={isArabic ? "المفرج عنه هذا الأسبوع" : "Released this week"} value={formatCurrency(locale, data.summary.releasedThisWeek)} note={isArabic ? "حركة الإفراج" : "cash release"} icon={Sparkles} tone="sun" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <DashboardBlock title={isArabic ? "مصادر المال" : "Finance streams"} eyebrow={isArabic ? "طبقات التدفق" : "money layers"}>
          <div className="grid gap-4">
            {data.streams.map((item, index) => (
              <SoftCard key={item.label} className={index % 2 === 0 ? undefined : "bg-onyx-800/80"}>
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-white">{item.label}</p>
                  <p className="text-lg font-semibold text-white">{formatCurrency(locale, item.value)}</p>
                </div>
              </SoftCard>
            ))}
          </div>
        </DashboardBlock>

        <DashboardBlock title={isArabic ? "مسار التحويل" : "Payout rail"} eyebrow={isArabic ? "بطاقات الإفراج" : "release deck"}>
          <div className="grid gap-4">
            {data.payouts.map((item, index) => (
              <div key={item.id} className={index % 2 === 0 ? "onyx-card p-4" : "onyx-card bg-onyx-800/80 p-4"}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{item.label}</p>
                    <p className="mt-1 text-sm text-onyx-400">{item.status}</p>
                  </div>
                  <p className="text-lg font-semibold text-white">{formatCurrency(locale, item.amount)}</p>
                </div>
              </div>
            ))}
          </div>
        </DashboardBlock>
      </div>
    </div>
  );
}

export function AdminSettingsPage({ locale, initialData }: { locale: Locale; initialData: AdminSettingsData }) {
  const isArabic = locale === "ar";
  const liveData = useLiveApiData("/admin/settings", initialData);
  const [data, setData] = useState(initialData);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setData(liveData);
  }, [liveData]);

  function handleSave() {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div>
      <SubpageHero
        eyebrow={isArabic ? "إعدادات المنصة" : "Platform controls"}
        title={isArabic ? "الإعدادات" : "Settings"}
        subtitle={
          isArabic
            ? "تحكم في المنصة والتشغيل والإشراف والدعم من صفحة واحدة أوضح وأكثر تنظيمًا."
            : "Tune platform, operations, moderation, and support settings from one control page."
        }
        tone="dark"
      />

      {saved ? <div className="mb-4 rounded-[1.2rem] border border-success/20 bg-success/10 px-4 py-3 text-sm text-success">{isArabic ? "تم الحفظ محليًا" : "Saved locally"}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <DashboardBlock title={isArabic ? "المنصة" : "Platform"} eyebrow={isArabic ? "إعدادات الهوية" : "brand controls"}>
          <div className="grid gap-4">
            <label className="space-y-2"><span className="text-sm text-onyx-400">{isArabic ? "بريد الدعم" : "Support email"}</span><input value={data.platform.supportEmail} onChange={(event) => setData({ ...data, platform: { ...data.platform, supportEmail: event.target.value } })} className="h-12 w-full rounded-[1rem] border border-onyx-700 bg-onyx-800/50 px-4" /></label>
            <label className="space-y-2"><span className="text-sm text-onyx-400">{isArabic ? "خط الطوارئ" : "Emergency hotline"}</span><input value={data.platform.emergencyHotline} onChange={(event) => setData({ ...data, platform: { ...data.platform, emergencyHotline: event.target.value } })} className="h-12 w-full rounded-[1rem] border border-onyx-700 bg-onyx-800/50 px-4" /></label>
            <label className="space-y-2"><span className="text-sm text-onyx-400">{isArabic ? "اللغة الافتراضية" : "Default language"}</span><input value={data.platform.defaultLanguage} onChange={(event) => setData({ ...data, platform: { ...data.platform, defaultLanguage: event.target.value } })} className="h-12 w-full rounded-[1rem] border border-onyx-700 bg-onyx-800/50 px-4" /></label>
          </div>
        </DashboardBlock>

        <DashboardBlock title={isArabic ? "التشغيل والإشراف" : "Operations + moderation"} eyebrow={isArabic ? "خيارات السياسات" : "policy toggles"}>
          <div className="grid gap-4">
            <label className="onyx-card flex items-center justify-between gap-4 p-4"><span className="font-medium text-white">{isArabic ? "إسناد تلقائي" : "Auto assignment"}</span><input type="checkbox" checked={data.operations.autoAssignmentEnabled} onChange={(event) => setData({ ...data, operations: { ...data.operations, autoAssignmentEnabled: event.target.checked } })} className="h-4 w-4" /></label>
            <label className="onyx-card flex items-center justify-between gap-4 p-4"><span className="font-medium text-white">{isArabic ? "توثيق يدوي إجباري" : "Manual verification required"}</span><input type="checkbox" checked={data.operations.manualVerificationRequired} onChange={(event) => setData({ ...data, operations: { ...data.operations, manualVerificationRequired: event.target.checked } })} className="h-4 w-4" /></label>
            <SplitInfo
              items={[
                { label: isArabic ? "التحويلات" : "Payouts", value: data.operations.payoutsSchedule },
                { label: isArabic ? "ساعات الشكاوى" : "Complaints hrs", value: formatNumber(locale, data.moderation.complaintEscalationHours) },
                { label: isArabic ? "أيام إعادة الفحص" : "Recheck days", value: formatNumber(locale, data.moderation.workerRecheckCycleDays) }
              ]}
            />
          </div>
        </DashboardBlock>
      </div>

      <div className="mt-6 flex justify-end">
        <button type="button" onClick={handleSave} className="inline-flex items-center gap-2 rounded-full bg-dark-950 px-5 py-3 text-sm font-semibold text-white shadow-soft">
          <Save className="h-4 w-4" />
          {isArabic ? "حفظ" : "Save"}
        </button>
      </div>
    </div>
  );
}
