"use client";

import type { ComponentType, ReactNode } from "react";
import { useMemo, useState, useEffect } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  ArrowUpRight,
  BarChart3,
  Bell,
  Briefcase,
  Command,
  CreditCard,
  FolderClock,
  Heart,
  Home,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  Package,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Store,
  UserCircle2,
  Users,
  Wallet,
  Wrench,
  X
} from "lucide-react";
import { fetchApiData } from "@/lib/api";
import { VendorOnboarding } from "./vendor-onboarding";

import { clearAuthSession } from "@/lib/auth-session";

import { LocaleSwitcher } from "@/components/shared/locale-switcher";
import { dashboardCopy } from "@/lib/dashboard-copy";
import { stripLocalePrefix, type Locale } from "@/lib/locales";
import { cn } from "@/lib/utils";
import { NotificationsPopover } from "./notifications-popover";

type DashboardRole = "client" | "worker" | "vendor" | "admin";

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
};

const iconSets: Record<DashboardRole, Array<NavItem["icon"]>> = {
  client: [Home, Briefcase, FolderClock, Store, Heart, Wallet, Settings],
  worker: [Home, FolderClock, Briefcase, CreditCard, BarChart3, Settings],
  vendor: [Home, Bell, Briefcase, Package, Wallet, Settings],
  admin: [Home, ShieldCheck, Users, FolderClock, Store, Wrench, CreditCard, Megaphone, SlidersHorizontal, Settings]
};

const roleThemes: Record<DashboardRole, { tag: string; accent: string; orb: string; ring: string }> = {
  client: {
    tag: "Client flow",
    accent: "from-gold-500/10 via-gold-400/5 to-transparent",
    orb: "bg-gold-500/10",
    ring: "text-gold-500"
  },
  worker: {
    tag: "Worker ops",
    accent: "from-accent-500/10 via-accent-400/5 to-transparent",
    orb: "bg-accent-500/10",
    ring: "text-accent-500"
  },
  vendor: {
    tag: "Vendor hub",
    accent: "from-emerald-500/10 via-emerald-400/5 to-transparent",
    orb: "bg-emerald-500/10",
    ring: "text-emerald-500"
  },
  admin: {
    tag: "Admin control",
    accent: "from-gold-300/15 via-gold-200/5 to-transparent",
    orb: "bg-gold-300/10",
    ring: "text-gold-300"
  }
};

