"use client";

import { useEffect, useState } from "react";

import { Briefcase, Clock3, Loader2, MapPin, Route, Wallet, Wrench } from "lucide-react";

import {
  DashboardBlock,
  EmptyState,
  MiniMetric,
  SoftBadge,
  SplitInfo,
  SubpageHero
} from "@/components/dashboard/dashboard-subpage-primitives";
import { useLiveApiData } from "@/hooks/use-live-api-data";
import { patchApiData } from "@/lib/api";
import type { DashboardAreaCode, DashboardServiceCode } from "@/lib/dashboard-data";
import type { Locale } from "@/lib/locales";
import type { WorkerActiveRequestsData, WorkerIncomingRequestsData } from "@/lib/operations-data";

const serviceLabels: Record<DashboardServiceCode, Record<Locale, string>> = {
  electricalRepair: { ar: "عطل كهرباء طارئ", en: "Urgent electrical repair" },
  kitchenPlumbing: { ar: "إصلاح سباكة المطبخ", en: "Kitchen plumbing fix" },
  acMaintenance: { ar: "صيانة تكييف", en: "AC maintenance" },
  electricalInspection: { ar: "كشف كهربائي شامل", en: "Electrical inspection" },
  paintingRefresh: { ar: "تجديد دهانات سريع", en: "Fast painting refresh" },
  livingRoomPainting: { ar: "دهان غرفة المعيشة", en: "Living room painting" },
  ceilingFanInstallation: { ar: "تركيب مروحة سقف", en: "Ceiling fan installation" },
  heaterMaintenance: { ar: "صيانة سخان", en: "Heater maintenance" },
  faucetInstallation: { ar: "تركيب خلاط", en: "Faucet installation" }
};

const areaLabels: Record<DashboardAreaCode, Record<Locale, string>> = {
  newCairo: { ar: "القاهرة الجديدة", en: "New Cairo" },
  nasrCity: { ar: "مدينة نصر", en: "Nasr City" },
  maadi: { ar: "المعادي", en: "Maadi" }
};

function formatNumber(locale: Locale, value: number, digits = 0) {
  return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  }).format(value);
}

function formatCurrency(locale: Locale, value: number) {
  const formatted = formatNumber(locale, value, 0);
  return locale === "ar" ? `${formatted} ج.م` : `EGP ${formatted}`;
}

function urgencyLabel(locale: Locale, value: WorkerIncomingRequestsData["requests"][number]["urgency"]) {
  const labels = {
    NORMAL: { ar: "عادي", en: "Normal" },
    SAME_DAY: { ar: "نفس اليوم", en: "Same day" },
    URGENT: { ar: "عاجل", en: "Urgent" }
  } as const;

  return labels[value][locale];
}

function activeStatusLabel(locale: Locale, value: WorkerActiveRequestsData["requests"][number]["status"]) {
  const labels = {
    EN_ROUTE: { ar: "في الطريق", en: "En route" },
    ON_SITE: { ar: "في الموقع", en: "On site" },
    WRAP_UP: { ar: "اللمسات الأخيرة", en: "Wrap up" }
  } as const;

  return labels[value][locale];
}

