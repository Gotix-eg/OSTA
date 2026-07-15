import Link from "next/link";
import { notFound } from "next/navigation";
import { BriefcaseBusiness, Settings, ShieldCheck, Store, User, Wrench } from "lucide-react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import {
  VendorStitchAction,
  VendorStitchHero,
  VendorStitchPanel,
  VendorStitchShell,
  VendorStitchTopStrip
} from "@/components/vendor/vendor-stitch-ui";
import { isLocale } from "@/lib/locales";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function VendorSettingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const isArabic = locale === "ar";

  const modes = [
    { href: `/${locale}/client/settings`, icon: User, title: isArabic ? "وضع العميل" : "Client mode", current: false },
    { href: `/${locale}/worker/settings`, icon: Wrench, title: isArabic ? "وضع الفني" : "Worker mode", current: false },
    { href: `/${locale}/vendor/settings`, icon: Store, title: isArabic ? "وضع المورد" : "Vendor mode", current: true }
  ];

  return (
    <DashboardShell locale={locale} role="vendor">
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
              <div className="flex h-24 w-24 shrink-0 items-center justify-center border-2 border-[#f5bd18] bg-[#121212] text-[#f5bd18]">
                <Store className="h-11 w-11" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#f5bd18]">{isArabic ? "مورد معتمد" : "Verified vendor"}</p>
                <h2 className="mt-2 text-3xl font-black uppercase text-white">{isArabic ? "متجر أُسطفاي" : "Ostafy Store"}</h2>
                <p className="mt-2 text-sm font-semibold text-white/45">{isArabic ? "البيانات الحقيقية تظهر من حسابك عند ربط API الإعدادات." : "Live profile data will appear here once the settings API is connected."}</p>
              </div>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="border border-white/10 bg-[#121212] p-4">
                <ShieldCheck className="h-5 w-5 text-[#f5bd18]" />
                <p className="mt-3 text-sm font-black text-white">{isArabic ? "حساب موثق" : "Verified account"}</p>
                <p className="mt-1 text-xs leading-5 text-white/45">{isArabic ? "جاهز لاستقبال طلبات الخامات." : "Ready to receive material orders."}</p>
              </div>
              <div className="border border-white/10 bg-[#121212] p-4">
                <BriefcaseBusiness className="h-5 w-5 text-[#f5bd18]" />
                <p className="mt-3 text-sm font-black text-white">{isArabic ? "تشغيل تجاري" : "Commercial mode"}</p>
                <p className="mt-1 text-xs leading-5 text-white/45">{isArabic ? "مخزون، مزايدات، إعلانات، ومحفظة." : "Inventory, bids, ads, and wallet."}</p>
              </div>
            </div>
          </VendorStitchPanel>

          <VendorStitchPanel eyebrow={isArabic ? "تبديل الوضع" : "Mode switcher"} title={isArabic ? "أدوار أُسطفاي" : "Ostafy roles"}>
            <div className="grid gap-3">
              {modes.map((mode) => {
                const Icon = mode.icon;
                return (
                  <Link
                    key={mode.href}
                    href={mode.href}
                    className={cn(
                      "flex items-center justify-between border p-4 transition-colors",
                      mode.current ? "border-[#f5bd18] bg-[#f5bd18] text-black" : "border-white/10 bg-[#121212] text-white hover:border-[#f5bd18]/60"
                    )}
                  >
                    <span className="flex items-center gap-4">
                      <span className={cn("flex h-11 w-11 items-center justify-center", mode.current ? "bg-black text-[#f5bd18]" : "bg-black/40 text-[#f5bd18]")}>
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="text-sm font-black uppercase">{mode.title}</span>
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-[0.18em]">{mode.current ? (isArabic ? "الحالي" : "Current") : (isArabic ? "تبديل" : "Switch")}</span>
                  </Link>
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
    </DashboardShell>
  );
}
