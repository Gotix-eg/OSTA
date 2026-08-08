"use client";

import { useEffect, useMemo, useState, type ComponentType, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";

import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  ImagePlus,
  Loader2,
  MapPin,
  Menu,
  Mic,
  ShieldCheck,
  Sparkles,
  Video,
  WandSparkles,
  Wrench,
} from "lucide-react";

import dynamic from "next/dynamic";

import { serviceCategories } from "@/lib/shared";

import { postApiData } from "@/lib/api";
import type { Locale } from "@/lib/locales";
import { cn } from "@/lib/utils";

const MapPicker = dynamic(() => import("@/components/shared/map-picker").then((m) => m.MapPicker), { ssr: false });

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
  governorate: "",
  city: "",
  district: "",
  street: "",
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

function useEphemeralDraft() {
  const [draft, setDraft] = useState<RequestDraft>(initialDraft);
  return { draft, ready: true, setDraft };
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-bold text-white/75">{label}</span>
      {children}
    </label>
  );
}

function ObsidianBlock({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("border border-white/10 bg-black text-white shadow-[4px_4px_0_#000]", className)}>
      {children}
    </div>
  );
}

function DashboardBlock({
  title,
  eyebrow,
  children,
  className,
}: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
  className?: string;
  dark?: boolean;
}) {
  return (
    <ObsidianBlock className={cn("p-6", className)}>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          {eyebrow && (
            <p className="mb-1 text-xs font-black uppercase tracking-[0.05em] text-gold">
              {eyebrow}
            </p>
          )}
          <h2 className="text-2xl font-black text-white md:text-3xl">{title}</h2>
        </div>
      </div>
      {children}
    </ObsidianBlock>
  );
}

function SubpageHero({
  eyebrow,
  title,
  subtitle,
  actionLabel,
  actionHref,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  actionLabel?: string;
  actionHref?: string;
  tone?: string;
}) {
  return (
    <ObsidianBlock className="relative mb-6 overflow-hidden p-6 md:p-8">
      <div className="relative z-10 max-w-3xl">
        <span className="mb-2 inline-block bg-gold px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-black">
          {eyebrow}
        </span>
        <h1 className="text-4xl font-black leading-none text-white md:text-7xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm font-semibold leading-7 text-white/55 md:text-base">
          {subtitle}
        </p>
        {actionHref && actionLabel && (
          <Link href={actionHref} className="mt-6 inline-flex bg-white px-6 py-3 text-sm font-black text-black shadow-[4px_4px_0_#f5bd18]">
            {actionLabel}
          </Link>
        )}
      </div>
      <Wrench className="absolute -bottom-8 -end-8 h-36 w-36 text-gold/10" />
    </ObsidianBlock>
  );
}

function MiniMetric({
  label,
  value,
  note,
  icon: Icon,
}: {
  label: string;
  value: string;
  note?: string;
  icon: ComponentType<{ className?: string }>;
  tone?: string;
}) {
  return (
    <ObsidianBlock className="flex min-h-32 flex-col items-center justify-center gap-2 p-4 text-center">
      <Icon className="h-6 w-6 text-gold" />
      <p className="text-[10px] font-black uppercase tracking-[0.08em] text-white/45">{note}</p>
      <p className="text-sm font-black text-white">{label}</p>
      <p className="max-w-full truncate text-xs font-bold text-gold">{value}</p>
    </ObsidianBlock>
  );
}

function SoftCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("border border-white/10 bg-[#121212] p-4 text-white", className)}>
      {children}
    </div>
  );
}

function SoftBadge({ label }: { label: string; tone?: string }) {
  return (
    <span className="inline-flex bg-gold/15 px-2 py-1 text-[10px] font-black text-gold">
      {label}
    </span>
  );
}

