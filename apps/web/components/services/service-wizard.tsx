"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  ChevronRight, 
  Users, 
  ClipboardList, 
  Calendar, 
  MapPin,
  Sparkles,
  ShieldCheck,
  Zap,
  Hammer,
  Waves,
  Snowflake,
  Wrench,
  Paintbrush,
  Monitor,
  Camera,
  Network
} from "lucide-react";
import type { Locale } from "@/lib/locales";
import type { ServiceCategory } from "@/lib/shared";
import { cn } from "@/lib/utils";
import { egyptianGovernorates } from "@/lib/geo-data";

// ── Job type options per category ────────────────────────────────────────────

const categoryOptions: Record<string, { ar: string; en: string }[]> = {
  carpentry: [
    { ar: "تفصيل خزانة أو رف أو مطبخ", en: "Custom wardrobe, shelf, or kitchen" },
    { ar: "إصلاح أبواب أو أثاث", en: "Repair doors or furniture" },
    { ar: "تركيب أثاث جاهز (ايكيا وغيرها)", en: "Assemble ready-made furniture (IKEA etc)" },
    { ar: "تغيير كوالين ومفصلات", en: "Change locks and hinges" },
    { ar: "صيانة وترميم خشبي", en: "Wood restoration & maintenance" },
  ],
  plumbing: [
    { ar: "تسريب أو انسداد طارئ", en: "Emergency leak or blockage" },
    { ar: "تركيب حنفية أو دش أو سخان", en: "Install faucet, shower, or water heater" },
    { ar: "إصلاح مواسير أو ضغط مياه", en: "Repair pipes or water pressure" },
    { ar: "تأسيس سباكة حمام أو مطبخ", en: "New bathroom/kitchen plumbing setup" },
    { ar: "صيانة فلاتر مياه", en: "Water filter maintenance" },
  ],
  electrical: [
    { ar: "مساعدة طارئة (انقطاع كهرباء / قفلة)", en: "Emergency help (outage / short circuit)" },
    { ar: "تركيب وتمديد كهرباء جديد", en: "New electrical installation & wiring" },
    { ar: "تركيب نجف ووحدات إضاءة", en: "Install chandeliers & lighting units" },
    { ar: "إصلاح برايز ومفاتيح", en: "Repair sockets and switches" },
    { ar: "تأسيس لوحات كهرباء", en: "Main board installation" },
  ],
  "ac-technician": [
    { ar: "صيانة وكشف أعطال تكييف", en: "AC diagnostics & maintenance" },
    { ar: "تركيب تكييف جديد أو فك ونقل", en: "Install new AC or relocate" },
    { ar: "تنظيف وغسيل تكييف", en: "AC deep cleaning" },
    { ar: "شحن فريون", en: "Refrigerant/Freon refill" },
  ],
  "home-appliances": [
    { ar: "إصلاح غسالة (أوتوماتيك / فوق أوتوماتيك)", en: "Repair washer (Auto / Top-load)" },
    { ar: "إصلاح ثلاجة أو ديب فريزر", en: "Repair fridge or deep freezer" },
    { ar: "إصلاح بوتاجاز أو فرن", en: "Repair stove or oven" },
    { ar: "إصلاح سخان غاز أو كهرباء", en: "Repair gas or electric heater" },
    { ar: "صيانة ميكروويف أو أجهزة صغيرة", en: "Microwave or small appliance repair" },
  ],
  painting: [
    { ar: "دهان داخلي شامل للشقة", en: "Full interior painting" },
    { ar: "دهان غرفة واحدة أو جزء منها", en: "Single room or partial paint" },
    { ar: "إصلاح تشققات أو رطوبة ودهان", en: "Crack & damp repair + repaint" },
    { ar: "دهان أبواب وشبابيك", en: "Door and window painting" },
    { ar: "تركيب ورق حائط", en: "Wallpaper installation" },
  ],
  aluminum: [
    { ar: "تركيب شبابيك ألوميتال", en: "Install aluminum windows" },
    { ar: "تصميم وتركيب مطابخ ألوميتال", en: "Design & install aluminum kitchens" },
    { ar: "إصلاح وصيانة شبابيك أو أبواب", en: "Repair & maintain windows or doors" },
    { ar: "تغيير سلك شبابيك", en: "Change window screens/mesh" },
  ],
  "computer-networks": [
    { ar: "تأسيس شبكة وايرلس (WiFi) منزلية", en: "Setup home WiFi network" },
    { ar: "تركيب وتمديد كابلات إنترنت (Cat6)", en: "Install & route internet cables" },
    { ar: "تقوية إشارة الواي فاي (Extenders)", en: "WiFi signal boosting" },
    { ar: "تأسيس شبكات مكاتب وشركات", en: "Office/Business network setup" },
  ],
  "computer-repair": [
    { ar: "صيانة سوفتوير (ويندوز / تعريفات)", en: "Software maintenance (Windows / Drivers)" },
    { ar: "إصلاح أعطال هاردوير (شاشة / رامات)", en: "Hardware repair (Screen / RAM)" },
    { ar: "تنظيف اللاب توب وتغيير المعجون", en: "Laptop cleaning & thermal paste" },
    { ar: "استعادة بيانات مفقودة", en: "Data recovery" },
  ],
  "camera-installation": [
    { ar: "تركيب نظام كاميرات مراقبة كامل", en: "Install full CCTV system" },
    { ar: "إضافة كاميرات لنظام موجود", en: "Add cameras to existing system" },
    { ar: "صيانة كاميرات أو جهاز التسجيل (DVR)", en: "Maintain cameras or DVR/NVR" },
    { ar: "ربط الكاميرات بالموبايل", en: "Connect cameras to mobile app" },
  ],
};

