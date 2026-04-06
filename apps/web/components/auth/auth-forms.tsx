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
  ShieldCheck
} from "lucide-react";

import { postApiData } from "@/lib/api";
import { getDashboardRoute, saveAuthSession, type AuthRole } from "@/lib/auth-session";
import { authCopy } from "@/lib/copy";
import type { Locale } from "@/lib/locales";
import { cn } from "@/lib/utils";

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
  acceptedTerms: boolean;
};

type WorkerRegisterState = {
  phone: string;
  otp: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  dob: string;
  specializations: string[];
  experience: string;
  bio: string;
  workAreas: string;
  schedule: string;
  tools: string;
  nationalIdFront: string;
  nationalIdBack: string;
  selfieWithId: string;
  utilityBill: string;
  guarantorName: string;
  guarantorPhone: string;
  acceptedTerms: boolean;
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
  acceptedTerms: false
};

const workerRegisterDefaults: WorkerRegisterState = {
  phone: "+20",
  otp: "",
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
  dob: "",
  specializations: [],
  experience: "",
  bio: "",
  workAreas: "",
  schedule: "",
  tools: "",
  nationalIdFront: "",
  nationalIdBack: "",
  selfieWithId: "",
  utilityBill: "",
  guarantorName: "",
  guarantorPhone: "",
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
    <div className="mb-8 flex items-center gap-3">
      {Array.from({ length: total }).map((_, index) => {
        const active = index <= current;

        return (
          <div key={index} className="flex flex-1 items-center gap-3">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold transition",
                active
                  ? "border-primary-600 bg-primary-600 text-white"
                  : "border-dark-200 bg-surface-soft text-dark-400"
              )}
            >
              {active && index < current ? <Check className="h-4 w-4" /> : index + 1}
            </div>
            {index < total - 1 ? (
              <div className={cn("h-px flex-1", active ? "bg-primary-300" : "bg-dark-200")} />
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
      <span className="text-sm font-medium text-dark-700">{label}</span>
      {textarea ? (
        <textarea
          value={value}
          rows={rows}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="min-h-28 w-full rounded-[1.2rem] border border-dark-200 bg-white px-4 py-3 text-body text-dark-950 transition placeholder:text-dark-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-500/30"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="h-12 w-full rounded-[1.2rem] border border-dark-200 bg-white px-4 text-body text-dark-950 transition placeholder:text-dark-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-500/30"
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
          className="h-14 w-12 rounded-[1.1rem] border border-dark-200 bg-white text-center text-xl font-semibold text-dark-950 transition focus:border-primary-400 focus:ring-2 focus:ring-primary-500/30 sm:w-14"
        />
      ))}
    </div>
  );
}

function applyAuthSuccess(locale: Locale, payload: AuthSuccessResponse, remember: boolean, router: ReturnType<typeof useRouter>) {
  saveAuthSession(
    {
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken,
      role: payload.user.role,
      firstName: payload.user.firstName
    },
    remember
  );

  router.push(getDashboardRoute(locale, payload.user.role));
}

export function LoginForm({ locale }: { locale: Locale }) {
  const copy = authCopy[locale];
  const isArabic = locale === "ar";
  const router = useRouter();
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
      applyAuthSuccess(locale, payload, remember, router);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : isArabic ? "تعذر تسجيل الدخول" : "Unable to sign in.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <span className="inline-flex rounded-full bg-primary-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary-700">
          {copy.intro}
        </span>
        <h2 className="mt-4 text-3xl font-semibold text-dark-950">{copy.loginTitle}</h2>
        <p className="mt-3 text-body text-dark-500">{copy.loginBody}</p>
      </div>

      <div className="grid gap-5">
        <InputField
          label={isArabic ? "رقم الهاتف" : "Phone number"}
          value={phone}
          onChange={setPhone}
          placeholder="+20 100 000 0000"
        />

        <label className="block space-y-2 text-start">
          <span className="text-sm font-medium text-dark-700">{isArabic ? "كلمة المرور" : "Password"}</span>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-12 w-full rounded-[1.2rem] border border-dark-200 bg-white px-4 pe-12 text-body text-dark-950 transition focus:border-primary-400 focus:ring-2 focus:ring-primary-500/30"
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute inset-y-0 end-3 flex items-center text-dark-500 transition hover:text-dark-950"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </label>

        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-dark-500">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
              className="h-4 w-4 rounded border-dark-300 text-primary-600"
            />
            <span>{isArabic ? "تذكرني" : "Remember me"}</span>
          </label>
          <Link href={`/${locale}/forgot-password`} className="font-medium text-primary-700 hover:text-primary-800">
            {isArabic ? "نسيت كلمة المرور؟" : "Forgot password?"}
          </Link>
        </div>

        <button
          type="button"
          onClick={() => void handleLogin()}
          disabled={isSubmitting}
          className="inline-flex h-12 items-center justify-center rounded-[1.2rem] bg-primary-600 px-6 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (isArabic ? "... جاري" : "Signing in...") : isArabic ? "تسجيل الدخول" : "Sign in"}
        </button>

        {submitted ? (
          <div className="rounded-[1.4rem] border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
            {copy.success}
          </div>
        ) : null}

        {error ? <div className="rounded-[1.4rem] border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">{error}</div> : null}

        <div className="relative py-2 text-center text-sm text-dark-400">
          <span className="relative z-10 bg-white px-3">{isArabic ? "أو" : "or"}</span>
          <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-dark-200" />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href={`/${locale}/register/client`}
            className="inline-flex h-12 items-center justify-center rounded-[1.2rem] border border-dark-200 bg-surface-soft px-4 text-sm font-semibold text-dark-900 transition hover:border-primary-300 hover:text-primary-700"
          >
            {isArabic ? "تسجيل عميل" : "Register as Client"}
          </Link>
          <Link
            href={`/${locale}/register/worker`}
            className="inline-flex h-12 items-center justify-center rounded-[1.2rem] border border-dark-200 bg-surface-soft px-4 text-sm font-semibold text-dark-900 transition hover:border-primary-300 hover:text-primary-700"
          >
            {isArabic ? "تسجيل عامل" : "Register as Worker"}
          </Link>
        </div>
      </div>
    </div>
  );
}

export function ClientRegisterForm({ locale }: { locale: Locale }) {
  const copy = authCopy[locale];
  const isArabic = locale === "ar";
  const router = useRouter();
  const { ready, state, setState } = usePersistentState("osta-client-register", clientRegisterDefaults);
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleRegister() {
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = await postApiData<
        AuthSuccessResponse,
        {
          firstName: string;
          lastName: string;
          phone: string;
          email: string;
          password: string;
          confirmPassword: string;
        }
      >("/auth/register/client", {
        firstName: state.firstName,
        lastName: state.lastName,
        phone: state.phone,
        email: state.email,
        password: state.password,
        confirmPassword: state.confirmPassword
      });

      window.localStorage.removeItem("osta-client-register");
      setSubmitted(true);
      applyAuthSuccess(locale, payload, true, router);
    } catch (registerError) {
      setError(registerError instanceof Error ? registerError.message : isArabic ? "تعذر إنشاء الحساب" : "Unable to create account.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!ready) {
    return <div className="text-sm text-dark-500">{isArabic ? "جاري التحضير..." : "Preparing form..."}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold text-dark-950">{copy.registerClientTitle}</h2>
        <p className="mt-3 text-body text-dark-500">
          {isArabic
            ? "تجربة تسجيل متعددة الخطوات مع حفظ تلقائي حتى لا تضيع البيانات عند التحديث."
            : "A multi-step registration flow with local persistence so progress stays saved on refresh."}
        </p>
      </div>

      <StepIndicator current={step} total={3} />

      {submitted ? (
        <div className="rounded-[1.6rem] border border-success/30 bg-success/10 p-6 text-start">
          <ShieldCheck className="h-8 w-8 text-success" />
          <h3 className="mt-4 text-2xl font-semibold text-dark-950">{isArabic ? "تم تجهيز الحساب" : "Account flow prepared"}</h3>
          <p className="mt-3 text-dark-600">{copy.success}</p>
        </div>
      ) : (
        <div className="space-y-5">
          {step === 0 ? (
            <>
              <InputField
                label={isArabic ? "رقم الهاتف" : "Phone number"}
                value={state.phone}
                onChange={(phone) => setState({ ...state, phone })}
                placeholder="+20 100 000 0000"
              />
            </>
          ) : null}

          {step === 1 ? (
            <>
              <div className="grid gap-5 sm:grid-cols-2">
                <InputField
                  label={isArabic ? "الاسم الأول" : "First name"}
                  value={state.firstName}
                  onChange={(firstName) => setState({ ...state, firstName })}
                />
                <InputField
                  label={isArabic ? "اسم العائلة" : "Last name"}
                  value={state.lastName}
                  onChange={(lastName) => setState({ ...state, lastName })}
                />
              </div>
              <InputField
                label={isArabic ? "البريد الإلكتروني" : "Email"}
                value={state.email}
                onChange={(email) => setState({ ...state, email })}
                type="email"
              />
              <div className="grid gap-5 sm:grid-cols-2">
                <InputField
                  label={isArabic ? "كلمة المرور" : "Password"}
                  value={state.password}
                  onChange={(password) => setState({ ...state, password })}
                  type="password"
                />
                <InputField
                  label={isArabic ? "تأكيد كلمة المرور" : "Confirm password"}
                  value={state.confirmPassword}
                  onChange={(confirmPassword) => setState({ ...state, confirmPassword })}
                  type="password"
                />
              </div>
            </>
          ) : null}

          {step === 2 ? (
            <>
              <div className="grid gap-5 sm:grid-cols-2">
                <InputField
                  label={isArabic ? "المحافظة" : "Governorate"}
                  value={state.governorate}
                  onChange={(governorate) => setState({ ...state, governorate })}
                />
                <InputField
                  label={isArabic ? "المدينة" : "City"}
                  value={state.city}
                  onChange={(city) => setState({ ...state, city })}
                />
              </div>
              <InputField
                label={isArabic ? "العنوان التفصيلي" : "Detailed address"}
                value={state.address}
                onChange={(address) => setState({ ...state, address })}
                textarea
                rows={3}
              />

              <label className="flex items-center gap-3 rounded-[1.2rem] border border-dark-200 bg-surface-soft px-4 py-3 text-sm text-dark-700">
                <input
                  type="checkbox"
                  checked={state.acceptedTerms}
                  onChange={(event) => setState({ ...state, acceptedTerms: event.target.checked })}
                  className="h-4 w-4 rounded border-dark-300 text-primary-600"
                />
                <span>{copy.terms}</span>
              </label>
            </>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStep((current) => Math.max(current - 1, 0))}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-dark-200 px-5 text-sm font-semibold text-dark-700 transition hover:border-dark-400"
            >
              {isArabic ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              {isArabic ? "السابق" : "Back"}
            </button>

            {step < 2 ? (
              <button
                type="button"
                onClick={() => setStep((current) => Math.min(current + 1, 2))}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-primary-600 px-5 text-sm font-semibold text-white transition hover:bg-primary-700"
              >
                {copy.submit}
                {isArabic ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void handleRegister()}
                disabled={isSubmitting}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-primary-600 px-5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (isArabic ? "... جاري" : "Creating...") : isArabic ? "إنشاء الحساب" : "Create account"}
                {isArabic ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
              </button>
            )}
          </div>

          {error ? <div className="rounded-[1.4rem] border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">{error}</div> : null}
        </div>
      )}
    </div>
  );
}

export function WorkerRegisterForm({ locale }: { locale: Locale }) {
  const copy = authCopy[locale];
  const isArabic = locale === "ar";
  const router = useRouter();
  const { ready, state, setState } = usePersistentState("osta-worker-register", workerRegisterDefaults);
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const specializations = useMemo(
    () =>
      isArabic
        ? ["كهرباء", "سباكة", "نجارة", "دهانات", "تكييف", "لحام"]
        : ["Electrical", "Plumbing", "Carpentry", "Painting", "AC", "Welding"],
    [isArabic]
  );

  async function handleWorkerRegister() {
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = await postApiData<
        AuthSuccessResponse,
        {
          firstName: string;
          lastName: string;
          phone: string;
          email: string;
          password: string;
          confirmPassword: string;
        }
      >("/auth/register/worker", {
        firstName: state.firstName,
        lastName: state.lastName,
        phone: state.phone,
        email: state.email,
        password: state.password,
        confirmPassword: state.confirmPassword
      });

      window.localStorage.removeItem("osta-worker-register");
      setSubmitted(true);
      applyAuthSuccess(locale, payload, true, router);
    } catch (registerError) {
      setError(registerError instanceof Error ? registerError.message : isArabic ? "تعذر إرسال الطلب" : "Unable to submit application.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!ready) {
    return <div className="text-sm text-dark-500">{isArabic ? "جاري التحضير..." : "Preparing form..."}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold text-dark-950">{copy.registerWorkerTitle}</h2>
        <p className="mt-3 text-body text-dark-500">
          {isArabic
            ? "مسار من 5 خطوات يشمل البيانات المهنية والمستندات مع حفظ تلقائي للتقدم."
            : "A 5-step worker onboarding flow covering profile, professional setup, and verification docs."}
        </p>
      </div>

      <StepIndicator current={step} total={5} />

      {submitted ? (
        <div className="rounded-[1.6rem] border border-success/30 bg-success/10 p-6 text-start">
          <ShieldCheck className="h-8 w-8 text-success" />
          <h3 className="mt-4 text-2xl font-semibold text-dark-950">
            {isArabic ? "طلبك جاهز للمراجعة" : "Application prepared for review"}
          </h3>
          <p className="mt-3 text-dark-600">
            {isArabic
              ? "هذه واجهة تمهيدية للرحلة الكاملة، وتم حفظ البيانات محليًا كما هو مطلوب في الخطة."
              : "This starter flow saves progress locally and prepares the full verification journey defined in the plan."}
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {step === 0 ? (
            <>
              <InputField
                label={isArabic ? "رقم الهاتف" : "Phone number"}
                value={state.phone}
                onChange={(phone) => setState({ ...state, phone })}
                placeholder="+20 100 000 0000"
              />
            </>
          ) : null}

          {step === 1 ? (
            <>
              <div className="grid gap-5 sm:grid-cols-2">
                <InputField
                  label={isArabic ? "الاسم الأول" : "First name"}
                  value={state.firstName}
                  onChange={(firstName) => setState({ ...state, firstName })}
                />
                <InputField
                  label={isArabic ? "اسم العائلة" : "Last name"}
                  value={state.lastName}
                  onChange={(lastName) => setState({ ...state, lastName })}
                />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <InputField
                  label={isArabic ? "البريد الإلكتروني" : "Email"}
                  value={state.email}
                  onChange={(email) => setState({ ...state, email })}
                  type="email"
                />
                <InputField
                  label={isArabic ? "تاريخ الميلاد" : "Date of birth"}
                  value={state.dob}
                  onChange={(dob) => setState({ ...state, dob })}
                  type="date"
                />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <InputField
                  label={isArabic ? "كلمة المرور" : "Password"}
                  value={state.password}
                  onChange={(password) => setState({ ...state, password })}
                  type="password"
                />
                <InputField
                  label={isArabic ? "تأكيد كلمة المرور" : "Confirm password"}
                  value={state.confirmPassword}
                  onChange={(confirmPassword) => setState({ ...state, confirmPassword })}
                  type="password"
                />
              </div>
            </>
          ) : null}

          {step === 2 ? (
            <>
              <div className="space-y-3 text-start">
                <span className="text-sm font-medium text-dark-700">{isArabic ? "التخصصات" : "Specializations"}</span>
                <div className="flex flex-wrap gap-3">
                  {specializations.map((item) => {
                    const selected = state.specializations.includes(item);

                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() =>
                          setState({
                            ...state,
                            specializations: selected
                              ? state.specializations.filter((current) => current !== item)
                              : [...state.specializations, item]
                          })
                        }
                        className={cn(
                          "rounded-full border px-4 py-2 text-sm font-medium transition",
                          selected
                            ? "border-primary-600 bg-primary-600 text-white"
                            : "border-dark-200 bg-surface-soft text-dark-700 hover:border-primary-300"
                        )}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <InputField
                  label={isArabic ? "سنوات الخبرة" : "Years of experience"}
                  value={state.experience}
                  onChange={(experience) => setState({ ...state, experience })}
                />
                <InputField
                  label={isArabic ? "مناطق العمل" : "Work areas"}
                  value={state.workAreas}
                  onChange={(workAreas) => setState({ ...state, workAreas })}
                  placeholder={isArabic ? "القاهرة الجديدة، مدينة نصر" : "New Cairo, Nasr City"}
                />
              </div>
              <InputField
                label={isArabic ? "نبذة مهنية" : "Professional bio"}
                value={state.bio}
                onChange={(bio) => setState({ ...state, bio })}
                textarea
              />
              <div className="grid gap-5 sm:grid-cols-2">
                <InputField
                  label={isArabic ? "جدول العمل" : "Work schedule"}
                  value={state.schedule}
                  onChange={(schedule) => setState({ ...state, schedule })}
                  placeholder={isArabic ? "السبت - الخميس 10ص - 8م" : "Sat-Thu 10AM-8PM"}
                />
                <InputField
                  label={isArabic ? "الأدوات المتاحة" : "Available tools"}
                  value={state.tools}
                  onChange={(tools) => setState({ ...state, tools })}
                  placeholder={isArabic ? "مثقاب، عدة سباكة، سلم" : "Drill, plumbing kit, ladder"}
                />
              </div>
            </>
          ) : null}

          {step === 3 ? (
            <>
              <div className="grid gap-5 sm:grid-cols-2">
                <InputField
                  label={isArabic ? "صورة البطاقة - الوجه الأمامي" : "National ID front"}
                  value={state.nationalIdFront}
                  onChange={(nationalIdFront) => setState({ ...state, nationalIdFront })}
                  placeholder={isArabic ? "اسم الملف أو الرابط" : "File name or URL"}
                />
                <InputField
                  label={isArabic ? "صورة البطاقة - الخلفية" : "National ID back"}
                  value={state.nationalIdBack}
                  onChange={(nationalIdBack) => setState({ ...state, nationalIdBack })}
                  placeholder={isArabic ? "اسم الملف أو الرابط" : "File name or URL"}
                />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <InputField
                  label={isArabic ? "سيلفي مع البطاقة" : "Selfie with ID"}
                  value={state.selfieWithId}
                  onChange={(selfieWithId) => setState({ ...state, selfieWithId })}
                  placeholder={isArabic ? "اسم الملف أو الرابط" : "File name or URL"}
                />
                <InputField
                  label={isArabic ? "فاتورة مرافق" : "Utility bill"}
                  value={state.utilityBill}
                  onChange={(utilityBill) => setState({ ...state, utilityBill })}
                  placeholder={isArabic ? "اسم الملف أو الرابط" : "File name or URL"}
                />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <InputField
                  label={isArabic ? "اسم الضامن" : "Guarantor name"}
                  value={state.guarantorName}
                  onChange={(guarantorName) => setState({ ...state, guarantorName })}
                />
                <InputField
                  label={isArabic ? "رقم هاتف الضامن" : "Guarantor phone"}
                  value={state.guarantorPhone}
                  onChange={(guarantorPhone) => setState({ ...state, guarantorPhone })}
                />
              </div>
            </>
          ) : null}

          {step === 4 ? (
            <>
              <div className="rounded-[1.6rem] border border-dark-200 bg-surface-soft p-5 text-start text-sm text-dark-700">
                <h3 className="text-lg font-semibold text-dark-950">{isArabic ? "مراجعة سريعة" : "Quick review"}</h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <p>{isArabic ? `الاسم: ${state.firstName} ${state.lastName}` : `Name: ${state.firstName} ${state.lastName}`}</p>
                  <p>{isArabic ? `الهاتف: ${state.phone}` : `Phone: ${state.phone}`}</p>
                  <p>
                    {isArabic ? "التخصصات: " : "Specializations: "}
                    {state.specializations.join(" - ") || (isArabic ? "لم يتم التحديد" : "Not selected")}
                  </p>
                  <p>{isArabic ? `الخبرة: ${state.experience}` : `Experience: ${state.experience}`}</p>
                </div>
              </div>

              <label className="flex items-center gap-3 rounded-[1.2rem] border border-dark-200 bg-surface-soft px-4 py-3 text-sm text-dark-700">
                <input
                  type="checkbox"
                  checked={state.acceptedTerms}
                  onChange={(event) => setState({ ...state, acceptedTerms: event.target.checked })}
                  className="h-4 w-4 rounded border-dark-300 text-primary-600"
                />
                <span>{copy.terms}</span>
              </label>
            </>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStep((current) => Math.max(current - 1, 0))}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-dark-200 px-5 text-sm font-semibold text-dark-700 transition hover:border-dark-400"
            >
              {isArabic ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              {isArabic ? "السابق" : "Back"}
            </button>

            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep((current) => Math.min(current + 1, 4))}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-primary-600 px-5 text-sm font-semibold text-white transition hover:bg-primary-700"
              >
                {copy.submit}
                {isArabic ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void handleWorkerRegister()}
                disabled={isSubmitting}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-primary-600 px-5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (isArabic ? "... جاري" : "Submitting...") : isArabic ? "إرسال للمراجعة" : "Submit for review"}
                {isArabic ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
              </button>
            )}
          </div>

          {error ? <div className="rounded-[1.4rem] border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">{error}</div> : null}
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

  if (done) {
    return (
      <div className="rounded-[1.6rem] border border-success/30 bg-success/10 p-6 text-start">
        <ShieldCheck className="h-8 w-8 text-success" />
        <h2 className="mt-4 text-2xl font-semibold text-dark-950">
          {isArabic ? "تم تحديث كلمة المرور" : "Password flow completed"}
        </h2>
        <p className="mt-3 text-dark-600">{copy.success}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold text-dark-950">{copy.forgotPasswordTitle}</h2>
        <p className="mt-3 text-body text-dark-500">
          {isArabic
            ? "أدخل رقم الهاتف، استقبل الرمز، ثم اختر كلمة مرور جديدة."
            : "Enter your phone number, verify the code, and choose a new password."}
        </p>
      </div>

      <StepIndicator current={step} total={3} />

      {step === 0 ? (
        <InputField
          label={isArabic ? "رقم الهاتف" : "Phone number"}
          value={phone}
          onChange={setPhone}
          placeholder="+20 100 000 0000"
        />
      ) : null}

      {step === 1 ? (
        <div className="space-y-2">
          <span className="text-sm font-medium text-dark-700">{isArabic ? "رمز التحقق" : "Verification code"}</span>
          <OtpBoxes value={otp} onChange={setOtp} />
        </div>
      ) : null}

      {step === 2 ? (
        <div className="grid gap-5 sm:grid-cols-2">
          <InputField
            label={isArabic ? "كلمة المرور الجديدة" : "New password"}
            value={password}
            onChange={setPassword}
            type="password"
          />
          <InputField
            label={isArabic ? "تأكيد كلمة المرور" : "Confirm password"}
            value={confirmPassword}
            onChange={setConfirmPassword}
            type="password"
          />
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={() => setStep((current) => Math.max(current - 1, 0))}
          className="inline-flex h-11 items-center gap-2 rounded-full border border-dark-200 px-5 text-sm font-semibold text-dark-700 transition hover:border-dark-400"
        >
          {isArabic ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          {isArabic ? "السابق" : "Back"}
        </button>

        {step < 2 ? (
          <button
            type="button"
            onClick={() => setStep((current) => Math.min(current + 1, 2))}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-primary-600 px-5 text-sm font-semibold text-white transition hover:bg-primary-700"
          >
            {copy.submit}
            {isArabic ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setDone(true)}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-primary-600 px-5 text-sm font-semibold text-white transition hover:bg-primary-700"
          >
            {isArabic ? "تحديث كلمة المرور" : "Update password"}
            {isArabic ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
          </button>
        )}
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
    if (seconds === 0) {
      return;
    }

    const timer = window.setTimeout(() => setSeconds((current) => current - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [seconds]);

  useEffect(() => {
    if (otp.length === 6) {
      const timer = window.setTimeout(() => setDone(true), 300);
      return () => window.clearTimeout(timer);
    }
  }, [otp]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold text-dark-950">{copy.otpTitle}</h2>
        <p className="mt-3 text-body text-dark-500">
          {isArabic
            ? "أدخل الرمز المكوّن من 6 أرقام. سيتم التحقق تلقائيًا بعد اكتماله."
            : "Enter the 6-digit code. Verification will trigger automatically once complete."}
        </p>
      </div>

      <OtpBoxes value={otp} onChange={setOtp} />

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-dark-500">
        <p>
          {copy.timerLabel} <span className="font-semibold text-dark-900">{seconds}s</span>
        </p>
        <button
          type="button"
          disabled={seconds > 0}
          onClick={() => {
            setSeconds(60);
            setOtp("");
            setDone(false);
          }}
          className="font-semibold text-primary-700 disabled:cursor-not-allowed disabled:text-dark-300"
        >
          {copy.resend}
        </button>
      </div>

      {done ? (
        <div className="rounded-[1.4rem] border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
          {copy.success}
        </div>
      ) : null}
    </div>
  );
}
