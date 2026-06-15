"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { LayoutDashboard, Facebook, Instagram, Phone, Mail, Menu, X } from "lucide-react";
import { LocaleSwitcher } from "@/components/shared/locale-switcher";
import { publicPageCopy } from "@/lib/public-pages-copy";
import type { Locale } from "@/lib/locales";
import { cn } from "@/lib/utils";

export function PublicShell({ locale, pathname, children }: { locale: Locale; pathname: string; children: ReactNode }) {
  const copy = publicPageCopy[locale].nav;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const links = [
    { href: `/${locale}`, label: copy.home, path: "/" },
    { href: `/${locale}/services`, label: copy.services, path: "/services" },
    { href: `/${locale}/vendors`, label: copy.vendors, path: "/vendors" },
    { href: `/${locale}/how-it-works`, label: copy.how, path: "/how-it-works" },
    { href: `/${locale}/about`, label: copy.about, path: "/about" },
    { href: `/${locale}/contact`, label: copy.contact, path: "/contact" },
    { href: `/${locale}/faq`, label: copy.faq, path: "/faq" }
  ];

  return (
    <main className="onyx-shell-bg min-h-screen text-onyx-50 selection:bg-gold-500 selection:text-onyx-950">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-black/95 backdrop-blur-xl">
        <div className="section-shell flex h-24 items-center justify-between gap-4">
          <Link href={`/${locale}`} className="flex items-center gap-2 group">
            <img src="/logo.svg" alt="Ostafy" className="h-12 w-auto" />
          </Link>

          <nav className="hidden items-center gap-6 lg:flex">
            {links.slice(0, 6).map((item) => {
              const isActive = item.path === "/" 
                ? pathname === "/" || pathname === "" 
                : pathname.startsWith(item.path);
              return (
                <Link 
                  key={item.href} 
                  href={item.href as `/${string}`} 
                  className={cn(
                    "text-sm font-semibold transition-colors relative py-1",
                    isActive 
                      ? "text-gold-500 after:absolute after:-bottom-1 after:left-0 after:right-0 after:h-0.5 after:bg-gold-500 after:rounded-full"
                      : "text-onyx-300 hover:text-gold-500"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <LocaleSwitcher locale={locale} pathname={pathname} className="rounded-xl border border-onyx-700 bg-onyx-800 px-4 py-2 text-sm font-semibold text-onyx-200 hover:border-onyx-600 transition" />
            <Link href={`/${locale}/dashboards`} className="btn-gold hidden sm:flex items-center gap-2 px-5 py-2.5 text-sm">
              <LayoutDashboard className="h-4 w-4" />
              {copy.dashboards}
            </Link>

            {/* Mobile Hamburger Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-onyx-300 hover:bg-white/10 hover:text-white lg:hidden transition-all duration-200"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-5.5 w-5.5 text-gold-500" />
              ) : (
                <Menu className="h-5.5 w-5.5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="border-t border-white/5 bg-black/95 backdrop-blur-xl lg:hidden animate-fadeIn">
            <nav className="section-shell flex flex-col gap-4 py-6">
              {links.map((item) => {
                const isActive = item.path === "/" 
                  ? pathname === "/" || pathname === "" 
                  : pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.href}
                    href={item.href as `/${string}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "text-base font-bold py-2 border-b border-white/[0.03] transition-colors",
                      isActive 
                        ? "text-gold-500 border-l-2 border-gold-500 pl-3 rtl:border-l-0 rtl:border-r-2 rtl:pr-3" 
                        : "text-onyx-250 hover:text-gold-500"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
              
              <Link 
                href={`/${locale}/dashboards`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="btn-gold mt-4 flex items-center justify-center gap-2 py-3.5 text-sm font-black w-full"
              >
                <LayoutDashboard className="h-4.5 w-4.5" />
                {copy.dashboards}
              </Link>
            </nav>
          </div>
        )}
      </header>

      <div className="min-h-[calc(100vh-80px-120px)]">{children}</div>

      <footer className="border-t border-white/5 bg-onyx-950 pt-16 pb-12">
        <div className="section-shell flex flex-col gap-12">
          {/* Main Footer Grid */}
          <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 border-b border-white/5 pb-12">
            {/* Column 1: Brand Description & Contact Info */}
            <div className="flex flex-col gap-6 lg:col-span-2">
              <div className="w-fit">
                <img src="/logo.svg" alt="Ostafy" className="h-16 w-auto opacity-95" />
              </div>
              <p className="text-sm text-onyx-400 leading-relaxed max-w-sm">
                {locale === "ar"
                  ? "أُسطفاي هي المنصة الرائدة لربط العملاء بأمهر الفنيين والحرفيين الموثقين في مصر مع ضمان جودة الصيانة وحماية المدفوعات."
                  : "Ostafy is the leading platform connecting clients with skilled, verified technicians in Egypt, guaranteeing maintenance quality and secure payments."}
              </p>
              {/* Contact Info */}
              <div className="flex flex-col gap-3.5 text-xs font-semibold tracking-wide text-onyx-400">
                <a href="https://wa.me/201009410112" className="flex items-center gap-2.5 hover:text-gold-500 transition-colors w-fit">
                  <Phone className="h-4 w-4 text-gold-500" />
                  <span dir="ltr" className="inline-block">+20 100 941 0112</span>
                </a>
                <a href="mailto:info@ostafy.com" className="flex items-center gap-2.5 hover:text-gold-500 transition-colors w-fit">
                  <Mail className="h-4 w-4 text-gold-500" />
                  <span>info@ostafy.com</span>
                </a>
              </div>
            </div>

            {/* Column 2: Company Navigation */}
            <div className="flex flex-col gap-4">
              <h4 className="text-sm font-black uppercase tracking-wider text-white">
                {locale === "ar" ? "الشركة" : "Company"}
              </h4>
              <ul className="flex flex-col gap-3 text-sm text-onyx-400 font-bold">
                <li>
                  <Link href={`/${locale}/about`} className="hover:text-gold-500 transition-colors">
                    {locale === "ar" ? "من نحن" : "About Us"}
                  </Link>
                </li>
                <li>
                  <Link href={`/${locale}/careers`} className="hover:text-gold-500 transition-colors">
                    {locale === "ar" ? "انضم إلينا" : "Careers"}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Support Navigation */}
            <div className="flex flex-col gap-4">
              <h4 className="text-sm font-black uppercase tracking-wider text-white">
                {locale === "ar" ? "الدعم" : "Support"}
              </h4>
              <ul className="flex flex-col gap-3 text-sm text-onyx-400 font-bold">
                <li>
                  <Link href={`/${locale}/faq`} className="hover:text-gold-500 transition-colors">
                    {locale === "ar" ? "الأسئلة الشائعة" : "FAQ"}
                  </Link>
                </li>
                <li>
                  <Link href={`/${locale}/contact`} className="hover:text-gold-500 transition-colors">
                    {locale === "ar" ? "تواصل معنا" : "Contact Support"}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Legal Navigation */}
            <div className="flex flex-col gap-4">
              <h4 className="text-sm font-black uppercase tracking-wider text-white">
                {locale === "ar" ? "الشروط والقوانين" : "Legal"}
              </h4>
              <ul className="flex flex-col gap-3 text-sm text-onyx-400 font-bold">
                <li>
                  <Link href={`/${locale}/privacy`} className="hover:text-gold-500 transition-colors">
                    {locale === "ar" ? "سياسة الخصوصية" : "Privacy Policy"}
                  </Link>
                </li>
                <li>
                  <Link href={`/${locale}/terms`} className="hover:text-gold-500 transition-colors">
                    {locale === "ar" ? "شروط الخدمة" : "Terms of Service"}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Footer Section */}
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between text-xs font-semibold tracking-wide text-onyx-500">
            {/* Social Media Links */}
            <div className="flex items-center gap-3">
              <a href="https://www.facebook.com/2ostafy/" target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-lg bg-white/5 hover:bg-gold-500 hover:text-onyx-950 transition-all duration-300 flex items-center justify-center text-onyx-300 border border-white/10 hover:border-gold-500 hover:-translate-y-1">
                <Facebook className="h-4.5 w-4.5" />
              </a>
              <a href="https://instagram.com/osta.egypt" target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-lg bg-white/5 hover:bg-gold-500 hover:text-onyx-950 transition-all duration-300 flex items-center justify-center text-onyx-300 border border-white/10 hover:border-gold-500 hover:-translate-y-1">
                <Instagram className="h-4.5 w-4.5" />
              </a>
              <a href="https://wa.me/201009410112" target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-lg bg-white/5 hover:bg-gold-500 hover:text-onyx-950 transition-all duration-300 flex items-center justify-center text-onyx-300 border border-white/10 hover:border-gold-500 hover:-translate-y-1">
                <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 fill-current" xmlns="http://www.w3.org/2000/svg">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.859-4.42 9.863-9.864.002-2.637-1.023-5.115-2.887-6.979C16.582 1.9 14.1 1.05 11.999 1.05c-5.444 0-9.866 4.42-9.87 9.867a9.81 9.81 0 001.5 5.17l-.988 3.606 3.692-.969zm10.741-6.155c-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.668.149-.198.297-.766.967-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.15-.173.198-.297.298-.495.099-.198.05-.371-.025-.521-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                </svg>
              </a>
            </div>

            <p className="text-onyx-600">
              © {new Date().getFullYear()} Ostafy Egypt. {locale === "ar" ? (
                <>جميع الحقوق محفوظة. تم التطوير بواسطة <a href="https://www.gotix-eg.com" target="_blank" rel="noopener noreferrer" className="text-gold-500 hover:underline">شركة Gotix للبرمجيات</a></>
              ) : (
                <>All rights reserved. Developed by <a href="https://www.gotix-eg.com" target="_blank" rel="noopener noreferrer" className="text-gold-500 hover:underline">Gotix Software</a></>
              )}
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
