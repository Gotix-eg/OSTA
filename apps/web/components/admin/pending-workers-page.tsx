"use client";

import { useEffect, useMemo, useState } from "react";

import { CheckCircle2, Clock3, Loader2, ShieldCheck, ShieldQuestion, Star, Users, XCircle } from "lucide-react";

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
import { patchApiData } from "@/lib/api";
import type { DashboardVerificationStatus, DashboardWorkerSpecialtyCode } from "@/lib/dashboard-data";
import type { Locale } from "@/lib/locales";
import type { PendingWorkersData } from "@/lib/operations-data";
import { cn } from "@/lib/utils";

const specialtyLabels: Record<DashboardWorkerSpecialtyCode, Record<Locale, string>> = {
  acTechnician: { ar: "فني تكييف", en: "AC Technician" },
  electrician: { ar: "فني كهرباء", en: "Electrician" },
  plumber: { ar: "سباك", en: "Plumber" }
};

const statusLabels: Record<DashboardVerificationStatus, Record<Locale, string>> = {
  UNDER_REVIEW: { ar: "قيد المراجعة", en: "Under review" },
  DOCUMENTS_SUBMITTED: { ar: "المستندات مكتملة", en: "Docs submitted" },
  AWAITING_ID: { ar: "بانتظار تأكيد الهوية", en: "Awaiting ID check" }
};

function formatNumber(locale: Locale, value: number) {
  return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US", { maximumFractionDigits: 0 }).format(value);
}

