"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { AlertCircle, AlertTriangle, CalendarDays, Camera, Check, CheckCircle2, Clock, Loader2, Lock, MapPin, Plus, Save, ShieldCheck, Sparkles, Star, TimerReset, Trash2, UserCircle2, X, Edit } from "lucide-react";

import { ImageCropModal } from "@/components/shared/avatar-crop-modal";
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
import { patchApiData, postApiData } from "@/lib/api";
import type { Locale } from "@/lib/locales";
import { workerProfessions } from "@/lib/geo-data";
import type { WorkerRatingsData, WorkerSettingsData } from "@/lib/operations-data";
import { cn, formatPhoneNumber, getLocalizedError } from "@/lib/utils";

function formatNumber(locale: Locale, value: number) {
  return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US", { maximumFractionDigits: 0 }).format(value);
}

function formatDate(locale: Locale, value: string) {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
    dateStyle: "medium"
  }).format(new Date(value));
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

function WorkerSaveControl({ state, isArabic, error }: { state: "idle" | "saving" | "saved" | "error"; isArabic: boolean; error?: string | null }) {
  return (
    <div className="flex shrink-0 flex-col items-end gap-1.5">
      <div className="flex items-center gap-2">
        {state === "saving" ? (
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3.5 py-1.5 text-xs font-black text-gold shadow-sm">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-gold" />
            {isArabic ? "جارٍ الحفظ تلقائياً..." : "Auto-saving..."}
          </span>
        ) : state === "error" && error ? (
          <span className="inline-flex items-center gap-2 rounded-full border border-rose-500/40 bg-rose-950/60 px-3.5 py-1.5 text-xs font-bold text-rose-300">
            {error}
          </span>
        ) : (
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-950/60 px-3.5 py-1.5 text-xs font-black text-emerald-400 shadow-sm">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            {isArabic ? "تم الحفظ تلقائياً ✓" : "Auto-saved ✓"}
          </span>
        )}
      </div>
    </div>
  );
}



