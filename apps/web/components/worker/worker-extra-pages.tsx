"use client";

import { useEffect, useState } from "react";

import { Save, ShieldCheck, Sparkles, Star, TimerReset, Wallet } from "lucide-react";

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
    <div>
      <SubpageHero
        eyebrow={isArabic ? "السمعة المهنية" : "Reputation rail"}
        title={isArabic ? "التقييمات" : "Ratings"}
        subtitle={
          isArabic
            ? "تابع آراء العملاء والشارات ومؤشرات الثقة من طبقة جودة أوضح وأقوى."
            : "Track client feedback, earned badges, and trust signals from a richer quality layer."
        }
        tone="accent"
      />

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MiniMetric label={isArabic ? "التقييم العام" : "Overall"} value={formatNumber(locale, data.summary.overallRating)} note={isArabic ? "المؤشر الرئيسي" : "headline rating"} icon={Star} tone="dark" />
        <MiniMetric label={isArabic ? "عدد المراجعات" : "Reviews"} value={formatNumber(locale, data.summary.totalReviews)} note={isArabic ? "إجمالي الآراء" : "total feedback"} icon={Sparkles} tone="accent" />
        <MiniMetric label={isArabic ? "العملاء المتكررون" : "Repeat clients"} value={`${formatNumber(locale, data.summary.repeatClientsRate)}%`} note={isArabic ? "معدل الولاء" : "loyalty rate"} icon={TimerReset} tone="sun" />
        <MiniMetric label={isArabic ? "خمس نجوم" : "Five stars"} value={formatNumber(locale, data.summary.fiveStars)} note={isArabic ? "إشارة ثقة قوية" : "premium signal"} icon={ShieldCheck} tone="primary" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <DashboardBlock title={isArabic ? "الشارات المكتسبة" : "Earned badges"} eyebrow={isArabic ? "علامات الثقة" : "trust marks"}>
          <div className="flex flex-wrap gap-3">
            {data.badges.map((badge, index) => (
              <SoftBadge key={badge} label={badge} tone={index % 3 === 0 ? "accent" : index % 3 === 1 ? "sun" : "primary"} />
            ))}
          </div>
        </DashboardBlock>

        <DashboardBlock title={isArabic ? "أحدث المراجعات" : "Recent reviews"} eyebrow={isArabic ? "صوت العميل" : "client voice"}>
          {data.reviews.length === 0 ? (
            <EmptyState>{isArabic ? "لا توجد مراجعات بعد" : "No reviews yet"}</EmptyState>
          ) : (
            <div className="grid gap-4">
              {data.reviews.map((review, index) => (
                <div key={review.id} className={index % 2 === 0 ? "onyx-card p-4" : "onyx-card bg-onyx-800/80 p-4"}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-white">{review.clientName}</p>
                      <p className="mt-1 text-sm text-onyx-400">{review.service}</p>
                    </div>
                    <SoftBadge label={isArabic ? `${review.rating} نجوم` : `${review.rating} stars`} tone={review.rating === 5 ? "success" : "sun"} />
                  </div>
                  <p className="mt-4 text-sm leading-7 text-onyx-300">{review.comment}</p>
                  <p className="mt-3 text-xs uppercase tracking-[0.18em] text-onyx-500">{formatDate(locale, review.createdAt)}</p>
                </div>
              ))}
            </div>
          )}
        </DashboardBlock>
      </div>
    </div>
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

  return (
    <div>
      <SubpageHero
        eyebrow={isArabic ? "إعدادات العامل" : "Worker controls"}
        title={isArabic ? "الإعدادات" : "Settings"}
        subtitle={
          isArabic
            ? "تحكم في التوفر ووضع الطوارئ ومناطق الخدمة وتفضيلات التحويل من لوحة أوضح."
            : "Control availability, emergency mode, service areas, and payout preferences from a cleaner control panel."
        }
        tone="dark"
      />

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <MiniMetric label={isArabic ? "التوفر" : "Availability"} value={data.workPreferences.isAvailable ? (isArabic ? "مفعل" : "ON") : isArabic ? "متوقف" : "OFF"} note={isArabic ? "ظهور الطلبات" : "job visibility"} icon={Sparkles} tone="accent" />
        <MiniMetric label={isArabic ? "مناطق الخدمة" : "Service areas"} value={formatNumber(locale, data.workPreferences.serviceAreas.length)} note={isArabic ? "نطاق التغطية" : "coverage map"} icon={ShieldCheck} tone="sun" />
        <MiniMetric label={isArabic ? "جدول التحويل" : "Payout"} value={data.payout.schedule} note={isArabic ? "دورة التحويل" : "transfer cycle"} icon={Wallet} tone="primary" />
      </div>

      {saved ? <div className="mb-4 rounded-[1.2rem] border border-success/20 bg-success/10 px-4 py-3 text-sm text-success">{isArabic ? "تم الحفظ محليًا" : "Saved locally"}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <DashboardBlock title={isArabic ? "الملف الشخصي" : "Profile"} eyebrow={isArabic ? "بيانات العامل" : "worker identity"}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2"><span className="text-sm text-onyx-400">{isArabic ? "الاسم الأول" : "First name"}</span><input value={data.profile.firstName} onChange={(event) => setData({ ...data, profile: { ...data.profile, firstName: event.target.value } })} className="h-12 w-full rounded-[1rem] border border-onyx-700 bg-onyx-800/50 px-4" /></label>
            <label className="space-y-2"><span className="text-sm text-onyx-400">{isArabic ? "اسم العائلة" : "Last name"}</span><input value={data.profile.lastName} onChange={(event) => setData({ ...data, profile: { ...data.profile, lastName: event.target.value } })} className="h-12 w-full rounded-[1rem] border border-onyx-700 bg-onyx-800/50 px-4" /></label>
            <label className="space-y-2"><span className="text-sm text-onyx-400">{isArabic ? "البريد الإلكتروني" : "Email"}</span><input value={data.profile.email} onChange={(event) => setData({ ...data, profile: { ...data.profile, email: event.target.value } })} className="h-12 w-full rounded-[1rem] border border-onyx-700 bg-onyx-800/50 px-4" /></label>
            <label className="space-y-2"><span className="text-sm text-onyx-400">{isArabic ? "رقم الهاتف" : "Phone"}</span><input value={data.profile.phone} onChange={(event) => setData({ ...data, profile: { ...data.profile, phone: event.target.value } })} className="h-12 w-full rounded-[1rem] border border-onyx-700 bg-onyx-800/50 px-4" /></label>
          </div>
        </DashboardBlock>

        <DashboardBlock title={isArabic ? "تفضيلات العمل" : "Work preferences"} eyebrow={isArabic ? "خيارات التشغيل" : "ops toggles"}>
          <div className="grid gap-4">
            {[
              { key: "isAvailable", label: isArabic ? "متاح للطلبات" : "Available for jobs" },
              { key: "acceptsEmergency", label: isArabic ? "يقبل الطوارئ" : "Accept emergency" },
              { key: "acceptsSameDay", label: isArabic ? "يقبل نفس اليوم" : "Accept same-day" }
            ].map((item) => (
              <label key={item.key} className="onyx-card flex items-center justify-between gap-4 p-4">
                <span className="font-medium text-white">{item.label}</span>
                <input
                  type="checkbox"
                  checked={data.workPreferences[item.key as keyof typeof data.workPreferences] as boolean}
                  onChange={(event) => setData({ ...data, workPreferences: { ...data.workPreferences, [item.key]: event.target.checked } })}
                  className="h-4 w-4"
                />
              </label>
            ))}
            <SoftCard>
              <p className="text-xs uppercase tracking-[0.22em] text-onyx-500">{isArabic ? "المناطق" : "Areas"}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {data.workPreferences.serviceAreas.map((area) => (
                  <SoftBadge key={area} label={area} tone="accent" />
                ))}
              </div>
            </SoftCard>
            <SplitInfo
              items={[
                { label: isArabic ? "الوسيلة" : "Method", value: data.payout.method },
                { label: isArabic ? "الجدول" : "Schedule", value: data.payout.schedule },
                { label: isArabic ? "البنك" : "Bank", value: data.payout.bankLabel }
              ]}
            />
          </div>
        </DashboardBlock>
      </div>

      <div className="mt-6 flex justify-end">
        <button type="button" onClick={handleSave} className="inline-flex items-center gap-2 rounded-full bg-dark-950 px-5 py-3 text-sm font-semibold text-white shadow-soft">
          <Save className="h-4 w-4" />
          {isArabic ? "حفظ" : "Save"}
        </button>
      </div>
    </div>
  );
}
