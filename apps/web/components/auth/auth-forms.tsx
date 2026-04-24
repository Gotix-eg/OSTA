"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowUpRight
} from "lucide-react";

import { postApiData } from "@/lib/api";
import { getDashboardRoute, saveAuthSession, type AuthRole } from "@/lib/auth-session";
import { authCopy } from "@/lib/copy";
import type { Locale } from "@/lib/locales";
import { cn } from "@/lib/utils";
import { MapPicker } from "@/components/shared/map-picker";
import { SelectField } from "@/components/shared/select-field";
import { ImageUpload } from "@/components/shared/image-upload";
import { egyptianGovernorates, majorCities, vendorCategories } from "@/lib/geo-data";

type ClientRegisterState = {
  phone: string;
  otp: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  governorate: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  acceptedTerms: boolean;
};

type WorkerRegisterState = {
  phone: string;
  otp: string;
  firstName: string;
  lastName: string;
  nationalIdNumber: string;
  nationalIdFront: string;
  nationalIdBack: string;
  password: string;
  confirmPassword: string;
  acceptedTerms: boolean;
};

type VendorRegisterState = {
  storeName: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
  governorate: string;
  city: string;
  address: string;
  commercialRecord: string;
  taxCard: string;
  category: string;
  latitude: number;
  longitude: number;
  acceptedTerms: boolean;
};

const vendorRegisterDefaults: VendorRegisterState = {
  storeName: "",
  firstName: "",
  lastName: "",
  phone: "+20",
  email: "",
  password: "",
  confirmPassword: "",
  governorate: "",
  city: "",
  address: "",
  commercialRecord: "",
  taxCard: "",
  category: "",
  latitude: 30.0444,
  longitude: 31.2357,
  acceptedTerms: false
};

const clientRegisterDefaults: ClientRegisterState = {
  phone: "+20",
  otp: "",
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
  governorate: "",
  city: "",
  address: "",
  latitude: 30.0444,
  longitude: 31.2357,
  acceptedTerms: false
};

const workerRegisterDefaults: WorkerRegisterState = {
  phone: "+20",
  otp: "",
  firstName: "",
  lastName: "",
  nationalIdNumber: "",
  nationalIdFront: "",
  nationalIdBack: "",
  password: "",
  confirmPassword: "",
  acceptedTerms: false
};

type AuthSuccessResponse = {
  accessToken: string;
  refreshToken: string;
  user: {
    role: AuthRole;
    firstName: string;
  };
};

function usePersistentState<T>(key: string, initialValue: T) {
  const [state, setState] = useState<T>(initialValue);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const rawValue = window.localStorage.getItem(key);

    if (rawValue) {
      try {
        setState(JSON.parse(rawValue) as T);
      } catch {
        window.localStorage.removeItem(key);
      }
    }

    setReady(true);
  }, [key]);

  useEffect(() => {
    if (!ready) {
      return;
    }

    window.localStorage.setItem(key, JSON.stringify(state));
  }, [key, ready, state]);

  return { ready, state, setState };
}

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="mb-10 flex items-center gap-3">
      {Array.from({ length: total }).map((_, index) => {
        const active = index <= current;

        return (
          <div key={index} className="flex flex-1 items-center gap-3">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full border text-sm font-black transition duration-500",
                active
                  ? "border-gold-500 bg-gold-500 text-onyx-950 shadow-gold/20 shadow-lg"
                  : "border-onyx-700 bg-onyx-800 text-onyx-500"
              )}
            >
              {active && index < current ? <Check className="h-4 w-4" /> : index + 1}
            </div>
            {index < total - 1 ? (
              <div className={cn("h-0.5 flex-1 rounded-full", active ? "bg-gold-500/50" : "bg-onyx-800")} />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  textarea,
  rows = 4
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  textarea?: boolean;
  rows?: number;
}) {
  return (
    <label className="block space-y-2 text-start">
      <span className="text-sm font-bold text-onyx-300 tracking-wide">{label}</span>
      {textarea ? (
        <textarea
          value={value}
          rows={rows}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="min-h-28 w-full rounded-2xl border border-onyx-700 bg-onyx-800/50 px-5 py-4 text-white transition-all placeholder:text-onyx-600 focus:border-gold-500/50 focus:ring-4 focus:ring-gold-500/10 outline-none"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="h-14 w-full rounded-2xl border border-onyx-700 bg-onyx-800/50 px-5 text-white transition-all placeholder:text-onyx-600 focus:border-gold-500/50 focus:ring-4 focus:ring-gold-500/10 outline-none"
        />
      )}
    </label>
  );
}

function OtpBoxes({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  const digits = Array.from({ length: 6 }).map((_, index) => value[index] ?? "");

  return (
    <div className="flex items-center justify-between gap-2 sm:gap-3">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(node) => {
            refs.current[index] = node;
          }}
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(event) => {
            const clean = event.target.value.replace(/\D/g, "").slice(-1);
            const nextDigits = [...digits];
            nextDigits[index] = clean;
            onChange(nextDigits.join(""));

            if (clean && refs.current[index + 1]) {
              refs.current[index + 1]?.focus();
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Backspace" && !digit && refs.current[index - 1]) {
              refs.current[index - 1]?.focus();
            }
          }}
          className="h-16 w-12 rounded-2xl border border-onyx-700 bg-onyx-800 text-center text-2xl font-black text-gold-500 transition-all focus:border-gold-500 focus:ring-4 focus:ring-gold-500/10 outline-none sm:w-16"
        />
      ))}
    </div>
  );
}

