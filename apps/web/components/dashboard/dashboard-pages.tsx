"use client";

import type { ComponentType, ReactNode } from "react";
import Link from "next/link";
import {
  ArrowUpRight, Banknote, Briefcase, CalendarClock, CheckCircle2,
  CircleDollarSign, Clock3, MapPin, Route, ShieldAlert, ShieldCheck,
  Sparkles, Star, Store, TrendingUp, Users, Wallet, Wrench, Zap
} from "lucide-react";

import { useLiveApiData } from "@/hooks/use-live-api-data";
import { AdBanner } from "@/components/shared/ad-banner";
import type { Locale } from "@/lib/locales";
import { cn } from "@/lib/utils";

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

export function ClientDashboardHome({ locale }: { locale: Locale }) {
  const isArabic = locale === "ar";
  const data = useLiveApiData("/clients/dashboard", { 
    summary: { totalRequests: 0, activeRequests: 0, walletBalance: 0, activeWarranties: 0 },
    activeRequests: [] 
  });

  return (
    <div className="animate-slideUp">
      <SectionTitle
        eyebrow={isArabic ? "بوابة العميل" : "Client Portal"}
        title={isArabic ? "أهلاً بك في أُسطى" : "Welcome to OSTA"}
        subtitle={isArabic ? "تحكم في طلباتك، تتبع الفنيين، وأدر مدفوعاتك بكل سهولة وأمان." : "Manage your requests, track pros, and handle payments with ease and security."}
        actionLabel={isArabic ? "طلب جديد" : "New Request"}
        actionHref={`/${locale}/client/new-request`}
      />

      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label={isArabic ? "طلباتك" : "Total Requests"} value={String(data.summary.totalRequests)} note={isArabic ? "إجمالي الطلبات" : "all time"} icon={Briefcase} />
        <MetricCard label={isArabic ? "نشط" : "Active"} value={String(data.summary.activeRequests)} note={isArabic ? "قيد التنفيذ حالياً" : "currently active"} icon={Zap} tone="gold" />
        <MetricCard label={isArabic ? "الضمان" : "Warranty"} value={String(data.summary.activeWarranties)} note={isArabic ? "خدمات تحت الضمان" : "active warranties"} icon={ShieldCheck} />
        <MetricCard label={isArabic ? "المحفظة" : "Wallet"} value={formatCurrency(locale, data.summary.walletBalance)} note={isArabic ? "رصيدك الحالي" : "available balance"} icon={Wallet} />
      </div>

      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-8">
        <Surface title={isArabic ? "الطلبات النشطة" : "Active Requests"}>
          {data.activeRequests.length === 0 ? (
            <EmptyNotice message={isArabic ? "لا توجد طلبات نشطة حالياً. ابدأ بطلبك الأول!" : "No active requests. Start your first job today!"} />
          ) : (
            <div className="space-y-4">
              {/* Mapping live requests here */}
            </div>
          )}
        </Surface>

        <Surface title={isArabic ? "روابط سريعة" : "Quick Actions"}>
          <div className="grid gap-4">
            <Link href={`/${locale}/client/new-request`} className="onyx-card p-6 flex items-center justify-between group hover:border-gold-500/40">
               <div>
                  <h4 className="font-bold text-white mb-1">{isArabic ? "اطلب فني" : "Book a Pro"}</h4>
                  <p className="text-sm text-onyx-500">{isArabic ? "كهرباء، سباكة، والمزيد" : "Electrical, Plumbing, and more"}</p>
               </div>
               <ArrowUpRight className="h-5 w-5 text-gold-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>
            <Link href={`/${locale}/vendors`} className="onyx-card p-6 flex items-center justify-between group hover:border-gold-500/40">
               <div>
                  <h4 className="font-bold text-white mb-1">{isArabic ? "تسوق الخامات" : "Buy Materials"}</h4>
                  <p className="text-sm text-onyx-500">{isArabic ? "من أقرب المتاجر الموثقة" : "From nearest verified stores"}</p>
               </div>
               <ArrowUpRight className="h-5 w-5 text-gold-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>
          </div>
        </Surface>
      </div>
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
    <div className="animate-slideUp">
      <SectionTitle
        eyebrow={isArabic ? "لوحة المحترفين" : "Pro Dashboard"}
        title={isArabic ? "أهلاً بك يا بطل" : "Welcome Hero"}
        subtitle={isArabic ? "تتبع أرباحك، استقبل الطلبات، ونمّ أعمالك مع أُسطى." : "Track earnings, accept jobs, and grow your business with OSTA."}
        actionLabel={isArabic ? "استعراض الطلبات" : "Browse Jobs"}
        actionHref={`/${locale}/worker/requests`}
      />

      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard 
          label={isTrialActive ? (isArabic ? "التجربة المجانية" : "Free Trial") : (isArabic ? "رصيد العمل" : "Job Quota")} 
          value={isTrialActive ? (isArabic ? `${formatNumber(locale, trialDaysLeft)} يوم` : `${trialDaysLeft}d`) : String(data.summary.orderQuota)} 
          note={isArabic ? "متبقي في اشتراكك" : "remaining in subscription"} 
          icon={Sparkles} 
          tone="gold" 
        />
        <MetricCard label={isArabic ? "طلبات واردة" : "Incoming Jobs"} value={String(data.summary.incomingRequests)} note={isArabic ? "فرص عمل جديدة" : "new opportunities"} icon={Briefcase} />
        <MetricCard label={isArabic ? "عمل حالي" : "Active Jobs"} value={String(data.summary.activeJobs)} note={isArabic ? "قيد التنفيذ" : "in progress"} icon={Zap} />
        <MetricCard label={isArabic ? "أرباح الشهر" : "Monthly Earnings"} value={formatCurrency(locale, data.summary.monthlyEarnings)} note={isArabic ? "صافي الربح" : "net earnings"} icon={CircleDollarSign} />
      </div>

      <Surface title={isArabic ? "طابور العمل المباشر" : "Live Job Queue"}>
        {data.queue.length === 0 ? (
          <EmptyNotice message={isArabic ? "لا توجد طلبات جديدة في منطقتك حالياً." : "No new jobs in your area right now."} />
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Mapping live queue items here */}
          </div>
        )}
      </Surface>
    </div>
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
    <div className="animate-slideUp">
      <SectionTitle
        eyebrow={isArabic ? "لوحة الموردين" : "Vendor Dashboard"}
        title={isArabic ? "متجرك، أرباحك، نجاحك" : "Your Store, Your Success"}
        subtitle={isArabic ? "أدر مخزونك، استقبل طلبات الخامات، وتابع مبيعاتك من مكان واحد." : "Manage inventory, receive material requests, and track sales in one place."}
        actionLabel={isArabic ? "إدارة المخزون" : "Manage Inventory"}
        actionHref={`/${locale}/vendor/inventory`}
      />

      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard 
          label={isTrialActive ? (isArabic ? "الفترة التجريبية" : "Free Trial") : (isArabic ? "الطلبات" : "Orders")} 
          value={isTrialActive ? (isArabic ? `${formatNumber(locale, trialDaysLeft)} يوم` : `${trialDaysLeft}d`) : String(data.summary.activeOrders)} 
          note={isArabic ? "متبقي للتجربة" : "trial days left"} 
          icon={Store} 
          tone="gold" 
        />
        <MetricCard label={isArabic ? "مبيعات الشهر" : "Monthly Sales"} value={formatCurrency(locale, data.summary.monthlySales)} note={isArabic ? "إجمالي المبيعات" : "total sales"} icon={CircleDollarSign} />
        <MetricCard label={isArabic ? "طلبات التسعير" : "Quote Requests"} value={String(data.recentRequests.length)} note={isArabic ? "تنتظر ردك" : "awaiting response"} icon={Briefcase} />
        <MetricCard label={isArabic ? "المحفظة" : "Wallet"} value={formatCurrency(locale, data.summary.walletBalance)} note={isArabic ? "رصيد متاح" : "available balance"} icon={Wallet} />
      </div>

      <Surface title={isArabic ? "طلبات الخامات الواردة" : "Incoming Material Requests"}>
        {data.recentRequests.length === 0 ? (
          <EmptyNotice message={isArabic ? "لا توجد طلبات خامات جديدة حالياً." : "No new material requests right now."} />
        ) : (
          <div className="space-y-4">
            {/* Mapping live vendor requests here */}
          </div>
        )}
      </Surface>
    </div>
  );
}

