"use client";

import type { ComponentType, ReactNode } from "react";

import Link from "next/link";

import {
  ArrowUpRight,
  Banknote,
  Briefcase,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  MapPin,
  Route,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Wallet,
  Wrench,
  Zap
} from "lucide-react";

import {
  type AdminDashboardData,
  type ClientDashboardData,
  type DashboardAlertCode,
  type DashboardAreaCode,
  type DashboardDayCode,
  type DashboardRequestStatus,
  type DashboardServiceCode,
  type DashboardVerificationStatus,
  type DashboardWorkerSpecialtyCode,
  type WorkerDashboardData
} from "@/lib/dashboard-data";
import { dashboardCopy } from "@/lib/dashboard-copy";
import { useLiveApiData } from "@/hooks/use-live-api-data";
import { AdBanner } from "@/components/shared/ad-banner";
import type { Locale } from "@/lib/locales";
import { cn } from "@/lib/utils";

type StatusTone = "blue" | "green" | "amber" | "red";
type CardTone = "primary" | "accent" | "sun" | "dark";
type LocalizedLabel = Record<Locale, string>;

const serviceLabels: Record<DashboardServiceCode, LocalizedLabel> = {
  electricalRepair: { ar: "عطل كهرباء طارئ", en: "Urgent electrical repair" },
  kitchenPlumbing: { ar: "إصلاح سباكة المطبخ", en: "Kitchen plumbing fix" },
  acMaintenance: { ar: "صيانة تكييف", en: "AC maintenance" },
  electricalInspection: { ar: "كشف كهربائي شامل", en: "Electrical inspection" },
  paintingRefresh: { ar: "دهانات سريعة", en: "Fast painting refresh" },
  livingRoomPainting: { ar: "دهان غرفة المعيشة", en: "Living room painting" },
  ceilingFanInstallation: { ar: "تركيب مروحة سقف", en: "Ceiling fan installation" },
  heaterMaintenance: { ar: "صيانة سخان", en: "Heater maintenance" },
  faucetInstallation: { ar: "تركيب خلاط", en: "Faucet installation" }
};

const areaLabels: Record<DashboardAreaCode, LocalizedLabel> = {
  newCairo: { ar: "القاهرة الجديدة", en: "New Cairo" },
  nasrCity: { ar: "مدينة نصر", en: "Nasr City" },
  maadi: { ar: "المعادي", en: "Maadi" }
};

const specialtyLabels: Record<DashboardWorkerSpecialtyCode, LocalizedLabel> = {
  acTechnician: { ar: "فني تكييف", en: "AC Technician" },
  electrician: { ar: "فني كهرباء", en: "Electrician" },
  plumber: { ar: "سباك", en: "Plumber" }
};

const dayLabels: Record<DashboardDayCode, LocalizedLabel> = {
  saturday: { ar: "السبت", en: "Saturday" },
  sunday: { ar: "الأحد", en: "Sunday" },
  monday: { ar: "الإثنين", en: "Monday" },
  tuesday: { ar: "الثلاثاء", en: "Tuesday" }
};

const requestStatusMeta: Record<DashboardRequestStatus, { tone: StatusTone; label: LocalizedLabel }> = {
  WORKER_EN_ROUTE: {
    tone: "blue",
    label: { ar: "في الطريق", en: "On the way" }
  },
  IN_PROGRESS: {
    tone: "amber",
    label: { ar: "جاري التنفيذ", en: "In progress" }
  }
};

const verificationStatusMeta: Record<DashboardVerificationStatus, { tone: StatusTone; label: LocalizedLabel }> = {
  UNDER_REVIEW: {
    tone: "amber",
    label: { ar: "قيد المراجعة", en: "Under review" }
  },
  DOCUMENTS_SUBMITTED: {
    tone: "blue",
    label: { ar: "تم استلام المستندات", en: "Docs submitted" }
  },
  AWAITING_ID: {
    tone: "red",
    label: { ar: "ينتظر تحقق الهوية", en: "Awaiting ID check" }
  }
};

const alertLabels: Record<DashboardAlertCode, LocalizedLabel> = {
  complaintsUnderInvestigation: {
    ar: "12 شكوى ما زالت تحت التحقيق",
    en: "12 complaints still require investigation"
  },
  escrowApprovalsNeedReview: {
    ar: "طلبات escrow تحتاج مراجعة اليوم",
    en: "Escrow approvals need review today"
  },
  workersReadyForActivation: {
    ar: "8 عمال جاهزون للتفعيل اليوم",
    en: "8 workers are ready for activation today"
  }
};

const serviceIconMap: Record<DashboardServiceCode, ComponentType<{ className?: string }>> = {
  electricalRepair: Zap,
  kitchenPlumbing: Wrench,
  acMaintenance: Sparkles,
  electricalInspection: ShieldCheck,
  paintingRefresh: Sparkles,
  livingRoomPainting: Sparkles,
  ceilingFanInstallation: Sparkles,
  heaterMaintenance: Banknote,
  faucetInstallation: Wrench
};

function getLabel(locale: Locale, text: LocalizedLabel) {
  return text[locale];
}

function formatNumber(locale: Locale, value: number) {
  return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US", {
    maximumFractionDigits: value % 1 === 0 ? 0 : 1
  }).format(value);
}

function formatCurrency(locale: Locale, value: number) {
  const formatted = new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US", {
    maximumFractionDigits: 0
  }).format(value);

  return locale === "ar" ? `${formatted} ج.م` : `EGP ${formatted}`;
}

function formatDelta(locale: Locale, value: number, suffixAr: string, suffixEn: string) {
  return locale === "ar" ? `+${formatNumber(locale, value)} ${suffixAr}` : `+${formatNumber(locale, value)} ${suffixEn}`;
}

function formatCompletionLabel(locale: Locale, daysAgo: number) {
  if (daysAgo === 1) return locale === "ar" ? "مكتمل أمس" : "Completed yesterday";
  if (daysAgo >= 7) return locale === "ar" ? "مكتمل الأسبوع الماضي" : "Completed last week";

  return locale === "ar"
    ? `مكتمل منذ ${formatNumber(locale, daysAgo)} أيام`
    : `Completed ${formatNumber(locale, daysAgo)} days ago`;
}

function formatEta(locale: Locale, etaMinutes?: number, onSite?: boolean) {
  if (onSite) return locale === "ar" ? "العمل جارٍ بالموقع" : "Work in progress on site";
  if (!etaMinutes) return locale === "ar" ? "قريبًا" : "Soon";

  return locale === "ar"
    ? `الوصول خلال ${formatNumber(locale, etaMinutes)} دقيقة`
    : `Arriving in ${formatNumber(locale, etaMinutes)} mins`;
}

