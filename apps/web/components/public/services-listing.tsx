"use client";

import Link from "next/link";
import { 
  ArrowRight, ArrowLeft, Search, Sparkles
} from "lucide-react";
import { useLiveApiData } from "@/hooks/use-live-api-data";
import type { Locale } from "@/lib/locales";

interface ServiceCategory {
  id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  icon: string;
  imageUrl?: string | null;
}

const serviceImages: Record<string, string> = {
  electrical: "/services/electrical.png",
  plumbing: "/services/plumbing.png",
  carpentry: "/services/carpentry.png",
  ac: "/images/services/ac.jpg",
  "ac-maintenance": "/images/services/ac.jpg",
  appliances: "/services/ac-appliances.png",
  painting: "/services/painting.png",
  aluminum: "/images/services/aluminum.jpg",
  networks: "/services/general-services.png",
  computer: "/services/electrical.png",
  "computer-repair": "/services/electrical.png",
  cameras: "/images/services/cam.jpg",
  cctv: "/images/services/cam.jpg",
  tiling: "/images/services/tiling.png",
  plastering: "/images/services/plastering.png",
  ironwork: "/images/services/ironwork.png",
  finishing: "/images/services/finishing.png"
};



export function ServicesListing({ locale }: { locale: Locale }) {
  const isArabic = locale === "ar";
  const categories = useLiveApiData<ServiceCategory[]>("/services/categories", []);

  return (
    <div className="animate-fadeIn space-y-12 pb-20">
      {/* ── Search & Header ── */}
      <section className="text-center space-y-6">
        <span className="inline-flex rounded-full bg-gold-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.4em] text-gold-500 border border-gold-500/20">
          {isArabic ? "سوق الخدمات الفاخر" : "Premium Service Marketplace"}
        </span>
        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
          {isArabic ? "ماذا يمكننا أن نفعل لك؟" : "What can we do for you?"}
        </h1>
        <p className="text-onyx-400 text-lg max-w-2xl mx-auto">
          {isArabic 
            ? "اختر من بين نخبة الحرفيين والفنيين المتخصصين في كافة المجالات المنزلية والتقنية." 
            : "Choose from an elite group of specialized craftsmen and technicians in all home and technical fields."}
        </p>

        <div className="max-w-2xl mx-auto relative group">
           <div className="absolute inset-0 bg-gold-500/10 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
           <input 
              type="text" 
              placeholder={isArabic ? "ابحث عن خدمة (نجار، سباك، صيانة كاميرات...)" : "Search for a service (Carpentry, Plumbing...)"}
              className="w-full h-16 rounded-2xl border border-onyx-700 bg-onyx-800/80 px-14 text-white focus:border-gold-500/50 outline-none transition-all relative z-10"
           />
           <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-onyx-500 z-20 group-focus-within:text-gold-500 transition-colors" />
        </div>
      </section>

      {/* ── Grid ── */}
      <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {categories.length === 0 ? (
          // Fallback placeholders if API is empty
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3 rounded-[1.5rem] border border-white/5 p-3 animate-pulse bg-onyx-800/20">
              <div className="w-full aspect-square rounded-xl bg-onyx-800" />
              <div className="h-4 w-2/3 bg-onyx-800 rounded px-1" />
              <div className="h-3 w-1/3 bg-onyx-800 rounded px-1" />
            </div>
          ))
        ) : (
          categories.map((cat) => {
            const imgUrl = serviceImages[cat.slug] || serviceImages[cat.icon] || cat.imageUrl || "https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=800&auto=format&fit=crop";
            return (
              <Link 
                key={cat.id} 
                href={`/${locale}/services/${cat.slug}`}
                className="group flex flex-col gap-3 rounded-[1.5rem] bg-onyx-900/40 border border-white/5 hover:border-gold-500/30 p-3 transition-all duration-500 overflow-hidden shadow-lg"
              >
                {/* 1:1 Aspect Ratio Image Container with NO overlay */}
                <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-onyx-800">
                  <img 
                    src={imgUrl} 
                    alt=""
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                
                {/* Content Section below the image */}
                <div className="flex flex-col gap-1.5 px-1 py-1 text-start">
                  <h3 className="text-sm sm:text-base font-black text-white group-hover:text-gold-500 transition-colors line-clamp-1">
                    {isArabic ? cat.nameAr : cat.nameEn}
                  </h3>
                  
                  <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-gold-500/80 group-hover:text-gold-500 transition-colors">
                    {isArabic ? "استكشف الخدمات" : "Explore Services"}
                    {isArabic ? <ArrowLeft className="h-3 w-3" /> : <ArrowRight className="h-3 w-3" />}
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>

      {/* ── Banner ── */}
      <section className="onyx-card border-gold-500/20 bg-gradient-to-br from-onyx-800 to-onyx-900 p-10 sm:p-16 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
         <div className="absolute top-0 left-0 p-8 opacity-20"><Sparkles className="h-12 w-12 text-gold-500" /></div>
         <div className="space-y-4 text-center md:text-start relative z-10">
            <h2 className="text-3xl font-black text-white">{isArabic ? "هل أنت حرفي متميز؟" : "Are you a master technician?"}</h2>
            <p className="text-onyx-400 max-w-md">{isArabic ? "انضم إلى أُسطفاي وابدأ في بناء مستقبلك المهني مع أفضل العملاء في مصر." : "Join Ostafy and start building your career with the best clients in Egypt."}</p>
         </div>
         <Link href={`/${locale}/register/worker`} className="btn-gold px-10 h-14 flex items-center gap-3 relative z-10">
            {isArabic ? "سجل الآن كأُسطفاي" : "Register as Ostafy Master"}
            {isArabic ? <ArrowLeft className="h-5 w-5" /> : <ArrowRight className="h-5 w-5" />}
         </Link>
      </section>
    </div>
  );
}