export function AdminDashboardHome({ locale }: { locale: Locale }) {
  const isArabic = locale === "ar";
  const data = useLiveApiData("/admin/dashboard", {
    summary: { totalRevenue: 0, pendingVerifications: 0, openComplaints: 0, activeRequests: 0 },
    verificationQueue: []
  });

  return (
    <div className="animate-slideUp">
      <SectionTitle
        eyebrow={isArabic ? "لوحة التحكم الرئيسية" : "Command Center"}
        title={isArabic ? "إدارة المنصة" : "Platform Management"}
        subtitle={isArabic ? "راقب العمليات، وثق الحسابات، وحل المشكلات لضمان جودة أُسطى." : "Monitor operations, verify accounts, and resolve issues to ensure OSTA quality."}
        actionLabel={isArabic ? "المستخدمين الجدد" : "Pending Users"}
        actionHref={`/${locale}/admin/workers`}
      />

      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label={isArabic ? "إيراد المنصة" : "Total Revenue"} value={formatCurrency(locale, data.summary.totalRevenue)} note={isArabic ? "تراكمي" : "total cumulative"} icon={TrendingUp} tone="gold" />
        <MetricCard label={isArabic ? "توثيق معلق" : "Pending Verify"} value={String(data.summary.pendingVerifications)} note={isArabic ? "بانتظار الموافقة" : "awaiting approval"} icon={ShieldCheck} />
        <MetricCard label={isArabic ? "شكاوى" : "Complaints"} value={String(data.summary.openComplaints)} note={isArabic ? "تحتاج تدخل" : "requires intervention"} icon={ShieldAlert} />
        <MetricCard label={isArabic ? "عمليات نشطة" : "Live Ops"} value={String(data.summary.activeRequests)} note={isArabic ? "طلبات جارية" : "ongoing jobs"} icon={Users} />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Surface title={isArabic ? "طلبات التوثيق الأخيرة" : "Recent Verifications"}>
          {data.verificationQueue.length === 0 ? (
            <EmptyNotice message={isArabic ? "لا توجد طلبات توثيق معلقة." : "No pending verifications."} />
          ) : (
            <div className="space-y-4">
              {/* Mapping verification queue here */}
            </div>
          )}
        </Surface>

        <Surface title={isArabic ? "تحكم النظام" : "System Control"}>
          <div className="grid gap-4">
            <Link href={`/${locale}/admin/pricing`} className="onyx-card p-6 flex items-center justify-between group">
               <div>
                  <h4 className="font-bold text-white mb-1">{isArabic ? "إعدادات التسعير" : "Pricing Settings"}</h4>
                  <p className="text-sm text-onyx-500">{isArabic ? "تعديل العمولات والرسوم" : "Edit commissions & fees"}</p>
               </div>
               <ArrowUpRight className="h-5 w-5 text-gold-500" />
            </Link>
            <Link href={`/${locale}/admin/ads`} className="onyx-card p-6 flex items-center justify-between group">
               <div>
                  <h4 className="font-bold text-white mb-1">{isArabic ? "إدارة الإعلانات" : "Ads Management"}</h4>
                  <p className="text-sm text-onyx-500">{isArabic ? "الحملات الممولة والبانرات" : "Sponsored ads & banners"}</p>
               </div>
               <ArrowUpRight className="h-5 w-5 text-gold-500" />
            </Link>
          </div>
        </Surface>
      </div>
    </div>
  );
}