export function WorkerSettingsPage({ locale, initialData }: { locale: Locale; initialData: WorkerSettingsData }) {
  const isArabic = locale === "ar";
  const liveData = useLiveApiData("/workers/settings", initialData);
  const [data, setData] = useState(initialData);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarCropSrc, setAvatarCropSrc] = useState<string | null>(null);
  const [customProfInput, setCustomProfInput] = useState("");
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setData(liveData);
  }, [liveData]);

  const triggerAutoSave = useCallback(
    (updatedData: WorkerSettingsData) => {
      setSaveState("saving");
      setSaveError(null);

      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

      debounceTimerRef.current = setTimeout(async () => {
        try {
          const safeAreas =
            Array.isArray(updatedData.workPreferences?.serviceAreas) && updatedData.workPreferences.serviceAreas.length > 0
              ? updatedData.workPreferences.serviceAreas
              : [isArabic ? "جميع أنحاء الجمهورية" : "All Egypt / Nationwide"];

          await patchApiData("/workers/settings", {
            professions: updatedData.profile?.professions ?? [],
            isAvailable: updatedData.workPreferences?.isAvailable ?? false,
            workingHours: updatedData.workPreferences?.workingHours,
            offDates: updatedData.workPreferences?.offDates ?? [],
            acceptedPaymentMethods: updatedData.workPreferences?.acceptedPaymentMethods ?? [],
            preferredPaymentMethod: updatedData.workPreferences?.preferredPaymentMethod ?? null,
            serviceAreas: safeAreas,
            nationalIdFront: updatedData.profile?.nationalIdFront,
            nationalIdBack: updatedData.profile?.nationalIdBack,
            selfieWithId: updatedData.profile?.selfieWithId,
            nationalIdNumber: updatedData.profile?.nationalIdNumber
          });

          await patchApiData("/auth/profile", {
            email: updatedData.profile?.email,
            avatarUrl: updatedData.profile?.avatarUrl
          });

          setSaveState("saved");
          setTimeout(() => setSaveState("idle"), 2000);
        } catch (err: any) {
          console.error("Failed to auto-save worker settings", err);
          setSaveError(getLocalizedError(err instanceof Error ? err.message : "", locale));
          setSaveState("error");
        }
      }, 350);
    },
    [isArabic, locale]
  );

  function updateData(updater: WorkerSettingsData | ((prev: WorkerSettingsData) => WorkerSettingsData)) {
    setData((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      triggerAutoSave(next);
      return next;
    });
  }

  function handleAvatarFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setAvatarCropSrc(URL.createObjectURL(file));
  }

  function closeAvatarCrop() {
    if (avatarCropSrc) URL.revokeObjectURL(avatarCropSrc);
    setAvatarCropSrc(null);
    if (avatarInputRef.current) avatarInputRef.current.value = "";
  }

  async function handleAvatarCropConfirm(blob: Blob) {
    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", new File([blob], "avatar.jpg", { type: "image/jpeg" }));
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Upload failed");
      }
      const resData = await res.json();
      updateData((prev) => ({
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
      closeAvatarCrop();
    }
  }

  const safeWorkPreferences = {
    isAvailable: data.workPreferences?.isAvailable ?? false,
    acceptsEmergency: data.workPreferences?.acceptsEmergency ?? false,
    acceptsSameDay: data.workPreferences?.acceptsSameDay ?? false,
    serviceAreas: Array.isArray(data.workPreferences?.serviceAreas) && data.workPreferences.serviceAreas.length > 0
      ? data.workPreferences.serviceAreas
      : [isArabic ? "جميع أنحاء الجمهورية" : "All Egypt / Nationwide"],
    acceptedPaymentMethods: Array.isArray(data.workPreferences?.acceptedPaymentMethods) ? data.workPreferences.acceptedPaymentMethods : [],
    preferredPaymentMethod: data.workPreferences?.preferredPaymentMethod ?? null
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

  const currentProfessions = Array.isArray(data.profile.professions) && data.profile.professions.length > 0
    ? data.profile.professions
    : [];

  function handleAddProfession(prof: string) {
    const trimmed = prof.trim();
    if (!trimmed || currentProfessions.includes(trimmed)) return;
    const nextProfessions = [...currentProfessions, trimmed];
    updateData((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        professions: nextProfessions
      }
    }));
  }

  function handleRemoveProfession(profToRemove: string) {
    if (currentProfessions.length <= 1) return;
    const nextProfessions = currentProfessions.filter((p) => p !== profToRemove);
    updateData((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        professions: nextProfessions
      }
    }));
  }

  return (
    <WorkerProShell locale={locale}>
      <WorkerProTopStrip locale={locale} title={isArabic ? "الإعدادات" : "Settings"} />

      {data.profile.verificationStatus === "PENDING" && (
        (!data.profile.nationalIdFront || !data.profile.nationalIdBack || !data.profile.selfieWithId || !data.profile.nationalIdNumber) ? (
          <div className="flex items-center gap-3 bg-red-500/10 border-b border-red-500/30 p-4 text-red-400">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm font-bold">
              {isArabic ? "ملفك غير مكتمل، يرجى التوجه إلى قسم (المستندات الرسمية) بالأسفل لرفع المستندات المطلوبة (صورة البطاقة)." : "Your profile is incomplete, please go to the 'Official Documents' section below to upload the required documents (ID photos)."}
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-3 bg-amber-500/10 border-b border-amber-500/30 p-4 text-amber-500">
            <Clock className="h-5 w-5 shrink-0" />
            <p className="text-sm font-bold">
              {isArabic ? "ملفك مكتمل وجاري المراجعة. يرجى انتظار مكالمة من الإدارة لتأكيد حسابك." : "Your profile is complete and under review. Please wait for a call from admin to verify your account."}
            </p>
          </div>
        )
      )}

      <section className="flex flex-col gap-6 border border-white/10 bg-black p-6 text-white sm:flex-row sm:items-center sm:justify-between lg:p-8">
        <div className="flex min-w-0 items-center gap-5">
          <div className="relative group shrink-0">
            <div
              onClick={() => {
                if (data.profile.verificationStatus !== "VERIFIED" && !isUploadingAvatar) {
                  avatarInputRef.current?.click();
                }
              }}
              className={cn(
                "relative flex h-16 w-16 items-center justify-center overflow-hidden border bg-[#111] text-gold sm:h-20 sm:w-20 transition",
                data.profile.verificationStatus === "VERIFIED" ? "border-white/10" : "cursor-pointer border-gold hover:border-gold/80"
              )}
            >
              {data.profile.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={data.profile.avatarUrl} alt={isArabic ? "صورة الفني" : "Worker avatar"} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
              ) : (
                <UserCircle2 className="h-8 w-8 sm:h-10 sm:w-10" />
              )}
              {isUploadingAvatar ? (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-1 z-10">
                  <Loader2 className="h-5 w-5 animate-spin text-gold" />
                </div>
              ) : data.profile.verificationStatus !== "VERIFIED" ? (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                  <Camera className="h-4 w-4 text-gold" />
                  <span className="text-[8px] font-black uppercase text-white">{isArabic ? "تغيير" : "Change"}</span>
                </div>
              ) : null}
            </div>
            {data.profile.verificationStatus !== "VERIFIED" && (
              <button
                type="button"
                disabled={isUploadingAvatar}
                onClick={() => avatarInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-gold text-black shadow-lg transition hover:scale-110 active:scale-95 disabled:opacity-50"
                title={isArabic ? "تغيير الصورة الشخصية" : "Change profile photo"}
              >
                {isUploadingAvatar ? <Loader2 className="h-3 w-3 animate-spin" /> : <Camera className="h-3 w-3" />}
              </button>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-gold">{isArabic ? "الملف الشخصي" : "Worker profile"}</p>
              {data.profile.verificationStatus === "VERIFIED" && Boolean(data.profile.nationalIdFront && data.profile.nationalIdBack) ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-950/70 px-3 py-0.5 text-xs font-black text-emerald-400 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/logo.svg" alt="OSTA" className="h-3.5 w-auto object-contain brightness-125" />
                  <span>{isArabic ? "موثق بواسطة أوسطفاي" : "Verified by OSTA"}</span>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                </span>
              ) : null}
            </div>
            <div className="mt-1 flex items-center gap-2">
              <h1 className="truncate text-2xl font-black uppercase leading-tight text-white sm:text-3xl">{fullName}</h1>
              {data.profile.verificationStatus === "VERIFIED" && Boolean(data.profile.nationalIdFront && data.profile.nationalIdBack) ? (
                <ShieldCheck className="h-6 w-6 text-emerald-400 shrink-0" />
              ) : null}
            </div>
            <p className="mt-1 truncate text-sm font-semibold text-white/50">
              {data.profile.email || (isArabic ? "لا يوجد بريد" : "No email")} · {data.profile.phone || (isArabic ? "لا يوجد هاتف" : "No phone")}
            </p>
          </div>
        </div>
        <WorkerSaveControl state={saveState} isArabic={isArabic} error={saveError} />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <WorkerProPanel 
          title={isArabic ? "البيانات الشخصية" : "Personal info"} 
          alert={!data.profile.avatarUrl || !data.profile.nationalIdFront || !data.profile.nationalIdBack || !data.profile.selfieWithId || !data.profile.nationalIdNumber || currentProfessions.length === 0}
        >
          <div className="mb-6 flex flex-col sm:flex-row items-center gap-5 rounded-none border border-white/10 bg-[#111] p-4">
            <div className="relative group shrink-0">
              <div
                onClick={() => {
                  if (data.profile.verificationStatus !== "VERIFIED" && !isUploadingAvatar) {
                    avatarInputRef.current?.click();
                  }
                }}
                className={cn(
                  "relative h-20 w-20 overflow-hidden border bg-[#121212] transition",
                  data.profile.verificationStatus === "VERIFIED" ? "border-white/10" : "cursor-pointer border-gold hover:border-gold/80"
                )}
              >
                {data.profile.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={data.profile.avatarUrl} alt={fullName} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gold text-xl font-black text-black">{initials}</div>
                )}
                {isUploadingAvatar ? (
                  <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-1 z-10">
                    <Loader2 className="h-5 w-5 animate-spin text-gold" />
                  </div>
                ) : data.profile.verificationStatus !== "VERIFIED" ? (
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                    <Camera className="h-4 w-4 text-gold" />
                    <span className="text-[8px] font-black uppercase text-white">{isArabic ? "تغيير" : "Change"}</span>
                  </div>
                ) : null}
              </div>
              {data.profile.verificationStatus !== "VERIFIED" && (
                <button
                  type="button"
                  disabled={isUploadingAvatar}
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-gold text-black shadow-lg transition hover:scale-110 active:scale-95 disabled:opacity-50"
                  title={isArabic ? "تغيير الصورة الشخصية" : "Change profile photo"}
                >
                  {isUploadingAvatar ? <Loader2 className="h-3 w-3 animate-spin" /> : <Camera className="h-3 w-3" />}
                </button>
              )}
              <input
                type="file"
                accept="image/*"
                ref={avatarInputRef}
                onChange={handleAvatarFileSelected}
                className="hidden"
                disabled={data.profile.verificationStatus === "VERIFIED"}
              />
            </div>
            <div className="space-y-1 text-center sm:text-start">
              <span className="text-xs font-black uppercase tracking-wider text-gold">{isArabic ? "الصورة الشخصية" : "Profile Picture"}</span>
              {data.profile.verificationStatus !== "VERIFIED" && (
                <div className="flex items-start gap-2 text-amber-500 bg-amber-500/10 border border-amber-500/20 p-2 mt-1 mb-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <p className="text-[11px] font-bold leading-tight text-white">
                    {isArabic 
                      ? "هام: يجب أن تكون الصورة الشخصية حقيقية وواضحة لك، وإلا سيتم رفض توثيق حسابك." 
                      : "Important: Your profile picture must be a real, clear photo of yourself, otherwise your verification will be rejected."}
                  </p>
                </div>
              )}
              <p className="text-xs font-medium text-white/50">
                {data.profile.verificationStatus === "VERIFIED" 
                  ? (isArabic ? "لا يمكن تغيير الصورة الشخصية بعد توثيق الحساب" : "Profile picture cannot be changed after verification")
                  : (isArabic ? "اضغط على الصورة أو زر الكاميرا لرفع صورة جديدة" : "Click avatar or camera icon to upload a new profile image")
                }
              </p>
              {data.profile.verificationStatus !== "VERIFIED" && (
                <button
                  type="button"
                  disabled={isUploadingAvatar}
                  onClick={() => avatarInputRef.current?.click()}
                  className="mt-2 inline-flex items-center gap-2 border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-gold hover:text-black disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploadingAvatar ? <Loader2 className="h-3.5 w-3.5 animate-spin text-gold" /> : <Camera className="h-3.5 w-3.5" />}
                  {isUploadingAvatar ? (isArabic ? "جارٍ الرفع..." : "Uploading...") : isArabic ? "تحميل صورة جديدة" : "Upload new photo"}
                </button>
              )}
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
                emailVerified={Boolean(data.profile.emailVerified)}
                onChangeEmail={(val) => updateData((prev) => ({
                  ...prev,
                  profile: {
                    ...prev.profile,
                    email: val,
                    emailVerified: prev.profile.emailVerified && val.trim().toLowerCase() === (prev.profile.email ?? "").trim().toLowerCase()
                  }
                }))}
                onVerified={() => updateData((prev) => ({ ...prev, profile: { ...prev.profile, emailVerified: true } }))}
              />
            </div>

            {/* Professions List Section */}
            <div className="sm:col-span-2 space-y-3 pt-3 border-t border-white/10">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-black text-white/90 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-gold shrink-0" />
                  <span>{isArabic ? "المهن والتخصصات المهنية" : "Professions & Specialties"}</span>
                  {currentProfessions.length === 0 && (
                    <AlertTriangle className="h-5 w-5 text-amber-500 animate-pulse" />
                  )}
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider text-gold/90 bg-gold/10 px-2.5 py-1 border border-gold/30">
                  {isArabic ? "يمكنك إضافة أكثر من مهنة" : "Multiple professions allowed"}
                </span>
              </div>

              {/* Selected Profession Badges */}
              <div className="flex flex-wrap gap-2 min-h-[50px] p-3 border border-white/10 bg-[#111] items-center">
                {currentProfessions.map((profSlug, idx) => {
                  const professionObj = workerProfessions.find(p => p.value === profSlug);
                  const displayLabel = professionObj 
                    ? (isArabic ? professionObj.labelAr : professionObj.labelEn) 
                    : profSlug;
                  
                  return (
                    <span
                      key={`${profSlug}-${idx}`}
                      className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/15 px-3 py-1 text-xs font-bold text-gold shadow-sm"
                    >
                      <span>{displayLabel}</span>
                      {currentProfessions.length > 1 ? (
                        <button
                          type="button"
                          onClick={() => handleRemoveProfession(profSlug)}
                          className="text-gold/70 hover:text-red-400 transition"
                          title={isArabic ? "إزالة المهنة" : "Remove profession"}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      ) : null}
                    </span>
                  );
                })}
              </div>

              {/* Add Profession Controls */}
              <div className="grid gap-2 sm:grid-cols-2 pt-1">
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddProfession(e.target.value);
                    }
                  }}
                  className="h-12 w-full min-w-0 border border-white/10 bg-[#141414] px-4 text-xs font-bold text-white outline-none focus:border-gold cursor-pointer"
                >
                  <option value="" disabled>
                    {isArabic ? "-- اختر مهنة لإضافتها --" : "-- Select a profession to add --"}
                  </option>
                  {workerProfessions
                    .filter((p) => !currentProfessions.includes(p.value))
                    .map((p) => (
                      <option key={p.value} value={p.value} className="bg-[#111] text-white py-1">
                        {isArabic ? p.labelAr : p.labelEn}
                      </option>
                  ))}
                </select>

                <div className="flex h-12 w-full min-w-0 items-center gap-2">
                  <input
                    type="text"
                    placeholder={isArabic ? "أو اكتب مهنة إضافية..." : "Or type custom profession..."}
                    value={customProfInput}
                    onChange={(e) => setCustomProfInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (customProfInput.trim()) {
                          handleAddProfession(customProfInput.trim());
                          setCustomProfInput("");
                        }
                      }
                    }}
                    className="h-full flex-1 min-w-0 border border-white/10 bg-[#141414] px-4 text-xs text-white outline-none focus:border-gold"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customProfInput.trim()) {
                        handleAddProfession(customProfInput.trim());
                        setCustomProfInput("");
                      }
                    }}
                    className="h-full px-4 border border-gold bg-gold text-black text-xs font-black hover:bg-gold/90 transition shrink-0 inline-flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span>{isArabic ? "إضافة" : "Add"}</span>
                  </button>
                </div>
              </div>
            </div>

            <label className="space-y-2 sm:col-span-2 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between">
                <span className={cn("text-sm font-black", !data.profile.nationalIdNumber && data.profile.verificationStatus !== "VERIFIED" ? "text-rose-400" : "text-white/45")}>
                  {isArabic ? "رقم بطاقة الرقم القومي" : "National ID Number"}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider">
                  {data.profile.verificationStatus === "VERIFIED" ? (
                    <>
                      <Lock className="h-3 w-3 text-emerald-500" />
                      <span className="text-emerald-500">{isArabic ? "معتمد ومغلق" : "Verified & Locked"}</span>
                    </>
                  ) : (
                    <span className="text-white/30">{isArabic ? "قابل للتعديل (مطلوب)" : "Editable (Required)"}</span>
                  )}
                </span>
              </div>
              <input
                value={data.profile.nationalIdNumber ?? ""}
                onChange={(e) => updateData((prev) => ({ ...prev, profile: { ...prev.profile, nationalIdNumber: e.target.value } }))}
                readOnly={data.profile.verificationStatus === "VERIFIED"}
                disabled={data.profile.verificationStatus === "VERIFIED"}
                dir="ltr"
                placeholder="2900101100001"
                className={cn(
                  "h-12 w-full px-4 font-mono outline-none text-start font-bold transition",
                  data.profile.verificationStatus === "VERIFIED"
                    ? "border border-white/10 bg-[#141414] text-white/50 cursor-not-allowed select-none"
                    : !data.profile.nationalIdNumber
                      ? "border border-rose-500/60 bg-rose-950/10 shadow-[0_0_12px_rgba(244,63,94,0.15)] text-white focus:border-rose-400 placeholder:text-rose-500/40"
                      : "border border-white/10 bg-[#141414] text-white focus:border-gold"
                )}
              />
            </label>

            <div className="sm:col-span-2 space-y-3 pt-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-black uppercase tracking-wider text-gold">{isArabic ? "وثائق الهوية الوطنية" : "National ID Documents"}</p>
                {data.profile.verificationStatus === "VERIFIED" && Boolean(data.profile.nationalIdFront && data.profile.nationalIdBack) ? (
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
                  isLocked={data.profile.verificationStatus === "VERIFIED" && Boolean(data.profile.nationalIdFront)}
                  isArabic={isArabic}
                  onUpload={async (file) => {
                    const formData = new FormData();
                    formData.append("file", file);
                    const res = await fetch("/api/upload", { method: "POST", body: formData });
                    if (!res.ok) {
                      const errData = await res.json().catch(() => ({}));
                      throw new Error(errData.error || (isArabic ? "فشل رفع الصورة" : "Upload failed"));
                    }
                    const resData = await res.json();
                    updateData((prev) => ({ ...prev, profile: { ...prev.profile, nationalIdFront: resData.url } }));
                  }}
                />
                <WorkerIdDocumentCard
                  label={isArabic ? "ظهر البطاقة الشخصية" : "ID Back"}
                  imageUrl={data.profile.nationalIdBack}
                  isLocked={data.profile.verificationStatus === "VERIFIED" && Boolean(data.profile.nationalIdBack)}
                  isArabic={isArabic}
                  onUpload={async (file) => {
                    const formData = new FormData();
                    formData.append("file", file);
                    const res = await fetch("/api/upload", { method: "POST", body: formData });
                    if (!res.ok) {
                      const errData = await res.json().catch(() => ({}));
                      throw new Error(errData.error || (isArabic ? "فشل رفع الصورة" : "Upload failed"));
                    }
                    const resData = await res.json();
                    updateData((prev) => ({ ...prev, profile: { ...prev.profile, nationalIdBack: resData.url } }));
                  }}
                />
                <WorkerIdDocumentCard
                  label={isArabic ? "سيلفي مع الهوية" : "Selfie with ID"}
                  imageUrl={data.profile.selfieWithId}
                  isLocked={data.profile.verificationStatus === "VERIFIED" && Boolean(data.profile.selfieWithId)}
                  isArabic={isArabic}
                  onUpload={async (file) => {
                    const formData = new FormData();
                    formData.append("file", file);
                    const res = await fetch("/api/upload", { method: "POST", body: formData });
                    if (!res.ok) {
                      const errData = await res.json().catch(() => ({}));
                      throw new Error(errData.error || (isArabic ? "فشل رفع الصورة" : "Upload failed"));
                    }
                    const resData = await res.json();
                    updateData((prev) => ({ ...prev, profile: { ...prev.profile, selfieWithId: resData.url } }));
                  }}
                />
              </div>
            </div>
          </div>
        </WorkerProPanel>

        <WorkerProPanel 
          title={isArabic ? "نظام شغلي" : "Work preferences & payout"}
          alert={!data.workPreferences?.serviceAreas || data.workPreferences.serviceAreas.length === 0}
        >
          <div className="grid gap-4">
            <div className="grid gap-2 sm:grid-cols-3">
              {[
                { key: "isAvailable", label: isArabic ? "متاح للطلبات" : "Available for jobs" },
                { key: "acceptsEmergency", label: isArabic ? "يقبل الطوارئ" : "Accept emergency" },
                { key: "acceptsSameDay", label: isArabic ? "يقبل نفس اليوم" : "Accept same-day" }
              ].map((item) => (
                <label key={item.key} className="flex items-center justify-between gap-2 border border-white/10 bg-[#111] px-3 py-2">
                  <span className="text-sm font-bold text-white">{item.label}</span>
                  <input
                    type="checkbox"
                    checked={safeWorkPreferences[item.key as keyof typeof safeWorkPreferences] as boolean}
                    onChange={(event) => updateData((prev) => ({ ...prev, workPreferences: { ...prev.workPreferences, [item.key]: event.target.checked } }))}
                    className="h-4 w-4 accent-gold"
                  />
                </label>
              ))}
            </div>

            <div className="border border-white/10 bg-[#111] p-4">
              <p className="font-black text-white">{isArabic ? "ممكن تدفعلي عن طريق:" : "You can pay me via:"}</p>
              <p className="mt-1 text-xs font-medium text-white/40">{isArabic ? "اختر الطرق المقبولة، وحدد نجمة الطريقة المفضلة لديك" : "Select the accepted methods, then star your preferred one"}</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {[
                  { key: "cash", label: isArabic ? "كاش" : "Cash" },
                  { key: "vodafone_cash", label: isArabic ? "فودافون كاش" : "Vodafone Cash" },
                  { key: "instapay", label: isArabic ? "انستا باي" : "InstaPay" }
                ].map((method) => {
                  const isChecked = safeWorkPreferences.acceptedPaymentMethods.includes(method.key);
                  const isPreferred = safeWorkPreferences.preferredPaymentMethod === method.key;
                  return (
                    <div key={method.key} className="flex items-center justify-between gap-3 border border-white/10 bg-[#141414] p-3">
                      <label className="flex flex-1 items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(event) => {
                            const checked = event.target.checked;
                            const nextMethods = checked
                              ? [...safeWorkPreferences.acceptedPaymentMethods, method.key]
                              : safeWorkPreferences.acceptedPaymentMethods.filter((m) => m !== method.key);
                            const nextPreferred = checked
                              ? safeWorkPreferences.preferredPaymentMethod
                              : safeWorkPreferences.preferredPaymentMethod === method.key
                                ? null
                                : safeWorkPreferences.preferredPaymentMethod;
                            updateData((prev) => ({ ...prev, workPreferences: { ...prev.workPreferences, acceptedPaymentMethods: nextMethods, preferredPaymentMethod: nextPreferred } }));
                          }}
                          className="h-5 w-5 accent-gold"
                        />
                        <span className="text-sm font-bold text-white">{method.label}</span>
                      </label>
                      <button
                        type="button"
                        disabled={!isChecked}
                        onClick={() => updateData((prev) => ({ ...prev, workPreferences: { ...prev.workPreferences, preferredPaymentMethod: isPreferred ? null : method.key } }))}
                        title={isArabic ? "الطريقة المفضلة" : "Preferred method"}
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center border transition",
                          isPreferred ? "border-gold bg-gold text-black" : "border-white/15 text-white/30 hover:text-gold disabled:cursor-not-allowed disabled:opacity-30"
                        )}
                      >
                        <Star className="h-4 w-4" fill={isPreferred ? "currentColor" : "none"} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <WorkerServiceAreasSection
              isArabic={isArabic}
              areas={safeWorkPreferences.serviceAreas}
              onChange={(newAreas) => updateData((prev) => ({ ...prev, workPreferences: { ...prev.workPreferences, serviceAreas: newAreas } }))}
            />


            <WorkerScheduleSection
              locale={locale}
              workingHours={data.workPreferences.workingHours}
              offDates={data.workPreferences.offDates}
              onChangeSchedule={(newSchedule) => updateData((prev) => ({ ...prev, workPreferences: { ...prev.workPreferences, workingHours: newSchedule } }))}
              onChangeOffDates={(newOffDates) => updateData((prev) => ({ ...prev, workPreferences: { ...prev.workPreferences, offDates: newOffDates } }))}
            />
          </div>
        </WorkerProPanel>
      </div>

      {avatarCropSrc ? (
        <ImageCropModal
          imageSrc={avatarCropSrc}
          isArabic={isArabic}
          onCancel={closeAvatarCrop}
          onConfirm={handleAvatarCropConfirm}
        />
      ) : null}
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
    if (emailVerified && email) {
      if (!verifiedEmailRef.current || email.trim().toLowerCase() === verifiedEmailRef.current) {
        verifiedEmailRef.current = email.trim().toLowerCase();
        setVerified(true);
      }
    } else if (!emailVerified) {
      setVerified(false);
    }
  }, [emailVerified, email]);

  const isCurrentlyVerified =
    verified &&
    emailVerified &&
    Boolean(verifiedEmailRef.current) &&
    email.trim().toLowerCase() === verifiedEmailRef.current;

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
  isArabic = true,
  onUpload
}: {
  label: string;
  imageUrl?: string | null;
  isLocked?: boolean;
  isArabic?: boolean;
  onUpload: (file: File) => Promise<void>;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (isLocked || isUploading) return;
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setCropImageSrc(reader.result);
      }
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleCropConfirm(blob: Blob) {
    setCropImageSrc(null);
    setIsUploading(true);
    setUploadError(null);
    try {
      const file = new File([blob], "document.jpg", { type: "image/jpeg" });
      await onUpload(file);
    } catch (err: any) {
      setUploadError(err?.message || (isArabic ? "حدث خطأ أثناء رفع الصورة" : "Failed to upload image"));
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className={cn(
      "border bg-[#111] p-3 space-y-2 relative flex flex-col justify-between transition-colors", 
      isLocked 
        ? "border-emerald-500/30 bg-emerald-950/5" 
        : !imageUrl 
          ? "border-rose-500/60 shadow-[0_0_12px_rgba(244,63,94,0.15)] bg-rose-950/10" 
          : "border-white/10"
    )}>
      <div className="flex items-start justify-between gap-2 pb-1">
        <span className="text-xs font-black text-white/70 leading-snug">{label}</span>
        {isLocked && (
          <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded-sm">
            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
            {isArabic ? "معتمد" : "Verified"}
          </span>
        )}
      </div>

      <div
        className={cn(
          "relative h-32 w-full overflow-hidden border transition flex items-center justify-center",
          isLocked || isUploading 
            ? "cursor-default border-emerald-500/20 bg-[#181818]" 
            : !imageUrl
              ? "cursor-pointer border-rose-500/40 border-dashed bg-rose-950/20 hover:border-rose-400 group hover:bg-rose-950/40"
              : "cursor-pointer border-white/10 bg-[#181818] hover:border-gold group"
        )}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={label} className={cn("h-full w-full object-cover transition duration-300", !isLocked && !isUploading && "group-hover:scale-105 group-hover:brightness-50")} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full w-full text-white/30 space-y-1.5 p-2 text-center"
               onClick={() => !isLocked && !isUploading && fileInputRef.current?.click()}>
            <Camera className="h-6 w-6 text-rose-500/80 animate-pulse" />
            <span className="text-[10px] font-bold text-rose-400">
              {isLocked ? (isArabic ? "وثيقة رسمية معتمدة" : "Official Verified Document") : (isArabic ? "انقر لرفع الصورة (مطلوب)" : "Click to upload image (Required)")}
            </span>
          </div>
        )}

        {isUploading ? (
          <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center gap-2 z-20 backdrop-blur-[2px] transition-all">
            <Loader2 className="h-8 w-8 animate-spin text-gold" />
            <span className="text-xs font-black text-gold tracking-wide animate-pulse">
              {isArabic ? "جارٍ رفع الصورة..." : "Uploading photo..."}
            </span>
          </div>
        ) : !isLocked && imageUrl ? (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2 z-10">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCropImageSrc(imageUrl);
              }}
              className="bg-black/60 hover:bg-black/80 border border-white/20 text-white text-[11px] font-bold px-4 py-1.5 rounded flex items-center gap-2 transition w-[100px] justify-center backdrop-blur-md"
            >
              <Edit className="h-3.5 w-3.5 text-gold" />
              {isArabic ? "تعديل" : "Edit"}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="bg-black/60 hover:bg-black/80 border border-white/20 text-white text-[11px] font-bold px-4 py-1.5 rounded flex items-center gap-2 transition w-[100px] justify-center backdrop-blur-md"
            >
              <Camera className="h-3.5 w-3.5 text-white/70" />
              {isArabic ? "تغيير" : "Change"}
            </button>
          </div>
        ) : imageUrl ? (
          <div className="absolute top-2 right-2 rounded-full bg-emerald-500 p-1 text-black shadow-lg z-10">
            <CheckCircle2 className="h-3.5 w-3.5 text-black" />
          </div>
        ) : null}
      </div>

      {uploadError ? (
        <p className="text-[10px] font-bold text-rose-400 mt-1">{uploadError}</p>
      ) : null}

      {!isLocked ? (
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={(e) => void handleFileChange(e)}
          className="hidden"
        />
      ) : null}

      {cropImageSrc && (
        <ImageCropModal
          imageSrc={cropImageSrc}
          isArabic={isArabic}
          onCancel={() => setCropImageSrc(null)}
          onConfirm={handleCropConfirm}
          aspectRatio={undefined} // Freeform crop for ID documents
          titleAr={`اضبط صورة ${label}`}
          titleEn={`Position ${label}`}
          subtitleAr="قم بضبط الصورة، يمكنك عمل تكبير للصورة، وتدوير الصورة حتى تظهر بوضوح في الإطار."
          subtitleEn="Adjust, zoom, or rotate the image until it is clear in the frame."
        />
      )}
    </div>
  );
}

