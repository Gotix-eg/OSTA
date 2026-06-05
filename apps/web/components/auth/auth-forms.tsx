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
import { egyptianGovernorates, majorCities, vendorCategories, workerProfessions } from "@/lib/geo-data";

type ClientRegisterState = {
  phone: string;
  otp: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
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
  profession: string;
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
  phone: "",
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
  phone: "",
  otp: "",
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
  acceptedTerms: false
};

const workerRegisterDefaults: WorkerRegisterState = {
  phone: "",
  otp: "",
  firstName: "",
  lastName: "",
  nationalIdNumber: "",
  nationalIdFront: "",
  nationalIdBack: "",
  password: "",
  confirmPassword: "",
  profession: "",
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
        const parsed = JSON.parse(rawValue) as Partial<T>;
        setState({ ...initialValue, ...parsed });
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
  rows = 4,
  helperText
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  textarea?: boolean;
  rows?: number;
  helperText?: string;
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
      {helperText && (
        <p className="text-xs text-onyx-500 mt-1 select-none font-medium leading-normal">{helperText}</p>
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
  const [phone, setPhone] = useState("");
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
          placeholder="01x xxxx xxxx"
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
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleRegister() {
    setIsSubmitting(true);
    setError(null);

    // Basic Validation
    if (!state.phone || state.phone.length < 10) {
      setError(isArabic ? "رقم الهاتف غير صحيح" : "Invalid phone number");
      setIsSubmitting(false);
      return;
    }
    if (!state.firstName || !state.lastName) {
      setError(isArabic ? "برجاء إدخال الاسم بالكامل" : "Please enter full name");
      setIsSubmitting(false);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!state.email) {
      setError(isArabic ? "البريد الإلكتروني مطلوب" : "Email is required");
      setIsSubmitting(false);
      return;
    }
    if (!emailRegex.test(state.email)) {
      setError(isArabic ? "صيغة البريد الإلكتروني غير صحيحة" : "Invalid email format");
      setIsSubmitting(false);
      return;
    }
    if (state.password.length < 8) {
      setError(isArabic ? "كلمة المرور يجب أن تكون 8 أحرف أو أرقام على الأقل" : "Password must be at least 8 characters");
      setIsSubmitting(false);
      return;
    }
    if (state.password !== state.confirmPassword) {
      setError(isArabic ? "كلمات المرور غير متطابقة" : "Passwords do not match");
      setIsSubmitting(false);
      return;
    }

    if (!state.acceptedTerms) {
      setError(isArabic ? "يجب الموافقة على الشروط والأحكام" : "You must accept terms and conditions");
      setIsSubmitting(false);
      return;
    }

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
            ? "انضم إلى مجتمع أُسطفاي واحصل على أفضل الفنيين لخدماتك المنزلية بكل سهولة." 
            : "Join the Ostafy community and get the best technicians for your home services with ease."}
        </p>
      </div>

      {submitted ? (
        <div className="onyx-card p-10 text-center border-success/30 bg-success/5 space-y-4">
          <ShieldCheck className="h-16 w-16 text-success mx-auto" />
          <h3 className="text-2xl font-black text-white">{isArabic ? "تم إنشاء الحساب!" : "Account Created!"}</h3>
          <p className="text-onyx-400">{isArabic ? "جاري تحويلك إلى لوحة التحكم..." : "Redirecting to dashboard..."}</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="onyx-card p-6 space-y-6 border-white/5 bg-white/[0.02]">
            <h3 className="text-lg font-bold text-gold-500 border-b border-white/5 pb-2">
              {isArabic ? "البيانات الأساسية" : "Basic Information"}
            </h3>
            
            <InputField
              label={isArabic ? "رقم الهاتف" : "Phone number"}
              value={state.phone}
              onChange={(phone) => setState({ ...state, phone })}
              placeholder="01x xxxx xxxx"
              helperText={isArabic ? "مثال: 01012345678 (رقم هاتف مصري مكون من 11 رقماً)" : "E.g. 01012345678 (11-digit Egyptian phone number)"}
            />

            <div className="grid gap-6 sm:grid-cols-2">
              <InputField label={isArabic ? "الاسم الأول" : "First name"} value={state.firstName} onChange={(firstName) => setState({ ...state, firstName })} placeholder={isArabic ? "محمد" : "John"} />
              <InputField label={isArabic ? "اسم العائلة" : "Last name"} value={state.lastName} onChange={(lastName) => setState({ ...state, lastName })} placeholder={isArabic ? "أحمد" : "Doe"} />
            </div>
            
            <InputField 
              label={isArabic ? "البريد الإلكتروني" : "Email"} 
              value={state.email} 
              onChange={(email) => setState({ ...state, email })} 
              type="email" 
              placeholder="example@mail.com"
              helperText={isArabic ? "البريد الإلكتروني إلزامي ومطلوب لإكمال التسجيل" : "Email is required and mandatory to complete registration"}
            />
            
            <div className="grid gap-6 sm:grid-cols-2">
              <InputField 
                label={isArabic ? "كلمة المرور" : "Password"} 
                value={state.password} 
                onChange={(password) => setState({ ...state, password })} 
                type="password" 
                placeholder="••••••••"
                helperText={isArabic ? "يجب أن تحتوي على 8 أحرف أو أرقام على الأقل" : "Must be at least 8 characters/numbers"}
              />
              <InputField 
                label={isArabic ? "تأكيد كلمة المرور" : "Confirm password"} 
                value={state.confirmPassword} 
                onChange={(confirmPassword) => setState({ ...state, confirmPassword })} 
                type="password" 
                placeholder="••••••••"
                helperText={isArabic ? "أعد كتابة كلمة المرور المدخلة للتأكيد" : "Retype the password to confirm"}
              />
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

          <button 
              type="button" 
              onClick={handleRegister} 
              disabled={isSubmitting}
              className="btn-gold w-full h-14 text-lg font-black flex items-center justify-center gap-2"
          >
            {isSubmitting ? (isArabic ? "جاري إنشاء الحساب..." : "Creating Account...") : (isArabic ? "إنشاء الحساب" : "Create Account")}
            {!isSubmitting && <ArrowUpRight className="h-5 w-5" />}
          </button>

          {error && <div className="onyx-card p-4 border-red-500/20 bg-red-500/5 text-red-500 text-center font-bold text-sm animate-shake">{error}</div>}
        </div>
      )}
    </div>
  );
}

export function WorkerRegisterForm({ locale }: { locale: Locale }) {
  const copy = authCopy[locale];
  const isArabic = locale === "ar";
  const { ready, state, setState } = usePersistentState("osta-worker-register", workerRegisterDefaults);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleRegister() {
    setIsSubmitting(true);
    setError(null);

    // Validation
    if (!state.phone || state.phone.length < 10) {
      setError(isArabic ? "رقم الهاتف غير صحيح" : "Invalid phone number");
      setIsSubmitting(false);
      return;
    }
    if (!state.firstName || !state.lastName) {
      setError(isArabic ? "برجاء إدخال الاسم بالكامل" : "Please enter full name");
      setIsSubmitting(false);
      return;
    }
    if (!state.profession) {
      setError(isArabic ? "برجاء اختيار المهنة" : "Please select a profession");
      setIsSubmitting(false);
      return;
    }
    if (!state.nationalIdNumber || state.nationalIdNumber.length !== 14) {
      setError(isArabic ? "الرقم القومي يجب أن يكون 14 رقم" : "National ID must be 14 digits");
      setIsSubmitting(false);
      return;
    }
    if (!state.nationalIdFront || !state.nationalIdBack) {
      setError(isArabic ? "برجاء رفع صور البطاقة" : "Please upload ID photos");
      setIsSubmitting(false);
      return;
    }
    if (state.password.length < 8) {
      setError(isArabic ? "كلمة المرور يجب أن تكون 8 أحرف على الأقل" : "Password must be at least 8 characters");
      setIsSubmitting(false);
      return;
    }
    if (state.password !== state.confirmPassword) {
      setError(isArabic ? "كلمات المرور غير متطابقة" : "Passwords do not match");
      setIsSubmitting(false);
      return;
    }
    if (!state.acceptedTerms) {
      setError(isArabic ? "يجب الموافقة على الشروط والأحكام" : "You must accept terms and conditions");
      setIsSubmitting(false);
      return;
    }

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
            ? "انضم إلى فريق النخبة من الفنيين في أُسطفاي وابدأ في استقبال الطلبات المربحة فوراً." 
            : "Join the elite team of technicians at Ostafy and start receiving profitable requests immediately."}
        </p>
      </div>

      {submitted ? (
        <div className="onyx-card p-10 text-center border-success/30 bg-success/5 space-y-4">
          <ShieldCheck className="h-16 w-16 text-success mx-auto" />
          <h3 className="text-2xl font-black text-white">{isArabic ? "تم إرسال الطلب!" : "Application Sent!"}</h3>
          <p className="text-onyx-400">{isArabic ? "جاري مراجعة بياناتك من قبل الإدارة..." : "Your data is being reviewed by the admin..."}</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="onyx-card p-6 space-y-6 border-white/5 bg-white/[0.02]">
            <h3 className="text-lg font-bold text-gold-500 border-b border-white/5 pb-2">
              {isArabic ? "البيانات الشخصية" : "Personal Information"}
            </h3>
            
            <InputField 
              label={isArabic ? "رقم الهاتف" : "Phone number"} 
              value={state.phone} 
              onChange={(phone) => setState({ ...state, phone })} 
              placeholder="01x xxxx xxxx" 
              helperText={isArabic ? "مثال: 01012345678 (رقم هاتف مصري مكون من 11 رقماً)" : "E.g. 01012345678 (11-digit Egyptian phone number)"}
            />

            <div className="grid gap-6 sm:grid-cols-2">
              <InputField label={isArabic ? "الاسم الأول" : "First name"} value={state.firstName} onChange={(firstName) => setState({ ...state, firstName })} placeholder={isArabic ? "محمد" : "John"} />
              <InputField label={isArabic ? "اسم العائلة" : "Last name"} value={state.lastName} onChange={(lastName) => setState({ ...state, lastName })} placeholder={isArabic ? "أحمد" : "Doe"} />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <InputField label={isArabic ? "الرقم القومي (14 رقم)" : "National ID (14 digits)"} value={state.nationalIdNumber} onChange={(n) => setState({ ...state, nationalIdNumber: n })} placeholder="2xxxxxxxxxxxxx" />
              <SelectField
                label={isArabic ? "المهنة / التخصص" : "Profession / Specialization"}
                value={state.profession}
                options={workerProfessions.map(p => ({ value: p.value, label: isArabic ? p.labelAr : p.labelEn }))}
                onChange={(prof) => setState({ ...state, profession: prof })}
                placeholder={isArabic ? "اختر المهنة" : "Select profession"}
              />
            </div>
          </div>

          <div className="onyx-card p-6 space-y-6 border-white/5 bg-white/[0.02]">
            <h3 className="text-lg font-bold text-gold-500 border-b border-white/5 pb-2">
              {isArabic ? "مستندات التوثيق" : "Verification Documents"}
            </h3>
            
            <div className="grid gap-6 sm:grid-cols-2">
              <ImageUpload isArabic={isArabic} label={isArabic ? "صورة البطاقة (أمام)" : "ID Front"} value={state.nationalIdFront} onChange={(url) => setState({ ...state, nationalIdFront: url })} />
              <ImageUpload isArabic={isArabic} label={isArabic ? "صورة البطاقة (خلف)" : "ID Back"} value={state.nationalIdBack} onChange={(url) => setState({ ...state, nationalIdBack: url })} />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <InputField 
                label={isArabic ? "كلمة المرور" : "Password"} 
                value={state.password} 
                onChange={(p) => setState({ ...state, password: p })} 
                type="password" 
                placeholder="••••••••"
                helperText={isArabic ? "يجب أن تحتوي على 8 أحرف أو أرقام على الأقل" : "Must be at least 8 characters/numbers"}
              />
              <InputField 
                label={isArabic ? "تأكيد كلمة المرور" : "Confirm password"} 
                value={state.confirmPassword} 
                onChange={(cp) => setState({ ...state, confirmPassword: cp })} 
                type="password" 
                placeholder="••••••••"
                helperText={isArabic ? "أعد كتابة كلمة المرور المدخلة للتأكيد" : "Retype the password to confirm"}
              />
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

          <button 
              type="button" 
              onClick={handleRegister} 
              disabled={isSubmitting}
              className="btn-gold w-full h-14 text-lg font-black flex items-center justify-center gap-2"
          >
            {isSubmitting ? (isArabic ? "جاري إرسال الطلب..." : "Submitting Application...") : (isArabic ? "إرسال طلب الانضمام" : "Submit Application")}
            {!isSubmitting && <ArrowUpRight className="h-5 w-5" />}
          </button>

          {error && <div className="onyx-card p-4 border-red-500/20 bg-red-500/5 text-red-500 text-center font-bold text-sm animate-shake">{error}</div>}
        </div>
      )}
    </div>
  );
}

