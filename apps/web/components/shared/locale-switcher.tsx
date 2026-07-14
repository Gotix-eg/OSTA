import Link from "next/link";
import { Globe } from "lucide-react";
import { getAltLocale, stripLocalePrefix, type Locale } from "@/lib/locales";
import { cn } from "@/lib/utils";

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
      className={cn("inline-flex items-center gap-2", className)}
      aria-label={`Switch language to ${altLocale.toUpperCase()}`}
    >
      <Globe className="h-4 w-4 text-gold-500 shrink-0" />
      <span>{locale === "ar" ? "الإنجليزية" : "Arabic"}</span>
    </Link>
  );
}