const DEFAULT_DAYS = [
  { key: "sat", nameAr: "السبت", nameEn: "Saturday" },
  { key: "sun", nameAr: "الأحد", nameEn: "Sunday" },
  { key: "mon", nameAr: "الإثنين", nameEn: "Monday" },
  { key: "tue", nameAr: "الثلاثاء", nameEn: "Tuesday" },
  { key: "wed", nameAr: "الأربعاء", nameEn: "Wednesday" },
  { key: "thu", nameAr: "الخميس", nameEn: "Thursday" },
  { key: "fri", nameAr: "الجمعة", nameEn: "Friday" }
];

export interface DaySchedule {
  day: string;
  enabled: boolean;
  is24Hours: boolean;
  startTime: string;
  endTime: string;
}

function WorkerScheduleSection({
  locale,
  workingHours,
  offDates,
  onChangeSchedule,
  onChangeOffDates
}: {
  locale: Locale;
  workingHours?: DaySchedule[] | null;
  offDates?: string[];
  onChangeSchedule: (schedule: DaySchedule[]) => void;
  onChangeOffDates: (dates: string[]) => void;
}) {
  const isArabic = locale === "ar";
  const [newOffDate, setNewOffDate] = useState("");

  const scheduleMap = new Map<string, DaySchedule>();
  if (Array.isArray(workingHours)) {
    workingHours.forEach((item) => scheduleMap.set(item.day, item));
  }

  const currentSchedule: DaySchedule[] = DEFAULT_DAYS.map((d) => {
    const existing = scheduleMap.get(d.key);
    return (
      existing || {
        day: d.key,
        enabled: d.key !== "fri",
        is24Hours: false,
        startTime: "08:00",
        endTime: "21:00"
      }
    );
  });

  const currentOffDates = offDates || [];

  function updateDay(dayKey: string, partial: Partial<DaySchedule>) {
    const updated = currentSchedule.map((item) => (item.day === dayKey ? { ...item, ...partial } : item));
    onChangeSchedule(updated);
  }

  function handleAddOffDate() {
    if (!newOffDate) return;
    if (currentOffDates.includes(newOffDate)) return;
    onChangeOffDates([...currentOffDates, newOffDate]);
    setNewOffDate("");
  }

  function handleRemoveOffDate(dateStr: string) {
    onChangeOffDates(currentOffDates.filter((d) => d !== dateStr));
  }

  return (
    <div className="space-y-5 pt-4 border-t border-white/10">
      <div className="space-y-1">
        <h3 className="text-xs font-black uppercase text-gold tracking-wider flex items-center gap-2">
          <Clock className="h-4 w-4 text-gold" />
          {isArabic ? "جدول أوقات العمل الأسبوعي" : "Weekly Work Schedule"}
        </h3>
        <p className="text-xs text-white/50">
          {isArabic
            ? "حدد أيام وساعات العمل (مثال: من 08 صباحاً إلى 09 مساءً)، أو اختر (24 ساعة)، أو اضبط الأيام العطلة."
            : "Set your working days and hours (e.g. 08:00 AM to 09:00 PM), select 24 hours, or set rest days."}
        </p>
      </div>

      <div className="space-y-2">
        {DEFAULT_DAYS.map((dayObj) => {
          const item = currentSchedule.find((s) => s.day === dayObj.key)!;
          const dayName = isArabic ? dayObj.nameAr : dayObj.nameEn;

          return (
            <div
              key={dayObj.key}
              className={cn(
                "border p-3 space-y-2 transition",
                item.enabled ? "border-white/10 bg-[#141414]" : "border-white/5 bg-[#0d0d0d] opacity-60"
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={item.enabled}
                    onChange={(e) => updateDay(dayObj.key, { enabled: e.target.checked })}
                    className="h-4 w-4 accent-gold cursor-pointer"
                  />
                  <span className="text-xs font-black text-white">{dayName}</span>
                  {!item.enabled ? (
                    <span className="text-[10px] font-black text-rose-400/80 bg-rose-950/40 border border-rose-500/20 px-2 py-0.5">
                      {isArabic ? "عطلة" : "Off"}
                    </span>
                  ) : null}
                </div>

                {item.enabled ? (
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 text-xs text-white/70 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={item.is24Hours}
                        onChange={(e) => updateDay(dayObj.key, { is24Hours: e.target.checked })}
                        className="h-3.5 w-3.5 accent-gold"
                      />
                      <span className="font-bold text-[11px] text-gold">{isArabic ? "24 ساعة" : "24 Hours"}</span>
                    </label>

                    {!item.is24Hours ? (
                      <div className="flex items-center gap-2" dir="ltr">
                        <input
                          type="time"
                          value={item.startTime || "08:00"}
                          onChange={(e) => updateDay(dayObj.key, { startTime: e.target.value })}
                          className="h-8 w-24 border border-white/15 bg-black px-2 text-xs font-mono text-white outline-none focus:border-gold"
                        />
                        <span className="text-xs text-white/40">-</span>
                        <input
                          type="time"
                          value={item.endTime || "21:00"}
                          onChange={(e) => updateDay(dayObj.key, { endTime: e.target.value })}
                          className="h-8 w-24 border border-white/15 bg-black px-2 text-xs font-mono text-white outline-none focus:border-gold"
                        />
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-3 pt-2 border-t border-white/10">
        <h4 className="text-xs font-black uppercase text-gold tracking-wider flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-gold" />
          {isArabic ? "استثناءات وأيام عطلة خاصة (مثال: 20 مارس)" : "Specific Off Dates / Holidays"}
        </h4>

        <div className="flex gap-2">
          <input
            type="date"
            value={newOffDate}
            onChange={(e) => setNewOffDate(e.target.value)}
            className="h-10 border border-white/15 bg-[#141414] px-3 font-mono text-xs text-white outline-none focus:border-gold min-w-0 flex-1"
          />
          <button
            type="button"
            onClick={handleAddOffDate}
            className="h-10 px-4 bg-gold font-black text-black text-xs uppercase hover:bg-gold/90 transition shrink-0"
          >
            {isArabic ? "+ إضافة استثناء" : "+ Add Off Date"}
          </button>
        </div>

        {currentOffDates.length > 0 ? (
          <div className="flex flex-wrap gap-2 pt-1">
            {currentOffDates.map((dateStr) => (
              <span
                key={dateStr}
                className="inline-flex items-center gap-2 border border-rose-500/30 bg-rose-950/40 px-3 py-1.5 text-xs font-mono text-rose-300"
              >
                <span>{dateStr}</span>
                <span className="text-[10px] font-black text-rose-400">({isArabic ? "غير متاح" : "Off"})</span>
                <button
                  type="button"
                  onClick={() => handleRemoveOffDate(dateStr)}
                  className="text-rose-400 hover:text-white font-bold ml-1"
                  title={isArabic ? "حذف" : "Remove"}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-[11px] text-white/40 italic">
            {isArabic ? "لا توجد أيام عطلة خاصة مضافة حالياً" : "No specific off dates added yet."}
          </p>
        )}
      </div>
    </div>
  );
}

function WorkerServiceAreasSection({
  isArabic,
  areas,
  onChange
}: {
  isArabic: boolean;
  areas: string[];
  onChange: (newAreas: string[]) => void;
}) {
  const [newAreaInput, setNewAreaInput] = useState("");

  const ALL_EGYPT_LABEL = isArabic ? "جميع أنحاء الجمهورية" : "All Egypt / Nationwide";

  const effectiveAreas = areas && areas.length > 0 ? areas : [ALL_EGYPT_LABEL];

  const POPULAR_AREAS = [
    ALL_EGYPT_LABEL,
    "القاهرة",
    "الجيزة",
    "المعادي",
    "6 أكتوبر",
    "الشيخ زايد",
    "التجمع الخامس",
    "مدينة نصر",
    "مصر الجديدة",
    "الشروق",
    "الإسكندرية",
    "سموحة",
    "المنصورة",
    "طنطا"
  ];

  const isAllEgyptSelected = effectiveAreas.some(
    (a) =>
      a.trim() === "جميع أنحاء الجمهورية" ||
      a.trim() === "All Egypt / Nationwide" ||
      a.toLowerCase().includes("جمهورية") ||
      a.toLowerCase().includes("all egypt")
  );

  function handleAddArea(areaToAdd: string) {
    const trimmed = areaToAdd.trim();
    if (!trimmed) return;

    // If choosing "جميع أنحاء الجمهورية", replace all other locations with it
    if (
      trimmed === "جميع أنحاء الجمهورية" ||
      trimmed === "All Egypt / Nationwide" ||
      trimmed.toLowerCase().includes("جمهورية") ||
      trimmed.toLowerCase().includes("all egypt")
    ) {
      onChange([ALL_EGYPT_LABEL]);
      setNewAreaInput("");
      return;
    }

    // If "جميع أنحاء الجمهورية" is currently selected, replace it with the newly chosen specific location
    if (isAllEgyptSelected) {
      onChange([trimmed]);
      setNewAreaInput("");
      return;
    }

    if (effectiveAreas.some((a) => a.toLowerCase() === trimmed.toLowerCase())) {
      setNewAreaInput("");
      return;
    }

    onChange([...effectiveAreas, trimmed]);
    setNewAreaInput("");
  }

  function handleRemoveArea(areaToRemove: string) {
    const remaining = effectiveAreas.filter((a) => a !== areaToRemove);
    if (remaining.length === 0) {
      // At least one location must be selected, default to All Egypt
      onChange([ALL_EGYPT_LABEL]);
    } else {
      onChange(remaining);
    }
  }

  return (
    <div className="border border-white/10 bg-[#111] p-4 space-y-4">
      <div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-gold shrink-0" />
          <h4 className="font-black text-white text-sm">{isArabic ? "مناطق التغطية والخدمة" : "Coverage & Service Areas"}</h4>
        </div>
        <p className="mt-1 text-xs font-medium text-white/40">
          {isArabic ? "أضف المناطق والمافظات التي يمكنك تقديم الخدمات بها لتظهر في نتائج البحث للعملاء." : "Add regions & cities where you can deliver services to appear in client searches."}
        </p>
      </div>

      {/* Current active areas list */}
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {effectiveAreas.map((area) => (
            <span
              key={area}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-black shadow-sm group transition",
                isAllEgyptSelected
                  ? "border-emerald-500/50 bg-emerald-950/40 text-emerald-300"
                  : "border-gold/40 bg-gold/10 text-gold hover:border-gold hover:bg-gold/20"
              )}
            >
              <MapPin className={cn("h-3 w-3", isAllEgyptSelected ? "text-emerald-400" : "text-gold/70")} />
              <span>{area}</span>
              <button
                type="button"
                onClick={() => handleRemoveArea(area)}
                className={cn(
                  "rounded-full p-0.5 transition",
                  isAllEgyptSelected ? "text-emerald-400/70 hover:bg-emerald-800/40 hover:text-white" : "text-gold/60 hover:bg-gold/30 hover:text-white"
                )}
                title={isArabic ? "إزالة" : "Remove"}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>

        {isAllEgyptSelected ? (
          <p className="text-[11px] font-bold text-emerald-400/90 bg-emerald-950/30 border border-emerald-500/20 px-3 py-1.5 rounded-none">
            {isArabic
              ? "ℹ️ التغطية الحالية: جميع أنحاء الجمهورية. لاختيار منطقة أو محافظة محددة، اضغط على المنطقة المطلوبة أدناه وسوف يتم استبدالها."
              : "ℹ️ Current coverage: Nationwide (All Egypt). To select a specific area instead, click any area below."}
          </p>
        ) : (
          <p className="text-[10px] font-medium text-white/40">
            {isArabic ? "يجب اختيار منطقة واحدة على الأقل. عند حذف كل المناطق، يتم التعيين تلقائياً إلى جميع أنحاء الجمهورية." : "At least one location must be selected. Deleting all areas defaults to All Egypt."}
          </p>
        )}
      </div>

      {/* Add custom area input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newAreaInput}
          onChange={(e) => setNewAreaInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddArea(newAreaInput);
            }
          }}
          placeholder={isArabic ? "اكتب اسم المنطقة أو المحافظة..." : "Type area or city name..."}
          className="h-10 flex-1 border border-white/10 bg-[#161616] px-3 text-xs font-bold text-white placeholder:text-white/30 outline-none focus:border-gold"
        />
        <button
          type="button"
          disabled={!newAreaInput.trim()}
          onClick={() => handleAddArea(newAreaInput)}
          className="h-10 px-4 bg-gold font-black text-black text-xs hover:bg-gold/90 transition flex items-center gap-1 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus className="h-4 w-4" />
          {isArabic ? "إضافة" : "Add"}
        </button>
      </div>

      {/* Popular areas suggestions */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-wider text-white/40 mb-2">{isArabic ? "مقترحات سريعة للمناطق:" : "Popular Area Suggestions:"}</p>
        <div className="flex flex-wrap gap-1.5">
          {POPULAR_AREAS.filter((p) => !effectiveAreas.some((a) => a.toLowerCase() === p.toLowerCase())).map((popular) => (
            <button
              key={popular}
              type="button"
              onClick={() => handleAddArea(popular)}
              className="inline-flex items-center gap-1 border border-white/10 bg-[#161616] px-2.5 py-1 text-[11px] font-bold text-white/60 hover:border-gold hover:text-gold transition rounded-full"
            >
              <Plus className="h-3 w-3 text-gold/60" />
              <span>{popular}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
