"use client";

import Link from "next/link";
import { 
  Hammer, Droplets, Zap, Wind, Settings, 
  PaintBucket, Layout, Network, Monitor, Camera,
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
}

const serviceImages: Record<string, string> = {
  electrical: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=800&auto=format&fit=crop",
  plumbing: "https://images.unsplash.com/photo-1594918589744-4efe14a629b7?auto=format&fit=crop&w=800&q=80",
  carpentry: "https://images.unsplash.com/photo-1497219055242-93359eeed651?auto=format&fit=crop&w=800&q=80",
  ac: "https://images.unsplash.com/photo-1621905252507-b352224075b8?auto=format&fit=crop&w=800&q=80",
  "ac-maintenance": "https://images.unsplash.com/photo-1621905252507-b352224075b8?auto=format&fit=crop&w=800&q=80",
  appliances: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=800&auto=format&fit=crop",
  painting: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?q=80&w=800&auto=format&fit=crop",
  aluminum: "https://images.unsplash.com/photo-1554232456-8727aae0cfa4?q=80&w=800&auto=format&fit=crop",
  networks: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=800&auto=format&fit=crop",
  computer: "https://images.unsplash.com/photo-1588508065123-287b28e013da?q=80&w=800&auto=format&fit=crop",
  "computer-repair": "https://images.unsplash.com/photo-1588508065123-287b28e013da?q=80&w=800&auto=format&fit=crop",
  cameras: "https://images.unsplash.com/photo-1525417071002-5ee4e6bb44f7?auto=format&fit=crop&w=800&q=80",
  cctv: "https://images.unsplash.com/photo-1525417071002-5ee4e6bb44f7?auto=format&fit=crop&w=800&q=80"
};

const iconMap: Record<string, any> = {
  hammer: Hammer,
  droplets: Droplets,
  zap: Zap,
  wind: Wind,
  settings: Settings,
  "paint-bucket": PaintBucket,
  layout: Layout,
  network: Network,
  monitor: Monitor,
  camera: Camera
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
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {categories.length === 0 ? (
          // Fallback placeholders if API is empty
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="onyx-card h-48 animate-pulse border-onyx-800 bg-onyx-800/20" />
          ))
        ) : (
          categories.map((cat) => {
            const Icon = iconMap[cat.icon] || Settings;
            const imgUrl = serviceImages[cat.slug] || serviceImages[cat.icon] || "https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=800&auto=format&fit=crop";
            return (
              <Link 
                key={cat.id} 
                href={`/${locale}/services/${cat.slug}`}
                className="onyx-card p-0 group hover:-translate-y-2 hover:border-gold-500/30 transition-all duration-500 overflow-hidden min-h-[220px] relative"
              >
                <img 
                  src={imgUrl} 
                  alt={isArabic ? cat.nameAr : cat.nameEn}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-onyx-950 via-onyx-950/40 to-transparent" />
                
                <div className="relative p-8 h-full flex flex-col justify-end">
                  <div className="h-12 w-12 rounded-xl bg-gold-500 flex items-center justify-center text-onyx-950 mb-4 group-hover:scale-110 transition-transform duration-500">
                    <Icon className="h-5 w-5" />
                  </div>

                  <h3 className="text-xl font-black text-white mb-2 group-hover:text-gold-500 transition-colors">
                    {isArabic ? cat.nameAr : cat.nameEn}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-xs font-black text-gold-500/80 group-hover:text-gold-500 transition-colors">
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
            <p className="text-onyx-400 max-w-md">{isArabic ? "انضم إلى أُسطى وابدأ في بناء مستقبلك المهني مع أفضل العملاء في مصر." : "Join OSTA and start building your career with the best clients in Egypt."}</p>
         </div>
         <Link href={`/${locale}/register/worker`} className="btn-gold px-10 h-14 flex items-center gap-3 relative z-10">
            {isArabic ? "سجل الآن كأُسطى" : "Register as OSTA Master"}
            {isArabic ? <ArrowLeft className="h-5 w-5" /> : <ArrowRight className="h-5 w-5" />}
         </Link>
      </section>
    </div>
  );
}