function applyAuthSuccess(locale: Locale, payload: AuthSuccessResponse, remember: boolean) {
  saveAuthSession(
    {
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken,
      role: payload.user.role,
      firstName: payload.user.firstName
    },
    remember
  );

  window.location.assign(getDashboardRoute(locale, payload.user.role));
}

export function LoginForm({ locale }: { locale: Locale }) {
  const copy = authCopy[locale];
  const isArabic = locale === "ar";
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("+20");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogin() {
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = await postApiData<AuthSuccessResponse, { phone: string; password: string }>("/auth/login", {
        phone,
        password
      });

      setSubmitted(true);
      applyAuthSuccess(locale, payload, remember);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : isArabic ? "تعذر تسجيل الدخول" : "Unable to sign in.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <span className="text-eyebrow mb-6">
          {copy.intro}
        </span>
        <h2 className="text-4xl font-black text-white tracking-tight mb-4 font-display">{copy.loginTitle}</h2>
        <p className="text-onyx-400 leading-relaxed text-lg text-pretty">{copy.loginBody}</p>
      </div>

      <div className="grid gap-6">
        <InputField
          label={isArabic ? "رقم الهاتف" : "Phone number"}
          value={phone}
          onChange={setPhone}
          placeholder="+20 100 000 0000"
        />

        <label className="block space-y-2 text-start">
          <span className="text-sm font-bold text-onyx-300 tracking-wide">{isArabic ? "كلمة المرور" : "Password"}</span>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-14 w-full rounded-2xl border border-onyx-700 bg-onyx-800/50 px-5 pe-12 text-white transition-all placeholder:text-onyx-600 focus:border-gold-500/50 focus:ring-4 focus:ring-gold-500/10 outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute inset-y-0 end-4 flex items-center text-onyx-500 transition hover:text-gold-500"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </label>

        <div className="flex flex-wrap items-center justify-between gap-4 text-sm font-medium">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative flex h-5 w-5 items-center justify-center">
               <input
                  type="checkbox"
                  checked={remember}
                  onChange={(event) => setRemember(event.target.checked)}
                  className="peer h-full w-full opacity-0 absolute cursor-pointer"
               />
               <div className="h-full w-full rounded border border-onyx-700 bg-onyx-800 transition peer-checked:border-gold-500 peer-checked:bg-gold-500" />
               <Check className="pointer-events-none absolute h-3.5 w-3.5 text-onyx-950 opacity-0 transition peer-checked:opacity-100" />
            </div>
            <span className="text-onyx-300 group-hover:text-onyx-100 transition">{isArabic ? "تذكرني" : "Remember me"}</span>
          </label>
          <Link href={`/${locale}/forgot-password`} className="text-gold-500 hover:text-gold-400 transition-colors">
            {isArabic ? "نسيت كلمة المرور؟" : "Forgot password?"}
          </Link>
        </div>

        <button
          type="button"
          onClick={() => void handleLogin()}
          disabled={isSubmitting}
          className="btn-gold h-14 text-lg"
        >
          {isSubmitting ? (isArabic ? "... جاري" : "Signing in...") : isArabic ? "تسجيل الدخول" : "Sign in"}
        </button>

        {submitted && (
          <div className="onyx-card p-4 border-success/20 bg-success/5 text-success text-center font-bold">
            {copy.success}
          </div>
        )}

        {error && (
          <div className="onyx-card p-4 border-red-500/20 bg-red-500/5 text-red-500 text-center font-bold">
            {error}
          </div>
        )}

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-onyx-800" /></div>
          <div className="relative flex justify-center text-xs uppercase tracking-widest"><span className="bg-onyx-900 px-4 text-onyx-600 font-black">{isArabic ? "أو" : "or"}</span></div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { labelAr: "تسجيل عميل", labelEn: "Register Client", href: "client" },
            { labelAr: "تسجيل عامل", labelEn: "Register Worker", href: "worker" },
            { labelAr: "تسجيل مورد", labelEn: "Register Vendor", href: "vendor" }
          ].map((btn) => (
            <Link
               key={btn.href}
               href={`/${locale}/register/${btn.href}`}
               className="btn-onyx h-12 flex items-center justify-center text-xs px-2"
            >
               {isArabic ? btn.labelAr : btn.labelEn}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ClientRegisterForm({ locale }: { locale: Locale }) {
  const copy = authCopy[locale];
  const isArabic = locale === "ar";
  const { ready, state, setState } = usePersistentState("osta-client-register", clientRegisterDefaults);
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleRegister() {
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = await postApiData<AuthSuccessResponse, any>("/auth/register/client", {
        ...state
      });
      window.localStorage.removeItem("osta-client-register");
      setSubmitted(true);
      applyAuthSuccess(locale, payload, true);
    } catch (err) {
      setError(err instanceof Error ? err.message : isArabic ? "تعذر إنشاء الحساب" : "Unable to create account.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!ready) return <div className="text-onyx-600 font-bold">{isArabic ? "جاري التحضير..." : "Preparing..."}</div>;

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h2 className="text-4xl font-black text-white tracking-tight mb-4 font-display">{copy.registerClientTitle}</h2>
        <p className="text-onyx-400 leading-relaxed text-pretty">
          {isArabic 
            ? "انضم إلى مجتمع أُسطى واحصل على أفضل الفنيين لخدماتك المنزلية بكل سهولة." 
            : "Join the OSTA community and get the best technicians for your home services with ease."}
        </p>
      </div>

      <StepIndicator current={step} total={3} />

      {submitted ? (
        <div className="onyx-card p-10 text-center border-success/30 bg-success/5 space-y-4">
          <ShieldCheck className="h-16 w-16 text-success mx-auto" />
          <h3 className="text-2xl font-black text-white">{isArabic ? "تم إنشاء الحساب!" : "Account Created!"}</h3>
          <p className="text-onyx-400">{isArabic ? "جاري تحويلك إلى لوحة التحكم..." : "Redirecting to dashboard..."}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {step === 0 && (
            <InputField
              label={isArabic ? "رقم الهاتف" : "Phone number"}
              value={state.phone}
              onChange={(phone) => setState({ ...state, phone })}
              placeholder="+20 100 000 0000"
            />
          )}

          {step === 1 && (
            <>
              <div className="grid gap-6 sm:grid-cols-2">
                <InputField label={isArabic ? "الاسم الأول" : "First name"} value={state.firstName} onChange={(firstName) => setState({ ...state, firstName })} />
                <InputField label={isArabic ? "اسم العائلة" : "Last name"} value={state.lastName} onChange={(lastName) => setState({ ...state, lastName })} />
              </div>
              <InputField label={isArabic ? "البريد الإلكتروني" : "Email"} value={state.email} onChange={(email) => setState({ ...state, email })} type="email" />
              <div className="grid gap-6 sm:grid-cols-2">
                <InputField label={isArabic ? "كلمة المرور" : "Password"} value={state.password} onChange={(password) => setState({ ...state, password })} type="password" />
                <InputField label={isArabic ? "تأكيد كلمة المرور" : "Confirm password"} value={state.confirmPassword} onChange={(confirmPassword) => setState({ ...state, confirmPassword })} type="password" />
              </div>
            </>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <SelectField
                  label={isArabic ? "المحافظة" : "Governorate"}
                  value={state.governorate}
                  options={egyptianGovernorates.map(g => ({ value: g.value, label: isArabic ? g.labelAr : g.labelEn }))}
                  onChange={(gov) => setState({ ...state, governorate: gov, city: "" })}
                  placeholder={isArabic ? "اختر المحافظة" : "Select governorate"}
                />
                <SelectField
                  label={isArabic ? "المدينة / المنطقة" : "City / Area"}
                  value={state.city}
                  disabled={!state.governorate}
                  options={(majorCities[state.governorate] || []).map(c => ({ value: c.value, label: isArabic ? c.labelAr : c.labelEn }))}
                  onChange={(city) => setState({ ...state, city })}
                  placeholder={isArabic ? "اختر المدينة" : "Select city"}
                />
              </div>

              <div className="space-y-3">
                <span className="text-sm font-bold text-onyx-300 tracking-wide">{isArabic ? "تحديد الموقع على الخريطة" : "Pin location on map"}</span>
                <div className="rounded-2xl overflow-hidden border border-onyx-700 h-64 gold-border-glow">
                  <MapPicker lat={state.latitude} lng={state.longitude} isArabic={isArabic} onChange={(lat, lng) => setState({ ...state, latitude: lat, longitude: lng })} />
                </div>
              </div>

              <InputField label={isArabic ? "العنوان التفصيلي" : "Detailed address"} value={state.address} onChange={(address) => setState({ ...state, address })} textarea rows={2} />

              <label className="flex items-center gap-3 cursor-pointer group onyx-card p-4 border-onyx-700 bg-onyx-800/30">
                <div className="relative flex h-5 w-5 items-center justify-center">
                   <input type="checkbox" checked={state.acceptedTerms} onChange={(e) => setState({ ...state, acceptedTerms: e.target.checked })} className="peer h-full w-full opacity-0 absolute cursor-pointer" />
                   <div className="h-full w-full rounded border border-onyx-700 bg-onyx-800 transition peer-checked:border-gold-500 peer-checked:bg-gold-500" />
                   <Check className="pointer-events-none absolute h-3.5 w-3.5 text-onyx-950 opacity-0 transition peer-checked:opacity-100" />
                </div>
                <span className="text-sm text-onyx-400 group-hover:text-onyx-200 transition">{copy.terms}</span>
              </label>
            </div>
          )}

          <div className="flex items-center justify-between gap-4 pt-4">
            <button type="button" onClick={() => setStep(s => Math.max(0, s - 1))} className="btn-onyx h-12 flex items-center gap-2">
              {isArabic ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              {isArabic ? "السابق" : "Back"}
            </button>
            <button 
               type="button" 
               onClick={step === 2 ? handleRegister : () => setStep(s => s + 1)} 
               disabled={isSubmitting || (step === 2 && !state.acceptedTerms)}
               className="btn-gold h-12 px-8 flex items-center gap-2"
            >
              {isSubmitting ? (isArabic ? "جاري..." : "Processing...") : step === 2 ? (isArabic ? "إنشاء الحساب" : "Create Account") : (isArabic ? "التالي" : "Next")}
              {isArabic ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
            </button>
          </div>

          {error && <div className="onyx-card p-4 border-red-500/20 bg-red-500/5 text-red-500 text-center font-bold text-sm">{error}</div>}
        </div>
      )}
    </div>
  );
}

export function WorkerRegisterForm({ locale }: { locale: Locale }) {
  const copy = authCopy[locale];
  const isArabic = locale === "ar";
  const { ready, state, setState } = usePersistentState("osta-worker-register", workerRegisterDefaults);
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleRegister() {
    setIsSubmitting(true);
    setError(null);
    try {
      const payload = await postApiData<AuthSuccessResponse, any>("/auth/register/worker", { ...state });
      window.localStorage.removeItem("osta-worker-register");
      setSubmitted(true);
      applyAuthSuccess(locale, payload, true);
    } catch (err) {
      setError(err instanceof Error ? err.message : isArabic ? "تعذر إرسال الطلب" : "Unable to submit.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!ready) return <div className="text-onyx-600 font-bold">{isArabic ? "جاري التحضير..." : "Preparing..."}</div>;

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h2 className="text-4xl font-black text-white tracking-tight mb-4 font-display">{copy.registerWorkerTitle}</h2>
        <p className="text-onyx-400 leading-relaxed text-pretty">
          {isArabic 
            ? "انضم إلى فريق النخبة من الفنيين في أُسطى وابدأ في استقبال الطلبات المربحة فوراً." 
            : "Join the elite team of technicians at OSTA and start receiving profitable requests immediately."}
        </p>
      </div>

      <StepIndicator current={step} total={4} />

      {submitted ? (
        <div className="onyx-card p-10 text-center border-success/30 bg-success/5 space-y-4">
          <ShieldCheck className="h-16 w-16 text-success mx-auto" />
          <h3 className="text-2xl font-black text-white">{isArabic ? "تم إرسال الطلب!" : "Application Sent!"}</h3>
          <p className="text-onyx-400">{isArabic ? "جاري مراجعة بياناتك من قبل الإدارة..." : "Your data is being reviewed by the admin..."}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {step === 0 && (
             <InputField label={isArabic ? "رقم الهاتف" : "Phone number"} value={state.phone} onChange={(phone) => setState({ ...state, phone })} placeholder="+20 100 000 0000" />
          )}

          {step === 1 && (
            <>
              <div className="grid gap-6 sm:grid-cols-2">
                <InputField label={isArabic ? "الاسم الأول" : "First name"} value={state.firstName} onChange={(firstName) => setState({ ...state, firstName })} />
                <InputField label={isArabic ? "اسم العائلة" : "Last name"} value={state.lastName} onChange={(lastName) => setState({ ...state, lastName })} />
              </div>
              <InputField label={isArabic ? "الرقم القومي (14 رقم)" : "National ID (14 digits)"} value={state.nationalIdNumber} onChange={(n) => setState({ ...state, nationalIdNumber: n })} />
            </>
          )}

          {step === 2 && (
            <div className="grid gap-8">
              <div className="grid gap-6 sm:grid-cols-2">
                <ImageUpload isArabic={isArabic} label={isArabic ? "صورة البطاقة (أمام)" : "ID Front"} value={state.nationalIdFront} onChange={(url) => setState({ ...state, nationalIdFront: url })} />
                <ImageUpload isArabic={isArabic} label={isArabic ? "صورة البطاقة (خلف)" : "ID Back"} value={state.nationalIdBack} onChange={(url) => setState({ ...state, nationalIdBack: url })} />
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                <InputField label={isArabic ? "كلمة المرور" : "Password"} value={state.password} onChange={(p) => setState({ ...state, password: p })} type="password" />
                <InputField label={isArabic ? "تأكيد كلمة المرور" : "Confirm password"} value={state.confirmPassword} onChange={(cp) => setState({ ...state, confirmPassword: cp })} type="password" />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8">
              <div className="onyx-card p-6 border-gold-500/10 space-y-4">
                <h3 className="font-black text-lg text-gold-500">{isArabic ? "مراجعة الطلب" : "Review Application"}</h3>
                <div className="grid gap-3 text-sm">
                   <div className="flex justify-between border-b border-onyx-800 pb-2"><span className="text-onyx-500">{isArabic ? "الاسم الكامل" : "Full Name"}</span><span className="text-white font-bold">{state.firstName} {state.lastName}</span></div>
                   <div className="flex justify-between border-b border-onyx-800 pb-2"><span className="text-onyx-500">{isArabic ? "رقم الهاتف" : "Phone"}</span><span className="text-white font-bold">{state.phone}</span></div>
                   <div className="flex justify-between border-b border-onyx-800 pb-2"><span className="text-onyx-500">{isArabic ? "الرقم القومي" : "National ID"}</span><span className="text-white font-bold">{state.nationalIdNumber}</span></div>
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer group onyx-card p-4 border-onyx-700 bg-onyx-800/30">
                <div className="relative flex h-5 w-5 items-center justify-center">
                   <input type="checkbox" checked={state.acceptedTerms} onChange={(e) => setState({ ...state, acceptedTerms: e.target.checked })} className="peer h-full w-full opacity-0 absolute cursor-pointer" />
                   <div className="h-full w-full rounded border border-onyx-700 bg-onyx-800 transition peer-checked:border-gold-500 peer-checked:bg-gold-500" />
                   <Check className="pointer-events-none absolute h-3.5 w-3.5 text-onyx-950 opacity-0 transition peer-checked:opacity-100" />
                </div>
                <span className="text-sm text-onyx-400 group-hover:text-onyx-200 transition">{copy.terms}</span>
              </label>
            </div>
          )}

          <div className="flex items-center justify-between gap-4 pt-4">
            <button type="button" onClick={() => setStep(s => Math.max(0, s - 1))} className="btn-onyx h-12 flex items-center gap-2">
              {isArabic ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              {isArabic ? "السابق" : "Back"}
            </button>
            <button 
               type="button" 
               onClick={step === 3 ? handleRegister : () => setStep(s => s + 1)} 
               disabled={isSubmitting || (step === 3 && !state.acceptedTerms)}
               className="btn-gold h-12 px-8 flex items-center gap-2"
            >
              {isSubmitting ? (isArabic ? "جاري..." : "Processing...") : step === 3 ? (isArabic ? "إرسال للمراجعة" : "Submit Review") : (isArabic ? "التالي" : "Next")}
              {isArabic ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
            </button>
          </div>

          {error && <div className="onyx-card p-4 border-red-500/20 bg-red-500/5 text-red-500 text-center font-bold text-sm">{error}</div>}
        </div>
      )}
    </div>
  );
}

export function VendorRegisterForm({ locale }: { locale: Locale }) {
  const copy = authCopy[locale];
  const isArabic = locale === "ar";
  const { ready, state, setState } = usePersistentState("osta-vendor-register", vendorRegisterDefaults);
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleRegister() {
    setIsSubmitting(true);
    setError(null);
    try {
      const payload = await postApiData<AuthSuccessResponse, any>("/auth/register/vendor", { ...state });
      window.localStorage.removeItem("osta-vendor-register");
      setSubmitted(true);
      applyAuthSuccess(locale, payload, true);
    } catch (err) {
      setError(err instanceof Error ? err.message : isArabic ? "تعذر إنشاء الحساب" : "Unable to create account.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!ready) return <div className="text-onyx-600 font-bold">{isArabic ? "جاري التحضير..." : "Preparing..."}</div>;

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h2 className="text-4xl font-black text-white tracking-tight mb-4 font-display">{copy.registerVendorTitle}</h2>
        <p className="text-onyx-400 leading-relaxed text-pretty">
          {isArabic 
            ? "حوّل متجرك إلى وجهة رقمية لبيع الخامات وقطع الغيار لأفضل الفنيين في مصر." 
            : "Turn your store into a digital destination for selling materials and spare parts to Egypt's best technicians."}
        </p>
      </div>

      <StepIndicator current={step} total={3} />

      {submitted ? (
        <div className="onyx-card p-10 text-center border-success/30 bg-success/5 space-y-4">
          <ShieldCheck className="h-16 w-16 text-success mx-auto" />
          <h3 className="text-2xl font-black text-white">{isArabic ? "تم إرسال الطلب!" : "Account Created!"}</h3>
          <p className="text-onyx-400">{isArabic ? "جاري تحويلك إلى لوحة التحكم..." : "Redirecting to dashboard..."}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {step === 0 && (
             <>
                <InputField label={isArabic ? "رقم الهاتف" : "Phone number"} value={state.phone} onChange={(phone) => setState({ ...state, phone })} placeholder="+20 100 000 0000" />
                <InputField label={isArabic ? "اسم المتجر" : "Store Name"} value={state.storeName} onChange={(n) => setState({ ...state, storeName: n })} />
                <SelectField
                   label={isArabic ? "تصنيف المتجر" : "Store Category"}
                   value={state.category}
                   options={vendorCategories.map(c => ({ value: c.value, label: isArabic ? c.labelAr : c.labelEn }))}
                   onChange={(cat) => setState({ ...state, category: cat })}
                   placeholder={isArabic ? "اختر تصنيف المتجر" : "Select store category"}
                />
             </>
          )}

          {step === 1 && (
            <>
              <div className="grid gap-6 sm:grid-cols-2">
                <InputField label={isArabic ? "الاسم الأول" : "First name"} value={state.firstName} onChange={(firstName) => setState({ ...state, firstName })} />
                <InputField label={isArabic ? "اسم العائلة" : "Last name"} value={state.lastName} onChange={(lastName) => setState({ ...state, lastName })} />
              </div>
              <InputField label={isArabic ? "البريد الإلكتروني" : "Email"} value={state.email} onChange={(email) => setState({ ...state, email })} type="email" />
              <div className="grid gap-6 sm:grid-cols-2">
                <InputField label={isArabic ? "كلمة المرور" : "Password"} value={state.password} onChange={(password) => setState({ ...state, password })} type="password" />
                <InputField label={isArabic ? "تأكيد كلمة المرور" : "Confirm password"} value={state.confirmPassword} onChange={(confirmPassword) => setState({ ...state, confirmPassword })} type="password" />
              </div>
            </>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <ImageUpload isArabic={isArabic} label={isArabic ? "السجل التجاري" : "Commercial Record"} value={state.commercialRecord} onChange={(url) => setState({ ...state, commercialRecord: url })} />
                <ImageUpload isArabic={isArabic} label={isArabic ? "البطاقة الضريبية" : "Tax Card"} value={state.taxCard} onChange={(url) => setState({ ...state, taxCard: url })} />
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <SelectField
                  label={isArabic ? "المحافظة" : "Governorate"}
                  value={state.governorate}
                  options={egyptianGovernorates.map(g => ({ value: g.value, label: isArabic ? g.labelAr : g.labelEn }))}
                  onChange={(gov) => setState({ ...state, governorate: gov, city: "" })}
                  placeholder={isArabic ? "اختر المحافظة" : "Select governorate"}
                />
                <SelectField
                  label={isArabic ? "المدينة / المنطقة" : "City / Area"}
                  value={state.city}
                  disabled={!state.governorate}
                  options={(majorCities[state.governorate] || []).map(c => ({ value: c.value, label: isArabic ? c.labelAr : c.labelEn }))}
                  onChange={(city) => setState({ ...state, city })}
                  placeholder={isArabic ? "اختر المدينة" : "Select city"}
                />
              </div>

              <div className="space-y-3">
                <span className="text-sm font-bold text-onyx-300 tracking-wide">{isArabic ? "تحديد الموقع على الخريطة" : "Store Location"}</span>
                <div className="rounded-2xl overflow-hidden border border-onyx-700 h-64 gold-border-glow">
                  <MapPicker lat={state.latitude} lng={state.longitude} isArabic={isArabic} onChange={(lat, lng) => setState({ ...state, latitude: lat, longitude: lng })} />
                </div>
              </div>

              <InputField label={isArabic ? "العنوان التفصيلي" : "Detailed address"} value={state.address} onChange={(address) => setState({ ...state, address })} textarea rows={2} />

              <label className="flex items-center gap-3 cursor-pointer group onyx-card p-4 border-onyx-700 bg-onyx-800/30">
                <div className="relative flex h-5 w-5 items-center justify-center">
                   <input type="checkbox" checked={state.acceptedTerms} onChange={(e) => setState({ ...state, acceptedTerms: e.target.checked })} className="peer h-full w-full opacity-0 absolute cursor-pointer" />
                   <div className="h-full w-full rounded border border-onyx-700 bg-onyx-800 transition peer-checked:border-gold-500 peer-checked:bg-gold-500" />
                   <Check className="pointer-events-none absolute h-3.5 w-3.5 text-onyx-950 opacity-0 transition peer-checked:opacity-100" />
                </div>
                <span className="text-sm text-onyx-400 group-hover:text-onyx-200 transition">{copy.terms}</span>
              </label>
            </div>
          )}

          <div className="flex items-center justify-between gap-4 pt-4">
            <button type="button" onClick={() => setStep(s => Math.max(0, s - 1))} className="btn-onyx h-12 flex items-center gap-2">
              {isArabic ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              {isArabic ? "السابق" : "Back"}
            </button>
            <button 
               type="button" 
               onClick={step === 2 ? handleRegister : () => setStep(s => s + 1)} 
               disabled={isSubmitting || (step === 2 && !state.acceptedTerms)}
               className="btn-gold h-12 px-8 flex items-center gap-2"
            >
              {isSubmitting ? (isArabic ? "جاري..." : "Processing...") : step === 2 ? (isArabic ? "إنشاء الحساب" : "Create Account") : (isArabic ? "التالي" : "Next")}
              {isArabic ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
            </button>
          </div>

          {error && <div className="onyx-card p-4 border-red-500/20 bg-red-500/5 text-red-500 text-center font-bold text-sm">{error}</div>}
        </div>
      )}
    </div>
  );
}

export function ForgotPasswordForm({ locale }: { locale: Locale }) {
  const copy = authCopy[locale];
  const isArabic = locale === "ar";
  const [step, setStep] = useState(0);
  const [phone, setPhone] = useState("+20");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [done, setDone] = useState(false);

  if (done) return (
    <div className="onyx-card p-10 text-center border-success/30 bg-success/5 space-y-4">
      <ShieldCheck className="h-16 w-16 text-success mx-auto" />
      <h3 className="text-2xl font-black text-white">{isArabic ? "تم تحديث كلمة المرور!" : "Password Updated!"}</h3>
      <p className="text-onyx-400">{copy.success}</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h2 className="text-4xl font-black text-white tracking-tight mb-4">{copy.forgotPasswordTitle}</h2>
        <p className="text-onyx-400 leading-relaxed">{isArabic ? "أدخل رقم هاتفك لاستعادة الوصول إلى حسابك." : "Enter your phone number to regain access to your account."}</p>
      </div>

      <StepIndicator current={step} total={3} />

      <div className="space-y-6">
        {step === 0 && <InputField label={isArabic ? "رقم الهاتف" : "Phone number"} value={phone} onChange={setPhone} placeholder="+20 100 000 0000" />}
        {step === 1 && (
           <div className="space-y-4">
              <span className="text-sm font-bold text-onyx-300 tracking-wide">{isArabic ? "رمز التحقق" : "Verification Code"}</span>
              <OtpBoxes value={otp} onChange={setOtp} />
           </div>
        )}
        {step === 2 && (
          <div className="grid gap-6 sm:grid-cols-2">
            <InputField label={isArabic ? "كلمة المرور الجديدة" : "New password"} value={password} onChange={setPassword} type="password" />
            <InputField label={isArabic ? "تأكيد كلمة المرور" : "Confirm password"} value={confirmPassword} onChange={setConfirmPassword} type="password" />
          </div>
        )}

        <div className="flex items-center justify-between gap-4 pt-4">
          <button type="button" onClick={() => setStep(s => Math.max(0, s - 1))} className="btn-onyx h-12 flex items-center gap-2">
            {isArabic ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            {isArabic ? "السابق" : "Back"}
          </button>
          <button 
             type="button" 
             onClick={step === 2 ? () => setDone(true) : () => setStep(s => s + 1)} 
             className="btn-gold h-12 px-8 flex items-center gap-2"
          >
            {step === 2 ? (isArabic ? "تحديث" : "Update") : (isArabic ? "التالي" : "Next")}
            {isArabic ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}

export function VerifyOtpForm({ locale }: { locale: Locale }) {
  const copy = authCopy[locale];
  const isArabic = locale === "ar";
  const [otp, setOtp] = useState("");
  const [seconds, setSeconds] = useState(60);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (seconds > 0) {
      const timer = setTimeout(() => setSeconds(s => s - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [seconds]);

  useEffect(() => {
    if (otp.length === 6) setDone(true);
  }, [otp]);

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h2 className="text-4xl font-black text-white tracking-tight mb-4">{copy.otpTitle}</h2>
        <p className="text-onyx-400 leading-relaxed">{isArabic ? "لقد أرسلنا رمزاً مكوّناً من 6 أرقام إلى هاتفك." : "We've sent a 6-digit code to your phone."}</p>
      </div>

      <div className="space-y-8">
         <OtpBoxes value={otp} onChange={setOtp} />
         
         <div className="flex items-center justify-between text-sm">
            <p className="text-onyx-500">{copy.timerLabel} <span className="text-gold-500 font-black">{seconds}s</span></p>
            <button disabled={seconds > 0} onClick={() => setSeconds(60)} className="text-gold-500 font-bold hover:text-gold-400 disabled:text-onyx-700 transition">
               {copy.resend}
            </button>
         </div>

         {done && <div className="onyx-card p-4 border-success/30 bg-success/5 text-success text-center font-bold">{copy.success}</div>}
      </div>
    </div>
  );
}
