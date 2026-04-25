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
    <div className="min-h-screen bg-gray-50 pt-20 pb-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Back */}
        <Link href={`/${locale}/vendors`} className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-gray-900">
          {isArabic ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
          {isArabic ? "العودة للمتاجر" : "Back to Vendors"}
        </Link>

        {/* Store Header */}
        <div className="overflow-hidden rounded-3xl bg-onyx-800/50 shadow-sm border border-gray-100">
          <div className="relative h-48 w-full sm:h-64">
            <Image src={MOCK_STORE.image} alt={MOCK_STORE.name[locale]} fill className="object-cover brightness-75" />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
            <div className="absolute bottom-6 start-6 end-6 text-white">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-3xl font-semibold sm:text-4xl">{MOCK_STORE.name[locale]}</h1>
                    {MOCK_STORE.verified && <ShieldCheck className="h-6 w-6 text-primary-400" />}
                  </div>
                  <p className="mt-2 text-gray-300">{MOCK_STORE.category[locale]}</p>
                </div>
                <div className="flex gap-3">
                  <Link href={`/${locale}/vendors/${vendorId}/request`} className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700">
                    <MessageSquare className="h-4 w-4" />
                    {isArabic ? "طلب تسعير خاص" : "Request Custom Quote"}
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Store Info Bar */}
          <div className="flex flex-wrap divide-x divide-gray-100 rtl:divide-x-reverse border-b border-gray-100 bg-onyx-800/50">
            <div className="flex items-center gap-3 p-5 sm:flex-1">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <div>
                <p className="font-semibold text-gray-900">{MOCK_STORE.rating} {isArabic ? "تقييم" : "Rating"}</p>
                <p className="text-sm text-gray-500">{MOCK_STORE.reviews} {isArabic ? "مراجعة" : "reviews"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-5 sm:flex-1">
              <MapPin className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-semibold text-gray-900">{MOCK_STORE.distance}</p>
                <p className="text-sm text-gray-500 line-clamp-1">{MOCK_STORE.address[locale]}</p>
              </div>
            </div>
          </div>
          
          {/* Payment Methods */}
          <div className="p-5 flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-gray-700">{isArabic ? "طرق الدفع المدعومة:" : "Accepted Payments:"}</span>
            <div className="flex flex-wrap gap-2">
              {MOCK_STORE.paymentMethods.map(method => (
                <span key={method} className="flex items-center gap-1.5 rounded-lg border border-gray-100 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary-500" />
                  {method}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Store Tabs */}
        <div className="mt-8">
          <div className="flex gap-6 border-b border-gray-200">
            {["products", "about", "reviews"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={cn(
                  "border-b-2 py-3 text-sm font-semibold transition",
                  activeTab === tab ? "border-primary-600 text-primary-700" : "border-transparent text-gray-500 hover:text-gray-900"
                )}
              >
                {tab === "products" && (isArabic ? "المنتجات" : "Products")}
                {tab === "about" && (isArabic ? "عن المتجر" : "About")}
                {tab === "reviews" && (isArabic ? "التقييمات" : "Reviews")}
              </button>
            ))}
          </div>

          <div className="mt-6">
            {activeTab === "products" && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {MOCK_STORE.products.map(product => (
                  <div key={product.id} className="group overflow-hidden rounded-2xl border border-gray-100 bg-onyx-800/50 shadow-sm transition hover:shadow-md">
                    <div className="relative h-48 w-full bg-gray-50">
                      <Image src={product.image} alt={product.name[locale]} fill className="object-cover p-4 transition duration-500 group-hover:scale-105" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 line-clamp-1">{product.name[locale]}</h3>
                      <p className="mt-2 text-lg font-bold text-primary-700">{product.price} {isArabic ? "ج.م" : "EGP"}</p>
                      <button className="mt-4 w-full rounded-xl bg-gray-900 py-2 text-sm font-semibold text-white transition hover:bg-gray-800">
                        {isArabic ? "أضف للطلب" : "Add to Request"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "about" && (
              <div className="rounded-3xl border border-gray-100 bg-onyx-800/50 p-8 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900">{isArabic ? "نبذة عن المتجر" : "About Store"}</h3>
                <p className="mt-4 leading-loose text-gray-600">{MOCK_STORE.about[locale]}</p>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="rounded-3xl border border-gray-100 bg-onyx-800/50 p-8 shadow-sm text-center">
                <Star className="mx-auto h-12 w-12 text-gray-300" />
                <p className="mt-4 font-medium text-gray-900">{isArabic ? "سيتم عرض التقييمات قريباً" : "Reviews will be displayed soon"}</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
