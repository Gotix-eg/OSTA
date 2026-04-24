"use client";

import { useState } from "react";
import { Check, Package, Zap, ShieldCheck, CreditCard, Loader2 } from "lucide-react";
import type { Locale } from "@/lib/locales";
import { cn } from "@/lib/utils";

const MOCK_PACKAGES = [
  { id: "pkg_basic", name: { ar: "الباقة الأساسية", en: "Basic Package" }, quota: 10, price: 200, popular: false },
  { id: "pkg_pro", name: { ar: "الباقة الاحترافية", en: "Pro Package" }, quota: 25, price: 450, popular: true },
  { id: "pkg_max", name: { ar: "باقة الحد الأقصى", en: "Max Package" }, quota: 50, price: 800, popular: false }
];

export function WorkerPackages({ locale }: { locale: Locale }) {
  const isArabic = locale === "ar";
  const [selectedPkg, setSelectedPkg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Mock User State
  const currentQuota = 3;
  const totalOrdersUsed = 12;

  async function handleBuy() {
    setLoading(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
    setSuccess(true);
  }

  if (success) {
    return (
      <div className="rounded-3xl bg-white p-8 border border-gray-100 text-center shadow-sm">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
          <ShieldCheck className="h-10 w-10 text-success" />
        </div>
        <h2 className="mt-6 text-2xl font-bold text-gray-900">{isArabic ? "تم شراء الباقة بنجاح" : "Package purchased successfully"}</h2>
        <p className="mt-2 text-gray-500">{isArabic ? "تمت إضافة الأوردرات إلى رصيدك. يمكنك الآن استقبال طلبات جديدة." : "Orders have been added to your quota. You can now receive new requests."}</p>
        <button onClick={() => setSuccess(false)} className="mt-8 rounded-xl bg-gray-900 px-6 py-2 text-sm font-semibold text-white">
          {isArabic ? "العودة للباقات" : "Back to Packages"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div className="rounded-3xl bg-gray-900 p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Zap className="w-48 h-48" />
        </div>
        <div className="relative z-10">
          <h1 className="text-2xl font-bold">{isArabic ? "رصيد الأوردرات والباقات" : "Order Quota & Packages"}</h1>
          <p className="mt-2 text-gray-400 max-w-lg">{isArabic ? "رصيدك الحالي من الأوردرات التي يمكنك استقبالها. اشحن رصيدك عبر اختيار باقة من الأسفل." : "Your current order quota. Top up your balance by selecting a package below."}</p>
          
          <div className="mt-8 flex flex-wrap gap-6">
            <div className="bg-white/10 rounded-2xl p-5 border border-white/10 backdrop-blur-sm min-w-[160px]">
              <p className="text-sm font-medium text-gray-400">{isArabic ? "الرصيد المتاح" : "Available Quota"}</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-4xl font-black">{currentQuota}</span>
                <span className="text-sm text-gray-400">{isArabic ? "أوردر" : "orders"}</span>
              </div>
            </div>
            <div className="bg-white/5 rounded-2xl p-5 border border-white/5 min-w-[160px]">
              <p className="text-sm font-medium text-gray-400">{isArabic ? "إجمالي المنفذ" : "Total Completed"}</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-4xl font-bold">{totalOrdersUsed}</span>
                <span className="text-sm text-gray-400">{isArabic ? "أوردر" : "orders"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Packages Selection */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-6">{isArabic ? "اختر باقة جديدة" : "Choose a new package"}</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {MOCK_PACKAGES.map((pkg) => (
            <button
              key={pkg.id}
              onClick={() => setSelectedPkg(pkg.id)}
              className={cn(
                "relative text-start rounded-3xl border-2 p-6 transition-all duration-200 overflow-hidden",
                selectedPkg === pkg.id ? "border-primary-600 bg-primary-50/50 shadow-md scale-[1.02]" : "border-gray-100 bg-white hover:border-primary-200"
              )}
            >
              {pkg.popular && (
                <div className="absolute top-0 right-0 bg-primary-600 text-white text-[10px] font-bold uppercase tracking-wider py-1 px-3 rounded-bl-xl">
                  {isArabic ? "الأكثر طلباً" : "Popular"}
                </div>
              )}
              
              <Package className={cn("h-8 w-8 mb-4", selectedPkg === pkg.id ? "text-primary-600" : "text-gray-400")} />
              <h3 className="font-bold text-gray-900 text-lg">{pkg.name[locale]}</h3>
              
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-black text-gray-900">{pkg.price}</span>
                <span className="text-sm font-medium text-gray-500">{isArabic ? "ج.م" : "EGP"}</span>
              </div>
              
              <div className="mt-6 flex items-center gap-3 border-t border-gray-100 pt-6">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success/20 text-success">
                  <Check className="h-4 w-4" />
                </div>
                <span className="font-medium text-gray-700">{isArabic ? `رصيد ${pkg.quota} أوردرات` : `${pkg.quota} Orders Quota`}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Checkout Section */}
      {selectedPkg && (
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{isArabic ? "طريقة الدفع: فودافون كاش / إنستا باي" : "Payment: Vodafone Cash / InstaPay"}</p>
              <p className="text-sm text-gray-500">{isArabic ? "سيتم التحقق من الدفع يدوياً عبر الإدارة." : "Payment will be verified manually by admin."}</p>
            </div>
          </div>
          
          <button 
            onClick={handleBuy}
            disabled={loading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-8 py-3.5 text-sm font-bold text-white transition hover:bg-primary-700 disabled:opacity-70"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
            {isArabic ? "تأكيد الشراء" : "Confirm Purchase"}
          </button>
        </div>
      )}
    </div>
  );
}
