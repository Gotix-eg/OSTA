"use client";

import { useEffect, useRef, useState } from "react";

import { AlertCircle, BriefcaseBusiness, Camera, Check, CheckCircle2, Loader2, Lock, Save, ShieldCheck, Sparkles, Star, Store, TimerReset, User, UserCircle2 } from "lucide-react";

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
import { postApiData } from "@/lib/api";
import type { Locale } from "@/lib/locales";
import type { WorkerRatingsData, WorkerSettingsData } from "@/lib/operations-data";
import { cn, formatPhoneNumber } from "@/lib/utils";

function formatNumber(locale: Locale, value: number) {
  return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US", { maximumFractionDigits: 0 }).format(value);
}

function formatDate(locale: Locale, value: string) {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
    dateStyle: "medium"
  }).format(new Date(value));
}

function WorkerModeSwitcher({
  locale,
  fullName,
  avatarUrl,
  email,
  phone
}: {
  locale: Locale;
  fullName: string;
  avatarUrl?: string | null;
  email: string;
  phone: string;
}) {
  const isArabic = locale === "ar";
  const [pendingRole, setPendingRole] = useState<"CLIENT" | "VENDOR" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentAvatar, setCurrentAvatar] = useState(avatarUrl);
  const [isUploading, setIsUploading] = useState(false);

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
      await postApiData("/workers/settings", {
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

  const modes = [
    {
      key: "worker",
      title: isArabic ? "وضع الفني" : "Technician mode",
      note: isArabic ? "الطلبات الواردة، التنفيذ، الأرباح، والتقييمات." : "Incoming jobs, active work, earnings, and ratings.",
      icon: BriefcaseBusiness,
      active: true,
      targetRole: "WORKER" as const,
      href: `/${locale}/worker/settings`
    },
    {
      key: "client",
      title: isArabic ? "وضع العميل" : "Client mode",
      note: isArabic ? "طلبات الخدمات، المتاجر، المفضلة، والمحفظة." : "Service requests, stores, favorites, and wallet.",
      icon: User,
      active: false,
      targetRole: "CLIENT" as const,
      href: `/${locale}/client`
    },
    {
      key: "vendor",
      title: isArabic ? "وضع المورد" : "Vendor mode",
      note: isArabic ? "الخامات، المخزون، الطلبات، والإعلانات." : "Materials, inventory, orders, and ads management.",
      icon: Store,
      active: false,
      targetRole: "VENDOR" as const,
      href: `/${locale}/vendor`
    }
  ];

  async function switchRole(targetRole: "CLIENT" | "VENDOR", href: string) {
    setError(null);
    setPendingRole(targetRole);

    try {
      await postApiData<{ role: string }, { targetRole: "CLIENT" | "VENDOR" }>("/auth/switch-role", { targetRole });
      window.location.assign(href);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : isArabic ? "تعذر تبديل وضع التشغيل" : "Could not switch operating mode");
      setPendingRole(null);
    }
  }

  return (
    <WorkerProPanel title={isArabic ? "وضع التشغيل" : "Operating mode"} eyebrow="OSTA PRO">
      <div className="grid gap-6 xl:grid-cols-[minmax(360px,0.85fr)_minmax(0,1.25fr)]">
        <div className="border border-white/10 bg-[#111] p-6">
          <div className="flex items-center gap-5">
            <div className="relative group shrink-0">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative h-24 w-24 cursor-pointer overflow-hidden border border-gold bg-[#121212] transition hover:border-gold/80"
              >
                {currentAvatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={currentAvatar} alt={fullName} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gold text-2xl font-black text-black">{initials}</div>
                )}
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Camera className="h-5 w-5 text-gold" />
                  <span className="text-[9px] font-black uppercase text-white">{isUploading ? (isArabic ? "جاري..." : "Uploading...") : isArabic ? "تغيير" : "Change"}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-gold text-black shadow-lg transition hover:scale-110 active:scale-95"
                title={isArabic ? "تغيير الصورة الشخصية" : "Change profile photo"}
              >
                <Camera className="h-3.5 w-3.5" />
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
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gold">{isArabic ? "الملف الشخصي" : "Account identity"}</p>
              <h2 className="mt-2 truncate text-2xl font-black uppercase text-white">{fullName}</h2>
              <div className="mt-4 space-y-1 text-sm font-bold text-white/65">
                <p className="truncate">{email || (isArabic ? "لا يوجد بريد" : "No email")}</p>
                <p className="truncate text-start" dir="ltr">{formatPhoneNumber(phone) || (isArabic ? "لا يوجد هاتف" : "No phone")}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3">
          {error ? <div className="border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200">{error}</div> : null}
          <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
            {modes.map((mode) => {
              const Icon = mode.icon;
              const isPending = pendingRole === mode.targetRole;
              const content = (
                <>
                  <div className="flex w-full items-start gap-4">
                    <div className={mode.active ? "flex h-12 w-12 shrink-0 items-center justify-center border border-gold bg-gold text-black" : "flex h-12 w-12 shrink-0 items-center justify-center border border-white/15 bg-[#121212] text-gold"}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-black uppercase leading-tight text-white">{mode.title}</h3>
                      <p className="mt-2 text-xs leading-5 text-white/50">{mode.note}</p>
                    </div>
                  </div>
                  <span className={mode.active ? "mt-4 inline-flex shrink-0 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-black" : "mt-4 inline-flex shrink-0 border border-white/15 px-4 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-gold"}>
                    {mode.active ? (isArabic ? "الحالي" : "CURRENT") : isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : isArabic ? "تبديل" : "SWITCH"}
                  </span>
                </>
              );

              return mode.active ? (
                <div key={mode.key} className="flex min-h-44 flex-col justify-between border border-gold bg-[#121212] p-5">
                  {content}
                </div>
              ) : (
                <button
                  key={mode.key}
                  type="button"
                  disabled={pendingRole !== null}
                  onClick={() => {
                    if (mode.targetRole !== "WORKER") {
                      void switchRole(mode.targetRole, mode.href);
                    }
                  }}
                  className="flex min-h-44 flex-col justify-between border border-white/10 bg-[#121212] p-5 text-start transition-colors hover:border-gold disabled:cursor-wait disabled:opacity-70"
                >
                  {content}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </WorkerProPanel>
  );
}

export function WorkerRatingsPage({ locale, initialData }: { locale: Locale; initialData: WorkerRatingsData }) {
  const isArabic = locale === "ar";
  const data = useLiveApiData("/workers/ratings", initialData);

  return (
    <WorkerProShell locale={locale}>
      <WorkerProTopStrip locale={locale} title={isArabic ? "التقييمات" : "Ratings"} />
      <WorkerProHero
        locale={locale}
        eyebrow={isArabic ? "السمعة المهنية" : "Reputation rail"}
        title={isArabic ? "تقييمات" : "Ratings"}
        highlight={isArabic ? "الفني" : "signal"}
        subtitle={isArabic ? "تابع آراء العملاء والشارات ومؤشرات الثقة من طبقة جودة واضحة." : "Track client feedback, earned badges, and trust signals from a focused quality layer."}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <WorkerProMetric label={isArabic ? "التقييم العام" : "Overall"} value={formatNumber(locale, data.summary.overallRating)} note={isArabic ? "المؤشر الرئيسي" : "headline rating"} icon={Star} index="01" />
        <WorkerProMetric label={isArabic ? "عدد المراجعات" : "Reviews"} value={formatNumber(locale, data.summary.totalReviews)} note={isArabic ? "إجمالي الآراء" : "total feedback"} icon={Sparkles} index="02" />
        <WorkerProMetric label={isArabic ? "عملاء متكررون" : "Repeat clients"} value={`${formatNumber(locale, data.summary.repeatClientsRate)}%`} note={isArabic ? "معدل الولاء" : "loyalty rate"} icon={TimerReset} index="03" />
        <WorkerProMetric label={isArabic ? "خمس نجوم" : "Five stars"} value={formatNumber(locale, data.summary.fiveStars)} note={isArabic ? "ثقة قوية" : "premium signal"} icon={ShieldCheck} index="04" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <WorkerProPanel title={isArabic ? "الشارات المكتسبة" : "Earned badges"} eyebrow={isArabic ? "علامات الثقة" : "trust marks"}>
          <div className="flex flex-wrap gap-3">
            {data.badges.map((badge, index) => (
              <WorkerProBadge key={badge} tone={index % 3 === 0 ? "gold" : index % 3 === 1 ? "green" : "muted"}>{badge}</WorkerProBadge>
            ))}
          </div>
        </WorkerProPanel>

        <WorkerProPanel title={isArabic ? "أحدث المراجعات" : "Recent reviews"} eyebrow={isArabic ? "صوت العميل" : "client voice"}>
          {data.reviews.length === 0 ? (
            <WorkerProEmpty title={isArabic ? "لا توجد مراجعات بعد" : "No reviews yet"} text={isArabic ? "بعد إكمال أول خدمة سيظهر تقييم العميل هنا." : "After your first completed job, client reviews will appear here."} />
          ) : (
            <div className="grid gap-4">
              {data.reviews.map((review, index) => (
                <div key={review.id} className={index % 2 === 0 ? "border border-white/10 bg-[#111] p-4" : "border border-gold/30 bg-[#2a2207] p-4"}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-lg font-black text-white">{review.clientName}</p>
                      <p className="mt-1 text-sm text-white/45">{review.service}</p>
                    </div>
                    <WorkerProBadge tone={review.rating === 5 ? "green" : "gold"}>{isArabic ? `${review.rating} نجوم` : `${review.rating} stars`}</WorkerProBadge>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-white/60">{review.comment}</p>
                  <p className="mt-3 text-[10px] font-black uppercase tracking-[0.18em] text-white/35">{formatDate(locale, review.createdAt)}</p>
                </div>
              ))}
            </div>
          )}
        </WorkerProPanel>
      </div>
    </WorkerProShell>
  );
}

function WorkerSaveControl({ state, onSave, isArabic }: { state: "idle" | "saving" | "saved"; onSave: () => void; isArabic: boolean }) {
  return (
    <div className="flex shrink-0 items-center gap-3">
      {state === "saved" ? (
        <span className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-emerald-300">
          <Check className="h-4 w-4" />
          {isArabic ? "تم الحفظ" : "Saved"}
        </span>
      ) : null}
      <WorkerProAction tone="light" onClick={onSave} disabled={state === "saving"}>
        {state === "saving" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        {state === "saving" ? (isArabic ? "جارٍ الحفظ" : "Saving") : isArabic ? "حفظ" : "Save"}
      </WorkerProAction>
    </div>
  );
}

export function WorkerSettingsPage({ locale, initialData }: { locale: Locale; initialData: WorkerSettingsData }) {
  const isArabic = locale === "ar";
  const liveData = useLiveApiData("/workers/settings", initialData);
  const [data, setData] = useState(initialData);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  useEffect(() => {
    setData(liveData);
  }, [liveData]);

  async function handleAvatarUploadSettings(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });
      if (!res.ok) throw new Error("Upload failed");
      const resData = await res.json();
      setData((prev) => ({
        ...prev,
        profile: {
          ...prev.profile,
          avatarUrl: resData.url
        }
      }));
    } catch (err) {
      console.error("Avatar upload failed", err);
    } finally {
      setIsUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  }

  function handleSave() {
    setSaveState("saving");
    window.setTimeout(() => {
      setSaveState("saved");
      window.setTimeout(() => setSaveState("idle"), 2000);
    }, 500);
  }

  const safeWorkPreferences = {
    isAvailable: data.workPreferences?.isAvailable ?? false,
    acceptsEmergency: data.workPreferences?.acceptsEmergency ?? false,
    acceptsSameDay: data.workPreferences?.acceptsSameDay ?? false,
    serviceAreas: Array.isArray(data.workPreferences?.serviceAreas) ? data.workPreferences.serviceAreas : []
  };
  const safePayout = {
    method: data.payout?.method ?? "",
    schedule: data.payout?.schedule ?? "",
    bankLabel: data.payout?.bankLabel ?? ""
  };
  const fullName = `${data.profile.firstName} ${data.profile.lastName}`.trim() || "OSTA Pro";
  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "O";

  return (
    <WorkerProShell locale={locale}>
      <WorkerProTopStrip locale={locale} title={isArabic ? "الإعدادات" : "Settings"} />

      <section className="flex flex-col gap-6 border border-white/10 bg-black p-6 text-white sm:flex-row sm:items-center sm:justify-between lg:p-8">
        <div className="flex min-w-0 items-center gap-5">
          <div className="relative group shrink-0">
            <div
              onClick={() => avatarInputRef.current?.click()}
              className="relative flex h-16 w-16 cursor-pointer items-center justify-center overflow-hidden border border-gold bg-[#111] text-gold sm:h-20 sm:w-20 transition hover:border-gold/80"
            >
              {data.profile.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={data.profile.avatarUrl} alt={isArabic ? "صورة الفني" : "Worker avatar"} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
              ) : (
                <UserCircle2 className="h-8 w-8 sm:h-10 sm:w-10" />
              )}
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                <Camera className="h-4 w-4 text-gold" />
                <span className="text-[8px] font-black uppercase text-white">{isUploadingAvatar ? "..." : isArabic ? "تغيير" : "Change"}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-gold text-black shadow-lg transition hover:scale-110 active:scale-95"
              title={isArabic ? "تغيير الصورة الشخصية" : "Change profile photo"}
            >
              <Camera className="h-3 w-3" />
            </button>
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-gold">{isArabic ? "الملف الشخصي" : "Worker profile"}</p>
              {data.profile.verificationStatus === "VERIFIED" ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-950/70 px-3 py-0.5 text-xs font-black text-emerald-400 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/logo.svg" alt="OSTA" className="h-3.5 w-auto object-contain brightness-125" />
                  <span>{isArabic ? "موثق بواسطة أوسطى" : "Verified by OSTA"}</span>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                </span>
              ) : null}
            </div>
            <div className="mt-1 flex items-center gap-2">
              <h1 className="truncate text-2xl font-black uppercase leading-tight text-white sm:text-3xl">{fullName}</h1>
              {data.profile.verificationStatus === "VERIFIED" ? (
                <ShieldCheck className="h-6 w-6 text-emerald-400 shrink-0" />
              ) : null}
            </div>
            <p className="mt-1 truncate text-sm font-semibold text-white/50">
              {data.profile.email || (isArabic ? "لا يوجد بريد" : "No email")} · {data.profile.phone || (isArabic ? "لا يوجد هاتف" : "No phone")}
            </p>
          </div>
        </div>
        <WorkerSaveControl state={saveState} onSave={handleSave} isArabic={isArabic} />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <WorkerProPanel title={isArabic ? "البيانات الشخصية" : "Personal info"}>
          <div className="mb-6 flex flex-col sm:flex-row items-center gap-5 rounded-none border border-white/10 bg-[#111] p-4">
            <div className="relative group shrink-0">
              <div
                onClick={() => avatarInputRef.current?.click()}
                className="relative h-20 w-20 cursor-pointer overflow-hidden border border-gold bg-[#121212] transition hover:border-gold/80"
              >
                {data.profile.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={data.profile.avatarUrl} alt={fullName} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gold text-xl font-black text-black">{initials}</div>
                )}
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                  <Camera className="h-4 w-4 text-gold" />
                  <span className="text-[8px] font-black uppercase text-white">{isUploadingAvatar ? (isArabic ? "جاري..." : "Uploading...") : isArabic ? "تغيير" : "Change"}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-gold text-black shadow-lg transition hover:scale-110 active:scale-95"
                title={isArabic ? "تغيير الصورة الشخصية" : "Change profile photo"}
              >
                <Camera className="h-3 w-3" />
              </button>
              <input
                type="file"
                accept="image/*"
                ref={avatarInputRef}
                onChange={(e) => void handleAvatarUploadSettings(e)}
                className="hidden"
              />
            </div>
            <div className="space-y-1 text-center sm:text-start">
              <span className="text-xs font-black uppercase tracking-wider text-gold">{isArabic ? "الصورة الشخصية" : "Profile Picture"}</span>
              <p className="text-xs font-medium text-white/50">{isArabic ? "اضغط على الصورة أو زر الكاميرا لرفع صورة جديدة" : "Click avatar or camera icon to upload a new profile image"}</p>
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="mt-2 inline-flex items-center gap-2 border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-gold hover:text-black"
              >
                <Camera className="h-3.5 w-3.5" />
                {isArabic ? "تحميل صورة جديدة" : "Upload new photo"}
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-white/45">{isArabic ? "الاسم الأول" : "First name"}</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-black text-white/30 uppercase tracking-wider">
                  <Lock className="h-3 w-3" />
                  {isArabic ? "ثابت" : "Locked"}
                </span>
              </div>
              <input
                value={data.profile.firstName ?? ""}
                readOnly
                disabled
                className="h-12 w-full border border-white/10 bg-[#141414] px-4 text-white/50 outline-none cursor-not-allowed select-none font-bold"
              />
            </label>

            <label className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-white/45">{isArabic ? "اسم العائلة" : "Last name"}</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-black text-white/30 uppercase tracking-wider">
                  <Lock className="h-3 w-3" />
                  {isArabic ? "ثابت" : "Locked"}
                </span>
              </div>
              <input
                value={data.profile.lastName ?? ""}
                readOnly
                disabled
                className="h-12 w-full border border-white/10 bg-[#141414] px-4 text-white/50 outline-none cursor-not-allowed select-none font-bold"
              />
            </label>

            <label className="space-y-2 sm:col-span-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-white/45">{isArabic ? "رقم الهاتف" : "Phone"}</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-black text-white/30 uppercase tracking-wider">
                  <Lock className="h-3 w-3" />
                  {isArabic ? "ثابت" : "Locked"}
                </span>
              </div>
              <input
                value={formatPhoneNumber(data.profile.phone)}
                readOnly
                disabled
                dir="ltr"
                className="h-12 w-full border border-white/10 bg-[#141414] px-4 text-white/50 outline-none cursor-not-allowed select-none text-start font-mono font-bold"
              />
            </label>

            <div className="sm:col-span-2">
              <EmailVerificationField
                locale={locale}
                email={data.profile.email ?? ""}
                emailVerified={Boolean((data.profile as any).emailVerified)}
                onChangeEmail={(val) => setData({ ...data, profile: { ...data.profile, email: val } })}
              />
            </div>

            <label className="space-y-2 sm:col-span-2 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-white/45">{isArabic ? "رقم بطاقة الرقم القومي" : "National ID Number"}</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-black text-white/30 uppercase tracking-wider">
                  <Lock className="h-3 w-3" />
                  {isArabic ? "ثابت" : "Locked"}
                </span>
              </div>
              <input
                value={data.profile.nationalIdNumber ?? ""}
                readOnly
                disabled
                dir="ltr"
                placeholder="2900101100001"
                className="h-12 w-full border border-white/10 bg-[#141414] px-4 font-mono text-white/50 outline-none cursor-not-allowed select-none text-start font-bold"
              />
            </label>

            <div className="sm:col-span-2 space-y-3 pt-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-black uppercase tracking-wider text-gold">{isArabic ? "وثائق الهوية الوطنية" : "National ID Documents"}</p>
                {data.profile.verificationStatus === "VERIFIED" ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3 py-1 text-xs font-black text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    {isArabic ? "موثقة ومعتمدة من الإدارة ✓" : "Verified & Approved by Admin ✓"}
                  </span>
                ) : null}
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <WorkerIdDocumentCard
                  label={isArabic ? "وجه البطاقة الشخصية" : "ID Front"}
                  imageUrl={data.profile.nationalIdFront}
                  isLocked={data.profile.verificationStatus === "VERIFIED"}
                  onUpload={async (file) => {
                    const formData = new FormData();
                    formData.append("file", file);
                    const res = await postApiData<{ url: string }, FormData>("/upload", formData);
                    setData({ ...data, profile: { ...data.profile, nationalIdFront: res.url } });
                  }}
                />
                <WorkerIdDocumentCard
                  label={isArabic ? "ظهر البطاقة الشخصية" : "ID Back"}
                  imageUrl={data.profile.nationalIdBack}
                  isLocked={data.profile.verificationStatus === "VERIFIED"}
                  onUpload={async (file) => {
                    const formData = new FormData();
                    formData.append("file", file);
                    const res = await postApiData<{ url: string }, FormData>("/upload", formData);
                    setData({ ...data, profile: { ...data.profile, nationalIdBack: res.url } });
                  }}
                />
                <WorkerIdDocumentCard
                  label={isArabic ? "سيلفي مع الهوية" : "Selfie with ID"}
                  imageUrl={data.profile.selfieWithId}
                  isLocked={data.profile.verificationStatus === "VERIFIED"}
                  onUpload={async (file) => {
                    const formData = new FormData();
                    formData.append("file", file);
                    const res = await postApiData<{ url: string }, FormData>("/upload", formData);
                    setData({ ...data, profile: { ...data.profile, selfieWithId: res.url } });
                  }}
                />
              </div>
            </div>
          </div>
        </WorkerProPanel>

        <WorkerProPanel title={isArabic ? "التوفر والتحويل" : "Availability & payout"}>
          <div className="grid gap-4">
            {[
              { key: "isAvailable", label: isArabic ? "متاح للطلبات" : "Available for jobs" },
              { key: "acceptsEmergency", label: isArabic ? "يقبل الطوارئ" : "Accept emergency" },
              { key: "acceptsSameDay", label: isArabic ? "يقبل نفس اليوم" : "Accept same-day" }
            ].map((item) => (
              <label key={item.key} className="flex items-center justify-between gap-4 border border-white/10 bg-[#111] p-4">
                <span className="font-black text-white">{item.label}</span>
                <input
                  type="checkbox"
                  checked={safeWorkPreferences[item.key as keyof typeof safeWorkPreferences] as boolean}
                  onChange={(event) => setData({ ...data, workPreferences: { ...data.workPreferences, [item.key]: event.target.checked } })}
                  className="h-5 w-5 accent-gold"
                />
              </label>
            ))}
            {safeWorkPreferences.serviceAreas.length > 0 ? (
              <div className="border border-white/10 bg-[#111] p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/35">{isArabic ? "المناطق" : "Areas"}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {safeWorkPreferences.serviceAreas.map((area) => (
                    <WorkerProBadge key={area} tone="gold">{area}</WorkerProBadge>
                  ))}
                </div>
              </div>
            ) : null}
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: isArabic ? "الوسيلة" : "Method", value: safePayout.method || (isArabic ? "غير محدد" : "Unset") },
                { label: isArabic ? "الجدول" : "Schedule", value: safePayout.schedule || (isArabic ? "غير محدد" : "Unset") },
                { label: isArabic ? "البنك" : "Bank", value: safePayout.bankLabel || (isArabic ? "غير محدد" : "Unset") }
              ].map((item) => (
                <div key={item.label} className="border border-white/10 bg-white/5 p-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/35">{item.label}</p>
                  <p className="mt-2 text-sm font-black text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </WorkerProPanel>
      </div>

      <WorkerModeSwitcher locale={locale} fullName={fullName} avatarUrl={data.profile.avatarUrl} email={data.profile.email} phone={data.profile.phone} />
    </WorkerProShell>
  );
}

