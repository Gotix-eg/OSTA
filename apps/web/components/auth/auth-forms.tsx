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
  Fingerprint,
  ShieldCheck,
  ArrowUpRight,
  Loader2,
  Phone,
  Lock
} from "lucide-react";

import { postApiData } from "@/lib/api";
import { getDashboardRoute, saveAuthSession, type AuthRole } from "@/lib/auth-session";
import { authCopy } from "@/lib/copy";
import type { Locale } from "@/lib/locales";
import { cn, getLocalizedError } from "@/lib/utils";
import { MapPicker } from "@/components/shared/map-picker";
import { SelectField } from "@/components/shared/select-field";
import { ImageUpload } from "@/components/shared/image-upload";
import { egyptianGovernorates, majorCities, vendorCategories, workerProfessions } from "@/lib/geo-data";

function EgyptFlagIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 3 2" className={className} aria-hidden="true">
      <rect width="3" height="2" fill="#ce1126" />
      <rect width="3" height="0.6667" y="0.6667" fill="#fff" />
      <rect width="3" height="0.6667" y="1.3333" fill="#000" />
    </svg>
  );
}

function EgyptPhoneBadge({ locale }: { locale: Locale }) {
  const isArabic = locale === "ar";
  return (
    <span className="flex flex-row items-center gap-1.5" dir="ltr">
      <EgyptFlagIcon className="h-4 w-6 rounded-sm" />
      <span className="text-xs font-bold text-gold">{isArabic ? "مصر" : "Egypt"}</span>
    </span>
  );
}

function TermsConsentText({ locale }: { locale: Locale }) {
  const isArabic = locale === "ar";
  const linkClass = "underline underline-offset-2 hover:text-gold transition-colors";

  return isArabic ? (
    <>
      أوافق على{" "}
      <Link href={`/${locale}/terms`} target="_blank" rel="noopener noreferrer" className={linkClass}>
        الشروط
      </Link>{" "}
      و
      <Link href={`/${locale}/privacy`} target="_blank" rel="noopener noreferrer" className={linkClass}>
        سياسة الخصوصية
      </Link>
    </>
  ) : (
    <>
      I agree to the{" "}
      <Link href={`/${locale}/terms`} target="_blank" rel="noopener noreferrer" className={linkClass}>
        terms
      </Link>{" "}
      and{" "}
      <Link href={`/${locale}/privacy`} target="_blank" rel="noopener noreferrer" className={linkClass}>
        privacy policy
      </Link>
    </>
  );
}

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
  profession: "",
  acceptedTerms: false
};

export function formatEgyptianPhone(val: string): string {
  if (val.length < 3) {
    return "+20";
  }
  
  let digits = val.replace(/\D/g, "");
  
  if (digits.startsWith("20")) {
    digits = digits.substring(2);
  }
  
  while (digits.startsWith("0")) {
    digits = digits.substring(1);
  }
  
  digits = digits.substring(0, 10);
  
  let formatted = "+20";
  if (digits.length > 0) {
    const part1 = digits.substring(0, 3);
    formatted += " " + part1;
    
    if (digits.length > 3) {
      const part2 = digits.substring(3, 6);
      formatted += " " + part2;
    }
    
    if (digits.length > 6) {
      const part3 = digits.substring(6, 10);
      formatted += " " + part3;
    }
  }
  
  return formatted;
}

type AuthSuccessResponse = {
  accessToken: string;
  refreshToken: string;
  user: {
    role: AuthRole;
    firstName: string;
  };
};

