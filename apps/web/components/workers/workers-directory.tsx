"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  MapPin, 
  Search, 
  Star, 
  Filter, 
  Users, 
  ChevronRight, 
  X, 
  ShieldCheck, 
  Loader2, 
  Wrench, 
  RotateCcw,
  Sparkles
} from "lucide-react";
import type { Locale } from "@/lib/locales";
import { cn } from "@/lib/utils";
import { resolveApiBaseUrl } from "@/lib/api";
import { egyptianGovernorates, majorCities } from "@/lib/geo-data";

const CRAFTS = [
  { id: "electricity", name: { ar: "الكهرباء", en: "Electrical" } },
  { id: "plumbing", name: { ar: "السباكة", en: "Plumbing" } },
  { id: "carpentry", name: { ar: "النجارة", en: "Carpentry" } },
  { id: "ac", name: { ar: "التكييفات", en: "AC Maintenance" } },
  { id: "appliances", name: { ar: "صيانة أجهزة", en: "Home Appliances" } },
  { id: "painting", name: { ar: "الدهانات", en: "Painting" } },
  { id: "aluminum", name: { ar: "الوميتال", en: "Aluminum" } },
  { id: "networks", name: { ar: "الشبكات", en: "Networks" } },
  { id: "computer-repair", name: { ar: "صيانة كمبيوتر", en: "Computer" } },
  { id: "cctv", name: { ar: "تركيب كاميرات", en: "CCTV" } },
];

const POPULAR_NEIGHBORHOODS: Record<string, { value: string; labelAr: string; labelEn: string }[]> = {
  "new-cairo": [
    { value: "5th-settlement", labelAr: "التجمع الخامس", labelEn: "Fifth Settlement" },
    { value: "1st-settlement", labelAr: "التجمع الأول", labelEn: "First Settlement" },
    { value: "rehab", labelAr: "الرحاب", labelEn: "Rehab" },
    { value: "madinaty", labelAr: "مدينتي", labelEn: "Madinaty" },
  ],
  "nasr-city": [
    { value: "1st-district", labelAr: "الحي الأول", labelEn: "First District" },
    { value: "8th-district", labelAr: "الحي الثامن", labelEn: "Eighth District" },
    { value: "zahraa-nasr-city", labelAr: "زهراء مدينة نصر", labelEn: "Zahraa Nasr City" },
  ],
  "maadi": [
    { value: "sarayat-maadi", labelAr: "سرايات المعادي", labelEn: "Sarayat Maadi" },
    { value: "hadayek-maadi", labelAr: "حدائق المعادي", labelEn: "Hadayek Maadi" },
    { value: "deglah", labelAr: "دجلة", labelEn: "Degla" },
  ],
  "6th-october": [
    { value: "1st-district", labelAr: "الحي الأول", labelEn: "First District" },
    { value: "5th-district", labelAr: "الحي الخامس", labelEn: "Fifth District" },
  ],
  "sheikh-zayed": [
    { value: "green-belt", labelAr: "الحزام الأخضر", labelEn: "Green Belt" },
  ]
};

