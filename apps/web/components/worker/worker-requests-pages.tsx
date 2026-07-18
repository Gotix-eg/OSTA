"use client";

import { useEffect, useState } from "react";

import { Briefcase, Clock3, Loader2, MapPin, Route, Wallet, Wrench, MessageSquare, Phone } from "lucide-react";

import {
  WorkerProAction,
  WorkerProBadge,
  WorkerProEmpty,
  WorkerProHero,
  WorkerProMetric,
  WorkerProPanel,
  WorkerProShell,
  WorkerProTopStrip
} from "@/components/worker/worker-pro-ui";
import { useLiveApiData } from "@/hooks/use-live-api-data";
import { fetchApiData, patchApiData } from "@/lib/api";
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
    let price: number | undefined = undefined;

    if (action === "accept") {
      const promptText = isArabic
        ? "أدخل السعر/الميزانية المقترحة لإنجاز هذا الطلب (ج.م):"
        : "Enter your proposed price/budget for this request (EGP):";
      const userInput = prompt(promptText);
      if (userInput === null) {
        return; // User clicked Cancel
      }
      const parsed = parseFloat(userInput);
      if (isNaN(parsed) || parsed <= 0) {
        alert(isArabic ? "يرجى إدخال سعر صحيح أكبر من الصفر." : "Please enter a valid price greater than zero.");
        return;
      }
      price = parsed;
    }

    setBusyId(id);
    setFeedback(null);

    try {
      // Both accept and reject now return updated WorkerIncomingRequestsData
      const nextData = await patchApiData<WorkerIncomingRequestsData, any>(
        `/workers/requests/${id}/${action}`,
        action === "accept" ? { workerName: "Youssef El-Sharif", price } : {}
      );

      setData(nextData);
      setFeedback(action === "accept" ? (isArabic ? "تم قبول الطلب ✅" : "Request accepted ✅") : isArabic ? "تم رفض الطلب" : "Request rejected");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : isArabic ? "حدثت مشكلة" : "Something went wrong");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <WorkerProShell locale={locale}>
      <WorkerProTopStrip locale={locale} title={isArabic ? "الطلبات الواردة" : "Service requests"} actionHref={`/${locale}/worker/requests/active`} actionLabel={isArabic ? "النشطة" : "Active jobs"} />
      <WorkerProHero
        locale={locale}
        eyebrow={isArabic ? "لوحة المحترفين" : "Pro dashboard"}
        title={isArabic ? "طلبات" : "Incoming"}
        highlight={isArabic ? "واردة" : "requests"}
        subtitle={isArabic ? "راجع الطلبات القريبة مع الميزانية والمسافة واتخذ القرار بسرعة." : "Review nearby jobs with budget, distance, and fast accept or reject controls."}
        actionHref={`/${locale}/worker/requests/active`}
        actionLabel={isArabic ? "الطلبات النشطة" : "Active jobs"}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <WorkerProMetric label={isArabic ? "متاح الآن" : "Available now"} value={formatNumber(locale, data.summary.availableNow)} note={isArabic ? "طابور مفتوح" : "queue flow"} icon={Briefcase} index="01" />
        <WorkerProMetric label={isArabic ? "نفس اليوم" : "Same day"} value={formatNumber(locale, data.summary.sameDay)} note={isArabic ? "سريع" : "fast lane"} icon={Clock3} index="02" />
        <WorkerProMetric label={isArabic ? "عاجل" : "Urgent"} value={formatNumber(locale, data.summary.emergency)} note={isArabic ? "أولوية" : "priority"} icon={Route} index="03" />
        <WorkerProMetric label={isArabic ? "متوسط الميزانية" : "Avg budget"} value={formatCurrency(locale, data.summary.averageBudget)} note={isArabic ? "متوسط" : "average"} icon={Wallet} index="04" />
      </div>

      <WorkerProPanel eyebrow={isArabic ? "طابور القرار" : "Decision queue"} title={isArabic ? "مسار الطلبات الواردة" : "Incoming lane"}>
        {feedback ? <div className="mb-4 border border-gold/40 bg-gold/10 px-4 py-3 text-sm font-black text-gold">{feedback}</div> : null}
        {data.requests.length === 0 ? (
          <WorkerProEmpty title={isArabic ? "الطابور فارغ" : "Queue is empty"} text={isArabic ? "لا توجد طلبات واردة حالياً في نطاقك." : "No incoming jobs in your service area right now."} actionLabel={isArabic ? "تحديث المهارات" : "Update skills"} actionHref={`/${locale}/worker/settings`} />
        ) : (
          <div className="grid gap-5">
            {data.requests.map((item, index) => {
              const title = isArabic ? (item.serviceNameAr || serviceLabels[item.service]?.[locale] || item.service) : (item.serviceNameEn || serviceLabels[item.service]?.[locale] || item.service);
              const area = isArabic ? (item.areaNameAr || areaLabels[item.area]?.[locale] || item.area) : (item.areaNameEn || areaLabels[item.area]?.[locale] || item.area);
              return (
                <article key={item.id} className={index % 2 === 0 ? "grid gap-5 border border-white/10 bg-[#111] p-5 lg:grid-cols-[180px_1fr_auto]" : "grid gap-5 border border-gold/30 bg-[#2a2207] p-5 lg:grid-cols-[180px_1fr_auto]"}>
                  <div className="min-h-36 border border-white/10 bg-gold/10 p-4 text-xs font-black uppercase text-white/45">
                    {isArabic ? "طلب وارد" : "Incoming request"}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <WorkerProBadge tone={item.urgency === "URGENT" ? "red" : item.urgency === "SAME_DAY" ? "gold" : "muted"}>{urgencyLabel(locale, item.urgency)}</WorkerProBadge>
                      <span className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">{formatNumber(locale, item.freshnessMinutes)} min</span>
                    </div>
                    <h2 className="mt-4 text-2xl font-black uppercase text-white">{title}</h2>
                    <p className="mt-3 text-sm leading-6 text-white/55">{area} | {formatNumber(locale, item.distanceKm, 1)} km</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <WorkerProBadge tone="muted">{isArabic ? "ميزانية" : "Budget"} {formatCurrency(locale, item.budgetMin)} - {formatCurrency(locale, item.budgetMax)}</WorkerProBadge>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 lg:flex-col lg:items-stretch lg:justify-center">
                    {item.clientUserId ? (
                      <WorkerProAction tone="ghost" onClick={() => window.dispatchEvent(new CustomEvent("osta_open_chat", { detail: { id: item.clientUserId, firstName: item.clientName || "", lastName: "" } }))}>
                        <MessageSquare className="h-4 w-4" />
                        {isArabic ? "محادثة" : "Chat"}
                      </WorkerProAction>
                    ) : null}
                    <WorkerProAction tone="ghost" onClick={() => void handleIncomingAction(item.id, "reject")} disabled={busyId === item.id}>{isArabic ? "رفض" : "Reject"}</WorkerProAction>
                    <WorkerProAction tone="light" onClick={() => void handleIncomingAction(item.id, "accept")} disabled={busyId === item.id}>
                      {busyId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wrench className="h-4 w-4" />}
                      {isArabic ? "قبول" : "Accept job"}
                    </WorkerProAction>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </WorkerProPanel>
    </WorkerProShell>
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
      // Server returns updated active requests for both start and complete
      if (nextData && typeof nextData === "object" && "requests" in nextData) {
        setData(nextData);
      }
      setFeedback(
        action === "start"
          ? (isArabic ? "تم بدء التنفيذ ✅" : "Request started ✅")
          : (isArabic ? "تم إنجاز الطلب ✅" : "Request completed ✅")
      );
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : isArabic ? "حدثت مشكلة" : "Something went wrong");
    } finally {
      setBusyId(null);
    }
  }

  async function handleEditActivePrice(id: string, currentEarnings: number) {
    const promptText = isArabic
      ? `أدخل السعر/العائد الجديد المقترح (ج.م) [الحالي: ${formatCurrency(locale, currentEarnings)}]:`
      : `Enter new proposed price/earnings (EGP) [Current: ${formatCurrency(locale, currentEarnings)}]:`;
    
    const userInput = prompt(promptText);
    if (userInput === null) return;
    
    const parsed = parseFloat(userInput);
    if (isNaN(parsed) || parsed <= 0) {
      alert(isArabic ? "يرجى إدخال سعر صحيح أكبر من الصفر." : "Please enter a valid price greater than zero.");
      return;
    }

    setBusyId(id);
    setFeedback(null);

    try {
      await patchApiData<any, any>(
        `/workers/requests/${id}/budget`,
        { price: parsed }
      );
      setFeedback(isArabic ? "تم تحديث السعر بنجاح" : "Price updated successfully");
      const nextData = await fetchApiData<WorkerActiveRequestsData>("/workers/requests/active", initialData);
      setData(nextData);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : isArabic ? "حدثت مشكلة" : "Something went wrong");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <WorkerProShell locale={locale}>
      <WorkerProTopStrip locale={locale} title={isArabic ? "الطلبات النشطة" : "Active requests"} actionHref={`/${locale}/worker/requests/incoming`} actionLabel={isArabic ? "الوارد" : "Incoming"} />
      <WorkerProHero
        locale={locale}
        eyebrow={isArabic ? "تنفيذ ميداني" : "Field execution"}
        title={isArabic ? "طلبات" : "Active"}
        highlight={isArabic ? "نشطة" : "jobs"}
        subtitle={isArabic ? "تابع مسار التنفيذ ومواعيد العملاء والعائد المتوقع من شاشة عمليات مباشرة." : "Track in-flight jobs, client windows, and expected earnings from a live operations lane."}
        actionHref={`/${locale}/worker/requests/incoming`}
        actionLabel={isArabic ? "الطلبات الواردة" : "Incoming jobs"}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <WorkerProMetric label={isArabic ? "طلبات نشطة" : "Active jobs"} value={formatNumber(locale, data.summary.activeJobs)} note={isArabic ? "تنفيذ مباشر" : "live operations"} icon={Briefcase} index="01" />
        <WorkerProMetric label={isArabic ? "في الطريق" : "En route"} value={formatNumber(locale, data.summary.enRoute)} note={isArabic ? "مرحلة الوصول" : "travel mode"} icon={Route} index="02" />
        <WorkerProMetric label={isArabic ? "في الموقع" : "On site"} value={formatNumber(locale, data.summary.onSite)} note={isArabic ? "مرحلة التنفيذ" : "execution mode"} icon={MapPin} index="03" />
        <WorkerProMetric label={isArabic ? "إنهاء" : "Wrap up"} value={formatNumber(locale, data.summary.wrapUp)} note={isArabic ? "مرحلة التسليم" : "handover mode"} icon={Wallet} index="04" />
      </div>

      <WorkerProPanel eyebrow={isArabic ? "مسار التنفيذ" : "Execution lane"} title={isArabic ? "بطاقات العمل الحالية" : "Current job deck"}>
        {feedback ? <div className="mb-4 border border-gold/40 bg-gold/10 px-4 py-3 text-sm font-black text-gold">{feedback}</div> : null}
        {data.requests.length === 0 ? (
          <WorkerProEmpty title={isArabic ? "لا توجد طلبات نشطة" : "No active jobs"} text={isArabic ? "الطلبات التي تقبلها ستظهر هنا مع خطوات التنفيذ." : "Accepted jobs will appear here with execution controls."} actionLabel={isArabic ? "راجع الوارد" : "Check incoming"} actionHref={`/${locale}/worker/requests/incoming`} />
        ) : (
          <div className="grid gap-5">
            {data.requests.map((item, index) => {
              const title = isArabic ? (item.serviceNameAr || serviceLabels[item.service]?.[locale] || item.service) : (item.serviceNameEn || serviceLabels[item.service]?.[locale] || item.service);
              const area = isArabic ? (item.areaNameAr || areaLabels[item.area]?.[locale] || item.area) : (item.areaNameEn || areaLabels[item.area]?.[locale] || item.area);
              return (
                <article key={item.id} className={index % 2 === 0 ? "border border-white/10 bg-[#111] p-5" : "border border-gold/30 bg-[#2a2207] p-5"}>
                  <div className="grid gap-5 xl:grid-cols-[1fr_auto] xl:items-center">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <WorkerProBadge tone={item.status === "WRAP_UP" ? "green" : item.status === "ON_SITE" ? "gold" : "muted"}>{activeStatusLabel(locale, item.status)}</WorkerProBadge>
                        <span className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">{item.scheduledWindow}</span>
                      </div>
                      <h2 className="mt-4 text-2xl font-black uppercase text-white">{title}</h2>
                      <div className="mt-4 grid gap-3 text-sm font-semibold text-white/55 md:grid-cols-2 xl:grid-cols-5">
                        <span>{isArabic ? "العميل" : "Client"}: {item.clientName}</span>
                        {item.clientPhone ? <span>{isArabic ? "الهاتف" : "Phone"}: {item.clientPhone}</span> : null}
                        <span>{isArabic ? "المنطقة" : "Area"}: {area}</span>
                        <span>{isArabic ? "الفترة" : "Window"}: {item.scheduledWindow}</span>
                        <span className="text-gold">{isArabic ? "العائد" : "Earnings"}: {formatCurrency(locale, item.earnings)}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 xl:justify-end">
                      <WorkerProAction
                        tone="ghost"
                        onClick={() => {
                          window.dispatchEvent(new CustomEvent("osta_open_chat", {
                            detail: { id: item.clientUserId, firstName: item.clientName, lastName: "" }
                          }));
                        }}
                      >
                        <MessageSquare className="h-4 w-4" />
                        {isArabic ? "محادثة" : "Chat"}
                      </WorkerProAction>
                      {item.status !== "WRAP_UP" ? (
                        <WorkerProAction tone="ghost" onClick={() => void handleEditActivePrice(item.id, item.earnings)} disabled={busyId === item.id}>
                          <Wallet className="h-4 w-4" />
                          {isArabic ? "السعر" : "Price"}
                        </WorkerProAction>
                      ) : null}
                      {item.status === "EN_ROUTE" ? (
                        <WorkerProAction tone="light" onClick={() => void handleActiveAction(item.id, "start")} disabled={busyId === item.id}>
                          {busyId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Clock3 className="h-4 w-4" />}
                          {isArabic ? "بدء" : "Start"}
                        </WorkerProAction>
                      ) : null}
                      {item.status !== "WRAP_UP" ? (
                        <WorkerProAction tone="light" onClick={() => void handleActiveAction(item.id, "complete")} disabled={busyId === item.id}>
                          {busyId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
                          {isArabic ? "إنهاء" : "Complete"}
                        </WorkerProAction>
                      ) : (
                        <WorkerProBadge tone="green">{isArabic ? "جاهز" : "Ready"}</WorkerProBadge>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </WorkerProPanel>
    </WorkerProShell>
  );
}