export function WorkerIncomingRequestsPage({ locale, initialData }: { locale: Locale; initialData: WorkerIncomingRequestsData }) {
  const isArabic = locale === "ar";
  const liveData = useLiveApiData("/workers/requests/incoming", initialData);
  const [data, setData] = useState(initialData);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    setData(liveData);
  }, [liveData]);

  async function handleIncomingAction(id: string, action: "accept" | "reject") {
    setBusyId(id);
    setFeedback(null);

    try {
      const nextData = await patchApiData<WorkerIncomingRequestsData, Record<string, string>>(
        `/workers/requests/${id}/${action}`,
        action === "accept" ? { workerName: "Youssef El-Sharif" } : {}
      );

      setData(nextData);
      setFeedback(action === "accept" ? (isArabic ? "تم قبول الطلب" : "Request accepted") : isArabic ? "تم رفض الطلب" : "Request rejected");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : isArabic ? "حدثت مشكلة" : "Something went wrong");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <SubpageHero
        eyebrow={isArabic ? "الطابور الساخن" : "Hot queue"}
        title={isArabic ? "الطلبات الواردة" : "Incoming requests"}
        subtitle={
          isArabic
            ? "راجع أفضل الطلبات القريبة مع الميزانية والمسافة واتخذ القرار بسرعة من شاشة أوضح."
            : "Review the strongest nearby jobs with clearer budget, distance, and decision controls."
        }
        actionLabel={isArabic ? "الطلبات النشطة" : "Active jobs"}
        actionHref={`/${locale}/worker/requests/active`}
        tone="accent"
      />

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MiniMetric label={isArabic ? "المتاح الآن" : "Available now"} value={formatNumber(locale, data.summary.availableNow)} note={isArabic ? "الطابور المفتوح" : "open queue"} icon={Briefcase} tone="accent" />
        <MiniMetric label={isArabic ? "نفس اليوم" : "Same day"} value={formatNumber(locale, data.summary.sameDay)} note={isArabic ? "تحويلات سريعة" : "fast conversions"} icon={Clock3} tone="sun" />
        <MiniMetric label={isArabic ? "عاجل" : "Urgent"} value={formatNumber(locale, data.summary.emergency)} note={isArabic ? "طلب ذو أولوية" : "priority demand"} icon={Route} tone="primary" />
        <MiniMetric label={isArabic ? "متوسط الميزانية" : "Avg budget"} value={formatCurrency(locale, data.summary.averageBudget)} note={isArabic ? "متوسط الطابور" : "queue average"} icon={Wallet} tone="dark" />
      </div>

      <DashboardBlock title={isArabic ? "مسار الطلبات الواردة" : "Incoming lane"} eyebrow={isArabic ? "طابور القرار" : "decision queue"}>
        {feedback ? <div className="mb-4 rounded-[1.2rem] border border-dark-200 bg-white px-4 py-3 text-sm text-dark-600">{feedback}</div> : null}
        {data.requests.length === 0 ? (
          <EmptyState>{isArabic ? "الطابور فارغ حاليًا" : "The queue is empty right now"}</EmptyState>
        ) : (
          <div className="grid gap-4">
            {data.requests.map((item, index) => (
              <article key={item.id} className={index % 2 === 0 ? "dashboard-card-soft p-4 sm:p-5" : "dashboard-card-soft bg-accent-50 p-4 sm:p-5"}>
                <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-2xl font-semibold text-dark-950">{serviceLabels[item.service][locale]}</h2>
                      <SoftBadge label={urgencyLabel(locale, item.urgency)} tone={item.urgency === "URGENT" ? "error" : item.urgency === "SAME_DAY" ? "sun" : "accent"} />
                    </div>
                    <div className="mt-4">
                      <SplitInfo
                        items={[
                          { label: isArabic ? "المنطقة" : "Area", value: areaLabels[item.area][locale] },
                          { label: isArabic ? "المسافة" : "Distance", value: `${formatNumber(locale, item.distanceKm, 1)} km` },
                          { label: isArabic ? "الحداثة" : "Freshness", value: isArabic ? `منذ ${formatNumber(locale, item.freshnessMinutes)} د` : `${formatNumber(locale, item.freshnessMinutes)} mins ago` },
                          { label: isArabic ? "الميزانية" : "Budget", value: `${formatCurrency(locale, item.budgetMin)} - ${formatCurrency(locale, item.budgetMax)}` }
                        ]}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => void handleIncomingAction(item.id, "reject")}
                      disabled={busyId === item.id}
                      className="rounded-full border border-dark-200 bg-white px-4 py-2.5 text-sm font-semibold text-dark-700 shadow-soft disabled:opacity-60"
                    >
                      {isArabic ? "رفض" : "Reject"}
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleIncomingAction(item.id, "accept")}
                      disabled={busyId === item.id}
                      className="inline-flex items-center gap-2 rounded-full bg-dark-950 px-4 py-2.5 text-sm font-semibold text-white shadow-soft disabled:opacity-60"
                    >
                      {busyId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wrench className="h-4 w-4" />}
                      {isArabic ? "قبول" : "Accept"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </DashboardBlock>
    </div>
  );
}

export function WorkerActiveRequestsPage({ locale, initialData }: { locale: Locale; initialData: WorkerActiveRequestsData }) {
  const isArabic = locale === "ar";
  const liveData = useLiveApiData("/workers/requests/active", initialData);
  const [data, setData] = useState(initialData);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    setData(liveData);
  }, [liveData]);

  async function handleActiveAction(id: string, action: "start" | "complete") {
    setBusyId(id);
    setFeedback(null);

    try {
      const nextData = await patchApiData<WorkerActiveRequestsData, Record<string, never>>(`/workers/requests/${id}/${action}`, {});
      setData(nextData);
      setFeedback(action === "start" ? (isArabic ? "تم بدء التنفيذ" : "Request started") : isArabic ? "تم النقل إلى الإنهاء" : "Moved to wrap up");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : isArabic ? "حدثت مشكلة" : "Something went wrong");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <SubpageHero
        eyebrow={isArabic ? "المسار النشط" : "Active rail"}
        title={isArabic ? "الطلبات النشطة" : "Active requests"}
        subtitle={
          isArabic
            ? "تابع مسار التنفيذ ومواعيد العملاء والعائد المتوقع من شاشة أكثر ترتيبًا ووضوحًا."
            : "Track in-flight jobs, client windows, and expected earnings through a more polished workflow surface."
        }
        actionLabel={isArabic ? "الوارد" : "Incoming jobs"}
        actionHref={`/${locale}/worker/requests/incoming`}
        tone="primary"
      />

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MiniMetric label={isArabic ? "طلبات نشطة" : "Active jobs"} value={formatNumber(locale, data.summary.activeJobs)} note={isArabic ? "تنفيذ مباشر" : "live operations"} icon={Briefcase} tone="primary" />
        <MiniMetric label={isArabic ? "في الطريق" : "En route"} value={formatNumber(locale, data.summary.enRoute)} note={isArabic ? "مرحلة الوصول" : "travel mode"} icon={Route} tone="accent" />
        <MiniMetric label={isArabic ? "في الموقع" : "On site"} value={formatNumber(locale, data.summary.onSite)} note={isArabic ? "مرحلة التنفيذ" : "execution mode"} icon={MapPin} tone="sun" />
        <MiniMetric label={isArabic ? "إنهاء" : "Wrap up"} value={formatNumber(locale, data.summary.wrapUp)} note={isArabic ? "مرحلة التسليم" : "handover mode"} icon={Wallet} tone="dark" />
      </div>

      <DashboardBlock title={isArabic ? "بطاقات التنفيذ" : "Job deck"} eyebrow={isArabic ? "تنفيذ ميداني" : "field execution"}>
        {feedback ? <div className="mb-4 rounded-[1.2rem] border border-dark-200 bg-white px-4 py-3 text-sm text-dark-600">{feedback}</div> : null}
        {data.requests.length === 0 ? (
          <EmptyState>{isArabic ? "لا توجد طلبات نشطة حاليًا" : "No active jobs right now"}</EmptyState>
        ) : (
          <div className="grid gap-4">
            {data.requests.map((item, index) => (
              <article key={item.id} className={index % 2 === 0 ? "dashboard-card-soft p-4 sm:p-5" : "dashboard-card-soft bg-surface-peach p-4 sm:p-5"}>
                <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-2xl font-semibold text-dark-950">{serviceLabels[item.service][locale]}</h2>
                      <SoftBadge label={activeStatusLabel(locale, item.status)} tone={item.status === "WRAP_UP" ? "success" : item.status === "ON_SITE" ? "sun" : "accent"} />
                    </div>
                    <div className="mt-4">
                      <SplitInfo
                        items={[
                          { label: isArabic ? "العميل" : "Client", value: item.clientName },
                          { label: isArabic ? "المنطقة" : "Area", value: areaLabels[item.area][locale] },
                          { label: isArabic ? "الفترة" : "Window", value: item.scheduledWindow },
                          { label: isArabic ? "العائد" : "Earnings", value: formatCurrency(locale, item.earnings) }
                        ]}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {item.status === "EN_ROUTE" ? (
                      <button
                        type="button"
                        onClick={() => void handleActiveAction(item.id, "start")}
                        disabled={busyId === item.id}
                        className="inline-flex items-center gap-2 rounded-full border border-dark-200 bg-white px-4 py-2.5 text-sm font-semibold text-dark-700 shadow-soft disabled:opacity-60"
                      >
                        {busyId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Clock3 className="h-4 w-4" />}
                        {isArabic ? "بدء" : "Start"}
                      </button>
                    ) : null}
                    {item.status !== "WRAP_UP" ? (
                      <button
                        type="button"
                        onClick={() => void handleActiveAction(item.id, "complete")}
                        disabled={busyId === item.id}
                        className="inline-flex items-center gap-2 rounded-full bg-dark-950 px-4 py-2.5 text-sm font-semibold text-white shadow-soft disabled:opacity-60"
                      >
                        {busyId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
                        {isArabic ? "إنهاء" : "Complete"}
                      </button>
                    ) : (
                      <SoftBadge label={isArabic ? "جاهز" : "Ready"} tone="success" />
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </DashboardBlock>
    </div>
  );
}
