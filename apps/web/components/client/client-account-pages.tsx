"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

import {
  BriefcaseBusiness,
  Camera,
  Check,
  Cloud,
  CreditCard,
  Heart,
  LogOut,
  Mail,
  MapPin,
  MessageSquare,
  PhoneCall,
  Save,
  Shield,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Store,
  User,
  Wallet
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  ClientStitchBadge,
  ClientStitchEmpty,
  ClientStitchHero,
  ClientStitchMetric,
  ClientStitchPanel
} from "@/components/client/client-stitch-ui";
import { useLiveApiData } from "@/hooks/use-live-api-data";
import { patchApiData, postApiData } from "@/lib/api";
import type { Locale } from "@/lib/locales";
import type { ClientFavoritesData, ClientSettingsData, ClientWalletData } from "@/lib/operations-data";
import { cn } from "@/lib/utils";
import { EmailVerificationField } from "@/components/worker/worker-extra-pages";

function formatNumber(locale: Locale, value: number) {
  return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US", { maximumFractionDigits: 0 }).format(value);
}

function formatCurrency(locale: Locale, value: number) {
  const formatted = formatNumber(locale, Math.abs(value));
  const prefix = value < 0 ? "-" : "";
  return locale === "ar" ? `${prefix}${formatted} ج.م` : `${prefix}EGP ${formatted}`;
}

