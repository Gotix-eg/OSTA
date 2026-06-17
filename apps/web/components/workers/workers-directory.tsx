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
  Sparkles,
  CheckCircle2
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

  // Alert subscription states
  const [subscribedAlert, setSubscribedAlert] = useState(false);
  const [subscriberEmail, setSubscriberEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  const handleAlertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscriberEmail.trim()) return;
    setSubscribing(true);
    setTimeout(() => {
      setSubscribing(false);
      setSubscribedAlert(true);
    }, 800);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = window.localStorage.getItem("osta_access_token") || window.sessionStorage.getItem("osta_access_token");
      const role = window.localStorage.getItem("osta_user_role");
      setIsLoggedIn(!!token);
      setIsClient(role === "CLIENT");
    }
  }, []);

  const fetchWorkers = async (overrides?: { specialty?: string; gov?: string; city?: string; area?: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const specialty = overrides && overrides.specialty !== undefined ? overrides.specialty : selectedSpecialty;
      const gov = overrides && overrides.gov !== undefined ? overrides.gov : selectedGov;
      const city = overrides && overrides.city !== undefined ? overrides.city : selectedCity;
      const area = overrides && overrides.area !== undefined ? overrides.area : selectedArea;

      const params = new URLSearchParams();
      if (specialty) params.append("specialty", specialty);
      if (gov) params.append("governorate", gov);
      if (city) params.append("city", city);
      if (area) params.append("area", area);

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
  }, []);

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
    fetchWorkers({ specialty: "", gov: "", city: "", area: "" });
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

      {/* Search Button */}
      <button
        onClick={() => fetchWorkers()}
        disabled={isLoading}
        className="w-full btn-gold py-3.5 text-sm font-black flex items-center justify-center gap-2 shadow-md shadow-gold-500/10 disabled:opacity-75 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Search className="h-4 w-4" />
        )}
        <span>{isArabic ? "بحث" : "Search"}</span>
      </button>

      {/* Reset Button */}
      {(selectedSpecialty || selectedGov || selectedCity || selectedArea || searchQuery) && (
        <button
          onClick={handleResetFilters}
          className="flex items-center justify-center gap-2 w-full py-3 border border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-sm transition-all"
        >
          <RotateCcw className="h-4 w-4" />
          <span>{isArabic ? "مسح الفلاتر" : "Clear Filters"}</span>
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

          {FiltersContent()}
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
            <div className="onyx-card border-white/5 bg-white/[0.01] rounded-[2.5rem] p-8 sm:p-12 text-center max-w-4xl mx-auto relative overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-gold-500/5 blur-[80px] rounded-full pointer-events-none" />
              
              {/* Illustration Composition */}
              <div className="relative h-24 w-24 mx-auto mb-6 flex items-center justify-center">
                <div className="absolute inset-0 bg-gold-500/5 rounded-full border border-gold-500/10 animate-pulse" />
                <div className="absolute inset-2 bg-onyx-900 rounded-full border border-white/5 flex items-center justify-center">
                  <Users className="h-10 w-10 text-onyx-600" />
                </div>
                <div className="absolute -bottom-1 -right-1 h-9 w-9 bg-gold-500/10 border border-gold-500/30 rounded-xl flex items-center justify-center text-gold-500">
                  <Search className="h-4.5 w-4.5" />
                </div>
              </div>

              <h4 className="text-2xl font-black text-white mb-3">
                {isArabic ? "لم نجد أي فنيين يطابقون خياراتك" : "No Matching Technicians Found"}
              </h4>
              <p className="text-onyx-400 text-sm max-w-lg mx-auto leading-relaxed mb-10">
                {isArabic 
                  ? "عذراً، لا يتوفر صنايعية مسجلين حالياً يطابقون التصفية المحددة. نقترح عليك تجربة أحد الحلول السريعة التالية:" 
                  : "We couldn't find any registered professionals matching your filter criteria. Try one of the quick suggestions below:"}
              </p>

              {/* Actionable Suggestions Grid */}
              <div className="grid gap-6 md:grid-cols-3 text-start">
                {/* Option 1: Clear & Browse All */}
                <div className="onyx-card border-white/5 bg-white/[0.01] hover:border-gold-500/20 p-6 rounded-2xl flex flex-col justify-between group transition-all duration-300">
                  <div>
                    <span className="text-xs font-bold text-gold-500 uppercase tracking-wider mb-2 block">{isArabic ? "اقتراح 1" : "Suggestion 1"}</span>
                    <h5 className="text-base font-bold text-white mb-2">{isArabic ? "عرض كل فنيي المنصة" : "Browse All Pros"}</h5>
                    <p className="text-xs text-onyx-400 leading-relaxed mb-4">
                      {isArabic ? "إزالة جميع الفلاتر وعرض قائمة الصنايعية كاملة للبدء مجدداً." : "Clear all active filter conditions and browse the entire directory."}
                    </p>
                  </div>
                  <button 
                    onClick={handleResetFilters}
                    className="w-full btn-ghost py-2.5 px-4 text-xs font-black rounded-xl text-center border-white/10 hover:border-gold-500/30 hover:bg-gold-500/5 transition-all"
                  >
                    {isArabic ? "مسح الفلاتر" : "Clear Filters"}
                  </button>
                </div>

                {/* Option 2: Explore Other Professions */}
                <div className="onyx-card border-white/5 bg-white/[0.01] hover:border-gold-500/20 p-6 rounded-2xl flex flex-col justify-between group transition-all duration-300">
                  <div>
                    <span className="text-xs font-bold text-gold-500 uppercase tracking-wider mb-2 block">{isArabic ? "اقتراح 2" : "Suggestion 2"}</span>
                    <h5 className="text-base font-bold text-white mb-2">{isArabic ? "تغيير التخصص المطلوب" : "Modify Trade Filter"}</h5>
                    <p className="text-xs text-onyx-400 leading-relaxed mb-4">
                      {isArabic ? "ربما تجد صنايعي مناسب تحت تخصص مهني آخر ذو صلة." : "Try choosing a different trade category from the filter list."}
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedSpecialty("");
                      fetchWorkers({ specialty: "" });
                    }}
                    className="w-full btn-ghost py-2.5 px-4 text-xs font-black rounded-xl text-center border-white/10 hover:border-gold-500/30 hover:bg-gold-500/5 transition-all"
                  >
                    {isArabic ? "تصفح كل التخصصات" : "Clear Specialty"}
                  </button>
                </div>

                {/* Option 3: Subscribe to Alerts */}
                <div className="onyx-card border-white/5 bg-white/[0.01] hover:border-gold-500/20 p-6 rounded-2xl flex flex-col justify-between group transition-all duration-300">
                  <div>
                    <span className="text-xs font-bold text-gold-500 uppercase tracking-wider mb-2 block">{isArabic ? "اقتراح 3" : "Suggestion 3"}</span>
                    <h5 className="text-base font-bold text-white mb-2">{isArabic ? "اشترك في التنبيهات" : "Subscribe to Alerts"}</h5>
                    
                    {subscribedAlert ? (
                      <div className="bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 mt-2">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        <span>{isArabic ? "تم تفعيل التنبيه بنجاح!" : "Alert set successfully!"}</span>
                      </div>
                    ) : (
                      <>
                        <p className="text-xs text-onyx-400 leading-relaxed mb-4">
                          {isArabic ? "سنرسل لك إشعاراً فور تسجيل فنيين جدد في هذه المنطقة بالتحديد." : "Get notified as soon as a technician signs up in this specific area."}
                        </p>
                        <form onSubmit={handleAlertSubmit} className="flex gap-2">
                          <input 
                            type="email"
                            required
                            placeholder={isArabic ? "بريدك الإلكتروني" : "Your email"}
                            value={subscriberEmail}
                            onChange={(e) => setSubscriberEmail(e.target.value)}
                            className="bg-onyx-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-onyx-600 focus:outline-none focus:border-gold-500/30 flex-1 min-w-0"
                          />
                          <button 
                            type="submit"
                            disabled={subscribing}
                            className="btn-gold p-2 px-3 text-xs rounded-xl disabled:opacity-50 shrink-0 font-bold"
                          >
                            {subscribing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : (isArabic ? "نبهني" : "Alert Me")}
                          </button>
                        </form>
                      </>
                    )}
                  </div>
                </div>
              </div>
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
                      <Link href={`/${locale}/workers/${worker.id}`} className="h-16 w-16 rounded-2xl bg-onyx-800 border border-white/10 overflow-hidden flex items-center justify-center text-gold-500 text-xl font-bold flex-shrink-0 shadow-inner hover:border-gold-500/50 transition-colors">
                        {worker.avatarUrl ? (
                          <img src={worker.avatarUrl} alt={worker.name} className="h-full w-full object-cover" />
                        ) : (
                          worker.name.charAt(0)
                        )}
                      </Link>

                      {/* Name & Specialty */}
                      <div className="min-w-0 flex-1">
                        <Link href={`/${locale}/workers/${worker.id}`}>
                          <h4 className="text-lg font-black text-white truncate hover:text-gold-500 transition-colors cursor-pointer">
                            {worker.name}
                          </h4>
                        </Link>
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

              {FiltersContent()}
            </div>
            
            <button
              onClick={() => {
                fetchWorkers();
                setIsMobileFilterOpen(false);
              }}
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
