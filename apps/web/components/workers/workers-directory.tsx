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
  { id: "all", name: { ar: "الكل", en: "All Specialties" } },
  { id: "electricity", name: { ar: "الكهرباء", en: "Electrical" } },
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
    <div className="bg-[#f5bd18] text-[#1a1c1c] font-sans antialiased -mx-4 md:-mx-12 -my-12">
      <style dangerouslySetInnerHTML={{__html: '.worker-card-dark { background-color: #000000; color: #ffffff; border: 1px solid rgba(255, 255, 255, 0.1); padding: 24px; position: relative; display: flex; flex-direction: column; transition: all 0.2s ease-in-out; } .worker-card-light { background-color: #ffffff; color: #000000; border: 1px solid rgba(0, 0, 0, 0.1); padding: 24px; position: relative; display: flex; flex-direction: column; transition: all 0.2s ease-in-out; } .worker-card-dark:hover { outline: 3px solid #000000; transform: translateY(-4px); } .worker-card-light:hover { outline: 3px solid #ffffff; transform: translateY(-4px); }' }} />

      {/* Black Hero Header Section */}
      <section className="bg-black py-20 px-8 md:px-12 text-center border-b-4 border-black relative overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-black text-white">
              Find Expert Workers
            </h1>
            <h2 className="text-lg md:text-xl font-bold text-[#f5bd18]">
              البحث عن فنيين محترفين
            </h2>
          </div>

          {/* Centered Search Row */}
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center max-w-3xl mx-auto bg-[#121212]/80 p-4 rounded-xl border border-white/10 backdrop-blur">
            <div className="w-full md:w-1/3 relative">
              <select 
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full bg-[#121212] border border-white/20 text-white py-3 px-4 focus:border-[#f5bd18] focus:ring-0 outline-none rounded-none text-xs font-bold"
              >
                {CRAFTS.map(craft => (
                  <option key={craft.id} value={craft.id}>{isArabic ? craft.name.ar : craft.name.en}</option>
                ))}
              </select>
            </div>
            <div className="w-full md:w-1/3">
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isArabic ? "الموقع (المدينة، الحي)" : "Location (City, Area)"}
                className="w-full bg-[#121212] border border-white/20 text-white py-3 px-4 focus:border-[#f5bd18] focus:ring-0 outline-none rounded-none text-xs font-bold text-start"
              />
            </div>
            <button 
              onClick={() => fetchWorkers()}
              className="w-full md:w-1/3 bg-[#f5bd18] text-black font-black text-xs py-3 px-6 hover:bg-white transition-all uppercase rounded-none"
            >
              SEARCH NOW
            </button>
          </div>

          {/* Popular Searches */}
          <div className="text-xs text-white/60 font-bold space-x-2">
            <span className="text-[#f5bd18]">POPULAR:</span>
            <span className="cursor-pointer hover:text-white" onClick={() => { setSelectedSpecialty("plumbing"); setSearchQuery("Emergency"); }}>Emergency Plumber</span>
            <span>|</span>
            <span className="cursor-pointer hover:text-white" onClick={() => setSelectedSpecialty("ac")}>AC Maintenance</span>
            <span>|</span>
            <span className="cursor-pointer hover:text-white" onClick={() => setSelectedSpecialty("electricity")}>Licensed Electrician</span>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="max-w-7xl mx-auto px-8 md:px-12 py-8 flex items-center justify-between text-start text-black">
        <div className="flex items-center gap-3">
          <span className="text-lg font-black uppercase">
            {filteredWorkers.length} Professionals available in {selectedCity || (isArabic ? "القاهرة" : "New Cairo")}
          </span>
          <span className="w-2.5 h-2.5 rounded-full bg-black animate-pulse"></span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold uppercase text-black/70">SORT BY:</span>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-transparent border-none font-black text-black focus:ring-0 cursor-pointer text-xs uppercase"
          >
            <option value="Top Rated">{isArabic ? "الأعلى تقييماً" : "Top Rated"}</option>
            <option value="Most Experienced">{isArabic ? "الأكثر خبرة" : "Most Experienced"}</option>
          </select>
        </div>
      </section>

      {/* Worker Grid */}
      <section className="max-w-7xl mx-auto px-8 md:px-12 pb-24">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-black mb-4" />
            <p className="font-bold text-black">{isArabic ? "جاري تحميل الفنيين..." : "Loading specialists..."}</p>
          </div>
        ) : filteredWorkers.length === 0 ? (
          <div className="py-20 text-center bg-black/5 border border-black/10 rounded-none p-12">
            <h4 className="text-xl font-bold text-black mb-2">{isArabic ? "لم نجد أي فنيين يطابقون خياراتك" : "No professionals found"}</h4>
            <p className="text-black/75 text-sm">{isArabic ? "جرب تغيير فلاتر البحث أو التخصص." : "Try changing search queries or specialties filters."}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredWorkers.map((worker, index) => {
              const avatarImg = worker.avatarUrl && !worker.avatarUrl.includes("initials") 
                ? worker.avatarUrl 
                : defaultAvatars[index % defaultAvatars.length];
              
              // Apply alternating colors formula based on the screenshot (index 1 and 5 are white, others are black)
              const isWhiteCard = (index % 4 === 1);
              
              return (
                <div 
                  key={worker.id} 
                  className={cn(
                    isWhiteCard ? "worker-card-light" : "worker-card-dark",
                    "rounded-none flex flex-col justify-between"
                  )}
                >
                  <div className="absolute top-4 right-4 z-10">
                    <span className={cn(
                      "text-[10px] font-black px-2 py-1 flex items-center gap-1 rounded-none",
                      worker.isOnline 
                        ? "bg-green-500 text-white" 
                        : (isWhiteCard ? "bg-black text-white" : "bg-white text-black")
                    )}>
                      {worker.isOnline && <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>}
                      {worker.isOnline ? "ONLINE" : "OFFLINE"}
                    </span>
                  </div>
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-24 h-24 bg-neutral-800 overflow-hidden border border-white/10 flex-shrink-0">
                      <img className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" src={avatarImg} alt="" />
                    </div>
                    <div>
                      <h3 className="font-black text-xl leading-tight truncate max-w-[160px]">{worker.name}</h3>
                      <div className="flex items-center text-[#f5bd18] mt-1 text-sm font-black">
                        <Star className="h-4 w-4 fill-current mr-1 text-[#f5bd18]" />
                        <span className={isWhiteCard ? "text-black" : "text-white"}>{worker.rating > 0 ? worker.rating.toFixed(1) : "5.0"}</span>
                      </div>
                      <p className={cn(
                        "text-[10px] font-black px-2 py-0.5 mt-2 inline-block uppercase rounded-none tracking-wider",
                        isWhiteCard ? "bg-black text-[#f5bd18]" : "bg-[#f5bd18] text-black"
                      )}>
                        {isArabic ? worker.professionAr : worker.professionEn}
                      </p>
                    </div>
                  </div>
                  <div className={cn(
                    "space-y-3 mb-8 flex-grow text-xs font-bold",
                    isWhiteCard ? "text-neutral-600" : "text-neutral-400"
                  )}>
                    <div className="flex justify-between items-center border-b border-black/10 md:border-white/10 pb-2">
                      <span>{isArabic ? "العمليات الناجحة" : "COMPLETED JOBS"}</span>
                      <span className={isWhiteCard ? "text-black" : "text-white"}>{worker.totalJobs || "1,240+"}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-black/10 md:border-white/10 pb-2">
                      <span>{isArabic ? "زمن الاستجابة" : "RESPONSE TIME"}</span>
                      <span className={isWhiteCard ? "text-black" : "text-white"}>15 Mins</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>{isArabic ? "الموقع" : "PRIMARY LOCATION"}</span>
                      <span className={cn(
                        "truncate max-w-[150px]",
                        isWhiteCard ? "text-black" : "text-white"
                      )}>{worker.city || "New Cairo, Fifth Settlement"}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleBookClick(worker)}
                    className={cn(
                      "w-full py-4 font-black text-sm uppercase tracking-widest transition-all rounded-none",
                      isWhiteCard 
                        ? "bg-black text-white hover:bg-[#f5bd18] hover:text-black" 
                        : "bg-white text-black hover:bg-[#f5bd18] hover:text-black"
                    )}
                  >
                    {isArabic ? "احجز الآن" : "BOOK PRO NOW"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Pagination */}
      <div className="max-w-7xl mx-auto flex justify-center gap-2 pb-24">
        <button className="w-10 h-10 flex items-center justify-center border border-black/20 bg-white hover:bg-black hover:text-white transition-colors font-bold rounded-none">{"<"}</button>
        <button className="w-10 h-10 flex items-center justify-center border border-black/20 bg-black text-[#f5bd18] font-bold rounded-none">1</button>
        <button className="w-10 h-10 flex items-center justify-center border border-black/20 bg-white hover:bg-black hover:text-white transition-colors font-bold rounded-none">2</button>
        <button className="w-10 h-10 flex items-center justify-center border border-black/20 bg-white hover:bg-black hover:text-white transition-colors font-bold rounded-none">3</button>
        <span className="w-10 h-10 flex items-center justify-center text-black font-bold">...</span>
        <button className="w-10 h-10 flex items-center justify-center border border-black/20 bg-white hover:bg-black hover:text-white transition-colors font-bold rounded-none">12</button>
        <button className="w-10 h-10 flex items-center justify-center border border-black/20 bg-white hover:bg-black hover:text-white transition-colors font-bold rounded-none">{">"}</button>
      </div>

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
