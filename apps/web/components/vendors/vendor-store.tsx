"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Star, PackageOpen, ArrowRight, ArrowLeft, MessageSquare, ShieldCheck, CheckCircle2 } from "lucide-react";
import type { Locale } from "@/lib/locales";
import { cn } from "@/lib/utils";

// Mock Store Data
const MOCK_STORE = {
  id: "v1",
  name: { ar: "الأسطورة للدهانات", en: "Al-Ostoura Paints" },
  category: { ar: "دهانات", en: "Paints" },
  rating: 4.8,
  reviews: 124,
  distance: "1.2 km",
  address: { ar: "مدينة نصر، شارع مكرم عبيد", en: "Nasr City, Makram Ebeid St" },
  image: "/services/painting.png",
  verified: true,
  about: {
    ar: "متخصصون في بيع جميع أنواع الدهانات الداخلية والخارجية، ومعجون الحوائط ومستلزمات النقاشة بجودة عالية وأسعار جملة. نوفر خدمة توصيل سريعة.",
    en: "Specialized in selling all types of interior and exterior paints, wall putty, and painting supplies with high quality and wholesale prices. Fast delivery available."
  },
  paymentMethods: ["InstaPay", "Vodafone Cash", "Cash on Delivery", "Pickup"],
  products: [
    { id: "p1", name: { ar: "بستلة دهان بلاستيك مط", en: "Matte Plastic Paint Bucket" }, price: 450, image: "/services/painting.png" },
    { id: "p2", name: { ar: "معجون حوائط ممتاز", en: "Premium Wall Putty" }, price: 120, image: "/services/painting.png" },
    { id: "p3", name: { ar: "رولة دهان مع عصا", en: "Paint Roller with Stick" }, price: 85, image: "/services/painting.png" }
  ]
};

export function VendorStore({ locale, vendorId }: { locale: Locale; vendorId: string }) {
  const isArabic = locale === "ar";
  const [activeTab, setActiveTab] = useState<"products" | "about" | "reviews">("products");

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Navigation Back */}
      <div className="text-start">
        <Link href={`/${locale}/vendors`} className="inline-flex items-center gap-2 text-sm font-semibold text-onyx-400 transition hover:text-gold-500">
          {isArabic ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
          {isArabic ? "العودة للمتاجر" : "Back to Vendors"}
        </Link>
      </div>

      {/* Store Header Card */}
      <div className="overflow-hidden rounded-3xl onyx-card border-white/5 bg-white/[0.02]">
        <div className="relative h-48 w-full sm:h-64">
          <Image src={MOCK_STORE.image} alt={MOCK_STORE.name[locale]} fill className="object-cover brightness-75" />
          <div className="absolute inset-0 bg-gradient-to-t from-onyx-950/90 via-onyx-950/40 to-transparent" />
          <div className="absolute bottom-6 start-6 end-6 text-white text-start">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-black sm:text-4xl text-white">{MOCK_STORE.name[locale]}</h1>
                  {MOCK_STORE.verified && <ShieldCheck className="h-6 w-6 text-gold-500" />}
                </div>
                <p className="mt-2 text-gold-500 font-bold uppercase tracking-wider text-xs">{MOCK_STORE.category[locale]}</p>
              </div>
              <div className="flex gap-3">
                <Link href={`/${locale}/vendors/${vendorId}/request`} className="btn-gold py-2.5 px-5 text-sm font-black flex items-center gap-2 shadow-md">
                  <MessageSquare className="h-4 w-4" />
                  {isArabic ? "طلب تسعير خاص" : "Request Custom Quote"}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Store Info Bar */}
        <div className="grid grid-cols-2 divide-x divide-white/5 rtl:divide-x-reverse border-t border-white/5 bg-white/[0.01]">
          <div className="flex items-center gap-3 p-5 text-start">
            <Star className="h-5 w-5 fill-gold-500 text-gold-500" />
            <div>
              <p className="font-bold text-white">{MOCK_STORE.rating} {isArabic ? "تقييم" : "Rating"}</p>
              <p className="text-sm text-onyx-400">{MOCK_STORE.reviews} {isArabic ? "مراجعة" : "reviews"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-5 text-start">
            <MapPin className="h-5 w-5 text-gold-500" />
            <div>
              <p className="font-bold text-white">{MOCK_STORE.distance}</p>
              <p className="text-sm text-onyx-400 line-clamp-1">{MOCK_STORE.address[locale]}</p>
            </div>
          </div>
        </div>
        
        {/* Payment Methods */}
        <div className="p-5 border-t border-white/5 bg-white/[0.01] flex flex-wrap items-center gap-3">
          <span className="text-sm font-bold text-onyx-300">{isArabic ? "طرق الدفع المدعومة:" : "Accepted Payments:"}</span>
          <div className="flex flex-wrap gap-2">
            {MOCK_STORE.paymentMethods.map(method => (
              <span key={method} className="flex items-center gap-1.5 rounded-lg border border-white/5 bg-onyx-900 px-3 py-1.5 text-xs font-semibold text-onyx-300">
                <CheckCircle2 className="h-3.5 w-3.5 text-gold-500" />
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Store Tabs */}
      <div className="mt-8">
        <div className="flex gap-6 border-b border-white/5 text-start">
          {["products", "about", "reviews"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={cn(
                "border-b-2 py-3 text-sm font-semibold transition-all duration-300",
                activeTab === tab ? "border-gold-500 text-gold-500 font-bold" : "border-transparent text-onyx-400 hover:text-white"
              )}
            >
              {tab === "products" && (isArabic ? "المنتجات" : "Products")}
              {tab === "about" && (isArabic ? "عن المتجر" : "About")}
              {tab === "reviews" && (isArabic ? "التقييمات" : "Reviews")}
            </button>
          ))}
        </div>

        <div className="mt-6 text-start">
          {activeTab === "products" && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {MOCK_STORE.products.map(product => (
                <div key={product.id} className="group overflow-hidden rounded-3xl onyx-card border-white/5 bg-white/[0.02] hover:border-gold-500/30 transition-all duration-300">
                  <div className="relative h-48 w-full bg-onyx-900/50">
                    <Image src={product.image} alt={product.name[locale]} fill className="object-cover p-4 transition duration-500 group-hover:scale-105" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-white line-clamp-1 group-hover:text-gold-500 transition-colors">{product.name[locale]}</h3>
                    <p className="mt-2 text-lg font-black text-gold-500">{product.price} {isArabic ? "ج.م" : "EGP"}</p>
                    <button className="mt-4 w-full btn-gold py-2.5 text-xs font-black shadow-md">
                      {isArabic ? "أضف للطلب" : "Add to Request"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "about" && (
            <div className="rounded-3xl onyx-card border-white/5 bg-white/[0.02] p-8">
              <h3 className="text-xl font-bold text-white">{isArabic ? "نبذة عن المتجر" : "About Store"}</h3>
              <p className="mt-4 leading-loose text-onyx-300">{MOCK_STORE.about[locale]}</p>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="rounded-3xl onyx-card border-white/5 bg-white/[0.02] p-8 text-center">
              <Star className="mx-auto h-12 w-12 text-onyx-600 mb-4" />
              <p className="font-bold text-onyx-400">{isArabic ? "سيتم عرض التقييمات قريباً" : "Reviews will be displayed soon"}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