export function PendingWorkersPage({ locale, initialData }: { locale: Locale; initialData: PendingWorkersData }) {
  const isArabic = locale === "ar";
  const liveData = useLiveApiData("/admin/workers/pending", initialData);
  const [data, setData] = useState(initialData);
  const [activeFilter, setActiveFilter] = useState<DashboardVerificationStatus | "ALL">("ALL");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    setData(liveData);
  }, [liveData]);

  const filteredWorkers = useMemo(
    () => data.workers.filter((item) => activeFilter === "ALL" || item.status === activeFilter),
    [activeFilter, data.workers]
  );

  async function handleDecision(id: string, status: "VERIFIED" | "REJECTED") {
    setBusyId(id);
    setFeedback(null);

    try {
      const nextData = await patchApiData<PendingWorkersData, { status: "VERIFIED" | "REJECTED" }>(`/admin/workers/${id}/verify`, {
        status
      });

      setData(nextData);
      setFeedback(status === "VERIFIED" ? (isArabic ? "تم تفعيل حساب العامل بنجاح" : "Worker verified") : isArabic ? "تم رفض حساب العامل" : "Worker rejected");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : isArabic ? "حدثت مشكلة أثناء المعالجة" : "Something went wrong");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <SubpageHero
        eyebrow={isArabic ? "مسار التوثيق" : "Verification rail"}
        title={isArabic ? "توثيقات العمال المعلقة" : "Pending worker verification"}
        subtitle={
          isArabic
            ? "راجع قائمة الانتظار ذات الأولوية، تحقق من جاهزية المستندات، واتخذ قرار القبول أو الرفض من لوحة التحكم."
            : "Review the priority queue, inspect document readiness, and take faster verify or reject decisions from a stronger control view."
        }
        actionLabel={isArabic ? "لوحة الإدارة" : "Admin Dashboard"}
        actionHref={`/${locale}/admin`}
        tone="sun"
      />

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MiniMetric label={isArabic ? "إجمالي المعلق" : "Total pending"} value={formatNumber(locale, data.summary.totalPending)} note={isArabic ? "كامل قائمة الانتظار" : "full queue"} icon={Users} tone="sun" />
        <MiniMetric label={isArabic ? "أولوية عالية" : "High priority"} value={formatNumber(locale, data.summary.highPriority)} note={isArabic ? "تحتاج إلى اهتمام" : "needs attention"} icon={ShieldQuestion} tone="primary" />
        <MiniMetric label={isArabic ? "وصل اليوم" : "Submitted today"} value={formatNumber(locale, data.summary.submittedToday)} note={isArabic ? "توثيقات جديدة" : "fresh arrivals"} icon={Clock3} tone="accent" />
        <MiniMetric label={isArabic ? "متوسط وقت المراجعة" : "Avg review time"} value={isArabic ? `${formatNumber(locale, data.summary.averageReviewHours)} ساعة` : `${formatNumber(locale, data.summary.averageReviewHours)} hrs`} note={isArabic ? "سرعة المراجعة الحالية" : "current review speed"} icon={CheckCircle2} tone="dark" />
      </div>

      <DashboardBlock title={isArabic ? "تصفية القائمة" : "Queue filters"} eyebrow={isArabic ? "عرض الفئات" : "segment view"}>
        <div className="flex flex-wrap gap-3">
          {(["ALL", "UNDER_REVIEW", "DOCUMENTS_SUBMITTED", "AWAITING_ID"] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setActiveFilter(status)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition",
                activeFilter === status
                  ? "bg-dark-950 text-white shadow-soft"
                  : "border border-onyx-700 bg-onyx-800/50 text-onyx-300 hover:border-primary-300 hover:text-primary-700"
              )}
            >
              {status === "ALL"
                ? isArabic
                  ? "الكل"
                  : "All"
                : statusLabels[status][locale]}
            </button>
          ))}
        </div>
      </DashboardBlock>

      <DashboardBlock title={isArabic ? "طابور التوثيق" : "Verification queue"} eyebrow={isArabic ? "لوحة القرارات" : "decision deck"} className="mt-6">
        {feedback ? <div className="mb-4 rounded-[1.2rem] border border-onyx-700 bg-onyx-800/50 px-4 py-3 text-sm text-onyx-300">{feedback}</div> : null}
        {filteredWorkers.length === 0 ? (
          <EmptyState>{isArabic ? "لا توجد طلبات توثيق مطابقة للتصفية حالياً" : "No workers in this filter"}</EmptyState>
        ) : (
          <div className="grid gap-4">
            {filteredWorkers.map((worker, index) => (
              <article key={worker.id} className={index % 2 === 0 ? "onyx-card p-5" : "onyx-card bg-onyx-800/80 p-5"}>
                <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-2xl font-semibold text-white">{worker.name}</h2>
                      <SoftBadge
                        label={statusLabels[worker.status][locale]}
                        tone={worker.status === "AWAITING_ID" ? "error" : worker.status === "UNDER_REVIEW" ? "sun" : "accent"}
                      />
                    </div>
                    <p className="mt-2 text-body text-onyx-400">{specialtyLabels[worker.specialty][locale]} - {worker.area}</p>
                    <div className="mt-4">
                      <SplitInfo
                        items={[
                          { label: isArabic ? "تاريخ التقديم" : "Submitted", value: worker.submittedAt },
                          { label: isArabic ? "المستندات" : "Docs", value: `${formatNumber(locale, worker.documentsReady)}/5` },
                          { label: isArabic ? "الخبرة" : "Experience", value: isArabic ? `${formatNumber(locale, worker.experienceYears)} سنوات` : `${formatNumber(locale, worker.experienceYears)} years` },
                          { label: isArabic ? "التقييم" : "Rating", value: formatNumber(locale, worker.rating) }
                        ]}
                      />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3 text-sm text-onyx-400">
                      <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> {isArabic ? "مسار التحقق من الهوية والمستندات" : "identity + docs lane"}</span>
                      <span className="inline-flex items-center gap-2"><Star className="h-4 w-4 text-sun-500" /> {formatNumber(locale, worker.rating)}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 xl:w-[15rem] xl:justify-end">
                    <button
                      type="button"
                      onClick={() => void handleDecision(worker.id, "REJECTED")}
                      disabled={busyId === worker.id}
                      className="inline-flex items-center gap-2 rounded-full border border-onyx-700 bg-onyx-800/50 px-4 py-2.5 text-sm font-semibold text-onyx-200 shadow-soft disabled:opacity-60"
                    >
                      {busyId === worker.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                      {isArabic ? "رفض" : "Reject"}
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDecision(worker.id, "VERIFIED")}
                      disabled={busyId === worker.id}
                      className="inline-flex items-center gap-2 rounded-full bg-dark-950 px-4 py-2.5 text-sm font-semibold text-white shadow-soft disabled:opacity-60"
                    >
                      {busyId === worker.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                      {isArabic ? "توثيق" : "Verify"}
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
