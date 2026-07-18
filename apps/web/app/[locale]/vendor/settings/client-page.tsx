"use client";

import { useState } from "react";
import { BriefcaseBusiness, Loader2, Settings, ShieldCheck, Store, User, Wrench } from "lucide-react";

import {
  VendorStitchAction,
  VendorStitchHero,
  VendorStitchPanel,
  VendorStitchShell,
  VendorStitchTopStrip
} from "@/components/vendor/vendor-stitch-ui";
import { postApiData } from "@/lib/api";
import type { Locale } from "@/lib/locales";
import { cn } from "@/lib/utils";

export function VendorSettingsClientPage({ locale }: { locale: Locale }) {
  const isArabic = locale === "ar";
  const [pendingRole, setPendingRole] = useState<"CLIENT" | "WORKER" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const modes = [
    { href: `/${locale}/client`, icon: User, title: isArabic ? "وضع العميل" : "Client mode", targetRole: "CLIENT" as const, current: false },
    { href: `/${locale}/worker`, icon: Wrench, title: isArabic ? "وضع الفني" : "Worker mode", targetRole: "WORKER" as const, current: false },
    { href: `/${locale}/vendor/settings`, icon: Store, title: isArabic ? "وضع المورد" : "Vendor mode", targetRole: "VENDOR" as const, current: true }
  ];

  async function switchRole(targetRole: "CLIENT" | "WORKER", href: string) {
    setError(null);
    setPendingRole(targetRole);

    try {
      await postApiData<{ role: string }, { targetRole: "CLIENT" | "WORKER" }>("/auth/switch-role", { targetRole });
      window.location.assign(href);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : isArabic ? "تعذر تبديل وضع التشغيل" : "Could not switch operating mode");
      setPendingRole(null);
    }
  }

  return (
    <VendorStitchShell locale={locale}>
      <VendorStitchTopStrip locale={locale} title={isArabic ? "إعدادات المورد" : "Vendor settings"} />
      <VendorStitchHero
        locale={locale}
        eyebrow={isArabic ? "هوية وتشغيل" : "Identity and operation"}
        title={isArabic ? "إعدادات" : "Vendor"}
        highlight={isArabic ? "المتجر" : "settings"}
        subtitle={isArabic ? "بيانات المتجر، وضع الحساب، والتنقل بين أدوار أُسطفاي في شاشة واحدة بنفس التصميم." : "Store profile, account mode, and role switching in one Stitch-aligned settings screen."}
      />

      <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <VendorStitchPanel eyebrow={isArabic ? "هوية الحساب" : "Account identity"} title={isArabic ? "بيانات المتجر" : "Store profile"}>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center border-2 border-gold bg-[#121212] text-gold">
              <Store className="h-11 w-11" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-gold">{isArabic ? "مورد معتمد" : "Verified vendor"}</p>
              <h2 className="mt-2 text-3xl font-black uppercase text-white">{isArabic ? "متجر أُسطفاي" : "Ostafy Store"}</h2>
              <p className="mt-2 text-sm font-semibold text-white/45">{isArabic ? "البيانات الحقيقية تظهر من حسابك عند ربط API الإعدادات." : "Live profile data will appear here once the settings API is connected."}</p>
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="border border-white/10 bg-[#121212] p-4">
              <ShieldCheck className="h-5 w-5 text-gold" />
              <p className="mt-3 text-sm font-black text-white">{isArabic ? "حساب موثق" : "Verified account"}</p>
              <p className="mt-1 text-xs leading-5 text-white/45">{isArabic ? "جاهز لاستقبال طلبات الخامات." : "Ready to receive material orders."}</p>
            </div>
            <div className="border border-white/10 bg-[#121212] p-4">
              <BriefcaseBusiness className="h-5 w-5 text-gold" />
              <p className="mt-3 text-sm font-black text-white">{isArabic ? "تشغيل تجاري" : "Commercial mode"}</p>
              <p className="mt-1 text-xs leading-5 text-white/45">{isArabic ? "مخزون، مزايدات، إعلانات، ومحفظة." : "Inventory, bids, ads, and wallet."}</p>
            </div>
          </div>
        </VendorStitchPanel>

        <VendorStitchPanel eyebrow={isArabic ? "تبديل الوضع" : "Mode switcher"} title={isArabic ? "أدوار أُسطفاي" : "Ostafy roles"}>
          {error ? <div className="mb-4 border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200">{error}</div> : null}
          <div className="grid gap-3">
            {modes.map((mode) => {
              const Icon = mode.icon;
              const isPending = pendingRole === mode.targetRole;
              const content = (
                <>
                  <span className="flex items-center gap-4">
                    <span className={cn("flex h-11 w-11 items-center justify-center", mode.current ? "bg-black text-gold" : "bg-black/40 text-gold")}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-sm font-black uppercase">{mode.title}</span>
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-[0.18em]">
                    {mode.current ? (isArabic ? "الحالي" : "Current") : isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : (isArabic ? "تبديل" : "Switch")}
                  </span>
                </>
              );

              return mode.current ? (
                <div key={mode.href} className="flex items-center justify-between border border-gold bg-gold p-4 text-black">
                  {content}
                </div>
              ) : (
                <button
                  key={mode.href}
                  type="button"
                  disabled={pendingRole !== null}
                  onClick={() => {
                    if (mode.targetRole !== "VENDOR") {
                      void switchRole(mode.targetRole, mode.href);
                    }
                  }}
                  className="flex items-center justify-between border border-white/10 bg-[#121212] p-4 text-start text-white transition-colors hover:border-gold/60 disabled:cursor-wait disabled:opacity-70"
                >
                  {content}
                </button>
              );
            })}
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <VendorStitchAction href={`/${locale}/vendor/inventory`} tone="light">
              <Settings className="h-4 w-4" />
              {isArabic ? "إدارة المخزون" : "Manage inventory"}
            </VendorStitchAction>
            <VendorStitchAction href={`/${locale}/vendor/ads`} tone="ghost">
              {isArabic ? "الإعلانات" : "Ads"}
            </VendorStitchAction>
          </div>
        </VendorStitchPanel>
      </div>
    </VendorStitchShell>
  );
}
