"use client";

import { useEffect, useState } from "react";

import { Save, ShieldCheck, Sparkles, Star, TimerReset, UserCircle2, Wallet } from "lucide-react";

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
import type { Locale } from "@/lib/locales";
import type { WorkerRatingsData, WorkerSettingsData } from "@/lib/operations-data";

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
                <div key={review.id} className={index % 2 === 0 ? "border border-white/10 bg-[#111] p-4" : "border border-[#f5bd18]/30 bg-[#2a2207] p-4"}>
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

export function WorkerSettingsPage({ locale, initialData }: { locale: Locale; initialData: WorkerSettingsData }) {
  const isArabic = locale === "ar";
  const liveData = useLiveApiData("/workers/settings", initialData);
  const [data, setData] = useState(initialData);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setData(liveData);
  }, [liveData]);

  function handleSave() {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
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

  return (
    <WorkerProShell locale={locale}>
      <WorkerProTopStrip locale={locale} title={isArabic ? "الإعدادات" : "Settings"} />
      <WorkerProHero
        locale={locale}
        eyebrow={isArabic ? "إعدادات الفني" : "Worker controls"}
        title={isArabic ? "لوحة" : "Worker"}
        highlight={isArabic ? "التشغيل" : "settings"}
        subtitle={isArabic ? "تحكم في التوفر ووضع الطوارئ ومناطق الخدمة وتفضيلات التحويل." : "Control availability, emergency mode, service areas, and payout preferences."}
        side={
          <div className="border border-white/10 bg-black p-5 text-white shadow-[4px_4px_0_#1d1600]">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden border border-[#f5bd18]/50 bg-[#111] text-[#f5bd18]">
                {(data.profile as any).imageUrl || (data.profile as any).avatarUrl ? (
                  <img src={(data.profile as any).imageUrl || (data.profile as any).avatarUrl} alt={isArabic ? "صورة الفني" : "Worker avatar"} className="h-full w-full object-cover" />
                ) : (
                  <UserCircle2 className="h-10 w-10" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-black text-white">{data.profile.firstName} {data.profile.lastName}</h3>
                <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#f5bd18]">OSTA PRO</p>
              </div>
            </div>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <WorkerProMetric label={isArabic ? "التوفر" : "Availability"} value={safeWorkPreferences.isAvailable ? (isArabic ? "مفعل" : "ON") : isArabic ? "متوقف" : "OFF"} note={isArabic ? "ظهور الطلبات" : "job visibility"} icon={Sparkles} index="01" />
        <WorkerProMetric label={isArabic ? "مناطق الخدمة" : "Service areas"} value={formatNumber(locale, safeWorkPreferences.serviceAreas.length)} note={isArabic ? "نطاق التغطية" : "coverage map"} icon={ShieldCheck} index="02" />
        <WorkerProMetric label={isArabic ? "جدول التحويل" : "Payout"} value={safePayout.schedule || (isArabic ? "غير محدد" : "Unset")} note={isArabic ? "دورة التحويل" : "transfer cycle"} icon={Wallet} index="03" />
      </div>

      {saved ? <div className="border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-black text-emerald-200">{isArabic ? "تم الحفظ محلياً" : "Saved locally"}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <WorkerProPanel title={isArabic ? "الملف الشخصي" : "Profile"} eyebrow={isArabic ? "بيانات الفني" : "worker identity"}>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { key: "firstName", label: isArabic ? "الاسم الأول" : "First name" },
              { key: "lastName", label: isArabic ? "اسم العائلة" : "Last name" },
              { key: "email", label: isArabic ? "البريد الإلكتروني" : "Email" },
              { key: "phone", label: isArabic ? "رقم الهاتف" : "Phone" }
            ].map((field) => (
              <label key={field.key} className="space-y-2">
                <span className="text-sm font-black text-white/45">{field.label}</span>
                <input
                  value={data.profile[field.key as keyof typeof data.profile]}
                  onChange={(event) => setData({ ...data, profile: { ...data.profile, [field.key]: event.target.value } })}
                  className="h-12 w-full border border-white/10 bg-[#111] px-4 text-white outline-none focus:border-[#f5bd18]"
                />
              </label>
            ))}
          </div>
        </WorkerProPanel>

        <WorkerProPanel title={isArabic ? "تفضيلات العمل" : "Work preferences"} eyebrow={isArabic ? "خيارات التشغيل" : "ops toggles"}>
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
                  className="h-5 w-5 accent-[#f5bd18]"
                />
              </label>
            ))}
            <div className="border border-white/10 bg-[#111] p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/35">{isArabic ? "المناطق" : "Areas"}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {safeWorkPreferences.serviceAreas.map((area) => (
                  <WorkerProBadge key={area} tone="gold">{area}</WorkerProBadge>
                ))}
              </div>
            </div>
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

      <div className="flex justify-end">
        <WorkerProAction tone="dark" onClick={handleSave}>
          <Save className="h-4 w-4" />
          {isArabic ? "حفظ" : "Save"}
        </WorkerProAction>
      </div>
    </WorkerProShell>
  );
}