export function VendorRegisterForm({ locale }: { locale: Locale }) {
  const copy = authCopy[locale];
  const isArabic = locale === "ar";
  const { ready, state, setState } = usePersistentState("osta-vendor-register", vendorRegisterDefaults);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleRegister() {
    setIsSubmitting(true);
    setError(null);

    // Validation
    if (!state.phone || state.phone.length < 10) {
      setError(isArabic ? "رقم الهاتف غير صحيح" : "Invalid phone number");
      setIsSubmitting(false);
      return;
    }
    if (!state.storeName || !state.category) {
      setError(isArabic ? "برجاء إدخال اسم وتصنيف المتجر" : "Please enter store name and category");
      setIsSubmitting(false);
      return;
    }
    if (!state.firstName || !state.lastName) {
      setError(isArabic ? "برجاء إدخال اسم صاحب المتجر" : "Please enter owner name");
      setIsSubmitting(false);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!state.email) {
      setError(isArabic ? "البريد الإلكتروني مطلوب" : "Email is required");
      setIsSubmitting(false);
      return;
    }
    if (!emailRegex.test(state.email)) {
      setError(isArabic ? "صيغة البريد الإلكتروني غير صحيحة" : "Invalid email format");
      setIsSubmitting(false);
      return;
    }
    if (state.password.length < 8) {
      setError(isArabic ? "كلمة المرور يجب أن تكون 8 أحرف أو أرقام على الأقل" : "Password must be at least 8 characters");
      setIsSubmitting(false);
      return;
    }
    if (state.password !== state.confirmPassword) {
      setError(isArabic ? "كلمات المرور غير متطابقة" : "Passwords do not match");
      setIsSubmitting(false);
      return;
    }
    if (!state.commercialRecord || !state.taxCard) {
      setError(isArabic ? "برجاء رفع مستندات المتجر" : "Please upload store documents");
      setIsSubmitting(false);
      return;
    }
    if (!state.governorate || !state.city || !state.address) {
      setError(isArabic ? "برجاء إكمال بيانات العنوان" : "Please complete address details");
      setIsSubmitting(false);
      return;
    }
    if (!state.acceptedTerms) {
      setError(isArabic ? "يجب الموافقة على الشروط والأحكام" : "You must accept terms and conditions");
      setIsSubmitting(false);
      return;
    }

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

      {submitted ? (
        <div className="onyx-card p-10 text-center border-success/30 bg-success/5 space-y-4">
          <ShieldCheck className="h-16 w-16 text-success mx-auto" />
          <h3 className="text-2xl font-black text-white">{isArabic ? "تم إرسال الطلب!" : "Account Created!"}</h3>
          <p className="text-onyx-400">{isArabic ? "جاري تحويلك إلى لوحة التحكم..." : "Redirecting to dashboard..."}</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="onyx-card p-6 space-y-6 border-white/5 bg-white/[0.02]">
            <h3 className="text-lg font-bold text-gold-500 border-b border-white/5 pb-2">
              {isArabic ? "بيانات المتجر" : "Store Information"}
            </h3>
            
            <InputField 
              label={isArabic ? "رقم الهاتف" : "Phone number"} 
              value={state.phone} 
              onChange={(phone) => setState({ ...state, phone })} 
              placeholder="01x xxxx xxxx" 
              helperText={isArabic ? "مثال: 01012345678 (رقم هاتف مصري مكون من 11 رقماً)" : "E.g. 01012345678 (11-digit Egyptian phone number)"}
            />
            <InputField label={isArabic ? "اسم المتجر" : "Store Name"} value={state.storeName} onChange={(n) => setState({ ...state, storeName: n })} placeholder={isArabic ? "الشركة العربية للمستلزمات" : "Arab Supply Co."} />
            <SelectField
                label={isArabic ? "تصنيف المتجر" : "Store Category"}
                value={state.category}
                options={vendorCategories.map(c => ({ value: c.value, label: isArabic ? c.labelAr : c.labelEn }))}
                onChange={(cat) => setState({ ...state, category: cat })}
                placeholder={isArabic ? "اختر تصنيف المتجر" : "Select store category"}
            />
          </div>

          <div className="onyx-card p-6 space-y-6 border-white/5 bg-white/[0.02]">
            <h3 className="text-lg font-bold text-gold-500 border-b border-white/5 pb-2">
              {isArabic ? "البيانات الشخصية" : "Owner Information"}
            </h3>
            
            <div className="grid gap-6 sm:grid-cols-2">
              <InputField label={isArabic ? "الاسم الأول" : "First name"} value={state.firstName} onChange={(firstName) => setState({ ...state, firstName })} placeholder={isArabic ? "محمد" : "John"} />
              <InputField label={isArabic ? "اسم العائلة" : "Last name"} value={state.lastName} onChange={(lastName) => setState({ ...state, lastName })} placeholder={isArabic ? "أحمد" : "Doe"} />
            </div>
            <InputField 
              label={isArabic ? "البريد الإلكتروني" : "Email"} 
              value={state.email} 
              onChange={(email) => setState({ ...state, email })} 
              type="email" 
              placeholder="example@mail.com"
              helperText={isArabic ? "البريد الإلكتروني إلزامي ومطلوب للتواصل الرسمي" : "Email is required and mandatory for official communication"}
            />
            <div className="grid gap-6 sm:grid-cols-2">
              <InputField 
                label={isArabic ? "كلمة المرور" : "Password"} 
                value={state.password} 
                onChange={(password) => setState({ ...state, password })} 
                type="password" 
                placeholder="••••••••"
                helperText={isArabic ? "يجب أن تحتوي على 8 أحرف أو أرقام على الأقل" : "Must be at least 8 characters/numbers"}
              />
              <InputField 
                label={isArabic ? "تأكيد كلمة المرور" : "Confirm password"} 
                value={state.confirmPassword} 
                onChange={(confirmPassword) => setState({ ...state, confirmPassword })} 
                type="password" 
                placeholder="••••••••"
                helperText={isArabic ? "أعد كتابة كلمة المرور المدخلة للتأكيد" : "Retype the password to confirm"}
              />
            </div>
          </div>

          <div className="onyx-card p-6 space-y-6 border-white/5 bg-white/[0.02]">
            <h3 className="text-lg font-bold text-gold-500 border-b border-white/5 pb-2">
              {isArabic ? "مستندات التوثيق" : "Verification Documents"}
            </h3>
            
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
          </div>

          <label className="flex items-center gap-3 cursor-pointer group onyx-card p-4 border-onyx-700 bg-onyx-800/30">
            <div className="relative flex h-5 w-5 items-center justify-center">
                <input type="checkbox" checked={state.acceptedTerms} onChange={(e) => setState({ ...state, acceptedTerms: e.target.checked })} className="peer h-full w-full opacity-0 absolute cursor-pointer" />
                <div className="h-full w-full rounded border border-onyx-700 bg-onyx-800 transition peer-checked:border-gold-500 peer-checked:bg-gold-500" />
                <Check className="pointer-events-none absolute h-3.5 w-3.5 text-onyx-950 opacity-0 transition peer-checked:opacity-100" />
            </div>
            <span className="text-sm text-onyx-400 group-hover:text-onyx-200 transition">{copy.terms}</span>
          </label>

          <button 
              type="button" 
              onClick={handleRegister} 
              disabled={isSubmitting}
              className="btn-gold w-full h-14 text-lg font-black flex items-center justify-center gap-2"
          >
            {isSubmitting ? (isArabic ? "جاري إنشاء الحساب..." : "Creating Account...") : (isArabic ? "إنشاء حساب المتجر" : "Create Store Account")}
            {!isSubmitting && <ArrowUpRight className="h-5 w-5" />}
          </button>

          {error && <div className="onyx-card p-4 border-red-500/20 bg-red-500/5 text-red-500 text-center font-bold text-sm animate-shake">{error}</div>}
        </div>
      )}
    </div>
  );
}