export function WorkersDirectory({ locale }: { locale: Locale }) {
  const isArabic = locale === "ar";
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [selectedGov, setSelectedGov] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  
  const [workers, setWorkers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Authentication & booking states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [selectedWorkerForBooking, setSelectedWorkerForBooking] = useState<any | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = window.localStorage.getItem("osta_access_token") || window.sessionStorage.getItem("osta_access_token");
      const role = window.localStorage.getItem("osta_user_role");
      setIsLoggedIn(!!token);
      setIsClient(role === "CLIENT");
    }
  }, []);

  const fetchWorkers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (selectedSpecialty) params.append("specialty", selectedSpecialty);
      if (selectedGov) params.append("governorate", selectedGov);
      if (selectedCity) params.append("city", selectedCity);
      if (selectedArea) params.append("area", selectedArea);

      const baseUrl = resolveApiBaseUrl();
      const res = await fetch(`${baseUrl}/public/workers?${params.toString()}`);
      if (!res.ok) {
        throw new Error("Failed to fetch workers");
      }
      const data = await res.json();
      if (data.success) {
        setWorkers(data.data);
      } else {
        setWorkers([]);
      }
    } catch (err) {
      console.error(err);
      setError(isArabic ? "تعذر جلب الفنيين" : "Failed to load workers.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, [selectedSpecialty, selectedGov, selectedCity, selectedArea]);

  const handleBookClick = (worker: any) => {
    if (isLoggedIn) {
      if (isClient) {
        const redirectUrl = `/${locale}/client/new-request?workerId=${worker.id}&categoryId=${worker.categoryId}&serviceId=${worker.serviceId}`;
        window.location.assign(redirectUrl);
      } else {
        alert(isArabic ? "هذا الإجراء متاح لحسابات العملاء فقط." : "Booking is only available for client accounts.");
      }
    } else {
      setSelectedWorkerForBooking(worker);
      setShowAuthModal(true);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedSpecialty("");
    setSelectedGov("");
    setSelectedCity("");
    setSelectedArea("");
  };

  const filteredWorkers = useMemo(() => {
    if (!searchQuery) return workers;
    return workers.filter((w) => {
      const nameMatch = w.name.toLowerCase().includes(searchQuery.toLowerCase());
      const specialtyArMatch = w.professionAr?.toLowerCase().includes(searchQuery.toLowerCase());
      const specialtyEnMatch = w.professionEn?.toLowerCase().includes(searchQuery.toLowerCase());
      return nameMatch || specialtyArMatch || specialtyEnMatch;
    });
  }, [workers, searchQuery]);

  const FiltersContent = () => (
    <div className="space-y-6">
      {/* Specialty Filter */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-onyx-300">
          {isArabic ? "التخصص المهني" : "Profession / Specialty"}
        </label>
        <select
          value={selectedSpecialty}
          onChange={(e) => setSelectedSpecialty(e.target.value)}
          className="h-12 bg-onyx-900 border border-white/10 text-white rounded-xl px-4 focus:outline-none focus:border-gold-500/50 transition-colors cursor-pointer text-sm font-medium w-full"
        >
          <option value="">{isArabic ? "كل التخصصات" : "All Specialties"}</option>
          {CRAFTS.map((craft) => (
            <option key={craft.id} value={craft.id}>
              {isArabic ? craft.name.ar : craft.name.en}
            </option>
          ))}
        </select>
      </div>

      {/* Governorate Filter */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-onyx-300">
          {isArabic ? "المحافظة" : "Governorate"}
        </label>
        <select
          value={selectedGov}
          onChange={(e) => {
            setSelectedGov(e.target.value);
            setSelectedCity("");
            setSelectedArea("");
          }}
          className="h-12 bg-onyx-900 border border-white/10 text-white rounded-xl px-4 focus:outline-none focus:border-gold-500/50 transition-colors cursor-pointer text-sm font-medium w-full"
        >
          <option value="">{isArabic ? "اختر المحافظة" : "Select Governorate"}</option>
          {egyptianGovernorates.map((gov) => (
            <option key={gov.value} value={gov.value}>
              {isArabic ? gov.labelAr : gov.labelEn}
            </option>
          ))}
        </select>
      </div>

      {/* City Filter */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-onyx-300">
          {isArabic ? "المنطقة / المدينة" : "City / Region"}
        </label>
        <select
          value={selectedCity}
          onChange={(e) => {
            setSelectedCity(e.target.value);
            setSelectedArea("");
          }}
          disabled={!selectedGov}
          className="h-12 bg-onyx-900 border border-white/10 text-white rounded-xl px-4 focus:outline-none focus:border-gold-500/50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium w-full"
        >
          <option value="">{isArabic ? "اختر المدينة" : "Select City"}</option>
          {selectedGov && majorCities[selectedGov]?.map((city) => (
            <option key={city.value} value={city.value}>
              {isArabic ? city.labelAr : city.labelEn}
            </option>
          ))}
        </select>
      </div>

      {/* Neighborhood Filter */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-onyx-300">
          {isArabic ? "الحي السكني" : "Neighborhood"}
        </label>
        {selectedCity && POPULAR_NEIGHBORHOODS[selectedCity] ? (
          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            disabled={!selectedCity}
            className="h-12 bg-onyx-900 border border-white/10 text-white rounded-xl px-4 focus:outline-none focus:border-gold-500/50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium w-full"
          >
            <option value="">{isArabic ? "اختر الحي" : "Select Neighborhood"}</option>
            {POPULAR_NEIGHBORHOODS[selectedCity].map((neighborhood) => (
              <option key={neighborhood.value} value={neighborhood.value}>
                {isArabic ? neighborhood.labelAr : neighborhood.labelEn}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            placeholder={isArabic ? "اكتب الحي (مثال: الدقي)" : "Type neighborhood (e.g. Dokki)"}
            disabled={!selectedCity}
            className="h-12 bg-onyx-900 border border-white/10 text-white rounded-xl px-4 focus:outline-none focus:border-gold-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium w-full"
          />
        )}
      </div>

      {/* Reset Button */}
      {(selectedSpecialty || selectedGov || selectedCity || selectedArea || searchQuery) && (
        <button
          onClick={handleResetFilters}
          className="flex items-center justify-center gap-2 w-full py-3 border border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-sm transition-all"
        >
          <RotateCcw className="h-4 w-4" />
          <span>{isArabic ? "إعادة ضبط الفلاتر" : "Reset Filters"}</span>
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* ── Subpage Header Banner ── */}
      <section className="onyx-card relative overflow-hidden p-8 sm:p-12 border-gold-500/10">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gold-500/5 blur-[100px] rounded-full -mr-40 -mt-40" />
        <div className="relative max-w-4xl space-y-4">
          <span className="inline-flex rounded-full bg-gold-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.4em] text-gold-500 border border-gold-500/20">
            {isArabic ? "دليل الفنيين" : "Technicians Directory"}
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            {isArabic ? "البحث عن أفضل الفنيين" : "Find the Best Technicians"}
          </h1>
          <p className="text-sm sm:text-base text-onyx-350 max-w-2xl leading-relaxed">
            {isArabic 
              ? "ابحث وتصفح قائمة الصنايعية والفنيين الموثقين والأقرب إليك، وتفاوض معهم على الأسعار مباشرة."
              : "Search and browse local verified craftsmen and technicians, and negotiate quotes directly."}
          </p>
        </div>
      </section>

      {/* ── Main Content Grid with Sidebar ── */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* ── Side Filter (Desktop Only) ── */}
        <aside className="hidden lg:block w-[320px] shrink-0 sticky top-28 onyx-card p-6 border-white/5 bg-white/[0.01] backdrop-blur space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Filter className="h-4.5 w-4.5 text-gold-500" />
              <span>{isArabic ? "تصفية الفنيين" : "Filter Technicians"}</span>
            </h3>
          </div>
          
          {/* Live Search Bar */}
          <div className="relative">
            <Search className="absolute start-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-onyx-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isArabic ? "ابحث بالاسم أو المهنة..." : "Search by name or trade..."}
              className="h-12 w-full rounded-xl bg-onyx-900 border border-white/10 ps-11 pe-4 text-white placeholder-onyx-500 text-sm focus:outline-none focus:border-gold-500/50 transition-colors"
            />
          </div>

          <FiltersContent />
        </aside>

        {/* ── Mobile Filter Trigger Button ── */}
        <div className="lg:hidden w-full flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute start-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-onyx-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isArabic ? "ابحث بالاسم أو المهنة..." : "Search by name or trade..."}
              className="h-12 w-full rounded-xl bg-onyx-900 border border-white/5 ps-11 pe-4 text-white placeholder-onyx-500 text-sm focus:outline-none focus:border-gold-500/50"
            />
          </div>
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="h-12 px-5 rounded-xl border border-white/5 bg-white/5 text-white font-bold flex items-center gap-2 transition hover:bg-white/10"
          >
            <Filter className="h-4 w-4 text-gold-500" />
            <span>{isArabic ? "الفلاتر" : "Filters"}</span>
          </button>
        </div>

        {/* ── Workers Listing ── */}
        <div className="flex-1 w-full space-y-6">
          {/* Nearby Fallback Banner */}
          {filteredWorkers.length > 0 && filteredWorkers.some(w => w.isNearby) && (
            <div className="p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 text-amber-500 text-sm font-semibold flex items-center gap-3">
              <span className="text-lg">⚠️</span>
              <p>
                {isArabic 
                  ? "عذراً، لا يوجد فنيين متوفرين في الحي المحدد حالياً. تم تلقائياً عرض الفنيين المتاحين في الأحياء المجاورة التابعة لنفس المدينة."
                  : "Sorry, no technicians are currently available in the selected neighborhood. We have automatically displayed available technicians in neighboring areas."}
              </p>
            </div>
          )}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-onyx-400">
              <Loader2 className="h-10 w-10 animate-spin text-gold-500 mb-4" />
              <p className="text-sm font-medium">{isArabic ? "جاري البحث عن أفضل الفنيين..." : "Searching for the best pros..."}</p>
            </div>
          ) : error ? (
            <div className="text-center py-20 onyx-card border-red-500/20 bg-red-500/5 text-red-500 font-bold rounded-3xl">
              {error}
            </div>
          ) : filteredWorkers.length === 0 ? (
            <div className="text-center py-16 onyx-card border-white/5 bg-white/[0.01] rounded-3xl">
              <Users className="h-16 w-16 text-onyx-600 mx-auto mb-4" />
              <h4 className="text-xl font-bold text-white mb-2">
                {isArabic ? "لم نجد أي فنيين" : "No Technicians Found"}
              </h4>
              <p className="text-onyx-400 text-sm max-w-md mx-auto">
                {isArabic 
                  ? "لا يوجد فنيين مسجلين يطابقون خيارات البحث الحالية. حاول تعديل الفلاتر أو إعادة تعيينها للبدء من جديد." 
                  : "There are no registered pros matching your search parameters. Try adjusting your filters."}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredWorkers.map((worker) => (
                <div 
                  key={worker.id}
                  className="onyx-card border-white/5 bg-white/[0.02] hover:border-gold-500/30 transition-all duration-300 rounded-3xl p-6 flex flex-col justify-between group"
                >
                  <div>
                    {/* Header: Status and Badges */}
                    <div className="flex items-center justify-between mb-4">
                      {/* Availability status */}
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "h-2.5 w-2.5 rounded-full",
                          worker.isOnline ? "bg-emerald-500 green-glow" : "bg-onyx-600"
                        )} />
                        <span className="text-xs text-onyx-400 font-medium">
                          {worker.isOnline 
                            ? (isArabic ? "متصل الآن" : "Online")
                            : (isArabic ? "نشط مؤخراً" : "Active recently")}
                        </span>
                      </div>

                      {/* Badges */}
                      <div className="flex items-center gap-2">
                        {worker.isFeatured && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-onyx-950 bg-gold-500 px-2 py-0.5 rounded-md shadow-sm">
                            {isArabic ? "مميز" : "Featured"}
                          </span>
                        )}
                        {worker.isNearby && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded-md">
                            {isArabic ? "منطقة مجاورة" : "Nearby"}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Pro Info */}
                    <div className="flex items-start gap-4 mb-4">
                      {/* Avatar */}
                      <div className="h-16 w-16 rounded-2xl bg-onyx-800 border border-white/10 overflow-hidden flex items-center justify-center text-gold-500 text-xl font-bold flex-shrink-0 shadow-inner">
                        {worker.avatarUrl ? (
                          <img src={worker.avatarUrl} alt={worker.name} className="h-full w-full object-cover" />
                        ) : (
                          worker.name.charAt(0)
                        )}
                      </div>

                      {/* Name & Specialty */}
                      <div className="min-w-0 flex-1">
                        <h4 className="text-lg font-black text-white truncate group-hover:text-gold-500 transition-colors">
                          {worker.name}
                        </h4>
                        <p className="text-sm text-gold-500/90 font-medium mt-0.5">
                          {isArabic ? worker.professionAr : worker.professionEn}
                        </p>
                        
                        {/* Rating */}
                        <div className="flex items-center gap-1.5 mt-2">
                          <Star className="h-4 w-4 text-gold-500 fill-current" />
                          <span className="text-sm font-bold text-white">{worker.rating > 0 ? worker.rating.toFixed(1) : "5.0"}</span>
                          <span className="text-xs text-onyx-500">({worker.ratingCount || 1})</span>
                          <span className="text-onyx-700 mx-1">|</span>
                          <span className="text-xs text-onyx-400 font-semibold">{worker.totalJobs || 0} {isArabic ? "عملية ناجحة" : "jobs"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Locations */}
                    <div className="border-t border-white/5 pt-4 mb-6">
                      <p className="text-xs text-onyx-500 font-bold mb-2 uppercase tracking-wide">
                        {isArabic ? "مناطق التغطية" : "Service Coverage"}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {worker.areas.slice(0, 3).map((a: string, idx: number) => (
                          <span key={idx} className="text-xs bg-onyx-800/80 text-onyx-300 px-2.5 py-1 rounded-lg border border-white/[0.03]">
                            {a}
                          </span>
                        ))}
                        {worker.areas.length > 3 && (
                          <span className="text-xs bg-onyx-800/80 text-onyx-400 px-2.5 py-1 rounded-lg border border-white/[0.03]">
                            +{worker.areas.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Booking Action */}
                  <button
                    onClick={() => handleBookClick(worker)}
                    className="w-full btn-gold py-3 text-sm font-black flex items-center justify-center gap-2 group/btn shadow-md"
                  >
                    <span>{isArabic ? "اطلب هذا الفني" : "Book Pro Now"}</span>
                    <ChevronRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1 rtl:rotate-180 rtl:group-hover/btn:-translate-x-1" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile Filter Modal/Drawer ── */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm lg:hidden animate-fadeIn">
          <div className="bg-onyx-950 w-full max-h-[85vh] rounded-t-[2.5rem] border-t border-white/10 p-6 overflow-y-auto space-y-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Filter className="h-4.5 w-4.5 text-gold-500" />
                  <span>{isArabic ? "تصفية الفنيين" : "Filter Technicians"}</span>
                </h3>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="text-onyx-400 hover:text-white p-2 hover:bg-white/5 rounded-xl transition"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <FiltersContent />
            </div>
            
            <button
              onClick={() => setIsMobileFilterOpen(false)}
              className="btn-gold w-full mt-8 py-4 font-black"
            >
              {isArabic ? "عرض النتائج" : "Show Results"}
            </button>
          </div>
        </div>
      )}

      {/* ── Booking Auth Prompt Modal ── */}
      {showAuthModal && selectedWorkerForBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="onyx-card border-white/10 bg-onyx-900 max-w-md w-full p-8 rounded-3xl shadow-2xl relative border animate-scaleUp">
            <button 
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-onyx-400 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="text-center">
              <div className="h-16 w-16 bg-gold-500/10 border border-gold-500/25 rounded-full flex items-center justify-center mx-auto mb-6 text-gold-500">
                <Users className="h-8 w-8" />
              </div>

              <h3 className="text-2xl font-black text-white mb-2">
                {isArabic ? "طلب حجز مباشر" : "Direct Booking Request"}
              </h3>
              
              <p className="text-gold-500 font-bold mb-4 text-sm">
                {isArabic 
                  ? `حجز مع الفني: ${selectedWorkerForBooking.name}` 
                  : `Booking with Pro: ${selectedWorkerForBooking.name}`}
              </p>

              <p className="text-onyx-300 text-sm leading-relaxed mb-8">
                {isArabic
                  ? "لإتمام طلب الحجز المباشر مع الفني وإضافته تلقائياً لقائمة الفنيين المفضلين لديك لتسهيل التواصل لاحقاً، يرجى تسجيل الدخول أو إنشاء حساب عميل جديد."
                  : "To complete your direct booking request and automatically add this technician to your favorites list for easier future contact, please sign in or create a client account."}
              </p>

              <div className="flex flex-col gap-3">
                <Link
                  href={`/${locale}/login?redirect=${encodeURIComponent(
                    `/${locale}/client/new-request?workerId=${selectedWorkerForBooking.id}&categoryId=${selectedWorkerForBooking.categoryId}&serviceId=${selectedWorkerForBooking.serviceId}`
                  )}`}
                  className="btn-gold py-3 text-sm font-black w-full text-center rounded-xl shadow-lg shadow-gold-500/10"
                >
                  {isArabic ? "تسجيل الدخول كعميل" : "Login as Client"}
                </Link>
                <Link
                  href={`/${locale}/register/client?redirect=${encodeURIComponent(
                    `/${locale}/client/new-request?workerId=${selectedWorkerForBooking.id}&categoryId=${selectedWorkerForBooking.categoryId}&serviceId=${selectedWorkerForBooking.serviceId}`
                  )}`}
                  className="btn-onyx py-3 text-sm font-black w-full text-center border-white/10 text-white hover:bg-white/5 rounded-xl"
                >
                  {isArabic ? "إنشاء حساب عميل جديد" : "Register as Client"}
                </Link>
                <button
                  onClick={() => setShowAuthModal(false)}
                  className="text-xs text-onyx-500 hover:text-onyx-300 transition-colors font-bold mt-4"
                >
                  {isArabic ? "إلغاء ومتابعة التصفح" : "Cancel and Continue Browsing"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
