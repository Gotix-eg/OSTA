"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";

import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  ImagePlus,
  Loader2,
  MapPin,
  Mic,
  ShieldCheck,
  Sparkles,
  Video,
  WandSparkles
} from "lucide-react";

import { serviceCategories } from "@/lib/shared";

import {
  DashboardBlock,
  MiniMetric,
  SoftBadge,
  SoftCard,
  SplitInfo,
  SubpageHero
} from "@/components/dashboard/dashboard-subpage-primitives";
import { postApiData } from "@/lib/api";
import type { Locale } from "@/lib/locales";
import { cn } from "@/lib/utils";

const draftStorageKey = "osta-client-new-request";

type CreatedRequest = {
  id: string;
  requestNumber: string;
  title: string;
  status: string;
  area: string;
  createdAt: string;
  reviewEta: string;
};

type RequestDraft = {
  categoryId: string;
  serviceId: string;
  title: string;
  description: string;
  mediaNotes: string;
  addressMode: "saved" | "new";
  savedAddress: string;
  governorate: string;
  city: string;
  district: string;
  street: string;
  timing: "emergency" | "today" | "tomorrow" | "custom";
  customDate: string;
  customWindow: string;
};

const initialDraft: RequestDraft = {
  categoryId: "",
  serviceId: "",
  title: "",
  description: "",
  mediaNotes: "",
  addressMode: "saved",
  savedAddress: "home-new-cairo",
  governorate: "القاهرة",
  city: "القاهرة الجديدة",
  district: "التجمع الخامس",
  street: "شارع التسعين",
  timing: "today",
  customDate: "",
  customWindow: ""
};

const savedAddresses = [
  { id: "home-new-cairo", ar: "المنزل - القاهرة الجديدة", en: "Home - New Cairo" },
  { id: "villa-maadi", ar: "الفيلا - المعادي", en: "Villa - Maadi" }
];

function usePersistentDraft(key: string) {
  const [draft, setDraft] = useState<RequestDraft>(initialDraft);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const rawValue = window.localStorage.getItem(key);

    if (rawValue) {
      try {
        setDraft(JSON.parse(rawValue) as RequestDraft);
      } catch {
        window.localStorage.removeItem(key);
      }
    }

    setReady(true);
  }, [key]);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(key, JSON.stringify(draft));
  }, [draft, key, ready]);

  return { draft, ready, setDraft };
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-dark-700">{label}</span>
      {children}
    </label>
  );
}