export function ForgotPasswordForm({ locale }: { locale: Locale }) {
  const copy = authCopy[locale];
  const isArabic = locale === "ar";
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSendCode() {
    if (!email) {
      setError(isArabic ? "برجاء إدخال البريد الإلكتروني" : "Please enter your email");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await postApiData("/auth/forgot-password", { email });
      setStep(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send code");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResetPassword() {
    if (code.length < 6) {
      setError(isArabic ? "برجاء إدخال رمز التحقق كاملاً" : "Please enter the full verification code");
      return;
    }
    if (password.length < 8) {
      setError(isArabic ? "كلمة المرور يجب أن تكون 8 أحرف على الأقل" : "Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError(isArabic ? "كلمة المرور غير متطابقة" : "Passwords do not match");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await postApiData("/auth/reset-password", { email, code, password });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (done) return (
    <div className="onyx-card p-10 text-center border-success/30 bg-success/5 space-y-4">
      <ShieldCheck className="h-16 w-16 text-success mx-auto" />
      <h3 className="text-2xl font-black text-white">{copy.passwordUpdated}</h3>
      <p className="text-onyx-400">{copy.loginNow}</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h2 className="text-4xl font-black text-white tracking-tight mb-4 font-display">
          {step === 0 ? copy.forgotPasswordTitle : copy.resetPasswordTitle}
        </h2>
        <p className="text-onyx-400 leading-relaxed max-w-lg">
          {step === 0 ? copy.forgotPasswordBody : copy.resetPasswordBody}
        </p>
      </div>

      <StepIndicator current={step} total={2} />

      <div className="space-y-6">
        {step === 0 && (
          <InputField 
            label={isArabic ? "البريد الإلكتروني" : "Email address"} 
            value={email} 
            onChange={setEmail} 
            type="email"
            placeholder="example@mail.com" 
          />
        )}
        
        {step === 1 && (
           <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-3">
                <span className="text-sm font-bold text-onyx-300 tracking-wide">
                  {isArabic ? "رمز التحقق (6 أرقام)" : "Verification Code (6 digits)"}
                </span>
                <OtpBoxes value={code} onChange={setCode} />
              </div>

              <div className="grid gap-6 sm:grid-cols-2 pt-2">
                <InputField 
                  label={isArabic ? "كلمة المرور الجديدة" : "New password"} 
                  value={password} 
                  onChange={setPassword} 
                  type="password" 
                  placeholder="••••••••"
                  helperText={isArabic ? "يجب أن تحتوي على 8 أحرف أو أرقام على الأقل" : "Must be at least 8 characters/numbers"}
                />
                <InputField 
                  label={isArabic ? "تأكيد كلمة المرور" : "Confirm password"} 
                  value={confirmPassword} 
                  onChange={setConfirmPassword} 
                  type="password" 
                  placeholder="••••••••"
                  helperText={isArabic ? "أعد كتابة كلمة المرور المدخلة للتأكيد" : "Retype the password to confirm"}
                />
              </div>
           </div>
        )}

        <div className="flex items-center justify-between gap-4 pt-4">
          <button 
            type="button" 
            onClick={() => setStep(0)} 
            disabled={step === 0 || isSubmitting} 
            className="btn-onyx h-12 flex items-center gap-2"
          >
            {isArabic ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            {copy.back}
          </button>
          
          <button 
             type="button" 
             onClick={step === 0 ? handleSendCode : handleResetPassword} 
             disabled={isSubmitting}
             className="btn-gold h-12 px-8 flex items-center gap-2 group"
          >
            {isSubmitting ? copy.processing : step === 0 ? copy.sendCode : copy.update}
            <div className={cn("transition-transform duration-300", isArabic ? "group-hover:-translate-x-1" : "group-hover:translate-x-1")}>
              {isArabic ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
            </div>
          </button>
        </div>

        {error && <div className="onyx-card p-4 border-red-500/20 bg-red-500/5 text-red-500 text-center font-bold text-sm animate-shake">{error}</div>}
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
