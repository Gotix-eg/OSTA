"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronRight, Users, ClipboardList, MessageSquare, Calendar, MapPin } from "lucide-react";
import type { Locale } from "@/lib/locales";
import type { ServiceCategory } from "@/lib/shared";
import { cn } from "@/lib/utils";

// ── Job type options per category ────────────────────────────────────────────

const categoryOptions: Record<string, { ar: string; en: string }[]> = {
  electrical: [
    { ar: "مساعدة طارئة (انقطاع كهرباء / شورت)", en: "Emergency help (outage / short circuit)" },
    { ar: "تركيب وتمديد كهرباء جديد", en: "New electrical installation & wiring" },
    { ar: "إصلاح أعطال كهربائية", en: "Repair electrical faults" },
    { ar: "فك وإزالة فقط (بدون تركيب)", en: "Removal only (no installation)" },
    { ar: "أحتاج فني كهرباء بشكل دوري", en: "Need a regular electrician" },
  ],
  plumbing: [
    { ar: "تسريب أو انسداد طارئ", en: "Emergency leak or blockage" },
    { ar: "تركيب حنفية أو دش أو سخان", en: "Install faucet, shower, or water heater" },
    { ar: "إصلاح مواسير أو ضغط مياه", en: "Repair pipes or water pressure" },
    { ar: "صيانة دورية للسباكة", en: "Routine plumbing maintenance" },
    { ar: "نقل تغذية أو توزيع مياه", en: "Relocate or redistribute water supply" },
  ],
  carpentry: [
    { ar: "تفصيل خزانة أو رف أو مطبخ", en: "Custom wardrobe, shelf, or kitchen" },
    { ar: "إصلاح أبواب أو أثاث", en: "Repair doors or furniture" },
    { ar: "تركيب أثاث جاهز", en: "Assemble ready-made furniture" },
    { ar: "صيانة وترميم خشبي", en: "Wood restoration & maintenance" },
  ],
  painting: [
    { ar: "دهان داخلي شامل للشقة", en: "Full interior painting" },
    { ar: "دهان غرفة واحدة أو جزء منها", en: "Single room or partial paint" },
    { ar: "إصلاح تشققات أو رطوبة ودهان", en: "Crack & damp repair + repaint" },
    { ar: "دهان خارجي أو واجهة", en: "Exterior or façade painting" },
  ],
  "ac-appliances": [
    { ar: "صيانة وكشف أعطال تكييف", en: "AC diagnostics & maintenance" },
    { ar: "تركيب تكييف جديد", en: "Install a new AC unit" },
    { ar: "إصلاح جهاز منزلي (ثلاجة / غسالة / إلخ)", en: "Repair home appliance (fridge / washer / etc.)" },
    { ar: "تنظيف وغسيل تكييف", en: "AC deep cleaning" },
  ],
  "aluminum-welding": [
    { ar: "تركيب شبابيك ألومنيوم", en: "Install aluminum windows" },
    { ar: "تركيب أبواب ألومنيوم أو حديد", en: "Install aluminum or iron doors" },
    { ar: "إصلاح وصيانة شبابيك أو أبواب", en: "Repair & maintain windows or doors" },
    { ar: "أعمال لحام خفيفة", en: "Light welding work" },
  ],
  "general-services": [
    { ar: "نقل وترحيل أثاث", en: "Furniture moving & relocation" },
    { ar: "تركيب وتجميع", en: "Assembly & installation" },
    { ar: "مهام منزلية متعددة", en: "General household chores" },
    { ar: "صيانة خفيفة عامة", en: "Light general maintenance" },
  ],
};

const whenOptions = [
  { ar: "في أقرب وقت ممكن (طارئ)", en: "As soon as possible (urgent)", icon: "🚨" },
  { ar: "خلال يوم أو يومين", en: "Within 1-2 days", icon: "📅" },
  { ar: "هذا الأسبوع", en: "This week", icon: "🗓️" },
  { ar: "وقت مناسب (مرن)", en: "Flexible timing", icon: "💬" },
];

const areaOptions = [
  { ar: "القاهرة الجديدة", en: "New Cairo" },
  { ar: "مدينة نصر", en: "Nasr City" },
  { ar: "المعادي", en: "Maadi" },
  { ar: "6 أكتوبر", en: "6th of October" },
  { ar: "الإسكندرية", en: "Alexandria" },
  { ar: "الزمالك", en: "Zamalek" },
  { ar: "الشيخ زايد", en: "Sheikh Zayed" },
  { ar: "التجمع الخامس", en: "New Cairo 5th Settlement" },
];

