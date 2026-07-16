"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { LogIn, Menu, X } from "lucide-react";
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
  const isHome = pathname === "/" || pathname === "";

  return (
    <main className="bg-[#f9f9f9] max-md:bg-[#f5bd18] min-h-screen text-[#1a1c1c] selection:bg-[#f5bd18] selection:text-[#1a1c1c]">
      {/* TopNavBar */}
      <header className={cn("sticky top-0 z-50 transition-all duration-300 backdrop-blur-md border-b border-white/10 bg-[#1a1c1c]/90 text-white", isHome && "max-md:hidden")}>
        <nav className="flex justify-between items-center px-4 md:px-12 w-full max-w-7xl mx-auto h-20">
          <div className="flex items-center gap-4">
            <img 
              alt="OSTA Logo" 
              className="h-8 md:h-12 w-auto object-contain" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBu1Cr2Qb5XunsgNS63dL1yEu4iHVLV6I3gwxqInM8Qta47OxMPmanPnMaXI4SZTFZ9dd-0mEKbHsea4YqRFxqIE2duNvIPoYz5BsUrqf7JDfyAa2YxISdPTRtHV_FiLJgTl1xPi1VjLTpfwMBV9I8USHf_6dTSqD3mfsO2wIhvkC4TU6ipJSOZaUi3B2soFz85UQDUGwK8hTIeEcpBCPtKvahUwI4bhwqX7vHaLypDKtuHfoAuTOIV-UsxJjXrx4QL9sU0ng_2hvU"
            />
            <span className="hidden lg:block font-extrabold text-lg text-[#f5bd18] tracking-tighter uppercase font-mono">CRAFTSMAN HUB</span>
          </div>
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
                        ? "text-[#f5bd18] border-b-2 border-[#f5bd18] pb-1"
                        : "text-white hover:text-[#f5bd18]"
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
              className="bg-[#f5bd18] text-[#1a1c1c] px-6 py-2 text-xs font-black rounded-none sticker-shadow active:translate-x-1 active:translate-y-1 active:shadow-none transition-all uppercase flex items-center gap-2"
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
            className="fixed top-20 left-0 right-0 z-40 bg-[#1a1c1c] border-b border-white/10 text-white md:hidden"
          >
            <div className="p-6 space-y-4 flex flex-col">
              {links.map((item) => (
                <Link
                  key={item.href}
                  href={item.href as `/${string}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-sm font-bold hover:text-[#f5bd18] py-2 border-b border-white/5"
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
      <footer className={cn("bg-[#1a1c1c] border-t border-white/10 w-full py-16 text-white mt-auto", isHome && "max-md:hidden")}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 px-4 md:px-12 max-w-7xl mx-auto text-start">
          <div className="space-y-6">
            <img 
              alt="OSTA Logo" 
              className="h-10 w-auto object-contain" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBu1Cr2Qb5XunsgNS63dL1yEu4iHVLV6I3gwxqInM8Qta47OxMPmanPnMaXI4SZTFZ9dd-0mEKbHsea4YqRFxqIE2duNvIPoYz5BsUrqf7JDfyAa2YxISdPTRtHV_FiLJgTl1xPi1VjLTpfwMBV9I8USHf_6dTSqD3mfsO2wIhvkC4TU6ipJSOZaUi3B2soFz85UQDUGwK8hTIeEcpBCPtKvahUwI4bhwqX7vHaLypDKtuHfoAuTOIV-UsxJjXrx4QL9sU0ng_2hvU"
            />
            <p className="text-neutral-400 text-sm">
              {isArabic 
                ? "المنصة الرقمية الرائدة لتسهيل وتأمين خدمات الصيانة والتشطيبات المنزلية في مصر بجودة عالية وأمان كامل."
                : "Leading the digital transformation of manual trade services with security and quality at our core."}
            </p>
          </div>
          <div>
            <h5 className="text-[#f5bd18] font-bold text-sm uppercase mb-6">{isArabic ? "الشركة" : "Company"}</h5>
            <ul className="space-y-4 text-neutral-400 text-sm">
              <li><Link href={`/${locale}/about`} className="hover:text-white transition-colors">{isArabic ? "من نحن" : "About Us"}</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">{isArabic ? "كيف نعمل" : "Our Process"}</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">{isArabic ? "القصص الناجحة" : "Success Stories"}</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="text-[#f5bd18] font-bold text-sm uppercase mb-6">{isArabic ? "الدعم" : "Support"}</h5>
            <ul className="space-y-4 text-neutral-400 text-sm">
              <li><Link href="#" className="hover:text-white transition-colors">{isArabic ? "مركز المساعدة" : "Help Center"}</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">{isArabic ? "سياسة الدفع" : "Escrow Policy"}</Link></li>
              <li><Link href={`/${locale}/contact`} className="hover:text-white transition-colors">{isArabic ? "اتصل بنا" : "Contact Support"}</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="text-[#f5bd18] font-bold text-sm uppercase mb-6">{isArabic ? "الشروط" : "Legal"}</h5>
            <ul className="space-y-4 text-neutral-400 text-sm">
              <li><Link href="#" className="hover:text-white transition-colors">{isArabic ? "شروط الخدمة" : "Terms of Service"}</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">{isArabic ? "سياسة الخصوصية" : "Privacy Policy"}</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-white/5 px-4 md:px-12 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-neutral-400 text-xs">
          <span>© {new Date().getFullYear()} CRAFTSMAN HUB / OSTA. ALL RIGHTS RESERVED.</span>
          <span>DEVELOPED BY GOTIX</span>
        </div>
      </footer>
      <div className={cn(isHome && "max-md:hidden")}>
        <BottomNav />
      </div>
    </main>
  );
}
