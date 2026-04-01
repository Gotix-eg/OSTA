import { supportedLocales, type Locale } from "@osta/shared";

export { supportedLocales };
export type { Locale };

export function isLocale(value: string): value is Locale {
  return supportedLocales.includes(value as Locale);
}

export function getDirection(locale: Locale) {
  return locale === "ar" ? "rtl" : "ltr";
}

export function getAltLocale(locale: Locale): Locale {
  return locale === "ar" ? "en" : "ar";
}

export function stripLocalePrefix(pathname: string): string {
  const parts = pathname.split("/");
  const possibleLocale = parts[1];

  if (!possibleLocale || !isLocale(possibleLocale)) {
    return pathname;
  }

  const nextPath = parts.slice(2).join("/");
  return nextPath ? `/${nextPath}` : "";
}