type Step = "job-type" | "timing" | "location";

interface WizardState {
  jobType: string;
  timing: string;
  area: string;
}

export function ServiceWizard({ locale, category }: { locale: Locale; category: ServiceCategory }) {
  const router = useRouter();
  const isArabic = locale === "ar";
  const dir = isArabic ? "rtl" : "ltr";

  const [step, setStep] = useState<Step>("job-type");
  const [state, setState] = useState<WizardState>({ jobType: "", timing: "", area: "" });

  const options = categoryOptions[category.slug] ?? [];

  const steps: { key: Step; label: { ar: string; en: string }; icon: typeof ClipboardList }[] = [
    { key: "job-type", label: { ar: "نوع الشغل", en: "Job Type" }, icon: ClipboardList },
    { key: "timing",   label: { ar: "الموعد المناسب", en: "Preferred Time" }, icon: Calendar },
    { key: "location", label: { ar: "موقعك", en: "Your Area" }, icon: MapPin },
  ];

  const stepIndex = steps.findIndex((s) => s.key === step);
  const progress = Math.round(((stepIndex + 1) / steps.length) * 100);

  const canContinue =
    step === "job-type" ? !!state.jobType :
    step === "timing"   ? !!state.timing :
    !!state.area;

  function handleContinue() {
    if (step === "job-type") setStep("timing");
    else if (step === "timing") setStep("location");
    else router.push(`/${locale}/register/client`);
  }

  function handleBack() {
    if (step === "timing") setStep("job-type");
    else if (step === "location") setStep("timing");
    else router.push(`/${locale}`);
  }

  return (
    <div className="min-h-screen bg-[#F2F4F7]" dir={dir}>
      
      {/* ── Top Nav ── */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
          <Link href={`/${locale}`} className="flex items-center gap-2 text-gray-900">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-900 text-sm font-semibold text-white">O</div>
            <span className="hidden text-lg font-semibold tracking-widest sm:block">OSTA</span>
          </Link>
          <ChevronRight className={cn("h-4 w-4 text-gray-400", isArabic && "rotate-180")} />
          <span className="text-sm text-gray-600">{category.name[locale]}</span>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">

          {/* ── Sidebar ── */}
          <aside className="space-y-3">
            {/* Category title */}
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h1 className="text-xl font-semibold text-gray-900">{category.name[locale]}</h1>
              <p className="mt-1 text-sm text-gray-400">{category.description[locale]}</p>
            </div>

            {/* Progress steps */}
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="space-y-1">
                {steps.map((s, i) => {
                  const done = i < stepIndex;
                  const active = s.key === step;
                  const Icon = s.icon;
                  return (
                    <div key={s.key} className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                      active && "bg-primary-50 text-primary-700 font-medium",
                      done && "text-green-600",
                      !active && !done && "text-gray-400"
                    )}>
                      {done
                        ? <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                        : <Icon className="h-4 w-4 shrink-0" />
                      }
                      <span>{s.label[locale]}</span>
                      {active && (
                        <span className="ms-auto text-xs text-primary-500">{progress}%</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Progress bar */}
              <div className="mt-4 h-1.5 rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-primary-500 transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>

            {/* Specialists count */}
            <div className="flex items-center gap-3 rounded-2xl bg-white p-5 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50">
                <Users className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900">{category.workersAvailable.toLocaleString()}+</p>
                <p className="text-xs text-gray-400">{isArabic ? "فني متاح في منطقتك" : "pros available near you"}</p>
              </div>
            </div>
          </aside>

          {/* ── Wizard Card ── */}
          <main>
            <AnimatePresence mode="wait">
              <motion.div key={step}
                initial={{ opacity: 0, x: isArabic ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isArabic ? 20 : -20 }}
                transition={{ duration: 0.25 }}
                className="rounded-2xl bg-white p-6 shadow-sm sm:p-8"
              >
                {/* Step: Job Type */}
                {step === "job-type" && (
                  <>
                    <h2 className="mb-6 text-2xl font-semibold text-gray-900">
                      {isArabic ? "إيه اللي تحتاجه بالظبط؟" : "What do you need help with?"}
                    </h2>
                    <div className="space-y-3">
                      {options.map((opt) => {
                        const label = opt[locale];
                        const selected = state.jobType === label;
                        return (
                          <button key={label} type="button"
                            onClick={() => setState((s) => ({ ...s, jobType: label }))}
                            className={cn(
                              "flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-start text-sm transition",
                              selected
                                ? "border-primary-400 bg-primary-50 text-primary-700 font-medium"
                                : "border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                            )}
                          >
                            <div className={cn(
                              "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition",
                              selected ? "border-primary-500 bg-primary-500" : "border-gray-300"
                            )}>
                              {selected && <div className="h-2 w-2 rounded-full bg-white" />}
                            </div>
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* Step: Timing */}
                {step === "timing" && (
                  <>
                    <h2 className="mb-6 text-2xl font-semibold text-gray-900">
                      {isArabic ? "إمتى تحتاج الفني؟" : "When do you need the pro?"}
                    </h2>
                    <div className="space-y-3">
                      {whenOptions.map((opt) => {
                        const label = opt[locale];
                        const selected = state.timing === label;
                        return (
                          <button key={label} type="button"
                            onClick={() => setState((s) => ({ ...s, timing: label }))}
                            className={cn(
                              "flex w-full items-center gap-4 rounded-xl border px-4 py-3.5 text-start text-sm transition",
                              selected
                                ? "border-primary-400 bg-primary-50 text-primary-700 font-medium"
                                : "border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                            )}
                          >
                            <span className="text-xl">{opt.icon}</span>
                            <div className={cn(
                              "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition",
                              selected ? "border-primary-500 bg-primary-500" : "border-gray-300"
                            )}>
                              {selected && <div className="h-2 w-2 rounded-full bg-white" />}
                            </div>
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* Step: Location */}
                {step === "location" && (
                  <>
                    <h2 className="mb-2 text-2xl font-semibold text-gray-900">
                      {isArabic ? "إنت فين بالظبط؟" : "Where are you located?"}
                    </h2>
                    <p className="mb-6 text-sm text-gray-400">
                      {isArabic ? "هنوصل ليك أقرب فني في منطقتك" : "We'll match you with the nearest available pro"}
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {areaOptions.map((opt) => {
                        const label = opt[locale];
                        const selected = state.area === label;
                        return (
                          <button key={label} type="button"
                            onClick={() => setState((s) => ({ ...s, area: label }))}
                            className={cn(
                              "flex items-center gap-3 rounded-xl border px-4 py-3.5 text-sm transition",
                              selected
                                ? "border-primary-400 bg-primary-50 text-primary-700 font-medium"
                                : "border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                            )}
                          >
                            <div className={cn(
                              "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition",
                              selected ? "border-primary-500 bg-primary-500" : "border-gray-300"
                            )}>
                              {selected && <div className="h-2 w-2 rounded-full bg-white" />}
                            </div>
                            <MapPin className="h-4 w-4 shrink-0 text-gray-400" />
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* Buttons */}
                <div className={cn("mt-8 flex items-center gap-3", isArabic ? "flex-row-reverse justify-end" : "")}>
                  <button type="button" onClick={handleBack}
                    className="flex items-center gap-2 rounded-xl border border-gray-200 px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
                    {isArabic ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
                    {isArabic ? "السابق" : "Back"}
                  </button>
                  <button type="button" onClick={handleContinue} disabled={!canContinue}
                    className={cn(
                      "flex items-center gap-2 rounded-xl px-8 py-3 text-sm font-semibold text-white transition",
                      canContinue
                        ? "bg-primary-600 hover:bg-primary-700"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    )}>
                    {step === "location"
                      ? (isArabic ? "ابحث عن فني 🎉" : "Find a Pro 🎉")
                      : (isArabic ? "التالي" : "Continue")}
                    {step !== "location" && (isArabic ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />)}
                  </button>
                </div>

                {/* Summary of selections */}
                {(state.jobType || state.timing) && (
                  <div className="mt-6 rounded-xl bg-gray-50 p-4 text-sm">
                    <p className="font-medium text-gray-700 mb-2">{isArabic ? "اختياراتك حتى الآن:" : "Your selections so far:"}</p>
                    <div className="space-y-1 text-gray-500">
                      {state.jobType && <p>✓ {state.jobType}</p>}
                      {state.timing && <p>✓ {state.timing}</p>}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}
