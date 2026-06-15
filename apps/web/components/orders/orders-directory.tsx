"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  MapPin, 
  Search, 
  Filter, 
  Wrench, 
  ChevronRight, 
  X, 
  ShieldCheck, 
  Loader2, 
  RotateCcw,
  Clock,
  Briefcase
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

export function OrdersDirectory({ locale }: { locale: Locale }) {
  const isArabic = locale === "ar";
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [selectedGov, setSelectedGov] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [selectedUrgency, setSelectedUrgency] = useState("");
  
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Authentication & accept actions
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isWorker, setIsWorker] = useState(false);
  const [selectedRequestForAccept, setSelectedRequestForAccept] = useState<any | null>(null);
  const [showWorkerAuthModal, setShowWorkerAuthModal] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = window.localStorage.getItem("osta_access_token") || window.sessionStorage.getItem("osta_access_token");
      const role = window.localStorage.getItem("osta_user_role");
      setIsLoggedIn(!!token);
      setIsWorker(role === "WORKER");
    }
  }, []);

  const fetchRequests = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (selectedSpecialty) params.append("specialty", selectedSpecialty);

      const baseUrl = resolveApiBaseUrl();
      const res = await fetch(`${baseUrl}/public/requests?${params.toString()}`);
      if (!res.ok) {
        throw new Error("Failed to fetch public requests");
      }
      const data = await res.json();
      if (data.success) {
        setRequests(data.data);
      } else {
        setRequests([]);
      }
    } catch (err) {
      console.error(err);
      setError(isArabic ? "تعذر جلب الطلبات المتاحة" : "Failed to load open orders.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [selectedSpecialty]);

  const handleAcceptRequestClick = (req: any) => {
    if (isLoggedIn) {
      if (isWorker) {
        // Redirect worker to dashboard to accept it
        window.location.assign(`/${locale}/worker`);
      } else {
        alert(isArabic ? "هذا الإجراء متاح لحسابات الفنيين فقط." : "Accepting requests is only available for technician accounts.");
      }
    } else {
      setSelectedRequestForAccept(req);
      setShowWorkerAuthModal(true);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedSpecialty("");
    setSelectedGov("");
    setSelectedCity("");
    setSelectedArea("");
    setSelectedUrgency("");
  };

  // Perform client-side geo & urgency filtering since public requests endpoint returns all category requests
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      // 1. Search Query
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || 
        r.title.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query) ||
        r.categoryNameAr?.toLowerCase().includes(query) ||
        r.categoryNameEn?.toLowerCase().includes(query);

      // 2. Governorate
      const matchesGov = !selectedGov || 
        r.governorate?.toLowerCase().trim() === selectedGov.toLowerCase().trim();

      // 3. City
      const matchesCity = !selectedCity || 
        r.city?.toLowerCase().trim() === selectedCity.toLowerCase().trim();

      // 4. Area / Neighborhood
      const matchesArea = !selectedArea || 
        (r.district?.toLowerCase().trim() === selectedArea.toLowerCase().trim() ||
         r.city?.toLowerCase().trim() === selectedArea.toLowerCase().trim());

      // 5. Urgency
      const matchesUrgency = !selectedUrgency || 
        r.urgency === selectedUrgency;

      return matchesSearch && matchesGov && matchesCity && matchesArea && matchesUrgency;
    });
  }, [requests, searchQuery, selectedGov, selectedCity, selectedArea, selectedUrgency]);

  const FiltersContent = () => (
    <div className="space-y-6">
      {/* Specialty Filter */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-onyx-300">
          {isArabic ? "التخصص المطلوب" : "Required Trade"}
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

      {/* Urgency Filter */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-onyx-300">
          {isArabic ? "درجة الاستعجال" : "Urgency / Priority"}
        </label>
        <select
          value={selectedUrgency}
          onChange={(e) => setSelectedUrgency(e.target.value)}
          className="h-12 bg-onyx-900 border border-white/10 text-white rounded-xl px-4 focus:outline-none focus:border-gold-500/50 transition-colors cursor-pointer text-sm font-medium w-full"
        >
          <option value="">{isArabic ? "كل مستويات الاستعجال" : "All Urgency Levels"}</option>
          <option value="NORMAL">{isArabic ? "طلب عادي" : "Normal"}</option>
          <option value="EMERGENCY">{isArabic ? "طوارئ قصوى" : "Emergency"}</option>
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
      {(selectedSpecialty || selectedGov || selectedCity || selectedArea || searchQuery || selectedUrgency) && (
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
      {/* Subpage Header Banner */}
      <section className="onyx-card relative overflow-hidden p-8 sm:p-12 border-gold-500/10">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gold-500/5 blur-[100px] rounded-full -mr-40 -mt-40 pointer-events-none" />
        <div className="relative max-w-4xl space-y-4">
          <span className="inline-flex rounded-full bg-gold-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.4em] text-gold-500 border border-gold-500/20">
            {isArabic ? "لوحة طلبات الصيانة" : "Open Maintenance Orders"}
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            {isArabic ? "فرص العمل المتاحة للفنيين" : "Find Available Jobs"}
          </h1>
          <p className="text-sm sm:text-base text-onyx-350 max-w-2xl leading-relaxed">
            {isArabic 
              ? "تصفح طلبات الصيانة المفتوحة من العملاء في محافظتك وتخصصك، وقدم عرض سعر أو اقبل الطلب فوراً لبدء العمل."
              : "Browse open home maintenance requests from customers in your city, submit quotes, or accept jobs."}
          </p>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Side Filter (Desktop Only) */}
        <aside className="hidden lg:block w-[320px] shrink-0 sticky top-28 onyx-card p-6 border-white/5 bg-white/[0.01] backdrop-blur space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Filter className="h-4.5 w-4.5 text-gold-500" />
              <span>{isArabic ? "تصفية الطلبات" : "Filter Orders"}</span>
            </h3>
          </div>
          
          {/* Live Search Bar */}
          <div className="relative">
            <Search className="absolute start-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-onyx-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isArabic ? "ابحث بالاسم أو التفاصيل..." : "Search orders..."}
              className="h-12 w-full rounded-xl bg-onyx-900 border border-white/10 ps-11 pe-4 text-white placeholder-onyx-500 text-sm focus:outline-none focus:border-gold-500/50 transition-colors"
            />
          </div>

          {FiltersContent()}
        </aside>

        {/* Mobile Filter Trigger */}
        <div className="lg:hidden w-full flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute start-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-onyx-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isArabic ? "ابحث بالاسم أو التفاصيل..." : "Search orders..."}
              className="h-12 w-full rounded-xl bg-onyx-900 border border-white/5 ps-11 pe-4 text-white placeholder-onyx-500 text-sm focus:outline-none"
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

        {/* Orders Listing */}
        <div className="flex-1 w-full space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-onyx-400">
              <Loader2 className="h-10 w-10 animate-spin text-gold-500 mb-4" />
              <p className="text-sm font-medium">{isArabic ? "جاري تحميل الطلبات المتاحة..." : "Loading open orders..."}</p>
            </div>
          ) : error ? (
            <div className="text-center py-20 onyx-card border-red-500/20 bg-red-500/5 text-red-500 font-bold rounded-3xl">
              {error}
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-16 onyx-card border-white/5 bg-white/[0.01] rounded-3xl">
              <Briefcase className="h-16 w-16 text-onyx-600 mx-auto mb-4" />
              <h4 className="text-xl font-bold text-white mb-2">
                {isArabic ? "لم نجد أي طلبات" : "No Orders Found"}
              </h4>
              <p className="text-onyx-400 text-sm max-w-md mx-auto">
                {isArabic 
                  ? "لا يوجد طلبات مفتوحة مطابقة لخيارات البحث المحددة. حاول تعديل الفلاتر للوصول لفرص عمل أكثر." 
                  : "No open orders match your search parameters. Try modifying your filters."}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredRequests.map((req) => (
                <div 
                  key={req.id}
                  className="onyx-card border-white/5 bg-white/[0.02] hover:border-gold-500/30 transition-all duration-300 rounded-3xl p-6 flex flex-col justify-between group"
                >
                  <div>
                    {/* Urgency and Date */}
                    <div className="flex items-center justify-between mb-4">
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md",
                        req.urgency === "EMERGENCY" 
                          ? "bg-red-500/10 text-red-500 border border-red-500/20" 
                          : "bg-onyx-800 text-onyx-300 border border-white/5"
                      )}>
                        {req.urgency === "EMERGENCY" 
                          ? (isArabic ? "حالة طوارئ" : "Emergency") 
                          : (isArabic ? "طلب عادي" : "Normal")}
                      </span>

                      <span className="text-xs text-onyx-500 font-medium flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(req.createdAt).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>

                    <h4 className="text-lg font-black text-white mb-1.5 line-clamp-1 group-hover:text-gold-500 transition-colors">
                      <Link href={`/${locale}/orders/${req.id}`}>
                        {req.title}
                      </Link>
                    </h4>

                    <p className="text-xs text-gold-500 font-bold mb-3 uppercase tracking-wider">
                      {isArabic ? req.categoryNameAr : req.categoryNameEn}
                    </p>

                    <p className="text-sm text-onyx-400 line-clamp-4 leading-relaxed mb-6">
                      {req.description}
                    </p>
                  </div>

                  {/* Location & Action */}
                  <div className="border-t border-white/5 pt-4 mt-auto">
                    <div className="flex items-center gap-2 text-xs text-onyx-400 mb-4 font-semibold">
                      <MapPin className="h-4 w-4 text-gold-500 flex-shrink-0" />
                      <span>{isArabic ? `${req.governorate}، ${req.city}` : `${req.governorate}, ${req.city}`}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Link
                        href={`/${locale}/orders/${req.id}`}
                        className="btn-ghost py-3 text-xs sm:text-sm font-black flex items-center justify-center border-white/10 text-white hover:bg-white/5 rounded-xl"
                      >
                        {isArabic ? "التفاصيل" : "Details"}
                      </Link>
                      <button
                        onClick={() => handleAcceptRequestClick(req)}
                        className="btn-gold py-3 text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 group/btn shadow-md"
                      >
                        <span>{isArabic ? "اقبل الآن" : "Accept"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm lg:hidden animate-fadeIn">
          <div className="bg-onyx-950 w-full max-h-[85vh] rounded-t-[2.5rem] border-t border-white/10 p-6 overflow-y-auto space-y-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Filter className="h-4.5 w-4.5 text-gold-500" />
                  <span>{isArabic ? "تصفية طلبات الصيانة" : "Filter Orders"}</span>
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
              onClick={() => setIsMobileFilterOpen(false)}
              className="btn-gold w-full mt-8 py-4 font-black"
            >
              {isArabic ? "عرض النتائج" : "Show Results"}
            </button>
          </div>
        </div>
      )}

      {/* Auth Prompt Modal for Technician */}
      {showWorkerAuthModal && selectedRequestForAccept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="onyx-card border-white/10 bg-onyx-900 max-w-md w-full p-8 rounded-3xl shadow-2xl relative border animate-scaleUp">
            <button 
              onClick={() => setShowWorkerAuthModal(false)}
              className="absolute top-4 right-4 text-onyx-400 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="text-center">
              <div className="h-16 w-16 bg-gold-500/10 border border-gold-500/25 rounded-full flex items-center justify-center mx-auto mb-6 text-gold-500">
                <Briefcase className="h-8 w-8" />
              </div>

              <h3 className="text-2xl font-black text-white mb-2">
                {isArabic ? "قبول وتسلّم طلب الصيانة" : "Accept & Start Job"}
              </h3>
              
              <p className="text-gold-500 font-bold mb-4 text-sm">
                {isArabic 
                  ? `الطلب: ${selectedRequestForAccept.title}` 
                  : `Job: ${selectedRequestForAccept.title}`}
              </p>

              <p className="text-onyx-300 text-sm leading-relaxed mb-8">
                {isArabic
                  ? "لقبول هذا الطلب والبدء بالتواصل المباشر مع العميل وعرض ميزانيتك المقترحة، يرجى تسجيل الدخول كفني محترف أو إنشاء حساب فني جديد."
                  : "To accept this job and start direct communication with the client, please sign in as a technician or create a worker account."}
              </p>

              <div className="flex flex-col gap-3">
                <Link
                  href={`/${locale}/login?redirect=${encodeURIComponent(`/${locale}/worker`)}`}
                  className="btn-gold py-3 text-sm font-black w-full text-center rounded-xl shadow-lg shadow-gold-500/10"
                >
                  {isArabic ? "تسجيل الدخول كفني" : "Login as Technician"}
                </Link>
                <Link
                  href={`/${locale}/register/worker`}
                  className="btn-onyx py-3 text-sm font-black w-full text-center border-white/10 text-white hover:bg-white/5 rounded-xl"
                >
                  {isArabic ? "إنشاء حساب فني جديد" : "Register as Technician"}
                </Link>
                <button
                  onClick={() => setShowWorkerAuthModal(false)}
                  className="text-xs text-onyx-500 hover:text-onyx-300 transition-colors font-bold mt-4"
                >
                  {isArabic ? "إلغاء ومتابعة التصفح" : "Cancel and Continue"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
