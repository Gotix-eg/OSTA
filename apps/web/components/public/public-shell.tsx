"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { LogIn, Menu, X, Facebook, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LocaleSwitcher } from "@/components/shared/locale-switcher";
import { publicPageCopy } from "@/lib/public-pages-copy";
import type { Locale } from "@/lib/locales";
import { cn } from "@/lib/utils";
import { BottomNav } from "@/components/shared/bottom-nav";

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
  ];

  const isArabic = locale === "ar";

  return (
    <main className="min-h-screen bg-[#f9f9f9] text-[#1a1c1c] selection:bg-gold selection:text-[#1a1c1c] max-md:bg-gold">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black text-white md:hidden">
        <nav className="flex h-16 items-center justify-between px-4">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex h-11 w-11 items-center justify-center border border-white/10 bg-white/5 text-white active:scale-95"
            aria-label={isMobileMenuOpen ? (isArabic ? "إغلاق القائمة" : "Close menu") : (isArabic ? "فتح القائمة" : "Open menu")}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <Link href={`/${locale}`} className="flex items-center justify-center">
            <img
              alt="OSTA Logo"
              className="h-9 w-auto object-contain"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBu1Cr2Qb5XunsgNS63dL1yEu4iHVLV6I3gwxqInM8Qta47OxMPmanPnMaXI4SZTFZ9dd-0mEKbHsea4YqRFxqIE2duNvIPoYz5BsUrqf7JDfyAa2YxISdPTRtHV_FiLJgTl1xPi1VjLTpfwMBV9I8USHf_6dTSqD3mfsO2wIhvkC4TU6ipJSOZaUi3B2soFz85UQDUGwK8hTIeEcpBCPtKvahUwI4bhwqX7vHaLypDKtuHfoAuTOIV-UsxJjXrx4QL9sU0ng_2hvU"
            />
          </Link>
          <div className="flex items-center gap-2">
            <LocaleSwitcher locale={locale} pathname={pathname} className="h-11 rounded-none border border-white/10 bg-white/5 px-3 text-[11px] font-black text-white" />
            <Link
              href={`/${locale}/login`}
              className="flex h-11 w-11 items-center justify-center bg-gold text-black active:scale-95"
              aria-label={copy.login}
            >
              <LogIn className="h-5 w-5" />
            </Link>
          </div>
        </nav>
      </header>
      {/* TopNavBar */}
      <header className="sticky top-0 z-50 hidden border-b border-white/10 bg-[#1a1c1c]/90 text-white backdrop-blur-md transition-all duration-300 md:block">
        <nav className="flex justify-between items-center px-4 md:px-12 w-full max-w-7xl mx-auto h-20">
          <Link href={`/${locale}`} className="flex items-center gap-4">
            <img 
              alt="OSTA Logo" 
              className="h-8 md:h-12 w-auto object-contain" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBu1Cr2Qb5XunsgNS63dL1yEu4iHVLV6I3gwxqInM8Qta47OxMPmanPnMaXI4SZTFZ9dd-0mEKbHsea4YqRFxqIE2duNvIPoYz5BsUrqf7JDfyAa2YxISdPTRtHV_FiLJgTl1xPi1VjLTpfwMBV9I8USHf_6dTSqD3mfsO2wIhvkC4TU6ipJSOZaUi3B2soFz85UQDUGwK8hTIeEcpBCPtKvahUwI4bhwqX7vHaLypDKtuHfoAuTOIV-UsxJjXrx4QL9sU0ng_2hvU"
            />
          </Link>
          <ul className="hidden md:flex gap-8 items-center font-bold text-xs uppercase tracking-wider">
            {links.map((item) => {
              const isActive = item.path === "/" 
                ? pathname === "/" || pathname === "" 
                : pathname.startsWith(item.path);
              return (
                <li key={item.href}>
                  <Link 
                    href={item.href as `/${string}`} 
                    className={cn(
                      "transition-colors",
                      isActive 
                        ? "text-gold border-b-2 border-gold pb-1"
                        : "text-white hover:text-gold"
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="flex items-center gap-4">
            <LocaleSwitcher locale={locale} pathname={pathname} className="rounded-none border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-white" />
            <Link 
              href={`/${locale}/login`} 
              className="bg-gold text-[#1a1c1c] px-6 py-2 text-xs font-black rounded-none sticker-shadow active:translate-x-1 active:translate-y-1 active:shadow-none transition-all uppercase flex items-center gap-2"
            >
              <LogIn className="h-4 w-4" />
              {copy.login}
            </Link>

            {/* Mobile Hamburger menu */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden flex h-10 w-10 items-center justify-center border border-white/10 bg-white/5 text-white"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="fixed left-0 right-0 top-16 z-40 border-b border-white/10 bg-black text-white md:hidden"
          >
            <div className="flex flex-col gap-2 p-4">
              {links.map((item) => (
                <Link
                  key={item.href}
                  href={item.href as `/${string}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex min-h-12 items-center justify-between border border-white/10 bg-white/[0.04] px-4 text-sm font-black hover:text-gold"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full">
        {children}
      </div>

      {/* Footer */}
      <footer className="mt-auto hidden w-full border-t border-white/10 bg-[#1a1c1c] py-16 text-white md:block">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 px-4 md:px-12 max-w-7xl mx-auto text-start">
          <div className="space-y-6">
            <Link href={`/${locale}`}>
              <img 
                alt="OSTA Logo" 
                className="h-10 w-auto object-contain" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBu1Cr2Qb5XunsgNS63dL1yEu4iHVLV6I3gwxqInM8Qta47OxMPmanPnMaXI4SZTFZ9dd-0mEKbHsea4YqRFxqIE2duNvIPoYz5BsUrqf7JDfyAa2YxISdPTRtHV_FiLJgTl1xPi1VjLTpfwMBV9I8USHf_6dTSqD3mfsO2wIhvkC4TU6ipJSOZaUi3B2soFz85UQDUGwK8hTIeEcpBCPtKvahUwI4bhwqX7vHaLypDKtuHfoAuTOIV-UsxJjXrx4QL9sU0ng_2hvU"
              />
            </Link>
            <p className="text-neutral-400 text-sm">
              {isArabic
                ? "المنصة الرقمية الرائدة لتسهيل وتأمين خدمات الصيانة والتشطيبات المنزلية في مصر بجودة عالية وأمان كامل."
                : "Leading the digital transformation of manual trade services with security and quality at our core."}
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://www.facebook.com/2ostafy"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="inline-flex h-10 w-10 items-center justify-center border border-white/10 bg-white/5 text-neutral-400 hover:text-gold hover:border-gold transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://wa.me/201009410112"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="inline-flex h-10 w-10 items-center justify-center border border-white/10 bg-white/5 text-neutral-400 hover:text-gold hover:border-gold transition-colors"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.859-4.42 9.863-9.864.002-2.637-1.023-5.115-2.887-6.979C16.582 1.9 14.1 1.05 11.999 1.05c-5.444 0-9.866 4.42-9.87 9.867a9.81 9.81 0 001.5 5.17l-.988 3.606 3.692-.969zm10.741-6.155c-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.668.149-.198.297-.766.967-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.15-.173.198-.297.298-.495.099-.198.05-.371-.025-.521-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                </svg>
              </a>
              <a
                href="mailto:info@ostafy.com"
                aria-label="Email"
                className="inline-flex h-10 w-10 items-center justify-center border border-white/10 bg-white/5 text-neutral-400 hover:text-gold hover:border-gold transition-colors"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
          <div>
            <h5 className="text-gold font-bold text-sm uppercase mb-6">{isArabic ? "الشركة" : "Company"}</h5>
            <ul className="space-y-4 text-neutral-400 text-sm">
              <li><Link href={`/${locale}/about`} className="hover:text-white transition-colors">{isArabic ? "من نحن" : "About Us"}</Link></li>
              <li><Link href={`/${locale}/how-it-works`} className="hover:text-white transition-colors">{isArabic ? "كيف نعمل" : "Our Process"}</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="text-gold font-bold text-sm uppercase mb-6">{isArabic ? "الدعم" : "Support"}</h5>
            <ul className="space-y-4 text-neutral-400 text-sm">
              <li><Link href={`/${locale}/faq`} className="hover:text-white transition-colors">{isArabic ? "مركز المساعدة" : "Help Center"}</Link></li>
              <li><Link href={`/${locale}/contact`} className="hover:text-white transition-colors">{isArabic ? "اتصل بنا" : "Contact Support"}</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="text-gold font-bold text-sm uppercase mb-6">{isArabic ? "الشروط" : "Legal"}</h5>
            <ul className="space-y-4 text-neutral-400 text-sm">
              <li><Link href={`/${locale}/terms`} className="hover:text-white transition-colors">{isArabic ? "شروط الخدمة" : "Terms of Service"}</Link></li>
              <li><Link href={`/${locale}/privacy`} className="hover:text-white transition-colors">{isArabic ? "سياسة الخصوصية" : "Privacy Policy"}</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-6 px-4 md:px-12 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-neutral-400 text-xs">
          <span>
            <span className="text-gold">
              {isArabic ? `© ${new Date().getFullYear()} أُسطفاي` : `© ${new Date().getFullYear()} OSTAFY`}
            </span>
            {isArabic ? ". جميع الحقوق محفوظة." : ". ALL RIGHTS RESERVED."}
          </span>
          <span>{isArabic ? "تطوير جوتكس" : "DEVELOPED BY GOTIX"}</span>
        </div>
      </footer>
      <BottomNav />
    </main>
  );
}