const whenOptions = [
  { ar: "في أقرب وقت ممكن (طارئ)", en: "As soon as possible (urgent)", icon: "🚨" },
  { ar: "خلال يوم أو يومين", en: "Within 1-2 days", icon: "📅" },
  { ar: "هذا الأسبوع", en: "This week", icon: "🗓️" },
  { ar: "وقت مناسب (مرن)", en: "Flexible timing", icon: "💬" },
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

  const steps: { key: Step; label: { ar: string; en: string }; icon: any }[] = [
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
    else router.push(`/${locale}/services`);
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]" dir={dir}>
      
      {/* ── Premium Gradient Header ── */}
      <header className="sticky top-0 z-40 border-b border-gray-200/50 bg-onyx-800/50/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Link href={`/${locale}`} className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-900 text-white shadow-lg ring-4 ring-gray-900/5">
                <Sparkles className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-900 sm:block">OSTA</span>
            </Link>
            <div className="h-6 w-px bg-gray-200" />
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">{category.name[locale]}</span>
              <ShieldCheck className="h-4 w-4 text-primary-500" />
            </div>
          </div>
          
          <div className="hidden items-center gap-4 sm:flex">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              {isArabic ? "فنيون متاحون الآن" : "PROS ONLINE NOW"}
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[300px_1fr]">

          {/* ── Sidebar ── */}
          <aside className="space-y-4">
            {/* Category title */}
            <div className="relative overflow-hidden rounded-[2rem] bg-onyx-800/50 p-6 shadow-xl shadow-gray-200/50 border border-gray-100">
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary-50/50" />
              <h1 className="relative text-2xl font-bold text-gray-900">{category.name[locale]}</h1>
              <p className="relative mt-2 text-sm leading-relaxed text-gray-500">{category.description[locale]}</p>
            </div>

            {/* Progress steps */}
            <div className="rounded-[2rem] bg-onyx-800/50 p-6 shadow-xl shadow-gray-200/50 border border-gray-100">
              <div className="space-y-2">
                {steps.map((s, i) => {
                  const done = i < stepIndex;
                  const active = s.key === step;
                  const Icon = s.icon;
                  return (
                    <div key={s.key} className={cn(
                      "group flex items-center gap-4 rounded-2xl px-4 py-3 text-sm transition-all duration-300",
                      active && "bg-gray-900 text-white shadow-lg shadow-gray-900/20 font-medium scale-[1.02]",
                      done && "text-green-600 bg-green-50/50",
                      !active && !done && "text-gray-400 hover:bg-gray-50"
                    )}>
                      <div className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-xl transition-colors",
                        active ? "bg-onyx-800/50/20" : done ? "bg-green-100" : "bg-gray-100"
                      )}>
                        {done
                          ? <CheckCircle2 className="h-4 w-4 shrink-0" />
                          : <Icon className="h-4 w-4 shrink-0" />
                        }
                      </div>
                      <span>{s.label[locale]}</span>
                    </div>
                  );
                })}
              </div>

              {/* Progress bar */}
              <div className="mt-6 flex flex-col gap-2">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  <span>{isArabic ? "التقدم" : "PROGRESS"}</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full rounded-full bg-gray-900" 
                  />
                </div>
              </div>
            </div>

            {/* Trust Banner */}
            <div className="rounded-[2rem] bg-gradient-to-br from-primary-600 to-primary-700 p-6 text-white shadow-xl shadow-primary-200">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-onyx-800/50/20">
                  <Users className="h-5 w-5" />
                </div>
                <p className="text-xl font-bold">{category.workersAvailable.toLocaleString()}+</p>
              </div>
              <p className="mt-2 text-xs font-medium text-primary-100">
                {isArabic ? "فني موثق وجاهز لخدمتك في منطقتك" : "Verified pros ready in your area"}
              </p>
            </div>
          </aside>

          {/* ── Wizard Card ── */}
          <main>
            <AnimatePresence mode="wait">
              <motion.div key={step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: "circOut" }}
                className="rounded-[2.5rem] bg-onyx-800/50 p-8 shadow-2xl shadow-gray-200/40 border border-gray-100 sm:p-12"
              >
                {/* Step: Job Type */}
                {step === "job-type" && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                        {isArabic ? "إيه اللي محتاجه بالظبط؟" : "What do you need help with?"}
                      </h2>
                      <p className="mt-3 text-lg text-gray-500">
                        {isArabic ? "حدد نوع المهمة عشان نختار لك أنسب متخصص" : "Pick a task so we can find the right specialist"}
                      </p>
                    </div>
                    
                    <div className="grid gap-4 sm:grid-cols-1">
                      {options.map((opt) => {
                        const label = opt[locale];
                        const selected = state.jobType === label;
                        return (
                          <button key={label} type="button"
                            onClick={() => setState((s) => ({ ...s, jobType: label }))}
                            className={cn(
                              "group relative flex w-full items-center gap-4 rounded-3xl border-2 px-6 py-5 text-start transition-all duration-300",
                              selected
                                ? "border-gray-900 bg-gray-900 text-white shadow-xl shadow-gray-900/20"
                                : "border-gray-100 bg-onyx-800/50 text-gray-700 hover:border-gray-300 hover:bg-gray-50/50"
                            )}
                          >
                            <div className={cn(
                              "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                              selected ? "border-white bg-onyx-800/50" : "border-gray-200 group-hover:border-gray-400"
                            )}>
                              {selected && <div className="h-2.5 w-2.5 rounded-full bg-gray-900" />}
                            </div>
                            <span className="text-lg font-medium">{label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Step: Timing */}
                {step === "timing" && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                        {isArabic ? "إمتى تحتاج الفني؟" : "When do you need the pro?"}
                      </h2>
                      <p className="mt-3 text-lg text-gray-500">
                        {isArabic ? "بنرتب المواعيد حسب رغبتك واستعجالك" : "We coordinate based on your schedule & urgency"}
                      </p>
                    </div>
                    
                    <div className="grid gap-4 sm:grid-cols-2">
                      {whenOptions.map((opt) => {
                        const label = opt[locale];
                        const selected = state.timing === label;
                        return (
                          <button key={label} type="button"
                            onClick={() => setState((s) => ({ ...s, timing: label }))}
                            className={cn(
                              "group relative flex flex-col items-center justify-center gap-4 rounded-[2rem] border-2 px-6 py-10 text-center transition-all duration-300",
                              selected
                                ? "border-gray-900 bg-gray-900 text-white shadow-xl shadow-gray-900/20 scale-[1.02]"
                                : "border-gray-100 bg-onyx-800/50 text-gray-700 hover:border-gray-300 hover:bg-gray-50/50"
                            )}
                          >
                            <span className="text-5xl">{opt.icon}</span>
                            <span className="text-lg font-bold">{label}</span>
                            <div className={cn(
                              "absolute bottom-4 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all",
                              selected ? "border-white bg-onyx-800/50" : "border-gray-200"
                            )}>
                              {selected && <div className="h-2.5 w-2.5 rounded-full bg-gray-900" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Step: Location */}
                {step === "location" && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                        {isArabic ? "إنت فين بالظبط؟" : "Where are you located?"}
                      </h2>
                      <p className="mt-3 text-lg text-gray-500">
                        {isArabic ? "هنوصل ليك أقرب فني في منطقتك لتوفير الوقت" : "Matching you with the nearest pro to save your time"}
                      </p>
                    </div>
                    
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {egyptianGovernorates.map((gov) => {
                        const label = isArabic ? gov.labelAr : gov.labelEn;
                        const selected = state.area === gov.value;
                        return (
                          <button key={gov.value} type="button"
                            onClick={() => setState((s) => ({ ...s, area: gov.value }))}
                            className={cn(
                              "group relative flex items-center gap-3 rounded-2xl border-2 px-5 py-4 text-sm transition-all duration-300",
                              selected
                                ? "border-gray-900 bg-gray-900 text-white shadow-xl"
                                : "border-gray-100 bg-onyx-800/50 text-gray-700 hover:border-gray-300"
                            )}
                          >
                            <MapPin className={cn("h-4 w-4 shrink-0", selected ? "text-white" : "text-gray-400")} />
                            <span className="font-semibold">{label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Footer Controls */}
                <div className="mt-12 flex flex-col-reverse gap-4 pt-10 border-t border-gray-100 sm:flex-row sm:items-center sm:justify-between">
                  <button type="button" onClick={handleBack}
                    className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl border-2 border-gray-100 bg-onyx-800/50 px-8 text-sm font-bold text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-200">
                    {isArabic ? <ArrowRight className="h-5 w-5" /> : <ArrowLeft className="h-5 w-5" />}
                    {isArabic ? "السابق" : "Back"}
                  </button>
                  
                  <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:justify-end">
                    <button type="button" onClick={handleContinue} disabled={!canContinue}
                      className={cn(
                        "inline-flex h-14 items-center justify-center gap-3 rounded-2xl px-12 text-base font-bold text-white shadow-2xl transition-all duration-300",
                        canContinue
                          ? "bg-primary-600 shadow-primary-200 hover:bg-primary-700 hover:-translate-y-1"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                      )}>
                      {step === "location"
                        ? (isArabic ? "ابحث عن فني 🎉" : "Find a Pro 🎉")
                        : (isArabic ? "التالي" : "Continue")}
                      {step !== "location" && (isArabic ? <ArrowLeft className="h-5 w-5" /> : <ArrowRight className="h-5 w-5" />)}
                    </button>
                  </div>
                </div>

                {/* Status Bar */}
                {(state.jobType || state.timing || state.area) && (
                  <div className="mt-10 rounded-3xl bg-gray-50 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-2 w-2 rounded-full bg-primary-500 animate-pulse" />
                      <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
                        {isArabic ? "ملخص طلبك" : "YOUR REQUEST SUMMARY"}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {state.jobType && (
                        <div className="flex items-center gap-2 rounded-xl bg-onyx-800/50 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm border border-gray-100">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          {state.jobType}
                        </div>
                      )}
                      {state.timing && (
                        <div className="flex items-center gap-2 rounded-xl bg-onyx-800/50 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm border border-gray-100">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          {state.timing}
                        </div>
                      )}
                      {state.area && (
                        <div className="flex items-center gap-2 rounded-xl bg-onyx-800/50 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm border border-gray-100">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          {egyptianGovernorates.find(g => g.value === state.area)?.[isArabic ? "labelAr" : "labelEn"]}
                        </div>
                      )}
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
