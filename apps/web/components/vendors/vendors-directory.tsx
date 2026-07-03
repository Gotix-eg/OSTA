"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Search, Star, Filter, PackageOpen, Store, Loader2 } from "lucide-react";
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
      const vendorCat = (vendor.category || "").toLowerCase();
      const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            vendorCat.includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === "all" || vendorCat.includes(activeCategory.toLowerCase());
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, locale, vendors, activeCategory, isArabic]);

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Premium Header Banner */}
      <section className="onyx-card relative overflow-hidden p-8 sm:p-12 border-gold-500/10">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gold-500/5 blur-[100px] rounded-full -mr-40 -mt-40 pointer-events-none" />
        <div className="relative max-w-4xl space-y-4 text-start">
          <span className="inline-flex rounded-full bg-gold-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.4em] text-gold-500 border border-gold-500/20">
            {isArabic ? "دليل المتاجر وموردي المواد" : "Material Suppliers & Stores"}
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            {isArabic ? "اكتشف المتاجر القريبة منك" : "Discover Nearby Vendors"}
          </h1>
          <p className="text-sm sm:text-base text-onyx-350 max-w-2xl leading-relaxed">
            {isArabic 
              ? "ابحث عن أفضل المحلات والموردين للخدمات الحرفية، ارسل طلباتك، وادفع بكل سهولة." 
              : "Find the best stores and suppliers for trades, send custom requests, and pay easily."}
          </p>
        </div>
      </section>

      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-4 onyx-card border-white/5 bg-white/[0.01] backdrop-blur">
        <div className="relative flex-1">
          <Search className="absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-onyx-600 md:text-onyx-550" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isArabic ? "ابحث عن متجر، تخصص، أو منتج..." : "Search for a store, specialty, or product..."}
            className="h-12 w-full rounded-xl bg-white border border-gold-700/10 ps-12 pe-4 text-onyx-950 placeholder-onyx-400 text-sm focus:outline-none focus:border-gold-500/50 transition-colors md:bg-onyx-900 md:border-white/10 md:text-white md:placeholder-onyx-500"
          />
        </div>
        <div className="flex flex-wrap gap-2 md:flex-nowrap md:items-center md:overflow-x-auto pb-1 md:pb-0 hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "whitespace-nowrap rounded-full px-5 py-2 text-sm font-semibold border transition-all duration-300",
                activeCategory === cat.id 
                  ? "bg-gold-500 text-onyx-950 border-gold-500 shadow-md" 
                  : "bg-white border-gold-700/10 text-onyx-700 hover:text-onyx-950 md:bg-onyx-900 md:border-white/10 md:text-onyx-300 md:hover:text-white"
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
                className="group relative flex flex-col overflow-hidden rounded-3xl onyx-card border-white/5 bg-white/[0.02] hover:border-gold-500/30 transition-all duration-300"
              >
                {/* Image Area */}
                <div className="relative h-48 w-full bg-onyx-900/50 overflow-hidden">
                  <Image 
                    src={vendor.shopImageUrl || "/logo.svg"} 
                    alt={isArabic ? (vendor.shopNameAr || vendor.shopName) : vendor.shopName} 
                    fill 
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                  {!vendor.isOpen && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="bg-white/10 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xs font-bold border border-white/20">
                        {isArabic ? "مغلق حالياً" : "Closed Now"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content Area */}
                <div className="flex flex-1 flex-col p-5 text-start">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-black text-white line-clamp-1 group-hover:text-gold-500 transition-colors">
                        {isArabic ? (vendor.shopNameAr || vendor.shopName) : vendor.shopName}
                      </h3>
                      <p className="mt-1 text-xs text-gold-500 font-bold uppercase tracking-wider">{vendor.category}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1 rounded-lg bg-gold-500/10 border border-gold-500/25 px-2 py-0.5 text-gold-500">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      <span className="text-xs font-black">{vendor.rating}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-start gap-2 text-sm text-onyx-400 font-medium">
                    <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-gold-500" />
                    <span className="line-clamp-2">{vendor.city}، {vendor.governorate}</span>
                  </div>

                  <div className="mt-6 flex gap-2">
                    <Link href={`/${locale}/vendors/${vendor.id}`} className="flex-1 btn-gold py-2.5 text-xs font-black flex items-center justify-center gap-1.5 shadow-md">
                      <Store className="h-3.5 w-3.5" />
                      {isArabic ? "زيارة المتجر" : "Visit Store"}
                    </Link>
                    <Link href={`/${locale}/vendors/${vendor.id}/request`} className="flex-1 py-2.5 text-xs font-black flex items-center justify-center border border-onyx-950 bg-onyx-950 text-white hover:bg-onyx-900 rounded-xl md:border-white/10 md:bg-transparent md:text-white md:hover:bg-white/5">
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
        <div className="py-20 text-center col-span-full onyx-card border-white/5 bg-white/[0.01] rounded-3xl">
          <PackageOpen className="mx-auto h-16 w-16 text-onyx-600 mb-4" />
          <h4 className="text-xl font-bold text-white mb-2">{isArabic ? "لم نجد متاجر مطابقة لبحثك" : "No vendors matched your search"}</h4>
          <p className="text-onyx-400 text-sm max-w-md mx-auto">{isArabic ? "جرب البحث بكلمات أخرى أو تغيير التصنيف" : "Try searching with different terms or changing the category"}</p>
        </div>
      )}
    </div>
  );
}
