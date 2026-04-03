"use client";

import Link from "next/link";

import {
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  MapPin,
  ShieldCheck,
  Sparkles,
  TimerReset,
  Wrench
} from "lucide-react";

import { serviceCategories } from "@/lib/shared";

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
import type { ClientRequestDetailData, ClientRequestListItem } from "@/lib/operations-data";

const savedAddresses = {
  "home-new-cairo": { ar: "المنزل - القاهرة الجديدة", en: "Home - New Cairo" },
  "villa-maadi": { ar: "الفيلا - المعادي", en: "Villa - Maadi" }
} as const;

function formatDate(locale: Locale, value: string) {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function getServiceName(serviceId: string, locale: Locale) {
  for (const category of serviceCategories) {
    const service = category.services.find((item) => item.id === serviceId);
    if (service) return service.name[locale];
  }

  return serviceId;
}

function getStatusMeta(locale: Locale, status: ClientRequestListItem["status"]) {
  const labels = {
    PENDING: { ar: "قيد المراجعة", en: "Pending review", tone: "sun" as const },
    WORKER_EN_ROUTE: { ar: "العامل في الطريق", en: "Worker en route", tone: "accent" as const },
    IN_PROGRESS: { ar: "قيد التنفيذ", en: "In progress", tone: "primary" as const },
    COMPLETED: { ar: "مكتمل", en: "Completed", tone: "success" as const }
  } as const;

  return {
    label: labels[status][locale],
    tone: labels[status].tone
  };
}

function formatTiming(locale: Locale, timing: ClientRequestDetailData["timing"]) {
  if (timing.type === "emergency") return locale === "ar" ? "طوارئ خلال ساعة" : "Emergency within 1 hour";
  if (timing.type === "today") return locale === "ar" ? "اليوم" : "Today";
  if (timing.type === "tomorrow") return locale === "ar" ? "غدًا" : "Tomorrow";
  return `${timing.customDate ?? "-"} ${timing.customWindow ?? ""}`.trim();
}

function resolveAddress(locale: Locale, detail: ClientRequestDetailData) {
  if (detail.address.mode === "saved") {
    const saved = detail.address.savedAddressId ? savedAddresses[detail.address.savedAddressId as keyof typeof savedAddresses] : null;
    return saved ? saved[locale] : locale === "ar" ? "عنوان محفوظ" : "Saved address";
  }

  return [detail.address.governorate, detail.address.city, detail.address.district, detail.address.street].filter(Boolean).join(", ");
}

export function ClientRequestsPage({ locale, initialData }: { locale: Locale; initialData: ClientRequestListItem[] }) {
  const isArabic = locale === "ar";
  const data = useLiveApiData("/clients/requests", initialData);

  const counts = {
    total: data.length,
    pending: data.filter((item) => item.status === "PENDING").length,
    active: data.filter((item) => item.status === "WORKER_EN_ROUTE" || item.status === "IN_PROGRESS").length,
    completed: data.filter((item) => item.status === "COMPLETED").length
  };

  return (
    <div>
      <SubpageHero
        eyebrow={isArabic ? "مكتب الطلبات" : "Request desk"}
        title={isArabic ? "طلباتي" : "My requests"}
        subtitle={
          isArabic
            ? "شاهد كل الطلبات وحالتها وتوقيت إنشائها من مساحة أوضح وأكثر تنظيمًا."
            : "Track every request, its current status, and the booking timeline from one clearer workspace."
        }
        actionLabel={isArabic ? "طلب جديد" : "New request"}
        actionHref={`/${locale}/client/new-request`}
        tone="primary"
      />

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MiniMetric label={isArabic ? "إجمالي الطلبات" : "Total requests"} value={String(counts.total)} note={isArabic ? "كل الطلبات المنشأة" : "all created jobs"} icon={Wrench} tone="primary" />
        <MiniMetric label={isArabic ? "قيد المراجعة" : "Pending review"} value={String(counts.pending)} note={isArabic ? "ما زالت تنتظر الإجراء" : "still waiting for action"} icon={TimerReset} tone="sun" />
        <MiniMetric label={isArabic ? "طلبات نشطة" : "Active requests"} value={String(counts.active)} note={isArabic ? "متابعة مباشرة" : "live follow-up"} icon={Sparkles} tone="accent" />
        <MiniMetric label={isArabic ? "مكتملة" : "Completed"} value={String(counts.completed)} note={isArabic ? "أغلقت بنجاح" : "closed successfully"} icon={CheckCircle2} tone="dark" />
      </div>

      <DashboardBlock title={isArabic ? "تدفق الطلبات" : "Request stream"} eyebrow={isArabic ? "الطابور المباشر" : "live queue"}>
        {data.length === 0 ? (
          <EmptyState>{isArabic ? "لا توجد طلبات حاليًا" : "No requests yet"}</EmptyState>
        ) : (
          <div className="grid gap-4">
            {data.map((item) => {
              const status = getStatusMeta(locale, item.status);

              return (
                <article key={item.id} className="dashboard-card-soft p-4 sm:p-5">
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-2xl font-semibold text-dark-950">{item.title}</h2>
                        <SoftBadge label={status.label} tone={status.tone} />
                      </div>
                      <div className="mt-4">
                        <SplitInfo
                          items={[
                            { label: isArabic ? "رقم الطلب" : "Request no", value: item.requestNumber },
                            { label: isArabic ? "الخدمة" : "Service", value: getServiceName(item.serviceId, locale) },
                            { label: isArabic ? "المنطقة" : "Area", value: item.area },
                            { label: isArabic ? "تاريخ الإنشاء" : "Created", value: formatDate(locale, item.createdAt) }
                          ]}
                        />
                      </div>
                    </div>

                    <Link href={`/${locale}/client/request/${item.id}`} className="inline-flex items-center gap-2 rounded-full border border-dark-200 bg-white px-4 py-2.5 text-sm font-semibold text-dark-700 shadow-soft transition hover:border-primary-300 hover:text-primary-700">
                      {isArabic ? "التفاصيل" : "Details"}
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </DashboardBlock>
    </div>
  );
}

export function ClientRequestDetailPage({ locale, requestId, initialData }: { locale: Locale; requestId: string; initialData: ClientRequestDetailData }) {
  const isArabic = locale === "ar";
  const data = useLiveApiData(`/clients/requests/${requestId}`, initialData);
  const status = getStatusMeta(locale, data.status);

  return (
    <div>
      <SubpageHero
        eyebrow={data.requestNumber}
        title={data.title}
        subtitle={data.description}
        actionLabel={isArabic ? "العودة إلى الطلبات" : "Back to requests"}
        actionHref={`/${locale}/client/my-requests`}
        tone="accent"
      />

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MiniMetric label={isArabic ? "الحالة" : "Status"} value={status.label} note={isArabic ? "الحالة الحالية للطلب" : "current request state"} icon={ShieldCheck} tone="primary" />
        <MiniMetric label={isArabic ? "الخدمة" : "Service"} value={getServiceName(data.serviceId, locale)} note={isArabic ? "الفئة المطلوبة" : "requested category"} icon={Wrench} tone="sun" />
        <MiniMetric label={isArabic ? "التوقيت" : "Timing"} value={formatTiming(locale, data.timing)} note={isArabic ? "الموعد المفضل" : "preferred schedule"} icon={Clock3} tone="accent" />
        <MiniMetric label={isArabic ? "المنطقة" : "Area"} value={data.area} note={isArabic ? "منطقة الخدمة" : "delivery zone"} icon={MapPin} tone="dark" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <DashboardBlock title={isArabic ? "سياق الطلب" : "Request context"} eyebrow={isArabic ? "تفاصيل المشكلة" : "issue profile"}>
          <div className="grid gap-4">
            <SoftCard>
              <p className="text-xs uppercase tracking-[0.22em] text-dark-400">{isArabic ? "الخدمة" : "Service"}</p>
              <p className="mt-3 text-lg font-semibold text-dark-950">{getServiceName(data.serviceId, locale)}</p>
            </SoftCard>
            <SoftCard>
              <p className="text-xs uppercase tracking-[0.22em] text-dark-400">{isArabic ? "الوصف" : "Description"}</p>
              <p className="mt-3 text-sm leading-7 text-dark-600">{data.description}</p>
            </SoftCard>
            <SoftCard>
              <p className="text-xs uppercase tracking-[0.22em] text-dark-400">{isArabic ? "ملاحظات الوسائط" : "Media notes"}</p>
              <p className="mt-3 text-sm leading-7 text-dark-600">{data.mediaNotes || (isArabic ? "لا توجد ملاحظات" : "No notes added")}</p>
            </SoftCard>
          </div>
        </DashboardBlock>

        <DashboardBlock title={isArabic ? "العنوان والخط الزمني" : "Delivery + timeline"} eyebrow={isArabic ? "تفاصيل الوصول" : "address rail"}>
          <div className="grid gap-4">
            <SoftCard>
              <p className="text-xs uppercase tracking-[0.22em] text-dark-400">{isArabic ? "الموقع" : "Location"}</p>
              <p className="mt-3 text-sm font-semibold text-dark-950">{resolveAddress(locale, data)}</p>
            </SoftCard>
            <SoftCard>
              <p className="text-xs uppercase tracking-[0.22em] text-dark-400">{isArabic ? "التوقيت المطلوب" : "Requested timing"}</p>
              <p className="mt-3 text-sm font-semibold text-dark-950">{formatTiming(locale, data.timing)}</p>
            </SoftCard>
            <SplitInfo
              items={[
                { label: isArabic ? "تاريخ الإنشاء" : "Created", value: formatDate(locale, data.createdAt) },
                { label: isArabic ? "آخر تحديث" : "Updated", value: formatDate(locale, data.updatedAt) }
              ]}
            />
            <div className="flex flex-wrap items-center gap-3">
              <SoftBadge label={status.label} tone={status.tone} />
              <SoftBadge label={data.requestNumber} tone="accent" />
            </div>
          </div>
        </DashboardBlock>
      </div>
    </div>
  );
}