export function AdminAdsPage({ locale }: { locale: Locale }) {
  const isArabic = locale === "ar";
  return (
    <div className="animate-slideUp">
      <SectionTitle
        eyebrow={isArabic ? "الإعلانات والترويج" : "Ads & Promotions"}
        title={isArabic ? "إدارة الحملات" : "Campaign Management"}
        subtitle={isArabic ? "تحكم في البانرات الإعلانية والحملات الممولة للموردين والصنايعية." : "Control ad banners and sponsored campaigns for vendors and pros."}
        actionLabel={isArabic ? "إنشاء حملة" : "Create Campaign"}
      />
      <EmptyNotice message={isArabic ? "لا توجد حملات إعلانية نشطة حالياً." : "No active ad campaigns at the moment."} />
    </div>
  );
}

export function AdminPricingPage({ locale }: { locale: Locale }) {
  const isArabic = locale === "ar";
  return (
    <div className="animate-slideUp">
      <SectionTitle
        eyebrow={isArabic ? "التسعير والعمولات" : "Pricing & Commissions"}
        title={isArabic ? "إعدادات الرسوم" : "Fee Settings"}
        subtitle={isArabic ? "ضبط نسب العمولات، رسوم الخدمات، وميزانيات التشغيل." : "Adjust commission rates, service fees, and operational budgets."}
        actionLabel={isArabic ? "حفظ التغييرات" : "Save Changes"}
      />
      <Surface title={isArabic ? "نسب العمولات الافتراضية" : "Default Commission Rates"}>
         <div className="grid md:grid-cols-2 gap-6">
            <div className="onyx-card p-6 border-gold-500/10">
               <p className="text-onyx-400 text-sm mb-2">{isArabic ? "عمولة الصنايعية" : "Worker Commission"}</p>
               <h4 className="text-2xl font-black text-white">15%</h4>
            </div>
            <div className="onyx-card p-6 border-gold-500/10">
               <p className="text-onyx-400 text-sm mb-2">{isArabic ? "عمولة المتاجر" : "Vendor Commission"}</p>
               <h4 className="text-2xl font-black text-white">10%</h4>
            </div>
         </div>
      </Surface>
    </div>
  );
}
