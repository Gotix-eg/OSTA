"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ArrowRight } from "lucide-react";
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
  electrical: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=1000&auto=format&fit=crop",
  electricity: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=1000&auto=format&fit=crop",
  plumbing: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?q=80&w=1000&auto=format&fit=crop",
  carpentry: "https://images.unsplash.com/photo-1601058268499-e52658b8bb88?q=80&w=1000&auto=format&fit=crop",
  ac: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?q=80&w=1000&auto=format&fit=crop",
  "ac-maintenance": "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?q=80&w=1000&auto=format&fit=crop",
  "ac-technician": "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?q=80&w=1000&auto=format&fit=crop",
  painting: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?q=80&w=1000&auto=format&fit=crop",
  appliances: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=1000&auto=format&fit=crop",
  "appliance-repair": "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=1000&auto=format&fit=crop",
  aluminum: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1000&auto=format&fit=crop",
  networks: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=1000&auto=format&fit=crop",
  "computer-networks": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=1000&auto=format&fit=crop",
  computer: "https://images.unsplash.com/photo-1588508065123-287b28e013da?q=80&w=1000&auto=format&fit=crop",
  "computer-repair": "https://images.unsplash.com/photo-1588508065123-287b28e013da?q=80&w=1000&auto=format&fit=crop",
  cctv: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?q=80&w=1000&auto=format&fit=crop",
  cameras: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?q=80&w=1000&auto=format&fit=crop",
  "camera-installation": "https://images.unsplash.com/photo-1557597774-9d273605dfa9?q=80&w=1000&auto=format&fit=crop",
  tiling: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1000&auto=format&fit=crop",
  ceramic: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1000&auto=format&fit=crop",
  plastering: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=1000&auto=format&fit=crop",
  ironwork: "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?q=80&w=1000&auto=format&fit=crop",
  finishing: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1000&auto=format&fit=crop",
  gypsum: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1000&auto=format&fit=crop",
  moving: "https://images.unsplash.com/photo-1600518464441-9154a4dea21b?q=80&w=1000&auto=format&fit=crop",
  cleaning: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1000&auto=format&fit=crop",
  "car-mechanic": "https://images.unsplash.com/photo-1486006920555-c77dce18193b?q=80&w=1000&auto=format&fit=crop",
  "bike-mechanic": "https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=1000&auto=format&fit=crop",
  "engine-repair": "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?q=80&w=1000&auto=format&fit=crop",
  elevators: "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?q=80&w=1000&auto=format&fit=crop",
  "car-body": "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=1000&auto=format&fit=crop",
  "car-keys": "https://images.unsplash.com/photo-1582139329536-e7284fece509?q=80&w=1000&auto=format&fit=crop",
  gas: "https://images.unsplash.com/photo-1542013936693-884638332954?q=80&w=1000&auto=format&fit=crop",
  pools: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?q=80&w=1000&auto=format&fit=crop",
  handyman: "https://images.unsplash.com/photo-1508873696983-2df515122519?q=80&w=1000&auto=format&fit=crop",
  tailoring: "/images/services/tailoring.png",
  upholstery: "/images/services/upholstery.png",
  glass: "https://images.unsplash.com/photo-1509644851169-2acc08aa25b5?q=80&w=1000&auto=format&fit=crop",
  curtains: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1000&auto=format&fit=crop",
  flooring: "https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?q=80&w=1000&auto=format&fit=crop",
  satellite: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?q=80&w=1000&auto=format&fit=crop",
  "smart-home": "https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=1000&auto=format&fit=crop",
  insulation: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=1000&auto=format&fit=crop",
  solar: "https://images.unsplash.com/photo-1509391365360-2e959784a276?q=80&w=1000&auto=format&fit=crop",
  gardening: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=1000&auto=format&fit=crop"
};