export function DashboardShell({
  locale,
  role,
  children
}: {
  locale: Locale;
  role: DashboardRole;
  children: ReactNode;
}) {
  const isArabic = locale === "ar";
  const [isComplete, setIsComplete] = useState<boolean | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const copy = dashboardCopy[locale][role];
  const shared = dashboardCopy[locale].shared;
  const theme = roleThemes[role];

  useEffect(() => {
    async function checkCompleteness() {
      if (role !== "vendor") {
        setIsComplete(true);
        return;
      }
      
      const user = await fetchApiData<any>("/auth/me", null);
      if (user?.role === "VENDOR") {
        const profile = user.profile;
        if (!profile?.category || !profile?.latitude) {
          setIsComplete(false);
          return;
        }
      }
      setIsComplete(true);
    }
    checkCompleteness();
  }, [role]);

  const navItems = useMemo(() => {
    const routes: Record<DashboardRole, string[]> = {
      client: ["/client", "/client/new-request", "/client/my-requests", "/client/stores", "/client/favorites", "/client/wallet", "/client/settings"],
      worker: ["/worker", "/worker/requests/incoming", "/worker/requests/active", "/worker/earnings", "/worker/ratings", "/worker/settings"],
      vendor: ["/vendor", "/vendor/requests", "/vendor/active-orders", "/vendor/inventory", "/vendor/wallet", "/vendor/settings"],
      admin: ["/admin", "/admin/workers/pending", "/admin/clients", "/admin/requests", "/admin/vendors", "/admin/workers", "/admin/finance", "/admin/ads", "/admin/pricing", "/admin/settings"]
    };

    const roleRoutes = routes[role];
    const roleIcons = iconSets[role];

    return copy.nav.map((label, index) => ({
      href: `/${locale}${roleRoutes[index] ?? roleRoutes[0]}`,
      label,
      icon: roleIcons[index] ?? Home
    }));
  }, [copy.nav, locale, role]);

  const currentPath = stripLocalePrefix(pathname || "/");

  return (
    <div className="dashboard-shell-bg min-h-screen text-white">
      <div className="pointer-events-none absolute inset-0 dashboard-grid-overlay opacity-50" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[22rem] bg-dashboardGlow opacity-90" />

      <div className="relative flex min-h-screen">
        <aside className="hidden w-[19.5rem] shrink-0 px-4 py-4 lg:block">
          <SidebarContent locale={locale} role={role} roleLabel={copy.role} theme={theme} navItems={navItems} currentPath={currentPath} />
        </aside>

        {mobileOpen ? (
          <div className="fixed inset-0 z-50 bg-dark-950/45 backdrop-blur-sm lg:hidden">
            <aside className={cn("dashboard-card-dark relative h-full w-[19rem] overflow-hidden px-4 py-4", locale === "ar" ? "ms-auto" : "") }>
              <button type="button" onClick={() => setMobileOpen(false)} className="absolute end-4 top-4 rounded-full border border-white/10 p-2 text-white/75">
                <X className="h-4 w-4" />
              </button>
              <SidebarContent locale={locale} role={role} roleLabel={copy.role} theme={theme} navItems={navItems} currentPath={currentPath} />
            </aside>
          </div>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col px-3 pb-4 pt-3 sm:px-4 lg:px-0 lg:py-4 lg:pe-4">
          <header className="dashboard-card sticky top-4 z-30 mx-4 rounded-[2rem] border border-white/5 bg-onyx-800/50/[0.02] backdrop-blur-2xl">
            <div className={cn("absolute inset-0 rounded-[2rem] overflow-hidden bg-gradient-to-r opacity-50", theme.accent)} />
            <div className="relative section-shell flex h-20 items-center gap-4 lg:h-24">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-4">
                  <div className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-onyx-800/50 text-white shadow-xl sm:flex">
                    <LayoutDashboard className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1 rounded-full border border-white/5 bg-white/5 px-5 py-3 text-sm text-onyx-300 shadow-inner">
                    <div className="flex items-center gap-3">
                      <Search className="h-4 w-4 text-onyx-500" />
                      <span className="truncate opacity-60">{copy.search}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="hidden items-center gap-4 xl:flex">
                <Link href={`/${locale}/dashboards`} className="inline-flex h-12 items-center gap-3 rounded-full border border-white/5 bg-white/5 px-6 text-[10px] font-bold uppercase tracking-widest text-white shadow-xl transition-all duration-500 hover:bg-white/10">
                  <Command className="h-4 w-4" />
                  {isArabic ? "مركز اللوحات" : "Dashboard hub"}
                </Link>
                <LocaleSwitcher
                  locale={locale}
                  pathname={currentPath}
                  className="inline-flex h-12 items-center justify-center rounded-full border border-white/5 bg-white/5 px-5 text-[10px] font-bold uppercase tracking-widest text-white shadow-xl transition-all duration-500 hover:bg-white/10"
                />
                <NotificationsPopover locale={locale} />
                <div className="flex items-center gap-3 rounded-full border border-white/5 bg-white/5 p-1.5 pe-5 shadow-xl">
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-full shadow-inner", theme.orb, theme.ring)}>
                    <UserCircle2 className="h-5 w-5" />
                  </div>
                  <div className="text-start">
                    <p className="text-sm font-bold text-white">{shared.profile}</p>
                    <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-gold-500/60">{shared.online}</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <div className="section-shell flex-1 pb-6 pt-12 lg:pb-7 lg:pt-14">
            {isComplete === null ? (
              <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
              </div>
            ) : isComplete === false ? (
              <VendorOnboarding locale={locale} onComplete={() => setIsComplete(true)} />
            ) : (
              children
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SidebarContent({
  locale,
  role,
  roleLabel,
  theme,
  navItems,
  currentPath
}: {
  locale: Locale;
  role: DashboardRole;
  roleLabel: string;
  theme: { tag: string; accent: string; orb: string; ring: string };
  navItems: NavItem[];
  currentPath: string;
}) {
  return (
    <div className="dashboard-card-dark relative flex h-full flex-col overflow-hidden px-4 py-4">
      <div className={cn("absolute -right-12 top-8 h-36 w-36 rounded-full blur-3xl", theme.orb)} />
      <div className="absolute -left-14 bottom-12 h-44 w-44 rounded-full bg-white/5 blur-3xl" />

      <div className="relative rounded-[2rem] border border-white/5 bg-white/5 p-5 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-onyx-800/50 text-white shadow-xl">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="font-serif text-3xl leading-none tracking-tight text-white">OSTA</p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-gold-500/80">{roleLabel}</p>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-xs">
          <div>
            <p className="opacity-40">{locale === "ar" ? "الوضع" : "Mode"}</p>
            <p className="mt-1 font-bold text-white/90">{theme.tag}</p>
          </div>
          <div className="text-end">
            <p className="opacity-40">{locale === "ar" ? "اللغة" : "Locale"}</p>
            <p className="mt-1 font-bold text-white/90">{locale.toUpperCase()}</p>
          </div>
        </div>
      </div>

      <nav className="relative mt-8 grid gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const itemPath = stripLocalePrefix(item.href);
          const active = currentPath === itemPath || currentPath.startsWith(`${itemPath}/`);

          return (
            <Link
              key={item.href}
              href={item.href as `/${string}`}
              className={cn(
                "group flex items-center justify-between rounded-2xl border px-4 py-3.5 text-sm font-medium transition-all duration-500",
                active
                  ? "border-gold-500/20 bg-gold-500 text-onyx-950 shadow-gold"
                  : "border-transparent bg-transparent text-white/60 hover:bg-white/5 hover:text-white"
              )}
            >
              <span className="flex items-center gap-3">
                <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-500", active ? "bg-onyx-950/10" : "bg-white/5 group-hover:bg-white/10") }>
                  <Icon className="h-4 w-4" />
                </span>
                {item.label}
              </span>
              <ArrowUpRight className={cn("h-4 w-4 transition-all duration-500", active ? "opacity-100" : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0")} />
            </Link>
          );
        })}
      </nav>

      <div className="relative mt-8 rounded-[2rem] border border-white/5 bg-white/5 p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">{locale === "ar" ? "صحة المنصة" : "Platform health"}</p>
            <p className="mt-2 text-4xl font-bold text-white">98%</p>
          </div>
          <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl shadow-inner", theme.orb, theme.ring)}>
            <ShieldCheck className="h-6 w-6" />
          </div>
        </div>
        <p className="text-sm leading-relaxed text-onyx-400">
          {role === "client"
            ? locale === "ar"
              ? "الطلبات والدعم والدفع المحمي تظل واضحة من مساحة أكثر هدوءًا."
              : "Requests, support, and protected payments stay visible from one calmer workspace."
            : role === "worker"
              ? locale === "ar"
                ? "التوفر والطلبات والأرباح أصبحت مجمعة داخل مساحة تشغيل أوضح."
                : "Availability, jobs, and earnings now sit inside one softer operational cockpit."
              : locale === "ar"
                ? "ضغط الطوابير والإيراد ومؤشرات الثقة تظل مقروءة بدون تشويش بصري."
                : "Queue pressure, revenue, and trust signals stay readable without visual noise."}
        </p>
      </div>

      <button
        type="button"
        onClick={() => {
          clearAuthSession();
          window.location.assign(`/${locale}`);
        }}
        className="relative mt-auto inline-flex items-center justify-between rounded-2xl border border-error/10 bg-error/5 px-5 py-4 text-sm font-bold text-error transition-all duration-500 hover:bg-error/10"
      >
        <span className="flex items-center gap-3">
          <LogOut className="h-4 w-4" />
          {locale === "ar" ? "تسجيل الخروج" : "Logout"}
        </span>
        <ArrowUpRight className="h-4 w-4 opacity-50" />
      </button>

      <Link href={`/${locale}/dashboards`} className="group relative mt-4 inline-flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-5 py-4 text-sm font-bold text-white transition-all duration-500 hover:bg-white/10">
        <span className="flex items-center gap-3">
          <Command className="h-4 w-4" />
          {locale === "ar" ? "مركز اللوحات" : "Dashboard hub"}
        </span>
        <ArrowUpRight className="h-4 w-4 opacity-0 -translate-x-2 transition-all duration-500 group-hover:opacity-100 group-hover:translate-x-0" />
      </Link>
    </div>
  );
}
