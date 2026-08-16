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
  Check,
  ChevronDown,
  CreditCard,
  FolderClock,
  Heart,
  Home,
  LayoutDashboard,
  Loader2,
  LogOut,
  Megaphone,
  Menu,
  Package,
  Plus,
  Search,
  Settings,
  Shield,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Store,
  User,
  UserCircle2,
  Users,
  Wallet,
  Wrench,
  Grid3X3,
  Image,
  X
} from "lucide-react";
import { fetchApiData, postApiData, resolveApiBaseUrl } from "@/lib/api";
import { VendorOnboarding } from "./vendor-onboarding";

import { clearAuthSession, logoutAuthSession, type AuthRole } from "@/lib/auth-session";

import { LocaleSwitcher } from "@/components/shared/locale-switcher";
import { PublicFooter } from "@/components/public/public-shell";
import { dashboardCopy } from "@/lib/dashboard-copy";
import { stripLocalePrefix, type Locale } from "@/lib/locales";
import { cn } from "@/lib/utils";
import { NotificationsPopover } from "./notifications-popover";
import { HeaderChatButton } from "./header-chat-button";
import { PwaInstallButton } from "@/components/shared/pwa-install-button";

type DashboardRole = "client" | "worker" | "vendor" | "admin";

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
};

const iconSets: Record<DashboardRole, Array<NavItem["icon"]>> = {
  client: [Home, Briefcase, FolderClock, Store, Package, Heart, Wallet, Settings],
  worker: [Home, UserCircle2, FolderClock, Briefcase, CreditCard, Megaphone, BarChart3, Settings],
  vendor: [Home, Bell, Briefcase, Wrench, Package, Megaphone, Wallet, Settings],
  admin: [Home, Wrench, Users, FolderClock, Store, CreditCard, Megaphone, SlidersHorizontal, Grid3X3, Image, UserCircle2, Settings]
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

const allowedAuthRoles: Record<DashboardRole, AuthRole[]> = {
  client: ["CLIENT"],
  worker: ["WORKER"],
  vendor: ["VENDOR"],
  admin: ["ADMIN", "SUPER_ADMIN"]
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
  const [workerIncomplete, setWorkerIncomplete] = useState<boolean>(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const copy = dashboardCopy[locale][role];
  const shared = dashboardCopy[locale].shared;
  const theme = roleThemes[role];
  const isClientDashboard = role === "client";
  const isVendorDashboard = role === "vendor";
  const isAdminDashboard = role === "admin";
  const isStitchDashboard = isClientDashboard || role === "worker" || isVendorDashboard || isAdminDashboard;

  useEffect(() => {
    let cancelled = false;

    async function verifyDashboardSession() {
      try {
        const response = await fetch(`${resolveApiBaseUrl()}/auth/me`, {
          credentials: "include",
          cache: "no-store",
          headers: {
            Accept: "application/json"
          }
        });

        if (!response.ok) {
          throw new Error("Session is not authenticated");
        }

        const payload = await response.json();
        const user = payload?.data?.user ?? payload?.data;
        const userRole = user?.role as AuthRole | undefined;

        if (!userRole || !allowedAuthRoles[role].includes(userRole)) {
          throw new Error("Session role is not allowed for this dashboard");
        }
      } catch {
        if (!cancelled) {
          clearAuthSession();
          window.location.replace(role === "admin" ? `/${locale}/login/admin` : `/${locale}/login`);
        }
      }
    }

    void verifyDashboardSession();

    const handlePageShow = () => {
      void verifyDashboardSession();
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void verifyDashboardSession();
      }
    };

    window.addEventListener("pageshow", handlePageShow);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelled = true;
      window.removeEventListener("pageshow", handlePageShow);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [locale, role]);

  useEffect(() => {
    async function checkCompleteness() {
      if (role === "vendor") {
        const data = await fetchApiData<any>("/auth/me", null);
        const user = data?.user || data;
        if (user?.role === "VENDOR") {
          const profile = user.profile;
          if (!profile?.category || !profile?.latitude) {
            setIsComplete(false);
            return;
          }
        }
        setIsComplete(true);
      } else if (role === "worker") {
        const data = await fetchApiData<any>("/auth/me", null);
        const user = data?.user || data;
        if (user?.role === "WORKER") {
          const profile = user.profile;
          if (profile?.verificationStatus === "PENDING" && (!profile?.nationalIdFront || !profile?.nationalIdBack || !profile?.selfieWithId || !profile?.nationalIdNumber)) {
            setWorkerIncomplete(true);
          }
        }
        setIsComplete(true);
      } else {
        setIsComplete(true);
      }
    }
    checkCompleteness();
  }, [role]);

  const navItems = useMemo(() => {
    const routes: Record<DashboardRole, string[]> = {
      client: ["/client", "/client/new-request", "/client/my-requests", "/client/stores", "/client/materials", "/client/favorites", "/client/wallet", "/client/settings"],
      worker: ["/worker", "/worker/profile", "/worker/requests/incoming", "/worker/requests/active", "/worker/earnings", "/worker/ads", "/worker/ratings", "/worker/settings"],
      vendor: ["/vendor", "/vendor/requests", "/vendor/active-orders", "/vendor/materials", "/vendor/inventory", "/vendor/ads", "/vendor/wallet", "/vendor/settings"],
      admin: ["/admin", "/admin/workers", "/admin/clients", "/admin/requests", "/admin/vendors", "/admin/finance", "/admin/ads", "/admin/pricing", "/admin/services", "/admin/media", "/admin/avatars", "/admin/settings"]
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

  const activeNavPath = useMemo(() => {
    let best: string | null = null;
    for (const item of navItems) {
      const itemPath = stripLocalePrefix(item.href);
      const matches = currentPath === itemPath || currentPath.startsWith(`${itemPath}/`);
      if (matches && (best === null || itemPath.length > best.length)) {
        best = itemPath;
      }
    }
    return best;
  }, [navItems, currentPath]);

  return (
    <div
      className={cn(
        "min-h-screen text-foreground",
        isStitchDashboard ? (isAdminDashboard ? "admin-stitch-scope bg-[#050505] text-white" : "bg-gold") : "dashboard-shell-bg"
      )}
    >
      {!isStitchDashboard ? (
        <>
          <div className="pointer-events-none absolute inset-0 dashboard-grid-overlay opacity-50 hidden md:block" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[22rem] bg-dashboardGlow opacity-90 hidden md:block" />
        </>
      ) : null}

      <div className="relative flex min-h-screen">
        <aside className={cn("hidden shrink-0 lg:block", isStitchDashboard ? "fixed right-0 top-0 z-40 h-screen w-64 p-0" : "w-[19.5rem] px-4 py-4")}>
          <SidebarContent locale={locale} role={role} roleLabel={copy.role} theme={theme} navItems={navItems} activeNavPath={activeNavPath} workerIncomplete={workerIncomplete} />
        </aside>

        {mobileOpen ? (
          <div className={cn("fixed inset-0 z-[10000] flex items-end justify-center lg:hidden", isAdminDashboard ? "bg-[#050505]" : "bg-gold")}>
            <div className="pointer-events-none fixed right-8 top-24 h-32 w-32 rounded-full bg-gold/25 blur-[80px]" />
            <div className="pointer-events-none fixed bottom-32 left-4 h-44 w-44 rounded-full bg-gold/10 blur-[90px]" />
            <div className="relative flex h-[min(92dvh,49.75rem)] w-full max-w-md animate-slideUp flex-col overflow-hidden rounded-t-[2.5rem] border border-white/10 bg-black text-white shadow-2xl">
              <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 bg-black/80 px-4 backdrop-blur-xl">
                <span className={cn("text-2xl font-black tracking-tight", isAdminDashboard ? "text-gold" : "text-[#775a00]")}>OSTA</span>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white active:scale-95"
                  aria-label={locale === "ar" ? "إغلاق القائمة" : "Close menu"}
                >
                  <X className="h-5 w-5" />
                </button>
              </header>

              <section className="flex shrink-0 items-center gap-4 px-4 pb-6 pt-8">
                <div className="relative">
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border-2 border-[#775a00] bg-[#121212] text-gold">
                    <UserCircle2 className="h-10 w-10" />
                  </div>
                  <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#775a00] text-white">
                    <ShieldCheck className="h-3.5 w-3.5" />
                  </span>
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-2xl font-black text-white">
                    {locale === "ar" ? "أحمد حسان" : "Ahmed Hassan"}
                  </h2>
                  <p className="mt-1 text-sm font-black uppercase tracking-[0.2em] text-[#f6be1a]">
                    {copy.role}
                  </p>
                </div>
              </section>

              <div className="px-4 pb-4">
                <SidebarRoleSwitcher locale={locale} currentRole={role} />
              </div>

              <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4 [-webkit-overflow-scrolling:touch]">
                <div className="space-y-3">
                  <h3 className="px-2 text-sm font-black text-white/40">
                    {locale === "ar" ? "أقسام لوحة التحكم" : "Dashboard sections"}
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    {navItems.slice(0, 6).map((item) => {
                      const Icon = item.icon;
                      const itemPath = stripLocalePrefix(item.href);
                      const active = itemPath === activeNavPath;

                      return (
                        <Link
                          key={item.href}
                          href={item.href as `/${string}`}
                          onClick={() => setMobileOpen(false)}
                          className={cn(
                            "flex min-h-[6.5rem] flex-col items-center justify-center gap-2 rounded-xl border p-3 text-center transition-all active:scale-95",
                            active
                              ? "border-gold bg-gold text-black"
                              : "border-white/5 bg-[#121212] text-white hover:border-gold/50"
                          )}
                        >
                          <Icon className={cn("h-8 w-8", active ? "text-black" : "text-gold")} />
                          <span className="max-w-full truncate text-xs font-black">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  {navItems.slice(6).map((item) => {
                    const Icon = item.icon;
                    const itemPath = stripLocalePrefix(item.href);
                    const active = itemPath === activeNavPath;

                    return (
                      <Link
                        key={item.href}
                        href={item.href as `/${string}`}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "flex items-center justify-between rounded-xl border border-white/5 bg-[#121212] p-4 text-white transition-colors hover:bg-white/5",
                          active && "border-gold/60"
                        )}
                      >
                        <span className="flex min-w-0 items-center gap-4">
                          <Icon className="h-5 w-5 shrink-0 text-gold" />
                          <span className={cn("truncate text-sm font-black", active ? "text-gold" : "text-white")}>{item.label}</span>
                          {workerIncomplete && (itemPath === "/worker/profile" || itemPath === "/worker/settings") && (
                            <span className="flex h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse" />
                          )}
                        </span>
                        <ArrowUpRight className="h-4 w-4 shrink-0 text-white/25" />
                      </Link>
                    );
                  })}

                  <Link
                    href={`/${locale}/contact`}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between rounded-xl border border-white/5 bg-[#121212] p-4 text-white transition-colors hover:bg-white/5"
                  >
                    <span className="flex items-center gap-4">
                      <ShieldCheck className="h-5 w-5 text-gold" />
                      <span className="text-sm font-black">{locale === "ar" ? "مركز المساعدة" : "Help center"}</span>
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-white/25" />
                  </Link>
                </div>
              </nav>

              <footer className="shrink-0 border-t border-white/10 bg-black/80 p-4 backdrop-blur-xl">
                <button
                  type="button"
                  onClick={async () => {
                    await logoutAuthSession();
                    window.location.replace(role === "admin" ? `/${locale}/login/admin` : `/${locale}/login`);
                  }}
                  className="flex h-14 w-full items-center justify-center gap-3 bg-white text-sm font-black text-black active:scale-95"
                >
                  <LogOut className="h-5 w-5" />
                  {locale === "ar" ? "تسجيل الخروج" : "Logout"}
                </button>
              </footer>
            </div>
          </div>
        ) : null}

        <div className={cn("flex min-w-0 flex-1 flex-col", isStitchDashboard ? "px-4 pb-28 pt-20 lg:mr-64 lg:px-12 lg:pb-12 lg:pt-12" : "px-3 pb-4 pt-3 sm:px-4 lg:px-0 lg:py-4 lg:pe-4")}>
          <header
            className={cn(
              "z-30 overflow-hidden border",
              isStitchDashboard
                ? "fixed inset-x-0 top-0 h-16 border-white/10 bg-black/80 px-4 shadow-none backdrop-blur-xl lg:static lg:mb-12 lg:h-auto lg:border-0 lg:bg-transparent lg:px-0 lg:backdrop-blur-0"
                : "dashboard-card top-4 rounded-[2rem] border-white/5 bg-onyx-800/50/[0.02] backdrop-blur-2xl"
            )}
          >
            {!isStitchDashboard ? <div className={cn("absolute inset-0 rounded-[2rem] overflow-hidden bg-gradient-to-r opacity-50", theme.accent)} /> : null}
            <div className={cn("relative flex items-center gap-4", isStitchDashboard ? "h-16 lg:h-auto" : "section-shell h-20 lg:h-24")}>
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className={cn(
                  "inline-flex h-11 w-11 items-center justify-center border lg:hidden",
                  isStitchDashboard ? "rounded bg-transparent text-gold border-transparent" : "rounded-full border-gold-700/15 bg-white/50 text-onyx-950"
                )}
              >
                <Menu className="h-5 w-5" />
              </button>

              {isStitchDashboard ? (
                <Link href={`/${locale}`} className="inline-flex items-center lg:hidden">
                  <img src="/logo.svg" alt="Ostafy" className="h-8 w-auto object-contain" />
                </Link>
              ) : null}

              <div className={cn("min-w-0 flex-1", isStitchDashboard ? "hidden lg:block" : "")}>
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "hidden h-11 w-11 items-center justify-center sm:flex",
                      isStitchDashboard ? "rounded-lg bg-[#100e08] text-gold" : "rounded-2xl bg-onyx-800/50 text-foreground shadow-xl"
                    )}
                  >
                    <LayoutDashboard className="h-5 w-5" />
                  </div>
                  <div
                    className={cn(
                      "min-w-0 flex-1 border px-5 py-3 text-sm",
                      isStitchDashboard
                        ? "rounded-lg border-[#e5ddc9] bg-[#fff8df] text-[#5a5248]"
                        : "rounded-full border-gold-700/10 bg-white/50 text-onyx-600 shadow-inner"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Search className={cn("h-4 w-4", isStitchDashboard ? "text-[#775a00]" : "text-onyx-600")} />
                      <span className="truncate opacity-60">{copy.search}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={cn("items-center gap-4", isStitchDashboard ? "ms-auto flex" : "hidden xl:flex")}>

                <LocaleSwitcher
                  locale={locale}
                  pathname={currentPath}
                  className={cn(
                    "inline-flex h-11 items-center justify-center px-4 text-[10px] font-bold uppercase tracking-widest transition-all duration-300",
                    isStitchDashboard
                      ? cn("hidden rounded border bg-white text-black hover:bg-white/90 sm:inline-flex lg:inline-flex", isAdminDashboard ? "border-gold" : "border-black")
                      : "rounded-full border border-white/5 bg-white/5 text-white hover:bg-white/10"
                  )}
                />
                <NotificationsPopover locale={locale} />
                <div className={cn(isStitchDashboard ? "hidden sm:block" : "")}>
                  <HeaderChatButton locale={locale} />
                </div>
                <div className="hidden sm:block">
                  <PwaInstallButton locale={locale} className="inline-flex h-11 items-center justify-center gap-1.5 rounded-lg border border-gold/40 bg-gold/10 px-3 text-xs font-bold text-gold hover:bg-gold/20 transition-all" />
                </div>
                <div
                  className={cn(
                    "flex items-center gap-3 border p-1.5 pe-4",
                    isStitchDashboard
                      ? "h-11 rounded border-gold bg-black/20 p-0 pe-0 sm:h-12 sm:w-12 sm:overflow-hidden"
                      : "rounded-full border-white/5 bg-white/5 shadow-xl"
                  )}
                >
                  <div className={cn("flex h-9 w-9 items-center justify-center", isStitchDashboard ? "h-10 w-10 rounded-full border border-gold bg-black text-gold sm:h-12 sm:w-12" : cn("rounded-full shadow-inner", theme.orb, theme.ring))}>
                    <UserCircle2 className="h-5 w-5" />
                  </div>
                  <div className={cn("text-start", isStitchDashboard ? "hidden" : "")}>
                    <p className={cn("text-sm font-bold", isStitchDashboard ? "text-[#100e08]" : "text-white")}>{shared.profile}</p>
                    <p className={cn("text-[10px] font-medium uppercase tracking-[0.2em]", isStitchDashboard ? "text-[#775a00]" : "text-gold-500/60")}>{shared.online}</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <div className={cn("flex-1", isStitchDashboard ? "w-full" : "section-shell pb-6 pt-12 lg:pb-7 lg:pt-14")}>
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

          {isAdminDashboard ? <PublicFooter locale={locale} /> : null}
        </div>

        {isClientDashboard || isVendorDashboard ? (
          <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-white/10 bg-black/80 px-2 py-3 text-white backdrop-blur-xl lg:hidden">
            {navItems.slice(2, 7).map((item) => {
              const Icon = item.icon;
              const itemPath = stripLocalePrefix(item.href);
              const active = itemPath === activeNavPath;

              return (
                <Link
                  key={item.href}
                  href={item.href as `/${string}`}
                  className={cn("flex flex-col items-center justify-center gap-1 text-[11px] font-black relative", active ? "text-gold" : "text-white/60")}
                >
                  <div className="relative">
                    <Icon className="h-5 w-5" />
                    {workerIncomplete && (itemPath === "/worker/profile" || itemPath === "/worker/settings") && (
                      <span className="absolute -top-1 -right-1 flex h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse" />
                    )}
                  </div>
                  <span className="max-w-full truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        ) : null}
      </div>
    </div>
  );
}

function SidebarRoleSwitcher({ locale, currentRole }: { locale: Locale; currentRole: DashboardRole }) {
  const isArabic = locale === "ar";
  const [open, setOpen] = useState(false);
  const [switchingRole, setSwitchingRole] = useState<string | null>(null);

  const [userProfiles, setUserProfiles] = useState<{ hasWorker: boolean; hasClient: boolean; hasVendor: boolean }>({
    hasWorker: currentRole === "worker",
    hasClient: currentRole === "client",
    hasVendor: currentRole === "vendor"
  });
  const [userIdentity, setUserIdentity] = useState<{ phone?: string; firstName?: string; lastName?: string }>({});

  useEffect(() => {
    fetchApiData<{
      user?: {
        hasWorkerProfile?: boolean;
        hasClientProfile?: boolean;
        hasVendorProfile?: boolean;
        phone?: string;
        firstName?: string;
        lastName?: string;
      };
    }>("/auth/me", {})
      .then((res) => {
        if (res?.user) {
          setUserProfiles({
            hasWorker: Boolean(res.user.hasWorkerProfile) || currentRole === "worker",
            hasClient: Boolean(res.user.hasClientProfile) || currentRole === "client",
            hasVendor: Boolean(res.user.hasVendorProfile) || currentRole === "vendor"
          });
          setUserIdentity({
            phone: res.user.phone,
            firstName: res.user.firstName,
            lastName: res.user.lastName
          });
        }
      })
      .catch(() => {
        // keep fallback
      });
  }, [currentRole]);

  const allRoles = [
    {
      key: "WORKER",
      roleId: "worker",
      label: isArabic ? "وضع الفني" : "Worker Mode",
      icon: Wrench,
      href: `/${locale}/worker`
    },
    {
      key: "CLIENT",
      roleId: "client",
      label: isArabic ? "وضع العميل" : "Client Mode",
      icon: User,
      href: `/${locale}/client`
    },
    {
      key: "VENDOR",
      roleId: "vendor",
      label: isArabic ? "وضع المورد" : "Vendor Mode",
      icon: Store,
      href: `/${locale}/vendor`
    }
  ];

  const registeredRoles = allRoles.filter((r) => {
    if (r.roleId === "worker") return userProfiles.hasWorker;
    if (r.roleId === "client") return userProfiles.hasClient;
    if (r.roleId === "vendor") return userProfiles.hasVendor;
    return true;
  });

  const missingRoles = allRoles.filter((r) => !registeredRoles.includes(r));

  const addModeHref = (() => {
    const query = new URLSearchParams();
    if (userIdentity.phone) query.set("phone", userIdentity.phone);
    if (userIdentity.firstName) query.set("firstName", userIdentity.firstName);
    if (userIdentity.lastName) query.set("lastName", userIdentity.lastName);
    query.set("have", registeredRoles.map((r) => r.roleId).join(","));
    return `/${locale}/register?${query.toString()}`;
  })();

  const currentObj = allRoles.find((r) => r.roleId === currentRole) || {
    key: currentRole.toUpperCase(),
    roleId: currentRole,
    label: currentRole === "admin" ? (isArabic ? "وضع المسؤول" : "Admin Mode") : (isArabic ? "وضع الفني" : "Worker Mode"),
    icon: currentRole === "admin" ? Shield : Wrench,
    href: `/${locale}/${currentRole}`
  };

  async function handleSwitch(roleKey: "WORKER" | "CLIENT" | "VENDOR", href: string) {
    if (currentRole === roleKey.toLowerCase()) {
      setOpen(false);
      return;
    }

    setSwitchingRole(roleKey);
    try {
      await postApiData<{ role: string }, { targetRole: "WORKER" | "CLIENT" | "VENDOR" }>("/auth/switch-role", { targetRole: roleKey });
      window.location.assign(href);
    } catch (err) {
      console.error("Failed to switch role", err);
      window.location.assign(href);
    } finally {
      setSwitchingRole(null);
    }
  }

  const CurrentIcon = currentObj.icon;

  return (
    <div className="relative mt-2.5 w-full z-40">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between border border-gold/40 bg-gold/10 px-3.5 py-2.5 text-xs font-black uppercase text-white transition hover:border-gold hover:bg-gold/20 active:scale-[0.99]"
      >
        <div className="flex items-center gap-2 min-w-0">
          <CurrentIcon className="h-4 w-4 shrink-0 text-gold" />
          <span className="truncate text-gold font-black">{currentObj.label}</span>
        </div>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-gold transition-transform duration-200", open ? "rotate-180" : "")} />
      </button>

      {open ? (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 border border-white/15 bg-black p-1 shadow-2xl">
          {registeredRoles.map((r) => {
            const Icon = r.icon;
            const isActive = currentRole === r.roleId;
            const isSwitching = switchingRole === r.key;

            return (
              <button
                key={r.key}
                type="button"
                disabled={isSwitching}
                onClick={() => void handleSwitch(r.key as "WORKER" | "CLIENT" | "VENDOR", r.href)}
                className={cn(
                  "flex w-full items-center justify-between px-3 py-2.5 text-xs font-bold transition",
                  isActive
                    ? "bg-gold/20 text-gold font-black"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                )}
              >
                <div className="flex items-center gap-2">
                  <Icon className={cn("h-3.5 w-3.5", isActive ? "text-gold" : "text-white/60")} />
                  <span>{r.label}</span>
                </div>
                {isSwitching ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-gold" />
                ) : isActive ? (
                  <Check className="h-3.5 w-3.5 text-gold" />
                ) : null}
              </button>
            );
          })}
          {missingRoles.length > 0 ? (
            <Link
              href={addModeHref}
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 border-t border-white/10 px-3 py-2.5 text-xs font-bold text-gold/80 transition hover:bg-gold/10 hover:text-gold"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{isArabic ? "إضافة وضع جديد" : "Add new mode"}</span>
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function SidebarContent({
  locale,
  role,
  roleLabel,
  theme,
  navItems,
  activeNavPath,
  workerIncomplete
}: {
  locale: Locale;
  role: DashboardRole;
  roleLabel: string;
  theme: { tag: string; accent: string; orb: string; ring: string };
  navItems: NavItem[];
  activeNavPath: string | null;
  workerIncomplete?: boolean;
}) {
  const isClientDashboard = role === "client";
  const isWorkerDashboard = role === "worker";
  const isVendorDashboard = role === "vendor";
  const isAdminDashboard = role === "admin";
  const isStitchSidebar = isClientDashboard || isWorkerDashboard || isVendorDashboard || isAdminDashboard;

  return (
    <div
      className={cn(
        "relative flex h-full min-h-0 flex-col overflow-x-hidden overflow-y-auto overscroll-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
        isStitchSidebar
          ? "border-l border-white/10 bg-black/90 px-4 py-4 text-white backdrop-blur-md"
          : "dashboard-card-dark"
      )}
    >
      {!isStitchSidebar ? (
        <>
          <div className={cn("absolute -right-12 top-8 h-36 w-36 rounded-full blur-3xl", theme.orb)} />
          <div className="absolute -left-14 bottom-12 h-44 w-44 rounded-full bg-white/5 blur-3xl" />
        </>
      ) : null}

      <div className={cn("relative flex flex-col border", isStitchSidebar ? "border-0 p-0" : "items-center rounded-[2rem] border-white/5 bg-white/5 p-5 backdrop-blur-xl")}>
        <Link href={`/${locale}`} className="flex h-12 shrink-0 items-center justify-center w-full">
          <img src="/logo.svg" alt="Ostafy" className="h-8 w-auto object-contain" />
        </Link>

        <SidebarRoleSwitcher locale={locale} currentRole={role} />

        {!isStitchSidebar ? <div className={cn("mt-5 flex w-full items-center justify-between border px-3 py-3 text-xs", "rounded-2xl border-white/5 bg-white/5 px-4")}>
          <div>
            <p className="opacity-40">{locale === "ar" ? "الوضع" : "Mode"}</p>
            <p className="mt-1 font-bold text-white/90">{isClientDashboard ? (locale === "ar" ? "تشغيل العميل" : "Client ops") : theme.tag}</p>
          </div>
          <div className="text-end">
            <p className="opacity-40">{locale === "ar" ? "اللغة" : "Locale"}</p>
            <p className="mt-1 font-bold text-white/90">{locale.toUpperCase()}</p>
          </div>
        </div> : null}
      </div>

      <nav className={cn("relative grid", isStitchSidebar ? "mt-4 gap-1.5" : "mt-6 gap-2")}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const itemPath = stripLocalePrefix(item.href);
          const active = itemPath === activeNavPath;

          return (
            <Link
              key={item.href}
              href={item.href as `/${string}`}
              className={cn(
                "group flex items-center justify-between border px-4 py-3 text-sm font-bold transition-all duration-300",
                isStitchSidebar
                  ? active
                    ? cn(
                      "text-gold",
                      isAdminDashboard
                        ? "border-gold bg-gold text-black"
                        : "border-b-2 border-gold bg-transparent"
                    )
                    : cn(
                      "border-transparent bg-transparent text-white/70 hover:bg-white/5 hover:text-white",
                      isAdminDashboard && "hover:border-gold/40"
                    )
                  : active
                    ? "rounded-2xl border-gold-500/20 bg-gold-500 text-onyx-950 shadow-gold"
                    : "rounded-2xl border-transparent bg-transparent text-white/60 hover:bg-white/5 hover:text-white"
              )}
            >
              <span className="flex items-center gap-3">
                <span className={cn("flex h-9 w-9 items-center justify-center transition-all duration-300", isStitchSidebar ? "rounded-none" : "rounded-xl", active ? (isAdminDashboard ? "bg-black text-gold" : "bg-white/10") : "bg-white/5 group-hover:bg-white/10")}>
                  <Icon className="h-4 w-4" />
                </span>
                {item.label}
                {workerIncomplete && (itemPath === "/worker/profile" || itemPath === "/worker/settings") && (
                  <span className="flex h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse" />
                )}
              </span>
              <ArrowUpRight className={cn("h-4 w-4 transition-all duration-500", active ? "opacity-100" : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0")} />
            </Link>
          );
        })}
      </nav>

      <div className={cn("relative mt-6 border border-white/10 bg-white/[0.03] p-4", isStitchSidebar ? "hidden" : "rounded-[2rem] p-6")}>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">{locale === "ar" ? "صحة المنصة" : "Platform health"}</p>
            <p className="mt-2 text-3xl font-bold text-white">98%</p>
          </div>
          <div className={cn("flex h-11 w-11 items-center justify-center", isClientDashboard ? "rounded-lg bg-gold text-[#100e08]" : cn("rounded-2xl shadow-inner", theme.orb, theme.ring))}>
            <ShieldCheck className="h-6 w-6" />
          </div>
        </div>
        <p className="text-sm leading-relaxed text-white/55">
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
        onClick={async () => {
          await logoutAuthSession();
          window.location.replace(role === "admin" ? `/${locale}/login/admin` : `/${locale}/login`);
        }}
        className={cn(
          "relative mt-auto inline-flex items-center justify-between border border-error/10 bg-error/5 px-5 py-4 text-sm font-bold text-error transition-all duration-300 hover:bg-error/10",
          isClientDashboard ? "rounded-lg" : "rounded-2xl"
        )}
      >
        <span className="flex items-center gap-3">
          <LogOut className="h-4 w-4" />
          {locale === "ar" ? "تسجيل الخروج" : "Logout"}
        </span>
        <ArrowUpRight className="h-4 w-4 opacity-50" />
      </button>


    </div>
  );
}
