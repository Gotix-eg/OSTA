"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";

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
  WandSparkles,
  Wrench,
} from "lucide-react";

import { serviceCategories } from "@/lib/shared";

import {
  DashboardBlock,
  MiniMetric,
  SoftBadge,
  SoftCard,
  SplitInfo,
  SubpageHero,
} from "@/components/dashboard/dashboard-subpage-primitives";
import { postApiData } from "@/lib/api";
import type { Locale } from "@/lib/locales";
import { cn } from "@/lib/utils";
import { MapPicker } from "@/components/shared/map-picker";

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
  lat: number;
  lng: number;
  timing: "emergency" | "today" | "tomorrow" | "custom";
  customDate: string;
  customWindow: string;
  images: string[];
  voiceNote?: string;
  videoUrl?: string;
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
  lat: 30.0444,
  lng: 31.2357,
  timing: "today",
  customDate: "",
  customWindow: "",
  images: [],
  voiceNote: undefined,
  videoUrl: undefined,
};

const savedAddresses = [
  {
    id: "home-new-cairo",
    ar: "المنزل - القاهرة الجديدة",
    en: "Home - New Cairo",
  },
  { id: "villa-maadi", ar: "الفيلا - المعادي", en: "Villa - Maadi" },
];

const statusTranslations: Record<string, { ar: string; en: string }> = {
  PENDING: { ar: "قيد الانتظار", en: "Pending" },
  ACCEPTED: { ar: "تم القبول", en: "Accepted" },
  WORKER_EN_ROUTE: { ar: "العامل في الطريق", en: "Worker en route" },
  IN_PROGRESS: { ar: "قيد التنفيذ", en: "In progress" },
  COMPLETED: { ar: "مكتمل", en: "Completed" },
  CANCELLED: { ar: "ملغي", en: "Cancelled" },
};

const reviewEtaTranslations: Record<string, { ar: string; en: string }> = {
  "Within 5 minutes": { ar: "خلال 5 دقائق", en: "Within 5 minutes" },
};

function translateArea(area: string, locale: Locale) {
  const translations: Record<string, { ar: string; en: string }> = {
    "القاهرة": { ar: "القاهرة", en: "Cairo" },
    "Cairo": { ar: "القاهرة", en: "Cairo" },
    "المنطقة": { ar: "المنطقة", en: "District" },
    "District": { ar: "المنطقة", en: "District" },
    "الشارع الرئيسي": { ar: "الشارع الرئيسي", en: "Main Street" },
    "Main Street": { ar: "الشارع الرئيسي", en: "Main Street" },
    "المعادي": { ar: "المعادي", en: "Maadi" },
    "Maadi": { ar: "المعادي", en: "Maadi" },
    "القاهرة الجديدة": { ar: "القاهرة الجديدة", en: "New Cairo" },
    "New Cairo": { ar: "القاهرة الجديدة", en: "New Cairo" },
    "التجمع الخامس": { ar: "التجمع الخامس", en: "Fifth Settlement" },
    "Fifth Settlement": { ar: "التجمع الخامس", en: "Fifth Settlement" },
    "Unknown": { ar: "غير معروف", en: "Unknown" },
    "Pending": { ar: "قيد التحديد", en: "Pending" },
    "قيد التحديد": { ar: "قيد التحديد", en: "Pending" },
  };

  return translations[area]?.[locale] || area;
}

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
      <span className="text-sm font-medium text-onyx-200">{label}</span>
      {children}
    </label>
  );
}

