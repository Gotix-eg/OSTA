import Link from "next/link";

import { getAltLocale, type Locale } from "@/lib/locales";

interface LocaleSwitcherProps {
  locale: Locale;
  pathname: string;
  className?: string;
}

export function LocaleSwitcher({ locale, pathname, className }: LocaleSwitcherProps) {
  const altLocale = getAltLocale(locale);

  return (
    <Link
      href={`/${altLocale}${pathname}` as `/${string}`}
      className={className}
      aria-label={`Switch language to ${altLocale.toUpperCase()}`}
    >
      {altLocale.toUpperCase()}
    </Link>
  );
}
