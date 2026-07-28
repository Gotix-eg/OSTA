"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Store, UserCircle, UsersRound } from "lucide-react";
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
      href: `/${locale}/workers`,
      labelAr: "الفنيين",
      labelEn: "Workers",
      icon: UsersRound,
    },
    {
      href: `/${locale}/vendors`,
      labelAr: "المتاجر",
      labelEn: "Vendors",
      icon: Store,
    },
    {
      href: profileLink,
      labelAr: "حسابي",
      labelEn: "Account",
      icon: UserCircle,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 overflow-hidden rounded-t-[1.15rem] border-t border-white/10 bg-black/95 text-white shadow-[0_-8px_24px_rgba(0,0,0,0.24)] backdrop-blur-lg md:hidden">
      <div className="flex h-[72px] items-center justify-around px-2 pb-[max(0px,env(safe-area-inset-bottom))]">
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
                "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 py-1 text-center transition-all active:scale-95",
                isActive ? "text-[#a88400]" : "text-white/70 hover:text-white"
              )}
            >
              <Icon className="h-6 w-6 stroke-[2.3]" />
              <span className="max-w-full truncate text-[13px] font-black leading-none tracking-tight">
                {isArabic ? item.labelAr : item.labelEn}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