function ProgressRail({
  labels,
  current,
}: {
  labels: string[];
  current: number;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {labels.map((label, index) => (
        <div
          key={label}
          className={cn(
            "rounded-[1.3rem] border p-4 transition",
            index === current
              ? "border-dark-950 bg-dark-950 text-white shadow-soft"
              : index < current
                ? "border-primary-300 bg-primary-50 text-white"
                : "border-onyx-700 bg-onyx-800/50 text-onyx-400",
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold",
                index === current
                  ? "bg-white/10 text-white"
                  : index < current
                    ? "bg-primary-600 text-white"
                    : "bg-onyx-800/50 text-onyx-400",
              )}
            >
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
  if (draft.timing === "emergency")
    return locale === "ar" ? "طوارئ خلال ساعة" : "Emergency within 1 hour";
  if (draft.timing === "today") return locale === "ar" ? "اليوم" : "Today";
  if (draft.timing === "tomorrow") return locale === "ar" ? "غدًا" : "Tomorrow";
  return `${draft.customDate || "-"} ${draft.customWindow || ""}`.trim();
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export function NewRequestPage({ locale }: { locale: Locale }) {
  const isArabic = locale === "ar";
  const searchParams = useSearchParams();
  const workerId = searchParams?.get("workerId");
  const queryCategoryId = searchParams?.get("categoryId");
  const queryServiceId = searchParams?.get("serviceId");

  const { draft, ready, setDraft } = usePersistentDraft(draftStorageKey);
  const [step, setStep] = useState(0);
  const [submittedRequest, setSubmittedRequest] =
    useState<CreatedRequest | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (ready && workerId && queryCategoryId && queryServiceId) {
      setDraft((prev) => ({
        ...prev,
        categoryId: queryCategoryId,
        serviceId: queryServiceId,
      }));
      setStep(1);
    }
  }, [ready, workerId, queryCategoryId, queryServiceId, setDraft]);

  const selectedCategory = serviceCategories.find(
    (item) => item.id === draft.categoryId,
  );
  const selectedService = selectedCategory?.services.find(
    (item) => item.id === draft.serviceId,
  );

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
      successTitle: isArabic
        ? "تم تجهيز الطلب"
        : "Request prepared successfully",
      successBody: isArabic
        ? "تم إرسال المسودة وتحويلها إلى رقم طلب يمكنك متابعته مباشرة."
        : "The draft has been submitted and converted into a request number you can track immediately.",
      successMeta: isArabic ? "رقم الطلب" : "Request number",
      steps: isArabic
        ? ["اختر الخدمة", "صف المشكلة", "عنوان الخدمة", "التوقيت والمراجعة"]
        : [
            "Choose service",
            "Describe issue",
            "Service address",
            "Timing + review",
          ],
    }),
    [isArabic],
  );

  const canSubmit = Boolean(
    draft.categoryId &&
    draft.serviceId &&
    draft.title.trim().length >= 3 &&
    draft.description.trim().length >= 10 &&
    (draft.addressMode === "saved"
      ? draft.savedAddress
      : draft.governorate && draft.city && draft.district && draft.street) &&
    (draft.timing !== "custom" || (draft.customDate && draft.customWindow)),
  );

  async function handleSubmit() {
    if (!canSubmit) {
      setSubmitError(
        isArabic
          ? "أكمل البيانات المطلوبة قبل الإرسال"
          : "Complete the required fields before submitting.",
      );
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const createdRequest = await postApiData<
        CreatedRequest,
        Record<string, unknown>
      >("/clients/requests", {
        categoryId: draft.categoryId,
        serviceId: draft.serviceId,
        title: draft.title,
        description: draft.description,
        mediaNotes: draft.mediaNotes,
        workerId: workerId || undefined,
        address: {
          mode: "new",
          governorate:
            draft.addressMode === "saved" ? "القاهرة" : draft.governorate,
          city: draft.addressMode === "saved" ? "القاهرة" : draft.city,
          district: draft.addressMode === "saved" ? "المنطقة" : draft.district,
          street:
            draft.addressMode === "saved" ? "الشارع الرئيسي" : draft.street,
          lat: draft.addressMode === "saved" ? 30.0444 : draft.lat,
          lng: draft.addressMode === "saved" ? 31.2357 : draft.lng,
        },
        timing: {
          type: draft.timing,
          customDate: draft.timing === "custom" ? draft.customDate : undefined,
          customWindow:
            draft.timing === "custom" ? draft.customWindow : undefined,
        },
        images: draft.images,
        voiceNote: draft.voiceNote,
        videoUrl: draft.videoUrl,
      });

      window.localStorage.removeItem(draftStorageKey);
      setDraft(initialDraft);
      setSubmittedRequest(createdRequest);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : isArabic
            ? "فشل إرسال الطلب"
            : "Failed to submit request.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!ready) {
    return (
      <div className="dashboard-card p-6 text-sm text-onyx-400">
        {isArabic ? "جارٍ تجهيز نموذج الطلب..." : "Preparing request flow..."}
      </div>
    );
  }

  return (
    <div>
      {submittedRequest && (
        <div className="mb-12">
          <SubpageHero
            eyebrow={isArabic ? "تم الإرسال" : "Request sent"}
            title={copy.successTitle}
            subtitle={copy.successBody}
            actionLabel={isArabic ? "فتح الطلب" : "Open request"}
            actionHref={`/${locale}/client/request/${submittedRequest.id}`}
            tone="accent"
          />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MiniMetric
              label={copy.successMeta}
              value={submittedRequest.requestNumber || "-"}
              note={isArabic ? "معرف المتابعة" : "track id"}
              icon={ShieldCheck}
              tone="primary"
            />
            <MiniMetric
              label={isArabic ? "الحالة" : "Status"}
              value={
                statusTranslations[submittedRequest.status]?.[locale] ||
                submittedRequest.status ||
                (isArabic ? "قيد الانتظار" : "Pending")
              }
              note={isArabic ? "تم الإنشاء الآن" : "freshly created"}
              icon={CheckCircle2}
              tone="sun"
            />
            <MiniMetric
              label={isArabic ? "المنطقة" : "Area"}
              value={
                submittedRequest.area
                  ? translateArea(submittedRequest.area, locale)
                  : (isArabic ? "قيد التحديد" : "Pending")
              }
              note={isArabic ? "موقع الخدمة" : "service location"}
              icon={MapPin}
              tone="accent"
            />
            <MiniMetric
              label={isArabic ? "زمن المراجعة" : "Review ETA"}
              value={
                reviewEtaTranslations[submittedRequest.reviewEta]?.[locale] ||
                submittedRequest.reviewEta ||
                (isArabic ? "خلال 5 دقائق" : "Within 5 minutes")
              }
              note={isArabic ? "تسليم التشغيل" : "ops handoff"}
              icon={Clock3}
              tone="dark"
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={`/${locale}/client/request/${submittedRequest.id}`}
              className="rounded-full bg-dark-950 px-5 py-3 text-sm font-semibold text-white shadow-soft"
            >
              {isArabic ? "عرض الطلب" : "Open request"}
            </Link>
            <Link
              href={`/${locale}/client/my-requests`}
              className="rounded-full border border-onyx-700 bg-onyx-800/50 px-5 py-3 text-sm font-semibold text-onyx-200 shadow-soft"
            >
              {isArabic ? "كل الطلبات" : "All requests"}
            </Link>
          </div>
        </div>
      )}

      <div className={submittedRequest ? "hidden" : "block"}>
        <SubpageHero
          eyebrow={copy.saved}
          title={copy.title}
          subtitle={copy.subtitle}
          tone="primary"
        />

        <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MiniMetric
            label={isArabic ? "الخدمة المختارة" : "Chosen service"}
            value={
              selectedService?.name[locale] ??
              (isArabic ? "لم تُحدد بعد" : "Not yet")
            }
            note={isArabic ? "الخطوة 1" : "step 1"}
            icon={WandSparkles}
            tone="primary"
          />
          <MiniMetric
            label={isArabic ? "عنوان الطلب" : "Request title"}
            value={draft.title || (isArabic ? "فارغ" : "Empty")}
            note={isArabic ? "الخطوة 2" : "step 2"}
            icon={Sparkles}
            tone="accent"
          />
          <MiniMetric
            label={isArabic ? "نوع العنوان" : "Location mode"}
            value={
              draft.addressMode === "saved"
                ? isArabic
                  ? "محفوظ"
                  : "Saved"
                : isArabic
                  ? "جديد"
                  : "New"
            }
            note={isArabic ? "الخطوة 3" : "step 3"}
            icon={MapPin}
            tone="sun"
          />
          <MiniMetric
            label={isArabic ? "التوقيت" : "Timing"}
            value={formatTiming(locale, draft)}
            note={isArabic ? "الخطوة 4" : "step 4"}
            icon={Clock3}
            tone="dark"
          />
        </div>

        <ProgressRail labels={copy.steps} current={step} />

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <DashboardBlock
            title={copy.steps[step] ?? copy.title}
            eyebrow={isArabic ? "بناء الطلب" : "request builder"}
          >
            {/* Selected Service Header (Visible in all steps after selection) */}
            {selectedService && (
              <div className="mb-8 flex items-center justify-between rounded-[1.6rem] border border-primary-500/30 bg-primary-500/5 p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 text-white shadow-lg">
                    {selectedCategory?.id === "electricity" && (
                      <WandSparkles className="h-6 w-6" />
                    )}
                    {selectedCategory?.id !== "electricity" && (
                      <Wrench className="h-6 w-6" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-primary-500">
                      {selectedCategory?.name[locale]}
                    </p>
                    <p className="text-xl font-bold text-white">
                      {selectedService.name[locale]}
                    </p>
                  </div>
                </div>
                {step === 0 ? (
                  <button
                    onClick={() => setDraft({ ...draft, serviceId: "" })}
                    className="text-sm font-medium text-onyx-400 hover:text-white underline underline-offset-4"
                  >
                    {isArabic ? "تغيير الخدمة" : "Change Service"}
                  </button>
                ) : (
                  <button
                    onClick={() => setStep(0)}
                    className="text-sm font-medium text-onyx-400 hover:text-white underline underline-offset-4"
                  >
                    {isArabic ? "تعديل" : "Edit"}
                  </button>
                )}
              </div>
            )}

            {step === 0 ? (
              <div className="grid gap-6">
                {!draft.serviceId ? (
                  <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
                    <div>
                      <h2 className="text-2xl font-semibold text-white">
                        {isArabic
                          ? "اختر الفئة الرئيسية"
                          : "Choose the main category"}
                      </h2>
                      <div className="mt-5 grid gap-3">
                        {serviceCategories.map((category, index) => (
                          <button
                            key={category.id}
                            type="button"
                            onClick={() =>
                              setDraft({
                                ...draft,
                                categoryId: category.id,
                                serviceId: category.services[0]?.id ?? "",
                              })
                            }
                            className={cn(
                              "rounded-[1.4rem] border p-4 text-start transition",
                              draft.categoryId === category.id
                                ? "border-dark-950 bg-dark-950 text-white shadow-soft"
                                : index % 2 === 0
                                  ? "border-onyx-700 bg-onyx-800/50 hover:border-primary-200"
                                  : "border-onyx-700 bg-onyx-800/80 hover:border-primary-200",
                            )}
                          >
                            <p
                              className={cn(
                                "text-lg font-semibold",
                                draft.categoryId === category.id
                                  ? "text-white"
                                  : "text-white",
                              )}
                            >
                              {category.name[locale]}
                            </p>
                            <p
                              className={cn(
                                "mt-2 text-sm",
                                draft.categoryId === category.id
                                  ? "text-white/70"
                                  : "text-onyx-400",
                              )}
                            >
                              {category.description[locale]}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h2 className="text-2xl font-semibold text-white">
                        {isArabic ? "الخدمة المحددة" : "Specific service"}
                      </h2>
                      <div className="mt-5 grid gap-3">
                        {selectedCategory?.services.length ? (
                          selectedCategory.services.map((service, index) => (
                            <button
                              key={service.id}
                              type="button"
                              onClick={() =>
                                setDraft({ ...draft, serviceId: service.id })
                              }
                              className={cn(
                                "rounded-[1.4rem] border p-4 text-start transition",
                                draft.serviceId === service.id
                                  ? "border-accent-300 bg-onyx-800/80 shadow-soft"
                                  : index % 2 === 0
                                    ? "border-onyx-700 bg-onyx-800/50 hover:border-accent-200"
                                    : "border-onyx-700 bg-onyx-800/50 hover:border-accent-200",
                              )}
                            >
                              <p className="text-lg font-semibold text-white">
                                {service.name[locale]}
                              </p>
                              <p className="mt-2 text-sm text-onyx-400">
                                {service.description[locale]}
                              </p>
                            </button>
                          ))
                        ) : (
                          <SoftCard>
                            <p className="text-sm text-onyx-400">
                              {isArabic
                                ? "اختر فئة أولًا لإظهار الخدمات المتاحة"
                                : "Choose a category first to reveal the service options."}
                            </p>
                          </SoftCard>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 text-green-500 ring-8 ring-green-500/5">
                      <CheckCircle2 className="h-10 w-10" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">
                      {isArabic ? "تم اختيار الخدمة" : "Service Selected"}
                    </h3>
                    <p className="mt-2 text-onyx-400">
                      {isArabic
                        ? "يمكنك الآن الانتقال للخطوة التالية لتحديد تفاصيل المشكلة"
                        : "You can now proceed to the next step to describe the issue"}
                    </p>
                  </div>
                )}
              </div>
            ) : null}

            {step === 1 ? (
              <div className="grid gap-6 xl:grid-cols-[1fr_0.78fr]">
                <div className="space-y-5">
                  <Field
                    label={
                      isArabic ? "عنوان مختصر للطلب" : "Short request title"
                    }
                  >
                    <input
                      value={draft.title}
                      onChange={(event) =>
                        setDraft({ ...draft, title: event.target.value })
                      }
                      className="h-12 w-full rounded-[1.2rem] border border-onyx-700 bg-onyx-800/50 px-4 text-white placeholder:text-onyx-500"
                      placeholder={
                        isArabic
                          ? "مثال: عطل كهرباء مفاجئ في المطبخ"
                          : "Example: sudden electrical issue in kitchen"
                      }
                    />
                  </Field>

                  <Field label={isArabic ? "صف المشكلة" : "Describe the issue"}>
                    <textarea
                      rows={7}
                      value={draft.description}
                      onChange={(event) =>
                        setDraft({ ...draft, description: event.target.value })
                      }
                      className="w-full rounded-[1.2rem] border border-onyx-700 bg-onyx-800/50 px-4 py-3 text-white placeholder:text-onyx-500"
                      placeholder={
                        isArabic
                          ? "اكتب تفاصيل المشكلة والأعراض الحالية وأي محاولة سابقة للحل"
                          : "Detail the issue, current symptoms, and anything already tried"
                      }
                    />
                  </Field>

                  <Field label={isArabic ? "ملاحظات الوسائط" : "Media notes"}>
                    <textarea
                      rows={4}
                      value={draft.mediaNotes}
                      onChange={(event) =>
                        setDraft({ ...draft, mediaNotes: event.target.value })
                      }
                      className="w-full rounded-[1.2rem] border border-onyx-700 bg-onyx-800/50 px-4 py-3 text-white placeholder:text-onyx-500"
                      placeholder={
                        isArabic
                          ? "ما الذي تنوي إرفاقه؟"
                          : "What are you planning to attach?"
                      }
                    />
                  </Field>
                </div>

                <div className="grid gap-4">
                  {[
                    {
                      id: "images",
                      icon: ImagePlus,
                      label: isArabic ? "حتى 5 صور" : "Up to 5 images",
                      tone: "bg-onyx-800/80",
                      accept: "image/*",
                      multiple: true,
                      value: draft.images.length
                        ? isArabic
                          ? `${draft.images.length} صور مختارة`
                          : `${draft.images.length} images selected`
                        : null,
                    },
                    {
                      id: "voice",
                      icon: Mic,
                      label: isArabic ? "ملاحظة صوتية" : "Voice note",
                      tone: "bg-onyx-800/80",
                      accept: "audio/*",
                      value: draft.voiceNote
                        ? isArabic
                          ? "ملاحظة مسجلة"
                          : "Note recorded"
                        : null,
                    },
                    {
                      id: "video",
                      icon: Video,
                      label: isArabic ? "فيديو قصير" : "Short video",
                      tone: "bg-onyx-800/50",
                      accept: "video/*",
                      value: draft.videoUrl
                        ? isArabic
                          ? "فيديو جاهز"
                          : "Video ready"
                        : null,
                    },
                  ].map((item) => {
                    const Icon = item.icon;

                    return (
                      <div key={item.id}>
                        <label
                          className={cn(
                            "relative cursor-pointer rounded-[1.5rem] border p-5 transition hover:border-primary-300",
                            item.tone,
                            item.value
                              ? "border-primary-500 ring-1 ring-primary-500"
                              : "border-onyx-700",
                          )}
                        >
                          <input
                            type="file"
                            className="hidden"
                            accept={item.accept}
                            multiple={item.multiple}
                            onChange={async (e) => {
                              const files = e.target.files;
                              if (!files?.length) return;

                              try {
                                if (item.id === "images") {
                                  const remainingSlots =
                                    5 - draft.images.length;
                                  if (remainingSlots <= 0) {
                                    e.target.value = "";
                                    return;
                                  }

                                  const newImages = await Promise.all(
                                    Array.from(files)
                                      .slice(0, remainingSlots)
                                      .map(fileToBase64),
                                  );
                                  setDraft({
                                    ...draft,
                                    images: [...draft.images, ...newImages],
                                  });
                                } else if (item.id === "voice" && files[0]) {
                                  const voice = await fileToBase64(files[0]);
                                  setDraft({ ...draft, voiceNote: voice });
                                } else if (item.id === "video" && files[0]) {
                                  const video = await fileToBase64(files[0]);
                                  setDraft({ ...draft, videoUrl: video });
                                }
                              } catch (err) {
                                console.error("File processing error", err);
                              } finally {
                                e.target.value = "";
                              }
                            }}
                          />
                          <div className="flex items-center justify-between">
                            <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-onyx-800/50 text-primary-700 shadow-soft">
                              <Icon className="h-5 w-5" />
                            </div>
                            {item.value && (
                              <div className="rounded-full bg-primary-600 px-3 py-1 text-[10px] font-bold text-white">
                                {item.value}
                              </div>
                            )}
                          </div>
                          <p className="mt-4 text-lg font-semibold text-white">
                            {item.label}
                          </p>

                          <p className="mt-2 text-sm leading-7 text-onyx-400">
                            {item.value
                              ? isArabic
                                ? "تم اختيار الملف بنجاح"
                                : "File selected successfully"
                              : isArabic
                                ? "اضغط هنا لاختيار الملف من جهازك"
                                : "Click here to select a file from your device"}
                          </p>
                        </label>

                        {item.id === "images" && draft.images.length > 0 && (
                          <div className="flex flex-wrap gap-3 p-2">
                            {draft.images.map((img, i) => (
                              <div
                                key={i}
                                className="group relative h-20 w-20 overflow-hidden rounded-[1.2rem] border border-white/10 shadow-lg"
                              >
                                <img
                                  src={img}
                                  alt="preview"
                                  className="h-full w-full object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    setDraft({
                                      ...draft,
                                      images: draft.images.filter(
                                        (_, idx) => idx !== i,
                                      ),
                                    })
                                  }
                                  className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition group-hover:opacity-100"
                                >
                                  <span className="rounded-full bg-red-500/20 p-2 text-xs font-bold text-red-500">
                                    {isArabic ? "حذف" : "Del"}
                                  </span>
                                </button>
                              </div>
                            ))}
                            {draft.images.length < 5 && (
                              <div
                                onClick={() => {
                                  const input = document.querySelector(
                                    'input[accept="image/*"]',
                                  ) as HTMLInputElement;
                                  input?.click();
                                }}
                                className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-[1.2rem] border-2 border-dashed border-onyx-700 bg-onyx-800/30 text-onyx-500 hover:border-primary-500 hover:bg-onyx-800/50"
                              >
                                <ImagePlus className="h-6 w-6" />
                              </div>
                            )}
                          </div>
                        )}
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
                      {
                        key: "saved",
                        label: isArabic ? "عنوان محفوظ" : "Saved address",
                      },
                      {
                        key: "new",
                        label: isArabic ? "عنوان جديد" : "New address",
                      },
                    ].map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() =>
                          setDraft({
                            ...draft,
                            addressMode:
                              item.key as RequestDraft["addressMode"],
                          })
                        }
                        className={cn(
                          "rounded-full px-4 py-2 text-sm font-medium",
                          draft.addressMode === item.key
                            ? "bg-dark-950 text-white shadow-soft"
                            : "bg-onyx-800/50 text-onyx-300",
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
                          onClick={() =>
                            setDraft({ ...draft, savedAddress: address.id })
                          }
                          className={cn(
                            "rounded-[1.4rem] border p-4 text-start transition",
                            draft.savedAddress === address.id
                              ? "border-dark-950 bg-dark-950 text-white shadow-soft"
                              : index % 2 === 0
                                ? "border-onyx-700 bg-onyx-800/50"
                                : "border-onyx-700 bg-onyx-800/80",
                          )}
                        >
                          <p
                            className={cn(
                              "font-semibold",
                              draft.savedAddress === address.id
                                ? "text-white"
                                : "text-white",
                            )}
                          >
                            {isArabic ? address.ar : address.en}
                          </p>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label={isArabic ? "المحافظة" : "Governorate"}>
                        <input
                          value={draft.governorate}
                          onChange={(event) =>
                            setDraft({
                              ...draft,
                              governorate: event.target.value,
                            })
                          }
                          className="h-12 w-full rounded-[1.2rem] border border-onyx-700 bg-onyx-800/50 px-4 text-white"
                        />
                      </Field>
                      <Field label={isArabic ? "المدينة" : "City"}>
                        <input
                          value={draft.city}
                          onChange={(event) =>
                            setDraft({ ...draft, city: event.target.value })
                          }
                          className="h-12 w-full rounded-[1.2rem] border border-onyx-700 bg-onyx-800/50 px-4 text-white"
                        />
                      </Field>
                      <Field label={isArabic ? "الحي" : "District"}>
                        <input
                          value={draft.district}
                          onChange={(event) =>
                            setDraft({ ...draft, district: event.target.value })
                          }
                          className="h-12 w-full rounded-[1.2rem] border border-onyx-700 bg-onyx-800/50 px-4 text-white"
                        />
                      </Field>
                      <Field label={isArabic ? "الشارع" : "Street"}>
                        <input
                          value={draft.street}
                          onChange={(event) =>
                            setDraft({ ...draft, street: event.target.value })
                          }
                          className="h-12 w-full rounded-[1.2rem] border border-onyx-700 bg-onyx-800/50 px-4 text-white"
                        />
                      </Field>
                    </div>
                  )}
                </div>

                <div className="onyx-card overflow-hidden p-5">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-onyx-800/50 text-primary-700 shadow-soft">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-white">
                        {isArabic ? "الموقع على الخريطة" : "Location on map"}
                      </p>
                      <p className="text-sm text-onyx-400">
                        {isArabic
                          ? "ابحث أو حدد موقعك بدقة على الخريطة لسهولة وصول الفني"
                          : "Search or precisely pin your location for easy technician access"}
                      </p>
                    </div>
                  </div>
                  <MapPicker
                    lat={draft.lat || 30.0444}
                    lng={draft.lng || 31.2357}
                    isArabic={isArabic}
                    onChange={(lat, lng, addressDetails) => {
                      setDraft((prev) => {
                        const updates: Partial<RequestDraft> = { lat, lng };

                        // Optionally pre-fill city/governorate if provided by nominatim
                        if (addressDetails) {
                          if (
                            addressDetails.city ||
                            addressDetails.town ||
                            addressDetails.village
                          ) {
                            updates.city =
                              addressDetails.city ||
                              addressDetails.town ||
                              addressDetails.village;
                          }
                          if (addressDetails.state || addressDetails.county) {
                            updates.governorate =
                              addressDetails.state || addressDetails.county;
                          }
                          if (
                            addressDetails.suburb ||
                            addressDetails.neighbourhood
                          ) {
                            updates.district =
                              addressDetails.suburb ||
                              addressDetails.neighbourhood;
                          }
                          if (addressDetails.road) {
                            updates.street = addressDetails.road;
                          }
                        }

                        return { ...prev, ...updates };
                      });
                    }}
                  />
                </div>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                <div className="space-y-4">
                  {[
                    {
                      key: "emergency",
                      icon: Clock3,
                      label: isArabic
                        ? "طوارئ خلال ساعة"
                        : "Emergency within 1 hour",
                      tone: "bg-onyx-800/80",
                    },
                    {
                      key: "today",
                      icon: CalendarDays,
                      label: isArabic ? "اليوم" : "Today",
                      tone: "bg-onyx-800/80",
                    },
                    {
                      key: "tomorrow",
                      icon: CalendarDays,
                      label: isArabic ? "غدًا" : "Tomorrow",
                      tone: "bg-onyx-800/50",
                    },
                    {
                      key: "custom",
                      icon: CalendarDays,
                      label: isArabic ? "موعد مخصص" : "Custom time",
                      tone: "bg-onyx-800/50",
                    },
                  ].map((item) => {
                    const Icon = item.icon;

                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() =>
                          setDraft({
                            ...draft,
                            timing: item.key as RequestDraft["timing"],
                          })
                        }
                        className={cn(
                          "flex w-full items-center gap-3 rounded-[1.4rem] border p-4 text-start transition",
                          draft.timing === item.key
                            ? "border-dark-950 bg-dark-950 text-white shadow-soft"
                            : `border-onyx-700 ${item.tone}`,
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-11 w-11 items-center justify-center rounded-[1rem] shadow-soft",
                            draft.timing === item.key
                              ? "bg-white/10 text-white"
                              : "bg-onyx-800/50 text-primary-700",
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="font-medium">{item.label}</span>
                      </button>
                    );
                  })}

                  {draft.timing === "custom" ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label={isArabic ? "التاريخ" : "Date"}>
                        <input
                          type="date"
                          value={draft.customDate}
                          onChange={(event) =>
                            setDraft({
                              ...draft,
                              customDate: event.target.value,
                            })
                          }
                          className="h-12 w-full rounded-[1.2rem] border border-onyx-700 bg-onyx-800/50 px-4 text-white"
                        />
                      </Field>
                      <Field
                        label={isArabic ? "الفترة الزمنية" : "Time window"}
                      >
                        <input
                          value={draft.customWindow}
                          onChange={(event) =>
                            setDraft({
                              ...draft,
                              customWindow: event.target.value,
                            })
                          }
                          className="h-12 w-full rounded-[1.2rem] border border-onyx-700 bg-onyx-800/50 px-4 text-white"
                          placeholder="6pm - 8pm"
                        />
                      </Field>
                    </div>
                  ) : null}
                </div>

                <DashboardBlock
                  title={isArabic ? "مراجعة سريعة" : "Quick review"}
                  eyebrow={isArabic ? "ملخص الإرسال" : "submission summary"}
                  className="bg-onyx-800/50"
                >
                  <div className="grid gap-4">
                    <SoftCard>
                      <p className="text-xs uppercase tracking-[0.22em] text-onyx-500">
                        {isArabic ? "الخدمة" : "Service"}
                      </p>
                      <p className="mt-3 text-lg font-semibold text-white">
                        {selectedService?.name[locale] ??
                          (isArabic ? "غير محدد" : "Not selected")}
                      </p>
                    </SoftCard>
                    <SoftCard>
                      <p className="text-xs uppercase tracking-[0.22em] text-onyx-500">
                        {isArabic ? "العنوان" : "Address"}
                      </p>
                      <p className="mt-3 text-sm font-semibold leading-7 text-white">
                        {draft.addressMode === "saved"
                          ? savedAddresses.find(
                              (item) => item.id === draft.savedAddress,
                            )?.[locale === "ar" ? "ar" : "en"]
                          : `${draft.governorate}, ${draft.city}, ${draft.district}, ${draft.street}`}
                      </p>
                    </SoftCard>
                    <SoftCard>
                      <p className="text-xs uppercase tracking-[0.22em] text-onyx-500">
                        {isArabic ? "التوقيت" : "Timing"}
                      </p>
                      <p className="mt-3 text-lg font-semibold text-white">
                        {formatTiming(locale, draft)}
                      </p>
                    </SoftCard>
                    <SplitInfo
                      items={[
                        {
                          label: isArabic ? "طول العنوان" : "Title size",
                          value: String(draft.title.trim().length),
                        },
                        {
                          label: isArabic ? "طول الوصف" : "Description size",
                          value: String(draft.description.trim().length),
                        },
                        {
                          label: isArabic ? "جاهز للإرسال" : "Submit ready",
                          value: canSubmit
                            ? isArabic
                              ? "نعم"
                              : "Yes"
                            : isArabic
                              ? "لا"
                              : "No",
                        },
                        {
                          label: isArabic ? "الخطوة" : "Step",
                          value: `${step + 1}/4`,
                        },
                      ]}
                    />
                  </div>
                </DashboardBlock>
              </div>
            ) : null}

            {submitError ? (
              <div className="mt-6 rounded-[1.2rem] border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
                {submitError}
              </div>
            ) : null}

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep((current) => Math.max(current - 1, 0))}
                className="rounded-full border border-onyx-700 bg-onyx-800/50 px-5 py-3 text-sm font-semibold text-onyx-200 shadow-soft"
              >
                {copy.back}
              </button>

              {step < 3 ? (
                <button
                  type="button"
                  onClick={() => setStep((current) => Math.min(current + 1, 3))}
                  className="rounded-full bg-dark-950 px-5 py-3 text-sm font-semibold text-white shadow-soft"
                >
                  {copy.next}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => void handleSubmit()}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-full bg-dark-950 px-5 py-3 text-sm font-semibold text-white shadow-soft disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  {copy.action}
                </button>
              )}
            </div>
          </DashboardBlock>

          <div className="space-y-6">
            <DashboardBlock
              title={isArabic ? "ملخص المسودة" : "Live draft summary"}
              eyebrow={isArabic ? "ما سيتم إرساله" : "what will be submitted"}
              dark
            >
              <div className="space-y-4">
                <SoftCard className="bg-dark-800 text-white">
                  <p className="text-xs uppercase tracking-[0.22em] text-white/50">
                    {isArabic ? "الخدمة" : "Service"}
                  </p>
                  <p className="mt-3 text-lg font-semibold text-white">
                    {selectedService?.name[locale] ??
                      (isArabic ? "لم تُختر بعد" : "Not chosen")}
                  </p>
                </SoftCard>
                <SoftCard className="bg-dark-800 text-white">
                  <p className="text-xs uppercase tracking-[0.22em] text-white/50">
                    {isArabic ? "العنوان" : "Headline"}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-white/90">
                    {draft.title ||
                      (isArabic ? "بانتظار العنوان" : "Waiting for title")}
                  </p>
                </SoftCard>
                <SoftCard className="bg-dark-800 text-white">
                  <p className="text-xs uppercase tracking-[0.22em] text-white/50">
                    {isArabic ? "التوقيت" : "Timing"}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <SoftBadge
                      label={formatTiming(locale, draft)}
                      tone="accent"
                    />
                    <SoftBadge
                      label={
                        draft.addressMode === "saved"
                          ? isArabic
                            ? "عنوان محفوظ"
                            : "Saved address"
                          : isArabic
                            ? "عنوان جديد"
                            : "New address"
                      }
                      tone="sun"
                    />
                    {draft.images.length > 0 && (
                      <SoftBadge
                        label={
                          isArabic
                            ? `${draft.images.length} صور`
                            : `${draft.images.length} images`
                        }
                        tone="primary"
                      />
                    )}
                    {(draft.voiceNote || draft.videoUrl) && (
                      <SoftBadge
                        label={isArabic ? "وسائط متعددة" : "Multimedia"}
                        tone="success"
                      />
                    )}
                  </div>
                </SoftCard>
              </div>
            </DashboardBlock>

            <DashboardBlock
              title={isArabic ? "مؤشرات الإرسال" : "Submission signals"}
              eyebrow={isArabic ? "مسار الجودة" : "quality rail"}
            >
              <div className="grid gap-4">
                <SoftCard>
                  <p className="text-xs uppercase tracking-[0.22em] text-onyx-500">
                    {isArabic ? "وضوح الوصف" : "Clarity"}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-onyx-300">
                    {draft.description.trim().length >= 60
                      ? isArabic
                        ? "الوصف الحالي واضح وقوي"
                        : "Description looks strong"
                      : isArabic
                        ? "أضف تفاصيل أكثر لتحسين المطابقة"
                        : "Add more detail for better matching"}
                  </p>
                </SoftCard>
                <SoftCard>
                  <p className="text-xs uppercase tracking-[0.22em] text-onyx-500">
                    {isArabic ? "جاهزية النموذج" : "Readiness"}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-onyx-300">
                    {canSubmit
                      ? isArabic
                        ? "النموذج جاهز للإرسال"
                        : "The form is ready for submit"
                      : isArabic
                        ? "ما زالت هناك حقول ناقصة"
                        : "Some required fields are still missing"}
                  </p>
                </SoftCard>
                <SoftCard>
                  <p className="text-xs uppercase tracking-[0.22em] text-onyx-500">
                    {isArabic ? "نصيحة تشغيلية" : "Ops hint"}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-onyx-300">
                    {isArabic
                      ? "اختيار الطوارئ مع عنوان واضح يسرّع المطابقة بشكل ملحوظ."
                      : "Emergency timing plus a clear address usually speeds matching up noticeably."}
                  </p>
                </SoftCard>
              </div>
            </DashboardBlock>
          </div>
        </div>
      </div>
    </div>
  );
}