function ProgressRail({ labels, current }: { labels: string[]; current: number }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {labels.map((label, index) => (
        <div key={label} className={cn("rounded-[1.3rem] border p-4 transition", index === current ? "border-dark-950 bg-dark-950 text-white shadow-soft" : index < current ? "border-primary-300 bg-primary-50 text-dark-950" : "border-dark-200 bg-white text-dark-500")}>
          <div className="flex items-center gap-3">
            <div className={cn("flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold", index === current ? "bg-white/10 text-white" : index < current ? "bg-primary-600 text-white" : "bg-surface-soft text-dark-500")}>
              {index + 1}
            </div>
            <span className="font-medium">{label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function formatTiming(locale: Locale, draft: RequestDraft) {
  if (draft.timing === "emergency") return locale === "ar" ? "طوارئ خلال ساعة" : "Emergency within 1 hour";
  if (draft.timing === "today") return locale === "ar" ? "اليوم" : "Today";
  if (draft.timing === "tomorrow") return locale === "ar" ? "غدًا" : "Tomorrow";
  return `${draft.customDate || "-"} ${draft.customWindow || ""}`.trim();
}

export function NewRequestPage({ locale }: { locale: Locale }) {
  const isArabic = locale === "ar";
  const { draft, ready, setDraft } = usePersistentDraft(draftStorageKey);
  const [step, setStep] = useState(0);
  const [submittedRequest, setSubmittedRequest] = useState<CreatedRequest | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedCategory = serviceCategories.find((item) => item.id === draft.categoryId);
  const selectedService = selectedCategory?.services.find((item) => item.id === draft.serviceId);

  const copy = useMemo(
    () => ({
      subtitle: isArabic
        ? "ابنِ الطلب خطوة بخطوة مع حفظ تلقائي ومعاينة مباشرة توضح لك التقدم الحالي."
        : "Build the request through a clearer step-by-step flow with autosave and a live summary rail.",
      title: isArabic ? "طلب جديد" : "New service request",
      action: isArabic ? "إرسال الطلب" : "Submit request",
      next: isArabic ? "التالي" : "Next",
      back: isArabic ? "السابق" : "Back",
      saved: isArabic ? "محفوظ تلقائيًا على هذا الجهاز" : "Auto-saved locally",
      successTitle: isArabic ? "تم تجهيز الطلب" : "Request prepared successfully",
      successBody: isArabic
        ? "تم إرسال المسودة وتحويلها إلى رقم طلب يمكنك متابعته مباشرة."
        : "The draft has been submitted and converted into a request number you can track immediately.",
      successMeta: isArabic ? "رقم الطلب" : "Request number",
      steps: isArabic
        ? ["اختر الخدمة", "صف المشكلة", "عنوان الخدمة", "التوقيت والمراجعة"]
        : ["Choose service", "Describe issue", "Service address", "Timing + review"]
    }),
    [isArabic]
  );

  const canSubmit = Boolean(
    draft.categoryId &&
      draft.serviceId &&
      draft.title.trim().length >= 3 &&
      draft.description.trim().length >= 10 &&
      (draft.addressMode === "saved" ? draft.savedAddress : draft.governorate && draft.city && draft.district && draft.street) &&
      (draft.timing !== "custom" || (draft.customDate && draft.customWindow))
  );

  async function handleSubmit() {
    if (!canSubmit) {
      setSubmitError(isArabic ? "أكمل البيانات المطلوبة قبل الإرسال" : "Complete the required fields before submitting.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const createdRequest = await postApiData<CreatedRequest, Record<string, unknown>>("/clients/requests", {
        categoryId: draft.categoryId,
        serviceId: draft.serviceId,
        title: draft.title,
        description: draft.description,
        mediaNotes: draft.mediaNotes,
        address: {
          mode: draft.addressMode,
          savedAddressId: draft.addressMode === "saved" ? draft.savedAddress : undefined,
          governorate: draft.addressMode === "new" ? draft.governorate : undefined,
          city: draft.addressMode === "new" ? draft.city : undefined,
          district: draft.addressMode === "new" ? draft.district : undefined,
          street: draft.addressMode === "new" ? draft.street : undefined
        },
        timing: {
          type: draft.timing,
          customDate: draft.timing === "custom" ? draft.customDate : undefined,
          customWindow: draft.timing === "custom" ? draft.customWindow : undefined
        }
      });

      window.localStorage.removeItem(draftStorageKey);
      setDraft(initialDraft);
      setSubmittedRequest(createdRequest);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : isArabic ? "فشل إرسال الطلب" : "Failed to submit request.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!ready) {
    return <div className="dashboard-card p-6 text-sm text-dark-500">{isArabic ? "جارٍ تجهيز نموذج الطلب..." : "Preparing request flow..."}</div>;
  }

  if (submittedRequest) {
    return (
      <div>
        <SubpageHero
          eyebrow={isArabic ? "تم الإرسال" : "Request sent"}
          title={copy.successTitle}
          subtitle={copy.successBody}
          actionLabel={isArabic ? "فتح الطلب" : "Open request"}
          actionHref={`/${locale}/client/request/${submittedRequest.id}`}
          tone="accent"
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MiniMetric label={copy.successMeta} value={submittedRequest.requestNumber} note={isArabic ? "معرف المتابعة" : "track id"} icon={ShieldCheck} tone="primary" />
          <MiniMetric label={isArabic ? "الحالة" : "Status"} value={submittedRequest.status} note={isArabic ? "تم الإنشاء الآن" : "freshly created"} icon={CheckCircle2} tone="sun" />
          <MiniMetric label={isArabic ? "المنطقة" : "Area"} value={submittedRequest.area} note={isArabic ? "موقع الخدمة" : "service location"} icon={MapPin} tone="accent" />
          <MiniMetric label={isArabic ? "زمن المراجعة" : "Review ETA"} value={submittedRequest.reviewEta} note={isArabic ? "تسليم التشغبل" : "ops handoff"} icon={Clock3} tone="dark" />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={`/${locale}/client/request/${submittedRequest.id}`} className="rounded-full bg-dark-950 px-5 py-3 text-sm font-semibold text-white shadow-soft">
            {isArabic ? "عرض الطلب" : "Open request"}
          </Link>
          <Link href={`/${locale}/client/my-requests`} className="rounded-full border border-dark-200 bg-white px-5 py-3 text-sm font-semibold text-dark-700 shadow-soft">
            {isArabic ? "كل الطلبات" : "All requests"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SubpageHero eyebrow={copy.saved} title={copy.title} subtitle={copy.subtitle} tone="primary" />

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MiniMetric label={isArabic ? "الخدمة المختارة" : "Chosen service"} value={selectedService?.name[locale] ?? (isArabic ? "لم تُحدد بعد" : "Not yet")} note={isArabic ? "الخطوة 1" : "step 1"} icon={WandSparkles} tone="primary" />
        <MiniMetric label={isArabic ? "عنوان الطلب" : "Request title"} value={draft.title || (isArabic ? "فارغ" : "Empty")} note={isArabic ? "الخطوة 2" : "step 2"} icon={Sparkles} tone="accent" />
        <MiniMetric label={isArabic ? "نوع العنوان" : "Location mode"} value={draft.addressMode === "saved" ? (isArabic ? "محفوظ" : "Saved") : isArabic ? "جديد" : "New"} note={isArabic ? "الخطوة 3" : "step 3"} icon={MapPin} tone="sun" />
        <MiniMetric label={isArabic ? "التوقيت" : "Timing"} value={formatTiming(locale, draft)} note={isArabic ? "الخطوة 4" : "step 4"} icon={Clock3} tone="dark" />
      </div>

      <ProgressRail labels={copy.steps} current={step} />

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <DashboardBlock title={copy.steps[step] ?? copy.title} eyebrow={isArabic ? "بناء الطلب" : "request builder"}>
          {step === 0 ? (
            <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
              <div>
                <h2 className="text-2xl font-semibold text-dark-950">{isArabic ? "اختر الفئة الرئيسية" : "Choose the main category"}</h2>
                <div className="mt-5 grid gap-3">
                  {serviceCategories.map((category, index) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setDraft({ ...draft, categoryId: category.id, serviceId: category.services[0]?.id ?? "" })}
                      className={cn(
                        "rounded-[1.4rem] border p-4 text-start transition",
                        draft.categoryId === category.id
                          ? "border-dark-950 bg-dark-950 text-white shadow-soft"
                          : index % 2 === 0
                            ? "border-dark-200 bg-surface-soft hover:border-primary-200"
                            : "border-dark-200 bg-surface-peach hover:border-primary-200"
                      )}
                    >
                      <p className={cn("text-lg font-semibold", draft.categoryId === category.id ? "text-white" : "text-dark-950")}>{category.name[locale]}</p>
                      <p className={cn("mt-2 text-sm", draft.categoryId === category.id ? "text-white/70" : "text-dark-500")}>{category.description[locale]}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-dark-950">{isArabic ? "الخدمة المحددة" : "Specific service"}</h2>
                <div className="mt-5 grid gap-3">
                  {selectedCategory?.services.length ? (
                    selectedCategory.services.map((service, index) => (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => setDraft({ ...draft, serviceId: service.id })}
                        className={cn(
                          "rounded-[1.4rem] border p-4 text-start transition",
                          draft.serviceId === service.id
                            ? "border-accent-300 bg-accent-50 shadow-soft"
                            : index % 2 === 0
                              ? "border-dark-200 bg-white hover:border-accent-200"
                              : "border-dark-200 bg-surface-soft hover:border-accent-200"
                        )}
                      >
                        <p className="text-lg font-semibold text-dark-950">{service.name[locale]}</p>
                        <p className="mt-2 text-sm text-dark-500">{service.description[locale]}</p>
                      </button>
                    ))
                  ) : (
                    <SoftCard>
                      <p className="text-sm text-dark-500">{isArabic ? "اختر فئة أولًا لإظهار الخدمات المتاحة" : "Choose a category first to reveal the service options."}</p>
                    </SoftCard>
                  )}
                </div>
              </div>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="grid gap-6 xl:grid-cols-[1fr_0.78fr]">
              <div className="space-y-5">
                <Field label={isArabic ? "عنوان مختصر للطلب" : "Short request title"}>
                  <input
                    value={draft.title}
                    onChange={(event) => setDraft({ ...draft, title: event.target.value })}
                    className="h-12 w-full rounded-[1.2rem] border border-dark-200 bg-white px-4"
                    placeholder={isArabic ? "مثال: عطل كهرباء مفاجئ في المطبخ" : "Example: sudden electrical issue in kitchen"}
                  />
                </Field>

                <Field label={isArabic ? "صف المشكلة" : "Describe the issue"}>
                  <textarea
                    rows={7}
                    value={draft.description}
                    onChange={(event) => setDraft({ ...draft, description: event.target.value })}
                    className="w-full rounded-[1.2rem] border border-dark-200 bg-white px-4 py-3"
                    placeholder={isArabic ? "اكتب تفاصيل المشكلة والأعراض الحالية وأي محاولة سابقة للحل" : "Detail the issue, current symptoms, and anything already tried"}
                  />
                </Field>

                <Field label={isArabic ? "ملاحظات الوسائط" : "Media notes"}>
                  <textarea
                    rows={4}
                    value={draft.mediaNotes}
                    onChange={(event) => setDraft({ ...draft, mediaNotes: event.target.value })}
                    className="w-full rounded-[1.2rem] border border-dark-200 bg-white px-4 py-3"
                    placeholder={isArabic ? "ما الذي تنوي إرفاقه؟" : "What are you planning to attach?"}
                  />
                </Field>
              </div>

              <div className="grid gap-4">
                {[
                  { icon: ImagePlus, label: isArabic ? "حتى 5 صور" : "Up to 5 images", tone: "bg-surface-peach" },
                  { icon: Mic, label: isArabic ? "ملاحظة صوتية" : "Voice note", tone: "bg-accent-50" },
                  { icon: Video, label: isArabic ? "فيديو قصير" : "Short video", tone: "bg-surface-soft" }
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <div key={item.label} className={cn("rounded-[1.5rem] border border-dark-200 p-5", item.tone)}>
                      <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-white text-primary-700 shadow-soft">
                        <Icon className="h-5 w-5" />
                      </div>
                      <p className="mt-4 text-lg font-semibold text-dark-950">{item.label}</p>
                      <p className="mt-2 text-sm leading-7 text-dark-500">{isArabic ? "واجهة تمهيدية جاهزة للربط مع نظام رفع الملفات لاحقًا." : "Starter slot ready for real upload integration later."}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  {[
                    { key: "saved", label: isArabic ? "عنوان محفوظ" : "Saved address" },
                    { key: "new", label: isArabic ? "عنوان جديد" : "New address" }
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setDraft({ ...draft, addressMode: item.key as RequestDraft["addressMode"] })}
                      className={cn(
                        "rounded-full px-4 py-2 text-sm font-medium",
                        draft.addressMode === item.key ? "bg-dark-950 text-white shadow-soft" : "bg-surface-soft text-dark-600"
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                {draft.addressMode === "saved" ? (
                  <div className="grid gap-3">
                    {savedAddresses.map((address, index) => (
                      <button
                        key={address.id}
                        type="button"
                        onClick={() => setDraft({ ...draft, savedAddress: address.id })}
                        className={cn(
                          "rounded-[1.4rem] border p-4 text-start transition",
                          draft.savedAddress === address.id
                            ? "border-dark-950 bg-dark-950 text-white shadow-soft"
                            : index % 2 === 0
                              ? "border-dark-200 bg-surface-soft"
                              : "border-dark-200 bg-surface-peach"
                        )}
                      >
                        <p className={cn("font-semibold", draft.savedAddress === address.id ? "text-white" : "text-dark-950")}>{isArabic ? address.ar : address.en}</p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label={isArabic ? "المحافظة" : "Governorate"}>
                      <input value={draft.governorate} onChange={(event) => setDraft({ ...draft, governorate: event.target.value })} className="h-12 w-full rounded-[1.2rem] border border-dark-200 bg-white px-4" />
                    </Field>
                    <Field label={isArabic ? "المدينة" : "City"}>
                      <input value={draft.city} onChange={(event) => setDraft({ ...draft, city: event.target.value })} className="h-12 w-full rounded-[1.2rem] border border-dark-200 bg-white px-4" />
                    </Field>
                    <Field label={isArabic ? "الحي" : "District"}>
                      <input value={draft.district} onChange={(event) => setDraft({ ...draft, district: event.target.value })} className="h-12 w-full rounded-[1.2rem] border border-dark-200 bg-white px-4" />
                    </Field>
                    <Field label={isArabic ? "الشارع" : "Street"}>
                      <input value={draft.street} onChange={(event) => setDraft({ ...draft, street: event.target.value })} className="h-12 w-full rounded-[1.2rem] border border-dark-200 bg-white px-4" />
                    </Field>
                  </div>
                )}
              </div>

              <div className="dashboard-card-soft overflow-hidden p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-white text-primary-700 shadow-soft">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-dark-950">{isArabic ? "معاينة الخريطة" : "Map preview"}</p>
                    <p className="text-sm text-dark-500">{isArabic ? "واجهة تمهيدية لتحديد الموقع ووضع المؤشر لاحقًا" : "Placeholder for geolocation and pin placement"}</p>
                  </div>
                </div>
                <div className="mt-5 flex min-h-80 items-center justify-center rounded-[1.6rem] border border-dashed border-dark-300 bg-white text-sm text-dark-400">
                  {isArabic ? "معاينة المنطقة + موضع المؤشر" : "Area preview + pin position"}
                </div>
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
              <div className="space-y-4">
                {[
                  { key: "emergency", icon: Clock3, label: isArabic ? "طوارئ خلال ساعة" : "Emergency within 1 hour", tone: "bg-surface-peach" },
                  { key: "today", icon: CalendarDays, label: isArabic ? "اليوم" : "Today", tone: "bg-accent-50" },
                  { key: "tomorrow", icon: CalendarDays, label: isArabic ? "غدًا" : "Tomorrow", tone: "bg-surface-soft" },
                  { key: "custom", icon: CalendarDays, label: isArabic ? "موعد مخصص" : "Custom time", tone: "bg-white" }
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setDraft({ ...draft, timing: item.key as RequestDraft["timing"] })}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-[1.4rem] border p-4 text-start transition",
                        draft.timing === item.key ? "border-dark-950 bg-dark-950 text-white shadow-soft" : `border-dark-200 ${item.tone}`
                      )}
                    >
                      <div className={cn("flex h-11 w-11 items-center justify-center rounded-[1rem] shadow-soft", draft.timing === item.key ? "bg-white/10 text-white" : "bg-white text-primary-700")}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="font-medium">{item.label}</span>
                    </button>
                  );
                })}

                {draft.timing === "custom" ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label={isArabic ? "التاريخ" : "Date"}>
                      <input type="date" value={draft.customDate} onChange={(event) => setDraft({ ...draft, customDate: event.target.value })} className="h-12 w-full rounded-[1.2rem] border border-dark-200 bg-white px-4" />
                    </Field>
                    <Field label={isArabic ? "الفترة الزمنية" : "Time window"}>
                      <input value={draft.customWindow} onChange={(event) => setDraft({ ...draft, customWindow: event.target.value })} className="h-12 w-full rounded-[1.2rem] border border-dark-200 bg-white px-4" placeholder="6pm - 8pm" />
                    </Field>
                  </div>
                ) : null}
              </div>

              <DashboardBlock title={isArabic ? "مراجعة سريعة" : "Quick review"} eyebrow={isArabic ? "ملخص الإرسال" : "submission summary"} className="bg-white">
                <div className="grid gap-4">
                  <SoftCard>
                    <p className="text-xs uppercase tracking-[0.22em] text-dark-400">{isArabic ? "الخدمة" : "Service"}</p>
                    <p className="mt-3 text-lg font-semibold text-dark-950">{selectedService?.name[locale] ?? (isArabic ? "غير محدد" : "Not selected")}</p>
                  </SoftCard>
                  <SoftCard>
                    <p className="text-xs uppercase tracking-[0.22em] text-dark-400">{isArabic ? "العنوان" : "Address"}</p>
                    <p className="mt-3 text-sm font-semibold leading-7 text-dark-950">
                      {draft.addressMode === "saved"
                        ? savedAddresses.find((item) => item.id === draft.savedAddress)?.[locale === "ar" ? "ar" : "en"]
                        : `${draft.governorate}, ${draft.city}, ${draft.district}, ${draft.street}`}
                    </p>
                  </SoftCard>
                  <SoftCard>
                    <p className="text-xs uppercase tracking-[0.22em] text-dark-400">{isArabic ? "التوقيت" : "Timing"}</p>
                    <p className="mt-3 text-lg font-semibold text-dark-950">{formatTiming(locale, draft)}</p>
                  </SoftCard>
                  <SplitInfo
                    items={[
                      { label: isArabic ? "طول العنوان" : "Title size", value: String(draft.title.trim().length) },
                      { label: isArabic ? "طول الوصف" : "Description size", value: String(draft.description.trim().length) },
                      { label: isArabic ? "جاهز للإرسال" : "Submit ready", value: canSubmit ? (isArabic ? "نعم" : "Yes") : isArabic ? "لا" : "No" },
                      { label: isArabic ? "الخطوة" : "Step", value: `${step + 1}/4` }
                    ]}
                  />
                </div>
              </DashboardBlock>
            </div>
          ) : null}

          {submitError ? <div className="mt-6 rounded-[1.2rem] border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">{submitError}</div> : null}

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            <button type="button" onClick={() => setStep((current) => Math.max(current - 1, 0))} className="rounded-full border border-dark-200 bg-white px-5 py-3 text-sm font-semibold text-dark-700 shadow-soft">
              {copy.back}
            </button>

            {step < 3 ? (
              <button type="button" onClick={() => setStep((current) => Math.min(current + 1, 3))} className="rounded-full bg-dark-950 px-5 py-3 text-sm font-semibold text-white shadow-soft">
                {copy.next}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-full bg-dark-950 px-5 py-3 text-sm font-semibold text-white shadow-soft disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {copy.action}
              </button>
            )}
          </div>
        </DashboardBlock>

        <div className="space-y-6">
          <DashboardBlock title={isArabic ? "ملخص المسودة" : "Live draft summary"} eyebrow={isArabic ? "ما سيتم إرساله" : "what will be submitted"} dark>
            <div className="space-y-4">
              <SoftCard className="bg-white/5 text-white">
                <p className="text-xs uppercase tracking-[0.22em] text-white/45">{isArabic ? "الخدمة" : "Service"}</p>
                <p className="mt-3 text-lg font-semibold text-white">{selectedService?.name[locale] ?? (isArabic ? "لم تُختر بعد" : "Not chosen")}</p>
              </SoftCard>
              <SoftCard className="bg-white/5 text-white">
                <p className="text-xs uppercase tracking-[0.22em] text-white/45">{isArabic ? "العنوان" : "Headline"}</p>
                <p className="mt-3 text-sm leading-7 text-white/80">{draft.title || (isArabic ? "بانتظار العنوان" : "Waiting for title")}</p>
              </SoftCard>
              <SoftCard className="bg-white/5 text-white">
                <p className="text-xs uppercase tracking-[0.22em] text-white/45">{isArabic ? "التوقيت" : "Timing"}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <SoftBadge label={formatTiming(locale, draft)} tone="accent" />
                  <SoftBadge label={draft.addressMode === "saved" ? (isArabic ? "عنوان محفوظ" : "Saved address") : isArabic ? "عنوان جديد" : "New address"} tone="sun" />
                </div>
              </SoftCard>
            </div>
          </DashboardBlock>

          <DashboardBlock title={isArabic ? "مؤشرات الإرسال" : "Submission signals"} eyebrow={isArabic ? "مسار الجودة" : "quality rail"}>
            <div className="grid gap-4">
              <SoftCard>
                <p className="text-xs uppercase tracking-[0.22em] text-dark-400">{isArabic ? "وضوح الوصف" : "Clarity"}</p>
                <p className="mt-3 text-sm leading-7 text-dark-600">{draft.description.trim().length >= 60 ? (isArabic ? "الوصف الحالي واضح وقوي" : "Description looks strong") : isArabic ? "أضف تفاصيل أكثر لتحسين المطابقة" : "Add more detail for better matching"}</p>
              </SoftCard>
              <SoftCard>
                <p className="text-xs uppercase tracking-[0.22em] text-dark-400">{isArabic ? "جاهزية النموذج" : "Readiness"}</p>
                <p className="mt-3 text-sm leading-7 text-dark-600">{canSubmit ? (isArabic ? "النموذج جاهز للإرسال" : "The form is ready for submit") : isArabic ? "ما زالت هناك حقول ناقصة" : "Some required fields are still missing"}</p>
              </SoftCard>
              <SoftCard>
                <p className="text-xs uppercase tracking-[0.22em] text-dark-400">{isArabic ? "نصيحة تشغيلية" : "Ops hint"}</p>
                <p className="mt-3 text-sm leading-7 text-dark-600">{isArabic ? "اختيار الطوارئ مع عنوان واضح يسرّع المطابقة بشكل ملحوظ." : "Emergency timing plus a clear address usually speeds matching up noticeably."}</p>
              </SoftCard>
            </div>
          </DashboardBlock>
        </div>
      </div>
    </div>
  );
}
