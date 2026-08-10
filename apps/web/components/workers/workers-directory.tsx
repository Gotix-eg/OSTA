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
  const [currentPage, setCurrentPage] = useState(1);
  const WORKERS_PER_PAGE = 12;

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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedSpecialty, selectedGov, selectedCity, sortBy]);

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

  const totalPages = Math.max(1, Math.ceil(filteredWorkers.length / WORKERS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedWorkers = filteredWorkers.slice(
    (safeCurrentPage - 1) * WORKERS_PER_PAGE,
    safeCurrentPage * WORKERS_PER_PAGE
  );

  const pageNumbers = useMemo(() => {
    const pages: (number | "...")[] = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || Math.abs(i - safeCurrentPage) <= 1) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }
    return pages;
  }, [totalPages, safeCurrentPage]);

  const defaultAvatars = [
    "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=400&auto=format&fit=crop&crop=faces",
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=400&auto=format&fit=crop&crop=faces",
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=400&auto=format&fit=crop&crop=faces",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop&crop=faces"
  ];

  return (
    <div className="min-h-screen bg-gold pb-28 text-[#1a1c1c] font-sans antialiased md:-mx-12 md:-my-12 md:pb-0">
      <style dangerouslySetInnerHTML={{__html: '.worker-card-dark { background-color: #000000; color: #ffffff; border: 1px solid rgba(255, 255, 255, 0.1); position: relative; display: flex; flex-direction: column; transition: all 0.2s ease-in-out; } .worker-card-dark:hover { outline: 3px solid #000000; transform: translateY(-4px); }' }} />

      {/* Black Hero Header Section */}
      <section className="relative overflow-hidden border-b-4 border-black bg-black px-4 py-6 text-start md:px-12 md:py-12 md:text-center">
        <div className="mx-auto max-w-4xl space-y-4 md:space-y-5">
          <div className="space-y-3">
            <h1 className="text-4xl font-black leading-tight text-white md:text-3xl">
              {isArabic ? "ابحث عن فني محترف" : "Find Expert Workers"}
            </h1>
            <p className="max-w-xl text-sm font-bold leading-6 text-white/60 md:mx-auto md:text-base">
              {isArabic ? "اختار التخصص والمنطقة وشوف الفنيين المتاحين بالقرب منك." : "Filter by specialty and area, then book a verified professional near you."}
            </p>
          </div>

          {/* Centered Search Row */}
          <div className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-3 border border-white/10 bg-[#121212]/90 p-3 md:flex-row md:gap-4 md:p-4">
            <div className="w-full md:w-1/3 relative">
              <select 
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="h-12 w-full rounded-none border border-white/20 bg-[#121212] px-4 text-xs font-bold text-white outline-none focus:border-gold focus:ring-0"
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
                placeholder={isArabic ? "الموقع أو اسم الفني" : "Location or worker name"}
                className="h-12 w-full rounded-none border border-white/20 bg-[#121212] px-4 text-start text-xs font-bold text-white outline-none focus:border-gold focus:ring-0"
              />
            </div>
            <button 
              onClick={() => fetchWorkers()}
              className="h-12 w-full rounded-none bg-gold px-6 text-xs font-black uppercase text-black transition-all hover:bg-white md:w-1/3"
            >
              {isArabic ? "ابحث الآن" : "SEARCH NOW"}
            </button>
          </div>

          {/* Popular Searches */}
          <div className="flex flex-wrap gap-2 text-xs font-bold text-white/60">
            <span className="text-gold">{isArabic ? "الأكثر طلبًا:" : "Popular:"}</span>
            <button className="hover:text-white" onClick={() => { setSelectedSpecialty("plumbing"); setSearchQuery(isArabic ? "طوارئ" : "Emergency"); }}>{isArabic ? "سباك طوارئ" : "Emergency Plumber"}</button>
            <span className="text-white/25">|</span>
            <button className="hover:text-white" onClick={() => setSelectedSpecialty("ac")}>{isArabic ? "صيانة تكييف" : "AC Maintenance"}</button>
            <span className="text-white/25">|</span>
            <button className="hover:text-white" onClick={() => setSelectedSpecialty("electricity")}>{isArabic ? "كهربائي معتمد" : "Licensed Electrician"}</button>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 text-start text-black md:flex-row md:items-center md:justify-between md:px-12 md:py-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-black uppercase md:text-lg">
            {filteredWorkers.length} {isArabic ? "إجمالي الفنيين" : "Total Workers"}
          </span>
          <span className="flex items-center gap-1.5 text-sm font-black uppercase md:text-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
            {filteredWorkers.filter((w) => w.isOnline).length} {isArabic ? "متاح الآن" : "Online Now"}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold uppercase text-black/70">{isArabic ? "ترتيب:" : "SORT BY:"}</span>
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
      <section className="mx-auto max-w-7xl px-4 pb-10 md:px-12 md:pb-20">
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
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {paginatedWorkers.map((worker, index) => {
              const avatarImg = worker.avatarUrl && !worker.avatarUrl.includes("initials")
                ? worker.avatarUrl
                : defaultAvatars[index % defaultAvatars.length];

              return (
                <div
                  key={worker.id}
                  className="worker-card-dark rounded-none flex flex-col justify-between p-0 overflow-hidden"
                >
                  {/* Compact Image Header */}
                  <div className="relative aspect-square w-full overflow-hidden bg-neutral-800">
                    <Link href={"/" + locale + "/workers/" + worker.id} className="block w-full h-full">
                      <img className="w-full h-full object-cover object-center transition-all duration-500" src={avatarImg} alt={worker.name} />
                    </Link>
                    <div className="absolute top-2 left-2 z-10 pointer-events-none">
                      <span className={cn(
                        "text-[9px] font-black px-1.5 py-0.5 flex items-center gap-1 rounded-none",
                        worker.isOnline ? "bg-green-500 text-white" : "bg-white text-black"
                      )}>
                        {worker.isOnline && <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>}
                        {worker.isOnline ? (isArabic ? "متاح" : "ONLINE") : (isArabic ? "غير متاح" : "OFFLINE")}
                      </span>
                    </div>
                  </div>

                  {/* Card Content Area */}
                  <div className="flex flex-grow flex-col justify-between p-3 text-start md:p-3.5">
                    <div>
                      <div className="flex justify-between items-start gap-1.5 mb-1">
                        <Link
                          href={"/" + locale + "/workers/" + worker.id}
                          className="font-black text-sm leading-tight truncate hover:underline hover:text-gold"
                        >
                          {worker.name}
                        </Link>
                        <div className="flex shrink-0 items-center text-gold text-xs font-black">
                          <Star className="h-3 w-3 fill-current mr-0.5 text-gold" />
                          <span className="text-white">{worker.rating > 0 ? worker.rating.toFixed(1) : "5.0"}</span>
                        </div>
                      </div>
                      <p className="text-[9px] font-black px-1.5 py-0.5 mb-2 inline-block uppercase rounded-none tracking-wider truncate max-w-full bg-gold text-black">
                        {isArabic ? worker.professionAr : worker.professionEn}
                      </p>

                      <div className="flex items-center gap-1 text-[10px] font-bold mb-2 truncate text-neutral-400">
                        <MapPin className="h-3 w-3 shrink-0 text-gold" />
                        <span className="truncate">{worker.areas?.length ? worker.areas.join(" • ") : "New Cairo"}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 mb-3">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-2.5 py-1 text-[10px] font-bold text-neutral-300">
                          <span className="text-white">{worker.totalJobs || "1,240+"}</span>
                          <span>{isArabic ? "عملية ناجحة" : "Jobs Done"}</span>
                          <ShieldCheck className="h-3 w-3 shrink-0 text-gold" />
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleBookClick(worker)}
                      className="w-full py-2.5 font-black text-[11px] uppercase tracking-wider transition-all rounded-none bg-white text-black hover:bg-gold hover:text-black"
                    >
                      {isArabic ? "اطلب الفني الآن" : "BOOK NOW"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mx-auto hidden max-w-7xl justify-center gap-2 pb-24 md:flex">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={safeCurrentPage === 1}
            className="w-10 h-10 flex items-center justify-center border border-black/20 bg-white hover:bg-black hover:text-white transition-colors font-bold rounded-none disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-black"
          >
            {"<"}
          </button>
          {pageNumbers.map((page, i) =>
            page === "..." ? (
              <span key={"ellipsis-" + i} className="w-10 h-10 flex items-center justify-center text-black font-bold">...</span>
            ) : (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={cn(
                  "w-10 h-10 flex items-center justify-center border border-black/20 font-bold rounded-none transition-colors",
                  page === safeCurrentPage ? "bg-black text-gold" : "bg-white hover:bg-black hover:text-white"
                )}
              >
                {page}
              </button>
            )
          )}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={safeCurrentPage === totalPages}
            className="w-10 h-10 flex items-center justify-center border border-black/20 bg-white hover:bg-black hover:text-white transition-colors font-bold rounded-none disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-black"
          >
            {">"}
          </button>
        </div>
      )}

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
              <ShieldCheck className="h-16 w-16 text-gold mx-auto mb-6" />
              <h3 className="text-2xl font-black mb-4">
                {isArabic ? "طلب حجز مباشر" : "Direct Booking Request"}
              </h3>
              <p className="text-gold font-bold mb-4 text-sm">
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
                  className="bg-gold text-black py-3 text-sm font-black w-full text-center rounded-none shadow-lg"
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