export function EmailVerificationField({
  locale,
  email,
  emailVerified,
  onChangeEmail,
  onVerified
}: {
  locale: Locale;
  email: string;
  emailVerified: boolean;
  onChangeEmail: (val: string) => void;
  onVerified?: () => void;
}) {
  const isArabic = locale === "ar";
  const verifiedEmailRef = useRef(emailVerified ? email.trim().toLowerCase() : "");
  const [verified, setVerified] = useState(emailVerified);
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setVerified(emailVerified);
    if (emailVerified) {
      verifiedEmailRef.current = email.trim().toLowerCase();
    }
  }, [emailVerified, email]);

  const isCurrentlyVerified = verified && email.trim().toLowerCase() === verifiedEmailRef.current;

  function handleInputChange(newVal: string) {
    onChangeEmail(newVal);
    if (verified && newVal.trim().toLowerCase() !== verifiedEmailRef.current) {
      setVerified(false);
      setShowOtpInput(false);
      setOtpCode("");
      setMessage(null);
    }
  }

  async function handleSendVerification() {
    if (!email || !email.includes("@")) {
      setError(isArabic ? "برجاء إدخال بريد إلكتروني صحيح أولاً" : "Please enter a valid email address first");
      return;
    }

    setSendingCode(true);
    setError(null);
    setMessage(null);
    setOtpCode("");

    try {
      await postApiData<{ sent: boolean; message: string }, { email?: string }>("/auth/send-email-verification", { email: email.trim() });
      setShowOtpInput(true);
      setMessage(isArabic ? "تم إرسال رمز التحقق إلى بريدك الإلكتروني" : "Verification code sent to your email");
    } catch (err: any) {
      setError(err?.message || (isArabic ? "حدث خطأ أثناء إرسال الرمز" : "Failed to send verification code"));
    } finally {
      setSendingCode(false);
    }
  }

  async function handleVerifyOtp() {
    if (!otpCode || otpCode.trim().length < 4) {
      setError(isArabic ? "برجاء إدخال رمز التحقق" : "Please enter the verification code");
      return;
    }

    setVerifyingOtp(true);
    setError(null);
    setMessage(null);

    try {
      await postApiData<{ emailVerified: boolean }, { code: string }>("/auth/verify-email-otp", { code: otpCode.trim() });
      verifiedEmailRef.current = email.trim().toLowerCase();
      setVerified(true);
      setShowOtpInput(false);
      setOtpCode("");
      setMessage(isArabic ? "تم توثيق البريد الإلكتروني بنجاح ✓" : "Email address verified successfully ✓");
      if (onVerified) onVerified();
    } catch (err: any) {
      setError(err?.message || (isArabic ? "رمز التحقق غير صحيح أو منتهي الصلاحية" : "Invalid or expired verification code"));
    } finally {
      setVerifyingOtp(false);
    }
  }

  return (
    <div className="space-y-2 w-full">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-black text-white/45">{isArabic ? "البريد الإلكتروني" : "Email"}</span>
        {isCurrentlyVerified ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3 py-1 text-xs font-black text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            {isArabic ? "تم التوثيق ✓" : "Verified ✓"}
          </span>
        ) : (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-black text-amber-400">
              <AlertCircle className="h-3 w-3 text-amber-400" />
              {isArabic ? "غير موثق" : "Unverified"}
            </span>
            <button
              type="button"
              disabled={sendingCode}
              onClick={() => void handleSendVerification()}
              className="text-[11px] font-black text-gold underline hover:text-gold/80 transition disabled:opacity-50"
            >
              {sendingCode ? (
                <span className="flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  {isArabic ? "جاري الإرسال..." : "Sending..."}
                </span>
              ) : (
                isArabic ? "تأكيد البريد الإلكتروني" : "Verify Email"
              )}
            </button>
          </div>
        )}
      </div>

      <div className="relative">
        <input
          value={email}
          onChange={(e) => handleInputChange(e.target.value)}
          dir="ltr"
          type="email"
          placeholder="user@example.com"
          className={cn(
            "h-12 w-full border border-white/10 bg-[#111] px-4 font-mono text-white outline-none focus:border-gold text-start",
            isCurrentlyVerified ? "border-emerald-500/40 bg-emerald-950/10" : ""
          )}
        />
      </div>

      {message ? <p className="text-xs font-bold text-emerald-400 mt-1">{message}</p> : null}
      {error ? <p className="text-xs font-bold text-rose-400 mt-1">{error}</p> : null}

      {showOtpInput && !verified ? (
        <div className="mt-3 border border-gold/40 bg-black/90 p-4 space-y-3 shadow-2xl">
          <p className="text-xs font-black text-white">
            {isArabic ? "أدخل رمز التحقق المكون من 6 أرقام المرسل للبريد:" : "Enter the 6-digit verification code sent to email:"}
          </p>
          <div className="flex items-center gap-2">
            <input
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              dir="ltr"
              maxLength={6}
              placeholder="123456"
              className="h-10 w-36 border border-white/20 bg-[#151515] px-3 font-mono text-center text-sm tracking-widest text-gold outline-none focus:border-gold"
            />
            <button
              type="button"
              disabled={verifyingOtp}
              onClick={() => void handleVerifyOtp()}
              className="h-10 px-4 bg-gold font-black text-black text-xs uppercase hover:bg-gold/90 transition flex items-center gap-1.5"
            >
              {verifyingOtp ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              {isArabic ? "تأكيد" : "Verify"}
            </button>
            <button
              type="button"
              onClick={() => setShowOtpInput(false)}
              className="h-10 px-3 border border-white/20 text-white/70 text-xs hover:text-white"
            >
              {isArabic ? "إلغاء" : "Cancel"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function WorkerIdDocumentCard({
  label,
  imageUrl,
  isLocked,
  onUpload
}: {
  label: string;
  imageUrl?: string | null;
  isLocked?: boolean;
  onUpload: (file: File) => Promise<void>;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (isLocked) return;
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await onUpload(file);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className={cn("border bg-[#111] p-3 space-y-2", isLocked ? "border-emerald-500/30 bg-emerald-950/5" : "border-white/10")}>
      <div className="flex h-10 items-start justify-between gap-2">
        <span className="text-xs font-black text-white/70 leading-snug min-w-0 flex-1">{label}</span>
        {isLocked ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 shrink-0 pt-0.5">
            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
            معتمد
          </span>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-[11px] font-black text-gold underline hover:text-gold/80 transition shrink-0 pt-0.5"
          >
            {imageUrl ? "تغيير" : "رفع"}
          </button>
        )}
      </div>

      <div
        onClick={() => {
          if (!isLocked) fileInputRef.current?.click();
        }}
        className={cn(
          "relative h-28 w-full overflow-hidden border bg-[#181818] transition flex items-center justify-center",
          isLocked ? "cursor-default border-emerald-500/20" : "cursor-pointer border-white/10 hover:border-gold group"
        )}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={label} className={cn("h-full w-full object-cover transition", !isLocked && "group-hover:scale-105")} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-white/30 space-y-1">
            <Camera className="h-6 w-6 text-gold/60" />
            <span className="text-[10px] font-bold">{isLocked ? "وثيقة رسمية معتمدة" : "انقر لرفع الصورة"}</span>
          </div>
        )}

        {!isLocked ? (
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1.5 text-white text-xs font-bold">
            <Camera className="h-4 w-4 text-gold" />
            <span>{isUploading ? "جاري الرفع..." : "تحديث الصورة"}</span>
          </div>
        ) : imageUrl ? (
          <div className="absolute top-2 right-2 rounded-full bg-emerald-500 p-1 text-black shadow-lg">
            <CheckCircle2 className="h-3.5 w-3.5 text-black" />
          </div>
        ) : null}
      </div>

      {!isLocked ? (
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={(e) => void handleFileChange(e)}
          className="hidden"
        />
      ) : null}
    </div>
  );
}
