import Link from "next/link";
import { getAltLocale, stripLocalePrefix, type Locale } from "@/lib/locales";

interface LocaleSwitcherProps {
  locale: Locale;
  pathname: string;
  className?: string;
}

export function LocaleSwitcher({ locale, pathname, className }: LocaleSwitcherProps) {
  const altLocale = getAltLocale(locale);
  const pathWithoutLocale = stripLocalePrefix(pathname);

  return (
    <Link
      href={`/${altLocale}${pathWithoutLocale}` as `/${string}`}
      className={className}
      aria-label={`Switch language to ${altLocale.toUpperCase()}`}
    >
      {altLocale === "ar" ? "العربية" : "English"}
    </Link>
  );
}
