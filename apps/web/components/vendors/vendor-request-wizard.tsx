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
      <div className="w-full bg-[#f5bd18] min-h-screen py-16 text-center text-black font-sans">
        <div className="mx-auto max-w-lg px-4 flex flex-col items-center">
          <div className="h-20 w-20 bg-black border border-white/10 flex items-center justify-center text-[#f5bd18] mb-6">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h1 className="text-3xl font-black uppercase text-black">{isArabic ? "تم إرسال طلبك للمتجر" : "Request sent to vendor"}</h1>
          <p className="mt-4 text-black/80 font-bold text-sm leading-relaxed">
            {isArabic 
              ? "سيقوم التاجر بمراجعة طلبك والرد عليك بعرض سعر. يمكنك متابعة حالة الطلب من الداشبورد." 
              : "The vendor will review your request and reply with a quote. You can track this from your dashboard."}
          </p>
          <Link href={`/${locale}/client`} className="mt-8 bg-black text-[#f5bd18] py-4 px-8 text-xs font-black uppercase shadow-[4px_4px_0_#fff] transition-all hover:bg-white hover:text-black">
            {isArabic ? "الذهاب للداشبورد" : "Go to Dashboard"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#f5bd18] min-h-screen pb-16 text-black font-sans">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Navigation Back */}
        <div className="mb-6 text-start">
          <Link href={`/${locale}/vendors/${vendorId}`} className="inline-flex items-center gap-2 text-xs font-black uppercase text-black transition-all hover:bg-black hover:text-[#f5bd18] px-3 py-2 border border-black">
            {isArabic ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
            {isArabic ? "إلغاء الطلب والعودة للمتجر" : "Cancel Request & Back to Store"}
          </Link>
        </div>

        <div className="mx-auto max-w-2xl border border-white/10 bg-black text-white p-6 md:p-10 shadow-[6px_6px_0_#1a1c1c]">
          {/* Header */}
          <div className="border-b border-white/10 pb-6 mb-6 text-start">
            <div className="flex h-12 w-12 items-center justify-center bg-[#f5bd18] text-black mb-4">
              <FileText className="h-6 w-6" />
            </div>
            <h1 className="text-2xl md:text-3xl font-black uppercase text-white">{isArabic ? "طلب تسعير خاص" : "Request Custom Quote"}</h1>
            <p className="mt-2 text-xs font-semibold text-white/60">{isArabic ? "اشرح للمتجر ما تحتاجه بالضبط ليقدم لك أفضل سعر متاح." : "Explain what you need so the vendor can provide the best price."}</p>
          </div>

          <div className="space-y-6 text-start">
            {step === 0 && (
              <div className="space-y-3">
                <label className="block text-xs font-black uppercase tracking-wider text-[#f5bd18]">
                  {isArabic ? "تفاصيل الطلب (المنتجات، الكميات، الماركات)" : "Request details (products, quantities, brands)"}
                </label>
                <textarea
                  value={details}
                  onChange={e => setDetails(e.target.value)}
                  placeholder={isArabic ? "مثال: محتاج 5 علب دهان بلاستيك مط لون أبيض من جوتن..." : "Example: I need 5 buckets of matte white plastic paint..."}
                  rows={6}
                  className="w-full border border-white/20 bg-[#121212] p-4 text-white placeholder-white/30 text-xs font-bold focus:outline-none focus:border-[#f5bd18]"
                />
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="block text-xs font-black uppercase tracking-wider text-[#f5bd18]">
                    {isArabic ? "طريقة الاستلام المفضلة" : "Preferred delivery method"}
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {deliveryOptions.map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setDeliveryMethod(opt.id)}
                        className={cn(
                          "flex items-center gap-3 border p-4 text-start transition-all text-xs font-bold uppercase",
                          deliveryMethod === opt.id 
                            ? "border-[#f5bd18] bg-[#f5bd18] text-black" 
                            : "border-white/10 bg-[#121212] text-white hover:border-white/30"
                        )}
                      >
                        <PackageOpen className={cn("h-5 w-5", deliveryMethod === opt.id ? "text-black" : "text-[#f5bd18]")} />
                        <span>{isArabic ? opt.arLabel : opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-black uppercase tracking-wider text-[#f5bd18]">
                    {isArabic ? "طريقة الدفع المفضلة" : "Preferred payment method"}
                  </label>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {paymentOptions.map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setPaymentMethod(opt.id)}
                        className={cn(
                          "border p-4 text-center transition-all text-xs font-black uppercase",
                          paymentMethod === opt.id 
                            ? "border-[#f5bd18] bg-[#f5bd18] text-black" 
                            : "border-white/10 bg-[#121212] text-white hover:border-white/30"
                        )}
                      >
                        <span>{isArabic ? opt.arLabel : opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-6 border-t border-white/10">
              {step === 0 ? (
                <div />
              ) : (
                <button
                  onClick={() => setStep(0)}
                  className="px-4 py-2 text-xs font-black uppercase text-white/60 hover:text-white transition"
                >
                  {isArabic ? "تعديل التفاصيل" : "Edit details"}
                </button>
              )}

              {step === 0 ? (
                <button
                  onClick={() => setStep(1)}
                  disabled={details.trim().length < 10}
                  className="bg-[#f5bd18] text-black px-6 py-3 text-xs font-black uppercase shadow-[3px_3px_0_#fff] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isArabic ? "متابعة" : "Continue"}
                  {isArabic ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                </button>
              ) : (
                <button
                  onClick={() => setSubmitted(true)}
                  disabled={!paymentMethod || !deliveryMethod}
                  className="bg-[#f5bd18] text-black px-6 py-3 text-xs font-black uppercase shadow-[3px_3px_0_#fff] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
