"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Search, Star, Filter, PackageOpen, MoveRight, ArrowLeft, Store, Loader2 } from "lucide-react";
import type { Locale } from "@/lib/locales";
import { cn } from "@/lib/utils";
import { fetchApiData } from "@/lib/api";

interface VendorStore {
  id: string;
  shopName: string;
  shopNameAr: string;
  category: string;
  shopDescription: string | null;
  shopImageUrl: string | null;
  governorate: string;
  city: string;
  rating: number;
  ratingCount: number;
  totalOrders: number;
  isOpen: boolean;
  latitude: number | null;
  longitude: number | null;
}

export function VendorsDirectory({ locale }: { locale: Locale }) {
  const isArabic = locale === "ar";
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [vendors, setVendors] = useState<VendorStore[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadVendors() {
      setIsLoading(true);
      const data = await fetchApiData<VendorStore[]>("/vendors/stores", []);
      setVendors(data);
      setIsLoading(false);
    }
    loadVendors();
  }, []);

  const categories = [
    { id: "all", label: { ar: "الكل", en: "All" } },
    { id: "painting", label: { ar: "دهانات", en: "Paints" } },
    { id: "plumbing", label: { ar: "سباكة", en: "Plumbing" } },
    { id: "electrical", label: { ar: "كهرباء", en: "Electrical" } },
    { id: "computer", label: { ar: "كمبيوتر", en: "Computer" } }
  ];

  const filteredVendors = useMemo(() => {
    return vendors.filter(vendor => {
      const name = isArabic ? (vendor.shopNameAr || vendor.shopName) : vendor.shopName;
      const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            vendor.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === "all" || vendor.category.toLowerCase().includes(activeCategory.toLowerCase());
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, locale, vendors, activeCategory, isArabic]);

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-semibold text-gray-900 sm:text-5xl">
            {isArabic ? "اكتشف المتاجر القريبة منك" : "Discover Nearby Vendors"}
          </h1>
          <p className="mt-4 text-lg text-gray-500">
            {isArabic 
              ? "ابحث عن أفضل المحلات والموردين للخدمات الحرفية، ارسل طلباتك، وادفع بكل سهولة." 
              : "Find the best stores and suppliers for trades, send custom requests, and pay easily."}
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-onyx-800/50 p-4 shadow-sm border border-gray-100">
          <div className="relative flex-1">
            <Search className="absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isArabic ? "ابحث عن متجر، تخصص، أو منتج..." : "Search for a store, specialty, or product..."}
              className="h-12 w-full rounded-xl bg-gray-50 ps-12 pe-4 text-gray-900 border-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium transition",
                  activeCategory === cat.id 
                    ? "bg-primary-600 text-white" 
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                {cat.label[locale]}
              </button>
            ))}
          </div>
        </div>

        {/* Vendors Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {isLoading ? (
            <div className="col-span-full py-20 flex flex-col items-center justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-gold-500 mb-4" />
              <p className="text-onyx-400">{isArabic ? "جاري تحميل المتاجر..." : "Loading stores..."}</p>
            </div>
          ) : (
            <AnimatePresence>
              {filteredVendors.map((vendor, index) => (
                <motion.div
                  key={vendor.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="group relative flex flex-col overflow-hidden rounded-2xl bg-onyx-800/50 border border-gray-100 shadow-sm transition hover:shadow-md hover:border-primary-100"
                >
                  {/* Image Area */}
                  <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
                    <Image 
                      src={vendor.shopImageUrl || "/logo.png"} 
                      alt={isArabic ? (vendor.shopNameAr || vendor.shopName) : vendor.shopName} 
                      fill 
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                    {!vendor.isOpen && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="bg-white/10 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-sm font-bold border border-white/20">
                          {isArabic ? "مغلق حالياً" : "Closed Now"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content Area */}
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                          {isArabic ? (vendor.shopNameAr || vendor.shopName) : vendor.shopName}
                        </h3>
                        <p className="mt-1 text-sm text-primary-600 capitalize">{vendor.category}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1 rounded-lg bg-yellow-50 px-2 py-1">
                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-semibold text-yellow-700">{vendor.rating}</span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-start gap-2 text-sm text-gray-500">
                      <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{vendor.city}, {vendor.governorate}</span>
                    </div>

                    <div className="mt-6 flex gap-2">
                      <Link href={`/${locale}/vendors/${vendor.id}`} className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary-50 text-primary-700 py-2.5 text-sm font-semibold transition hover:bg-primary-100">
                        <Store className="h-4 w-4" />
                        {isArabic ? "زيارة المتجر" : "Visit Store"}
                      </Link>
                      <Link href={`/${locale}/vendors/${vendor.id}/request`} className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gray-900 text-white py-2.5 text-sm font-semibold transition hover:bg-gray-800">
                        {isArabic ? "طلب تسعير" : "Request Quote"}
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {!isLoading && filteredVendors.length === 0 && (
          <div className="py-20 text-center">
            <PackageOpen className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-4 text-lg font-medium text-gray-900">{isArabic ? "لم نجد متاجر مطابقة لبحثك" : "No vendors matched your search"}</p>
            <p className="mt-2 text-gray-500">{isArabic ? "جرب البحث بكلمات أخرى أو تغيير التصنيف" : "Try searching with different terms or changing the category"}</p>
          </div>
        )}

      </div>
    </div>
  );
}
