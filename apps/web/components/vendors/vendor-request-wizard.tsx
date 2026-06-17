"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ShieldCheck, FileText, CheckCircle2, PackageOpen } from "lucide-react";
import type { Locale } from "@/lib/locales";
import { cn } from "@/lib/utils";

export function VendorRequestWizard({ locale, vendorId }: { locale: Locale; vendorId: string }) {
  const isArabic = locale === "ar";
  const [step, setStep] = useState(0);
  const [details, setDetails] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const paymentOptions = [
    { id: "instapay", label: "InstaPay", arLabel: "إنستا باي" },
    { id: "vodafone", label: "Vodafone Cash", arLabel: "فودافون كاش" },
    { id: "cod", label: "Cash on Delivery", arLabel: "الدفع عند الاستلام" }
  ];

  const deliveryOptions = [
    { id: "delivery", label: "Deliver to my address", arLabel: "توصيل لعنواني" },
    { id: "pickup", label: "Pick up from store", arLabel: "استلام من المتجر" }
  ];

  if (submitted) {
    return (
      <div className="animate-fadeIn py-16 text-center">
        <div className="mx-auto max-w-lg px-4 flex flex-col items-center">
          <div className="h-20 w-20 bg-emerald-500/10 border border-emerald-500/25 rounded-full flex items-center justify-center text-emerald-500 mb-6">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h1 className="text-3xl font-black text-white">{isArabic ? "تم إرسال طلبك للمتجر" : "Request sent to vendor"}</h1>
          <p className="mt-4 text-onyx-300 text-sm leading-relaxed">
            {isArabic 
              ? "سيقوم التاجر بمراجعة طلبك والرد عليك بعرض سعر. يمكنك متابعة حالة الطلب من الداشبورد." 
              : "The vendor will review your request and reply with a quote. You can track this from your dashboard."}
          </p>
          <Link href={`/${locale}/dashboards`} className="mt-8 btn-gold py-3.5 px-8 text-sm font-black shadow-md">
            {isArabic ? "الذهاب للداشبورد" : "Go to Dashboard"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Navigation Back */}
      <div className="text-start">
        <Link href={`/${locale}/vendors/${vendorId}`} className="inline-flex items-center gap-2 text-sm font-semibold text-onyx-400 transition hover:text-gold-500">
          {isArabic ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
          {isArabic ? "إلغاء الطلب" : "Cancel Request"}
        </Link>
      </div>

      <div className="mx-auto max-w-2xl">
        <div className="overflow-hidden rounded-3xl onyx-card border-white/5 bg-white/[0.02]">
          {/* Header */}
          <div className="border-b border-white/5 bg-white/[0.01] p-6 sm:p-8 text-start">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-500/10 border border-gold-500/25 text-gold-500">
              <FileText className="h-6 w-6" />
            </div>
            <h1 className="mt-5 text-2xl font-black text-white">{isArabic ? "طلب تسعير خاص" : "Request Custom Quote"}</h1>
            <p className="mt-2 text-sm text-onyx-400">{isArabic ? "اشرح للمتجر ما تحتاجه بالضبط ليقدم لك أفضل سعر متاح." : "Explain what you need so the vendor can provide the best price."}</p>
          </div>

          <div className="p-6 sm:p-8 space-y-8 text-start">
            {step === 0 && (
              <div className="space-y-4">
                <label className="block text-sm font-bold text-onyx-300">
                  {isArabic ? "تفاصيل الطلب (المنتجات، الكميات، الماركات)" : "Request details (products, quantities, brands)"}
                </label>
                <textarea
                  value={details}
                  onChange={e => setDetails(e.target.value)}
                  placeholder={isArabic ? "مثال: محتاج 5 علب دهان بلاستيك مط لون أبيض من جوتن..." : "Example: I need 5 buckets of matte white plastic paint..."}
                  rows={6}
                  className="w-full rounded-2xl border border-white/10 bg-onyx-900 p-4 text-white placeholder-onyx-500 focus:outline-none focus:border-gold-500/50 transition-colors text-sm"
                />
              </div>
            )}

            {step === 1 && (
              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="block text-sm font-bold text-onyx-300">
                    {isArabic ? "طريقة الاستلام المفضلة" : "Preferred delivery method"}
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {deliveryOptions.map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setDeliveryMethod(opt.id)}
                        className={cn(
                          "flex items-center gap-3 rounded-xl border p-4 text-start transition-all duration-200",
                          deliveryMethod === opt.id 
                            ? "border-gold-500 bg-gold-500/10 text-gold-500" 
                            : "border-white/10 bg-onyx-900 text-onyx-300 hover:border-white/20 hover:text-white"
                        )}
                      >
                        <PackageOpen className={cn("h-5 w-5", deliveryMethod === opt.id ? "text-gold-500" : "text-onyx-500")} />
                        <span className="font-semibold text-sm">{isArabic ? opt.arLabel : opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-bold text-onyx-300">
                    {isArabic ? "طريقة الدفع المفضلة" : "Preferred payment method"}
                  </label>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {paymentOptions.map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setPaymentMethod(opt.id)}
                        className={cn(
                          "rounded-xl border p-4 text-center transition-all duration-200 text-sm font-semibold",
                          paymentMethod === opt.id 
                            ? "border-gold-500 bg-gold-500/10 text-gold-500" 
                            : "border-white/10 bg-onyx-900 text-onyx-300 hover:border-white/20 hover:text-white"
                        )}
                      >
                        <span>{isArabic ? opt.arLabel : opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-6 border-t border-white/5">
              {step === 0 ? (
                <div />
              ) : (
                <button
                  onClick={() => setStep(0)}
                  className="rounded-xl px-5 py-2.5 text-sm font-semibold text-onyx-400 hover:text-white hover:bg-white/5 transition"
                >
                  {isArabic ? "تعديل التفاصيل" : "Edit details"}
                </button>
              )}

              {step === 0 ? (
                <button
                  onClick={() => setStep(1)}
                  disabled={details.trim().length < 10}
                  className="btn-gold px-6 py-2.5 text-sm font-black flex items-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isArabic ? "متابعة" : "Continue"}
                  {isArabic ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                </button>
              ) : (
                <button
                  onClick={() => setSubmitted(true)}
                  disabled={!paymentMethod || !deliveryMethod}
                  className="btn-gold px-6 py-2.5 text-sm font-black flex items-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShieldCheck className="h-4 w-4" />
                  {isArabic ? "إرسال الطلب للمتجر" : "Submit Request to Vendor"}
                </button>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
