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
      <div className="min-h-screen bg-gray-50 pt-32 pb-16">
        <div className="mx-auto max-w-lg px-4 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
            <CheckCircle2 className="h-10 w-10 text-success" />
          </div>
          <h1 className="mt-6 text-3xl font-semibold text-gray-900">{isArabic ? "تم إرسال طلبك للمتجر" : "Request sent to vendor"}</h1>
          <p className="mt-4 text-gray-500">
            {isArabic 
              ? "سيقوم التاجر بمراجعة طلبك والرد عليك بعرض سعر. يمكنك متابعة حالة الطلب من الداشبورد." 
              : "The vendor will review your request and reply with a quote. You can track this from your dashboard."}
          </p>
          <Link href={`/${locale}/dashboards`} className="mt-8 inline-flex items-center justify-center rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-700">
            {isArabic ? "الذهاب للداشبورد" : "Go to Dashboard"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Back */}
        <Link href={`/${locale}/vendors/${vendorId}`} className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-gray-900">
          {isArabic ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
          {isArabic ? "إلغاء الطلب" : "Cancel Request"}
        </Link>

        <div className="overflow-hidden rounded-3xl bg-onyx-800/50 shadow-sm border border-gray-100">
          <div className="border-b border-gray-100 bg-gray-50 p-6 sm:p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
              <FileText className="h-6 w-6" />
            </div>
            <h1 className="mt-5 text-2xl font-semibold text-gray-900">{isArabic ? "طلب تسعير خاص" : "Request Custom Quote"}</h1>
            <p className="mt-2 text-gray-500">{isArabic ? "اشرح للمتجر ما تحتاجه بالضبط ليقدم لك أفضل سعر متاح." : "Explain what you need so the vendor can provide the best price."}</p>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            {step === 0 && (
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-gray-900">
                  {isArabic ? "تفاصيل الطلب (المنتجات، الكميات، الماركات)" : "Request details (products, quantities, brands)"}
                </label>
                <textarea
                  value={details}
                  onChange={e => setDetails(e.target.value)}
                  placeholder={isArabic ? "مثال: محتاج 5 علب دهان بلاستيك مط لون أبيض من جوتن..." : "Example: I need 5 buckets of matte white plastic paint..."}
                  rows={6}
                  className="w-full rounded-2xl border border-gray-200 bg-onyx-800/50 p-4 text-gray-900 focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
            )}

            {step === 1 && (
              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-900">
                    {isArabic ? "طريقة الاستلام المفضلة" : "Preferred delivery method"}
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {deliveryOptions.map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setDeliveryMethod(opt.id)}
                        className={cn(
                          "flex items-center gap-3 rounded-xl border p-4 text-start transition",
                          deliveryMethod === opt.id ? "border-primary-500 bg-primary-50 text-primary-700" : "border-gray-200 bg-onyx-800/50 hover:border-gray-300"
                        )}
                      >
                        <PackageOpen className={cn("h-5 w-5", deliveryMethod === opt.id ? "text-primary-600" : "text-gray-400")} />
                        <span className="font-medium">{isArabic ? opt.arLabel : opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-900">
                    {isArabic ? "طريقة الدفع المفضلة" : "Preferred payment method"}
                  </label>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {paymentOptions.map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setPaymentMethod(opt.id)}
                        className={cn(
                          "rounded-xl border p-4 text-center transition",
                          paymentMethod === opt.id ? "border-primary-500 bg-primary-50 text-primary-700" : "border-gray-200 bg-onyx-800/50 hover:border-gray-300"
                        )}
                      >
                        <span className="font-medium">{isArabic ? opt.arLabel : opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-6 border-t border-gray-100">
              {step === 0 ? (
                <div />
              ) : (
                <button
                  onClick={() => setStep(0)}
                  className="rounded-xl px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100"
                >
                  {isArabic ? "تعديل التفاصيل" : "Edit details"}
                </button>
              )}

              {step === 0 ? (
                <button
                  onClick={() => setStep(1)}
                  disabled={details.trim().length < 10}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-50"
                >
                  {isArabic ? "متابعة" : "Continue"}
                  {isArabic ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                </button>
              ) : (
                <button
                  onClick={() => setSubmitted(true)}
                  disabled={!paymentMethod || !deliveryMethod}
                  className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
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
