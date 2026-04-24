import type { ReactNode } from "react";

import Link from "next/link";

import { Compass, LayoutDashboard } from "lucide-react";

import { LocaleSwitcher } from "@/components/shared/locale-switcher";
import { publicPageCopy } from "@/lib/public-pages-copy";
import type { Locale } from "@/lib/locales";

export function PublicShell({ locale, pathname, children }: { locale: Locale; pathname: string; children: ReactNode }) {
  const copy = publicPageCopy[locale].nav;

  const links = [
    { href: `/${locale}`, label: copy.home },
    { href: `/${locale}/services`, label: copy.services },
    { href: `/${locale}/vendors`, label: copy.vendors },
    { href: `/${locale}/how-it-works`, label: copy.how },
    { href: `/${locale}/about`, label: copy.about },
    { href: `/${locale}/contact`, label: copy.contact },
    { href: `/${locale}/faq`, label: copy.faq }
  ];

  return (
    <main className="public-shell-bg min-h-screen text-dark-950">
      <header className="sticky top-0 z-40 border-b border-dark-200/50 bg-white/80 backdrop-blur-xl">
        <div className="section-shell flex h-20 items-center justify-between gap-4">
          <Link href={`/${locale}`} className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-dark-950 text-white shadow-soft">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <p className="font-serif text-2xl tracking-[0.18em] text-dark-950">OSTA</p>
              <p className="text-[11px] uppercase tracking-[0.3em] text-dark-400">Service Atelier</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 lg:flex">
            {links.map((item) => (
              <Link key={item.href} href={item.href as `/${string}`} className="text-sm font-medium text-dark-600 transition hover:text-primary-700">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <LocaleSwitcher locale={locale} pathname={pathname} className="rounded-full border border-dark-200 bg-white px-4 py-2 text-sm font-semibold text-dark-700 shadow-soft" />
            <Link href={`/${locale}/dashboards`} className="inline-flex items-center gap-2 rounded-full bg-dark-950 px-4 py-2 text-sm font-semibold text-white shadow-soft">
              <LayoutDashboard className="h-4 w-4" />
              {copy.dashboards}
            </Link>
          </div>
        </div>
      </header>

      <div className="section-shell py-12">{children}</div>

      <footer className="border-t border-dark-200/60 bg-white/70 py-8 backdrop-blur">
        <div className="section-shell flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-dark-500">OSTA public site</p>
          <div className="flex flex-wrap gap-4 text-sm text-dark-500">
            {links.map((item) => (
              <Link key={item.href} href={item.href as `/${string}`} className="hover:text-primary-700">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </main>
  );
}
