"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Search, Star, Loader2, Warehouse, ShieldCheck } from "lucide-react";
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
  const [selectedCity, setSelectedCity] = useState("ALL");
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

  const cities = [
    { value: "ALL", label: { ar: "جميع أنحاء الجمهورية", en: "All Egypt / Nationwide" } },
    { value: "cairo", label: { ar: "القاهرة", en: "CAIRO" } },
    { value: "giza", label: { ar: "الجيزة", en: "GIZA" } },
    { value: "alexandria", label: { ar: "الإسكندرية", en: "ALEXANDRIA" } }
  ];

  const categories = [
    { id: "all", label: { ar: "كل الأقسام", en: "ALL CATEGORIES" } },
    { id: "plumbing", label: { ar: "مستلزمات سباكة", en: "PLUMBING SUPPLIES" } },
    { id: "electrical", label: { ar: "قطع غيار كهرباء", en: "ELECTRICAL PARTS" } },
    { id: "painting", label: { ar: "دهانات ومواد", en: "PAINTING & COATING" } },
    { id: "computer", label: { ar: "صيانة كمبيوتر", en: "COMPUTER PARTS" } }
  ];

  const vendorCategoryLabels: Record<string, string> = {
    plumbing: "مستلزمات سباكة",
    "plumbing supplies": "مستلزمات سباكة",
    electrical: "قطع غيار كهرباء",
    "electrical parts": "قطع غيار كهرباء",
    painting: "دهانات ومواد",
    "painting & coating": "دهانات ومواد",
    computer: "صيانة كمبيوتر",
    "computer parts": "صيانة كمبيوتر",
    "general supplies": "مستلزمات عامة"
  };

  function getVendorCategoryLabel(category: string | null | undefined) {
    if (!category) return isArabic ? "مستلزمات عامة" : "General Supplies";
    if (!isArabic) return category;
    return vendorCategoryLabels[category.toLowerCase()] || "مستلزمات عامة";
  }

  const filteredVendors = useMemo(() => {
    return vendors.filter(vendor => {
      const name = isArabic ? (vendor.shopNameAr || vendor.shopName) : vendor.shopName;
      const vendorCat = (vendor.category || "").toLowerCase();
      const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            vendorCat.includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === "all" || vendorCat.includes(activeCategory.toLowerCase());
      
      const cityText = (vendor.city || "").toLowerCase();
      const govText = (vendor.governorate || "").toLowerCase();
      const matchesCity = selectedCity === "ALL" || cityText.includes(selectedCity.toLowerCase()) || govText.includes(selectedCity.toLowerCase());
      
      return matchesSearch && matchesCategory && matchesCity;
    });
  }, [searchQuery, locale, vendors, activeCategory, selectedCity, isArabic]);

  return (
    <div className="w-full bg-gold pb-28 text-[#1a1c1c] font-sans md:pb-0">
      {/* Hero Section */}
      <section className="mx-auto flex w-full max-w-7xl flex-col justify-center border-b-4 border-black px-4 py-6 text-start md:px-12 md:py-20">
        <div className="w-full">
          <div className="mb-4 inline-block bg-black px-3 py-1 text-[10px] font-black uppercase tracking-widest text-gold md:px-4 md:text-xs">
            {isArabic ? "سلسلة التوريد الممتازة" : "Premium Supply Chain"}
          </div>
          <h1 className="font-display-lg mb-3 text-4xl font-black leading-tight text-black md:mb-4 md:text-6xl">
            {isArabic ? (
              <>
                موردين قطع الغيار <span className="block mt-2">والمواد المعتمدين</span>
              </>
            ) : (
              <>
                Industrial Vendors <span className="block mt-2">& Suppliers</span>
              </>
            )}
          </h1>
          <h2 className="text-base font-bold leading-7 text-black/80 md:text-2xl">
            {isArabic ? "ابحث عن أقرب متجر خامات لصيانة منزلك" : "Source spare parts & raw materials from local stores"}
          </h2>
        </div>
      </section>

      {/* Search & Filter Bar */}
      <section className="sticky top-16 z-40 border-b border-white/10 bg-black px-4 py-4 text-white md:top-20 md:px-12 md:py-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 lg:flex-row lg:gap-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40 rtl:left-auto rtl:right-4" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 w-full border border-white/20 bg-[#121212] px-12 text-start text-xs font-bold uppercase text-white placeholder:text-white/30 transition-colors focus:border-gold focus:ring-0"
              placeholder={isArabic ? "ابحث عن خامات، قطع غيار، علامات تجارية..." : "Search tools, parts, or brands..."}
            />
          </div>
          <div className="grid grid-cols-2 gap-3 lg:flex lg:flex-nowrap lg:gap-4">
            <select 
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="h-12 rounded-none border border-white/20 bg-[#121212] px-3 text-xs font-bold text-white appearance-none focus:border-gold focus:ring-0 md:px-6"
            >
              {cities.map(c => (
                <option key={c.value} value={c.value}>{c.label[locale]}</option>
              ))}
            </select>
            <select 
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
              className="h-12 rounded-none border border-white/20 bg-[#121212] px-3 text-xs font-bold text-white appearance-none focus:border-gold focus:ring-0 md:px-6"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label[locale]}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Vendor Directory Grid */}
      <section className="bg-gold px-4 py-8 md:px-12 md:py-20">
        <div className="max-w-7xl mx-auto text-start">
          <div className="mb-6 flex items-end justify-between gap-4 border-b border-black/10 pb-4 md:mb-12 md:pb-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-1.5 bg-black md:h-12 md:w-2"></div>
              <h3 className="text-2xl font-black uppercase text-black md:text-4xl">
                {isArabic ? "الموردين المعتمدين" : "Verified Suppliers"}
              </h3>
            </div>
            <p className="shrink-0 text-xs font-black text-black/60 md:text-sm">
              {isArabic 
                ? `عرض ${filteredVendors.length} متجر متوفر حالياً` 
                : `Showing ${filteredVendors.length} top-rated vendors`}
            </p>
          </div>

          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-black mb-4" />
              <p className="font-bold text-black">{isArabic ? "جاري تحميل المتاجر..." : "Loading verified stores..."}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
              {filteredVendors.map((vendor) => (
                <div key={vendor.id} className="group flex min-h-[300px] flex-col justify-between border border-white/10 bg-black p-5 text-start text-white transition-all hover:border-gold md:min-h-[380px] md:p-6">
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-16 h-16 bg-[#121212] border border-white/10 flex items-center justify-center">
                        <Warehouse className="text-gold h-10 w-10" />
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1 bg-gold text-black px-2 py-0.5 text-xs font-black">
                          <Star className="h-3.5 w-3.5 fill-current" />
                          <span>{vendor.ratingCount && vendor.ratingCount > 0 ? vendor.rating.toFixed(1) : (isArabic ? "جديد" : "New")}</span>
                        </div>
                        <span className="mt-1 text-[10px] font-bold uppercase text-white/40">
                          {vendor.ratingCount && vendor.ratingCount > 0 
                            ? (isArabic ? `${vendor.ratingCount} تقييم` : `${vendor.ratingCount} REVIEWS`)
                            : (isArabic ? "لا توجد تقييمات بعد" : "NO RATINGS YET")}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-lg font-black text-white uppercase group-hover:text-gold transition-colors">
                        {isArabic ? (vendor.shopNameAr || vendor.shopName) : vendor.shopName}
                      </h4>
                      {vendor.isOpen && (
                        <span className="text-xs text-blue-400 font-bold uppercase tracking-wider flex items-center gap-0.5">
                          <ShieldCheck className="h-4 w-4 fill-current" />
                        </span>
                      )}
                    </div>
                    <p className="text-white/60 text-xs font-bold mb-6 flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-gold" />
                      <span>{vendor.city}، {vendor.governorate}</span>
                    </p>
                    <div className="flex flex-wrap gap-2 mb-8">
                      <span className="border border-white/20 text-white/80 px-3 py-1 text-[10px] font-bold uppercase">
                        {getVendorCategoryLabel(vendor.category)}
                      </span>
                      <span className="border border-white/20 text-white/80 px-3 py-1 text-[10px] font-bold uppercase">
                        {vendor.isOpen ? (isArabic ? "مفتوح" : "OPEN") : (isArabic ? "مغلق" : "CLOSED")}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    <Link 
                      href={`/${locale}/vendors/${vendor.id}`} 
                      className="border-2 border-white py-3 text-center text-xs font-black uppercase text-white transition-all hover:bg-white hover:text-black"
                    >
                      {isArabic ? "تصفح المجلد" : "CATALOG"}
                    </Link>
                    <Link 
                      href={`/${locale}/vendors/${vendor.id}/request`} 
                      className="bg-gold py-3 text-center text-xs font-black uppercase text-black transition-all hover:bg-white md:brutalist-shadow"
                    >
                      {isArabic ? "اطلب تسعير" : "CONTACT"}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Brands */}
      <section className="overflow-hidden border-y-4 border-white/10 bg-black py-10 text-start text-white md:py-16">
        <div className="px-8 md:px-12 max-w-7xl mx-auto mb-8">
          <h3 className="text-xs font-black text-gold uppercase tracking-[0.3em] mb-2">
            {isArabic ? "شراكات موثوقة" : "Trusted Partnerships"}
          </h3>
          <h4 className="text-2xl font-black text-white">
            {isArabic ? "علامات صناعية نوفرها" : "INDUSTRIAL BRANDS WE CARRY"}
          </h4>
        </div>
        <div className="flex space-x-12 whitespace-nowrap overflow-x-auto py-4 hide-scrollbar justify-center max-w-7xl mx-auto opacity-70">
          <div className="flex items-center gap-16 font-black text-2xl tracking-widest text-neutral-400">
            <span>BOSCH</span>
            <span>CATERPILLAR</span>
            <span>SCHNEIDER</span>
            <span>MAKITA</span>
            <span>HILTI</span>
          </div>
        </div>
      </section>

      {/* Become a Vendor CTA */}
      <section className="border-t-4 border-black bg-gold px-4 py-10 md:px-12 md:py-16">
        <div className="max-w-7xl mx-auto bg-black p-8 md:p-12 relative overflow-hidden group border border-white/10 text-white text-start rounded-none">
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl">
              <h2 className="text-2xl md:text-4xl font-black text-white mb-4">
                {isArabic ? "جاهز لتوريد خاماتك على مستوى مصر؟" : "READY TO SUPPLY THE NATION?"}
              </h2>
              <p className="text-neutral-400 text-sm font-light mb-6 uppercase tracking-wide">
                {isArabic 
                  ? "انضم لأكبر شبكة موردين محترفين في مصر وضاعف مبيعاتك مع آلاف الفنيين والعملاء."
                  : "Join Egypt's largest industrial network and expand your reach to thousands of maintenance professionals."}
              </p>
              <div className="flex flex-wrap gap-4 text-xs font-black text-gold">
                <span>{isArabic ? "✓ بدون رسوم إعداد" : "✓ ZERO SETUP FEE"}</span>
                <span>{isArabic ? "✓ أدوات طلبات الجملة" : "✓ BULK ORDER TOOLS"}</span>
                <span>{isArabic ? "✓ مدفوعات آمنة" : "✓ SECURE PAYMENTS"}</span>
              </div>
            </div>
            <Link 
              href={`/${locale}/register/vendor`} 
              className="bg-gold text-black px-12 py-5 text-sm font-black brutalist-shadow hover:bg-white transition-all whitespace-nowrap rounded-none uppercase text-center"
            >
              {isArabic ? "شريك معنا" : "PARTNER WITH US"}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