function SectionTitle({
  eyebrow,
  title,
  subtitle,
  actionLabel,
  actionHref,
  tone = "primary"
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  actionLabel: string;
  actionHref?: string;
  tone?: CardTone;
}) {
  const toneClasses: Record<CardTone, string> = {
    primary: "from-primary-500/25 via-white to-surface-peach",
    accent: "from-accent-500/20 via-white to-accent-50",
    sun: "from-sun-300/30 via-white to-surface-soft",
    dark: "from-dark-950 via-dark-900 to-dark-800 text-white"
  };

  const content = (
    <div className={cn("dashboard-card relative overflow-hidden p-6 sm:p-7", tone === "dark" && "dashboard-card-dark") }>
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-90", toneClasses[tone])} />
      <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl">
          <p className={cn("text-xs font-semibold uppercase tracking-[0.32em]", tone === "dark" ? "text-white/55" : "text-primary-700")}>{eyebrow}</p>
          <h1 className={cn("mt-4 text-4xl font-semibold sm:text-[2.8rem]", tone === "dark" ? "text-white" : "text-dark-950")}>{title}</h1>
          <p className={cn("mt-4 text-body leading-8", tone === "dark" ? "text-white/70" : "text-dark-500")}>{subtitle}</p>
        </div>

        {actionHref ? (
          <Link
            href={actionHref as `/${string}`}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold shadow-soft transition",
              tone === "dark"
                ? "bg-white text-dark-950 hover:bg-white/90"
                : "bg-dark-950 text-white hover:bg-dark-800"
            )}
          >
            {actionLabel}
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        ) : (
          <div className={cn("inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold", tone === "dark" ? "bg-white/10 text-white" : "bg-dark-950 text-white") }>
            {actionLabel}
            <ArrowUpRight className="h-4 w-4" />
          </div>
        )}
      </div>
    </div>
  );

  return <div className="mb-6">{content}</div>;
}

