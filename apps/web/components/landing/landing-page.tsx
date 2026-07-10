"use client";

import { motion } from "framer-motion";
import { 
  Zap, Waves, Hammer, Wind, Smartphone, 
  Palette, Layout, Globe, Monitor, Camera, 
  ChevronRight, ArrowLeft, Star, ShieldCheck, MapPin,
  Store, Users, CheckCircle2, Menu, X,
  Facebook, Instagram, Phone, Mail,
  Droplets, Wrench, PaintBucket, Network, Settings,
  Megaphone, Grid, Layers, Truck, Sparkles
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/locales";
import { LocaleSwitcher } from "@/components/shared/locale-switcher";
import { useLiveApiData } from "@/hooks/use-live-api-data";
import { egyptianGovernorates, majorCities } from "@/lib/geo-data";
import { resolveApiBaseUrl } from "@/lib/api";
import { getBrowserAuthState } from "@/lib/auth-client";
import { MobileHeroSlider } from "@/components/landing/mobile-hero-slider";

function getCategoryColor(slug: string): string {
  const colors: Record<string, string> = {
    electricity: "from-yellow-400 to-gold-600",
    electrical: "from-yellow-400 to-gold-600",
    plumbing: "from-blue-400 to-blue-600",
    carpentry: "from-amber-600 to-amber-800",
    ac: "from-cyan-400 to-cyan-600",
    "ac-maintenance": "from-cyan-400 to-cyan-600",
    appliances: "from-purple-400 to-purple-600",
    painting: "from-rose-400 to-rose-600",
    aluminum: "from-slate-400 to-slate-600",
    networks: "from-indigo-400 to-indigo-600",
    computer: "from-emerald-400 to-emerald-600",
    "computer-repair": "from-emerald-400 to-emerald-600",
    cctv: "from-red-400 to-red-600",
    cameras: "from-red-400 to-red-600",
    tiling: "from-cyan-600 to-cyan-800",
    plastering: "from-orange-500 to-orange-700",
    ironwork: "from-neutral-600 to-neutral-800",
    finishing: "from-teal-600 to-teal-800",
    gypsum: "from-amber-500 to-amber-700",
    moving: "from-sky-500 to-sky-700",
    cleaning: "from-green-500 to-green-700",
    "car-mechanic": "from-red-500 to-red-700",
    "bike-mechanic": "from-orange-500 to-orange-700",
    "engine-repair": "from-blue-500 to-blue-700",
  };
  return colors[slug] || "from-gold-400 to-gold-600";
}

const iconMap: Record<string, any> = {
  Zap, Waves, Hammer, Wind, Smartphone, Palette, Layout, Globe, Monitor, Camera, Droplets, Wrench, PaintBucket, Network, Settings, Grid, Layers
};

const CRAFTS = [
  { id: "electricity", name: { ar: "الكهرباء", en: "Electrical" }, image: "/images/services/electrical.png", color: "from-yellow-400 to-gold-600", icon: Zap },
  { id: "plumbing", name: { ar: "السباكة", en: "Plumbing" }, image: "/images/services/plumbing.png", color: "from-blue-400 to-blue-600", icon: Droplets },
  { id: "carpentry", name: { ar: "النجارة", en: "Carpentry" }, image: "/images/services/carpentry.png", color: "from-amber-600 to-amber-800", icon: Hammer },
  { id: "ac", name: { ar: "التكييفات", en: "AC Maintenance" }, image: "/images/services/ac.png", color: "from-cyan-400 to-cyan-600", icon: Wind },
  { id: "appliances", name: { ar: "صيانة أجهزة", en: "Home Appliances" }, image: "/images/services/appliances.png", color: "from-purple-400 to-purple-600", icon: Wrench },
  { id: "painting", name: { ar: "الدهانات", en: "Painting" }, image: "/images/services/painting.png", color: "from-rose-400 to-rose-600", icon: PaintBucket },
  { id: "aluminum", name: { ar: "الوميتال", en: "Aluminum" }, image: "/images/services/aluminum.png", color: "from-slate-400 to-slate-600", icon: Layout },
  { id: "networks", name: { ar: "الشبكات", en: "Networks" }, image: "/images/services/networks.png", color: "from-indigo-400 to-indigo-600", icon: Network },
  { id: "computer-repair", name: { ar: "صيانة كمبيوتر", en: "Computer" }, image: "/images/services/computer.png", color: "from-emerald-400 to-emerald-600", icon: Monitor },
  { id: "cctv", name: { ar: "تركيب كاميرات", en: "CCTV" }, image: "/images/services/cctv.png", color: "from-red-400 to-red-600", icon: Camera },
  { id: "tiling", name: { ar: "مبلط سيراميك", en: "Ceramic Tiling" }, image: "/images/services/tiling.png", color: "from-cyan-600 to-cyan-800", icon: Grid },
  { id: "plastering", name: { ar: "أعمال محارة", en: "Plastering" }, image: "/images/services/plastering.png", color: "from-orange-500 to-orange-700", icon: Layers },
  { id: "ironwork", name: { ar: "حدادة", en: "Ironwork" }, image: "/images/services/ironwork.png", color: "from-neutral-600 to-neutral-800", icon: Hammer },
  { id: "finishing", name: { ar: "تشطيبات شاملة", en: "Finishing" }, image: "/images/services/finishing.png", color: "from-teal-600 to-teal-800", icon: Layers },
  { id: "gypsum", name: { ar: "جبس بورد وديكور", en: "Gypsum Board" }, image: "/images/services/gypsum.png", color: "from-amber-500 to-amber-700", icon: Layout },
  { id: "moving", name: { ar: "نقل عفش وتغليف", en: "Furniture Moving" }, image: "/images/services/moving.png", color: "from-sky-500 to-sky-700", icon: Truck },
  { id: "cleaning", name: { ar: "تنظيف وتعقيم منازل", en: "Home Cleaning" }, image: "/images/services/cleaning.png", color: "from-green-500 to-green-700", icon: Sparkles },
  { id: "car-mechanic", name: { ar: "ميكانيكي سيارات", en: "Car Mechanic" }, image: "/images/services/car-mechanic.png", color: "from-red-500 to-red-700", icon: Settings },
  { id: "bike-mechanic", name: { ar: "ميكانيكي موتوسيكلات", en: "Motorcycle Mechanic" }, image: "/images/services/bike-mechanic.png", color: "from-orange-500 to-orange-700", icon: Settings },
  { id: "engine-repair", name: { ar: "صيانة مواتير", en: "Engine Repair" }, image: "/images/services/engine-repair.png", color: "from-blue-500 to-blue-700", icon: Hammer },
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

function cleanImageUrl(url: string): string {
  if (!url) return "";
  let cleaned = url.trim();
  
  if (cleaned.startsWith("/") && cleaned.includes(".com")) {
    cleaned = "https://" + cleaned.substring(1);
  }
  
  if (!cleaned.startsWith("http://") && !cleaned.startsWith("https://") && !cleaned.startsWith("data:") && !cleaned.startsWith("/")) {
    cleaned = "https://" + cleaned;
  }
  
  return cleaned;
}
const DEFAULT_SLIDES = [
  {
    id: "slide-1",
    eyebrowAr: "منصة الحرفيين رقم 1 في مصر",
    eyebrowEn: "Egypt's #1 Craftsman Platform",
    titleAr: "اطلب أُسطفاي محترف بنقرة واحدة",
    titleEn: "Hire a Professional Ostafy in Seconds",
    descAr: "أول منصة تجمع أمهر الفنيين والمتاجر الموثقة في مصر. جودة مضمونة، أسعار عادلة، وتجربة مستخدم فاخرة.",
    descEn: "The first platform connecting skilled pros and verified stores in Egypt. Guaranteed quality, fair prices, and a premium experience.",
    imageUrl: "",
    btn1TextAr: "انضم كصنايعي",
    btn1TextEn: "Join as Pro",
    btn1Link: "/register/worker",
    btn2TextAr: "انضم كمتجر",
    btn2TextEn: "Join as Vendor",
    btn2Link: "/register/vendor",
    isActive: true
  },
  {
    id: "slide-2",
    eyebrowAr: "ضمان حقيقي ودفع آمن",
    eyebrowEn: "True Guarantee & Secure Pay",
    titleAr: "صيانة منزلية بدون قلق أو مفاجآت",
    titleEn: "Home Maintenance Without Worry",
    descAr: "نظام دفع محتجز بالكامل (Escrow) يحمي أموالك حتى اكتمال العمل ورضاك التام عن الخدمة.",
    descEn: "A secure escrow payment system that protects your money until the work is completed and you are fully satisfied.",
    imageUrl: "",
    btn1TextAr: "اطلب فني الآن",
    btn1TextEn: "Book Pro Now",
    btn1Link: "/register/client",
    btn2TextAr: "تصفح الخدمات",
    btn2TextEn: "Browse Services",
    btn2Link: "/services",
    isActive: true
  }
];


export function LandingPage({ locale }: { locale: Locale }) {
  const isArabic = locale === "ar";
  const liveCategories = useLiveApiData<any[]>("/services/categories", []);

  const displayCrafts = liveCategories.length > 0
    ? liveCategories.map((cat) => {
        const localCraft = CRAFTS.find((c) => c.id === cat.slug || (c.id === "electricity" && cat.slug === "electrical"));
        return {
          id: cat.slug,
          name: { ar: cat.nameAr, en: cat.nameEn },
          image: localCraft?.image || cat.imageUrl || "https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=800&auto=format&fit=crop",
          color: getCategoryColor(cat.slug),
          icon: iconMap[cat.icon] || Settings,
        };
      })
    : CRAFTS;

  const pathname = usePathname() || "";
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [slides, setSlides] = useState<any[]>(DEFAULT_SLIDES);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [campaigns, setCampaigns] = useState<any[]>([]);

  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("");
  const [selectedGov, setSelectedGov] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedArea, setSelectedArea] = useState<string>("");
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const sponsoredWorkers = useMemo(() => {
    return [...workers]
      .sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return 0;
      })
      .slice(0, 9);
  }, [workers]);

  const [selectedWorkerForBooking, setSelectedWorkerForBooking] = useState<any | null>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [isClient, setIsClient] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const [publicRequests, setPublicRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState<boolean>(false);
  const [selectedRequestSpecialty, setSelectedRequestSpecialty] = useState<string>("");
  const [showWorkerAuthModal, setShowWorkerAuthModal] = useState<boolean>(false);
  const [selectedRequestForAccept, setSelectedRequestForAccept] = useState<any | null>(null);
  const [isWorker, setIsWorker] = useState<boolean>(false);

  const [visibleWorkersLimit, setVisibleWorkersLimit] = useState<number>(3);
  const [visibleRequestsLimit, setVisibleRequestsLimit] = useState<number>(3);

  useEffect(() => {
    // Load slides from database API — same data for ALL browsers/devices
    const baseUrl = resolveApiBaseUrl();
    fetch(`${baseUrl}/public/slides`)
      .then(r => r.json())
      .then(payload => {
        if (payload.success && Array.isArray(payload.data) && payload.data.length > 0) {
          const active = payload.data.filter((s: any) => s.isActive !== false);
          setSlides(active.length > 0 ? active : DEFAULT_SLIDES);
        } else {
          setSlides(DEFAULT_SLIDES);
        }
      })
      .catch(() => setSlides(DEFAULT_SLIDES));

    fetch(`${baseUrl}/public/campaigns`)
      .then(r => r.json())
      .then(payload => {
        if (payload.success && Array.isArray(payload.data)) {
          setCampaigns(payload.data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides]);

  useEffect(() => {
    getBrowserAuthState().then(({ isLoggedIn, role }) => {
      setIsLoggedIn(isLoggedIn);
      setIsClient(role === "CLIENT");
      setIsWorker(role === "WORKER");
    });
  }, []);

  const fetchWorkers = async () => {
    setLoading(true);
    setError(null);
    try {
      const baseUrl = resolveApiBaseUrl();
      const res = await fetch(`${baseUrl}/public/workers`, { cache: "no-store" });
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
      setLoading(false);
    }
  };

  useEffect(() => {
    // Defer workers fetch so it doesn't block first paint
    const t = setTimeout(() => fetchWorkers(), 800);
    return () => clearTimeout(t);
  }, []);

  const fetchPublicRequests = async () => {
    setLoadingRequests(true);
    try {
      const baseUrl = resolveApiBaseUrl();
      const res = await fetch(`${baseUrl}/public/requests`);
      if (!res.ok) {
        throw new Error("Failed to fetch public requests");
      }
      const data = await res.json();
      if (data.success) {
        setPublicRequests(data.data);
      } else {
        setPublicRequests([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    // Defer public requests fetch so it doesn't block first paint
    const t = setTimeout(() => fetchPublicRequests(), 1200);
    return () => clearTimeout(t);
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

  const handleAcceptRequestClick = (req: any) => {
    if (isLoggedIn) {
      if (isWorker) {
        window.location.assign(`/${locale}/worker`);
      } else {
        alert(isArabic ? "هذا الإجراء متاح لحسابات الفنيين فقط." : "Accepting requests is only available for technician accounts.");
      }
    } else {
      setSelectedRequestForAccept(req);
      setShowWorkerAuthModal(true);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const currentSlide = slides[currentSlideIndex] || slides[0] || {
    id: "default",
    eyebrowAr: "", eyebrowEn: "",
    titleAr: "", titleEn: "",
    descAr: "", descEn: "",
    imageUrl: "",
    btn1TextAr: "", btn1TextEn: "", btn1Link: "",
    btn2TextAr: "", btn2TextEn: "", btn2Link: "",
    isActive: true
  };

  return (
    <div className="bg-[#f0bb19] onyx-shell-bg selection:bg-gold-500 selection:text-onyx-950 overflow-x-hidden">
      {/* Mobile Hero Slider — shown ONLY on mobile (< 768px) */}
      <MobileHeroSlider locale={locale} />

      {/* Desktop Hero Section with Dynamic Background Slider — ONLY on md+ */}
      <section className="hidden md:flex relative pt-24 pb-20 px-4 min-h-[90vh] items-center justify-center overflow-hidden">
        {/* Background Images with smooth cross-fade transition */}
        {slides.map((slide, idx) => {
          const isCampaign = slide.eyebrowAr === "إعلان ممول" || slide.eyebrowEn === "Sponsored Ad";
          const slideBg = (
            <div
              className={cn(
                "absolute inset-0 bg-center transition-all duration-1000 ease-in-out z-0",
                isCampaign ? "bg-contain bg-no-repeat bg-onyx-950" : "bg-cover",
                idx === currentSlideIndex ? "opacity-100 scale-100 blur-none" : "opacity-0 scale-105"
              )}
              style={{ backgroundImage: `url('${cleanImageUrl(slide.imageUrl)}')` }}
            />
          );

          if (isCampaign) {
            const linkUrl = slide.btn1Link ? (slide.btn1Link.startsWith("http") ? slide.btn1Link : `/${locale}${slide.btn1Link.startsWith("/") ? "" : "/"}${slide.btn1Link}`) : "#";
            return (
              <Link
                key={slide.id}
                href={linkUrl}
                className={cn(
                  "absolute inset-0 transition-opacity duration-1000 z-10",
                  idx === currentSlideIndex ? "opacity-100 cursor-pointer pointer-events-auto" : "opacity-0 pointer-events-none"
                )}
              >
                {slideBg}
                {/* Small elegant Ad badge in the corner */}
                <div className="absolute top-28 right-8 z-40">
                  <span className="px-3 py-1 rounded bg-black/60 backdrop-blur-sm border border-white/10 text-gold-500 text-[10px] font-black uppercase tracking-wider shadow-md">
                    {isArabic ? "ممول" : "Sponsored"}
                  </span>
                </div>
              </Link>
            );
          }

          return slideBg;
        })}
        {/* Premium deep dark gradient overlay for text readability - ONLY for non-campaign slides */}
        {!(currentSlide.eyebrowAr === "إعلان ممول" || currentSlide.eyebrowEn === "Sponsored Ad") && (
          <div className="absolute inset-0 bg-gradient-to-t from-onyx-950 via-onyx-950/85 to-onyx-950/60 z-10" />
        )}

        {slides.length > 0 && !(currentSlide.eyebrowAr === "إعلان ممول" || currentSlide.eyebrowEn === "Sponsored Ad") && (
          <div className="max-w-5xl mx-auto text-center relative z-20 w-full">
            <motion.div 
              key={currentSlideIndex} // Triggers re-animation automatically on slide switch!
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              { (currentSlide.eyebrowAr || currentSlide.eyebrowEn) && (
                <span className="inline-block mb-4 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-gold-500 text-onyx-950 shadow-md">
                  {isArabic ? currentSlide.eyebrowAr : currentSlide.eyebrowEn}
                </span>
              )}
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[1.15] mb-6 tracking-tight">
                {isArabic ? currentSlide.titleAr : currentSlide.titleEn}
              </h1>
              <p className="text-onyx-200 text-base md:text-lg lg:text-xl max-w-3xl mx-auto mb-10 leading-relaxed font-light">
                {isArabic ? currentSlide.descAr : currentSlide.descEn}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                {currentSlide.btn1Link ? (
                  <>
                    <Link
                      href={currentSlide.btn1Link.startsWith("http") ? currentSlide.btn1Link : `/${locale}${currentSlide.btn1Link.startsWith("/") ? "" : "/"}${currentSlide.btn1Link}`}
                      className="w-full sm:w-auto btn-gold text-center py-4 px-8 text-lg shadow-lg shadow-gold-500/20"
                    >
                      {isArabic ? currentSlide.btn1TextAr || currentSlide.btn1Text : currentSlide.btn1TextEn || currentSlide.btn1Text}
                    </Link>
                    {currentSlide.btn2Link && (
                      <Link
                        href={currentSlide.btn2Link.startsWith("http") ? currentSlide.btn2Link : `/${locale}${currentSlide.btn2Link.startsWith("/") ? "" : "/"}${currentSlide.btn2Link}`}
                        className="w-full sm:w-auto btn-ghost text-center py-4 px-8 text-lg shadow-lg"
                      >
                        {isArabic ? currentSlide.btn2TextAr || currentSlide.btn2Text : currentSlide.btn2TextEn || currentSlide.btn2Text}
                      </Link>
                    )}
                  </>
                ) : (
                  <>
                    <Link href={`/${locale}/register/client`} className="w-full sm:w-auto btn-gold text-center py-4 px-8 text-lg shadow-lg shadow-gold-500/20">
                      {isArabic ? "اطلب صنايعي" : "Order a Pro"}
                    </Link>
                    <Link href={`/${locale}/register/worker`} className="w-full sm:w-auto btn-ghost text-center py-4 px-8 text-lg shadow-lg">
                      {isArabic ? "انضم كصنايعي" : "Join as Pro"}
                    </Link>
                    <Link href={`/${locale}/register/vendor`} className="w-full sm:w-auto btn-ghost text-center py-4 px-8 text-lg shadow-lg">
                      {isArabic ? "انضم كمتجر" : "Join as Vendor"}
                    </Link>
                  </>
                )}
              </div>

              <div className="mt-12 flex items-center justify-center gap-6">
                <div className="flex -space-x-3 rtl:space-x-reverse">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="h-10 w-10 rounded-full border-2 border-onyx-950 bg-onyx-800 flex items-center justify-center">
                      <Users className="h-5 w-5 text-gold-500" />
                    </div>
                  ))}
                </div>
                <div className="text-sm text-start">
                  <div className="flex items-center gap-1 text-gold-500 mb-0.5">
                    {[1,2,3,4,5].map(i => <Star key={i} className="h-3 w-3 fill-current" />)}
                  </div>
                  <p className="text-onyx-400">
                    {isArabic ? "أكثر من 50,000 عميل يثقون بنا" : "Trusted by 50k+ customers"}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Slider Dots indicators */}
        {slides.length > 1 && (
          <div className="absolute bottom-6 left-0 right-0 z-40 flex justify-center items-center gap-3">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlideIndex(idx)}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  idx === currentSlideIndex ? "bg-gold-500 w-8" : "bg-white/20 w-2 hover:bg-white/45"
                )}
              />
            ))}
          </div>
        )}
      </section>

      {/* Categories Grid */}
      <section className="py-24 px-4 bg-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-onyx-950 mb-4">
              {isArabic ? "خدماتنا الأساسية" : "Our Core Services"}
            </h2>
            <div className="h-1 w-24 bg-gold-500 mx-auto rounded-full" />
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6"
          >
            {displayCrafts.map((craft) => (
              <motion.div key={craft.id} variants={itemVariants}>
                <Link href={`/${locale}/services/${craft.id}`} className="group block p-4 rounded-[2rem] bg-[#111111] border border-white/10 hover:border-gold-500/60 hover:shadow-gold transition-all duration-500 hover:-translate-y-2">
                  <div className="h-48 w-full rounded-xl overflow-hidden mb-4 transition-transform duration-500 group-hover:scale-105 relative shadow-md">
                    <img 
                      src={craft.image} 
                      alt="" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                  <h3 className="text-base font-bold text-white mb-1 group-hover:text-gold-400 transition-colors px-1">
                    {isArabic ? craft.name.ar : craft.name.en}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-gold-500 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-[-4px] group-hover:translate-x-0 px-1">
                    {isArabic ? "اطلب الآن" : "Book Now"}
                    <ChevronRight className="h-3 w-3 rtl:rotate-180" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Worker Exploration Section */}
      <section className="py-20 px-4 bg-transparent relative border-b border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-gold-500 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/25">
              {isArabic ? "الفنيين المميزين" : "Featured Pros"}
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-onyx-950 mt-4 mb-4">
              {isArabic ? "أفضل فنيين وصنايعية موثقين ورعاة" : "Top Sponsored & Featured Pros"}
            </h2>
            <p className="text-onyx-700 max-w-2xl mx-auto text-base md:text-lg">
              {isArabic 
                ? "تصفح قائمة أمهر الفنيين الحاصلين على أعلى التقييمات والموثقين للبدء فوراً" 
                : "Browse our top-rated sponsored and verified technicians for immediate service."}
            </p>
            <div className="h-1 w-24 bg-gold-500 mx-auto rounded-full mt-6" />
          </div>

          {/* Loading / Error / Results states */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-onyx-400">
              <div className="h-10 w-10 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-sm font-medium">{isArabic ? "جاري البحث عن أفضل الفنيين..." : "Searching for the best pros..."}</p>
            </div>
          ) : error ? (
            <div className="text-center py-20 onyx-card border-red-500/20 bg-red-500/5 text-red-500 font-bold rounded-3xl">
              {error}
            </div>
          ) : sponsoredWorkers.length === 0 ? (
            <div className="text-center py-16 onyx-card rounded-3xl">
              <Users className="h-16 w-16 text-onyx-500 mx-auto mb-4" />
              <h4 className="text-xl font-bold text-onyx-950 mb-2">
                {isArabic ? "لم نجد أي فنيين" : "No Technicians Found"}
              </h4>
              <p className="text-onyx-700 text-sm max-w-md mx-auto">
                {isArabic ? "لا يوجد فنيين مسجلين حالياً." : "There are no registered pros at the moment."}
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {sponsoredWorkers.map((worker) => (
                <div 
                  key={worker.id}
                  className="onyx-card transition-all duration-300 rounded-3xl p-6 flex flex-col justify-between group"
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
                          <h4 className="text-lg font-black text-onyx-950 truncate hover:text-gold-700 transition-colors cursor-pointer">
                            {worker.name}
                          </h4>
                        </Link>
                        <p className="text-sm text-gold-700 font-bold mt-0.5">
                          {isArabic ? worker.professionAr : worker.professionEn}
                        </p>
                        
                        {/* Rating */}
                        <div className="flex items-center gap-1.5 mt-2">
                          <Star className="h-4 w-4 text-gold-500 fill-current" />
                          <span className="text-sm font-bold text-onyx-900">{worker.rating > 0 ? worker.rating.toFixed(1) : "5.0"}</span>
                          <span className="text-xs text-onyx-500">({worker.ratingCount || 1})</span>
                          <span className="text-onyx-700 mx-1">|</span>
                          <span className="text-xs text-onyx-600 font-semibold">{worker.totalJobs || 0} {isArabic ? "عملية ناجحة" : "jobs"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Locations */}
                    <div className="border-t border-black/5 pt-4 mb-6">
                      <p className="text-xs text-onyx-500 font-bold mb-2 uppercase tracking-wide">
                        {isArabic ? "مناطق التغطية" : "Service Coverage"}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {worker.areas.slice(0, 3).map((a: string, idx: number) => (
                          <span key={idx} className="text-xs bg-gold-500/10 text-onyx-800 px-2.5 py-1 rounded-lg border border-gold-500/20">
                            {a}
                          </span>
                        ))}
                        {worker.areas.length > 3 && (
                          <span className="text-xs bg-gold-500/10 text-onyx-800 px-2.5 py-1 rounded-lg border border-gold-500/20">
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
              <div className="flex justify-center mt-10">
                <Link
                  href={`/${locale}/workers`}
                  className="btn-gold py-3 px-8 text-sm font-black shadow-md flex items-center gap-2"
                >
                  <span>{isArabic ? "عرض كل الفنيين" : "View All Technicians"}</span>
                  <ChevronRight className="h-4.5 w-4.5 rtl:rotate-180" />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Auth Prompt Modal */}
      {showAuthModal && selectedWorkerForBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="onyx-card border-white/10 bg-onyx-900 max-w-md w-full p-8 rounded-3xl shadow-2xl relative border animate-scaleUp">
            {/* Close Button */}
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

      {/* Public Open Requests Job Board Section */}
      <section className="py-20 px-4 bg-transparent border-b border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-gold-500 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/25">
              {isArabic ? "فرص العمل المتاحة" : "Open Opportunities"}
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-onyx-950 mt-4 mb-4">
              {isArabic ? "طلبات صيانة مفتوحة تنتظر فنيين" : "Active Home Maintenance Jobs"}
            </h2>
            <p className="text-onyx-700 max-w-2xl mx-auto text-base md:text-lg">
              {isArabic 
                ? "شاهد طلبات العملاء الحالية في منطقتك، واستلم العمل فوراً بمجرد تسجيلك كفني محترف" 
                : "View open maintenance requests, select jobs, and start earning by joining as a pro"}
            </p>
            <div className="h-1 w-24 bg-gold-500 mx-auto rounded-full mt-6" />
          </div>

          {/* Requests List */}
          {loadingRequests ? (
            <div className="flex flex-col items-center justify-center py-20 text-onyx-400">
              <div className="h-10 w-10 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-sm font-medium">{isArabic ? "جاري تحميل الفرص المتاحة..." : "Loading open requests..."}</p>
            </div>
          ) : publicRequests.length === 0 ? (
            <div className="text-center py-16 onyx-card border-white/5 bg-white/[0.01] rounded-3xl">
              <Store className="h-16 w-16 text-onyx-600 mx-auto mb-4" />
              <h4 className="text-xl font-bold text-white mb-2">
                {isArabic ? "لا يوجد طلبات مفتوحة حالياً" : "No Open Requests"}
              </h4>
              <p className="text-onyx-400 text-sm max-w-md mx-auto">
                {isArabic 
                  ? "جميع طلبات الصيانة مستلمة حالياً من قبل فنيين آخرين. يرجى التحقق مرة أخرى لاحقاً." 
                  : "All maintenance requests are currently assigned. Please check back later."}
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {publicRequests.slice(0, 6).map((req) => (
                <div
                  key={req.id}
                  className="onyx-card transition-all duration-300 rounded-3xl p-6 flex flex-col justify-between group"
                >
                  <div>
                    {/* Badge and Location */}
                    <div className="flex items-center justify-between mb-4">
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md",
                        req.urgency === "EMERGENCY" 
                          ? "bg-red-500/10 text-red-500 border border-red-500/20" 
                          : "bg-gold-500/10 text-onyx-800 border border-gold-500/20"
                      )}>
                        {req.urgency === "EMERGENCY" 
                          ? (isArabic ? "حالة طوارئ" : "Emergency") 
                          : (isArabic ? "طلب عادي" : "Normal")}
                      </span>

                      <span className="text-xs text-onyx-500 font-medium">
                        {new Date(req.createdAt).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>

                    <h4 className="text-lg font-black text-onyx-950 mb-1.5 line-clamp-1 group-hover:text-gold-700 transition-colors">
                      {req.title}
                    </h4>

                    <p className="text-xs text-gold-700 font-bold mb-3 uppercase tracking-wider">
                      {isArabic ? req.categoryNameAr : req.categoryNameEn}
                    </p>

                    <p className="text-sm text-onyx-700 line-clamp-3 leading-relaxed mb-6">
                      {req.description}
                    </p>
                  </div>

                  {/* Footer & Action */}
                  <div className="border-t border-black/5 pt-4 mt-auto">
                    <div className="flex items-center gap-2 text-xs text-onyx-600 mb-4 font-semibold">
                      <MapPin className="h-4 w-4 text-gold-500 flex-shrink-0" />
                      <span>{isArabic ? `${req.governorate}، ${req.city}` : `${req.governorate}, ${req.city}`}</span>
                    </div>

                    <button
                      onClick={() => handleAcceptRequestClick(req)}
                      className="w-full btn-gold py-3 text-sm font-black flex items-center justify-center gap-2 group/btn shadow-md"
                    >
                      <span>{isArabic ? "اقبل الطلب الآن" : "Accept Job Now"}</span>
                      <ChevronRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1 rtl:rotate-180 rtl:group-hover/btn:-translate-x-1" />
                    </button>
                  </div>
                </div>
              ))}
              </div>
              <div className="flex justify-center mt-10">
                <Link
                  href={`/${locale}/orders`}
                  className="btn-gold py-3 px-8 text-sm font-black shadow-md flex items-center gap-2"
                >
                  <span>{isArabic ? "عرض كل الطلبات المتاحة" : "View All Open Orders"}</span>
                  <ChevronRight className="h-4.5 w-4.5 rtl:rotate-180" />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      <section className="py-16 px-4 bg-transparent border-b border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-black text-onyx-950">
              {isArabic ? "خطوات بسيطة لبدء الصيانة" : "How OSTA Works"}
            </h2>
            <div className="h-1 w-16 bg-gold-500 mx-auto rounded-full mt-4" />
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: "1",
                title: isArabic ? "١. اطلب الخدمة" : "1. Request Service",
                desc: isArabic ? "اختر التخصص واكتب تفاصيل مشكلتك بوضوح." : "Choose a trade and describe your problem clearly."
              },
              {
                step: "2",
                title: isArabic ? "٢. قارن عروض الأسعار" : "2. Compare Quotes",
                desc: isArabic ? "استقبل عروضاً مباشرة من فنيين موثقين قريبين منك." : "Get direct quotes from verified local pros."
              },
              {
                step: "3",
                title: isArabic ? "٣. أنجز طلبك بأمان" : "3. Complete Safely",
                desc: isArabic ? "اختر الفني المناسب، ودردش لتأكيد الشغل والضمان." : "Select the best tech, chat to confirm, and activate warranty."
              }
            ].map((s, idx) => (
              <div key={idx} className="onyx-card p-8 text-center space-y-4 hover:border-gold-500/20 transition-all duration-300">
                <div className="h-12 w-12 rounded-full bg-gold-500/10 text-gold-500 flex items-center justify-center font-black text-lg mx-auto border border-gold-500/20">
                  {s.step}
                </div>
                <h3 className="text-lg font-bold text-white">{s.title}</h3>
                <p className="text-sm text-onyx-400 leading-relaxed max-w-xs mx-auto">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Worker Auth Prompt Modal */}
      {showWorkerAuthModal && selectedRequestForAccept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="onyx-card border-white/10 bg-onyx-900 max-w-md w-full p-8 rounded-3xl shadow-2xl relative border animate-scaleUp">
            {/* Close Button */}
            <button 
              onClick={() => setShowWorkerAuthModal(false)}
              className="absolute top-4 right-4 text-onyx-400 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="text-center">
              <div className="h-16 w-16 bg-gold-500/10 border border-gold-500/25 rounded-full flex items-center justify-center mx-auto mb-6 text-gold-500">
                <Store className="h-8 w-8" />
              </div>

              <h3 className="text-2xl font-black text-white mb-2">
                {isArabic ? "استقبال طلب الصيانة" : "Receive Service Request"}
              </h3>
              
              <p className="text-gold-500 font-bold mb-4 text-sm">
                {isArabic 
                  ? `قبول طلب: ${selectedRequestForAccept.title}` 
                  : `Accepting: ${selectedRequestForAccept.title}`}
              </p>

              <p className="text-onyx-300 text-sm leading-relaxed mb-8">
                {isArabic
                  ? "لقبول هذا الطلب والبدء في التواصل وعرض أسعارك للعميل، يرجى تسجيل الدخول كفني أو التسجيل كفني محترف جديد بالمنصة."
                  : "To accept this job and start bidding/communicating with the client, please sign in as a technician or register as a new professional pro."}
              </p>

              <div className="flex flex-col gap-3">
                <Link
                  href={`/${locale}/login?redirect=${encodeURIComponent(
                    `/${locale}/worker`
                  )}`}
                  className="btn-gold py-3 text-sm font-black w-full text-center rounded-xl shadow-lg shadow-gold-500/10"
                >
                  {isArabic ? "تسجيل الدخول كفني" : "Login as Pro"}
                </Link>
                <Link
                  href={`/${locale}/register/worker?redirect=${encodeURIComponent(
                    `/${locale}/worker`
                  )}`}
                  className="btn-onyx py-3 text-sm font-black w-full text-center border-white/10 text-white hover:bg-white/5 rounded-xl"
                >
                  {isArabic ? "سجل كفني محترف جديد" : "Register as Pro"}
                </Link>
                <button
                  onClick={() => setShowWorkerAuthModal(false)}
                  className="text-xs text-onyx-500 hover:text-onyx-300 transition-colors font-bold mt-4"
                >
                  {isArabic ? "إلغاء ومتابعة التصفح" : "Cancel and Continue Browsing"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}




      {/* Features */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="onyx-grid absolute inset-0 opacity-10" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { 
                icon: ShieldCheck, 
                title: isArabic ? "أمان تام" : "Full Security", 
                desc: isArabic ? "جميع الصنايعية موثقين بصورة البطاقة والفيش الجنائي." : "All pros are verified with national ID and criminal records." 
              },
              { 
                icon: CheckCircle2, 
                title: isArabic ? "ضمان الجودة" : "Quality Guarantee", 
                desc: isArabic ? "نضمن لك جودة العمل، وفي حالة وجود مشكلة، نحن بجانبك." : "We guarantee the work quality, and we're here if anything goes wrong." 
              },
              { 
                icon: Store, 
                title: isArabic ? "سوق الخامات" : "Materials Market", 
                desc: isArabic ? "اطلب خاماتك من أقرب المتاجر الموثقة لباب بيتك." : "Order materials from the nearest verified stores to your doorstep." 
              }
            ].map((feature, i) => (
              <div key={i} className="text-center group">
                <div className="h-24 w-24 bg-onyx-800 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-onyx-700 group-hover:border-gold-500/50 group-hover:gold-glow transition-all duration-500">
                  <feature.icon className="h-12 w-12 text-gold-500 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-onyx-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto onyx-card p-12 text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gold-gradient opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-black text-onyx-950 mb-8">
              {isArabic ? "جاهز لتجربة أُسطفاي؟" : "Ready for Ostafy Experience?"}
            </h2>
            <p className="text-onyx-700 text-xl mb-12 max-w-2xl mx-auto">
              {isArabic ? "سجل الآن كعميل وابدأ في طلب خدماتك أو انضم كمحترف وضاعف دخلك." : "Register now as a client or join as a pro and multiply your income."}
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <Link href={`/${locale}/register/client`} className="btn-gold py-5 px-12 text-xl">
                {isArabic ? "سجل كعميل مجاناً" : "Join for Free"}
              </Link>
              <Link href={`/${locale}/register/worker`} className="btn-ghost py-5 px-12 text-xl">
                {isArabic ? "سجل كفني محترف" : "Join as a Pro"}
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
