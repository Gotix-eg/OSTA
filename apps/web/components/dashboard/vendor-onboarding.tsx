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
    <div className="flex min-h-[70vh] items-center justify-center p-6">
      <div className="glass-card w-full max-w-2xl overflow-hidden p-0 shadow-onyx">
        <div className="relative h-1.5 bg-onyx-800/50/5">
          <div 
            className="absolute inset-y-0 left-0 bg-gold-500 shadow-glow transition-all duration-700 ease-out-expo" 
            style={{ width: `${((step + 1) / 2) * 100}%` }}
          />
        </div>

        <div className="p-10 lg:p-16">
          {step === 0 ? (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="text-center">
                <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-gold-500/10 text-gold-500 shadow-glow">
                  <ShoppingBag className="h-12 w-12" />
                </div>
                <h2 className="font-serif text-4xl text-white">
                  {isArabic ? "لنبدأ بتصنيف متجرك" : "Let's classify your shop"}
                </h2>
                <p className="mt-5 text-lg leading-relaxed text-onyx-400">
                  {isArabic 
                    ? "اختر التخصص الذي تبرع فيه لنتمكن من توجيه الطلبات الصحيحة إليك." 
                    : "Select the specialty you excel in so we can direct the right requests to you."}
                </p>
              </div>

              <div className="grid gap-6">
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
                className="btn-gold group w-full flex items-center justify-center gap-3 text-lg"
              >
                {isArabic ? "التالي: تحديد الموقع" : "Next: Set Location"}
                <ArrowRight className={cn("h-5 w-5 transition-transform duration-500 group-hover:translate-x-1", isArabic && "rotate-180 group-hover:-translate-x-1")} />
              </button>
            </div>
          ) : (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="text-center">
                  <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-accent-500/10 text-accent-400 shadow-2xl shadow-accent-500/10">
                    <MapPin className="h-12 w-12" />
                  </div>
                  <h2 className="font-serif text-4xl text-white">
                    {isArabic ? "أين يقع متجرك؟" : "Where is your shop located?"}
                  </h2>
                  <p className="mt-5 text-lg leading-relaxed text-onyx-400">
                    {isArabic 
                      ? "هذا الموقع سيتم استخدامه لربطك بالعملاء والفنيين القريبين منك." 
                      : "This location will be used to connect you with nearby clients and technicians."}
                  </p>
                </div>

                <div className="space-y-8">
                  <div className="h-[350px] overflow-hidden rounded-[2.5rem] border border-white/5 shadow-2xl">
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
                    <div className="flex items-center gap-4 rounded-2xl border border-error/20 bg-error/5 p-5 text-error">
                      <ShieldAlert className="h-6 w-6" />
                      <p className="font-bold">{error}</p>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button
                      onClick={() => setStep(0)}
                      className="btn-ghost flex-1"
                    >
                      {isArabic ? "السابق" : "Back"}
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="btn-gold flex-[2] text-lg"
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
