"use client";

import type { ComponentType, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight, Banknote, Briefcase, CalendarClock, CheckCircle2,
  CircleDollarSign, Clock3, MapPin, Route, ShieldAlert, ShieldCheck,
  Heart, Package, Sparkles, Star, Store, TrendingUp, Users, Wallet, Wrench, Zap,
  MessageSquare, ChevronRight, SlidersHorizontal, Megaphone, Settings, User,
  Plus, Trash2, Edit3, Eye, EyeOff, Image as ImageIcon, FolderOpen, UploadCloud
} from "lucide-react";

import { useLiveApiData } from "@/hooks/use-live-api-data";
import { AdBanner } from "@/components/shared/ad-banner";
import type { ClientDashboardData } from "@/lib/dashboard-data";
import type { Locale } from "@/lib/locales";
import { cn } from "@/lib/utils";
import { MediaSelectorModal } from "@/components/admin/media-selector-modal";
import {
  WorkerProEmpty,
  WorkerProHero,
  WorkerProInfoCard,
  WorkerProMetric,
  WorkerProPanel,
  WorkerProShell,
  WorkerProTopStrip
} from "@/components/worker/worker-pro-ui";
import {
  VendorStitchEmpty,
  VendorStitchHero,
  VendorStitchMetric,
  VendorStitchPanel,
  VendorStitchShell,
  VendorStitchTopStrip
} from "@/components/vendor/vendor-stitch-ui";

// --- Types & Helpers ---
type CardTone = "gold" | "onyx" | "marble";

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

export function cleanImageUrl(url: string): string {
  if (!url) return "";
  let cleaned = url.trim();
  
  // Handle case where user pasted '/images.unsplash.com' or similar:
  if (cleaned.startsWith("/") && cleaned.includes(".com")) {
    cleaned = "https://" + cleaned.substring(1);
  }
  
  // Handle case where user typed 'images.unsplash.com' without http/https:
  if (!cleaned.startsWith("http://") && !cleaned.startsWith("https://") && !cleaned.startsWith("data:") && !cleaned.startsWith("/")) {
    cleaned = "https://" + cleaned;
  }
  
  return cleaned;
}

// --- Premium UI Components ---

function SectionTitle({
  eyebrow,
  title,
  subtitle,
  actionLabel,
  actionHref,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  actionLabel: string;
  actionHref?: string;
}) {
  return (
    <div className="onyx-card relative overflow-hidden p-8 mb-8 group border-gold-500/10">
      <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/5 blur-[100px] -mr-32 -mt-32" />
      <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="max-w-3xl">
          <span className="text-gold-500 text-xs font-black uppercase tracking-[0.4em] mb-4 block">
            {eyebrow}
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
            {title}
          </h1>
          <p className="text-onyx-400 text-lg leading-relaxed max-w-2xl">
            {subtitle}
          </p>
        </div>

        {actionHref && (
          <Link
            href={actionHref as `/${string}`}
            className="btn-gold shadow-gold/10 inline-flex items-center gap-3 self-start lg:self-center"
          >
            {actionLabel}
            <ArrowUpRight className="h-5 w-5" />
          </Link>
        )}
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  note,
  tone = "onyx",
  icon: Icon
}: {
  label: string;
  value: string;
  note: string;
  tone?: CardTone;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <div className={cn(
      "onyx-card p-6 relative overflow-hidden group hover:border-gold-500/30",
      tone === "gold" && "border-gold-500/30 bg-gold-500/5"
    )}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-onyx-500 text-xs font-bold uppercase tracking-widest">{label}</p>
          <h3 className="text-3xl font-black text-white mt-2 group-hover:text-gold-500 transition-colors">
            {value}
          </h3>
        </div>
        <div className={cn(
          "h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-500 group-hover:scale-110",
          tone === "gold" ? "bg-gold-500 text-onyx-950" : "bg-onyx-700 text-gold-500"
        )}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <p className="text-onyx-400 text-sm font-medium">{note}</p>
      
      {/* Subtle Glow */}
      <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gold-500/5 blur-2xl rounded-full group-hover:bg-gold-500/10 transition-colors" />
    </div>
  );
}

function Surface({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("onyx-card p-8", className)}>
      <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
        <div className="h-8 w-1.5 bg-gold-500 rounded-full" />
        {title}
      </h2>
      {children}
    </div>
  );
}

function EmptyNotice({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-onyx-700 bg-onyx-900/50 p-12 text-center">
      <div className="h-16 w-16 bg-onyx-800 rounded-full flex items-center justify-center mx-auto mb-6">
        <Sparkles className="h-8 w-8 text-onyx-600" />
      </div>
      <p className="text-onyx-500 font-medium">{message}</p>
    </div>
  );
}

// --- Dashboards ---

const clientServiceLabels: Record<string, { ar: string; en: string }> = {
  acMaintenance: { ar: "صيانة التكييف", en: "AC maintenance" },
  electricalInspection: { ar: "فحص الكهرباء", en: "Electrical inspection" },
  electricalRepair: { ar: "إصلاح كهرباء", en: "Electrical repair" },
  kitchenPlumbing: { ar: "سباكة المطبخ", en: "Kitchen plumbing" },
  paintingRefresh: { ar: "تجديد دهانات", en: "Painting refresh" },
  livingRoomPainting: { ar: "دهان غرفة المعيشة", en: "Living room painting" },
  faucetInstallation: { ar: "تركيب خلاط", en: "Faucet installation" },
  heaterMaintenance: { ar: "صيانة سخان", en: "Heater maintenance" },
  ceilingFanInstallation: { ar: "تركيب مروحة سقف", en: "Ceiling fan installation" }
};

const clientWorkerSpecialtyLabels: Record<string, { ar: string; en: string }> = {
  acTechnician: { ar: "فني تكييف", en: "AC technician" },
  electrician: { ar: "كهربائي", en: "Electrician" },
  plumber: { ar: "سباك", en: "Plumber" },
  carpenter: { ar: "نجار", en: "Carpenter" },
  painter: { ar: "نقاش", en: "Painter" },
  applianceRepair: { ar: "صيانة أجهزة", en: "Appliance repair" },
  cleaning: { ar: "تنظيف", en: "Cleaning" },
  cctv: { ar: "كاميرات مراقبة", en: "CCTV" }
};

const clientAreaLabels: Record<string, { ar: string; en: string }> = {
  newCairo: { ar: "القاهرة الجديدة", en: "New Cairo" },
  nasrCity: { ar: "مدينة نصر", en: "Nasr City" },
  maadi: { ar: "المعادي", en: "Maadi" }
};

const clientStatusLabels: Record<string, { ar: string; en: string; className: string }> = {
  WORKER_EN_ROUTE: {
    ar: "الفني في الطريق",
    en: "Worker en route",
    className: "bg-gold/20 text-[#684e00] border-gold/50"
  },
  IN_PROGRESS: {
    ar: "جاري التنفيذ",
    en: "In progress",
    className: "bg-[#0d9488]/10 text-[#006a61] border-[#0d9488]/25"
  },
  COMPLETED: {
    ar: "مكتمل",
    en: "Completed",
    className: "bg-[#0d9488]/10 text-[#006a61] border-[#0d9488]/25"
  },
  CANCELLED: {
    ar: "ملغي",
    en: "Cancelled",
    className: "bg-red-500/10 text-red-700 border-red-500/20"
  }
};

function getLocalizedLabel(map: Record<string, { ar: string; en: string }>, key: string, locale: Locale) {
  const fallback = key
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .trim();
  return map[key]?.[locale] ?? fallback;
}

function getClientStatus(status: string) {
  return clientStatusLabels[status] ?? clientStatusLabels.COMPLETED!;
}

