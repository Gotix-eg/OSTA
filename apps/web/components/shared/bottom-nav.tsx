"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Briefcase, Grid3X3, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/locales";
import { useState, useEffect } from "react";
import { getBrowserAuthState } from "@/lib/auth-client";

export function BottomNav() {
  const pathname = usePathname() || "";
  const [role, setRole] = useState<string | null>(null);
  const [locale, setLocale] = useState<Locale>("ar");

  useEffect(() => {
    // Detect locale from path
    const parts = pathname.split("/");
    if (parts[1] === "en") setLocale("en");
    else setLocale("ar");

    // Fetch user auth role
    getBrowserAuthState().then(({ isLoggedIn, role }) => {
      if (isLoggedIn) setRole(role);
    });
  }, [pathname]);

  const isArabic = locale === "ar";

  // Navigation target based on authenticated role
  const profileLink = role
    ? `/${locale}/${role.toLowerCase()}`
    : `/${locale}/login`;

  const navItems = [
    {
      href: `/${locale}`,
      labelAr: "الرئيسية",
      labelEn: "Home",
      icon: Home,
      exact: true,
    },
    {
      href: `/${locale}/services`,
      labelAr: "الخدمات",
      labelEn: "Services",
      icon: Grid3X3,
    },
    {
      href: role ? `/${locale}/${role.toLowerCase()}/requests` : `/${locale}/register/client`,
      labelAr: "طلباتي",
      labelEn: "Requests",
      icon: Briefcase,
    },
    {
      href: profileLink,
      labelAr: "حسابي",
      labelEn: "Account",
      icon: UserCircle,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gold-700/10 bg-background/95 backdrop-blur-lg md:hidden">
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? pathname === item.href || pathname === `${item.href}/`
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href as `/${string}`}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-center py-1 flex-1 transition-all",
                isActive ? "text-gold-800 scale-105" : "text-onyx-600 hover:text-gold-800"
              )}
            >
              <Icon className="h-5.5 w-5.5" />
              <span className="text-[10px] font-medium leading-none">
                {isArabic ? item.labelAr : item.labelEn}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
