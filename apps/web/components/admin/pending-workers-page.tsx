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
  acTechnician: { ar: "fani takyif", en: "AC Technician" },
  electrician: { ar: "fani kahraba", en: "Electrician" },
  plumber: { ar: "sabak", en: "Plumber" }
};

const statusLabels: Record<DashboardVerificationStatus, Record<Locale, string>> = {
  UNDER_REVIEW: { ar: "2eed el morag3a", en: "Under review" },
  DOCUMENTS_SUBMITTED: { ar: "mostanadat waslet", en: "Docs submitted" },
  AWAITING_ID: { ar: "m7tag ta2keed haweya", en: "Awaiting ID check" }
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
      setFeedback(status === "VERIFIED" ? (isArabic ? "el 3amel etf3al" : "Worker verified") : isArabic ? "el 3amel etrafad" : "Worker rejected");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : isArabic ? "7asal moshkela" : "Something went wrong");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <SubpageHero
        eyebrow={isArabic ? "verification rail" : "Verification rail"}
        title={isArabic ? "3ommal el tawthee2 el mo3ala2" : "Pending worker verification"}
        subtitle={
          isArabic
            ? "rage3 el priority queue, e2ra2 readiness el mostanadat, w 5od karar verify aw reject mn dashboard a2wa."
            : "Review the priority queue, inspect document readiness, and take faster verify or reject decisions from a stronger control view."
        }
        actionLabel={isArabic ? "dashboards hub" : "Dashboard hub"}
        actionHref={`/${locale}/dashboards`}
        tone="sun"
      />

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MiniMetric label={isArabic ? "egmaly el mo3ala2" : "Total pending"} value={formatNumber(locale, data.summary.totalPending)} note={isArabic ? "full queue" : "full queue"} icon={Users} tone="sun" />
        <MiniMetric label={isArabic ? "awlaweya 3alya" : "High priority"} value={formatNumber(locale, data.summary.highPriority)} note={isArabic ? "needs attention" : "needs attention"} icon={ShieldQuestion} tone="primary" />
        <MiniMetric label={isArabic ? "wasal elyoum" : "Submitted today"} value={formatNumber(locale, data.summary.submittedToday)} note={isArabic ? "fresh arrivals" : "fresh arrivals"} icon={Clock3} tone="accent" />
        <MiniMetric label={isArabic ? "motawaset el morag3a" : "Avg review time"} value={isArabic ? `${formatNumber(locale, data.summary.averageReviewHours)} sa3a` : `${formatNumber(locale, data.summary.averageReviewHours)} hrs`} note={isArabic ? "current review speed" : "current review speed"} icon={CheckCircle2} tone="dark" />
      </div>

      <DashboardBlock title={isArabic ? "queue filters" : "Queue filters"} eyebrow={isArabic ? "segment view" : "segment view"}>
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
                  : "border border-dark-200 bg-white text-dark-600 hover:border-primary-300 hover:text-primary-700"
              )}
            >
              {status === "ALL"
                ? isArabic
                  ? "el kol"
                  : "All"
                : statusLabels[status][locale]}
            </button>
          ))}
        </div>
      </DashboardBlock>

      <DashboardBlock title={isArabic ? "verification queue" : "Verification queue"} eyebrow={isArabic ? "decision deck" : "decision deck"} className="mt-6">
        {feedback ? <div className="mb-4 rounded-[1.2rem] border border-dark-200 bg-white px-4 py-3 text-sm text-dark-600">{feedback}</div> : null}
        {filteredWorkers.length === 0 ? (
          <EmptyState>{isArabic ? "mafeesh workers fe el filter da" : "No workers in this filter"}</EmptyState>
        ) : (
          <div className="grid gap-4">
            {filteredWorkers.map((worker, index) => (
              <article key={worker.id} className={index % 2 === 0 ? "dashboard-card-soft p-5" : "dashboard-card-soft bg-surface-peach p-5"}>
                <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-2xl font-semibold text-dark-950">{worker.name}</h2>
                      <SoftBadge
                        label={statusLabels[worker.status][locale]}
                        tone={worker.status === "AWAITING_ID" ? "error" : worker.status === "UNDER_REVIEW" ? "sun" : "accent"}
                      />
                    </div>
                    <p className="mt-2 text-body text-dark-500">{specialtyLabels[worker.specialty][locale]} - {worker.area}</p>
                    <div className="mt-4">
                      <SplitInfo
                        items={[
                          { label: isArabic ? "submitted" : "Submitted", value: worker.submittedAt },
                          { label: isArabic ? "docs" : "Docs", value: `${formatNumber(locale, worker.documentsReady)}/5` },
                          { label: isArabic ? "experience" : "Experience", value: isArabic ? `${formatNumber(locale, worker.experienceYears)} seneen` : `${formatNumber(locale, worker.experienceYears)} years` },
                          { label: isArabic ? "rating" : "Rating", value: formatNumber(locale, worker.rating) }
                        ]}
                      />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3 text-sm text-dark-500">
                      <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> {isArabic ? "identity + docs lane" : "identity + docs lane"}</span>
                      <span className="inline-flex items-center gap-2"><Star className="h-4 w-4 text-sun-500" /> {formatNumber(locale, worker.rating)}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 xl:w-[15rem] xl:justify-end">
                    <button
                      type="button"
                      onClick={() => void handleDecision(worker.id, "REJECTED")}
                      disabled={busyId === worker.id}
                      className="inline-flex items-center gap-2 rounded-full border border-dark-200 bg-white px-4 py-2.5 text-sm font-semibold text-dark-700 shadow-soft disabled:opacity-60"
                    >
                      {busyId === worker.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                      {isArabic ? "refd" : "Reject"}
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDecision(worker.id, "VERIFIED")}
                      disabled={busyId === worker.id}
                      className="inline-flex items-center gap-2 rounded-full bg-dark-950 px-4 py-2.5 text-sm font-semibold text-white shadow-soft disabled:opacity-60"
                    >
                      {busyId === worker.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                      {isArabic ? "verify" : "Verify"}
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