function MetricCard({
  label,
  value,
  note,
  tone,
  icon: Icon
}: {
  label: string;
  value: string;
  note: string;
  tone: CardTone;
  icon: ComponentType<{ className?: string }>;
}) {
  const classes: Record<CardTone, string> = {
    primary: "from-primary-500/14 to-surface-peach",
    accent: "from-accent-500/14 to-accent-50",
    sun: "from-sun-300/18 to-surface-soft",
    dark: "from-dark-950 to-dark-800 text-white"
  };

  const iconWrap: Record<CardTone, string> = {
    primary: "bg-primary-600 text-white",
    accent: "bg-accent-600 text-white",
    sun: "bg-sun-500 text-dark-950",
    dark: "bg-white/10 text-white"
  };

  return (
    <article className={cn("dashboard-card relative overflow-hidden p-5", tone === "dark" && "dashboard-card-dark") }>
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-90", classes[tone])} />
      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className={cn("text-sm", tone === "dark" ? "text-white/55" : "text-dark-500")}>{label}</p>
            <p className={cn("mt-4 text-4xl font-semibold", tone === "dark" ? "text-white" : "text-dark-950")}>{value}</p>
          </div>
          <div className={cn("flex h-11 w-11 items-center justify-center rounded-[1rem] shadow-soft", iconWrap[tone])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <p className={cn("mt-5 text-sm leading-6", tone === "dark" ? "text-white/70" : "text-dark-600")}>{note}</p>
      </div>
    </article>
  );
}

function Surface({ title, eyebrow, children, dark = false, className }: { title: string; eyebrow?: string; children: ReactNode; dark?: boolean; className?: string }) {
  return (
    <section className={cn(dark ? "dashboard-card-dark" : "dashboard-card", "p-6", className)}>
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          {eyebrow ? <p className={cn("text-xs font-semibold uppercase tracking-[0.28em]", dark ? "text-white/45" : "text-primary-700")}>{eyebrow}</p> : null}
          <h2 className={cn("mt-2 text-2xl font-semibold", dark ? "text-white" : "text-dark-950")}>{title}</h2>
        </div>
      </div>
      {children}
    </section>
  );
}

function StatusPill({ label, tone }: { label: string; tone: StatusTone }) {
  const styles: Record<StatusTone, string> = {
    blue: "bg-accent-500/12 text-accent-800 border border-accent-200/70",
    green: "bg-success/10 text-success border border-success/20",
    amber: "bg-sun-400/18 text-sun-900 border border-sun-300/60",
    red: "bg-error/10 text-error border border-error/20"
  };

  return <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", styles[tone])}>{label}</span>;
}

function ProgressBars({
  items,
  strong = false
}: {
  items: Array<{ label: string; value: number; tone?: "red" | "dark" }>;
  strong?: boolean;
}) {
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={item.label}>
          <div className="mb-2 flex items-center justify-between gap-3 text-sm text-dark-600">
            <span>{item.label}</span>
            <span>{item.value}%</span>
          </div>
          <div className={cn("h-3 rounded-full", strong ? "bg-white/10" : "bg-surface-soft")}>
            <div
              className={cn(
                "h-full rounded-full",
                item.tone === "dark"
                  ? strong
                    ? "bg-white"
                    : "bg-dark-950"
                  : strong
                    ? "bg-gradient-to-r from-sun-300 via-white to-accent-300"
                    : index % 2 === 0
                      ? "bg-gradient-to-r from-primary-500 to-sun-400"
                      : "bg-gradient-to-r from-accent-500 to-primary-400"
              )}
              style={{ width: `${item.value}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function QuickLink({ href, title, body, tone }: { href: string; title: string; body: string; tone: CardTone }) {
  const toneMap: Record<CardTone, string> = {
    primary: "from-primary-500/15 to-surface-peach",
    accent: "from-accent-500/15 to-accent-50",
    sun: "from-sun-300/18 to-surface-soft",
    dark: "from-dark-950 to-dark-800 text-white"
  };

  return (
    <Link href={href as `/${string}`} className={cn("relative overflow-hidden rounded-[1.5rem] border border-dark-200/70 p-5 shadow-soft transition hover:-translate-y-1", tone === "dark" ? "border-white/10 text-white" : "text-dark-950") }>
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-90", toneMap[tone])} />
      <div className="relative">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className={cn("mt-2 text-sm leading-6", tone === "dark" ? "text-white/70" : "text-dark-500")}>{body}</p>
        <div className={cn("mt-5 inline-flex items-center gap-2 text-sm font-semibold", tone === "dark" ? "text-white" : "text-primary-700") }>
          Open
          <ArrowUpRight className="h-4 w-4" />
        </div>
      </div>
    </Link>
  );
}

function StatStrip({ items }: { items: Array<{ label: string; value: string }> }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className="dashboard-card-soft p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-dark-400">{item.label}</p>
          <p className="mt-3 text-2xl font-semibold text-dark-950">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

function EmptyNotice({ children }: { children: ReactNode }) {
  return <div className="rounded-[1.3rem] border border-dashed border-dark-200 bg-surface-soft p-5 text-sm text-dark-500">{children}</div>;
}

export function ClientDashboardHome({ locale, initialData }: { locale: Locale; initialData: ClientDashboardData }) {
  const copy = dashboardCopy[locale].client;
  const data = useLiveApiData("/clients/dashboard", initialData);

  const stats = [
    {
      value: formatNumber(locale, data.summary.totalRequests),
      note: formatDelta(locale, data.summary.totalRequestsDelta, "هذا الشهر", "this month"),
      tone: "primary" as const,
      icon: Briefcase
    },
    {
      value: formatNumber(locale, data.summary.activeRequests),
      note:
        locale === "ar"
          ? `${formatNumber(locale, data.summary.enRouteCount)} في الطريق`
          : `${formatNumber(locale, data.summary.enRouteCount)} en route`,
      tone: "accent" as const,
      icon: Route
    },
    {
      value: formatNumber(locale, data.summary.activeWarranties),
      note: locale === "ar" ? "ضمانات مفعلة حاليًا" : "currently covered",
      tone: "sun" as const,
      icon: ShieldCheck
    },
    {
      value: formatCurrency(locale, data.summary.walletBalance),
      note: locale === "ar" ? "جاهز للاستخدام" : "ready to use",
      tone: "dark" as const,
      icon: Wallet
    }
  ];

  return (
    <div>
      <SectionTitle
        eyebrow={copy.role}
        title={copy.title}
        subtitle={copy.subtitle}
        actionLabel={copy.action}
        actionHref={`/${locale}/client/new-request`}
        tone="primary"
      />

      <div className="mb-6">
        <AdBanner placement="CLIENT_DASHBOARD" locale={locale} />
      </div>

      <div className="mb-6 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Surface title={locale === "ar" ? "محورك اليوم" : "Your day at a glance"} eyebrow={locale === "ar" ? "المسار الأول" : "Priority lane"}>
          <StatStrip
            items={[
              { label: locale === "ar" ? "طلبات نشطة" : "Active jobs", value: formatNumber(locale, data.summary.activeRequests) },
              { label: locale === "ar" ? "فني في الطريق" : "En route", value: formatNumber(locale, data.summary.enRouteCount) },
              { label: locale === "ar" ? "رصيد جاهز" : "Ready wallet", value: formatCurrency(locale, data.summary.walletBalance) }
            ]}
          />
        </Surface>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <QuickLink
            href={`/${locale}/client/new-request`}
            title={locale === "ar" ? "ابدأ طلب جديد" : "Create a new request"}
            body={locale === "ar" ? "وصف، صور، عنوان، وتوقيت في flow أوضح وأسرع." : "Describe, attach context, choose location, and submit through a cleaner flow."}
            tone="dark"
          />
          <QuickLink
            href={`/${locale}/client/my-requests`}
            title={locale === "ar" ? "تابع كل طلباتك" : "Track all requests"}
            body={locale === "ar" ? "شاهد الطلبات المفتوحة والمكتملة مع التفاصيل الكاملة." : "View open and completed requests with clearer detail states."}
            tone="accent"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {copy.stats.map((label, index) => (
          <MetricCard
            key={label}
            label={label}
            value={stats[index]?.value ?? "-"}
            note={stats[index]?.note ?? ""}
            tone={stats[index]?.tone ?? "primary"}
            icon={stats[index]?.icon ?? Sparkles}
          />
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Surface title={copy.requestSection} eyebrow={locale === "ar" ? "الحالة المباشرة" : "Live status"}>
          {data.activeRequests.length === 0 ? (
            <EmptyNotice>{locale === "ar" ? "لا توجد طلبات نشطة حاليًا" : "No active requests right now"}</EmptyNotice>
          ) : (
            <div className="space-y-4">
              {data.activeRequests.map((item) => {
                const status = requestStatusMeta[item.status];
                const Icon = serviceIconMap[item.service];

                return (
                  <article key={item.id} className="dashboard-card-soft p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-white text-primary-700 shadow-soft">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-dark-950">{getLabel(locale, serviceLabels[item.service])}</p>
                          <p className="mt-1 text-sm text-dark-500">{item.workerName}</p>
                        </div>
                      </div>
                      <StatusPill label={getLabel(locale, status.label)} tone={status.tone} />
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="dashboard-card-soft bg-white p-3">
                        <p className="text-xs uppercase tracking-[0.22em] text-dark-400">ETA</p>
                        <p className="mt-2 text-sm font-semibold text-dark-900">{formatEta(locale, item.etaMinutes, item.onSite)}</p>
                      </div>
                      <div className="dashboard-card-soft bg-white p-3">
                        <p className="text-xs uppercase tracking-[0.22em] text-dark-400">Area</p>
                        <p className="mt-2 text-sm font-semibold text-dark-900">{getLabel(locale, areaLabels[item.area])}</p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </Surface>

        <Surface title={locale === "ar" ? "طبقة الثقة" : "Trust layer"} eyebrow={locale === "ar" ? "المسار المحمي" : "Protected flow"} dark>
          <ProgressBars
            strong
            items={[
              { label: locale === "ar" ? "توثيق العمال" : "Worker verification", value: 96 },
              { label: locale === "ar" ? "سرعة الاستجابة" : "Response speed", value: 89, tone: "dark" },
              { label: locale === "ar" ? "وضوح التسعير" : "Pricing clarity", value: 92 },
              { label: locale === "ar" ? "تتبع الطلب" : "Request visibility", value: 94, tone: "dark" }
            ]}
          />
        </Surface>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr_0.95fr]">
        <Surface title={copy.suggestionSection} eyebrow={locale === "ar" ? "الطلب الأقرب" : "Closest demand"}>
          <div className="grid gap-3">
            {data.suggestedServices.map((service) => {
              const Icon = serviceIconMap[service];

              return (
                <div key={service} className="dashboard-card-soft flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-white text-accent-700 shadow-soft">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="font-medium text-dark-900">{getLabel(locale, serviceLabels[service])}</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-dark-400" />
                </div>
              );
            })}
          </div>
        </Surface>

        <Surface title={copy.recentSection} eyebrow={locale === "ar" ? "النتائج الأخيرة" : "Recent wins"}>
          {data.recentCompleted.length === 0 ? (
            <EmptyNotice>{locale === "ar" ? "لا توجد طلبات مكتملة بعد" : "No completed requests yet"}</EmptyNotice>
          ) : (
            <div className="space-y-3">
              {data.recentCompleted.map((item) => (
                <div key={item.id} className="dashboard-card-soft flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium text-dark-950">{getLabel(locale, serviceLabels[item.service])}</p>
                    <p className="mt-1 text-sm text-dark-500">{formatCompletionLabel(locale, item.completedDaysAgo)}</p>
                  </div>
                  <StatusPill label={locale === "ar" ? "مكتمل" : "Completed"} tone="green" />
                </div>
              ))}
            </div>
          )}
        </Surface>

        <Surface title={copy.favoritesSection} eyebrow={locale === "ar" ? "العمالة الموثوقة" : "Trusted workers"}>
          {data.favoriteWorkers.length === 0 ? (
            <EmptyNotice>{locale === "ar" ? "لا يوجد فنيون مفضلون بعد" : "No saved workers yet"}</EmptyNotice>
          ) : (
            <div className="space-y-3">
              {data.favoriteWorkers.map((item) => (
                <div key={item.id} className="dashboard-card-soft p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-dark-950">{item.name}</p>
                      <p className="mt-1 text-sm text-dark-500">{getLabel(locale, specialtyLabels[item.specialty])}</p>
                    </div>
                    <div className="inline-flex items-center gap-2 text-sm font-semibold text-dark-950">
                      <Star className="h-4 w-4 fill-current text-sun-500" />
                      {formatNumber(locale, item.rating)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Surface>
      </div>
    </div>
  );
}

export function WorkerDashboardHome({ locale, initialData }: { locale: Locale; initialData: WorkerDashboardData }) {
  const copy = dashboardCopy[locale].worker;
  const shared = dashboardCopy[locale].shared;
  const data = useLiveApiData("/workers/dashboard", initialData);

  const isTrialActive = data.summary.trialExpiresAt && new Date(data.summary.trialExpiresAt) > new Date();
  const trialDaysLeft = data.summary.trialExpiresAt ? Math.ceil((new Date(data.summary.trialExpiresAt).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : 0;

  const stats = [
    {
      value: isTrialActive 
        ? (locale === "ar" ? `${formatNumber(locale, trialDaysLeft)} يوم` : `${trialDaysLeft}d Trial`)
        : formatNumber(locale, data.summary.orderQuota),
      label: isTrialActive 
        ? (locale === "ar" ? "فترة تجريبية" : "Free Trial")
        : (locale === "ar" ? "رصيد الأوردرات" : "Job Quota"),
      note: isTrialActive 
        ? (locale === "ar" ? "متبقي في التجربة المجانية" : "Remaining in free trial")
        : (locale === "ar" ? "أوردرات متاحة للقبول" : "Orders available to accept"),
      tone: isTrialActive ? "primary" : (data.summary.orderQuota > 0 ? "accent" : "red"),
      icon: isTrialActive ? Sparkles : Banknote
    },
    {
      value: formatNumber(locale, data.summary.incomingRequests),
      note: formatDelta(locale, data.summary.incomingDelta, "خلال الساعة", "in the last hour"),
      tone: "accent" as const,
      icon: Briefcase
    },
    {
      value: formatNumber(locale, data.summary.activeJobs),
      note:
        locale === "ar"
          ? `${formatNumber(locale, data.summary.enRouteCount)} في الطريق`
          : `${formatNumber(locale, data.summary.enRouteCount)} en route`,
      tone: "primary" as const,
      icon: Route
    },
    {
      value: formatCurrency(locale, data.summary.monthlyEarnings),
      note: formatDelta(locale, data.summary.monthlyGrowth, "عن الشهر السابق", "vs last month"),
      tone: "sun" as const,
      icon: CircleDollarSign
    },
    {
      value: formatNumber(locale, data.summary.rating),
      note:
        locale === "ar"
          ? `من ${formatNumber(locale, data.summary.ratingCount)} تقييم`
          : `from ${formatNumber(locale, data.summary.ratingCount)} reviews`,
      tone: "dark" as const,
      icon: Star
    }
  ];

  return (
    <div>
      <SectionTitle
        eyebrow={copy.role}
        title={copy.title}
        subtitle={copy.subtitle}
        actionLabel={copy.action}
        actionHref={`/${locale}/worker/settings`}
        tone="accent"
      />

      <div className="mb-6">
        <AdBanner placement="WORKER_DASHBOARD" locale={locale} />
      </div>

      <div className="mb-6 grid gap-4 xl:grid-cols-[1.18fr_0.82fr]">
        <Surface title={locale === "ar" ? "نبض اليوم" : "Today momentum"} eyebrow={locale === "ar" ? "إيقاع العامل" : "Worker pulse"}>
          <StatStrip
            items={[
              { label: locale === "ar" ? "وارد الآن" : "Incoming now", value: formatNumber(locale, data.summary.incomingRequests) },
              { label: locale === "ar" ? "شغل نشط" : "Active jobs", value: formatNumber(locale, data.summary.activeJobs) },
              { label: locale === "ar" ? "تقييم عام" : "Rating", value: formatNumber(locale, data.summary.rating) }
            ]}
          />
        </Surface>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <QuickLink
            href={`/${locale}/worker/requests/incoming`}
            title={locale === "ar" ? "راجع الطلبات الواردة" : "Review incoming jobs"}
            body={locale === "ar" ? "قارن المناطق والميزانيات والوقت من طابور أوضح." : "Compare area, budget, and freshness inside a cleaner job queue."}
            tone="accent"
          />
          <QuickLink
            href={`/${locale}/worker/earnings`}
            title={locale === "ar" ? "راقب الأرباح" : "Track earnings"}
            body={locale === "ar" ? "شوف الاتجاه، الدفعات، والحركات من شاشة احترافية أكتر." : "See momentum, payouts, and transactions through a more polished finance view."}
            tone="dark"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {copy.stats.map((label, index) => (
          <MetricCard
            key={label}
            label={label}
            value={stats[index]?.value ?? "-"}
            note={stats[index]?.note ?? ""}
            tone={stats[index]?.tone ?? "accent"}
            icon={stats[index]?.icon ?? Sparkles}
          />
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Surface title={copy.queueSection} eyebrow={locale === "ar" ? "الطابور الساخن" : "Hot queue"}>
          {data.queue.length === 0 ? (
            <EmptyNotice>{locale === "ar" ? "لا توجد طلبات جديدة الآن" : "No incoming jobs right now"}</EmptyNotice>
          ) : (
            <div className="space-y-4">
              {data.queue.map((item) => {
                const Icon = serviceIconMap[item.service];

                return (
                  <article key={item.id} className="dashboard-card-soft p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-white text-accent-700 shadow-soft">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-dark-950">{getLabel(locale, serviceLabels[item.service])}</p>
                          <p className="mt-1 text-sm text-dark-500">{getLabel(locale, areaLabels[item.area])}</p>
                        </div>
                      </div>
                      <StatusPill label={locale === "ar" ? "اليوم" : "Today"} tone="blue" />
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div className="dashboard-card-soft bg-white p-3">
                        <p className="text-xs uppercase tracking-[0.22em] text-dark-400">Budget</p>
                        <p className="mt-2 text-sm font-semibold text-dark-900">{`${formatCurrency(locale, item.budgetMin)} - ${formatCurrency(locale, item.budgetMax)}`}</p>
                      </div>
                      <div className="dashboard-card-soft bg-white p-3">
                        <p className="text-xs uppercase tracking-[0.22em] text-dark-400">Area</p>
                        <p className="mt-2 text-sm font-semibold text-dark-900">{getLabel(locale, areaLabels[item.area])}</p>
                      </div>
                      <div className="dashboard-card-soft bg-white p-3">
                        <p className="text-xs uppercase tracking-[0.22em] text-dark-400">Fresh</p>
                        <p className="mt-2 text-sm font-semibold text-dark-900">{locale === "ar" ? "وصل حالًا" : "Just landed"}</p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </Surface>

        <Surface title={copy.scheduleSection} eyebrow={locale === "ar" ? "حمولة الأسبوع" : "Weekly load"} dark>
          <ProgressBars
            strong
            items={data.weeklyLoad.map((item) => ({
              label: getLabel(locale, dayLabels[item.day]),
              value: item.value,
              tone: item.tone
            }))}
          />
        </Surface>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr_0.9fr]">
        <Surface title={copy.earningsSection} eyebrow={locale === "ar" ? "التدفق النقدي" : "Cash flow"}>
          <ProgressBars
            items={[
              { label: shared.today, value: data.earningsPulse.today },
              { label: shared.thisWeek, value: data.earningsPulse.week, tone: "dark" },
              { label: shared.revenue, value: data.earningsPulse.revenue },
              { label: shared.satisfaction, value: data.earningsPulse.satisfaction, tone: "dark" }
            ]}
          />
        </Surface>

        <Surface title={locale === "ar" ? "مؤشرات الأداء" : "Performance indicators"} eyebrow={locale === "ar" ? "جودة التنفيذ" : "Execution quality"}>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                label: shared.response,
                value: locale === "ar" ? `${formatNumber(locale, data.performance.responseMinutes)} دقائق` : `${formatNumber(locale, data.performance.responseMinutes)} mins`
              },
              { label: shared.completion, value: `${formatNumber(locale, data.performance.completionRate)}%` },
              {
                label: locale === "ar" ? "معدل القبول" : "Acceptance rate",
                value: `${formatNumber(locale, data.performance.acceptanceRate)}%`
              },
              {
                label: locale === "ar" ? "عملاء متكررين" : "Repeat clients",
                value: `${formatNumber(locale, data.performance.repeatClients)}%`
              }
            ].map((item, index) => (
              <div key={item.label} className={cn("rounded-[1.35rem] p-4", index % 2 === 0 ? "bg-surface-peach" : "bg-surface-soft")}>
                <p className="text-sm text-dark-500">{item.label}</p>
                <p className="mt-3 text-2xl font-semibold text-dark-950">{item.value}</p>
              </div>
            ))}
          </div>
        </Surface>

        <Surface title={locale === "ar" ? "خطواتك القادمة" : "Next plays"} eyebrow={locale === "ar" ? "تركيز" : "Focus"}>
          <div className="space-y-3">
            {[
              locale === "ar" ? "رد على نفس اليوم أولًا لرفع التحويل" : "Respond to same-day jobs first to lift conversion",
              locale === "ar" ? "فعّل الطلبات التي أنت في طريقك لها بسرعة" : "Move en-route jobs into on-site faster",
              locale === "ar" ? "راجع الأرباح اليومية قبل نهاية اليوم" : "Review daily earnings before closing the day"
            ].map((item, index) => (
              <div key={item} className="dashboard-card-soft flex items-start gap-3 p-4">
                <div className={cn("mt-0.5 flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold", index === 0 ? "bg-accent-500/15 text-accent-800" : index === 1 ? "bg-primary-500/12 text-primary-700" : "bg-sun-400/18 text-sun-900") }>
                  {index + 1}
                </div>
                <p className="text-sm leading-7 text-dark-600">{item}</p>
              </div>
            ))}
          </div>
        </Surface>
      </div>
    </div>
  );
}

export function AdminDashboardHome({ locale, initialData }: { locale: Locale; initialData: AdminDashboardData }) {
  const copy = dashboardCopy[locale].admin;
  const data = useLiveApiData("/admin/dashboard", initialData);

  const stats = [
    {
      value: formatCurrency(locale, data.summary.totalRevenue),
      note: formatDelta(locale, data.summary.revenueGrowth, "هذا الشهر", "this month"),
      tone: "dark" as const,
      icon: CircleDollarSign
    },
    {
      value: formatNumber(locale, data.summary.pendingVerifications),
      note:
        locale === "ar"
          ? `${formatNumber(locale, data.summary.highPriorityVerifications)} عالية الأولوية`
          : `${formatNumber(locale, data.summary.highPriorityVerifications)} high priority`,
      tone: "sun" as const,
      icon: ShieldCheck
    },
    {
      value: formatNumber(locale, data.summary.openComplaints),
      note:
        locale === "ar"
          ? `${formatNumber(locale, data.summary.underInvestigation)} تحت التحقيق`
          : `${formatNumber(locale, data.summary.underInvestigation)} under investigation`,
      tone: "primary" as const,
      icon: ShieldAlert
    },
    {
      value: formatNumber(locale, data.summary.activeRequests),
      note:
        locale === "ar"
          ? `+${formatNumber(locale, data.summary.requestsDelta)} منذ أمس`
          : `+${formatNumber(locale, data.summary.requestsDelta)} since yesterday`,
      tone: "accent" as const,
      icon: Users
    }
  ];

  return (
    <div>
      <SectionTitle
        eyebrow={copy.role}
        title={copy.title}
        subtitle={copy.subtitle}
        actionLabel={copy.action}
        actionHref={`/${locale}/admin/workers/pending`}
        tone="sun"
      />

      <div className="mb-6 grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Surface title={locale === "ar" ? "لوحة القرار" : "Decision rail"} eyebrow={locale === "ar" ? "مشهد التحكم" : "Command view"}>
          <StatStrip
            items={[
              { label: locale === "ar" ? "مراجعات معلقة" : "Pending reviews", value: formatNumber(locale, data.summary.pendingVerifications) },
              { label: locale === "ar" ? "شكاوى مفتوحة" : "Open complaints", value: formatNumber(locale, data.summary.openComplaints) },
              { label: locale === "ar" ? "إيراد اليوم" : "Revenue pulse", value: formatCurrency(locale, data.summary.totalRevenue) }
            ]}
          />
        </Surface>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <QuickLink
            href={`/${locale}/admin/workers/pending`}
            title={locale === "ar" ? "شوف صف التوثيق" : "Open verification queue"}
            body={locale === "ar" ? "اعرف من يحتاج اعتماد سريع ومن يحتاج مراجعة إضافية." : "See who needs fast approval versus deeper review."}
            tone="sun"
          />
          <QuickLink
            href={`/${locale}/dashboards`}
            title={locale === "ar" ? "لوحة تنقل أوضح" : "Use the dashboard hub"}
            body={locale === "ar" ? "تنقل بين كل dashboards من مكان واحد بدون لف كتير." : "Move between every dashboard from one obvious control point."}
            tone="dark"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {copy.stats.map((label, index) => (
          <MetricCard
            key={label}
            label={label}
            value={stats[index]?.value ?? "-"}
            note={stats[index]?.note ?? ""}
            tone={stats[index]?.tone ?? "sun"}
            icon={stats[index]?.icon ?? Sparkles}
          />
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
        <Surface title={copy.queueSection} eyebrow={locale === "ar" ? "طابور الأولوية" : "Priority queue"}>
          {data.verificationQueue.length === 0 ? (
            <EmptyNotice>{locale === "ar" ? "لا توجد طلبات توثيق جديدة" : "No pending verification items"}</EmptyNotice>
          ) : (
            <div className="space-y-4">
              {data.verificationQueue.map((item) => {
                const status = verificationStatusMeta[item.status];

                return (
                  <article key={item.id} className="dashboard-card-soft p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold text-dark-950">{item.name}</p>
                        <p className="mt-1 text-sm text-dark-500">{getLabel(locale, specialtyLabels[item.specialty])}</p>
                      </div>
                      <StatusPill label={getLabel(locale, status.label)} tone={status.tone} />
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="dashboard-card-soft bg-white p-3">
                        <p className="text-xs uppercase tracking-[0.22em] text-dark-400">Submitted</p>
                        <p className="mt-2 text-sm font-semibold text-dark-900">{item.submittedAt}</p>
                      </div>
                      <div className="dashboard-card-soft bg-white p-3">
                        <p className="text-xs uppercase tracking-[0.22em] text-dark-400">Queue state</p>
                        <p className="mt-2 text-sm font-semibold text-dark-900">{getLabel(locale, status.label)}</p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </Surface>

        <Surface title={copy.alertsSection} eyebrow={locale === "ar" ? "أبراج المراقبة" : "Watch towers"} dark>
          <div className="space-y-4">
            {data.alerts.map((item, index) => (
              <div key={item} className="rounded-[1.35rem] border border-white/10 bg-white/5 p-4">
                <div className="flex items-start gap-3">
                  <div className={cn("mt-0.5 flex h-9 w-9 items-center justify-center rounded-full", index === 0 ? "bg-sun-400/18 text-sun-200" : index === 1 ? "bg-primary-500/14 text-primary-200" : "bg-accent-500/14 text-accent-200") }>
                    <ShieldAlert className="h-4 w-4" />
                  </div>
                  <p className="text-sm leading-7 text-white/75">{getLabel(locale, alertLabels[item])}</p>
                </div>
              </div>
            ))}
          </div>
        </Surface>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr_0.95fr]">
        <Surface title={copy.financeSection} eyebrow={locale === "ar" ? "نبض المالية" : "Finance pulse"}>
          <ProgressBars
            items={[
              { label: locale === "ar" ? "العمولات" : "Commissions", value: data.financePulse.commissions },
              { label: locale === "ar" ? "الأموال المحجوزة" : "Escrow held", value: data.financePulse.escrowHeld, tone: "dark" },
              { label: locale === "ar" ? "تم الإفراج هذا الأسبوع" : "Released this week", value: data.financePulse.releasedThisWeek },
              { label: locale === "ar" ? "ضغط الاسترداد" : "Refund pressure", value: data.financePulse.refundPressure, tone: "dark" }
            ]}
          />
        </Surface>

        <Surface title={locale === "ar" ? "مزيج التشغيل" : "Operational mix"} eyebrow={locale === "ar" ? "خريطة الكثافة" : "Density map"}>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { label: locale === "ar" ? "العملاء" : "Clients", value: formatNumber(locale, data.operationalMix.clientsCount), icon: Users, tone: "bg-accent-50" },
              { label: locale === "ar" ? "العمال" : "Workers", value: formatNumber(locale, data.operationalMix.workersCount), icon: Briefcase, tone: "bg-surface-peach" },
              { label: locale === "ar" ? "حركة المحفظة" : "Wallet flow", value: formatCurrency(locale, data.operationalMix.walletFlow), icon: Wallet, tone: "bg-surface-soft" },
              { label: locale === "ar" ? "مؤشر الجودة" : "Quality score", value: `${formatNumber(locale, data.operationalMix.qualityScore)}/100`, icon: Star, tone: "bg-sun-50" }
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.label} className={cn("rounded-[1.35rem] p-4", item.tone)}>
                  <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-white text-dark-950 shadow-soft">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-sm text-dark-500">{item.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-dark-950">{item.value}</p>
                </div>
              );
            })}
          </div>
        </Surface>

        <Surface title={locale === "ar" ? "خطوات تشغيل فورية" : "Immediate operating steps"} eyebrow={locale === "ar" ? "تسلسل القرار" : "Decision stack"}>
          <div className="space-y-3">
            {[
              locale === "ar" ? "سرّع اعتماد الحالات المكتملة مستندات لتخفيف الضغط." : "Clear fully documented workers first to reduce queue pressure.",
              locale === "ar" ? "راجع complaints المفتوحة قبل release جديد." : "Review open complaints before the next release cycle.",
              locale === "ar" ? "راقب حركة escrow قبل موجة المساء." : "Watch escrow movement before the evening spike."
            ].map((item, index) => (
              <div key={item} className="dashboard-card-soft flex items-start gap-3 p-4">
                <div className={cn("mt-0.5 flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold", index === 0 ? "bg-sun-400/18 text-sun-900" : index === 1 ? "bg-primary-500/12 text-primary-700" : "bg-accent-500/14 text-accent-800") }>
                  {index + 1}
                </div>
                <p className="text-sm leading-7 text-dark-600">{item}</p>
              </div>
            ))}
          </div>
        </Surface>
      </div>
    </div>
  );
}

export function VendorDashboardHome({ locale }: { locale: Locale }) {
  const copy = dashboardCopy[locale].vendor;
  
  // Hardcoded for now until API is connected
  const stats = [
    { value: "0", note: locale === "ar" ? "هذا الشهر" : "this month", tone: "accent" as const, icon: Briefcase },
    { value: "EGP 0", note: locale === "ar" ? "عن الشهر السابق" : "vs last month", tone: "sun" as const, icon: CircleDollarSign },
    { value: "0", note: locale === "ar" ? "في الطريق" : "in transit", tone: "primary" as const, icon: Route },
    { value: "EGP 0", note: locale === "ar" ? "رصيد متاح" : "available balance", tone: "dark" as const, icon: Wallet }
  ];

  return (
    <div>
      <SectionTitle
        eyebrow={copy.role}
        title={copy.title}
        subtitle={copy.subtitle}
        actionLabel={copy.action}
        actionHref={`/${locale}/vendor/settings`}
        tone="accent"
      />

      <div className="mb-6">
        <AdBanner placement="VENDOR_DASHBOARD" locale={locale} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {copy.stats.map((label, index) => (
           <MetricCard
             key={label}
             label={label}
             value={stats[index]?.value ?? "-"}
             note={stats[index]?.note ?? ""}
             tone={stats[index]?.tone ?? "accent"}
             icon={stats[index]?.icon ?? Sparkles}
           />
        ))}
      </div>

      <div className="mt-6">
        <Surface title={copy.queueSection} eyebrow={locale === "ar" ? "طلبات حية" : "Live requests"}>
           <EmptyNotice>{locale === "ar" ? "لا توجد طلبات قريبة الآن" : "No nearby requests right now"}</EmptyNotice>
        </Surface>
      </div>
    </div>
  );
}

// ============================================================
// Admin Ads Management Page
// ============================================================

type AdCampaign = {
  id: string;
  title: string;
  type: "BANNER" | "SPONSORED_PROFILE";
  placement: "HOMEPAGE" | "CLIENT_DASHBOARD" | "WORKER_DASHBOARD" | "VENDOR_DASHBOARD" | "SEARCH_TOP";
  status: "PENDING" | "ACTIVE" | "PAUSED" | "FINISHED";
  views: number;
  clicks: number;
  imageUrl: string | null;
  targetUrl: string | null;
  owner: { id: string; firstName: string; phone: string } | null;
};

const adStatusTone: Record<AdCampaign["status"], StatusTone> = {
  PENDING: "amber",
  ACTIVE: "green",
  PAUSED: "blue",
  FINISHED: "red"
};

const adStatusLabel: Record<AdCampaign["status"], { ar: string; en: string }> = {
  PENDING: { ar: "بانتظار الموافقة", en: "Pending approval" },
  ACTIVE: { ar: "نشط", en: "Active" },
  PAUSED: { ar: "موقوف", en: "Paused" },
  FINISHED: { ar: "منتهي", en: "Finished" }
};

const adPlacementLabel: Record<AdCampaign["placement"], { ar: string; en: string }> = {
  HOMEPAGE: { ar: "الصفحة الرئيسية", en: "Homepage" },
  CLIENT_DASHBOARD: { ar: "لوحة العميل", en: "Client Dashboard" },
  WORKER_DASHBOARD: { ar: "لوحة العامل", en: "Worker Dashboard" },
  VENDOR_DASHBOARD: { ar: "لوحة المورد", en: "Vendor Dashboard" },
  SEARCH_TOP: { ar: "أعلى نتائج البحث", en: "Top of Search" }
};

export function AdminAdsPage({ locale }: { locale: Locale }) {
  const isArabic = locale === "ar";
  const ads = useLiveApiData<AdCampaign[]>("/ads", []);

  const activeCount = ads.filter(a => a.status === "ACTIVE").length;
  const pendingCount = ads.filter(a => a.status === "PENDING").length;
  const totalViews = ads.reduce((s, a) => s + a.views, 0);
  const totalClicks = ads.reduce((s, a) => s + a.clicks, 0);

  async function updateStatus(id: string, status: AdCampaign["status"]) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
    await fetch(`${apiUrl}/api/ads/${id}/status`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    window.location.reload();
  }

  async function deleteAd(id: string) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
    await fetch(`${apiUrl}/api/ads/${id}`, {
      method: "DELETE",
      credentials: "include"
    });
    window.location.reload();
  }

  const stats = [
    { value: String(ads.length), note: isArabic ? "إجمالي الحملات" : "Total campaigns", tone: "primary" as const, icon: Banknote },
    { value: String(activeCount), note: isArabic ? "حملات نشطة الآن" : "Currently active", tone: "accent" as const, icon: CheckCircle2 },
    { value: String(pendingCount), note: isArabic ? "تنتظر موافقتك" : "Awaiting your approval", tone: "sun" as const, icon: Clock3 },
    { value: formatNumber(locale, totalViews), note: isArabic ? "مشاهدة إجمالية" : "Total impressions", tone: "dark" as const, icon: TrendingUp }
  ];

  return (
    <div>
      <SectionTitle
        eyebrow={isArabic ? "لوحة المشرف" : "Admin Dashboard"}
        title={isArabic ? "إدارة الإعلانات" : "Ads Manager"}
        subtitle={isArabic ? "راجع وأدر جميع الحملات الإعلانية المقدمة من الشركات والتجار والصنايعية." : "Review and manage all advertising campaigns submitted by businesses, vendors, and workers."}
        actionLabel={isArabic ? "نظرة شاملة" : "Overview"}
        tone="sun"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <MetricCard key={s.note} label={s.note} value={s.value} note="" tone={s.tone} icon={s.icon} />
        ))}
      </div>

      <div className="mt-6">
        <Surface title={isArabic ? "جميع الحملات الإعلانية" : "All Ad Campaigns"} eyebrow={isArabic ? "مراجعة ومراقبة" : "Review & Monitor"}>
          {ads.length === 0 ? (
            <EmptyNotice>{isArabic ? "لا توجد حملات إعلانية حتى الآن" : "No ad campaigns yet"}</EmptyNotice>
          ) : (
            <div className="space-y-4">
              {ads.map((ad) => (
                <div key={ad.id} className="rounded-[1.35rem] border border-dark-200/70 bg-surface-soft p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-dark-950">{ad.title}</p>
                        <StatusPill
                          label={adStatusLabel[ad.status][locale]}
                          tone={adStatusTone[ad.status]}
                        />
                      </div>
                      <div className="mt-2 flex flex-wrap gap-3 text-xs text-dark-500">
                        <span>{isArabic ? "المكان: " : "Placement: "}<strong className="text-dark-700">{adPlacementLabel[ad.placement][locale]}</strong></span>
                        <span>{isArabic ? "النوع: " : "Type: "}<strong className="text-dark-700">{ad.type === "BANNER" ? (isArabic ? "بانر" : "Banner") : (isArabic ? "ممول" : "Sponsored")}</strong></span>
                        <span>{isArabic ? "مشاهدات: " : "Views: "}<strong className="text-dark-700">{formatNumber(locale, ad.views)}</strong></span>
                        <span>{isArabic ? "نقرات: " : "Clicks: "}<strong className="text-dark-700">{formatNumber(locale, ad.clicks)}</strong></span>
                        {ad.owner && <span>{isArabic ? "المعلن: " : "Owner: "}<strong className="text-dark-700">{ad.owner.firstName}</strong></span>}
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      {ad.status === "PENDING" && (
                        <button
                          type="button"
                          onClick={() => updateStatus(ad.id, "ACTIVE")}
                          className="rounded-full bg-success/10 px-4 py-2 text-xs font-semibold text-success transition hover:bg-success/20"
                        >
                          {isArabic ? "تفعيل" : "Approve"}
                        </button>
                      )}
                      {ad.status === "ACTIVE" && (
                        <button
                          type="button"
                          onClick={() => updateStatus(ad.id, "PAUSED")}
                          className="rounded-full bg-sun-400/15 px-4 py-2 text-xs font-semibold text-sun-900 transition hover:bg-sun-400/25"
                        >
                          {isArabic ? "إيقاف مؤقت" : "Pause"}
                        </button>
                      )}
                      {ad.status === "PAUSED" && (
                        <button
                          type="button"
                          onClick={() => updateStatus(ad.id, "ACTIVE")}
                          className="rounded-full bg-accent-500/10 px-4 py-2 text-xs font-semibold text-accent-700 transition hover:bg-accent-500/20"
                        >
                          {isArabic ? "استئناف" : "Resume"}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => deleteAd(ad.id)}
                        className="rounded-full bg-error/10 px-4 py-2 text-xs font-semibold text-error transition hover:bg-error/20"
                      >
                        {isArabic ? "حذف" : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Surface>
      </div>

      <div className="mt-6">
        <Surface title={isArabic ? "خطة التسعير الإعلانية" : "Ad Pricing Guide"} eyebrow={isArabic ? "الأسعار المقترحة" : "Suggested rates"}>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                label: isArabic ? "بانر الشركات" : "Corporate Banner",
                price: isArabic ? "٣٠٠٠ – ٥٠٠٠ ج.م / شهر" : "EGP 3,000 – 5,000/mo",
                note: isArabic ? "صفحة رئيسية، لوحة عميل" : "Homepage, Client Dashboard",
                tone: "bg-primary-50"
              },
              {
                label: isArabic ? "بانر الموردين" : "Vendor Banner",
                price: isArabic ? "٣٠٠ – ٥٠٠ ج.م / أسبوع" : "EGP 300 – 500/week",
                note: isArabic ? "لوحة الصنايعي (تستهدف المشترين)" : "Worker Dashboard (targets buyers)",
                tone: "bg-accent-50"
              },
              {
                label: isArabic ? "بروفايل صنايعي ممول" : "Sponsored Worker Profile",
                price: isArabic ? "١٥٠ ج.م / أسبوع أو ٥ ج.م / نقرة" : "EGP 150/week or EGP 5/click",
                note: isArabic ? "أعلى نتائج البحث بشارة 'ممول'" : "Top search results with 'Sponsored' badge",
                tone: "bg-sun-50"
              }
            ].map((item) => (
              <div key={item.label} className={cn("rounded-[1.35rem] p-4", item.tone)}>
                <p className="text-sm font-semibold text-dark-900">{item.label}</p>
                <p className="mt-2 text-xl font-bold text-dark-950">{item.price}</p>
                <p className="mt-1 text-xs text-dark-500">{item.note}</p>
              </div>
            ))}
          </div>
        </Surface>
      </div>
    </div>
  );
}

// ============================================================
// Admin Pricing & Platform Settings Page
// ============================================================

type PlatformSetting = { id: string; key: string; value: string; type: string };

const PRICING_KEYS = [
  { key: "commission_rate_worker", labelAr: "نسبة عمولة الصنايعي (%)", labelEn: "Worker Commission Rate (%)", type: "number", defaultValue: "15" },
  { key: "commission_rate_vendor", labelAr: "نسبة عمولة المورد (%)", labelEn: "Vendor Commission Rate (%)", type: "number", defaultValue: "10" },
  { key: "service_fee_client", labelAr: "رسوم الخدمة على العميل (ج.م)", labelEn: "Client Service Fee (EGP)", type: "number", defaultValue: "15" },
  { key: "emergency_multiplier", labelAr: "مضاعف الطلبات الطارئة", labelEn: "Emergency Request Multiplier", type: "number", defaultValue: "1.5" },
  { key: "lead_cost_worker", labelAr: "تكلفة شراء الليد للصنايعي (ج.م)", labelEn: "Lead Purchase Cost for Worker (EGP)", type: "number", defaultValue: "10" },
  { key: "banner_monthly_price", labelAr: "سعر البانر الشهري (ج.م)", labelEn: "Monthly Banner Price (EGP)", type: "number", defaultValue: "3000" },
  { key: "vendor_banner_weekly_price", labelAr: "سعر بانر المورد الأسبوعي (ج.م)", labelEn: "Vendor Banner Weekly Price (EGP)", type: "number", defaultValue: "400" },
  { key: "sponsored_worker_weekly_price", labelAr: "سعر الصنايعي الممول الأسبوعي (ج.م)", labelEn: "Sponsored Worker Weekly Price (EGP)", type: "number", defaultValue: "150" },
  { key: "sponsored_worker_ppc_price", labelAr: "سعر النقرة للصنايعي الممول (ج.م)", labelEn: "Sponsored Worker PPC Price (EGP)", type: "number", defaultValue: "5" },
  { key: "vendor_subscription_price", labelAr: "سعر باقة المتاجر (ج.م)", labelEn: "Vendor Package Price (EGP)", type: "number", defaultValue: "200" },
  { key: "vendor_subscription_quota", labelAr: "عدد الأوردرات في الباقة", labelEn: "Orders in Vendor Package", type: "number", defaultValue: "10" },
  { key: "vendor_trial_days", labelAr: "عدد أيام الفترة التجريبية للمورد", labelEn: "Vendor Trial Days", type: "number", defaultValue: "30" },
  { key: "worker_subscription_price", labelAr: "سعر باقة الصنايعي (ج.م)", labelEn: "Worker Package Price (EGP)", type: "number", defaultValue: "200" },
  { key: "worker_subscription_quota", labelAr: "عدد الأوردرات في باقة الصنايعي", labelEn: "Orders in Worker Package", type: "number", defaultValue: "10" },
  { key: "worker_trial_days", labelAr: "عدد أيام الفترة التجريبية للصنايعي", labelEn: "Worker Trial Days", type: "number", defaultValue: "30" }
];

export function AdminPricingPage({ locale }: { locale: Locale }) {
  const isArabic = locale === "ar";
  const settings = useLiveApiData<PlatformSetting[]>("/settings", []);

  const settingsMap = Object.fromEntries(settings.map(s => [s.key, s.value]));

  async function handleSave(key: string, value: string) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
    await fetch(`${apiUrl}/api/settings`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value })
    });
  }

  return (
    <div>
      <SectionTitle
        eyebrow={isArabic ? "لوحة المشرف" : "Admin Dashboard"}
        title={isArabic ? "التسعير وإعدادات المنصة" : "Pricing & Platform Settings"}
        subtitle={isArabic ? "تحكم في نسب العمولات، رسوم الخدمة، وأسعار الإعلانات من مكان واحد." : "Control commission rates, service fees, and ad prices — all from one place."}
        actionLabel={isArabic ? "حفظ سيتم آلياً" : "Saves automatically"}
        tone="primary"
      />

      <div className="mt-2">
        <Surface title={isArabic ? "إعدادات التسعير الديناميكية" : "Dynamic Pricing Settings"} eyebrow={isArabic ? "تحكم مباشر" : "Live control"}>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {PRICING_KEYS.map((item) => {
                const currentValue = settingsMap[item.key] ?? item.defaultValue;
                return (
                  <div key={item.key} className="dashboard-card-soft rounded-[1.35rem] p-4">
                    <label htmlFor={item.key} className="block text-sm font-medium text-dark-700">
                      {isArabic ? item.labelAr : item.labelEn}
                    </label>
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        id={item.key}
                        type="number"
                        defaultValue={currentValue}
                        step="0.5"
                        min="0"
                        className="h-11 w-full rounded-[1rem] border border-dark-200 bg-white px-4 text-sm font-semibold text-dark-900 shadow-soft outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-200"
                        onBlur={(e) => {
                          const val = e.target.value;
                          if (val && val !== currentValue) {
                            handleSave(item.key, val);
                          }
                        }}
                      />
                    </div>
                    <p className="mt-1.5 text-xs text-dark-400">{isArabic ? "القيمة الحالية: " : "Current: "}<strong>{currentValue}</strong></p>
                  </div>
                );
              })}
            </div>
        </Surface>
      </div>

      <div className="mt-6">
        <Surface title={isArabic ? "كيف تعمل منظومة الأرباح؟" : "How the Revenue System Works"} eyebrow={isArabic ? "دليل الإيرادات" : "Revenue guide"}>
          <div className="space-y-3">
            {(isArabic ? [
              "يُخصم commission_rate_worker تلقائياً من أتعاب الصنايعي عند الإفراج عن الدفعة من الـ Escrow.",
              "يُضاف service_fee_client كرسوم ثابتة لكل فاتورة على الجانب العميل.",
              "emergency_multiplier يُضرب في سعر الخدمة الأصلي عند اختيار العميل 'طارئ'.",
              "lead_cost_worker يُخصم من محفظة الصنايعي عند تقديم عرض سعر على طلب العميل.",
              "أسعار الإعلانات تُراجع وتُحدث يدوياً من الإدارة وتُعرض في صفحة 'إدارة الإعلانات'."
            ] : [
              "commission_rate_worker is automatically deducted from worker earnings when payment is released from Escrow.",
              "service_fee_client is a fixed fee added to every client invoice.",
              "emergency_multiplier is multiplied by the base service price when client selects 'Urgent'.",
              "lead_cost_worker is deducted from the worker's wallet when they submit a quote on a client request.",
              "Ad prices are manually reviewed and updated by admin and displayed on the 'Ads Manager' page."
            ]).map((text, i) => (
              <div key={i} className="dashboard-card-soft flex items-start gap-3 p-4">
                <div className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold", i % 3 === 0 ? "bg-sun-400/18 text-sun-900" : i % 3 === 1 ? "bg-primary-500/12 text-primary-700" : "bg-accent-500/14 text-accent-800")}>
                  {i + 1}
                </div>
                <p className="text-sm leading-7 text-dark-600">{text}</p>
              </div>
            ))}
          </div>
        </Surface>
      </div>
    </div>
  );
}
