import type { ReactNode } from "react";
import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
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
    <main className="onyx-shell-bg min-h-screen text-onyx-50 selection:bg-gold-500 selection:text-onyx-950">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-onyx-950/80 backdrop-blur-xl">
        <div className="section-shell flex h-20 items-center justify-between gap-4">
          <Link href={`/${locale}`} className="flex items-center gap-2 group">
            <div className="h-10 w-10 bg-gold-500 rounded-xl flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform duration-500 shadow-gold/20 shadow-lg">
              <span className="text-onyx-950 font-black text-xl">أ</span>
            </div>
            <span className="text-2xl font-black text-white tracking-tighter">OSTA <span className="text-gold-500">أُسطى</span></span>
          </Link>

          <nav className="hidden items-center gap-6 lg:flex">
            {links.slice(0, 3).map((item) => (
              <Link key={item.href} href={item.href as `/${string}`} className="text-sm font-medium text-onyx-300 transition hover:text-gold-500">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <LocaleSwitcher locale={locale} pathname={pathname} className="rounded-xl border border-onyx-700 bg-onyx-800 px-4 py-2 text-sm font-semibold text-onyx-200 hover:border-onyx-600 transition" />
            <Link href={`/${locale}/dashboards`} className="btn-gold hidden sm:flex items-center gap-2 px-5 py-2.5 text-sm">
              <LayoutDashboard className="h-4 w-4" />
              {copy.dashboards}
            </Link>
          </div>
        </div>
      </header>

      <div className="min-h-[calc(100vh-80px-120px)]">{children}</div>

      <footer className="border-t border-white/5 bg-onyx-950 py-12">
        <div className="section-shell flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
             <div className="h-8 w-8 bg-gold-500 rounded-lg flex items-center justify-center">
              <span className="text-onyx-950 font-black text-sm">أ</span>
            </div>
            <span className="text-xl font-black text-white tracking-tighter">OSTA <span className="text-gold-500">أُسطى</span></span>
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-4 text-sm text-onyx-400">
            {links.map((item) => (
              <Link key={item.href} href={item.href as `/${string}`} className="hover:text-gold-500 transition-colors">
                {item.label}
              </Link>
            ))}
          </div>
          <p className="text-sm text-onyx-600">© {new Date().getFullYear()} OSTA Egypt</p>
        </div>
      </footer>
    </main>
  );
}
