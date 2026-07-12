"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  MapPin, 
  Search, 
  Star, 
  ChevronRight, 
  X, 
  ShieldCheck, 
  Loader2
} from "lucide-react";
import type { Locale } from "@/lib/locales";
import { cn } from "@/lib/utils";
import { resolveApiBaseUrl } from "@/lib/api";
import { getBrowserAuthState } from "@/lib/auth-client";
import { egyptianGovernorates, majorCities } from "@/lib/geo-data";

const CRAFTS = [
  { id: "all", name: { ar: "الكل", en: "All" } },
  { id: "electricity", name: { ar: "الكهرباء", en: "Electricity" } },
  { id: "plumbing", name: { ar: "السباكة", en: "Plumbing" } },
  { id: "carpentry", name: { ar: "النجارة", en: "Carpentry" } },
  { id: "ac", name: { ar: "التكييف", en: "AC Repair" } },
  { id: "painting", name: { ar: "الدهانات", en: "Painting" } },
  { id: "appliances", name: { ar: "صيانة أجهزة", en: "Appliance Repair" } }
];

export function WorkersDirectory({ locale }: { locale: Locale }) {
  const isArabic = locale === "ar";
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [selectedGov, setSelectedGov] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [sortBy, setSortBy] = useState("Top Rated");
  
  const [workers, setWorkers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Authentication & booking states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [selectedWorkerForBooking, setSelectedWorkerForBooking] = useState<any | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    getBrowserAuthState().then(({ isLoggedIn, role }) => {
      setIsLoggedIn(isLoggedIn);
      setIsClient(role === "CLIENT");
    });
  }, []);

  const fetchWorkers = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedSpecialty && selectedSpecialty !== "all") params.append("specialty", selectedSpecialty);
      if (selectedGov) params.append("governorate", selectedGov);
      if (selectedCity) params.append("city", selectedCity);

      const baseUrl = resolveApiBaseUrl();
      const res = await fetch(baseUrl + "/public/workers?" + params.toString());
      const data = await res.json();
      if (data.success) {
        setWorkers(data.data);
      } else {
        setWorkers([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, [selectedSpecialty, selectedGov, selectedCity]);

  const handleBookClick = (worker: any) => {
    if (isLoggedIn) {
      if (isClient) {
        const redirectUrl = "/" + locale + "/client/new-request?workerId=" + worker.id + "&categoryId=" + (worker.categoryId || "") + "&serviceId=" + (worker.serviceId || "");
        window.location.assign(redirectUrl);
      } else {
        alert(isArabic ? "هذا الإجراء متاح لحسابات العملاء فقط." : "Booking is only available for client accounts.");
      }
    } else {
      setSelectedWorkerForBooking(worker);
      setShowAuthModal(true);
    }
  };

  const filteredWorkers = useMemo(() => {
    let result = workers;
    if (searchQuery) {
      result = result.filter((w) => {
        const nameMatch = w.name.toLowerCase().includes(searchQuery.toLowerCase());
        const specAr = w.professionAr?.toLowerCase() || "";
        const specEn = w.professionEn?.toLowerCase() || "";
        return nameMatch || specAr.includes(searchQuery.toLowerCase()) || specEn.includes(searchQuery.toLowerCase());
      });
    }

    if (sortBy === "Top Rated") {
      result = [...result].sort((a, b) => (b.rating || 5) - (a.rating || 5));
    } else if (sortBy === "Most Experienced") {
      result = [...result].sort((a, b) => (b.totalJobs || 0) - (a.totalJobs || 0));
    }
    return result;
  }, [workers, searchQuery, sortBy]);

  const defaultAvatars = [
    "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1540324155974-752282871434?q=80&w=400&auto=format&fit=crop"
  ];

  return (
    <div className="bg-[#f9f9f9] text-[#1a1c1c] font-sans antialiased">
      <style dangerouslySetInnerHTML={{__html: '.worker-card { background-color: #ffffff; border: 1px solid #eeeeee; padding: 24px; position: relative; display: flex; flex-direction: column; transition: all 0.2s ease-in-out; } .worker-card:hover { outline: 2px solid #f5bd18; transform: translateY(-2px); } .btn-pop { box-shadow: 4px 4px 0px #000000; transition: all 0.1s ease-in-out; } .btn-pop:active { transform: translate(2px, 2px); box-shadow: 2px 2px 0px #000000; }' }} />

      {/* Hero Search & Filter Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-12 mb-12 mt-6">
        <div className="bg-black p-8 rounded-lg border border-white/10 shadow-2xl relative overflow-hidden text-start">
          {/* Decorative background bleed */}
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#f5bd18]/10 rounded-full blur-3xl"></div>
          <h1 className="font-display-lg text-4xl md:text-5xl font-bold text-white mb-8">
            {isArabic ? "ابحث عن فني محترف" : "Find Expert Workers"}
          </h1>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
            {/* Search Input */}
            <div className="lg:col-span-5">
              <label className="block text-xs font-bold text-white/60 mb-2 uppercase tracking-widest">
                {isArabic ? "البحث عن الفنيين" : "Search Professionals"}
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#f5bd18] h-5 w-5" />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#121212] border border-white/20 text-white pl-12 pr-4 py-4 focus:border-[#f5bd18] focus:ring-0 transition-all outline-none rounded-none text-sm" 
                  placeholder={isArabic ? "مثال: نجار محترف، سباك..." : "e.g. Master Electrician"} 
                />
              </div>
            </div>
            {/* Category Filters */}
            <div className="lg:col-span-7">
              <label className="block text-xs font-bold text-white/60 mb-2 uppercase tracking-widest">
                {isArabic ? "تخصص الخدمة" : "Service Category"}
              </label>
              <div className="flex flex-wrap gap-2">
                {CRAFTS.map((craft) => (
                  <button
                    key={craft.id}
                    onClick={() => setSelectedSpecialty(craft.id)}
                    className={cn(
                      "px-4 py-2 font-bold text-xs uppercase rounded-none transition-colors border",
                      selectedSpecialty === craft.id
                        ? "bg-[#f5bd18] text-black border-[#f5bd18]"
                        : "bg-[#121212] border-white/10 text-white hover:border-[#f5bd18]"
                    )}
                  >
                    {isArabic ? craft.name.ar : craft.name.en}
                  </button>
                ))}
              </div>
            </div>
            {/* Location Selectors */}
            <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <select 
                value={selectedGov}
                onChange={(e) => {
                  setSelectedGov(e.target.value);
                  setSelectedCity("");
                }}
                className="bg-[#121212] border border-white/20 text-white py-3 px-4 focus:border-[#f5bd18] focus:ring-0 outline-none rounded-none text-xs font-bold"
              >
                <option value="">{isArabic ? "كل المحافظات" : "All Governorates"}</option>
                {egyptianGovernorates.map((gov) => (
                  <option key={gov.value} value={gov.value}>
                    {isArabic ? gov.labelAr : gov.labelEn}
                  </option>
                ))}
              </select>
              <select 
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                disabled={!selectedGov}
                className="bg-[#121212] border border-white/20 text-white py-3 px-4 focus:border-[#f5bd18] focus:ring-0 outline-none rounded-none text-xs font-bold disabled:opacity-50"
              >
                <option value="">{isArabic ? "كل المدن" : "All Cities"}</option>
                {selectedGov && majorCities[selectedGov]?.map((city) => (
                  <option key={city.value} value={city.value}>
                    {isArabic ? city.labelAr : city.labelEn}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Stats / Quick Nav */}
      <section className="max-w-7xl mx-auto px-4 md:px-12 mb-8 flex items-center justify-between text-start">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold text-black">
            {filteredWorkers.length} {isArabic ? "فني متاح" : "Professionals"}
          </span>
          <span className="w-2 h-2 rounded-full bg-[#f5bd18] animate-pulse"></span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold uppercase text-neutral-500">{isArabic ? "ترتيب حسب:" : "Sort by:"}</span>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-transparent border-none font-bold text-black focus:ring-0 cursor-pointer text-xs uppercase"
          >
            <option value="Top Rated">{isArabic ? "الأعلى تقييماً" : "Top Rated"}</option>
            <option value="Most Experienced">{isArabic ? "الأكثر خبرة" : "Most Experienced"}</option>
          </select>
        </div>
      </section>

      {/* Worker Grid */}
      <section className="max-w-7xl mx-auto px-4 md:px-12">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-[#f5bd18] mb-4" />
            <p className="font-bold text-neutral-500">{isArabic ? "جاري تحميل الفنيين..." : "Loading specialists..."}</p>
          </div>
        ) : filteredWorkers.length === 0 ? (
          <div className="py-20 text-center bg-white border border-neutral-200 rounded-none p-12">
            <h4 className="text-xl font-bold text-black mb-2">{isArabic ? "لم نجد أي فنيين يطابقون خياراتك" : "No professionals found"}</h4>
            <p className="text-neutral-500 text-sm">{isArabic ? "جرب تغيير فلاتر البحث أو التخصص." : "Try changing search queries or specialties filters."}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredWorkers.map((worker, index) => {
              const avatarImg = worker.avatarUrl && !worker.avatarUrl.includes("initials") 
                ? worker.avatarUrl 
                : defaultAvatars[index % defaultAvatars.length];
              return (
                <div key={worker.id} className="worker-card group">
                  <div className="absolute top-4 right-4 z-10">
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-1 flex items-center gap-1 rounded-none",
                      worker.isOnline ? "bg-green-500 text-white" : "bg-neutral-400 text-white"
                    )}>
                      {worker.isOnline && <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>}
                      {worker.isOnline ? "ONLINE" : "OFFLINE"}
                    </span>
                  </div>
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-20 h-20 bg-neutral-100 overflow-hidden border border-black/5 flex-shrink-0">
                      <img className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" src={avatarImg} alt="" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-black leading-tight truncate max-w-[140px]">{worker.name}</h3>
                      <div className="flex items-center text-[#f5bd18] mt-1 text-sm font-black">
                        <Star className="h-4 w-4 fill-current mr-1" />
                        <span>{worker.rating > 0 ? worker.rating.toFixed(1) : "5.0"}</span>
                      </div>
                      <p className="text-[10px] font-black text-[#f5bd18] bg-black px-2 py-0.5 mt-2 inline-block uppercase rounded-none tracking-wider">
                        {isArabic ? worker.professionAr : worker.professionEn}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3 mb-6 flex-grow text-xs font-semibold text-neutral-500">
                    <div className="flex justify-between items-center border-b border-neutral-100 pb-2">
                      <span>{isArabic ? "العمليات الناجحة" : "Completed Jobs"}</span>
                      <span className="font-bold text-black">{worker.totalJobs || 120}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-neutral-100 pb-2">
                      <span>{isArabic ? "الموقع" : "Location"}</span>
                      <span className="font-bold text-black truncate max-w-[120px]">{worker.city || (isArabic ? "مصر" : "Egypt")}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>{isArabic ? "زمن الاستجابة" : "Response Time"}</span>
                      <span className="font-bold text-black">~ 15 mins</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleBookClick(worker)}
                    className="w-full py-4 bg-black text-white font-bold text-sm uppercase tracking-widest hover:bg-[#f5bd18] hover:text-black transition-all btn-pop rounded-none shadow-md"
                  >
                    {isArabic ? "اطلب الفني الآن" : "Book Pro Now"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Booking Auth Prompt Modal */}
      {showAuthModal && selectedWorkerForBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#1a1c1c] text-white max-w-md w-full p-8 rounded-none border border-white/10 shadow-2xl relative text-start">
            <button 
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="text-center">
              <ShieldCheck className="h-16 w-16 text-[#f5bd18] mx-auto mb-6" />
              <h3 className="text-2xl font-black mb-4">
                {isArabic ? "طلب حجز مباشر" : "Direct Booking Request"}
              </h3>
              <p className="text-[#f5bd18] font-bold mb-4 text-sm">
                {isArabic 
                  ? "حجز مع الفني: " + selectedWorkerForBooking.name
                  : "Booking with Pro: " + selectedWorkerForBooking.name}
              </p>
              <p className="text-neutral-400 text-sm leading-relaxed mb-8">
                {isArabic
                  ? "لإتمام طلب الحجز المباشر مع الفني وإضافته تلقائياً لقائمة الفنيين المفضلين لديك لتسهيل التواصل لاحقاً، يرجى تسجيل الدخول أو إنشاء حساب عميل جديد."
                  : "To complete your direct booking request and automatically add this technician to your favorites list for easier future contact, please sign in or create a client account."}
              </p>
              <div className="flex flex-col gap-3">
                <Link
                  href={"/login?redirect=" + encodeURIComponent(
                    "/" + locale + "/client/new-request?workerId=" + selectedWorkerForBooking.id
                  )}
                  className="bg-[#f5bd18] text-black py-3 text-sm font-black w-full text-center rounded-none shadow-lg"
                >
                  {isArabic ? "تسجيل الدخول كعميل" : "Login as Client"}
                </Link>
                <Link
                  href={"/register/client?redirect=" + encodeURIComponent(
                    "/" + locale + "/client/new-request?workerId=" + selectedWorkerForBooking.id
                  )}
                  className="border-2 border-white text-white py-3 text-sm font-black w-full text-center rounded-none hover:bg-white hover:text-black transition-all"
                >
                  {isArabic ? "إنشاء حساب عميل جديد" : "Register as Client"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