function useEphemeralState<T>(initialValue: T) {
  const [state, setState] = useState<T>(initialValue);
  return { ready: true, state, setState };
}

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="mb-8 flex items-center gap-3">
      {Array.from({ length: total }).map((_, index) => {
        const active = index <= current;

        return (
          <div key={index} className="flex flex-1 items-center gap-3">
            <div
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-none border text-sm font-black transition duration-300",
                active
                  ? "border-gold bg-gold text-black"
                  : "border-white/15 bg-[#121212] text-white/60"
              )}
            >
              {active && index < current ? <Check className="h-4 w-4" /> : index + 1}
            </div>
            {index < total - 1 ? (
              <div className={cn("h-px flex-1", active ? "bg-gold" : "bg-white/10")} />
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
  helperText,
  errorText,
  name,
  autoComplete,
  suffix
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  textarea?: boolean;
  rows?: number;
  helperText?: string;
  errorText?: string;
  name?: string;
  autoComplete?: string;
  suffix?: React.ReactNode;
}) {
  return (
    <label className="block space-y-2 text-start">
      <span className="text-xs font-black uppercase tracking-widest text-white/70">{label}</span>
      {textarea ? (
        <textarea
          value={value}
          rows={rows}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          name={name}
          autoComplete={autoComplete}
          className={cn(
            "min-h-28 w-full rounded-none border bg-[#121212] px-4 py-4 text-sm font-semibold text-white outline-none transition-colors placeholder:text-white/20 focus:border-gold",
            errorText ? "border-red-500" : "border-white/20"
          )}
        />
      ) : (
        <div className="relative">
          {suffix && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none select-none">
              {suffix}
            </div>
          )}
          <input
            type={type}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            name={name}
            autoComplete={autoComplete}
            className={cn(
              "h-14 w-full rounded-none border bg-[#121212] text-sm font-semibold text-white outline-none transition-colors placeholder:text-white/20 focus:border-gold",
              suffix ? "pl-4 pr-24" : "px-4",
              errorText ? "border-red-500" : "border-white/20"
            )}
          />
        </div>
      )}
      {errorText ? (
        <p className="text-xs text-red-500 mt-1 select-none font-bold animate-fadeIn">{errorText}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs font-semibold leading-normal text-white/60">{helperText}</p>
      ) : null}
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
          className="h-16 w-12 rounded-none border border-white/20 bg-[#121212] text-center text-2xl font-black text-gold outline-none transition-colors focus:border-gold sm:w-16"
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

  if (typeof window !== "undefined") {
    const searchParams = new URLSearchParams(window.location.search);
    const redirectTo = searchParams.get("redirect");
    if (redirectTo) {
      window.location.assign(redirectTo);
      return;
    }
  }

  window.location.assign(getDashboardRoute(locale, payload.user.role));
}

export function LoginForm({ locale, isAdmin = false }: { locale: Locale; isAdmin?: boolean }) {
  const copy = authCopy[locale];
  const isArabic = locale === "ar";
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("+20");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"CLIENT" | "WORKER" | "VENDOR">("CLIENT");

  // Inline validation error states
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const loginLabels = isAdmin
    ? {
        phone: isArabic ? "رقم هاتف المدير" : "Admin Phone Number",
        phonePlaceholder: "+20 1XX XXX XXXX",
        password: isArabic ? "كلمة المرور" : "Password",
        passwordPlaceholder: "••••••••",
        remember: isArabic ? "حفظ الجلسة الآمنة" : "Keep Secure Session",
        forgot: isArabic ? "نسيت كلمة المرور؟" : "Forgot Password?",
        submit: isArabic ? "تسجيل دخول الإدارة" : "Admin Login",
        submitting: isArabic ? "جاري تسجيل الدخول..." : "Logging in..."
      }
    : {
        phone: isArabic ? "رقم الهاتف" : "Phone Number",
        phonePlaceholder: "+20 1XX XXX XXXX",
        password: isArabic ? "كلمة المرور" : "Password",
        passwordPlaceholder: "••••••••",
        remember: isArabic ? "تذكرني" : "Remember Me",
        forgot: isArabic ? "نسيت كلمة المرور؟" : "Forgot Password?",
        submit: isArabic ? "تسجيل الدخول" : "LOGIN",
        submitting: isArabic ? "جاري تسجيل الدخول..." : "LOGGING IN..."
      };

  async function handleLogin() {
    let isValid = true;
    
    if (!phone.trim()) {
      setPhoneError(isArabic ? "رقم الهاتف مطلوب" : "Phone number is required");
      isValid = false;
    } else {
      setPhoneError(null);
    }

    if (!password.trim()) {
      setPasswordError(isArabic ? "كلمة المرور مطلوبة" : "Password is required");
      isValid = false;
    } else {
      setPasswordError(null);
    }

    if (!isValid) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = await postApiData<AuthSuccessResponse, { phone: string; password: string }>("/auth/login", {
        phone: phone.replace(/\s+/g, ""),
        password
      });

      // Role check and validation
      if (isAdmin) {
        if (payload.user.role !== "ADMIN") {
          throw new Error(isArabic ? "هذا الحساب لا يملك صلاحيات الإدارة" : "This account does not have admin privileges");
        }
      } else {
        if (payload.user.role !== activeTab) {
          const roleName = activeTab === "CLIENT"
            ? (isArabic ? "عميل" : "client")
            : activeTab === "WORKER"
            ? (isArabic ? "فني" : "technician")
            : (isArabic ? "مورد" : "vendor");
          throw new Error(isArabic ? `هذا الحساب غير مسجل كـ ${roleName}` : `This account is not registered as a ${roleName}`);
        }
      }

      setSubmitted(true);
      applyAuthSuccess(locale, payload, remember);
    } catch (loginError: any) {
      const errorMsg = loginError instanceof Error ? loginError.message : (loginError?.message || String(loginError));
      setError(getLocalizedError(errorMsg, locale));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className={cn("space-y-6 animate-fadeIn", isAdmin && "w-full")}>
      {!isAdmin && (
        <div className="mb-8 flex w-full overflow-hidden border border-white/10 rounded-none md:border">
          {(["CLIENT", "WORKER", "VENDOR"] as const).map((role, idx) => {
            const isActive = activeTab === role;
            const label = role === "CLIENT"
              ? (isArabic ? "عميل" : "CLIENT")
              : role === "WORKER"
              ? (isArabic ? "فني" : "PRO")
              : (isArabic ? "مورد" : "VENDOR");
            return (
              <button
                key={role}
                type="button"
                onClick={() => {
                  setActiveTab(role);
                  setError(null);
                }}
                className={cn(
                  "flex-1 rounded-none py-4 text-xs font-black uppercase tracking-widest transition-all duration-150",
                  isActive
                    ? "border-b-2 border-gold text-gold md:border-b-0 md:bg-gold md:text-black"
                    : "text-white/50 hover:bg-white/5 hover:text-gold",
                  idx > 0 && (isArabic ? "border-r border-white/10" : "border-l border-white/10")
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      <div className="grid gap-6">
        {/* Phone Input */}
        <div className="space-y-2 text-start">
          <label htmlFor="login-phone" className="mb-2 flex justify-between text-xs font-black uppercase tracking-widest text-white/60 md:text-white/70">
            <span className={isAdmin ? "text-gold" : ""}>{loginLabels.phone}</span>
            {isAdmin ? <Phone size={14} className="hidden text-gold md:block" /> : <Phone size={14} className="hidden text-gold md:block" />}
          </label>
          <div className="relative">
            <span className="absolute right-4 top-1/2 -translate-y-1/2 select-none" dir="ltr">
              <EgyptPhoneBadge locale={locale} />
            </span>
            <input
              id="login-phone"
              type="text"
              value={phone}
              onChange={(e) => {
                setPhone(formatEgyptianPhone(e.target.value));
                if (phoneError) setPhoneError(null);
              }}
              placeholder={loginLabels.phonePlaceholder}
              autoComplete="username"
              name="phone"
              dir="ltr"
              aria-invalid={phoneError ? true : undefined}
              aria-describedby={phoneError ? "login-phone-error" : undefined}
              className={cn(
                "w-full rounded-none bg-[#121212] p-4 pl-4 pr-24 font-semibold text-white transition-colors placeholder:text-white/20 focus:border-gold focus:outline-none focus:ring-0",
                phoneError ? "border-2 border-red-500" : "border border-white/20"
              )}
            />
          </div>
          {phoneError && (
            <p id="login-phone-error" className="text-xs text-red-500 mt-1 select-none font-bold animate-fadeIn">{phoneError}</p>
          )}
        </div>

        {/* Password Input */}
        <div className="space-y-2 text-start">
          <label htmlFor="login-password" className="mb-2 flex justify-between text-xs font-black uppercase tracking-widest text-white/60 md:text-white/70">
            <span className={isAdmin ? "text-gold" : ""}>{loginLabels.password}</span>
            {isAdmin ? <Lock size={14} className="hidden text-gold md:block" /> : <Lock size={14} className="hidden text-gold md:block" />}
          </label>
          <div className="relative">
            {isAdmin ? (
              <Lock size={20} className="absolute start-4 top-1/2 -translate-y-1/2 text-white/45" />
            ) : (
              <Lock size={20} className="absolute start-4 top-1/2 -translate-y-1/2 text-white/40 md:hidden" />
            )}
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) setPasswordError(null);
              }}
              placeholder={loginLabels.passwordPlaceholder}
              autoComplete="current-password"
              name="password"
              aria-invalid={passwordError ? true : undefined}
              aria-describedby={passwordError ? "login-password-error" : undefined}
              className={cn(
                "w-full rounded-none bg-[#121212] p-4 pe-12 ps-12 font-semibold text-white transition-colors placeholder:text-white/20 focus:border-gold focus:outline-none focus:ring-0 md:ps-4",
                passwordError ? "border-2 border-red-500" : "border border-white/20"
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute inset-y-0 end-2 flex w-11 items-center justify-center text-white/50 hover:text-gold transition-colors"
              aria-label={showPassword ? (isArabic ? "إخفاء كلمة المرور" : "Hide password") : (isArabic ? "إظهار كلمة المرور" : "Show password")}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {passwordError && (
            <p id="login-password-error" className="text-xs text-red-500 mt-1 select-none font-bold animate-fadeIn">{passwordError}</p>
          )}
        </div>

        {/* Remember / Forgot */}
        <div className="flex items-center justify-between gap-3 text-[10px] font-black uppercase text-white/70 md:text-xs">
          <label className="flex cursor-pointer items-center gap-2 group">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="rounded-none bg-transparent border-white/20 text-gold accent-gold focus:ring-0 focus:ring-offset-0 cursor-pointer h-4 w-4"
            />
            <span className="leading-tight transition-colors group-hover:text-white">
              {loginLabels.remember}
            </span>
          </label>
          <Link href={`/${locale}/forgot-password`} className="text-end leading-tight text-gold hover:underline transition-colors">
            {loginLabels.forgot}
          </Link>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "mt-4 w-full rounded-none py-5 text-sm font-black uppercase text-black transition-all",
            isAdmin ? "bg-gold tracking-[0.18em] hover:brightness-110 active:scale-[0.98]" : "bg-gold"
          )}
          style={{
            boxShadow: "4px 4px 0px #000000",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translate(2px, 2px)";
            e.currentTarget.style.boxShadow = "none";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translate(0px, 0px)";
            e.currentTarget.style.boxShadow = "4px 4px 0px #000000";
          }}
        >
          <span className="inline-flex items-center justify-center gap-3">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {isSubmitting ? loginLabels.submitting : loginLabels.submit}
            {isAdmin && !isSubmitting ? <ArrowUpRight className={cn("h-4 w-4", isArabic ? "-scale-x-100" : "")} /> : null}
          </span>
        </button>

        {isAdmin ? (
          <button
            type="button"
            className="w-full rounded-none border border-white/20 bg-transparent py-4 text-xs font-black uppercase tracking-widest text-white transition-colors hover:bg-white/5"
          >
            <span className="inline-flex items-center justify-center gap-3">
              <Fingerprint className="h-5 w-5 text-gold" />
              {isArabic ? "تحقق بالبصمة" : "Biometric Auth"}
            </span>
          </button>
        ) : null}

        {submitted && (
          <div className="p-4 border border-success/20 bg-success/5 text-success text-center font-bold rounded-none">
            {copy.success}
          </div>
        )}

        {error && (
          <div className="p-4 border border-red-500/20 bg-red-500/5 text-red-500 text-center font-bold rounded-none">
            {error}
          </div>
        )}

        {!isAdmin && (
          <div className="pt-2 text-center text-sm font-semibold text-white/60">
            {isArabic ? (
              <>
                ليس لديك حساب؟{" "}
                <Link
                  href={`/${locale}/register`}
                  className="text-gold hover:underline transition-colors font-bold"
                >
                  سجّل الآن
                </Link>
              </>
            ) : (
              <>
                Don&apos;t have an account?{" "}
                <Link
                  href={`/${locale}/register`}
                  className="text-gold hover:underline transition-colors font-bold"
                >
                  Register Now
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </form>
  );
}

function FormSkeleton({ locale }: { locale: Locale }) {
  const isArabic = locale === "ar";
  return (
    <div className="space-y-8 animate-pulse">
      {/* Title / Section Header Skeleton */}
      <div className="space-y-3">
        <div className="h-6 w-32 bg-white/10" />
        <div className="h-px w-16 bg-gold/40" />
      </div>

      <div className="space-y-6">
        <div className="space-y-6 border border-white/10 bg-white/[0.02] p-6">
          {/* Section subtitle */}
          <div className="h-5 w-40 bg-white/10" />
          
          {/* Input 1 */}
          <div className="space-y-2">
            <div className="h-4 w-24 bg-white/10" />
            <div className="h-12 w-full border border-white/10 bg-[#121212]" />
            <div className="h-3 w-56 bg-white/5" />
          </div>

          {/* Grid inputs */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="h-4 w-20 bg-white/10" />
              <div className="h-12 w-full border border-white/10 bg-[#121212]" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-20 bg-white/10" />
              <div className="h-12 w-full border border-white/10 bg-[#121212]" />
            </div>
          </div>

          {/* Input 2 */}
          <div className="space-y-2">
            <div className="h-4 w-28 bg-white/10" />
            <div className="h-12 w-full border border-white/10 bg-[#121212]" />
            <div className="h-3 w-64 bg-white/5" />
          </div>
          
          {/* Grid inputs 2 */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="h-4 w-20 bg-white/10" />
              <div className="h-12 w-full border border-white/10 bg-[#121212]" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-20 bg-white/10" />
              <div className="h-12 w-full border border-white/10 bg-[#121212]" />
            </div>
          </div>
        </div>

        {/* Checkbox skeleton */}
        <div className="flex items-center gap-3 border border-white/10 bg-white/[0.02] p-4">
          <div className="h-5 w-5 border border-white/10 bg-[#121212]" />
          <div className="h-4 w-64 bg-white/10" />
        </div>

        {/* Button skeleton */}
        <div className="flex h-14 w-full items-center justify-center gap-2 border border-gold/20 bg-gold/15">
          <Loader2 className="h-5 w-5 animate-spin text-gold" />
          <span className="text-sm font-black text-gold/80">
            {isArabic ? "جاري التحضير..." : "Preparing..."}
          </span>
        </div>

        <div className="pt-2 text-center text-sm font-semibold text-white/60">
          {isArabic ? (
            <>
              لديك حساب بالفعل؟{" "}
              <Link href={`/${locale}/login`} className="text-gold-500 hover:text-gold-400 underline transition-colors font-bold">
                تسجيل الدخول
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link href={`/${locale}/login`} className="text-gold-500 hover:text-gold-400 underline transition-colors font-bold">
                Sign in
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function ClientRegisterForm({ locale }: { locale: Locale }) {
  const copy = authCopy[locale];
  const isArabic = locale === "ar";
  const { ready, state, setState } = useEphemeralState(clientRegisterDefaults);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Email verification states
  const [needsOtpVerify, setNeedsOtpVerify] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSubmitting, setOtpSubmitting] = useState(false);

  async function handleRegister() {
    setIsSubmitting(true);
    setError(null);

    // Basic Validation
    const cleanPhone = state.phone.replace(/\s+/g, "");
    if (!cleanPhone || cleanPhone.length < 13) {
      setError(isArabic ? "رقم الهاتف غير صحيح" : "Invalid phone number");
      setIsSubmitting(false);
      return;
    }
    if (!state.firstName || !state.lastName) {
      setError(isArabic ? "برجاء إدخال الاسم بالكامل" : "Please enter full name");
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
      const { email, ...registerData } = state;
      const payload: any = await postApiData<any, any>("/auth/register/client", {
        ...registerData,
        phone: cleanPhone
      });

      if (payload.needsVerification) {
        setRegisteredEmail(payload.email);
        setNeedsOtpVerify(true);
      } else {
        setSubmitted(true);
        applyAuthSuccess(locale, payload, true);
      }
    } catch (err) {
      setError(getLocalizedError(err instanceof Error ? err.message : "", locale));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVerifyOtp() {
    setOtpSubmitting(true);
    setOtpError(null);

    try {
      const payload = await postApiData<AuthSuccessResponse, { email: string; code: string }>("/auth/verify-registration-otp", {
        email: registeredEmail,
        code: otpCode
      });

      setSubmitted(true);
      
      setTimeout(() => {
        applyAuthSuccess(locale, payload, true);
      }, 1500);
    } catch (err) {
      setOtpError(getLocalizedError(err instanceof Error ? err.message : "", locale));
    } finally {
      setOtpSubmitting(false);
    }
  }

  if (!ready) return <FormSkeleton locale={locale} />;

  if (needsOtpVerify) {
    return (
      <div className="space-y-8 animate-fadeIn">
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-16 w-16 items-center justify-center border border-gold/40 bg-gold/10 text-gold">
             <ShieldCheck className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-black text-white">{isArabic ? "أدخل رمز التحقق" : "Verify Your Email"}</h2>
          <p className="text-sm leading-relaxed text-white/55">
            {isArabic 
              ? `لقد أرسلنا رمز تحقق مكون من 6 أرقام إلى بريدك الإلكتروني: ${registeredEmail}`
              : `We've sent a 6-digit verification code to your email: ${registeredEmail}`}
          </p>
        </div>

        <div className="space-y-6">
           <OtpBoxes value={otpCode} onChange={(val) => {
             setOtpCode(val);
             if (otpError) setOtpError(null);
           }} />

           {otpError && (
             <div className="border border-red-500/20 bg-red-500/5 p-4 text-center font-bold text-red-500">
               {otpError}
             </div>
           )}

           <button
             type="button"
             onClick={handleVerifyOtp}
             disabled={otpSubmitting || otpCode.length < 6}
             className="h-14 w-full bg-gold text-sm font-black uppercase text-black shadow-[4px_4px_0_#000] transition-transform active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-50"
           >
             {otpSubmitting ? (isArabic ? "... جاري التحقق" : "Verifying...") : isArabic ? "تفعيل الحساب" : "Activate Account"}
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {submitted ? (
        <div className="space-y-4 border border-success/30 bg-success/5 p-10 text-center">
          <ShieldCheck className="h-16 w-16 text-success mx-auto" />
          <h3 className="text-2xl font-black text-white">{isArabic ? "تم إنشاء الحساب!" : "Account Created!"}</h3>
          <p className="text-white/50">{isArabic ? "جاري تحويلك إلى لوحة التحكم..." : "Redirecting to dashboard..."}</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-6 border border-white/10 bg-white/[0.02] p-6">
            <h3 className="border-b border-white/10 pb-3 text-sm font-black uppercase tracking-[0.18em] text-gold">
              {isArabic ? "البيانات الأساسية" : "Basic Information"}
            </h3>
            
            <InputField
              label={isArabic ? "رقم الهاتف" : "Phone number"}
              value={state.phone}
              onChange={(phone) => setState({ ...state, phone: formatEgyptianPhone(phone) })}
              placeholder="01x xxxx xxxx"
              helperText={isArabic ? "مثال: 01012345678 (رقم هاتف مصري مكون من 11 رقماً)" : "E.g. 01012345678 (11-digit Egyptian phone number)"}
              suffix={<EgyptPhoneBadge locale={locale} />}
            />

            <div className="grid gap-6 sm:grid-cols-2">
              <InputField label={isArabic ? "الاسم الأول" : "First name"} value={state.firstName} onChange={(firstName) => setState({ ...state, firstName })} placeholder={isArabic ? "محمد" : "John"} />
              <InputField label={isArabic ? "اسم العائلة" : "Last name"} value={state.lastName} onChange={(lastName) => setState({ ...state, lastName })} placeholder={isArabic ? "أحمد" : "Doe"} />
            </div>
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

          <label className="group flex cursor-pointer items-center gap-3 border border-white/10 bg-white/[0.02] p-4">
            <div className="relative flex h-5 w-5 items-center justify-center">
                <input type="checkbox" checked={state.acceptedTerms} onChange={(e) => setState({ ...state, acceptedTerms: e.target.checked })} className="peer h-full w-full opacity-0 absolute cursor-pointer" />
                <div className="h-full w-full border border-white/20 bg-[#121212] transition peer-checked:border-gold peer-checked:bg-gold" />
                <Check className="pointer-events-none absolute h-3.5 w-3.5 text-black opacity-0 transition peer-checked:opacity-100" />
            </div>
            <span className="text-sm font-semibold text-white/50 transition group-hover:text-white">
              <TermsConsentText locale={locale} />
            </span>
          </label>

          <button 
              type="button" 
              onClick={handleRegister} 
              disabled={isSubmitting}
              className="flex h-14 w-full items-center justify-center gap-2 bg-gold text-sm font-black uppercase text-black shadow-[4px_4px_0_#000] transition-transform active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-50"
          >
            {isSubmitting ? (isArabic ? "جاري إنشاء الحساب..." : "Creating Account...") : (isArabic ? "إنشاء الحساب" : "Create Account")}
            {!isSubmitting && <ArrowUpRight className="h-5 w-5" />}
          </button>

          <div className="pt-2 text-center text-sm font-semibold text-white/60">
            {isArabic ? (
              <>
                لديك حساب بالفعل؟{" "}
                <Link href={`/${locale}/login`} className="text-gold-500 hover:text-gold-400 underline transition-colors font-bold">
                  تسجيل الدخول
                </Link>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <Link href={`/${locale}/login`} className="text-gold-500 hover:text-gold-400 underline transition-colors font-bold">
                  Sign in
                </Link>
              </>
            )}
          </div>

          {error && <div className="animate-shake border border-red-500/20 bg-red-500/5 p-4 text-center text-sm font-bold text-red-500">{error}</div>}
        </div>
      )}
    </div>
  );
}

export function WorkerRegisterForm({ locale }: { locale: Locale }) {
  const copy = authCopy[locale];
  const isArabic = locale === "ar";
  const { ready, state, setState } = useEphemeralState(workerRegisterDefaults);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleRegister() {
    setIsSubmitting(true);
    setError(null);

    // Validation
    const cleanPhone = state.phone.replace(/\s+/g, "");
    if (!cleanPhone || cleanPhone.length < 13) {
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
      const payload = await postApiData<AuthSuccessResponse, any>("/auth/register/worker", {
        ...state,
        phone: cleanPhone
      });
      setSubmitted(true);
      applyAuthSuccess(locale, payload, true);
    } catch (err) {
      setError(getLocalizedError(err instanceof Error ? err.message : "", locale));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!ready) return <FormSkeleton locale={locale} />;

  return (
    <div className="space-y-8 animate-fadeIn">
      {submitted ? (
        <div className="space-y-4 border border-success/30 bg-success/5 p-10 text-center">
          <ShieldCheck className="h-16 w-16 text-success mx-auto" />
          <h3 className="text-2xl font-black text-white">{isArabic ? "تم إرسال الطلب!" : "Application Sent!"}</h3>
          <p className="text-white/50">{isArabic ? "جاري مراجعة بياناتك من قبل الإدارة..." : "Your data is being reviewed by the admin..."}</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-6 border border-white/10 bg-white/[0.02] p-6">
            <h3 className="border-b border-white/10 pb-3 text-sm font-black uppercase tracking-[0.18em] text-gold">
              {isArabic ? "البيانات الشخصية" : "Personal Information"}
            </h3>
            
            <InputField 
              label={isArabic ? "رقم الهاتف" : "Phone number"} 
              value={state.phone} 
              onChange={(phone) => setState({ ...state, phone: formatEgyptianPhone(phone) })} 
              placeholder="01x xxxx xxxx" 
              helperText={isArabic ? "مثال: 01012345678 (رقم هاتف مصري مكون من 11 رقماً)" : "E.g. 01012345678 (11-digit Egyptian phone number)"}
              suffix={<EgyptPhoneBadge locale={locale} />}
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
                variant="auth"
              />
            </div>
          </div>

          <div className="space-y-6 border border-white/10 bg-white/[0.02] p-6">
            <h3 className="border-b border-white/10 pb-3 text-sm font-black uppercase tracking-[0.18em] text-gold">
              {isArabic ? "مستندات التوثيق" : "Verification Documents"}
            </h3>
            
            <div className="grid gap-6 sm:grid-cols-2">
              <ImageUpload isArabic={isArabic} purpose="registration-document" variant="auth" label={isArabic ? "صورة البطاقة (أمام)" : "ID Front"} value={state.nationalIdFront} onChange={(url) => setState({ ...state, nationalIdFront: url })} />
              <ImageUpload isArabic={isArabic} purpose="registration-document" variant="auth" label={isArabic ? "صورة البطاقة (خلف)" : "ID Back"} value={state.nationalIdBack} onChange={(url) => setState({ ...state, nationalIdBack: url })} />
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

          <label className="group flex cursor-pointer items-center gap-3 border border-white/10 bg-white/[0.02] p-4">
            <div className="relative flex h-5 w-5 items-center justify-center">
                <input type="checkbox" checked={state.acceptedTerms} onChange={(e) => setState({ ...state, acceptedTerms: e.target.checked })} className="peer h-full w-full opacity-0 absolute cursor-pointer" />
                <div className="h-full w-full border border-white/20 bg-[#121212] transition peer-checked:border-gold peer-checked:bg-gold" />
                <Check className="pointer-events-none absolute h-3.5 w-3.5 text-black opacity-0 transition peer-checked:opacity-100" />
            </div>
            <span className="text-sm font-semibold text-white/50 transition group-hover:text-white">
              <TermsConsentText locale={locale} />
            </span>
          </label>

          <button 
              type="button" 
              onClick={handleRegister} 
              disabled={isSubmitting}
              className="flex h-14 w-full items-center justify-center gap-2 bg-gold text-sm font-black uppercase text-black shadow-[4px_4px_0_#000] transition-transform active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-50"
          >
            {isSubmitting ? (isArabic ? "جاري إرسال الطلب..." : "Submitting Application...") : (isArabic ? "إرسال طلب الانضمام" : "Submit Application")}
            {!isSubmitting && <ArrowUpRight className="h-5 w-5" />}
          </button>

          <div className="pt-2 text-center text-sm font-semibold text-white/60">
            {isArabic ? (
              <>
                لديك حساب بالفعل؟{" "}
                <Link href={`/${locale}/login`} className="text-gold-500 hover:text-gold-400 underline transition-colors font-bold">
                  تسجيل الدخول
                </Link>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <Link href={`/${locale}/login`} className="text-gold-500 hover:text-gold-400 underline transition-colors font-bold">
                  Sign in
                </Link>
              </>
            )}
          </div>

          {error && <div className="animate-shake border border-red-500/20 bg-red-500/5 p-4 text-center text-sm font-bold text-red-500">{error}</div>}
        </div>
      )}
    </div>
  );
}

export function VendorRegisterForm({ locale }: { locale: Locale }) {
  const copy = authCopy[locale];
  const isArabic = locale === "ar";
  const { ready, state, setState } = useEphemeralState(vendorRegisterDefaults);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleRegister() {
    setIsSubmitting(true);
    setError(null);

    // Validation
    const cleanPhone = state.phone.replace(/\s+/g, "");
    if (!cleanPhone || cleanPhone.length < 13) {
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
      const payload = await postApiData<AuthSuccessResponse, any>("/auth/register/vendor", {
        ...state,
        phone: cleanPhone
      });
      setSubmitted(true);
      applyAuthSuccess(locale, payload, true);
    } catch (err) {
      setError(getLocalizedError(err instanceof Error ? err.message : "", locale));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!ready) return <FormSkeleton locale={locale} />;

  return (
    <div className="space-y-8 animate-fadeIn">
      {submitted ? (
        <div className="space-y-4 border border-success/30 bg-success/5 p-10 text-center">
          <ShieldCheck className="h-16 w-16 text-success mx-auto" />
          <h3 className="text-2xl font-black text-white">{isArabic ? "تم إرسال الطلب!" : "Account Created!"}</h3>
          <p className="text-white/50">{isArabic ? "جاري تحويلك إلى لوحة التحكم..." : "Redirecting to dashboard..."}</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-6 border border-white/10 bg-white/[0.02] p-6">
            <h3 className="border-b border-white/10 pb-3 text-sm font-black uppercase tracking-[0.18em] text-gold">
              {isArabic ? "بيانات المتجر" : "Store Information"}
            </h3>
            
            <InputField 
              label={isArabic ? "رقم الهاتف" : "Phone number"} 
              value={state.phone} 
              onChange={(phone) => setState({ ...state, phone: formatEgyptianPhone(phone) })} 
              placeholder="01x xxxx xxxx" 
              helperText={isArabic ? "مثال: 01012345678 (رقم هاتف مصري مكون من 11 رقماً)" : "E.g. 01012345678 (11-digit Egyptian phone number)"}
              suffix={<EgyptPhoneBadge locale={locale} />}
            />
            <InputField label={isArabic ? "اسم المتجر" : "Store Name"} value={state.storeName} onChange={(n) => setState({ ...state, storeName: n })} placeholder={isArabic ? "الشركة العربية للمستلزمات" : "Arab Supply Co."} />
            <SelectField
                label={isArabic ? "تصنيف المتجر" : "Store Category"}
                value={state.category}
                options={vendorCategories.map(c => ({ value: c.value, label: isArabic ? c.labelAr : c.labelEn }))}
                onChange={(cat) => setState({ ...state, category: cat })}
                placeholder={isArabic ? "اختر تصنيف المتجر" : "Select store category"}
                variant="auth"
            />
          </div>

          <div className="space-y-6 border border-white/10 bg-white/[0.02] p-6">
            <h3 className="border-b border-white/10 pb-3 text-sm font-black uppercase tracking-[0.18em] text-gold">
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

          <div className="space-y-6 border border-white/10 bg-white/[0.02] p-6">
            <h3 className="border-b border-white/10 pb-3 text-sm font-black uppercase tracking-[0.18em] text-gold">
              {isArabic ? "مستندات التوثيق" : "Verification Documents"}
            </h3>
            
            <div className="grid gap-6 sm:grid-cols-2">
              <ImageUpload isArabic={isArabic} purpose="registration-document" variant="auth" label={isArabic ? "السجل التجاري" : "Commercial Record"} value={state.commercialRecord} onChange={(url) => setState({ ...state, commercialRecord: url })} />
              <ImageUpload isArabic={isArabic} purpose="registration-document" variant="auth" label={isArabic ? "البطاقة الضريبية" : "Tax Card"} value={state.taxCard} onChange={(url) => setState({ ...state, taxCard: url })} />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <SelectField
                label={isArabic ? "المحافظة" : "Governorate"}
                value={state.governorate}
                options={egyptianGovernorates.map(g => ({ value: g.value, label: isArabic ? g.labelAr : g.labelEn }))}
                onChange={(gov) => setState({ ...state, governorate: gov, city: "" })}
                placeholder={isArabic ? "اختر المحافظة" : "Select governorate"}
                variant="auth"
              />
              <SelectField
                label={isArabic ? "المدينة / المنطقة" : "City / Area"}
                value={state.city}
                disabled={!state.governorate}
                options={(majorCities[state.governorate] || []).map(c => ({ value: c.value, label: isArabic ? c.labelAr : c.labelEn }))}
                onChange={(city) => setState({ ...state, city })}
                placeholder={isArabic ? "اختر المدينة" : "Select city"}
                variant="auth"
              />
            </div>

            <div className="space-y-3">
              <span className="text-xs font-black uppercase tracking-widest text-white/70">{isArabic ? "تحديد الموقع على الخريطة" : "Store Location"}</span>
              <div className="h-64 overflow-hidden border border-white/20">
                <MapPicker lat={state.latitude} lng={state.longitude} isArabic={isArabic} onChange={(lat, lng) => setState({ ...state, latitude: lat, longitude: lng })} />
              </div>
            </div>

            <InputField label={isArabic ? "العنوان التفصيلي" : "Detailed address"} value={state.address} onChange={(address) => setState({ ...state, address })} textarea rows={2} />
          </div>

          <label className="group flex cursor-pointer items-center gap-3 border border-white/10 bg-white/[0.02] p-4">
            <div className="relative flex h-5 w-5 items-center justify-center">
                <input type="checkbox" checked={state.acceptedTerms} onChange={(e) => setState({ ...state, acceptedTerms: e.target.checked })} className="peer h-full w-full opacity-0 absolute cursor-pointer" />
                <div className="h-full w-full border border-white/20 bg-[#121212] transition peer-checked:border-gold peer-checked:bg-gold" />
                <Check className="pointer-events-none absolute h-3.5 w-3.5 text-black opacity-0 transition peer-checked:opacity-100" />
            </div>
            <span className="text-sm font-semibold text-white/50 transition group-hover:text-white">
              <TermsConsentText locale={locale} />
            </span>
          </label>

          <button 
              type="button" 
              onClick={handleRegister} 
              disabled={isSubmitting}
              className="flex h-14 w-full items-center justify-center gap-2 bg-gold text-sm font-black uppercase text-black shadow-[4px_4px_0_#000] transition-transform active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-50"
          >
            {isSubmitting ? (isArabic ? "جاري إنشاء الحساب..." : "Creating Account...") : (isArabic ? "إنشاء حساب المتجر" : "Create Store Account")}
            {!isSubmitting && <ArrowUpRight className="h-5 w-5" />}
          </button>

          <div className="pt-2 text-center text-sm font-semibold text-white/60">
            {isArabic ? (
              <>
                لديك حساب بالفعل؟{" "}
                <Link href={`/${locale}/login`} className="text-gold-500 hover:text-gold-400 underline transition-colors font-bold">
                  تسجيل الدخول
                </Link>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <Link href={`/${locale}/login`} className="text-gold-500 hover:text-gold-400 underline transition-colors font-bold">
                  Sign in
                </Link>
              </>
            )}
          </div>

          {error && <div className="animate-shake border border-red-500/20 bg-red-500/5 p-4 text-center text-sm font-bold text-red-500">{error}</div>}
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
      setError(getLocalizedError(err instanceof Error ? err.message : "", locale));
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
      setError(getLocalizedError(err instanceof Error ? err.message : "", locale));
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
