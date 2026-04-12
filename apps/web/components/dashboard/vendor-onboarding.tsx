"use client";

import { useState } from "react";
import { MapPin, ShoppingBag, ArrowRight, CheckCircle2, ShieldAlert } from "lucide-react";
import { MapPicker } from "@/components/shared/map-picker";
import { SelectField } from "@/components/shared/select-field";
import { vendorCategories, egyptianGovernorates } from "@/lib/geo-data";
import { patchApiData } from "@/lib/api";
import { cn } from "@/lib/utils";

type OnboardingProps = {
  locale: "ar" | "en";
  onComplete: () => void;
};

export function VendorOnboarding({ locale, onComplete }: OnboardingProps) {
  const isArabic = locale === "ar";
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [data, setData] = useState({
    category: "",
    latitude: 30.0444,
    longitude: 31.2357,
    governorate: "",
    city: "",
    address: ""
  });

  async function handleSubmit() {
    if (!data.category || !data.latitude || !data.governorate) {
        setError(isArabic ? "يرجى إكمال جميع البيانات المطلوبة" : "Please complete all required fields");
        return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await patchApiData("/vendors/profile", {
        category: data.category,
        latitude: data.latitude,
        longitude: data.longitude,
        governorate: data.governorate,
        city: data.city,
        address: data.address
      });
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <div className="dashboard-card w-full max-w-2xl overflow-hidden bg-white shadow-2xl">
        <div className="relative h-2 bg-dark-100">
          <div 
            className="absolute inset-y-0 left-0 bg-primary-600 transition-all duration-500" 
            style={{ width: `${((step + 1) / 2) * 100}%` }}
          />
        </div>

        <div className="p-8 lg:p-12">
          {step === 0 ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
                  <ShoppingBag className="h-10 w-10" />
                </div>
                <h2 className="text-3xl font-bold text-dark-950">
                  {isArabic ? "لنبدأ بتصنيف متجرك" : "Let's classify your shop"}
                </h2>
                <p className="mt-3 text-lg text-dark-500">
                  {isArabic 
                    ? "اختر التخصص الذي تبرع فيه لنتمكن من توجيه الطلبات الصحيحة إليك." 
                    : "Select the specialty you excel in so we can direct the right requests to you."}
                </p>
              </div>

              <div className="grid gap-4">
                <SelectField
                  label={isArabic ? "تصنيف المتجر" : "Store Category"}
                  value={data.category}
                  options={vendorCategories.map(c => ({ value: c.value, label: isArabic ? c.labelAr : c.labelEn }))}
                  onChange={(cat) => setData({ ...data, category: cat })}
                  placeholder={isArabic ? "اختر تصنيف المتجر" : "Select store category"}
                />
              </div>

              <button
                onClick={() => data.category && setStep(1)}
                disabled={!data.category}
                className="group flex w-full items-center justify-center gap-3 rounded-full bg-dark-950 py-4 text-lg font-bold text-white transition hover:bg-dark-800 disabled:opacity-50"
              >
                {isArabic ? "التالي: تحديد الموقع" : "Next: Set Location"}
                <ArrowRight className={cn("h-5 w-5 transition-transform group-hover:translate-x-1", isArabic && "rotate-180 group-hover:-translate-x-1")} />
              </button>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center">
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <MapPin className="h-10 w-10" />
                  </div>
                  <h2 className="text-3xl font-bold text-dark-950">
                    {isArabic ? "أين يقع متجرك؟" : "Where is your shop located?"}
                  </h2>
                  <p className="mt-3 text-lg text-dark-500">
                    {isArabic 
                      ? "هذا الموقع سيتم استخدامه لربطك بالعملاء والفنيين القريبين منك." 
                      : "This location will be used to connect you with nearby clients and technicians."}
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="h-[300px] overflow-hidden rounded-2xl border-2 border-dark-100 shadow-inner">
                    <MapPicker 
                      lat={data.latitude}
                      lng={data.longitude}
                      isArabic={isArabic}
                      onChange={(lat, lng, details) => {
                        const newData = { ...data, latitude: lat, longitude: lng };
                        if (details) {
                          const govMatch = egyptianGovernorates.find(g => 
                            details.state?.includes(g.labelEn) || details.city?.includes(g.labelEn) ||
                            details.state?.includes(g.labelAr) || details.city?.includes(g.labelAr)
                          );
                          if (govMatch) newData.governorate = govMatch.value;
                        }
                        setData(newData);
                      }}
                    />
                  </div>

                  {error && (
                    <div className="flex items-center gap-3 rounded-xl border border-error/20 bg-error/10 p-4 text-error">
                      <ShieldAlert className="h-5 w-5" />
                      <p className="font-semibold">{error}</p>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button
                      onClick={() => setStep(0)}
                      className="flex-1 rounded-full border-2 border-dark-200 py-4 font-bold text-dark-700 transition hover:bg-dark-50"
                    >
                      {isArabic ? "السابق" : "Back"}
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="flex-[2] rounded-full bg-primary-600 py-4 text-lg font-bold text-white transition hover:bg-primary-700 disabled:opacity-50"
                    >
                      {isSubmitting 
                        ? (isArabic ? "...جاري الحفظ" : "Saving...") 
                        : (isArabic ? "إكمال التسجيل" : "Complete Setup")}
                    </button>
                  </div>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
