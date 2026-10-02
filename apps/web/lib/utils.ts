import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Locale } from "./locales";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const ERROR_TRANSLATIONS: Record<string, Record<Locale, string>> = {
  INTERNAL_SERVER_ERROR: {
    ar: "حدث خطأ داخلي في الخادم. يرجى التأكد من إعدادات قاعدة البيانات واتصال الخادم بالإنترنت.",
    en: "An internal server error occurred. Please check database settings and server connectivity.",
  },
  INVALID_CREDENTIALS: {
    ar: "رقم الهاتف أو كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى.",
    en: "Incorrect phone number or password. Please try again.",
  },
  PHONE_EXISTS: {
    ar: "رقم الهاتف هذا مسجل بالفعل. يرجى تسجيل الدخول أو استعادة كلمة المرور.",
    en: "This phone number is already registered. Please sign in or reset your password.",
  },
  PROFILE_EXISTS: {
    ar: "هذا الرقم مسجل بالفعل كفني على المنصة. يمكنك تسجيل الدخول إلى حسابك أو استعادة كلمة المرور إذا نسيتها.",
    en: "An account for this role already exists with this phone number. Please sign in or reset your password.",
  },
  EMAIL_EXISTS: {
    ar: "البريد الإلكتروني هذا مسجل بالفعل.",
    en: "This email is already registered.",
  },
  EMAIL_ALREADY_EXISTS: {
    ar: "البريد الإلكتروني هذا مسجل بالفعل لحساب آخر.",
    en: "This email is already registered to another account.",
  },
  USER_EXISTS: {
    ar: "هذا الحساب مسجل بالفعل. يمكنك تسجيل الدخول مباشرة.",
    en: "This account already exists. Please log in.",
  },
  NATIONAL_ID_EXISTS: {
    ar: "الرقم القومي هذا مسجل بالفعل لحساب آخر.",
    en: "This National ID is already registered.",
  },
  UNIQUE_CONSTRAINT_FAILED: {
    ar: "هذه البيانات (رقم الهاتف أو البريد الإلكتروني) مسجلة بالفعل لدينا.",
    en: "These credentials are already registered.",
  },
  RATE_LIMITED: {
    ar: "تم تجاوز الحد المسموح من المحاولات. يرجى الانتظار بضع دقائق ثم المحاولة مجدداً.",
    en: "Too many attempts. Please wait a few minutes and try again.",
  },
  USER_NOT_FOUND: {
    ar: "المستخدم غير موجود. يرجى التحقق من المدخلات.",
    en: "User not found. Please check your inputs.",
  },
  INVALID_CODE: {
    ar: "رمز التحقق غير صحيح أو منتهي الصلاحية.",
    en: "Invalid or expired verification code.",
  },
  INVALID_REFRESH_TOKEN: {
    ar: "انتهت الجلسة. يرجى تسجيل الدخول مرة أخرى.",
    en: "Session expired. Please log in again.",
  },
  "Route not found": {
    ar: "الصفحة أو المسار المطلوب غير موجود.",
    en: "The requested route was not found.",
  },
  "Validation failed": {
    ar: "فشل التحقق من البيانات. تأكد من إدخال جميع الحقول بشكل صحيح.",
    en: "Data validation failed. Please check your inputs.",
  },
};

export function getLocalizedError(errorMsgOrCode: string, locale: Locale): string {
  const code = errorMsgOrCode.trim();
  
  // Direct translation match
  if (ERROR_TRANSLATIONS[code]) {
    return ERROR_TRANSLATIONS[code][locale];
  }

  // Check case-insensitive match for common error patterns
  const normalized = code.toUpperCase();
  if (ERROR_TRANSLATIONS[normalized]) {
    return ERROR_TRANSLATIONS[normalized][locale];
  }

  // Handle network / connection errors
  if (code.includes("fetch failed") || code.includes("Failed to fetch") || code.includes("network") || code.includes("connect")) {
    if (locale === "ar") {
      return "فشل الاتصال بالخادم. يرجى التأكد من اتصالك بالإنترنت وتشغيل السيرفر وقاعدة البيانات.";
    } else {
      return "Failed to connect to the server. Please check your internet connection, server status, or database.";
    }
  }

  // If already in Arabic, return it directly
  if (locale === "ar" && /[\u0600-\u06FF]/.test(code)) {
    return code;
  }

  // If code is an unmapped technical error code (e.g. UPPER_SNAKE_CASE), provide a clean human message
  if (/^[A-Z0-9_]{3,}$/.test(code)) {
    return locale === "ar"
      ? "عذراً، حدث خطأ أثناء إتمام العملية. يرجى المحاولة مرة أخرى أو التواصل مع الدعم."
      : "An unexpected error occurred. Please try again or contact support.";
  }

  return locale === "ar" ? `حدث خطأ: ${code}` : code;
}

export function formatPhoneNumber(phone?: string | null): string {
  if (!phone) return "";
  let cleaned = phone.trim().replace(/[^\d+]/g, "");
  if (!cleaned) return "";

  if (cleaned.startsWith("+")) {
    cleaned = cleaned.substring(1);
  }

  if (cleaned.startsWith("20")) {
    const rest = cleaned.substring(2);
    return `+20 ${rest}`;
  }

  if (cleaned.startsWith("0")) {
    return `+20 ${cleaned.substring(1)}`;
  }

  return `+${cleaned}`;
}