function formatDate(locale: Locale, value: string) {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function ClientFavoritesPage({ locale, initialData }: { locale: Locale; initialData: ClientFavoritesData }) {
  const isArabic = locale === "ar";
  const data = useLiveApiData("/clients/favorites", initialData);

  return (
    <div className="space-y-6 lg:space-y-8">
      <ClientStitchHero
        locale={locale}
        eyebrow={isArabic ? "محترفون موثوقون" : "Trusted professionals"}
        title={isArabic ? "المفضلون" : "FAVORITES"}
        subtitle={
          isArabic
            ? "قائمة الفنيين الذين تثق بهم مع التوفر الحالي والتقييم وسرعة إعادة الحجز."
            : "Your trusted pros with availability, rating, and quick rebooking context."
        }
        icon={Heart}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <ClientStitchMetric label={isArabic ? "إجمالي المفضلين" : "Total favorites"} value={formatNumber(locale, data.summary.totalFavorites)} note={isArabic ? "قائمة محفوظة" : "saved roster"} icon={Heart} />
        <ClientStitchMetric label={isArabic ? "متاح" : "Online now"} value={formatNumber(locale, data.summary.onlineNow)} note={isArabic ? "جاهز للحجز" : "ready to book"} icon={Sparkles} />
        <ClientStitchMetric label={isArabic ? "متوسط التقييم" : "Avg rating"} value={formatNumber(locale, data.summary.avgRating)} note={isArabic ? "مؤشر الثقة" : "trust score"} icon={ShieldCheck} dark />
      </div>

      <ClientStitchPanel title={isArabic ? "قائمة الفنيين" : "Saved professionals"} eyebrow={isArabic ? "قائمة محفوظة" : "saved deck"}>
        {data.workers.length === 0 ? (
          <ClientStitchEmpty>{isArabic ? "لا يوجد فنيون محفوظون بعد" : "No favorite workers yet"}</ClientStitchEmpty>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {data.workers.map((worker, index) => (
              <article key={worker.id} className={index % 2 === 0 ? "border border-white/10 bg-[#121212] p-5" : "border border-white/10 bg-black p-5"}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-black uppercase text-white">{worker.name}</h2>
                    <p className="mt-2 text-sm font-bold text-gold">{worker.specialty}</p>
                  </div>
                  <ClientStitchBadge tone={worker.availability === "Online now" ? "gold" : "muted"}>
                    {isArabic ? (worker.availability === "Online now" ? "متاح" : worker.availability === "Available tomorrow" ? "متاح غدًا" : "اليوم 7 مساءً") : worker.availability}
                  </ClientStitchBadge>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {[
                    { label: isArabic ? "التقييم" : "Rating", value: formatNumber(locale, worker.rating) },
                    { label: isArabic ? "الطلبات" : "Jobs", value: worker.completedJobs > 0 ? formatNumber(locale, worker.completedJobs) : (isArabic ? "جديد" : "New") },
                    { label: isArabic ? "المنطقة" : "Area", value: worker.area }
                  ].map((item) => (
                    <div key={item.label} className="border border-white/5 bg-black p-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">{item.label}</p>
                      <p className="mt-2 truncate text-sm font-bold text-white">{item.value}</p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </ClientStitchPanel>
    </div>
  );
}

export function ClientWalletPage({ locale, initialData }: { locale: Locale; initialData: ClientWalletData }) {
  const isArabic = locale === "ar";
  const data = useLiveApiData("/clients/wallet", initialData);

  return (
    <div className="space-y-6 lg:space-y-8">
      <section className="relative overflow-hidden border border-white/10 bg-black p-6 text-white shadow-[6px_6px_0_#1a1c1c] sm:p-8 lg:p-10">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-white/45">{isArabic ? "الرصيد المتاح" : "Available balance"}</p>
        <h1 className="mt-4 text-5xl font-black leading-none text-gold sm:text-6xl lg:text-7xl">
          {formatCurrency(locale, data.balance)}
        </h1>
        <div className="mt-8 flex flex-wrap gap-3">
          <button className="bg-white px-5 py-3 text-xs font-black uppercase text-black shadow-[4px_4px_0_#f5bd18]">
            {isArabic ? "شحن الرصيد" : "Top up"}
          </button>
          <button className="border-2 border-white px-5 py-3 text-xs font-black uppercase text-white">
            {isArabic ? "وسائل الدفع" : "Payment methods"}
          </button>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ClientStitchMetric label={isArabic ? "الرصيد" : "Balance"} value={formatCurrency(locale, data.balance)} note={isArabic ? "جاهز للاستخدام" : "ready to use"} icon={Wallet} dark />
        <ClientStitchMetric label={isArabic ? "مصروفات الشهر" : "Spend this month"} value={formatCurrency(locale, data.spendThisMonth)} note={isArabic ? "استخدام شهري" : "monthly usage"} icon={CreditCard} />
        <ClientStitchMetric label={isArabic ? "استردادات معلقة" : "Pending refunds"} value={formatCurrency(locale, data.pendingRefunds)} note={isArabic ? "مسار الاسترداد" : "refund rail"} icon={ShieldCheck} />
        <ClientStitchMetric label={isArabic ? "وسائل الدفع" : "Payment methods"} value={formatNumber(locale, data.paymentMethods.length)} note={isArabic ? "مصادر محفوظة" : "saved rails"} icon={Sparkles} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <ClientStitchPanel title={isArabic ? "وسائل الدفع" : "Payment methods"} eyebrow={isArabic ? "مصادر محفوظة" : "saved sources"}>
          <div className="grid gap-4">
            {data.paymentMethods.map((method) => (
              <div key={method.id} className="border border-white/10 bg-[#121212] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-black text-white">{method.label}</p>
                    <p className="mt-1 text-xs font-bold uppercase tracking-widest text-white/35">{isArabic ? "مصدر الدفع" : "payment source"}</p>
                  </div>
                  {method.isDefault ? <ClientStitchBadge>{isArabic ? "افتراضي" : "Default"}</ClientStitchBadge> : null}
                </div>
              </div>
            ))}
          </div>
        </ClientStitchPanel>

        <ClientStitchPanel title={isArabic ? "آخر المعاملات" : "Recent transactions"} eyebrow={isArabic ? "حركة المال" : "money stream"}>
          <div className="grid gap-4">
            {data.recentTransactions.map((item, index) => (
              <div key={item.id} className={index % 2 === 0 ? "border border-white/10 bg-[#121212] p-4" : "border border-white/10 bg-black p-4"}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-black text-white">{item.label}</p>
                    <p className="mt-1 text-xs font-bold uppercase tracking-widest text-white/35">{formatDate(locale, item.createdAt)}</p>
                  </div>
                  <div className="text-end">
                    <p className={item.amount < 0 ? "text-lg font-black text-red-300" : "text-lg font-black text-gold"}>{formatCurrency(locale, item.amount)}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/35">{item.type}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ClientStitchPanel>
      </div>
    </div>
  );
}

function SettingsMetric({ label, value, icon: Icon, iconText, muted }: { label: string; value: string; icon?: LucideIcon; iconText?: string; muted?: boolean }) {
  return (
    <article className="group flex items-center justify-between gap-4 border border-white/10 bg-black p-6 text-white transition-colors hover:border-gold">
      <div className="min-w-0">
        <p className="truncate text-[10px] font-black uppercase tracking-[0.18em] text-white/40">{label}</p>
        <h2 className="mt-2 truncate text-xl font-black uppercase text-white">{value}</h2>
      </div>
      <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center border border-white/20 text-white transition-colors group-hover:bg-white group-hover:text-black", iconText ? "border-gold bg-gold text-black" : muted ? "text-white/40" : "")}>
        {Icon ? <Icon className="h-5 w-5" /> : <span className="text-sm font-black">{iconText}</span>}
      </div>
    </article>
  );
}

function SettingsPanel({ title, icon: Icon, children }: { title: string; icon: LucideIcon; children: ReactNode }) {
  return (
    <section className="border border-white/10 bg-black p-6 text-white">
      <div className="mb-6 flex items-center gap-3 border-b border-white/10 pb-4">
        <Icon className="h-5 w-5 text-gold" />
        <h2 className="text-xl font-black uppercase tracking-wide text-white">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function SettingsInput({ label, value, onChange, type = "text", readOnly }: { label: string; value: string; onChange?: (value: string) => void; type?: string; readOnly?: boolean }) {
  return (
    <label className="block space-y-2">
      <span className="block text-[10px] font-black uppercase tracking-[0.18em] text-white/40">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        readOnly={readOnly}
        type={type}
        className="w-full border border-white/10 bg-[#121212] px-4 py-3 text-sm font-bold text-white outline-none transition-colors focus:border-gold read-only:text-white/80"
      />
    </label>
  );
}

function SettingsToggle({ label, note, checked, onChange }: { label: string; note: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="flex w-full items-center justify-between gap-4 border border-white/5 bg-[#121212] p-4 text-start transition-colors hover:border-gold/50">
      <span className="min-w-0">
        <span className="block text-sm font-black uppercase text-white">{label}</span>
        <span className="mt-1 block text-xs leading-5 text-white/40">{note}</span>
      </span>
      <span className={cn("relative h-6 w-12 shrink-0 transition-colors", checked ? "bg-gold" : "bg-white/20")}>
        <span className={cn("absolute top-1 h-4 w-4 bg-black transition-transform", checked ? "translate-x-7 rtl:-translate-x-7" : "translate-x-1 rtl:-translate-x-1")} />
      </span>
    </button>
  );
}

function SettingsCheck({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="flex w-full items-center gap-4 py-3 text-start">
      <span className={cn("relative flex h-6 w-6 shrink-0 items-center justify-center border-2", checked ? "border-gold bg-gold" : "border-white/20")}>
        {checked ? <Check className="h-4 w-4 text-black" /> : null}
      </span>
      <span className="text-sm font-black uppercase text-white">{label}</span>
    </button>
  );
}

function SettingsFooterCard({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return (
    <article className="space-y-4">
      <div className="flex h-10 w-10 items-center justify-center border border-white/10 bg-black">
        <Icon className="h-5 w-5 text-gold" />
      </div>
      <h3 className="text-sm font-black uppercase text-black">{title}</h3>
      <p className="text-xs leading-5 text-black/60">{text}</p>
    </article>
  );
}

function SettingsRoleSwitcher({
  locale,
  fullName,
  avatarUrl,
  labels
}: {
  locale: Locale;
  fullName: string;
  avatarUrl?: string | null;
  labels: {
    modeTitle: string;
    modeNote: string;
    clientMode: string;
    clientNote: string;
    workerMode: string;
    workerNote: string;
    vendorMode: string;
    vendorNote: string;
    current: string;
    switchTo: string;
    switching: string;
    switchError: string;
  };
}) {
  const [pendingRole, setPendingRole] = useState<"WORKER" | "VENDOR" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentAvatar, setCurrentAvatar] = useState(avatarUrl);
  const [isUploading, setIsUploading] = useState(false);
  const isArabic = locale === "ar";

  useEffect(() => {
    setCurrentAvatar(avatarUrl);
  }, [avatarUrl]);

  async function handleAvatarUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });
      if (!res.ok) throw new Error("Upload failed");
      const resData = await res.json();
      setCurrentAvatar(resData.url);
      await postApiData("/client/settings", {
        profile: { avatarUrl: resData.url }
      });
    } catch (err) {
      console.error("Avatar upload failed", err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "O";
  const roles = [
    {
      key: "client",
      title: labels.clientMode,
      note: labels.clientNote,
      href: `/${locale}/client`,
      icon: User,
      active: true,
      targetRole: "CLIENT" as const
    },
    {
      key: "worker",
      title: labels.workerMode,
      note: labels.workerNote,
      href: `/${locale}/worker`,
      icon: BriefcaseBusiness,
      active: false,
      targetRole: "WORKER" as const
    },
    {
      key: "vendor",
      title: labels.vendorMode,
      note: labels.vendorNote,
      href: `/${locale}/vendor`,
      icon: Store,
      active: false,
      targetRole: "VENDOR" as const
    }
  ];

  async function switchRole(targetRole: "WORKER" | "VENDOR", href: string) {
    setError(null);
    setPendingRole(targetRole);

    try {
      await postApiData<{ role: string }, { targetRole: "WORKER" | "VENDOR" }>("/auth/switch-role", { targetRole });
      window.location.assign(href);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : labels.switchError);
      setPendingRole(null);
    }
  }

  return (
    <section className="border border-white/10 bg-black p-6 text-white">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex min-w-0 items-center gap-4">
          <div className="relative group shrink-0">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative h-16 w-16 cursor-pointer overflow-hidden border border-gold bg-[#121212] transition hover:border-gold/80"
            >
              {currentAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={currentAvatar} alt={fullName} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gold text-xl font-black text-black">{initials}</div>
              )}
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                <Camera className="h-4 w-4 text-gold" />
                <span className="text-[8px] font-black uppercase text-white">{isUploading ? "..." : isArabic ? "تغيير" : "Change"}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-gold text-black shadow-lg transition hover:scale-110 active:scale-95"
              title={isArabic ? "تغيير الصورة الشخصية" : "Change profile photo"}
            >
              <Camera className="h-3 w-3" />
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={(e) => void handleAvatarUpload(e)}
              className="hidden"
            />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-gold">{labels.modeTitle}</p>
            <h2 className="mt-1 truncate text-lg font-black uppercase text-white">{fullName}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">{labels.modeNote}</p>
          </div>
        </div>
        <span className="border border-gold bg-gold px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-black">{labels.current}</span>
      </div>
      {error ? <div className="mb-4 border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200">{error}</div> : null}
      <div className="grid gap-3 md:grid-cols-3">
        {roles.map((role) => {
          const Icon = role.icon;
          const isPending = pendingRole === role.targetRole;
          const content = (
            <>
              <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center border", role.active ? "border-gold bg-gold text-black" : "border-white/15 bg-[#121212] text-gold")}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-black uppercase text-white">{role.title}</h3>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/45">{role.note}</p>
              </div>
              <span className={cn("shrink-0 px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em]", role.active ? "bg-white text-black" : "border border-white/15 text-gold")}>
                {role.active ? labels.current : isPending ? labels.switching : labels.switchTo}
              </span>
            </>
          );

          return role.active ? (
            <div key={role.key} className="flex items-center gap-4 border border-gold bg-[#121212] p-4">
              {content}
            </div>
          ) : (
            <button
              key={role.key}
              type="button"
              disabled={pendingRole !== null}
              onClick={() => {
                if (role.targetRole !== "CLIENT") {
                  void switchRole(role.targetRole, role.href);
                }
              }}
              className="flex items-center gap-4 border border-white/10 bg-[#121212] p-4 text-start transition-colors hover:border-gold disabled:cursor-wait disabled:opacity-70"
            >
              {content}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export function ClientSettingsPage({ locale, initialData }: { locale: Locale; initialData: ClientSettingsData }) {
  const isArabic = locale === "ar";
  const liveData = useLiveApiData("/clients/settings", initialData);
  const [data, setData] = useState(initialData);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setData(liveData);
  }, [liveData]);

  async function handleSave() {
    try {
      await patchApiData("/auth/profile", {
        firstName: data.profile.firstName,
        lastName: data.profile.lastName,
        email: data.profile.email,
        phone: data.profile.phone,
        avatarUrl: data.profile.avatarUrl
      });
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Failed to save client profile", err);
    }
  }

  const fullName = `${data.profile.firstName} ${data.profile.lastName}`.trim() || "OSTA Client";
  const languageCode = data.preferences.language?.toUpperCase() || locale.toUpperCase();
  const smsEnabled = data.preferences.notificationsBySms;
  const labels = {
    heroEyebrow: isArabic ? "لوحة تحكم العميل" : "CLIENT CONTROLS",
    heroTitle: isArabic ? "إعدادات الحساب" : "CLIENT CONTROLS",
    heroText: isArabic
      ? "إدارة بيانات الهوية، قنوات التواصل، وتفضيلات الحساب داخل تجربة OSTA الصناعية."
      : "Manage your global account preferences, service communication channels, and identity data to optimize your OSTA industrial experience.",
    language: isArabic ? "اللغة" : "Language",
    languageValue: isArabic ? (languageCode === "AR" ? "العربية (AR)" : "الإنجليزية (EN)") : languageCode === "AR" ? "ARABIC (AR)" : "ENGLISH (EN)",
    addresses: isArabic ? "العناوين المحفوظة" : "Saved Addresses",
    sites: isArabic ? `${formatNumber(locale, data.addresses.length)} مواقع` : `${formatNumber(locale, data.addresses.length)} SITES`,
    smsState: isArabic ? "حالة SMS" : "SMS State",
    smsValue: smsEnabled ? (isArabic ? "متصل" : "ONLINE") : isArabic ? "غير متاح" : "OFFLINE",
    identity: isArabic ? "بيانات الهوية" : "Identity Data",
    fullName: isArabic ? "الاسم الكامل" : "Full Name",
    firstName: isArabic ? "الاسم الأول" : "First Name",
    lastName: isArabic ? "اسم العائلة" : "Last Name",
    email: isArabic ? "البريد الإلكتروني" : "Email Address",
    phone: isArabic ? "رقم الهاتف الأساسي" : "Primary Phone",
    signal: isArabic ? "ضوابط الإشارة" : "Signal Controls",
    push: isArabic ? "إشعارات الرسائل" : "Push Notifications",
    pushNote: isArabic ? "تنبيهات فورية عند وصول الفني وتحديث حالة الطلب" : "Real-time status updates on technician arrival",
    emailReports: isArabic ? "تقارير البريد" : "Email Reports",
    emailNote: isArabic ? "ملخصات أسبوعية وتحديثات مهمة على البريد" : "Weekly financial summaries and site analytics",
    security: isArabic ? "التحقق الثنائي" : "Two-Factor Auth",
    securityNote: isArabic ? "حماية إضافية للمدفوعات والعمليات الحساسة" : "Enhanced security for financial transactions",
    marketing: isArabic ? "تحديثات التسويق" : "Marketing Updates",
    marketingNote: isArabic ? "عروض وتحديثات مرتبطة بالخدمات" : "Service offers and product updates",
    save: isArabic ? "حفظ كل التغييرات" : "SAVE ALL CHANGES",
    saved: isArabic ? "تم حفظ التغييرات محليًا" : "Changes saved locally",
    protocol: isArabic ? "بروتوكول الأمان" : "Security Protocol",
    protocolText: isArabic ? "كل البيانات محمية بمعايير تشفير صناعية." : "All data is encrypted via industrial standards.",
    sync: isArabic ? "مزامنة السحابة" : "Cloud Sync",
    syncText: isArabic ? "التفضيلات متزامنة مع أجهزة وخدمات OSTA." : "Preferences synced across OSTA devices and services.",
    supportEyebrow: isArabic ? "خدمة OSTA المميزة" : "OSTA Premium Service",
    supportTitle: isArabic ? "تحتاج مساعدة فورية؟" : "NEED IMMEDIATE ASSISTANCE?",
    supportAction: isArabic ? "اتصل بالدعم" : "CALL DISPATCH",
    logout: isArabic ? "تسجيل الخروج" : "LOGOUT",
    system: isArabic ? "تفضيلات النظام" : "System Preferences",
    alerts: isArabic ? "تنبيهات الإشارة" : "Signal Alerts",
    update: isArabic ? "تحديث البيانات" : "UPDATE DATA",
    modeTitle: isArabic ? "وضع التشغيل" : "Operating Mode",
    modeNote: isArabic ? "انتقل بين لوحة العميل، لوحة الفني، ولوحة المورد بنفس الحساب حسب الصلاحيات المتاحة." : "Move between the client, technician, and vendor dashboards with the same account when access is available.",
    clientMode: isArabic ? "وضع العميل" : "Client Mode",
    clientNote: isArabic ? "طلبات الخدمات، المتاجر، المفضلة، والمحفظة." : "Service requests, stores, favorites, and wallet.",
    workerMode: isArabic ? "وضع الفني" : "Technician Mode",
    workerNote: isArabic ? "استقبال الطلبات، الأعمال النشطة، الأرباح، والتقييمات." : "Incoming jobs, active work, earnings, and ratings.",
    vendorMode: isArabic ? "وضع المورد" : "Vendor Mode",
    vendorNote: isArabic ? "إدارة الخامات، المخزون، الطلبات، والإعلانات." : "Materials, inventory, orders, and ads management.",
    current: isArabic ? "الحالي" : "CURRENT",
    switchTo: isArabic ? "تبديل" : "SWITCH",
    switching: isArabic ? "جاري" : "WAIT",
    switchError: isArabic ? "تعذر تبديل وضع التشغيل" : "Could not switch operating mode"
  };

  return (
    <div className="relative -m-4 min-h-screen bg-gold p-4 text-[#1a1c1c] sm:-m-6 sm:p-6 lg:-m-8 lg:p-8" dir={isArabic ? "rtl" : "ltr"}>
      <div className="mx-auto max-w-[1280px] space-y-6 lg:space-y-12">
        <section className="border border-white/10 bg-black p-6 text-white shadow-[4px_4px_0_#000] sm:p-8">
          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.24em] text-gold">{labels.heroEyebrow}</p>
          <h1 className="text-3xl font-black uppercase leading-tight text-white sm:text-4xl">{labels.heroTitle}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-white/60 sm:text-base">{labels.heroText}</p>
        </section>

        <div className="grid gap-4 md:grid-cols-3">
          <SettingsMetric label={labels.language} value={labels.languageValue} iconText={languageCode} />
          <SettingsMetric label={labels.addresses} value={labels.sites} icon={MapPin} />
          <SettingsMetric label={labels.smsState} value={labels.smsValue} icon={smsEnabled ? MessageSquare : Mail} muted={!smsEnabled} />
        </div>

        <SettingsRoleSwitcher locale={locale} fullName={fullName} avatarUrl={data.profile.avatarUrl} labels={labels} />

        {saved ? <div className="border border-black bg-white px-4 py-3 text-sm font-black text-black shadow-[4px_4px_0_#000]">{labels.saved}</div> : null}

        <div className="grid gap-6 lg:grid-cols-2">
          <SettingsPanel title={labels.identity} icon={User}>
            <div className="hidden space-y-6 md:block">
              <SettingsInput label={labels.fullName} value={fullName} readOnly />
              <EmailVerificationField
                locale={locale}
                email={data.profile.email ?? ""}
                emailVerified={Boolean(data.profile.emailVerified)}
                onChangeEmail={(val) => setData((prev) => ({
                  ...prev,
                  profile: {
                    ...prev.profile,
                    email: val,
                    emailVerified: prev.profile.emailVerified && val.trim().toLowerCase() === (prev.profile.email ?? "").trim().toLowerCase()
                  }
                }))}
                onVerified={() => setData((prev) => ({ ...prev, profile: { ...prev.profile, emailVerified: true } }))}
              />
              <label className="space-y-2 block">
                <span className="block text-[10px] font-black uppercase tracking-[0.18em] text-white/40">{labels.phone}</span>
                <div className="flex gap-2">
                  <span className="border border-white/10 bg-[#121212] px-4 py-3 text-sm font-bold text-white">+20</span>
                  <input
                    value={data.profile.phone.replace(/^\+?20\s?/, "")}
                    onChange={(event) => setData({ ...data, profile: { ...data.profile, phone: event.target.value } })}
                    dir="ltr"
                    className="min-w-0 flex-1 border border-white/10 bg-[#121212] px-4 py-3 text-sm font-bold text-white outline-none transition-colors focus:border-gold text-start font-mono"
                    type="tel"
                  />
                </div>
              </label>
            </div>

            <div className="grid gap-4 md:hidden">
              <div className="grid grid-cols-2 gap-4">
                <SettingsInput label={labels.firstName} value={data.profile.firstName} onChange={(value) => setData({ ...data, profile: { ...data.profile, firstName: value } })} />
                <SettingsInput label={labels.lastName} value={data.profile.lastName} onChange={(value) => setData({ ...data, profile: { ...data.profile, lastName: value } })} />
              </div>
              <EmailVerificationField
                locale={locale}
                email={data.profile.email ?? ""}
                emailVerified={Boolean(data.profile.emailVerified)}
                onChangeEmail={(val) => setData((prev) => ({
                  ...prev,
                  profile: {
                    ...prev.profile,
                    email: val,
                    emailVerified: prev.profile.emailVerified && val.trim().toLowerCase() === (prev.profile.email ?? "").trim().toLowerCase()
                  }
                }))}
                onVerified={() => setData((prev) => ({ ...prev, profile: { ...prev.profile, emailVerified: true } }))}
              />
              <SettingsInput label={labels.phone} value={data.profile.phone} onChange={(value) => setData({ ...data, profile: { ...data.profile, phone: value } })} type="tel" />
              <button type="button" onClick={handleSave} className="mt-2 bg-white px-5 py-4 text-xs font-black uppercase tracking-[0.16em] text-black active:translate-x-1 active:translate-y-1">
                {labels.update}
              </button>
            </div>
          </SettingsPanel>

          <SettingsPanel title={labels.signal} icon={SlidersHorizontal}>
            <div className="space-y-2">
              <SettingsToggle
                label={labels.push}
                note={labels.pushNote}
                checked={data.preferences.notificationsBySms}
                onChange={(checked) => setData({ ...data, preferences: { ...data.preferences, notificationsBySms: checked } })}
              />
              <SettingsToggle
                label={labels.emailReports}
                note={labels.emailNote}
                checked={data.preferences.notificationsByEmail}
                onChange={(checked) => setData({ ...data, preferences: { ...data.preferences, notificationsByEmail: checked } })}
              />
              <SettingsToggle label={labels.security} note={labels.securityNote} checked={false} onChange={() => undefined} />
              <SettingsToggle
                label={labels.marketing}
                note={labels.marketingNote}
                checked={data.preferences.marketingUpdates}
                onChange={(checked) => setData({ ...data, preferences: { ...data.preferences, marketingUpdates: checked } })}
              />
            </div>
          </SettingsPanel>
        </div>

        <div className="grid gap-6 md:hidden">
          <section className="space-y-4">
            <h2 className="px-1 text-2xl font-black text-black">{labels.system}</h2>
            <div className="divide-y divide-white/10 border border-white/10 bg-black p-6 text-white">
              <div className="flex items-center justify-between gap-4 py-4">
                <div>
                  <p className="text-xs font-black uppercase">{labels.language}</p>
                  <p className="mt-1 text-xs text-white/60">{labels.languageValue}</p>
                </div>
                <div className="flex border border-white/10 bg-[#121212] p-1">
                  {["AR", "EN"].map((code) => (
                    <button key={code} type="button" className={cn("px-4 py-1 text-xs font-black", languageCode === code ? "bg-gold text-black" : "text-white")}>
                      {code}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between gap-4 py-4">
                <div>
                  <p className="text-xs font-black uppercase">{labels.addresses}</p>
                  <p className="mt-1 text-xs text-white/60">{labels.sites}</p>
                </div>
                <span className="bg-gold px-3 py-1 text-sm font-black text-black">{formatNumber(locale, data.addresses.length)}</span>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="px-1 text-2xl font-black text-black">{labels.alerts}</h2>
            <div className="border border-white/10 bg-black p-6 text-white">
              <SettingsCheck label={labels.push} checked={data.preferences.notificationsBySms} onChange={(checked) => setData({ ...data, preferences: { ...data.preferences, notificationsBySms: checked } })} />
              <SettingsCheck label={labels.emailReports} checked={data.preferences.notificationsByEmail} onChange={(checked) => setData({ ...data, preferences: { ...data.preferences, notificationsByEmail: checked } })} />
              <SettingsCheck label={labels.marketing} checked={data.preferences.marketingUpdates} onChange={(checked) => setData({ ...data, preferences: { ...data.preferences, marketingUpdates: checked } })} />
            </div>
          </section>
        </div>

        <div className="flex justify-end">
          <button type="button" onClick={handleSave} className="inline-flex items-center gap-3 bg-white px-7 py-4 text-xs font-black uppercase tracking-[0.12em] text-black shadow-[4px_4px_0_#000] transition-transform active:translate-x-1 active:translate-y-1 active:shadow-none sm:px-12">
            <span>{labels.save}</span>
            <Save className="h-4 w-4" />
          </button>
        </div>

        <footer className="grid gap-6 border-t border-black/10 pt-8 md:grid-cols-4 md:pt-16">
          <SettingsFooterCard icon={Shield} title={labels.protocol} text={labels.protocolText} />
          <SettingsFooterCard icon={Cloud} title={labels.sync} text={labels.syncText} />
          <div className="border border-white/10 bg-black p-6 text-white md:col-span-2">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">{labels.supportEyebrow}</p>
            <h2 className="mt-2 text-xl font-black uppercase text-white">{labels.supportTitle}</h2>
            <button type="button" className="mt-5 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-gold">
              {labels.supportAction}
              <PhoneCall className="h-4 w-4" />
            </button>
          </div>
        </footer>

        <button type="button" className="flex w-full items-center justify-center gap-2 border border-red-500/50 bg-black py-4 text-xs font-black uppercase tracking-[0.16em] text-red-400 md:hidden">
          <LogOut className="h-4 w-4" />
          {labels.logout}
        </button>
      </div>
    </div>
  );
}