function SplitInfo({
  items,
}: {
  items: Array<{ label: string; value: string }>;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <SoftCard key={item.label}>
          <p className="text-[10px] font-black uppercase tracking-[0.08em] text-white/45">{item.label}</p>
          <p className="mt-2 text-lg font-black text-white">{item.value}</p>
        </SoftCard>
      ))}
    </div>
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
    <div className="grid grid-cols-4 gap-2 md:gap-4">
      {labels.map((label, index) => (
        <div
          key={label}
          className={cn(
            "flex flex-col items-center justify-center gap-2 border-b-2 pb-3 text-center transition md:border md:p-4",
            index === current
              ? "border-gold text-black md:bg-black md:text-white"
              : index < current
                ? "border-black/40 text-black md:bg-black/80 md:text-white"
                : "border-black/10 text-black/45 md:bg-black/10",
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center text-sm font-black",
                index === current
                  ? "bg-gold text-black"
                  : index < current
                    ? "bg-black text-gold"
                    : "border border-black/10 bg-black/10 text-black/45",
              )}
            >
              {index + 1}
            </div>
            <span className="hidden text-sm font-black md:inline">{label}</span>
          </div>
          <span className="text-[11px] font-black md:hidden">{label.split(" ")[0]}</span>
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

  const { draft, ready, setDraft } = useEphemeralDraft();
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
        ? "ابنِ الطلب خطوة بخطوة مع معاينة مباشرة توضح لك التقدم الحالي."
        : "Build the request through a clearer step-by-step flow with a live summary rail.",
      title: isArabic ? "طلب جديد" : "New service request",
      action: isArabic ? "إرسال الطلب" : "Submit request",
      next: isArabic ? "التالي" : "Next",
      back: isArabic ? "السابق" : "Back",
      saved: isArabic ? "بياناتك لا تُحفظ على هذا الجهاز" : "Your draft is not saved on this device",
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
      <div className="-m-4 min-h-screen bg-gold p-6 text-sm font-bold text-black sm:-m-6 lg:-m-8">
        {isArabic ? "جارٍ تجهيز نموذج الطلب..." : "Preparing request flow..."}
      </div>
    );
  }

  return (
    <div className="-m-4 min-h-screen bg-gold pb-24 text-black sm:-m-6 lg:-m-8">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-black/80 px-4 text-gold backdrop-blur-md lg:hidden">
        <div className="flex items-center gap-3">
          <button type="button" className="flex h-10 w-10 items-center justify-center">
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-xl font-black uppercase tracking-[0.02em]">OSTA</span>
        </div>
        <div className="h-8 w-8 rounded-full border border-gold/30 bg-white/10" />
      </header>

      <div className="mx-auto max-w-[1280px] px-4 py-6 md:px-8 md:py-10">
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

        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
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

        <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_340px] xl:items-start">
          <DashboardBlock
            title={copy.steps[step] ?? copy.title}
            eyebrow={isArabic ? "بناء الطلب" : "request builder"}
          >
            {/* Selected Service Header (Visible in all steps after selection) */}
            {selectedService && (
              <div className="mb-8 flex items-center justify-between border border-gold/35 bg-gold/10 p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center bg-gold text-black">
                    {selectedCategory?.id === "electricity" && (
                      <WandSparkles className="h-6 w-6" />
                    )}
                    {selectedCategory?.id !== "electricity" && (
                      <Wrench className="h-6 w-6" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.08em] text-gold">
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
                    className="text-sm font-black text-white/45 underline underline-offset-4 hover:text-white"
                  >
                    {isArabic ? "تغيير الخدمة" : "Change Service"}
                  </button>
                ) : (
                  <button
                    onClick={() => setStep(0)}
                    className="text-sm font-black text-white/45 underline underline-offset-4 hover:text-white"
                  >
                    {isArabic ? "تعديل" : "Edit"}
                  </button>
                )}
              </div>
            )}

            {step === 0 ? (
              <div className="grid gap-6">
                  <div className="grid gap-6">
                    <div>
                      <h2 className="text-2xl font-black text-white">
                        {isArabic
                          ? "اختر الفئة الرئيسية"
                          : "Choose the main category"}
                      </h2>
                      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                              "min-h-36 border p-4 text-start transition active:scale-95",
                              draft.categoryId === category.id
                                ? "border-gold/70 bg-gold/10 text-white"
                                : index % 2 === 0
                                  ? "border-white/10 bg-[#121212] hover:border-gold/60"
                                  : "border-white/10 bg-[#171717] hover:border-gold/60",
                            )}
                          >
                            <div className={cn("mb-3 flex h-10 w-10 items-center justify-center", draft.categoryId === category.id ? "bg-gold text-black" : "bg-gold/15 text-gold")}>
                              <Wrench className="h-5 w-5" />
                            </div>
                            <p
                              className={cn(
                                "text-lg font-black",
                                draft.categoryId === category.id
                                  ? "text-white"
                                  : "text-white",
                              )}
                            >
                              {category.name[locale]}
                            </p>
                            <p
                              className={cn(
                                "mt-2 line-clamp-2 text-xs font-semibold leading-5",
                                draft.categoryId === category.id
                                  ? "text-white/70"
                                  : "text-white/45",
                              )}
                            >
                              {category.description[locale]}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h2 className="text-2xl font-black text-white">
                        {isArabic ? "الخدمة المحددة" : "Specific service"}
                      </h2>
                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        {selectedCategory?.services.length ? (
                          selectedCategory.services.map((service, index) => (
                            <button
                              key={service.id}
                              type="button"
                              onClick={() =>
                                setDraft({ ...draft, serviceId: service.id })
                              }
                              className={cn(
                                "border p-4 text-start transition active:scale-95",
                                draft.serviceId === service.id
                                  ? "border-gold/70 bg-gold/10"
                                  : index % 2 === 0
                                    ? "border-white/10 bg-[#121212] hover:border-gold/60"
                                    : "border-white/10 bg-[#171717] hover:border-gold/60",
                              )}
                            >
                              <p className="text-lg font-black text-white">
                                {service.name[locale]}
                              </p>
                              <p className="mt-2 text-sm font-semibold leading-6 text-white/45">
                                {service.description[locale]}
                              </p>
                            </button>
                          ))
                        ) : (
                          <SoftCard>
                            <p className="text-sm font-semibold text-white/45">
                              {isArabic
                                ? "اختر فئة أولًا لإظهار الخدمات المتاحة"
                                : "Choose a category first to reveal the service options."}
                            </p>
                          </SoftCard>
                        )}
                      </div>
                    </div>
                  </div>
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
                      className="h-12 w-full border border-white/10 bg-[#121212] px-4 text-sm font-semibold text-white placeholder:text-white/25 outline-none transition focus:border-gold"
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
                      className="w-full border border-white/10 bg-[#121212] px-4 py-3 text-sm font-semibold text-white placeholder:text-white/25 outline-none transition focus:border-gold"
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
                      className="w-full border border-white/10 bg-[#121212] px-4 py-3 text-sm font-semibold text-white placeholder:text-white/25 outline-none transition focus:border-gold"
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
                      tone: "bg-[#121212]",
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
                      tone: "bg-[#121212]",
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
                      tone: "bg-[#171717]",
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
                            "relative block cursor-pointer border p-5 transition hover:border-gold/70 active:scale-[0.98]",
                            item.tone,
                            item.value
                              ? "border-gold bg-gold/10"
                              : "border-white/10",
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
                            <div className="flex h-12 w-12 items-center justify-center bg-gold/15 text-gold">
                              <Icon className="h-5 w-5" />
                            </div>
                            {item.value && (
                              <div className="bg-gold px-3 py-1 text-[10px] font-black text-black">
                                {item.value}
                              </div>
                            )}
                          </div>
                          <p className="mt-4 text-lg font-black text-white">
                            {item.label}
                          </p>

                          <p className="mt-2 text-sm font-semibold leading-7 text-white/45">
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
                                className="group relative h-20 w-20 overflow-hidden border border-white/10"
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
                                  <span className="bg-red-500/20 p-2 text-xs font-bold text-red-300">
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
                                className="flex h-20 w-20 cursor-pointer items-center justify-center border-2 border-dashed border-white/15 bg-[#121212] text-white/35 hover:border-gold hover:text-gold"
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
                          "border px-5 py-3 text-sm font-black transition active:scale-95",
                          draft.addressMode === item.key
                            ? "border-gold bg-gold text-black shadow-[3px_3px_0_#000]"
                            : "border-white/10 bg-[#121212] text-white/55 hover:border-gold/60 hover:text-white",
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
                            "border p-4 text-start transition active:scale-[0.98]",
                            draft.savedAddress === address.id
                              ? "border-gold bg-gold/10 text-white"
                              : index % 2 === 0
                                ? "border-white/10 bg-[#121212] hover:border-gold/60"
                                : "border-white/10 bg-[#171717] hover:border-gold/60",
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
                          className="h-12 w-full border border-white/10 bg-[#121212] px-4 text-sm font-semibold text-white outline-none transition focus:border-gold"
                        />
                      </Field>
                      <Field label={isArabic ? "المدينة" : "City"}>
                        <input
                          value={draft.city}
                          onChange={(event) =>
                            setDraft({ ...draft, city: event.target.value })
                          }
                          className="h-12 w-full border border-white/10 bg-[#121212] px-4 text-sm font-semibold text-white outline-none transition focus:border-gold"
                        />
                      </Field>
                      <Field label={isArabic ? "الحي" : "District"}>
                        <input
                          value={draft.district}
                          onChange={(event) =>
                            setDraft({ ...draft, district: event.target.value })
                          }
                          className="h-12 w-full border border-white/10 bg-[#121212] px-4 text-sm font-semibold text-white outline-none transition focus:border-gold"
                        />
                      </Field>
                      <Field label={isArabic ? "الشارع" : "Street"}>
                        <input
                          value={draft.street}
                          onChange={(event) =>
                            setDraft({ ...draft, street: event.target.value })
                          }
                          className="h-12 w-full border border-white/10 bg-[#121212] px-4 text-sm font-semibold text-white outline-none transition focus:border-gold"
                        />
                      </Field>
                    </div>
                  )}
                </div>

                <div className="overflow-hidden border border-white/10 bg-black p-5 text-white shadow-[4px_4px_0_#000]">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex h-12 w-12 items-center justify-center bg-gold/15 text-gold">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-lg font-black text-white">
                        {isArabic ? "الموقع على الخريطة" : "Location on map"}
                      </p>
                      <p className="text-sm font-semibold text-white/45">
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
                      tone: "bg-[#121212]",
                    },
                    {
                      key: "today",
                      icon: CalendarDays,
                      label: isArabic ? "اليوم" : "Today",
                      tone: "bg-[#121212]",
                    },
                    {
                      key: "tomorrow",
                      icon: CalendarDays,
                      label: isArabic ? "غدًا" : "Tomorrow",
                      tone: "bg-[#171717]",
                    },
                    {
                      key: "custom",
                      icon: CalendarDays,
                      label: isArabic ? "موعد مخصص" : "Custom time",
                      tone: "bg-[#171717]",
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
                          "flex w-full items-center gap-3 border p-4 text-start transition active:scale-[0.98]",
                          draft.timing === item.key
                            ? "border-gold bg-gold/10 text-white"
                            : `border-white/10 ${item.tone} text-white/65 hover:border-gold/60 hover:text-white`,
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-11 w-11 items-center justify-center",
                            draft.timing === item.key
                              ? "bg-gold text-black"
                              : "bg-gold/15 text-gold",
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
                          className="h-12 w-full border border-white/10 bg-[#121212] px-4 text-sm font-semibold text-white outline-none transition focus:border-gold"
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
                          className="h-12 w-full border border-white/10 bg-[#121212] px-4 text-sm font-semibold text-white placeholder:text-white/25 outline-none transition focus:border-gold"
                          placeholder={isArabic ? "٦ مساءً - ٨ مساءً" : "6pm - 8pm"}
                        />
                      </Field>
                    </div>
                  ) : null}
                </div>

                <DashboardBlock
                  title={isArabic ? "مراجعة سريعة" : "Quick review"}
                  eyebrow={isArabic ? "ملخص الإرسال" : "submission summary"}
                  className="bg-black"
                >
                  <div className="grid gap-4">
                    <SoftCard>
                      <p className="text-[10px] font-black uppercase tracking-[0.08em] text-white/45">
                        {isArabic ? "الخدمة" : "Service"}
                      </p>
                      <p className="mt-3 text-lg font-black text-white">
                        {selectedService?.name[locale] ??
                          (isArabic ? "غير محدد" : "Not selected")}
                      </p>
                    </SoftCard>
                    <SoftCard>
                      <p className="text-[10px] font-black uppercase tracking-[0.08em] text-white/45">
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
                      <p className="text-[10px] font-black uppercase tracking-[0.08em] text-white/45">
                        {isArabic ? "التوقيت" : "Timing"}
                      </p>
                      <p className="mt-3 text-lg font-black text-white">
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
              <div className="mt-6 border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm font-semibold text-red-200">
                {submitError}
              </div>
            ) : null}

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep((current) => Math.max(current - 1, 0))}
                className="border border-white/10 bg-[#121212] px-6 py-3 text-sm font-black text-white/70 transition hover:border-gold/60 hover:text-white disabled:opacity-40"
              >
                {copy.back}
              </button>

              {step < 3 ? (
                <button
                  type="button"
                  onClick={() => setStep((current) => Math.min(current + 1, 3))}
                  className="bg-white px-8 py-3 text-sm font-black text-black shadow-[4px_4px_0_#f5bd18] transition active:translate-x-1 active:translate-y-1 active:shadow-none"
                >
                  {copy.next}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => void handleSubmit()}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 bg-white px-8 py-3 text-sm font-black text-black shadow-[4px_4px_0_#f5bd18] transition active:translate-x-1 active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  {copy.action}
                </button>
              )}
            </div>
          </DashboardBlock>

          <div className="space-y-6 xl:sticky xl:top-6">
            <DashboardBlock
              title={isArabic ? "ملخص المسودة" : "Live draft summary"}
              eyebrow={isArabic ? "ما سيتم إرساله" : "what will be submitted"}
              dark
            >
              <div className="space-y-4">
                <SoftCard>
                  <p className="text-[10px] font-black uppercase tracking-[0.08em] text-white/45">
                    {isArabic ? "الخدمة" : "Service"}
                  </p>
                  <p className="mt-3 text-lg font-black text-white">
                    {selectedService?.name[locale] ??
                      (isArabic ? "لم تُختر بعد" : "Not chosen")}
                  </p>
                </SoftCard>
                <SoftCard>
                  <p className="text-[10px] font-black uppercase tracking-[0.08em] text-white/45">
                    {isArabic ? "العنوان" : "Headline"}
                  </p>
                  <p className="mt-3 text-sm font-semibold leading-7 text-white/75">
                    {draft.title ||
                      (isArabic ? "بانتظار العنوان" : "Waiting for title")}
                  </p>
                </SoftCard>
                <SoftCard>
                  <p className="text-[10px] font-black uppercase tracking-[0.08em] text-white/45">
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
                  <p className="text-[10px] font-black uppercase tracking-[0.08em] text-white/45">
                    {isArabic ? "وضوح الوصف" : "Clarity"}
                  </p>
                  <p className="mt-3 text-sm font-semibold leading-7 text-white/60">
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
                  <p className="text-[10px] font-black uppercase tracking-[0.08em] text-white/45">
                    {isArabic ? "جاهزية النموذج" : "Readiness"}
                  </p>
                  <p className="mt-3 text-sm font-semibold leading-7 text-white/60">
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
                  <p className="text-[10px] font-black uppercase tracking-[0.08em] text-white/45">
                    {isArabic ? "نصيحة تشغيلية" : "Ops hint"}
                  </p>
                  <p className="mt-3 text-sm font-semibold leading-7 text-white/60">
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
    </div>
  );
}