const serviceDescriptions: Record<string, { ar: string; en: string }> = {
  electrical: { ar: "إصلاح الأعطال الكهربائية، وتمديد الدوائر، وتركيب المفاتيح والإضاءة بأمان.", en: "Expert wiring, circuit repairs, breaker installation, and electrical safety." },
  electricity: { ar: "إصلاح الأعطال الكهربائية، وتمديد الدوائر، وتركيب المفاتيح والإضاءة بأمان.", en: "Expert wiring, circuit repairs, breaker installation, and electrical safety." },
  plumbing: { ar: "كشف التسريبات، إصلاح المواسير والحنفيات، وصيانة السخانات والسباكة.", en: "Leak detection, pipe repairs, faucet installation, and water heater care." },
  carpentry: { ar: "تفصيل وإصلاح الأثاث الخشبي، تركيب الأبواب، والمطابخ والأرفف.", en: "Custom furniture, door installation, cabinet fitting, and wood repair." },
  ac: { ar: "صيانة، تنظيف، شحن فريون، وتركيب جميع أنواع التكييفات.", en: "AC installation, deep cleaning, freon refill, and maintenance." },
  "ac-maintenance": { ar: "صيانة، تنظيف، شحن فريون، وتركيب جميع أنواع التكييفات.", en: "AC installation, deep cleaning, freon refill, and maintenance." },
  painting: { ar: "تشطيب دهانات الحوائط، ديكورات حديثة، وورق حائط بألوان ممتازة.", en: "Interior & exterior wall painting, decorative finishes, and wallpaper." },
  appliances: { ar: "صيانة وإصلاح الثلاجات، الغسالات، البوتاجازات، والميكروويف.", en: "Repairing washers, refrigerators, gas stoves, and home appliances." },
  "appliance-repair": { ar: "صيانة وإصلاح الثلاجات، الغسالات، البوتاجازات، والميكروويف.", en: "Repairing washers, refrigerators, gas stoves, and home appliances." },
  aluminum: { ar: "تصنيع وصيانة مطابخ، شبابيك، وأبواب الألوميتال والزجاج.", en: "Fabrication and repair of aluminum windows, doors, and kitchens." },
  networks: { ar: "تأسيس وتقوية شبكات الواي فاي (WiFi) وتمديد كابلات الإنترنت للمنازل والمكاتب.", en: "WiFi network setup, signal boosting, and Cat6 cable routing for home & office." },
  "computer-networks": { ar: "تأسيس وتقوية شبكات الواي فاي (WiFi) وتمديد كابلات الإنترنت للمنازل والمكاتب.", en: "WiFi network setup, signal boosting, and Cat6 cable routing for home & office." },
  computer: { ar: "صيانة اللاب توب والكمبيوتر، تنظيف الأجهزة، إصلاح الهاردوير والسوفتوير.", en: "Laptop and PC repair, software troubleshooting, hardware upgrades, and maintenance." },
  "computer-repair": { ar: "صيانة اللاب توب والكمبيوتر، تنظيف الأجهزة، إصلاح الهاردوير والسوفتوير.", en: "Laptop and PC repair, software troubleshooting, hardware upgrades, and maintenance." },
  cctv: { ar: "تركيب وصيانة نظام كاميرات المراقبة DVR/NVR وربطها بالموبايل.", en: "CCTV camera system installation, DVR configuration, and mobile remote monitoring." },
  cameras: { ar: "تركيب وصيانة نظام كاميرات المراقبة DVR/NVR وربطها بالموبايل.", en: "CCTV camera system installation, DVR configuration, and mobile remote monitoring." },
  "camera-installation": { ar: "تركيب وصيانة نظام كاميرات المراقبة DVR/NVR وربطها بالموبايل.", en: "CCTV camera system installation, DVR configuration, and mobile remote monitoring." },
  tiling: { ar: "تركيب وتجديد أرضيات وحوائط السيراميك والبورسلين والرخام.", en: "Ceramic, porcelain, and marble floor and wall tile installation." },
  ceramic: { ar: "تركيب وتجديد أرضيات وحوائط السيراميك والبورسلين والرخام.", en: "Ceramic, porcelain, and marble floor and wall tile installation." },
  plastering: { ar: "أعمال المحارة، التلييس والتنعيم، وتجهيز الحوائط للدهان.", en: "Wall plastering, smoothing, rendering, and painting prep." },
  ironwork: { ar: "تصنيع وتركيب البوابات الحديدية، حمايات الشبابيك، والدرابزين.", en: "Fabrication and installation of iron gates, window security grills, and handrails." },
  finishing: { ar: "تشطيب متكامل للشقق والفيلات والمحلات التجارية تسليم على المفتاح.", en: "Turnkey apartment and commercial renovation and finishing services." },
  gypsum: { ar: "تركيب الأسقف المعلقة، الشاشات، وديكورات الجبس بورد الحديثة.", en: "Gypsum board false ceilings, TV wall units, and modern ceiling decor." },
  moving: { ar: "فك ونقل وتغليف العفش والأثاث بسيارات مجهزة مع عمالة ماهرة.", en: "Furniture dismantling, protective packing, and moving services." },
  cleaning: { ar: "تنظيف وتعقيم المنازل والواجهات، جلي الأرضيات وتنظيف السجاد.", en: "Residential deep cleaning, sanitization, carpet washing, and floor polishing." },
  "car-mechanic": { ar: "صيانة وإصلاح محركات السيارات، الفحص الكمبيوتري والكهرباء.", en: "Auto mechanic repair, computer diagnostics, engine service, and brake repair." },
  "bike-mechanic": { ar: "صيانة وإصلاح جميع أنواع الموتوسيكلات والاسكوترات والسيور.", en: "Motorcycle and scooter repair, maintenance, and tuning." },
  "engine-repair": { ar: "صيانة وإعادة لف مواتير المياه، والمولدات والمضخات الكهربائية.", en: "Electric water pump motor repair, generator maintenance, and rewinding." },
  elevators: { ar: "صيانة وتركيب وتحديث المصاعد الكهربائية والإنقاذ الطارئ.", en: "Elevator installation, routine safety maintenance, and emergency repair." },
  "car-body": { ar: "سمكرة وتعديل صدمات السيارات بدون تكسير ودهان دوكو وتلميع.", en: "Auto body dent repair, spray painting, detailing, and bumper fix." },
  "car-keys": { ar: "نسخ وتشفير مفاتيح السيارات الحديثة وفتح الأبواب المغلقة.", en: "Car key duplication, transponder programming, and lockout assistance." },
  gas: { ar: "وصلات وتمديدات الغاز الطبيعي وصيانة سخانات الغاز والبوتاجازات.", en: "Natural gas piping, gas water heater maintenance, and stove connections." },
  pools: { ar: "تنظيف وتعقيم حمامات السباحة وصيانة فلاتر ومضخات المياه.", en: "Swimming pool cleaning, water treatment, and filter/pump maintenance." },
  handyman: { ar: "تركيب شاشات، أرفف، لوحات، ومعالجة الأعطال المنزلية البسيطة.", en: "TV mounting, shelf fitting, drill work, and general household fixes." },
  tailoring: { ar: "تفصيل وتقصير وخياطة الملابس، وتعديل المقاسات وإصلاح الأقمشة.", en: "Custom garment tailoring, clothing repairs, alterations, and custom fitting." },
  upholstery: { ar: "تنجيد وتجديد الأنتريهات والصالونات، تغيير الإسفنج والقماش وتصليح الأثاث.", en: "Sofa and armchair upholstery, cushion re-padding, and fabric replacement." },
  glass: { ar: "تركيب وتقطيع الزجاج والمرايا، كبائن الشاور، وواجهات الزجاج.", en: "Glass and mirror installation, shower enclosures, and glass facades." },
  curtains: { ar: "تفصيل وتركيب الستائر، مواسير الستائر، والستائر المكتبية الذكية.", en: "Custom curtain tailoring, rod installation, and smart blinds fitting." },
  flooring: { ar: "تركيب وصيانة أرضيات الباركيه، HDF، والأرضيات الخشبية.", en: "Parquet, HDF, and hardwood flooring installation and polishing." },
  satellite: { ar: "تركيب وضبط أطباق الدش، تمديد السلوك، وترتيب القنوات.", en: "Satellite dish installation, cable wiring, and receiver tuning." },
  "smart-home": { ar: "تركيب أنظمة الانتركم، الأقفال الذكية، وأجهزة الحماية المنزلية.", en: "Intercom installation, smart door lock fitting, and home security." },
  insulation: { ar: "عزل الأسطح والحمامات من تسريب المياه وحرارة الشمس.", en: "Roof and bathroom waterproofing, thermal insulation, and leak proofing." },
  solar: { ar: "تركيب وصيانة ألواح وسخانات الطاقة الشمسية وأنظمة الكهرباء البديلة.", en: "Solar panel installation, solar water heater repair, and clean energy setups." },
  gardening: { ar: "تنسيق الحدائق، تقليم الأشجار، تركيب النجيل الطبيعي والشبكات.", en: "Landscape design, lawn mowing, tree trimming, and garden irrigation." }
};

