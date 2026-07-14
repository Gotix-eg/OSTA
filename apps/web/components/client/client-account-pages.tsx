"use client";

import { useEffect, useState } from "react";

import { Bell, CreditCard, Heart, MapPin, Save, ShieldCheck, Sparkles, Wallet } from "lucide-react";

import {
  DashboardBlock,
  EmptyState,
  MiniMetric,
  SoftBadge,
  SoftCard,
  SplitInfo,
  SubpageHero
} from "@/components/dashboard/dashboard-subpage-primitives";
import {
  ClientStitchBadge,
  ClientStitchEmpty,
  ClientStitchHero,
  ClientStitchMetric,
  ClientStitchPanel
} from "@/components/client/client-stitch-ui";
import { useLiveApiData } from "@/hooks/use-live-api-data";
import type { Locale } from "@/lib/locales";
import type { ClientFavoritesData, ClientSettingsData, ClientWalletData } from "@/lib/operations-data";

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
        <ClientStitchMetric label={isArabic ? "متصل الآن" : "Online now"} value={formatNumber(locale, data.summary.onlineNow)} note={isArabic ? "جاهز للحجز" : "ready to book"} icon={Sparkles} />
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
                    <p className="mt-2 text-sm font-bold text-[#f5bd18]">{worker.specialty}</p>
                  </div>
                  <ClientStitchBadge tone={worker.availability === "Online now" ? "gold" : "muted"}>
                    {isArabic ? (worker.availability === "Online now" ? "متصل الآن" : worker.availability === "Available tomorrow" ? "متاح غدًا" : "اليوم 7 مساءً") : worker.availability}
                  </ClientStitchBadge>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {[
                    { label: isArabic ? "التقييم" : "Rating", value: formatNumber(locale, worker.rating) },
                    { label: isArabic ? "الطلبات" : "Jobs", value: formatNumber(locale, worker.completedJobs) },
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
        <h1 className="mt-4 text-5xl font-black leading-none text-[#f5bd18] sm:text-6xl lg:text-7xl">
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
                    <p className={item.amount < 0 ? "text-lg font-black text-red-300" : "text-lg font-black text-[#f5bd18]"}>{formatCurrency(locale, item.amount)}</p>
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

export function ClientSettingsPage({ locale, initialData }: { locale: Locale; initialData: ClientSettingsData }) {
  const isArabic = locale === "ar";
  const liveData = useLiveApiData("/clients/settings", initialData);
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
        eyebrow={isArabic ? "إعدادات العميل" : "Client controls"}
        title={isArabic ? "الإعدادات" : "Settings"}
        subtitle={
          isArabic
            ? "تحكم في الملف الشخصي والإشعارات واللغة والعناوين من لوحة أوضح وأكثر هدوءًا."
            : "Control profile, notifications, language, and address preferences from a cleaner account panel."
        }
        tone="dark"
      />

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <MiniMetric label={isArabic ? "اللغة" : "Language"} value={data.preferences.language.toUpperCase()} note={isArabic ? "اللغة الحالية" : "active locale"} icon={Bell} tone="accent" />
        <MiniMetric label={isArabic ? "العناوين المحفوظة" : "Saved addresses"} value={formatNumber(locale, data.addresses.length)} note={isArabic ? "نقاط الوصول" : "delivery anchors"} icon={MapPin} tone="sun" />
        <MiniMetric label={isArabic ? "حالة التواصل" : "Contact state"} value={data.preferences.notificationsBySms ? (isArabic ? "رسائل مفعلة" : "SMS on") : isArabic ? "رسائل متوقفة" : "SMS off"} note={isArabic ? "تفضيلات الإشعارات" : "notification rail"} icon={Save} tone="primary" />
      </div>

      {saved ? <div className="mb-4 rounded-[1.2rem] border border-success/20 bg-success/10 px-4 py-3 text-sm text-success">{isArabic ? "تم الحفظ محليًا" : "Saved locally"}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <DashboardBlock title={isArabic ? "الملف الشخصي" : "Profile"} eyebrow={isArabic ? "بيانات الهوية" : "identity data"}>
          <div className="grid gap-6 sm:grid-cols-2">
            <label className="space-y-3">
              <span className="text-caption">{isArabic ? "الاسم الأول" : "First name"}</span>
              <input value={data.profile.firstName} onChange={(event) => setData({ ...data, profile: { ...data.profile, firstName: event.target.value } })} className="h-14 w-full rounded-2xl border border-white/5 bg-white/5 px-5 text-white focus:border-gold-500/30 focus:bg-white/10" />
            </label>
            <label className="space-y-3">
              <span className="text-caption">{isArabic ? "اسم العائلة" : "Last name"}</span>
              <input value={data.profile.lastName} onChange={(event) => setData({ ...data, profile: { ...data.profile, lastName: event.target.value } })} className="h-14 w-full rounded-2xl border border-white/5 bg-white/5 px-5 text-white focus:border-gold-500/30 focus:bg-white/10" />
            </label>
            <label className="space-y-3">
              <span className="text-caption">{isArabic ? "البريد الإلكتروني" : "Email"}</span>
              <input value={data.profile.email} onChange={(event) => setData({ ...data, profile: { ...data.profile, email: event.target.value } })} className="h-14 w-full rounded-2xl border border-white/5 bg-white/5 px-5 text-white focus:border-gold-500/30 focus:bg-white/10" />
            </label>
            <label className="space-y-3">
              <span className="text-caption">{isArabic ? "رقم الهاتف" : "Phone"}</span>
              <input value={data.profile.phone} onChange={(event) => setData({ ...data, profile: { ...data.profile, phone: event.target.value } })} className="h-14 w-full rounded-2xl border border-white/5 bg-white/5 px-5 text-white focus:border-gold-500/30 focus:bg-white/10" />
            </label>
          </div>
        </DashboardBlock>

        <DashboardBlock title={isArabic ? "التفضيلات" : "Preferences"} eyebrow={isArabic ? "إعدادات الإشعارات" : "signal controls"}>
          <div className="grid gap-3">
            {[
              { key: "notificationsBySms", label: isArabic ? "إشعارات الرسائل" : "SMS notifications" },
              { key: "notificationsByEmail", label: isArabic ? "إشعارات البريد" : "Email notifications" },
              { key: "marketingUpdates", label: isArabic ? "العروض التسويقية" : "Marketing updates" }
            ].map((item) => (
              <label key={item.key} className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-white/5 bg-white/5 p-5 transition-all hover:bg-white/10">
                <span className="text-sm font-bold text-white/80">{item.label}</span>
                <input
                  type="checkbox"
                  checked={data.preferences[item.key as keyof typeof data.preferences] as boolean}
                  onChange={(event) => setData({ ...data, preferences: { ...data.preferences, [item.key]: event.target.checked } })}
                  className="h-5 w-5 rounded-lg border-white/20 bg-white/5 text-gold-500 focus:ring-gold-500/50"
                />
              </label>
            ))}
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
