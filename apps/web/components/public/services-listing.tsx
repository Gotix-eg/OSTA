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
  electrical: "/images/services/electrical.png",
  electricity: "/images/services/electrical.png",
  plumbing: "/images/services/plumbing.png",
  carpentry: "/images/services/carpentry.png",
  ac: "/images/services/ac.png",
  "ac-maintenance": "/images/services/ac.png",
  "ac-technician": "/images/services/ac.png",
  painting: "/images/services/painting.png",
  appliances: "/images/services/appliances.png",
  "appliance-repair": "/images/services/appliances.png",
  aluminum: "/images/services/aluminum.png",
  networks: "/images/services/networks.png",
  "computer-networks": "/images/services/networks.png",
  computer: "/images/services/computer.png",
  "computer-repair": "/images/services/computer.png",
  cctv: "/images/services/cctv.png",
  cameras: "/images/services/cctv.png",
  "camera-installation": "/images/services/cctv.png",
  tiling: "/images/services/tiling.png",
  ceramic: "/images/services/tiling.png",
  plastering: "/images/services/plastering.png",
  ironwork: "/images/services/ironwork.png",
  finishing: "/images/services/finishing.png",
  gypsum: "/images/services/gypsum.png",
  moving: "/images/services/moving.png",
  cleaning: "/images/services/cleaning.png",
  "car-mechanic": "/images/services/car-mechanic.png",
  "bike-mechanic": "/images/services/bike-mechanic.png",
  "engine-repair": "/images/services/engine-repair.png",
  elevators: "/images/services/engine-repair.png",
  "car-body": "/images/services/car-mechanic.png",
  "car-keys": "/images/services/car-mechanic.png",
  gas: "/images/services/plumbing.png",
  pools: "/images/services/plumbing.png",
  handyman: "/images/services/carpentry.png",
  tailoring: "/images/services/tailoring.png",
  upholstery: "/images/services/upholstery.png",
  glass: "/images/services/aluminum.png",
  curtains: "/images/services/tailoring.png",
  flooring: "/images/services/tiling.png",
  satellite: "/images/services/cctv.png",
  "smart-home": "/images/services/networks.png",
  insulation: "/images/services/plastering.png",
  solar: "/images/services/electrical.png",
  gardening: "/images/services/cleaning.png"
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
          const rawImg = cat.imageUrl;
          const mappedImg = serviceImages[cat.slug] || serviceImages[cat.icon];
          const imgUrl = (rawImg && rawImg.startsWith("/images/")) ? rawImg : mappedImg || "/images/services/electrical.png";
          const desc = serviceDescriptions[cat.slug] || serviceDescriptions[cat.icon] || { ar: "صيانة منزلية عالية الجودة وأعمال تشطيبات معتمدة.", en: "High-quality home maintenance and verified craftsmanship." };
          return (
            <div key={cat.id} className="group flex min-h-[320px] flex-col justify-between overflow-hidden rounded-none border border-white/10 bg-black text-white md:min-h-[460px] md:p-6">
              <div>
                <div className="relative mb-4 aspect-[16/10] w-full overflow-hidden md:mb-6 md:aspect-video">
                  <img 
                    src={imgUrl} 
                    alt="" 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/images/services/electrical.png";
                    }}
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