export function ServicesListing({ locale }: { locale: Locale }) {
  const isArabic = locale === "ar";
  const categories = useLiveApiData<ServiceCategory[]>("/services/categories", []);

  const [searchQuery, setSearchQuery] = useState("");
  const safeCategories = Array.isArray(categories) ? categories.filter(Boolean) : [];

  const filteredCategories = safeCategories.filter(cat => {
    const name = isArabic ? (cat.nameAr || cat.nameEn || "") : (cat.nameEn || cat.nameAr || "");
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen w-full bg-gold px-4 pb-28 pt-6 text-[#1a1c1c] md:px-12 md:py-24">
      {/* Hero Search Section */}
      <div className="mx-auto mb-8 max-w-7xl space-y-5 text-start md:mb-16 md:space-y-8 md:text-center">
        <span className="inline-flex bg-black px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-gold">
          {isArabic ? "الخدمات" : "Services"}
        </span>
        <h1 className="font-display-lg text-4xl font-black leading-tight text-[#1a1c1c] md:text-6xl">
          {isArabic ? "ماذا يمكننا أن نفعل لك؟" : "What can we do for you?"}
        </h1>
        <p className="max-w-2xl text-base font-bold leading-7 text-[#1a1c1c]/75 md:mx-auto md:text-lg md:leading-8">
          {isArabic
            ? "اختر الخدمة المناسبة، وابحث عن فنيين موثوقين بالقرب منك."
            : "Choose the right service and find verified professionals near you."}
        </p>
        <div className="group relative mx-auto max-w-2xl">
          <div className="pointer-events-none absolute inset-y-0 left-4 z-25 flex items-center rtl:left-auto rtl:right-4">
            <Search className="h-5 w-5 text-[#1a1c1c] md:h-6 md:w-6" />
          </div>
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-14 w-full border-2 border-[#1a1c1c] bg-white px-12 text-sm font-black text-black placeholder:text-[#1a1c1c]/40 transition-all focus:outline-none focus:ring-0 md:h-auto md:border-4 md:py-5 md:pl-14 md:pr-24 md:text-lg"
            placeholder={isArabic ? "ابحث عن خدمة (سباكة، كهرباء، نجارة)..." : "Search for experts (e.g., Plumbing, Electrician)..."}
          />
          <button className="absolute right-2 top-1/2 h-10 -translate-y-1/2 bg-[#1a1c1c] px-4 text-xs font-black uppercase text-white transition-colors hover:bg-[#1a1c1c]/80 rtl:left-2 rtl:right-auto md:right-4 md:px-6 md:text-sm">
            {isArabic ? "ابدأ" : "GO"}
          </button>
        </div>
      </div>

      {/* Services Bento/Grid */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
        {filteredCategories.map((cat) => {
          const imgUrl = cat.imageUrl || serviceImages[cat.slug] || serviceImages[cat.icon] || "https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=800&auto=format&fit=crop";
          const desc = serviceDescriptions[cat.slug] || serviceDescriptions[cat.icon] || { ar: "صيانة منزلية عالية الجودة وأعمال تشطيبات معتمدة.", en: "High-quality home maintenance and verified craftsmanship." };
          return (
            <div key={cat.id} className="group flex min-h-[320px] flex-col justify-between overflow-hidden rounded-none border border-white/10 bg-black text-white md:min-h-[460px] md:p-6">
              <div>
                <div className="relative mb-4 aspect-[16/10] w-full overflow-hidden md:mb-6 md:aspect-video">
                  <img 
                    src={imgUrl} 
                    alt="" 
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent md:hidden" />
                  {cat.slug === "electrical" && (
                    <div className="absolute top-4 left-4 bg-gold text-[#1a1c1c] px-3 py-1 text-xs font-black rounded-none">
                      {isArabic ? "عاجل" : "URGENT"}
                    </div>
                  )}
                  {cat.slug === "appliances" && (
                    <div className="absolute top-4 left-4 bg-white text-[#1a1c1c] px-3 py-1 text-xs font-black rounded-none">
                      {isArabic ? "مميز" : "FEATURED"}
                    </div>
                  )}
                </div>
                <div className="px-5 pb-5 md:px-0 md:pb-0">
                <h3 className="mb-2 text-2xl font-black text-white">
                  {isArabic ? cat.nameAr : cat.nameEn}
                </h3>
                <p className="mb-5 text-sm font-semibold leading-relaxed text-neutral-400 md:mb-6 md:font-light">
                  {isArabic ? desc.ar : desc.en}
                </p>
                </div>
              </div>
              <Link 
                href={`/${locale}/services/${cat.slug}`} 
                className="mx-5 mb-5 flex min-h-11 items-center gap-2 bg-gold px-4 text-xs font-black uppercase tracking-wider text-black transition-all group-hover:gap-4 md:mx-0 md:mb-0 md:bg-transparent md:px-0 md:text-gold"
              >
                {isArabic ? "استكشف الخدمة" : "EXPLORE"} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          );
        })}
      </div>

      {/* CTA Banner */}
      <div className="max-w-7xl mx-auto mt-16 bg-[#1a1c1c] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 border border-white/10 text-white text-start rounded-none">
        <div>
          <h2 className="text-2xl font-black text-gold mb-2">
            {isArabic ? "هل أنت فني محترف؟" : "Are you a master technician?"}
          </h2>
          <h3 className="text-2xl font-black text-white">
            {isArabic ? "انضم إلى شبكة فنيين أُسطفاي" : "Join the OSTA craftsman network"}
          </h3>
          <p className="text-neutral-400 mt-4 text-sm font-light">
            {isArabic
              ? "وسع شغلك، واستقبل طلبات مناسبة، وابنِ سمعتك مع عملاء حقيقيين."
              : "Grow your business, receive qualified requests, and build your reputation with real clients."}
          </p>
        </div>
        <Link 
          href={`/${locale}/register/worker`} 
          className="bg-white text-[#1a1c1c] font-black px-12 py-4 sticker-shadow hover:bg-neutral-100 transition-all whitespace-nowrap text-center rounded-none"
        >
          {isArabic ? "سجل الآن" : "REGISTER NOW"}
        </Link>
      </div>
    </div>
  );
}
