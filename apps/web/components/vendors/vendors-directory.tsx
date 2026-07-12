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
    { value: "ALL", label: { ar: "كل المحافظات", en: "ALL CITIES" } },
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
    <div className="bg-[#f5bd18] text-[#1a1c1c] font-sans -mx-4 md:-mx-12 -my-12">
      {/* Hero Section */}
      <section className="py-20 px-8 md:px-12 flex flex-col justify-center border-b-4 border-black text-start max-w-7xl mx-auto w-full">
        <div className="w-full">
          <div className="inline-block bg-black text-[#f5bd18] px-4 py-1 mb-4 text-xs font-black uppercase tracking-widest rounded-none">
            {isArabic ? "سلسلة التوريد الممتازة" : "Premium Supply Chain"}
          </div>
          <h1 className="font-display-lg text-4xl md:text-6xl text-black font-black leading-tight mb-4">
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
          <h2 className="text-xl md:text-2xl text-black/80 font-bold">
            {isArabic ? "ابحث عن أقرب متجر خامات لصيانة منزلك" : "Source spare parts & raw materials from local stores"}
          </h2>
        </div>
      </section>

      {/* Search & Filter Bar */}
      <section className="sticky top-20 z-40 bg-black py-6 px-8 md:px-12 border-b border-white/10 text-white">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 h-5 w-5" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#121212] border border-white/20 text-white pl-12 pr-4 py-4 focus:border-[#f5bd18] focus:ring-0 transition-colors placeholder:text-white/30 uppercase text-xs rounded-none font-bold text-start"
              placeholder={isArabic ? "ابحث عن خامات، قطع غيار، علامات تجارية..." : "Search tools, parts, or brands..."}
            />
          </div>
          <div className="flex flex-wrap lg:flex-nowrap gap-4">
            <select 
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-[#121212] border border-white/20 text-white px-6 py-4 focus:border-[#f5bd18] focus:ring-0 appearance-none text-xs rounded-none font-bold"
            >
              {cities.map(c => (
                <option key={c.value} value={c.value}>{c.label[locale]}</option>
              ))}
            </select>
            <select 
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
              className="bg-[#121212] border border-white/20 text-white px-6 py-4 focus:border-[#f5bd18] focus:ring-0 appearance-none text-xs rounded-none font-bold"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label[locale]}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Vendor Directory Grid */}
      <section className="py-20 px-8 md:px-12 bg-[#f5bd18]">
        <div className="max-w-7xl mx-auto text-start">
          <div className="flex justify-between items-end mb-12 border-b border-black/10 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-2 h-12 bg-black"></div>
              <h3 className="text-2xl md:text-4xl text-black font-black uppercase">
                {isArabic ? "الموردين المعتمدين" : "Verified Suppliers"}
              </h3>
            </div>
            <p className="text-sm font-black text-black/60">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredVendors.map((vendor) => (
                <div key={vendor.id} className="bg-black border border-white/10 p-6 flex flex-col justify-between h-full hover:border-[#f5bd18] transition-all group text-start rounded-none text-white min-h-[380px]">
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-16 h-16 bg-[#121212] border border-white/10 flex items-center justify-center">
                        <Warehouse className="text-[#f5bd18] h-10 w-10" />
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1 bg-[#f5bd18] text-black px-2 py-0.5 text-xs font-black">
                          <Star className="h-3.5 w-3.5 fill-current" />
                          <span>{vendor.rating > 0 ? vendor.rating.toFixed(1) : "5.0"}</span>
                        </div>
                        <span className="text-white/40 text-[10px] mt-1 uppercase font-bold">
                          {vendor.ratingCount || 120} REVIEWS
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-lg font-black text-white uppercase group-hover:text-[#f5bd18] transition-colors">
                        {isArabic ? (vendor.shopNameAr || vendor.shopName) : vendor.shopName}
                      </h4>
                      {vendor.isOpen && (
                        <span className="text-xs text-blue-400 font-bold uppercase tracking-wider flex items-center gap-0.5">
                          <ShieldCheck className="h-4 w-4 fill-current" />
                        </span>
                      )}
                    </div>
                    <p className="text-white/60 text-xs font-bold mb-6 flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-[#f5bd18]" />
                      <span>{vendor.city}، {vendor.governorate}</span>
                    </p>
                    <div className="flex flex-wrap gap-2 mb-8">
                      <span className="border border-white/20 text-white/80 px-3 py-1 text-[10px] font-bold uppercase">
                        {vendor.category || "General Supplies"}
                      </span>
                      <span className="border border-white/20 text-white/80 px-3 py-1 text-[10px] font-bold uppercase">
                        {vendor.isOpen ? (isArabic ? "مفتوح" : "OPEN") : (isArabic ? "مغلق" : "CLOSED")}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Link 
                      href={`/${locale}/vendors/${vendor.id}`} 
                      className="border-2 border-white text-white text-center py-3 text-xs font-black hover:bg-white hover:text-black transition-all rounded-none uppercase"
                    >
                      {isArabic ? "تصفح المجلد" : "CATALOG"}
                    </Link>
                    <Link 
                      href={`/${locale}/vendors/${vendor.id}/request`} 
                      className="bg-[#f5bd18] text-black text-center py-3 text-xs font-black brutalist-shadow hover:bg-white transition-all rounded-none uppercase"
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
      <section className="bg-black py-16 overflow-hidden border-y-4 border-white/10 text-white text-start">
        <div className="px-8 md:px-12 max-w-7xl mx-auto mb-8">
          <h3 className="text-xs font-black text-[#f5bd18] uppercase tracking-[0.3em] mb-2">Trusted Partnerships</h3>
          <h4 className="text-2xl font-black text-white">INDUSTRIAL BRANDS WE CARRY</h4>
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
      <section className="bg-[#f5bd18] py-16 px-8 md:px-12 border-t-4 border-black">
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
              <div className="flex flex-wrap gap-4 text-xs font-black text-[#f5bd18]">
                <span>✓ ZERO SETUP FEE</span>
                <span>✓ BULK ORDER TOOLS</span>
                <span>✓ SECURE PAYMENTS</span>
              </div>
            </div>
            <Link 
              href={`/${locale}/register/vendor`} 
              className="bg-[#f5bd18] text-black px-12 py-5 text-sm font-black brutalist-shadow hover:bg-white transition-all whitespace-nowrap rounded-none uppercase text-center"
            >
              {isArabic ? "شريك معنا" : "PARTNER WITH US"}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