function ClientPanel({
  title,
  action,
  children,
  className
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("border border-white/10 bg-black p-4 text-white shadow-[4px_4px_0_#000] sm:p-6", className)}>
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-xl font-black text-white sm:text-2xl">
          <span className="h-3 w-3 bg-gold" />
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function ClientDashboardHome({ locale }: { locale: Locale }) {
  const isArabic = locale === "ar";
  const data = useLiveApiData<ClientDashboardData>("/clients/dashboard", {
    summary: {
      totalRequests: 0,
      totalRequestsDelta: 0,
      activeRequests: 0,
      enRouteCount: 0,
      walletBalance: 0,
      activeWarranties: 0
    },
    activeRequests: [],
    suggestedServices: [],
    recentCompleted: [],
    favoriteWorkers: []
  });

  const activeRequest = data.activeRequests[0];
  const recentRows = data.recentCompleted.length > 0
    ? data.recentCompleted.slice(0, 3).map((request) => ({
        id: request.id,
        service: request.service,
        status: "COMPLETED",
        meta: isArabic
          ? `منذ ${formatNumber(locale, request.completedDaysAgo)} يوم`
          : `${formatNumber(locale, request.completedDaysAgo)} days ago`
      }))
    : data.activeRequests.slice(0, 3).map((request) => ({
        id: request.id,
        service: request.service,
        status: request.status,
        meta: getLocalizedLabel(clientAreaLabels, request.area, locale)
      }));

  const metrics = [
    {
      label: isArabic ? "إجمالي الطلبات" : "Total requests",
      value: formatNumber(locale, data.summary.totalRequests),
      note: isArabic ? "كل ما طلبته عبر أُسطفاي" : "All-time service requests",
      icon: Briefcase
    },
    {
      label: isArabic ? "طلبات نشطة" : "Active",
      value: formatNumber(locale, data.summary.activeRequests),
      note: isArabic ? "تحتاج متابعة الآن" : "Need attention now",
      icon: Zap
    },
    {
      label: isArabic ? "ضمانات فعالة" : "Warranties",
      value: formatNumber(locale, data.summary.activeWarranties),
      note: isArabic ? "خدمات ما زالت محمية" : "Protected services",
      icon: ShieldCheck
    },
    {
      label: isArabic ? "رصيد المحفظة" : "Wallet balance",
      value: formatCurrency(locale, data.summary.walletBalance),
      note: isArabic ? "جاهز للدفع المحمي" : "Ready for protected payment",
      icon: Wallet
    }
  ];

  const quickActions = [
    {
      href: `/${locale}/client/new-request`,
      title: isArabic ? "طلب خدمة" : "New request",
      note: isArabic ? "ابدأ طلب صيانة جديد" : "Start a service request",
      icon: Plus
    },
    {
      href: `/${locale}/client/my-requests`,
      title: isArabic ? "طلباتي" : "My requests",
      note: isArabic ? "تابع الحالات والعروض" : "Track statuses and offers",
      icon: FolderOpen
    },
    {
      href: `/${locale}/client/stores`,
      title: isArabic ? "المتاجر" : "Stores",
      note: isArabic ? "متاجر موثقة قريبة" : "Nearby verified stores",
      icon: Store
    },
    {
      href: `/${locale}/client/materials`,
      title: isArabic ? "سوق الخامات" : "Materials",
      note: isArabic ? "اطلب قطع الغيار" : "Request spare parts",
      icon: Package
    },
    {
      href: `/${locale}/client/favorites`,
      title: isArabic ? "المفضلين" : "Favorites",
      note: isArabic ? "فنيون تثق بهم" : "Trusted technicians",
      icon: Heart
    },
    {
      href: `/${locale}/client/wallet`,
      title: isArabic ? "المحفظة" : "Wallet",
      note: isArabic ? "رصيد ومعاملات" : "Balance and history",
      icon: Wallet
    }
  ];

  return (
    <div className="animate-slideUp text-[#100e08]">
      <section className="mb-6 flex flex-col gap-4 lg:mb-12 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-black leading-tight tracking-normal text-black sm:text-5xl">
            {isArabic ? "أهلاً بك، أحمد" : "Welcome back, Ahmed"}
          </h1>
          <p className="mt-2 text-base font-semibold leading-7 text-black/70 sm:text-lg">
            {isArabic
              ? `لديك ${formatNumber(locale, data.summary.activeRequests)} خدمة نشطة اليوم وميزانية جاهزة للمشاريع.`
              : `You have ${formatNumber(locale, data.summary.activeRequests)} active services today and a ready project budget.`}
          </p>
        </div>

        <div className="hidden items-center gap-6 lg:flex">
          <div className="border border-white/10 bg-black/80 px-6 py-3 text-white backdrop-blur-xl">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-gold">
              {isArabic ? "الرصيد المتاح" : "Available balance"}
            </p>
            <p className="mt-1 text-2xl font-black text-white">{formatCurrency(locale, data.summary.walletBalance)}</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center border-2 border-black bg-black text-gold">
            <User className="h-6 w-6" />
          </div>
        </div>
      </section>

      <section className="mb-6 flex gap-4 overflow-x-auto pb-3 lg:hidden">
        {metrics.slice(0, 3).map(({ label, value, icon: Icon }) => (
          <div key={label} className="min-w-40 border border-white/10 bg-black p-4 text-white">
            <Icon className="mb-2 h-6 w-6 text-gold" />
            <p className="text-xs font-bold text-white/60">{label}</p>
            <p className="mt-1 text-2xl font-black text-gold">{value}</p>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="space-y-6 lg:col-span-8">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-2xl font-black text-black">
              <span className="h-3 w-3 animate-pulse rounded-full bg-red-600" />
              {isArabic ? "تتبع الخدمات النشطة" : "Active service tracking"}
            </h2>
            <Link href={`/${locale}/client/my-requests`} className="border-b-2 border-black text-sm font-black text-black">
              {isArabic ? "مشاهدة الكل" : "View all"}
            </Link>
          </div>

          <div className="overflow-hidden border border-white/10 bg-black text-white">
            {activeRequest ? (
              <div className="grid min-h-[18rem] lg:grid-cols-5">
                <div className="relative hidden bg-[#121212] lg:col-span-2 lg:block">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_35%,rgba(245,189,24,0.26),transparent_28%),linear-gradient(135deg,#24211a,#050505_62%)]" />
                  <div className="absolute inset-x-8 bottom-8 top-10 border border-gold/35 bg-black/30 p-6">
                    <Wrench className="h-16 w-16 text-gold" />
                    <p className="mt-8 text-sm font-black uppercase tracking-[0.2em] text-white/45">
                      OSTA Field Ops
                    </p>
                  </div>
                </div>
                <div className="flex flex-col justify-between gap-8 p-5 lg:col-span-3 lg:p-8">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <span className="mb-3 inline-block bg-gold px-3 py-1 text-xs font-black text-black">
                        {getClientStatus(activeRequest.status)[locale]}
                      </span>
                      <h3 className="text-2xl font-black text-white">
                        {getLocalizedLabel(clientServiceLabels, activeRequest.service, locale)}
                      </h3>
                      <p className="mt-2 text-sm font-semibold text-white/55">
                        {isArabic ? "رقم الطلب" : "Request ID"}: #{activeRequest.id.slice(0, 8)}
                      </p>
                    </div>
                    <div className="text-start sm:text-end">
                      <div className="mb-1 inline-flex items-center gap-1 text-gold">
                        <Star className="h-5 w-5 fill-current" />
                        <span className="font-black">4.9</span>
                      </div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-white/40">
                        {isArabic ? "متخصص معتمد" : "Certified specialist"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between gap-4 text-xs font-black uppercase text-white">
                      <span>{isArabic ? "المرحلة: في الطريق" : "Stage: en route"}</span>
                      <span>
                        {activeRequest.etaMinutes
                          ? isArabic
                            ? `وصول متوقع: ${formatNumber(locale, activeRequest.etaMinutes)} دقيقة`
                            : `ETA: ${formatNumber(locale, activeRequest.etaMinutes)} min`
                          : isArabic
                            ? "قيد التنسيق"
                            : "Scheduling"}
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden bg-white/10">
                      <div className="h-full w-2/3 bg-gold" />
                    </div>
                    <div className="grid gap-3 text-sm font-semibold text-white/60 sm:grid-cols-3">
                      <span className="inline-flex items-center gap-2">
                        <User className="h-4 w-4 text-gold" />
                        {activeRequest.workerName}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <Clock3 className="h-4 w-4 text-gold" />
                        {activeRequest.etaMinutes ? `${formatNumber(locale, activeRequest.etaMinutes)} ${isArabic ? "دقيقة" : "min"}` : isArabic ? "قيد التنسيق" : "Scheduling"}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gold" />
                        {getLocalizedLabel(clientAreaLabels, activeRequest.area, locale)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Link href={`/${locale}/client/request/${activeRequest.id}`} className="inline-flex flex-1 items-center justify-center gap-2 bg-white px-5 py-3 text-sm font-black text-black shadow-[4px_4px_0_#f5bd18] hover:-translate-y-0.5">
                      <MessageSquare className="h-4 w-4" />
                      {isArabic ? "تواصل مع الفني" : "Contact worker"}
                    </Link>
                    <Link href={`/${locale}/client/request/${activeRequest.id}`} className="inline-flex flex-1 items-center justify-center gap-2 border border-white/20 px-5 py-3 text-sm font-black text-white hover:bg-white/10">
                      <Route className="h-4 w-4" />
                      {isArabic ? "تفاصيل الموقع" : "Location details"}
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 lg:p-10">
                <span className="mb-4 inline-block bg-gold px-3 py-1 text-xs font-black text-black">
                  {isArabic ? "لا يوجد طلب نشط" : "No active request"}
                </span>
                <h3 className="text-2xl font-black text-white">
                  {isArabic ? "ابدأ طلبك القادم في أقل من دقيقة" : "Start your next request in under a minute"}
                </h3>
                <p className="mt-2 text-sm font-semibold text-white/55">
                  {isArabic ? "اختر الخدمة والمنطقة وسنربطك بفني موثّق." : "Choose a service and area, then we will match you with a verified worker."}
                </p>
                <Link href={`/${locale}/client/new-request`} className="mt-6 inline-flex bg-white px-5 py-3 text-sm font-black text-black shadow-[4px_4px_0_#f5bd18]">
                  {isArabic ? "طلب جديد" : "New request"}
                </Link>
              </div>
            )}
          </div>
        </section>

        <section className="space-y-6 lg:col-span-4">
          <h2 className="text-2xl font-black text-black">{isArabic ? "وصول سريع" : "Quick access"}</h2>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.slice(0, 4).map(({ href, title, icon: Icon }, index) => (
              <Link
                key={href}
                href={href as `/${string}`}
                className={cn(
                  "group flex aspect-square flex-col justify-between p-5 text-sm font-black shadow-[4px_4px_0_#000] hover:-translate-y-0.5 sm:p-6",
                  index === 1 ? "bg-white text-black" : "border border-white/10 bg-black text-white"
                )}
              >
                <Icon className={cn("h-9 w-9 transition-transform group-hover:scale-110", index === 1 ? "text-black" : "text-gold")} />
                <span>{title}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-4 lg:col-span-12 lg:mt-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-black text-black">{isArabic ? "فنيين تعاملت معهم سابقاً" : "Previously booked pros"}</h2>
            <Link href={`/${locale}/client/favorites`} className="bg-black px-5 py-2 text-xs font-black text-white shadow-[4px_4px_0_rgba(0,0,0,0.35)]">
              {isArabic ? "استعراض الكل" : "Browse all"}
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {data.favoriteWorkers.length > 0 ? (
              data.favoriteWorkers.slice(0, 3).map((worker) => (
                <div key={worker.id} className="border border-white/10 bg-black p-5 text-white">
                  <div className="mb-6 flex gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center bg-[#121212] text-gold">
                      <User className="h-8 w-8" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="truncate text-sm font-black text-white">{worker.name}</h4>
                      <p className="mt-1 text-xs font-semibold text-white/40">
                        {getLocalizedLabel(clientWorkerSpecialtyLabels, worker.specialty, locale)}
                      </p>
                      <div className="mt-2 flex items-center gap-1 text-gold">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-xs font-black">{formatNumber(locale, worker.rating)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/${locale}/client/new-request`} className="flex-1 bg-gold py-2 text-center text-xs font-black text-black shadow-[3px_3px_0_#000]">
                      {isArabic ? "حجز سريع" : "Quick book"}
                    </Link>
                    <Link href={`/${locale}/contact`} className="flex h-10 w-10 items-center justify-center border border-white/20 text-white hover:bg-white/10">
                      <MessageSquare className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="border border-white/10 bg-black p-6 text-white md:col-span-2 xl:col-span-3">
                <p className="text-sm font-semibold text-white/65">
                  {isArabic ? "الفنيون الذين تتعامل معهم كثيراً سيظهرون هنا." : "Technicians you use often will show up here."}
                </p>
              </div>
            )}

            <Link href={`/${locale}/workers`} className="flex min-h-44 flex-col items-center justify-center border-2 border-dashed border-black/25 bg-white p-6 text-center text-black hover:border-black">
              <Users className="mb-3 h-10 w-10 text-black/45" />
              <p className="text-sm font-black text-black/65">{isArabic ? "اكتشف المزيد من المحترفين" : "Discover more professionals"}</p>
            </Link>
          </div>
        </section>

        <section className="lg:col-span-12">
          <div className="relative overflow-hidden border-t-4 border-gold bg-black p-6 text-white lg:p-10">
            <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="mb-4 flex items-center gap-4">
                  <ShieldCheck className="h-12 w-12 text-gold" />
                  <h2 className="text-2xl font-black text-white lg:text-3xl">
                    {isArabic ? "مدفوعاتك محمية بقوة الصناعة" : "Your payments are protected"}
                  </h2>
                </div>
                <p className="max-w-2xl text-base font-semibold leading-7 text-white/70">
                  {isArabic
                    ? "نضمن جودة التنفيذ وأمان التحويلات. لا يتم تحويل المستحقات للفني إلا بعد تأكيدك على جودة العمل."
                    : "We keep execution quality and transfers clear. Funds are released only after you confirm the completed work."}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-6 text-center">
                <div>
                  <p className="text-4xl font-black text-gold">100%</p>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-white/50">{isArabic ? "ضمان الجودة" : "Quality guarantee"}</p>
                </div>
                <div>
                  <p className="text-4xl font-black text-gold">24/7</p>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-white/50">{isArabic ? "دعم فني" : "Support"}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="lg:col-span-12">
          <ClientPanel title={isArabic ? "آخر الطلبات" : "Recent requests"} className="shadow-none">
            {recentRows.length > 0 ? (
              <div className="divide-y divide-white/10">
                {recentRows.map((request) => {
                  const status = getClientStatus(request.status);
                  return (
                    <div key={request.id} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="font-black text-white">{getLocalizedLabel(clientServiceLabels, request.service, locale)}</p>
                        <p className="mt-1 text-xs font-semibold text-white/45">{request.meta}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="bg-gold px-2 py-1 text-xs font-black text-black">
                          {status[locale]}
                        </span>
                        <Link href={`/${locale}/client/request/${request.id}`} className="inline-flex h-9 items-center justify-center border border-white/20 px-3 text-xs font-black text-white hover:bg-white/10">
                          {isArabic ? "تفاصيل" : "Details"}
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="border border-dashed border-white/20 bg-white/5 p-5 text-sm font-semibold text-white/55">
                {isArabic ? "سجل الطلبات سيظهر هنا بعد أول خدمة." : "Your request history will appear here after the first service."}
              </p>
            )}
          </ClientPanel>
        </section>
      </div>

      <footer className="mt-12 flex flex-col gap-4 border-t border-black/10 pb-2 pt-8 text-xs font-bold text-black/45 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-5">
          <Link href={`/${locale}/privacy`} className="hover:text-black">{isArabic ? "سياسة الخصوصية" : "Privacy"}</Link>
          <Link href={`/${locale}/terms`} className="hover:text-black">{isArabic ? "شروط الاستخدام" : "Terms"}</Link>
          <Link href={`/${locale}/contact`} className="hover:text-black">{isArabic ? "مركز المساعدة" : "Help center"}</Link>
        </div>
        <p className="text-black/45">© 2026 OSTA INDUSTRIAL</p>
      </footer>
    </div>
  );
}

export function WorkerDashboardHome({ locale }: { locale: Locale }) {
  const isArabic = locale === "ar";
  const data = useLiveApiData("/workers/dashboard", {
    summary: { orderQuota: 0, incomingRequests: 0, activeJobs: 0, monthlyEarnings: 0, trialExpiresAt: null },
    queue: []
  });

  const isTrialActive = data.summary.trialExpiresAt && new Date(data.summary.trialExpiresAt) > new Date();
  const trialDaysLeft = data.summary.trialExpiresAt ? Math.ceil((new Date(data.summary.trialExpiresAt).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : 0;

  return (
    <WorkerProShell locale={locale}>
      <WorkerProTopStrip locale={locale} title={isArabic ? "الرئيسية" : "Dashboard"} actionHref={`/${locale}/worker/requests/incoming`} actionLabel={isArabic ? "طلب جديد" : "New request"} />
      <WorkerProHero
        locale={locale}
        title={isArabic ? "مرحباً بك،" : "Welcome back,"}
        highlight={isArabic ? "محترف" : "Osama"}
        subtitle={
          isArabic
            ? "استعد للطلب التالي. خبرتك مطلوبة اليوم، راقب الطلبات القريبة وابدأ تحقيق الدخل من نفس الشاشة."
            : "Ready to tackle the next big project? Your expertise is in high demand today. Browse active service requests and start earning."
        }
        actionHref={`/${locale}/worker/requests/incoming`}
        actionLabel={isArabic ? "استعرض الطلبات" : "Browse jobs"}
        side={
          <>
            <WorkerProInfoCard
              title={isArabic ? "ظهور الملف: مرتفع" : "Profile Visibility: High"}
              text={isArabic ? "تظهر في معظم عمليات البحث المحلية هذا الأسبوع." : "You're appearing in most local searches this week."}
              href={`/${locale}/worker/settings`}
              actionLabel={isArabic ? "تحسين الملف" : "Boost this"}
              icon={Eye}
            />
            <WorkerProInfoCard
              title={isArabic ? "وثّق هويتك" : "Verify identity"}
              text={isArabic ? "استكمل بياناتك لفتح فرص أكبر وعقود أعلى قيمة." : "Complete your profile to unlock premium enterprise contracts."}
              href={`/${locale}/worker/settings`}
              actionLabel={isArabic ? "استكمال الآن" : "Complete now"}
              icon={ShieldCheck}
            />
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <WorkerProMetric
          label={isTrialActive ? (isArabic ? "تجربة مجانية" : "Free trial") : isArabic ? "رصيد الطلبات" : "Job quota"}
          value={isTrialActive ? (isArabic ? `${formatNumber(locale, trialDaysLeft)} يوم` : `${trialDaysLeft}d`) : formatNumber(locale, data.summary.orderQuota)}
          note={isArabic ? "متبقي" : "days left"}
          icon={Sparkles}
          index="01"
        />
        <WorkerProMetric label={isArabic ? "طلبات واردة" : "Incoming jobs"} value={formatNumber(locale, data.summary.incomingRequests)} note={isArabic ? "فرص جديدة" : "new jobs"} icon={Briefcase} index="02" />
        <WorkerProMetric label={isArabic ? "طلبات نشطة" : "Active jobs"} value={formatNumber(locale, data.summary.activeJobs)} note={isArabic ? "قيد التنفيذ" : "in progress"} icon={Zap} index="03" />
        <WorkerProMetric label={isArabic ? "أرباح الشهر" : "Monthly earnings"} value={formatCurrency(locale, data.summary.monthlyEarnings)} note={isArabic ? "هذا الشهر" : "this month"} icon={CircleDollarSign} index="04" />
      </div>

      <WorkerProPanel eyebrow={isArabic ? "طلبات قريبة من نطاقك" : "Real-time requests in your current service area"} title={isArabic ? "طابور العمل المباشر" : "Live job queue"}>
        {data.queue.length === 0 ? (
          <WorkerProEmpty
            title={isArabic ? "جار البحث عن فرص" : "Searching for opportunities"}
            text={isArabic ? "لا توجد طلبات جديدة حالياً. تأكد من تشغيل الإشعارات وتحديث مناطق الخدمة." : "No new jobs in your area right now. Make sure your notifications are on and your skills match your profile."}
            actionLabel={isArabic ? "تحديث المهارات" : "Update skills"}
            actionHref={`/${locale}/worker/settings`}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {data.queue.map((item: any) => (
              <div key={item.id} className="border border-white/10 bg-[#121212] p-5">
                <h3 className="text-xl font-black text-white">{item.serviceNameEn || item.serviceNameAr || item.title || item.id}</h3>
                <p className="mt-3 text-sm text-white/50">{item.areaNameEn || item.areaNameAr || item.area}</p>
              </div>
            ))}
          </div>
        )}
      </WorkerProPanel>
    </WorkerProShell>
  );
}

export function VendorDashboardHome({ locale }: { locale: Locale }) {
  const isArabic = locale === "ar";
  const data = useLiveApiData("/vendors/dashboard", {
    summary: { trialExpiresAt: null, monthlySales: 0, activeOrders: 0, walletBalance: 0 },
    recentRequests: []
  });

  const isTrialActive = data.summary.trialExpiresAt && new Date(data.summary.trialExpiresAt) > new Date();
  const trialDaysLeft = data.summary.trialExpiresAt ? Math.ceil((new Date(data.summary.trialExpiresAt).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : 0;

  return (
    <VendorStitchShell locale={locale}>
      <VendorStitchTopStrip
        locale={locale}
        title={isArabic ? "لوحة المورد" : "Vendor home"}
        actionHref={`/${locale}/vendor/inventory`}
        actionLabel={isArabic ? "إدارة المخزون" : "Manage inventory"}
      />

      <VendorStitchHero
        locale={locale}
        eyebrow={isArabic ? "مركز تشغيل المورد" : "Vendor operating hub"}
        title={isArabic ? "إدارة متجر" : "Storefront"}
        highlight={isArabic ? "الخامات" : "control"}
        subtitle={
          isArabic
            ? "تابع مخزونك، الطلبات النشطة، عروض التسعير، والمحفظة من مساحة واحدة بنفس نظام تصميم Stitch."
            : "Track inventory, active orders, material bids, and wallet balance from one Stitch-aligned workspace."
        }
        actionHref={`/${locale}/vendor/materials`}
        actionLabel={isArabic ? "طلبات الخامات" : "Material bids"}
        side={
          <>
            <VendorStitchMetric
              label={isTrialActive ? (isArabic ? "تجربة مجانية" : "Free trial") : isArabic ? "طلبات نشطة" : "Active orders"}
              value={isTrialActive ? (isArabic ? `${formatNumber(locale, trialDaysLeft)} يوم` : `${trialDaysLeft}d`) : formatNumber(locale, data.summary.activeOrders)}
              note={isArabic ? "جاهزة للمتابعة" : "ready to track"}
              icon={Store}
              index="01"
            />
            <VendorStitchMetric
              label={isArabic ? "مبيعات الشهر" : "Monthly sales"}
              value={formatCurrency(locale, data.summary.monthlySales)}
              note={isArabic ? "إجمالي التشغيل" : "gross flow"}
              icon={CircleDollarSign}
              index="02"
            />
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <VendorStitchMetric label={isArabic ? "طلبات التسعير" : "Quote requests"} value={formatNumber(locale, data.recentRequests.length)} note={isArabic ? "تنتظر ردك" : "awaiting reply"} icon={MessageSquare} index="03" />
        <VendorStitchMetric label={isArabic ? "المحفظة" : "Wallet"} value={formatCurrency(locale, data.summary.walletBalance)} note={isArabic ? "رصيد متاح" : "available"} icon={Wallet} index="04" />
        <VendorStitchMetric label={isArabic ? "الطلبات النشطة" : "Active orders"} value={formatNumber(locale, data.summary.activeOrders)} note={isArabic ? "قيد التنفيذ" : "in progress"} icon={Package} index="05" />
        <VendorStitchMetric label={isArabic ? "حالة المتجر" : "Store state"} value={isArabic ? "نشط" : "Live"} note={isArabic ? "جاهز لاستقبال الطلبات" : "ready for orders"} icon={ShieldCheck} index="06" />
      </div>

      <VendorStitchPanel eyebrow={isArabic ? "طلبات الخامات الأخيرة" : "Latest material requests"} title={isArabic ? "طابور عروض الأسعار" : "Quotation queue"}>
        {data.recentRequests.length === 0 ? (
          <VendorStitchEmpty
            title={isArabic ? "لا توجد طلبات خامات جديدة" : "No new material requests"}
            text={isArabic ? "أي طلب خامات قريب من نطاق متجرك سيظهر هنا فوراً لتقديم عرض سعر." : "Nearby material requests will appear here as soon as they are available for bidding."}
            actionLabel={isArabic ? "افتح المزايدات" : "Open bidding"}
            actionHref={`/${locale}/vendor/materials`}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {data.recentRequests.map((request: any) => (
              <Link key={request.id ?? request.title} href={`/${locale}/vendor/materials`} className="border border-white/10 bg-[#121212] p-5 transition-colors hover:border-gold/60">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gold">{isArabic ? "طلب خامات" : "Material request"}</p>
                <h3 className="mt-3 text-xl font-black text-white">{request.title ?? request.serviceNameAr ?? request.serviceNameEn ?? (isArabic ? "طلب جديد" : "New request")}</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/50">{request.description ?? (isArabic ? "افتح الطلب لعرض التفاصيل وتقديم السعر." : "Open the request to review details and quote.")}</p>
              </Link>
            ))}
          </div>
        )}
      </VendorStitchPanel>
    </VendorStitchShell>
  );
}

export function AdminDashboardHome({ locale }: { locale: Locale }) {
  const isArabic = locale === "ar";
  const data = useLiveApiData("/admin/dashboard", { 
    summary: { totalRevenue: 0, pendingVerifications: 0, openComplaints: 0, activeRequests: 0 },
    verificationQueue: [] 
  });

  return (
    <div className="animate-slideUp space-y-8">
      <SectionTitle
        eyebrow={isArabic ? "لوحة التحكم الرئيسية" : "Command Center"}
        title={isArabic ? "إدارة المنصة" : "Platform Management"}
        subtitle={isArabic ? "راقب العمليات، وثق الحسابات، وحل المشكلات لضمان جودة أُسطفاي." : "Monitor operations, verify accounts, and resolve issues to ensure Ostafy quality."}
        actionLabel={isArabic ? "المستخدمين الجدد" : "Pending Users"}
        actionHref={`/${locale}/admin/workers`}
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard 
          label={isArabic ? "إيراد المنصة" : "Total Revenue"} 
          value={formatCurrency(locale, data.summary.totalRevenue)} 
          note={isArabic ? "تراكمي" : "total cumulative"} 
          icon={TrendingUp} 
          tone="gold" 
        />
        <MetricCard 
          label={isArabic ? "توثيق معلق" : "Pending Verify"} 
          value={String(data.summary.pendingVerifications)} 
          note={isArabic ? "بانتظار الموافقة" : "awaiting approval"} 
          icon={ShieldCheck} 
          tone="gold"
        />
        <MetricCard 
          label={isArabic ? "شكاوى" : "Complaints"} 
          value={String(data.summary.openComplaints)} 
          note={isArabic ? "تحتاج تدخل" : "requires intervention"} 
          icon={ShieldAlert} 
        />
        <MetricCard 
          label={isArabic ? "عمليات نشطة" : "Live Ops"} 
          value={String(data.summary.activeRequests)} 
          note={isArabic ? "طلبات جارية" : "ongoing jobs"} 
          icon={Users} 
        />
      </div>

      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-8">
        <Surface title={isArabic ? "طابور التوثيق (الفنيين)" : "Worker Verification Queue"}>
          {data.verificationQueue.length === 0 ? (
            <EmptyNotice message={isArabic ? "لا توجد طلبات توثيق معلقة حالياً." : "No pending verifications at the moment."} />
          ) : (
            <div className="divide-y divide-onyx-800">
              {data.verificationQueue.map((worker: any) => (
                <div key={worker.id} className="py-4 flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-onyx-800 flex items-center justify-center text-gold-500 group-hover:bg-gold-500/10 transition-colors">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-white leading-none mb-1">{worker.name}</p>
                      <p className="text-xs text-onyx-500">{worker.phone}</p>
                    </div>
                  </div>
                  <Link 
                    href={`/${locale}/admin/workers`}
                    className="h-9 px-4 rounded-lg bg-gold-500/10 text-gold-500 text-xs font-bold flex items-center gap-2 hover:bg-gold-500 hover:text-onyx-950 transition-all"
                  >
                    {isArabic ? "مراجعة" : "Review"}
                    <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </Surface>

        <div className="space-y-8">
          <Surface title={isArabic ? "تحكم النظام" : "System Control"}>
            <div className="grid gap-4">
              <Link href={`/${locale}/admin/pricing`} className="onyx-card p-6 flex items-center justify-between group hover:border-gold-500/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-onyx-800 flex items-center justify-center text-gold-500">
                    <SlidersHorizontal className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-0.5">{isArabic ? "إعدادات التسعير" : "Pricing Settings"}</h4>
                    <p className="text-xs text-onyx-500">{isArabic ? "تعديل العمولات والرسوم" : "Edit commissions & fees"}</p>
                  </div>
                </div>
                <ChevronRight className={cn("h-5 w-5 text-onyx-600 group-hover:text-gold-500 transition-all", isArabic && "rotate-180")} />
              </Link>

              <Link href={`/${locale}/admin/ads`} className="onyx-card p-6 flex items-center justify-between group hover:border-gold-500/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-onyx-800 flex items-center justify-center text-gold-500">
                    <Megaphone className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-0.5">{isArabic ? "إدارة الإعلانات" : "Ads Management"}</h4>
                    <p className="text-xs text-onyx-500">{isArabic ? "الحملات الممولة والبانرات" : "Sponsored ads & banners"}</p>
                  </div>
                </div>
                <ChevronRight className={cn("h-5 w-5 text-onyx-600 group-hover:text-gold-500 transition-all", isArabic && "rotate-180")} />
              </Link>

              <Link href={`/${locale}/admin/settings`} className="onyx-card p-6 flex items-center justify-between group hover:border-gold-500/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-onyx-800 flex items-center justify-center text-gold-500">
                    <Settings className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-0.5">{isArabic ? "إعدادات المنصة" : "Platform Settings"}</h4>
                    <p className="text-xs text-onyx-500">{isArabic ? "التحكم في المتغيرات العامة" : "Control global variables"}</p>
                  </div>
                </div>
                <ChevronRight className={cn("h-5 w-5 text-onyx-600 group-hover:text-gold-500 transition-all", isArabic && "rotate-180")} />
              </Link>
            </div>
          </Surface>

          <div className="onyx-card p-6 border-gold-500/10 bg-gold-500/[0.02]">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-10 w-10 rounded-full bg-gold-500/20 flex items-center justify-center animate-pulse">
                <div className="h-2 w-2 rounded-full bg-gold-500" />
              </div>
              <h4 className="font-bold text-white">{isArabic ? "نبض التشغيل" : "Operational Pulse"}</h4>
            </div>
            <p className="text-sm text-onyx-400 mb-6 leading-relaxed">
              {isArabic 
                ? "النظام يعمل بكفاءة 100%. لا توجد مشكلات فنية تم رصدها في آخر 24 ساعة." 
                : "System is performing at 100% efficiency. No technical issues reported in the last 24h."}
            </p>
            <div className="h-1 w-full bg-onyx-800 rounded-full overflow-hidden">
              <div className="h-full bg-gold-500 w-[95%] shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminAdsPage({ locale }: { locale: Locale }) {
  const isArabic = locale === "ar";
  
  // Tab and Slider state
  const [slides, setSlides] = useState<any[]>([]);
  const [mobileSlides, setMobileSlides] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"slider" | "mobile-slider" | "ads">("slider");
  
  // Form and Editor state
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    eyebrowAr: "", eyebrowEn: "",
    titleAr: "", titleEn: "",
    descAr: "", descEn: "",
    imageUrl: "",
    btn1TextAr: "", btn1TextEn: "", btn1Link: "",
    btn2TextAr: "", btn2TextEn: "", btn2Link: "",
    isActive: true
  });

  // Campaigns state
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [isEditingCampaign, setIsEditingCampaign] = useState(false);
  const [editingCampaignId, setEditingCampaignId] = useState<string | null>(null);
  const [campaignFormData, setCampaignFormData] = useState({
    titleAr: "", titleEn: "",
    descAr: "", descEn: "",
    imageUrl: "",
    link: "",
    isActive: true
  });

  const [isDesktopSliderMediaOpen, setIsDesktopSliderMediaOpen] = useState(false);
  const [isCampaignMediaOpen, setIsCampaignMediaOpen] = useState(false);
  const [isUploadingDesktopSlider, setIsUploadingDesktopSlider] = useState(false);
  const [isUploadingCampaign, setIsUploadingCampaign] = useState(false);

  const DEFAULT_SLIDES = [
    {
      id: "slide-1",
      eyebrowAr: "خدمات موثوقة في مصر",
      eyebrowEn: "Egypt's Trusted Service Network",
      titleAr: "اطلب أُسطفاي محترف بنقرة واحدة",
      titleEn: "Hire a Professional Ostafy in Seconds",
      descAr: "أول منصة تجمع أمهر الفنيين والمتاجر الموثقة في مصر. جودة مضمونة، أسعار عادلة، وتجربة مستخدم فاخرة.",
      descEn: "The first platform connecting skilled pros and verified stores in Egypt. Guaranteed quality, fair prices, and a premium experience.",
      imageUrl: "",
      btn1TextAr: "انضم كصنايعي",
      btn1TextEn: "Join as Pro",
      btn1Link: "/register/worker",
      btn2TextAr: "انضم كمتجر",
      btn2TextEn: "Join as Vendor",
      btn2Link: "/register/vendor",
      isActive: true
    },
    {
      id: "slide-2",
      eyebrowAr: "ضمان حقيقي ودفع آمن",
      eyebrowEn: "True Guarantee & Secure Pay",
      titleAr: "صيانة منزلية بدون قلق أو مفاجآت",
      titleEn: "Home Maintenance Without Worry",
      descAr: "نظام دفع محتجز بالكامل (Escrow) يحمي أموالك حتى اكتمال العمل ورضاك التام عن الخدمة.",
      descEn: "A secure escrow payment system that protects your money until the work is completed and you are fully satisfied.",
      imageUrl: "",
      btn1TextAr: "اطلب فني الآن",
      btn1TextEn: "Book Pro Now",
      btn1Link: "/register/client",
      btn2TextAr: "تصفح الخدمات",
      btn2TextEn: "Browse Services",
      btn2Link: "/services",
      isActive: true
    }
  ];


  useEffect(() => {
    // Load slides and campaigns from database API
    const token = window.localStorage.getItem("osta_access_token") || window.sessionStorage.getItem("osta_access_token") || "";
    const baseUrl = (process.env.NEXT_PUBLIC_OSTA_API_URL ?? "/api");
    
    fetch(`${baseUrl}/admin/slides`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(payload => {
        if (payload.success && Array.isArray(payload.data) && payload.data.length > 0) {
          setSlides(payload.data);
        } else {
          setSlides(DEFAULT_SLIDES);
        }
      })
      .catch(() => setSlides(DEFAULT_SLIDES));

    fetch(`${baseUrl}/admin/campaigns`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(payload => {
        if (payload.success && Array.isArray(payload.data)) {
          setCampaigns(payload.data);
        }
      })
      .catch(() => {});

    fetch(`${baseUrl}/admin/mobile-slides`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(payload => {
        if (payload.success && Array.isArray(payload.data)) {
          setMobileSlides(payload.data);
        }
      })
      .catch(() => {});
  }, []);

  const saveCampaigns = async (updated: any[]) => {
    setCampaigns(updated);
    try {
      const token = window.localStorage.getItem("osta_access_token") || window.sessionStorage.getItem("osta_access_token") || "";
      const baseUrl = (process.env.NEXT_PUBLIC_OSTA_API_URL ?? "/api");
      await fetch(`${baseUrl}/admin/campaigns`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ campaigns: updated })
      });
    } catch (err) {
      console.error("Failed to save campaigns to DB:", err);
    }
  };

  const handleCreateNewCampaign = () => {
    setEditingCampaignId(null);
    setCampaignFormData({
      titleAr: isArabic ? "حملة ترويجية جديدة للمتاجر" : "New Sponsored Vendor Campaign",
      titleEn: "New Sponsored Vendor Campaign",
      descAr: isArabic ? "وصف ترويجي مميز للمتجر يظهر على الصفحة الرئيسية..." : "Premium promo description of this store highlighted on the homepage...",
      descEn: "Premium promo description of this store highlighted on the homepage...",
      imageUrl: "https://images.unsplash.com/photo-1542744094-3a31f103e35f?q=80&w=1000",
      link: "/vendors",
      isActive: true
    });
    setIsEditingCampaign(true);
  };

  const handleEditCampaignClick = (camp: any) => {
    setEditingCampaignId(camp.id);
    setCampaignFormData({
      titleAr: camp.titleAr || "",
      titleEn: camp.titleEn || "",
      descAr: camp.descAr || "",
      descEn: camp.descEn || "",
      imageUrl: camp.imageUrl || "",
      link: camp.link || "",
      isActive: camp.isActive !== false
    });
    setIsEditingCampaign(true);
  };

  const handleDeleteCampaign = (id: string) => {
    if (confirm(isArabic ? "هل أنت متأكد من رغبتك في حذف هذه الحملة؟" : "Are you sure you want to delete this campaign?")) {
      const updated = campaigns.filter(c => c.id !== id);
      saveCampaigns(updated);
    }
  };

  const handleToggleCampaignActive = (id: string) => {
    const updated = campaigns.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c);
    saveCampaigns(updated);
  };

  const handleCampaignImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCampaign(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("purpose", "general");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Upload failed");
      }

      const data = await res.json();
      setCampaignFormData((prev) => ({ ...prev, imageUrl: data.url }));
    } catch (error) {
      console.error("Campaign image upload error:", error);
      alert(isArabic ? "فشل رفع الصورة على الخادم" : "Failed to upload image to server");
    } finally {
      setIsUploadingCampaign(false);
    }
  };

  const handleSaveCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    let updated;
    if (editingCampaignId) {
      updated = campaigns.map(c => c.id === editingCampaignId ? { ...c, ...campaignFormData } : c);
    } else {
      updated = [...campaigns, { id: `camp-${Date.now()}`, ...campaignFormData }];
    }
    saveCampaigns(updated);
    setIsEditingCampaign(false);
    setEditingCampaignId(null);
  };

  const saveSlides = async (updated: any[]) => {
    setSlides(updated);
    // Save to database API so ALL browsers/devices see the same slides
    try {
      const token = window.localStorage.getItem("osta_access_token") || window.sessionStorage.getItem("osta_access_token") || "";
      const baseUrl = (process.env.NEXT_PUBLIC_OSTA_API_URL ?? "/api");
      await fetch(`${baseUrl}/admin/slides`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ slides: updated })
      });
    } catch (err) {
      console.error("Failed to save slides to DB:", err);
    }
  };

  const handleCreateNew = () => {
    setEditingId(null);
    setFormData({
      eyebrowAr: isArabic ? "عروض حصرية وضمان" : "Exclusive Offer & Guarantee",
      eyebrowEn: "Exclusive Offer & Guarantee",
      titleAr: isArabic ? "عنوان ترويجي جديد للسلايدر" : "New Dynamic Promo Slide",
      titleEn: "New Dynamic Promo Slide",
      descAr: isArabic ? "تفاصيل جذابة تظهر للعملاء في واجهة المنصة عند زيارة الموقع..." : "Engaging subtitle description for your users on the frontpage...",
      descEn: "Engaging subtitle description for your users on the frontpage...",
      imageUrl: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1600",
      btn1TextAr: isArabic ? "ابدأ الطلب" : "Get Started",
      btn1TextEn: "Get Started",
      btn1Link: "/register/client",
      btn2TextAr: isArabic ? "المتاجر المعتمدة" : "Verified Stores",
      btn2TextEn: "Verified Stores",
      btn2Link: "/vendors",
      isActive: true
    });
    setIsEditing(true);
  };

  const handleEditClick = (slide: any) => {
    setEditingId(slide.id);
    setFormData({
      eyebrowAr: slide.eyebrowAr || "",
      eyebrowEn: slide.eyebrowEn || "",
      titleAr: slide.titleAr || "",
      titleEn: slide.titleEn || "",
      descAr: slide.descAr || "",
      descEn: slide.descEn || "",
      imageUrl: slide.imageUrl || "",
      btn1TextAr: slide.btn1TextAr || "",
      btn1TextEn: slide.btn1TextEn || "",
      btn1Link: slide.btn1Link || "",
      btn2TextAr: slide.btn2TextAr || "",
      btn2TextEn: slide.btn2TextEn || "",
      btn2Link: slide.btn2Link || "",
      isActive: slide.isActive !== false
    });
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    if (confirm(isArabic ? "هل أنت متأكد من رغبتك في حذف هذا السلايدر؟" : "Are you sure you want to delete this slide?")) {
      const updated = slides.filter(s => s.id !== id);
      saveSlides(updated);
    }
  };

  const handleToggleActive = (id: string) => {
    const updated = slides.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s);
    saveSlides(updated);
  };

  const handleLocalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingDesktopSlider(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("purpose", "general");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Upload failed");
      }

      const data = await res.json();
      setFormData((prev) => ({ ...prev, imageUrl: data.url }));
    } catch (error) {
      console.error("Desktop slider image upload error:", error);
      alert(isArabic ? "فشل رفع الصورة على الخادم" : "Failed to upload image to server");
    } finally {
      setIsUploadingDesktopSlider(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    let updated;
    if (editingId) {
      updated = slides.map(s => s.id === editingId ? { ...s, ...formData } : s);
    } else {
      updated = [...slides, { id: `slide-${Date.now()}`, ...formData }];
    }
    saveSlides(updated);
    setIsEditing(false);
    setEditingId(null);
  };

  return (
    <div className="animate-slideUp space-y-8">
      <SectionTitle
        eyebrow={isArabic ? "الواجهة والترويج" : "Landing Page Promo"}
        title={isArabic ? "إدارة السلايدر الترويجي" : "Hero Slider Control"}
        subtitle={isArabic ? "تحكم في السلايدر الرئيسي بصفحة الهبوط: أضف صور خلفية مذهلة وتصميمات ترويجية جذابة للفنيين والعملاء." : "Fully configure and edit landing page Hero background slides, text contents, buttons, and visual overlays."}
        actionLabel={isEditing ? (isArabic ? "رجوع للقائمة" : "Back to List") : (isArabic ? "إضافة سلايدر جديد" : "Add New Slide")}
        actionHref={undefined} // handled below manually
      />

      {/* Tabs */}
      <div className="flex border-b border-onyx-800 gap-4 mb-8 flex-wrap">
        <button
          onClick={() => { setActiveTab("slider"); setIsEditing(false); }}
          className={cn(
            "pb-4 text-sm font-bold transition-all relative",
            activeTab === "slider" ? "text-gold-800 border-b-2 border-gold-500" : "text-onyx-600 hover:text-onyx-950 md:hover:text-white"
          )}
        >
          🖥️ {isArabic ? "سلايدر الديسكتوب" : "Desktop Slider"}
        </button>
        <button
          onClick={() => { setActiveTab("mobile-slider"); setIsEditing(false); }}
          className={cn(
            "pb-4 text-sm font-bold transition-all relative",
            activeTab === "mobile-slider" ? "text-gold-800 border-b-2 border-gold-500" : "text-onyx-600 hover:text-onyx-950 md:hover:text-white"
          )}
        >
          📱 {isArabic ? "سلايدر الموبايل" : "Mobile Slider"}
        </button>
        <button
          onClick={() => { setActiveTab("ads"); setIsEditing(false); }}
          className={cn(
            "pb-4 text-sm font-bold transition-all relative",
            activeTab === "ads" ? "text-gold-800 border-b-2 border-gold-500" : "text-onyx-600 hover:text-onyx-950 md:hover:text-white"
          )}
        >
          {isArabic ? "حملات الموردين الممولة" : "Sponsored Vendor Ads"}
        </button>
      </div>

      {activeTab === "mobile-slider" && (
        <MobileSlidesEditor
          locale={locale}
          slides={mobileSlides}
          onSave={async (updated: any[]) => {
            setMobileSlides(updated);
            try {
              const token = window.localStorage.getItem("osta_access_token") || window.sessionStorage.getItem("osta_access_token") || "";
              const baseUrl = (process.env.NEXT_PUBLIC_OSTA_API_URL ?? "/api");
              await fetch(`${baseUrl}/admin/mobile-slides`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ slides: updated })
              });
            } catch (err) {
              console.error("Failed to save mobile slides:", err);
            }
          }}
          isArabic={isArabic}
        />
      )}

      {activeTab === "ads" ? (
        <>
          {/* Main Toggle Action */}
          {!isEditingCampaign && (
            <div className="flex justify-between items-center bg-onyx-900/50 p-6 rounded-2xl border border-white/5">
              <div>
                <h3 className="font-bold text-white mb-1">{isArabic ? "حملات الموردين النشطة" : "Active Sponsored Ads"}</h3>
                <p className="text-xs text-onyx-400">{isArabic ? `لديك إجمالي ${campaigns.length} حملات مسجلة.` : `Total ${campaigns.length} campaigns configured.`}</p>
              </div>
              <button
                onClick={handleCreateNewCampaign}
                className="btn-gold flex items-center gap-2 px-5 py-3 text-sm font-bold shadow-lg"
              >
                <Plus className="h-4 w-4" />
                {isArabic ? "إضافة حملة جديدة" : "Add New Campaign"}
              </button>
            </div>
          )}

          {isEditingCampaign ? (
            <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8">
              {/* Form Card */}
              <div className="onyx-card p-8 border-gold-500/10">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                  <div className="h-6 w-1 bg-gold-500 rounded-full" />
                  {editingCampaignId ? (isArabic ? "تعديل الحملة الإعلانية" : "Edit Campaign") : (isArabic ? "إنشاء حملة إعلانية جديدة" : "Create New Campaign")}
                </h3>

                <form onSubmit={handleSaveCampaign} className="space-y-6">
                  {/* Image URL */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-onyx-400 mb-2">
                      {isArabic ? "رابط صورة الإعلان" : "Campaign Image URL"}
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3 mb-3">
                      <div className="flex-1 flex gap-3">
                        <div className="h-12 w-12 bg-onyx-800 rounded-xl flex items-center justify-center text-gold-500 overflow-hidden border border-white/5 shrink-0">
                          {campaignFormData.imageUrl ? (
                            <img src={cleanImageUrl(campaignFormData.imageUrl)} className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLElement).style.display='none'; }} />
                          ) : (
                            <ImageIcon className="h-5 w-5" />
                          )}
                        </div>
                        <input
                          type="text"
                          required
                          value={campaignFormData.imageUrl}
                          onChange={(e) => setCampaignFormData({ ...campaignFormData, imageUrl: e.target.value })}
                          placeholder="https://images.unsplash.com/..."
                          className="flex-1 bg-onyx-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-500"
                        />
                      </div>

                      <div className="flex gap-2">
                        {/* Media Selector Button */}
                        <button
                          type="button"
                          onClick={() => setIsCampaignMediaOpen(true)}
                          className="px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
                        >
                          <FolderOpen className="h-4 w-4 text-gold-500" />
                          {isArabic ? "المعرض" : "Media"}
                        </button>

                        {/* File Upload Button */}
                        <div className="relative shrink-0">
                          <input
                            type="file"
                            accept="image/*;capture=camera"
                            onChange={handleCampaignImageUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                          <button
                            type="button"
                            className="h-full w-full sm:w-auto px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
                          >
                            <UploadCloud className="h-4 w-4 text-gold-500" />
                            {isUploadingCampaign ? (isArabic ? "جاري..." : "Uploading...") : (isArabic ? "رفع" : "Upload")}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <hr className="border-white/5" />

                  {/* Dual Language Text Grid */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Arabic Text Content */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-gold-500 uppercase tracking-widest">{isArabic ? "المحتوى باللغة العربية" : "Arabic Version Content"}</h4>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-onyx-400 mb-1.5">{isArabic ? "العنوان الرئيسي" : "Main Headline"}</label>
                        <input
                          type="text"
                          required
                          value={campaignFormData.titleAr}
                          onChange={(e) => setCampaignFormData({ ...campaignFormData, titleAr: e.target.value })}
                          className="w-full bg-onyx-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-500 font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-onyx-400 mb-1.5">{isArabic ? "الوصف التوضيحي" : "Subtitle Description"}</label>
                        <textarea
                          rows={3}
                          required
                          value={campaignFormData.descAr}
                          onChange={(e) => setCampaignFormData({ ...campaignFormData, descAr: e.target.value })}
                          className="w-full bg-onyx-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-500 leading-relaxed"
                        />
                      </div>
                    </div>

                    {/* English Text Content */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-gold-500 uppercase tracking-widest">{isArabic ? "المحتوى باللغة الانجليزية" : "English Version Content"}</h4>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-onyx-400 mb-1.5">Headline (EN)</label>
                        <input
                          type="text"
                          required
                          value={campaignFormData.titleEn}
                          onChange={(e) => setCampaignFormData({ ...campaignFormData, titleEn: e.target.value })}
                          className="w-full bg-onyx-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-500 font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-onyx-400 mb-1.5">Description (EN)</label>
                        <textarea
                          rows={3}
                          required
                          value={campaignFormData.descEn}
                          onChange={(e) => setCampaignFormData({ ...campaignFormData, descEn: e.target.value })}
                          className="w-full bg-onyx-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-500 leading-relaxed"
                        />
                      </div>
                    </div>
                  </div>

                  <hr className="border-white/5" />

                  {/* Link Target */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-onyx-400 mb-2">
                      {isArabic ? "رابط توجيه الإعلان عند الضغط عليه (مثال: /vendors أو رابط المتجر)" : "Target Link on click (e.g. /vendors or store URL)"}
                    </label>
                    <input
                      type="text"
                      required
                      value={campaignFormData.link}
                      onChange={(e) => setCampaignFormData({ ...campaignFormData, link: e.target.value })}
                      placeholder="/vendors"
                      className="w-full bg-onyx-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-500"
                    />
                  </div>

                  <div className="flex items-center gap-4 bg-onyx-950/60 p-4 rounded-xl border border-white/5">
                    <input
                      type="checkbox"
                      id="isCampaignActive"
                      checked={campaignFormData.isActive}
                      onChange={(e) => setCampaignFormData({ ...campaignFormData, isActive: e.target.checked })}
                      className="accent-gold-500 h-4 w-4"
                    />
                    <label htmlFor="isCampaignActive" className="text-sm font-bold text-white cursor-pointer select-none">
                      {isArabic ? "تفعيل ونشر الإعلان فوراً في الصفحة الرئيسية" : "Activate and publish this campaign immediately on homepage"}
                    </label>
                  </div>

                  {/* Form Submit buttons */}
                  <div className="flex justify-end gap-4 mt-8">
                    <button
                      type="button"
                      onClick={() => setIsEditingCampaign(false)}
                      className="px-6 py-3 rounded-xl border border-white/10 text-white font-bold text-sm hover:bg-white/5 transition-colors"
                    >
                      {isArabic ? "إلغاء التعديل" : "Cancel"}
                    </button>
                    <button
                      type="submit"
                      className="btn-gold px-8 py-3 text-sm font-bold shadow-lg"
                    >
                      {isArabic ? "حفظ التغييرات" : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Live Preview */}
              <div className="space-y-6">
                <div className="sticky top-28">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-gold-500 mb-3">{isArabic ? "معاينة تصميم الإعلان لايف" : "Real-time Live Preview"}</h4>
                  <div className="relative rounded-[2rem] overflow-hidden min-h-[360px] flex items-end p-8 border border-white/10 shadow-2xl bg-onyx-950">
                    {campaignFormData.imageUrl ? (
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-all duration-500"
                        style={{ backgroundImage: `url('${cleanImageUrl(campaignFormData.imageUrl)}')` }}
                      />
                    ) : null}
                    {/* Dark gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-onyx-950 via-onyx-950/70 to-transparent" />

                    <div className="relative z-10 space-y-2 text-start">
                      <span className="inline-block px-2 py-0.5 rounded bg-gold-500 text-onyx-950 text-[9px] font-black uppercase tracking-wider">
                        {isArabic ? "إعلان ممول" : "Sponsored"}
                      </span>
                      {/* Title */}
                      <h2 className="text-xl font-black text-white leading-tight">
                        {isArabic ? (campaignFormData.titleAr || "حملة إعلانية مميزة") : (campaignFormData.titleEn || "Featured Campaign")}
                      </h2>
                      {/* Description */}
                      <p className="text-onyx-300 text-xs leading-relaxed max-w-xs font-light">
                        {isArabic ? (campaignFormData.descAr || "وصف الإعلان التمويلي هنا...") : (campaignFormData.descEn || "Campaign description goes here...")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {campaigns.map((camp) => (
                <div
                  key={camp.id}
                  className="onyx-card overflow-hidden group hover:border-gold-500/30 flex flex-col relative border-white/5"
                >
                  {/* Background Image preview with overlay */}
                  <div className="relative h-44 w-full bg-onyx-900 overflow-hidden border-b border-white/5">
                    {camp.imageUrl ? (
                      <img src={cleanImageUrl(camp.imageUrl)} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-onyx-600"><ImageIcon className="h-8 w-8" /></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-onyx-950 via-onyx-950/60 to-transparent" />
                    
                    <div className="absolute top-4 start-4 flex items-center gap-2">
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-[10px] font-bold border",
                        camp.isActive !== false 
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          : "bg-onyx-800 border-white/5 text-onyx-400"
                      )}>
                        {camp.isActive !== false ? (isArabic ? "نشط" : "Active") : (isArabic ? "مخفي" : "Inactive")}
                      </span>
                    </div>

                    <div className="absolute bottom-4 start-4 end-4">
                      <span className="inline-block px-1.5 py-0.5 rounded bg-gold-500 text-onyx-950 text-[8px] font-black uppercase tracking-wider mb-1">
                        {isArabic ? "إعلان ممول" : "Sponsored"}
                      </span>
                      <h4 className="text-lg font-black text-white mt-0.5 line-clamp-1">{isArabic ? camp.titleAr : camp.titleEn}</h4>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <p className="text-xs text-onyx-400 leading-relaxed line-clamp-2 mb-6 font-light">
                      {isArabic ? camp.descAr : camp.descEn}
                    </p>

                    <div className="flex items-center justify-between border-t border-white/5 pt-4">
                      {/* Active toggle */}
                      <button
                        onClick={() => handleToggleCampaignActive(camp.id)}
                        className={cn(
                          "p-2 rounded-xl border transition-colors",
                          camp.isActive !== false 
                            ? "border-emerald-500/10 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/10" 
                            : "border-white/5 bg-white/5 text-onyx-500 hover:text-white"
                        )}
                        title={camp.isActive !== false ? (isArabic ? "إخفاء الإعلان" : "Deactivate") : (isArabic ? "تفعيل الإعلان" : "Activate")}
                      >
                        {camp.isActive !== false ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>

                      {/* Edit / Delete actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditCampaignClick(camp)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 text-white text-xs font-bold hover:bg-white/10 transition-colors"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          {isArabic ? "تعديل" : "Edit"}
                        </button>
                        <button
                          onClick={() => handleDeleteCampaign(camp.id)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-error/10 bg-error/5 text-error text-xs font-bold hover:bg-white/10 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {isArabic ? "حذف" : "Delete"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {campaigns.length === 0 && (
                <div className="col-span-full">
                  <EmptyNotice message={isArabic ? "لا توجد أي حملات إعلانية ممولة حالياً. ابدأ بإنشاء حملة جديدة!" : "No sponsored campaigns found. Create your first ad now!"} />
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <>
          {/* Main Toggle Action */}
          {!isEditing && (
            <div className="flex justify-between items-center bg-onyx-900/50 p-6 rounded-2xl border border-white/5">
              <div>
                <h3 className="font-bold text-white mb-1">{isArabic ? "الحالة التشغيلية" : "Operational Status"}</h3>
                <p className="text-xs text-onyx-400">{isArabic ? `لديك إجمالي ${slides.length} شرائح مسجلة.` : `Total ${slides.length} slides configured.`}</p>
              </div>
              <button
                onClick={handleCreateNew}
                className="btn-gold flex items-center gap-2 px-5 py-3 text-sm font-bold shadow-lg"
              >
                <Plus className="h-4 w-4" />
                {isArabic ? "إضافة سلايدر جديد" : "Add New Slide"}
              </button>
            </div>
          )}

          {isEditing ? (
            <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8">
              {/* Form Card */}
              <div className="onyx-card p-8 border-gold-500/10">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                  <div className="h-6 w-1 bg-gold-500 rounded-full" />
                  {editingId ? (isArabic ? "تعديل شريحة السلايدر" : "Edit Slider Slide") : (isArabic ? "إنشاء شريحة سلايدر جديدة" : "Create New Slide")}
                </h3>

                <form onSubmit={handleSave} className="space-y-6">
                  {/* Image Background URL */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-onyx-400 mb-2">
                      {isArabic ? "رابط صورة الخلفية (تصميم ضهر السلايدر)" : "Background Image URL (Slide Backdrop)"}
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3 mb-3">
                      <div className="flex-1 flex gap-3">
                        <div className="h-12 w-12 bg-onyx-800 rounded-xl flex items-center justify-center text-gold-500 overflow-hidden border border-white/5 shrink-0">
                          {formData.imageUrl ? (
                            <img src={cleanImageUrl(formData.imageUrl)} className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLElement).style.display='none'; }} />
                          ) : (
                            <ImageIcon className="h-5 w-5" />
                          )}
                        </div>
                        <input
                          type="text"
                          required
                          value={formData.imageUrl}
                          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                          placeholder="https://images.unsplash.com/..."
                          className="flex-1 bg-onyx-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-500"
                        />
                      </div>

                      <div className="flex gap-2">
                        {/* Media Selector Button */}
                        <button
                          type="button"
                          onClick={() => setIsDesktopSliderMediaOpen(true)}
                          className="px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
                        >
                          <FolderOpen className="h-4 w-4 text-gold-500" />
                          {isArabic ? "المعرض" : "Media"}
                        </button>

                        {/* File Upload Button */}
                        <div className="relative shrink-0">
                          <input
                            type="file"
                            accept="image/*;capture=camera"
                            onChange={handleLocalImageUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                          <button
                            type="button"
                            className="h-full w-full sm:w-auto px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
                          >
                            <UploadCloud className="h-4 w-4 text-gold-500" />
                            {isUploadingDesktopSlider ? (isArabic ? "جاري..." : "Uploading...") : (isArabic ? "رفع" : "Upload")}
                          </button>
                        </div>
                      </div>
                    </div>


                  </div>

                  <hr className="border-white/5" />

                  {/* Dual Language Text Grid */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Arabic Text Content */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-gold-500 uppercase tracking-widest">{isArabic ? "المحتوى باللغة العربية" : "Arabic Version Content"}</h4>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-onyx-400 mb-1.5">{isArabic ? "الشعار الصغير (العلوي)" : "Small Eyebrow Tag"}</label>
                        <input
                          type="text"
                          required
                          value={formData.eyebrowAr}
                          onChange={(e) => setFormData({ ...formData, eyebrowAr: e.target.value })}
                          className="w-full bg-onyx-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-onyx-400 mb-1.5">{isArabic ? "العنوان الرئيسي" : "Main Headline"}</label>
                        <input
                          type="text"
                          required
                          value={formData.titleAr}
                          onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                          className="w-full bg-onyx-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-500 font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-onyx-400 mb-1.5">{isArabic ? "الوصف التوضيحي" : "Subtitle Description"}</label>
                        <textarea
                          rows={3}
                          required
                          value={formData.descAr}
                          onChange={(e) => setFormData({ ...formData, descAr: e.target.value })}
                          className="w-full bg-onyx-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-500 leading-relaxed"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-onyx-400 mb-1.5">{isArabic ? "نص الزر الأول" : "Button 1 Text"}</label>
                        <input
                          type="text"
                          required
                          value={formData.btn1TextAr}
                          onChange={(e) => setFormData({ ...formData, btn1TextAr: e.target.value })}
                          className="w-full bg-onyx-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-onyx-400 mb-1.5">{isArabic ? "نص الزر الثاني" : "Button 2 Text"}</label>
                        <input
                          type="text"
                          value={formData.btn2TextAr}
                          onChange={(e) => setFormData({ ...formData, btn2TextAr: e.target.value })}
                          className="w-full bg-onyx-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-500"
                        />
                      </div>
                    </div>

                    {/* English Text Content */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-gold-500 uppercase tracking-widest">{isArabic ? "المحتوى باللغة الانجليزية" : "English Version Content"}</h4>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-onyx-400 mb-1.5">Eyebrow Tag (EN)</label>
                        <input
                          type="text"
                          required
                          value={formData.eyebrowEn}
                          onChange={(e) => setFormData({ ...formData, eyebrowEn: e.target.value })}
                          className="w-full bg-onyx-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-onyx-400 mb-1.5">Headline (EN)</label>
                        <input
                          type="text"
                          required
                          value={formData.titleEn}
                          onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                          className="w-full bg-onyx-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-500 font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-onyx-400 mb-1.5">Description (EN)</label>
                        <textarea
                          rows={3}
                          required
                          value={formData.descEn}
                          onChange={(e) => setFormData({ ...formData, descEn: e.target.value })}
                          className="w-full bg-onyx-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-500 leading-relaxed"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-onyx-400 mb-1.5">Button 1 Text (EN)</label>
                        <input
                          type="text"
                          required
                          value={formData.btn1TextEn}
                          onChange={(e) => setFormData({ ...formData, btn1TextEn: e.target.value })}
                          className="w-full bg-onyx-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-onyx-400 mb-1.5">Button 2 Text (EN)</label>
                        <input
                          type="text"
                          value={formData.btn2TextEn}
                          onChange={(e) => setFormData({ ...formData, btn2TextEn: e.target.value })}
                          className="w-full bg-onyx-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-500"
                        />
                      </div>
                    </div>
                  </div>

                  <hr className="border-white/5" />

                  {/* Actions & Links */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-onyx-400 mb-2">
                        {isArabic ? "رابط توجيه الزر الأول (مثل: /register/worker)" : "Button 1 Target Link"}
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.btn1Link}
                        onChange={(e) => setFormData({ ...formData, btn1Link: e.target.value })}
                        placeholder="/register/client"
                        className="w-full bg-onyx-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-onyx-400 mb-2">
                        {isArabic ? "رابط توجيه الزر الثاني (اختياري)" : "Button 2 Target Link (Optional)"}
                      </label>
                      <input
                        type="text"
                        value={formData.btn2Link}
                        onChange={(e) => setFormData({ ...formData, btn2Link: e.target.value })}
                        placeholder="/services"
                        className="w-full bg-onyx-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 bg-onyx-950/60 p-4 rounded-xl border border-white/5">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="accent-gold-500 h-4 w-4"
                    />
                    <label htmlFor="isActive" className="text-sm font-bold text-white cursor-pointer select-none">
                      {isArabic ? "تفعيل السلايدر ونشره فوراً في صفحة الهبوط" : "Activate and publish this slide on landing page immediately"}
                    </label>
                  </div>

                  {/* Form Submit buttons */}
                  <div className="flex justify-end gap-4 mt-8">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-3 rounded-xl border border-white/10 text-white font-bold text-sm hover:bg-white/5 transition-colors"
                    >
                      {isArabic ? "إلغاء التعديل" : "Cancel"}
                    </button>
                    <button
                      type="submit"
                      className="btn-gold px-8 py-3 text-sm font-bold shadow-lg"
                    >
                      {isArabic ? "حفظ التغييرات" : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Real-time Miniature Preview */}
              <div className="space-y-6">
                <div className="sticky top-28">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-gold-500 mb-3">{isArabic ? "معاينة تصميم السلايدر لايف" : "Real-time Live Preview"}</h4>
                  <div className="relative rounded-[2rem] overflow-hidden min-h-[420px] flex items-center justify-center p-6 border border-white/10 shadow-2xl bg-onyx-950">
                    {formData.imageUrl ? (
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-all duration-500"
                        style={{ backgroundImage: `url('${cleanImageUrl(formData.imageUrl)}')` }}
                      />
                    ) : null}
                    {/* Dark gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-onyx-950 via-onyx-950/85 to-onyx-950/50" />

                    <div className="relative text-center max-w-sm z-10 space-y-4">
                      {/* Eyebrow */}
                      <span className="inline-block px-2.5 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-500 text-[10px] font-bold">
                        {isArabic ? (formData.eyebrowAr || "خدمات موثوقة") : (formData.eyebrowEn || "Exclusive Tag")}
                      </span>
                      {/* Title */}
                      <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">
                        {isArabic ? (formData.titleAr || "اطلب أُسطفاي محترف") : (formData.titleEn || "Catchy Title")}
                      </h2>
                      {/* Description */}
                      <p className="text-onyx-300 text-xs leading-relaxed max-w-xs mx-auto font-light">
                        {isArabic ? (formData.descAr || "وصف تجريبي للشريحة الترويجية...") : (formData.descEn || "Promo description goes here...")}
                      </p>
                      {/* Buttons */}
                      <div className="flex flex-col gap-2 pt-3">
                        <button type="button" className="btn-gold py-2.5 px-4 text-xs font-bold pointer-events-none">
                          {isArabic ? (formData.btn1TextAr || "انضم الآن") : (formData.btn1TextEn || "Button 1")}
                        </button>
                        {formData.btn2TextAr && (
                          <button type="button" className="btn-onyx py-2.5 px-4 text-xs font-bold border-gold-500/20 text-gold-500 pointer-events-none">
                            {isArabic ? formData.btn2TextAr : formData.btn2TextEn}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {slides.map((slide, i) => (
                <div
                  key={slide.id}
                  className="onyx-card overflow-hidden group hover:border-gold-500/30 flex flex-col relative border-white/5"
                >
                  {/* Background Image preview with overlay */}
                  <div className="relative h-44 w-full bg-onyx-900 overflow-hidden border-b border-white/5">
                    {slide.imageUrl ? (
                      <img src={cleanImageUrl(slide.imageUrl)} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-onyx-600"><ImageIcon className="h-8 w-8" /></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-onyx-950 via-onyx-950/60 to-transparent" />
                    
                    <div className="absolute top-4 start-4 flex items-center gap-2">
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-[10px] font-bold border",
                        slide.isActive !== false 
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          : "bg-onyx-800 border-white/5 text-onyx-400"
                      )}>
                        {slide.isActive !== false ? (isArabic ? "نشط" : "Active") : (isArabic ? "مخفي" : "Inactive")}
                      </span>
                    </div>

                    <div className="absolute bottom-4 start-4 end-4">
                      <span className="text-[10px] font-bold text-gold-500/90 uppercase tracking-widest">{isArabic ? slide.eyebrowAr : slide.eyebrowEn}</span>
                      <h4 className="text-lg font-black text-white mt-1 line-clamp-1">{isArabic ? slide.titleAr : slide.titleEn}</h4>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <p className="text-xs text-onyx-400 leading-relaxed line-clamp-3 mb-6 font-light">
                      {isArabic ? slide.descAr : slide.descEn}
                    </p>

                    <div className="flex items-center justify-between border-t border-white/5 pt-4">
                      {/* Active toggle */}
                      <button
                        onClick={() => handleToggleActive(slide.id)}
                        className={cn(
                          "p-2 rounded-xl border transition-colors",
                          slide.isActive !== false 
                            ? "border-emerald-500/10 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/10" 
                            : "border-white/5 bg-white/5 text-onyx-500 hover:text-white"
                        )}
                        title={slide.isActive !== false ? (isArabic ? "إخفاء السلايدر" : "Deactivate") : (isArabic ? "تفعيل السلايدر" : "Activate")}
                      >
                        {slide.isActive !== false ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>

                      {/* Edit / Delete actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditClick(slide)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 text-white text-xs font-bold hover:bg-white/10 transition-colors"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          {isArabic ? "تعديل" : "Edit"}
                        </button>
                        <button
                          onClick={() => handleDelete(slide.id)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-error/10 bg-error/5 text-error text-xs font-bold hover:bg-error/10 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {isArabic ? "حذف" : "Delete"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {slides.length === 0 && (
                <div className="col-span-full">
                  <EmptyNotice message={isArabic ? "لا توجد أي شرائح ترويجية حالياً. ابدأ بإنشاء شريحة جديدة!" : "No custom slides found. Create your first slide now!"} />
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Media Selector Modals */}
      <MediaSelectorModal
        isOpen={isDesktopSliderMediaOpen}
        onClose={() => setIsDesktopSliderMediaOpen(false)}
        onSelect={(url) => setFormData((prev) => ({ ...prev, imageUrl: url }))}
        locale={locale}
      />
      <MediaSelectorModal
        isOpen={isCampaignMediaOpen}
        onClose={() => setIsCampaignMediaOpen(false)}
        onSelect={(url) => setCampaignFormData((prev) => ({ ...prev, imageUrl: url }))}
        locale={locale}
      />
    </div>
  );
}

export function AdminPricingPage({ locale }: { locale: Locale }) {
  const isArabic = locale === "ar";
  return (
    <div className="animate-slideUp space-y-8">
      <SectionTitle
        eyebrow={isArabic ? "باقات التشغيل والأسعار" : "Operational Packages & Pricing"}
        title={isArabic ? "إدارة الاشتراكات" : "Subscription Management"}
        subtitle={isArabic ? "تحكم في باقات الفنيين والموردين، وحدد نسب العمولات وقواعد التجربة المجانية." : "Manage worker and vendor packages, define commission rates and trial rules."}
        actionLabel={isArabic ? "حفظ التغييرات" : "Save Changes"}
      />

      <div className="grid lg:grid-cols-2 gap-8">
        <Surface title={isArabic ? "باقات الفنيين والموردين" : "Pro & Vendor Packages"}>
          <div className="space-y-6">
            <div className="onyx-card p-6 border-gold-500/20 bg-gold-500/5">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xl font-black text-white">{isArabic ? "فترة السماح (التجربة)" : "Trial Period"}</h4>
                <Sparkles className="h-6 w-6 text-gold-500" />
              </div>
              <p className="text-onyx-400 text-sm mb-4 leading-relaxed">
                {isArabic 
                  ? "يحصل كل فني ومورد موثق حديثاً على شهر كامل (30 يوم) مجاناً لتجربة المنصة بدون قيود." 
                  : "Every newly verified pro and vendor receives one full month (30 days) for free to explore the platform."}
              </p>
              <div className="text-2xl font-black text-gold-500">{isArabic ? "شهر مجاني" : "1 Month Free"}</div>
            </div>

            <div className="onyx-card p-6 border-onyx-700">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xl font-black text-white">{isArabic ? "نظام رصيد العمليات" : "Order Quota System"}</h4>
                <CircleDollarSign className="h-6 w-6 text-gold-500" />
              </div>
              <p className="text-onyx-400 text-sm mb-4 leading-relaxed">
                {isArabic 
                  ? "بعد انتهاء الشهر المجاني، يتم شحن رصيد العمليات بنظام الباقات. الباقة الأساسية تشمل 10 عمليات." 
                  : "After the trial month, orders are charged via the quota system. The standard package includes 10 orders."}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">200 {isArabic ? "ج.م" : "EGP"}</span>
                <span className="text-onyx-500 text-sm font-bold">/ 10 {isArabic ? "عمليات" : "orders"}</span>
              </div>
            </div>
          </div>
        </Surface>

        <Surface title={isArabic ? "نسب العمولات الافتراضية" : "Default Commission Rates"}>
          <div className="grid gap-6">
            <div className="onyx-card p-6 border-onyx-700 group hover:border-gold-500/30 transition-all">
              <div className="flex items-center justify-between mb-4">
                 <p className="text-onyx-400 text-sm font-bold uppercase tracking-widest">{isArabic ? "عمولة الصنايعية" : "Worker Commission"}</p>
                 <Wrench className="h-5 w-5 text-gold-500" />
              </div>
              <h4 className="text-4xl font-black text-white">15%</h4>
              <p className="text-xs text-onyx-600 mt-2">{isArabic ? "تخصم من إجمالي قيمة الأوردر" : "Deducted from total order value"}</p>
            </div>

            <div className="onyx-card p-6 border-onyx-700 group hover:border-gold-500/30 transition-all">
              <div className="flex items-center justify-between mb-4">
                 <p className="text-onyx-400 text-sm font-bold uppercase tracking-widest">{isArabic ? "عمولة المتاجر" : "Vendor Commission"}</p>
                 <Store className="h-5 w-5 text-gold-500" />
              </div>
              <h4 className="text-4xl font-black text-white">10%</h4>
              <p className="text-xs text-onyx-600 mt-2">{isArabic ? "تخصم من مبيعات قطع الغيار" : "Deducted from material sales"}</p>
            </div>
          </div>
        </Surface>
      </div>
    </div>
  );
}

// ─── Mobile Slides Editor ──────────────────────────────────────────────────────
function MobileSlidesEditor({
  locale,
  slides,
  onSave,
  isArabic,
}: {
  locale: Locale;
  slides: any[];
  onSave: (slides: any[]) => Promise<void>;
  isArabic: boolean;
}) {
  const [editing, setEditing] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [localSlides, setLocalSlides] = useState<any[]>(slides);

  const [isMediaOpen, setIsMediaOpen] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleDirectImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("purpose", "general");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Upload failed");
      }

      const data = await res.json();
      setEditing((prev: any) => ({ ...prev, imageUrl: data.url }));
    } catch (error) {
      console.error("Direct upload error:", error);
      alert(isArabic ? "فشل رفع الصورة على الخادم" : "Failed to upload image to server");
    } finally {
      setIsUploadingImage(false);
    }
  };

  useEffect(() => {
    setLocalSlides(slides);
  }, [slides]);

  const DEFAULT_MOBILE_SLIDE = {
    id: `m-slide-${Date.now()}`,
    eyebrowAr: "علامة مميزة",
    eyebrowEn: "Featured Tag",
    titleAr: "عنوان السلايدر",
    titleEn: "Slide Title",
    descAr: "وصف مختصر للسلايدر",
    descEn: "Short slide description",
    imageUrl: "",
    btn1TextAr: "اطلب الآن",
    btn1TextEn: "Order Now",
    btn1Link: "/register/client",
    btn2TextAr: "",
    btn2TextEn: "",
    btn2Link: "",
    isActive: true,
  };

  const handleSave = async (slide: any) => {
    setSaving(true);
    const updated = localSlides.find((s) => s.id === slide.id)
      ? localSlides.map((s) => (s.id === slide.id ? slide : s))
      : [...localSlides, slide];
    setLocalSlides(updated);
    setEditing(null);
    await onSave(updated);
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const updated = localSlides.filter((s) => s.id !== id);
    setLocalSlides(updated);
    await onSave(updated);
  };

  const handleToggle = async (id: string) => {
    const updated = localSlides.map((s) =>
      s.id === id ? { ...s, isActive: !s.isActive } : s
    );
    setLocalSlides(updated);
    await onSave(updated);
  };

  if (editing) {
    return (
      <>
      <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8">
        <div className="onyx-card p-8 border-gold-700/15">
          <h3 className="text-xl font-bold text-onyx-950 mb-6 flex items-center gap-3">
            <div className="h-6 w-1 bg-gold-800 rounded-full" />
            📱 {editing.id === editing._isNew ? (isArabic ? "إضافة سلايدر موبايل" : "Add Mobile Slide") : (isArabic ? "تعديل سلايدر الموبايل" : "Edit Mobile Slide")}
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              { ar: "eyebrowAr", en: "eyebrowEn", label: isArabic ? "الـ Eyebrow" : "Eyebrow Tag" },
              { ar: "titleAr", en: "titleEn", label: isArabic ? "العنوان" : "Title" },
              { ar: "descAr", en: "descEn", label: isArabic ? "الوصف" : "Description" },
              { ar: "btn1TextAr", en: "btn1TextEn", label: isArabic ? "زر 1 نص" : "Button 1 Text" },
              { ar: "btn2TextAr", en: "btn2TextEn", label: isArabic ? "زر 2 نص (اختياري)" : "Button 2 Text (optional)" },
            ].map(({ ar, en, label }) => (
              <div key={ar} className="md:col-span-2 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-onyx-600 mb-1">{label} (AR)</label>
                  <input
                    value={editing[ar] || ""}
                    onChange={(e) => setEditing({ ...editing, [ar]: e.target.value })}
                    className="w-full rounded-xl border border-gold-700/20 bg-transparent px-4 py-2 text-sm text-onyx-950 focus:border-gold-700/50 outline-none"
                    dir="rtl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-onyx-600 mb-1">{label} (EN)</label>
                  <input
                    value={editing[en] || ""}
                    onChange={(e) => setEditing({ ...editing, [en]: e.target.value })}
                    className="w-full rounded-xl border border-gold-700/20 bg-transparent px-4 py-2 text-sm text-onyx-950 focus:border-gold-700/50 outline-none"
                  />
                </div>
              </div>
            ))}

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-onyx-600 mb-1">
                {isArabic ? "رابط الصورة (Portrait/Vertical)" : "Image URL (Portrait/Vertical)"}
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  value={editing.imageUrl || ""}
                  onChange={(e) => setEditing({ ...editing, imageUrl: e.target.value })}
                  className="flex-1 rounded-xl border border-gold-700/20 bg-transparent px-4 py-2 text-sm text-onyx-950 focus:border-gold-700/50 outline-none"
                  placeholder="https://... or /mobile_slide_1.png"
                />
                
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsMediaOpen(true)}
                    className="px-4 py-2 rounded-xl border border-gold-700/20 bg-gold-700/5 text-gold-800 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-gold-700/10 transition-colors"
                  >
                    <FolderOpen className="h-3.5 w-3.5" />
                    {isArabic ? "المعرض" : "Media"}
                  </button>

                  <div className="relative shrink-0">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleDirectImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <button
                      type="button"
                      className="h-full px-4 py-2 rounded-xl border border-gold-700/20 bg-transparent text-onyx-700 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-gold-700/5 transition-colors"
                    >
                      <UploadCloud className="h-3.5 w-3.5" />
                      {isUploadingImage ? (isArabic ? "جاري..." : "Uploading...") : (isArabic ? "رفع" : "Upload")}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-onyx-600 mb-1">{isArabic ? "رابط زر 1" : "Button 1 Link"}</label>
              <input
                value={editing.btn1Link || ""}
                onChange={(e) => setEditing({ ...editing, btn1Link: e.target.value })}
                className="w-full rounded-xl border border-gold-700/20 bg-transparent px-4 py-2 text-sm text-onyx-950 focus:border-gold-700/50 outline-none"
                placeholder="/register/client"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-onyx-600 mb-1">{isArabic ? "رابط زر 2 (اختياري)" : "Button 2 Link (optional)"}</label>
              <input
                value={editing.btn2Link || ""}
                onChange={(e) => setEditing({ ...editing, btn2Link: e.target.value })}
                className="w-full rounded-xl border border-gold-700/20 bg-transparent px-4 py-2 text-sm text-onyx-950 focus:border-gold-700/50 outline-none"
                placeholder="/services"
              />
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <button
              onClick={() => handleSave(editing)}
              disabled={saving}
              className="btn-gold flex-1 text-center py-3 text-sm font-bold"
            >
              {saving ? "..." : (isArabic ? "حفظ التغييرات" : "Save Changes")}
            </button>
            <button
              onClick={() => setEditing(null)}
              className="btn-ghost flex-1 py-3 text-sm font-bold"
            >
              {isArabic ? "إلغاء" : "Cancel"}
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="onyx-card p-6 border-gold-700/15">
          <h4 className="text-sm font-bold text-onyx-600 mb-4 uppercase tracking-widest">
            {isArabic ? "معاينة الموبايل" : "Mobile Preview"}
          </h4>
          <div
            className="rounded-3xl overflow-hidden relative"
            style={{
              aspectRatio: "9/16",
              maxHeight: "400px",
              background: editing.imageUrl ? `url('${editing.imageUrl}') center/cover` : "oklch(93% 0.12 85)",
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(to top, oklch(92% 0.10 85) 0%, oklch(92% 0.10 85 / 0.8) 35%, transparent 70%)",
              }}
            />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <span
                className="inline-block mb-2 px-2 py-0.5 rounded-full text-xs font-black uppercase tracking-widest text-white"
                style={{ background: "oklch(45% 0.11 85)" }}
              >
                {editing.eyebrowAr || "العنوان الفرعي"}
              </span>
              <p className="text-lg font-black text-onyx-950 leading-tight mb-1">
                {editing.titleAr || "عنوان السلايددر"}
              </p>
              <p className="text-xs text-onyx-700 mb-3">
                {editing.descAr || "وصف مختصر"}
              </p>
              <div
                className="py-2 px-4 rounded-xl text-center text-xs font-bold text-white"
                style={{ background: "oklch(10% 0.005 60)" }}
              >
                {editing.btn1TextAr || "الزر الأول"}
              </div>
            </div>
          </div>
        </div>
      </div>
      <MediaSelectorModal
        isOpen={isMediaOpen}
        onClose={() => setIsMediaOpen(false)}
        onSelect={(url) => setEditing((prev: any) => ({ ...prev, imageUrl: url }))}
        locale={locale}
      />
      </>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-bold text-onyx-950">
            {isArabic ? "سلايدرات الموبايل" : "Mobile Slides"}
          </h3>
          <p className="text-xs text-onyx-600 mt-1">
            {isArabic
              ? "هذه الشرائح تظهر فقط على الموبايل بخلفية صفراء"
              : "These slides appear only on mobile with yellow background"}
          </p>
        </div>
        <button
          onClick={() => setEditing({ ...DEFAULT_MOBILE_SLIDE, id: `m-slide-${Date.now()}`, _isNew: true })}
          className="btn-gold flex items-center gap-2 px-5 py-3 text-sm font-bold"
        >
          <Plus className="h-4 w-4" />
          {isArabic ? "إضافة سلايدر" : "Add Slide"}
        </button>
      </div>

      {localSlides.length === 0 ? (
        <div className="onyx-card p-12 text-center border-gold-700/10">
          <div className="text-4xl mb-4">📱</div>
          <p className="text-onyx-600 font-medium">
            {isArabic ? "لا توجد شرائح موبايل بعد. أضف واحدة!" : "No mobile slides yet. Add one!"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {localSlides.map((slide) => (
            <div
              key={slide.id}
              className="onyx-card p-5 border-gold-700/10 flex items-center gap-4"
            >
              <div
                className="h-16 w-10 rounded-xl bg-cover bg-center shrink-0"
                style={{
                  backgroundImage: slide.imageUrl ? `url('${slide.imageUrl}')` : undefined,
                  background: slide.imageUrl ? undefined : "oklch(93% 0.12 85)",
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-onyx-950 truncate">{slide.titleAr || slide.titleEn}</p>
                <p className="text-xs text-onyx-600 truncate">{slide.eyebrowAr || slide.eyebrowEn}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleToggle(slide.id)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold transition-all",
                    slide.isActive
                      ? "bg-gold-700/20 text-gold-800"
                      : "bg-onyx-800/20 text-onyx-600"
                  )}
                >
                  {slide.isActive ? (isArabic ? "نشط" : "Active") : (isArabic ? "مخفي" : "Hidden")}
                </button>
                <button
                  onClick={() => setEditing(slide)}
                  className="p-2 rounded-xl text-onyx-600 hover:text-gold-800 hover:bg-gold-700/10 transition-all"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(slide.id)}
                  className="p-2 rounded-xl text-onyx-600 hover:text-red-500 hover:bg-red-500/10 transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <MediaSelectorModal
        isOpen={isMediaOpen}
        onClose={() => setIsMediaOpen(false)}
        onSelect={(url) => setEditing((prev: any) => ({ ...prev, imageUrl: url }))}
        locale={locale}
      />
    </div>
  );
}

