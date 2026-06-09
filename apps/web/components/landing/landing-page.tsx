"use client";

import { motion } from "framer-motion";
import { 
  Zap, Waves, Hammer, Wind, Smartphone, 
  Palette, Layout, Globe, Monitor, Camera, 
  ChevronRight, ArrowLeft, Star, ShieldCheck, MapPin,
  Store, Users, CheckCircle2, Menu, X,
  Facebook, Instagram, Phone, Mail
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/locales";
import { LocaleSwitcher } from "@/components/shared/locale-switcher";
import { egyptianGovernorates, majorCities } from "@/lib/geo-data";
import { resolveApiBaseUrl } from "@/lib/api";

const CRAFTS = [
  { id: "electricity", name: { ar: "الكهرباء", en: "Electrical" }, image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=1000&auto=format&fit=crop&v=osta4", color: "from-yellow-400 to-gold-600" },
  { id: "plumbing", name: { ar: "السباكة", en: "Plumbing" }, image: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?q=80&w=1000&auto=format&fit=crop&v=osta5", color: "from-blue-400 to-blue-600" },
  { id: "carpentry", name: { ar: "النجارة", en: "Carpentry" }, image: "https://images.unsplash.com/photo-1601058268499-e52658b8bb88?q=80&w=1000&auto=format&fit=crop&v=osta4", color: "from-amber-600 to-amber-800" },
  { id: "ac", name: { ar: "التكييفات", en: "AC Maintenance" }, image: "/images/services/ac.jpg", color: "from-cyan-400 to-cyan-600" },
  { id: "appliances", name: { ar: "صيانة أجهزة", en: "Home Appliances" }, image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=1000&auto=format&fit=crop&v=osta4", color: "from-purple-400 to-purple-600" },
  { id: "painting", name: { ar: "الدهانات", en: "Painting" }, image: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?q=80&w=1000&auto=format&fit=crop&v=osta4", color: "from-rose-400 to-rose-600" },
  { id: "aluminum", name: { ar: "الوميتال", en: "Aluminum" }, image: "/images/services/aluminum.jpg", color: "from-slate-400 to-slate-600" },
  { id: "networks", name: { ar: "الشبكات", en: "Networks" }, image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=1000&auto=format&fit=crop&v=osta4", color: "from-indigo-400 to-indigo-600" },
  { id: "computer-repair", name: { ar: "صيانة كمبيوتر", en: "Computer" }, image: "https://images.unsplash.com/photo-1588508065123-287b28e013da?q=80&w=1000&auto=format&fit=crop&v=osta4", color: "from-emerald-400 to-emerald-600" },
  { id: "cctv", name: { ar: "تركيب كاميرات", en: "CCTV" }, image: "/images/services/cam.jpg", color: "from-red-400 to-red-600" },
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

export function LandingPage({ locale }: { locale: Locale }) {
  const isArabic = locale === "ar";
  const pathname = usePathname() || "";
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [slides, setSlides] = useState<any[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("");
  const [selectedGov, setSelectedGov] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedArea, setSelectedArea] = useState<string>("");
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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

  const [visibleWorkersLimit, setVisibleWorkersLimit] = useState<number>(4);
  const [visibleRequestsLimit, setVisibleRequestsLimit] = useState<number>(4);

  const DEFAULT_SLIDES = [
    {
      id: "slide-1",
      eyebrowAr: "منصة الحرفيين رقم 1 في مصر",
      eyebrowEn: "Egypt's #1 Craftsman Platform",
      titleAr: "اطلب أُسطفاي محترف بنقرة واحدة",
      titleEn: "Hire a Professional Ostafy in Seconds",
      descAr: "أول منصة تجمع أمهر الفنيين والمتاجر الموثقة في مصر. جودة مضمونة، أسعار عادلة، وتجربة مستخدم فاخرة.",
      descEn: "The first platform connecting skilled pros and verified stores in Egypt. Guaranteed quality, fair prices, and a premium experience.",
      imageUrl: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1600",
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
      imageUrl: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=1600",
      btn1TextAr: "اطلب فني الآن",
      btn1TextEn: "Book Pro Now",
      btn1Link: "/register/client",
      btn2TextAr: "تصفح الخدمات",
      btn2TextEn: "Browse Services",
      btn2Link: "/services",
      isActive: true
    }
  ];

  useEffect(() => {
    const saved = localStorage.getItem("osta_hero_slides");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const active = parsed.filter((s: any) => s.isActive !== false);
        setSlides(active.length > 0 ? active : DEFAULT_SLIDES);
      } catch {
        setSlides(DEFAULT_SLIDES);
      }
    } else {
      setSlides(DEFAULT_SLIDES);
    }
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = window.localStorage.getItem("osta_access_token") || window.sessionStorage.getItem("osta_access_token");
      const role = window.localStorage.getItem("osta_user_role");
      setIsLoggedIn(!!token);
      setIsClient(role === "CLIENT");
      setIsWorker(role === "WORKER");
    }
  }, []);

  const fetchWorkers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (selectedSpecialty) params.append("specialty", selectedSpecialty);
      if (selectedGov) params.append("governorate", selectedGov);
      if (selectedCity) params.append("city", selectedCity);
      if (selectedArea) params.append("area", selectedArea);

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
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
    setVisibleWorkersLimit(4);
  }, [selectedSpecialty, selectedGov, selectedCity, selectedArea]);

  const fetchPublicRequests = async () => {
    setLoadingRequests(true);
    try {
      const params = new URLSearchParams();
      if (selectedRequestSpecialty) params.append("specialty", selectedRequestSpecialty);

      const baseUrl = resolveApiBaseUrl();
      const res = await fetch(`${baseUrl}/public/requests?${params.toString()}`);
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
    fetchPublicRequests();
    setVisibleRequestsLimit(4);
  }, [selectedRequestSpecialty]);

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
    <div className="min-h-screen bg-onyx-950 onyx-shell-bg selection:bg-gold-500 selection:text-onyx-950 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-black/95 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-24 flex items-center justify-between">
          <Link href={`/${locale}`} className="flex items-center gap-2 group">
            <img src="/logo.svg" alt="Ostafy" className="h-12 w-auto" />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href={`/${locale}/vendors`} className="text-sm font-medium text-onyx-300 hover:text-gold-500 transition-colors">
              {isArabic ? "المتاجر" : "Marketplace"}
            </Link>
            <Link href={`/${locale}/login`} className="text-sm font-medium text-onyx-300 hover:text-gold-500 transition-colors">
              {isArabic ? "تسجيل دخول" : "Login"}
            </Link>
            <LocaleSwitcher 
              locale={locale} 
              pathname={pathname} 
              className="text-sm font-medium text-onyx-300 hover:text-gold-500 transition-colors border border-white/10 px-3 py-1.5 rounded-lg bg-white/5" 
            />
            <Link href={`/${locale}/register/client`} className="btn-gold shadow-gold/20">
              {isArabic ? "ابدأ الآن" : "Get Started"}
            </Link>
          </div>

          <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-onyx-900 border-t border-white/5 p-4 flex flex-col gap-4 animate-in slide-in-from-top duration-300">
            <Link href={`/${locale}/vendors`} className="text-lg font-medium text-white px-4 py-2 border-b border-white/5">
              {isArabic ? "المتاجر" : "Marketplace"}
            </Link>
            <Link href={`/${locale}/login`} className="text-lg font-medium text-white px-4 py-2 border-b border-white/5">
              {isArabic ? "تسجيل دخول" : "Login"}
            </Link>
            <div className="px-4 py-2 flex items-center justify-between border-b border-white/5">
              <span className="text-onyx-400 text-sm">{isArabic ? "اللغة" : "Language"}</span>
              <LocaleSwitcher 
                locale={locale} 
                pathname={pathname} 
                className="text-gold-500 font-bold" 
              />
            </div>
            <Link href={`/${locale}/register/client`} className="btn-gold w-full text-center py-4 mt-4">
              {isArabic ? "ابدأ الآن" : "Get Started"}
            </Link>
          </div>
        )}
      </nav>

      {/* Hero Section with Dynamic Background Slider */}
      <section className="relative pt-40 pb-20 px-4 min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Images with smooth cross-fade transition */}
        {slides.map((slide, idx) => (
          <div
            key={slide.id}
            className={cn(
              "absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out z-0",
              idx === currentSlideIndex ? "opacity-100 scale-100 blur-none" : "opacity-0 scale-105"
            )}
            style={{ backgroundImage: `url('${cleanImageUrl(slide.imageUrl)}')` }}
          />
        ))}
        {/* Premium deep dark gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-onyx-950 via-onyx-950/85 to-onyx-950/60 z-10" />

        {slides.length > 0 && (
          <div className="max-w-5xl mx-auto text-center relative z-20 w-full">
            <motion.div 
              key={currentSlideIndex} // Triggers re-animation automatically on slide switch!
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-500 text-xs font-bold mb-6">
                <ShieldCheck className="h-3.5 w-3.5" />
                {isArabic ? currentSlide.eyebrowAr : currentSlide.eyebrowEn}
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[1.15] mb-6 tracking-tight">
                {isArabic ? currentSlide.titleAr : currentSlide.titleEn}
              </h1>
              <p className="text-onyx-200 text-base md:text-lg lg:text-xl max-w-3xl mx-auto mb-10 leading-relaxed font-light">
                {isArabic ? currentSlide.descAr : currentSlide.descEn}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href={`/${locale}/register/client`} className="w-full sm:w-auto btn-gold text-center py-4 px-8 text-lg shadow-lg shadow-gold-500/20">
                  {isArabic ? "اطلب صنايعي" : "Order a Pro"}
                </Link>
                <Link href={`/${locale}/register/worker`} className="w-full sm:w-auto btn-onyx text-center py-4 px-8 text-lg border-gold-500/30 text-gold-500 bg-white/[0.02] backdrop-blur hover:bg-gold-500/10 hover:border-gold-500/50 shadow-lg">
                  {isArabic ? "انضم كصنايعي" : "Join as Pro"}
                </Link>
                <Link href={`/${locale}/register/vendor`} className="w-full sm:w-auto btn-onyx text-center py-4 px-8 text-lg border-white/10 text-white bg-white/[0.01] backdrop-blur hover:bg-white/5 hover:border-white/20 shadow-lg">
                  {isArabic ? "انضم كمتجر" : "Join as Vendor"}
                </Link>
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

            {/* Slider Dots indicators */}
            {slides.length > 1 && (
              <div className="flex justify-center items-center gap-3 mt-12">
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
          </div>
        )}
      </section>

      {/* Worker Exploration Section */}
      <section className="py-20 px-4 bg-onyx-950 relative border-b border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-gold-500 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/25">
              {isArabic ? "استكشاف الفنيين" : "Explore Pros"}
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-white mt-4 mb-4">
              {isArabic ? "ابحث عن فني محترف واحجزه فوراً" : "Find & Book a Pro Instantly"}
            </h2>
            <p className="text-onyx-400 max-w-2xl mx-auto text-base md:text-lg">
              {isArabic 
                ? "تصفح قائمة أمهر الحرفيين والتقييمات، وحرك طلبك المباشر مع إضافة الفني للمفضلة تلقائياً" 
                : "Browse top-rated craftsmen, book directly, and automatically add them to your favorites"}
            </p>
            <div className="h-1 w-24 bg-gold-500 mx-auto rounded-full mt-6" />
          </div>

          {/* Filters Panel */}
          <div className="onyx-card p-6 md:p-8 mb-10 border-white/5 bg-white/[0.02] backdrop-blur-md rounded-3xl">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {/* Specialty Filter */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-onyx-300">
                  {isArabic ? "التخصص المهني" : "Profession / Specialty"}
                </label>
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="h-12 bg-onyx-900 border border-white/10 text-white rounded-xl px-4 focus:outline-none focus:border-gold-500/50 transition-colors cursor-pointer text-sm font-medium"
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
                  className="h-12 bg-onyx-900 border border-white/10 text-white rounded-xl px-4 focus:outline-none focus:border-gold-500/50 transition-colors cursor-pointer text-sm font-medium"
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
                  className="h-12 bg-onyx-900 border border-white/10 text-white rounded-xl px-4 focus:outline-none focus:border-gold-500/50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
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
                    className="h-12 bg-onyx-900 border border-white/10 text-white rounded-xl px-4 focus:outline-none focus:border-gold-500/50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
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
                    className="h-12 bg-onyx-900 border border-white/10 text-white rounded-xl px-4 focus:outline-none focus:border-gold-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  />
                )}
              </div>
            </div>

            {/* Clear Filters Link */}
            {(selectedSpecialty || selectedGov || selectedCity || selectedArea) && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    setSelectedSpecialty("");
                    setSelectedGov("");
                    setSelectedCity("");
                    setSelectedArea("");
                  }}
                  className="text-xs text-gold-500 hover:text-gold-400 font-semibold underline underline-offset-4"
                >
                  {isArabic ? "إعادة ضبط الفلاتر" : "Reset Filters"}
                </button>
              </div>
            )}
          </div>

          {/* Fallback Warning Banner */}
          {workers.length > 0 && workers.some(w => w.isNearby) && (
            <div className="mb-8 p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 text-amber-500 text-sm font-semibold flex items-center gap-3 animate-fadeIn">
              <span className="text-lg">⚠️</span>
              <p>
                {isArabic 
                  ? "عذراً، لا يوجد فنيين متوفرين في الحي المحدد حالياً. تم تلقائياً عرض الفنيين المتاحين في الأحياء المجاورة التابعة لنفس المدينة."
                  : "Sorry, no technicians are currently available in the selected neighborhood. We have automatically displayed available technicians in neighboring neighborhoods of the same city."}
              </p>
            </div>
          )}

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
          ) : workers.length === 0 ? (
            <div className="text-center py-16 onyx-card border-white/5 bg-white/[0.01] rounded-3xl">
              <Users className="h-16 w-16 text-onyx-600 mx-auto mb-4" />
              <h4 className="text-xl font-bold text-white mb-2">
                {isArabic ? "لم نجد أي فنيين" : "No Technicians Found"}
              </h4>
              <p className="text-onyx-400 text-sm max-w-md mx-auto">
                {isArabic 
                  ? "لا يوجد فنيين مسجلين يطابقون هذه الفلاتر حالياً. حاول تعديل خيارات التصفية أو اختيار تخصص آخر." 
                  : "There are no registered pros matching these filters at the moment. Try modifying your search options."}
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {workers.slice(0, visibleWorkersLimit).map((worker) => (
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
                      <div className="h-16 w-16 rounded-2xl bg-onyx-800 border border-white/10 overflow-hidden flex items-center justify-center text-gold-500 text-xl font-bold flex-shrink-0 shadow-inner">
                        {worker.avatarUrl ? (
                          <img src={worker.avatarUrl} alt={worker.name} className="h-full w-full object-cover" />
                        ) : (
                          worker.name.charAt(0)
                        )}
                      </div>

                      {/* Name & Specialty */}
                      <div className="min-w-0 flex-1">
                        <h4 className="text-lg font-black text-white truncate group-hover:text-gold-500 transition-colors">
                          {worker.name}
                        </h4>
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
              {workers.length > visibleWorkersLimit && (
                <div className="flex justify-center mt-10">
                  <button
                    onClick={() => setVisibleWorkersLimit((prev) => prev + 4)}
                    className="btn-onyx py-3 px-8 text-sm font-bold border-gold-500/20 text-gold-500 bg-white/[0.02] backdrop-blur hover:bg-gold-500/10 hover:border-gold-500/50 shadow-lg rounded-xl transition-all duration-300 flex items-center gap-2"
                  >
                    <span>{isArabic ? "مزيد من الفنيين" : "Show More Technicians"}</span>
                    <ChevronRight className="h-4 w-4 rotate-90 rtl:-rotate-90" />
                  </button>
                </div>
              )}
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
      <section className="py-20 px-4 bg-onyx-900/30 border-b border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-gold-500 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/25">
              {isArabic ? "فرص العمل المتاحة" : "Open Opportunities"}
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-white mt-4 mb-4">
              {isArabic ? "طلبات صيانة مفتوحة تنتظر فنيين" : "Active Home Maintenance Jobs"}
            </h2>
            <p className="text-onyx-400 max-w-2xl mx-auto text-base md:text-lg">
              {isArabic 
                ? "شاهد طلبات العملاء الحالية في منطقتك، واستلم العمل فوراً بمجرد تسجيلك كفني محترف" 
                : "View open maintenance requests, select jobs, and start earning by joining as a pro"}
            </p>
            <div className="h-1 w-24 bg-gold-500 mx-auto rounded-full mt-6" />
          </div>

          {/* Specialty Filter Tab/Buttons */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            <button
              onClick={() => setSelectedRequestSpecialty("")}
              className={cn(
                "px-5 py-2.5 rounded-full text-sm font-semibold transition-all border",
                selectedRequestSpecialty === ""
                  ? "bg-gold-500 text-onyx-950 border-gold-500 shadow-md"
                  : "bg-onyx-900 border-white/10 text-onyx-300 hover:text-white"
              )}
            >
              {isArabic ? "كل الفئات" : "All Categories"}
            </button>
            {CRAFTS.map((craft) => (
              <button
                key={craft.id}
                onClick={() => setSelectedRequestSpecialty(craft.id)}
                className={cn(
                  "px-5 py-2.5 rounded-full text-sm font-semibold transition-all border",
                  selectedRequestSpecialty === craft.id
                    ? "bg-gold-500 text-onyx-950 border-gold-500 shadow-md"
                    : "bg-onyx-900 border-white/10 text-onyx-300 hover:text-white"
                )}
              >
                {isArabic ? craft.name.ar : craft.name.en}
              </button>
            ))}
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
                {publicRequests.slice(0, visibleRequestsLimit).map((req) => (
                <div
                  key={req.id}
                  className="onyx-card border-white/5 bg-white/[0.02] hover:border-gold-500/30 transition-all duration-300 rounded-3xl p-6 flex flex-col justify-between group"
                >
                  <div>
                    {/* Badge and Location */}
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

                      <span className="text-xs text-onyx-500 font-medium">
                        {new Date(req.createdAt).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>

                    <h4 className="text-lg font-black text-white mb-1.5 line-clamp-1 group-hover:text-gold-500 transition-colors">
                      {req.title}
                    </h4>

                    <p className="text-xs text-gold-500 font-bold mb-3 uppercase tracking-wider">
                      {isArabic ? req.categoryNameAr : req.categoryNameEn}
                    </p>

                    <p className="text-sm text-onyx-400 line-clamp-3 leading-relaxed mb-6">
                      {req.description}
                    </p>
                  </div>

                  {/* Footer & Action */}
                  <div className="border-t border-white/5 pt-4 mt-auto">
                    <div className="flex items-center gap-2 text-xs text-onyx-400 mb-4 font-semibold">
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
              {publicRequests.length > visibleRequestsLimit && (
                <div className="flex justify-center mt-10">
                  <button
                    onClick={() => setVisibleRequestsLimit((prev) => prev + 4)}
                    className="btn-onyx py-3 px-8 text-sm font-bold border-gold-500/20 text-gold-500 bg-white/[0.02] backdrop-blur hover:bg-gold-500/10 hover:border-gold-500/50 shadow-lg rounded-xl transition-all duration-300 flex items-center gap-2"
                  >
                    <span>{isArabic ? "مزيد من الطلبات" : "Show More Requests"}</span>
                    <ChevronRight className="h-4 w-4 rotate-90 rtl:-rotate-90" />
                  </button>
                </div>
              )}
            </>
          )}
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


      {/* Categories Grid */}
      <section className="py-24 px-4 bg-onyx-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
              {isArabic ? "خدماتنا الأساسية" : "Our Core Services"}
            </h2>
            <div className="h-1 w-24 bg-gold-500 mx-auto rounded-full" />
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6"
          >
            {CRAFTS.map((craft) => (
              <motion.div key={craft.id} variants={itemVariants}>
                <Link href={`/${locale}/services/${craft.id}`} className="group block p-6 onyx-card hover:border-gold-500/50 transition-all duration-500 hover:-translate-y-2">
                  <div className={cn(
                    "h-48 w-full rounded-2xl overflow-hidden mb-6 transition-transform duration-500 group-hover:scale-105 group-hover:rotate-1 relative shadow-lg",
                  )}>
                    <img 
                      src={craft.image} 
                      alt={isArabic ? craft.name.ar : craft.name.en}
                      className="w-full h-full object-cover"
                    />
                    <div className={cn("absolute inset-0 bg-gradient-to-br opacity-20", craft.color)} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-gold-500 transition-colors">
                    {isArabic ? craft.name.ar : craft.name.en}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-onyx-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isArabic ? "اطلب الآن" : "Book Now"}
                    <ChevronRight className="h-3 w-3 rtl:rotate-180" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

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
            <h2 className="text-4xl md:text-6xl font-black text-white mb-8">
              {isArabic ? "جاهز لتجربة أُسطفاي؟" : "Ready for Ostafy Experience?"}
            </h2>
            <p className="text-gold-100 text-xl mb-12 max-w-2xl mx-auto">
              {isArabic ? "سجل الآن كعميل وابدأ في طلب خدماتك أو انضم كمحترف وضاعف دخلك." : "Register now as a client or join as a pro and multiply your income."}
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <Link href={`/${locale}/register/client`} className="btn-gold py-5 px-12 text-xl">
                {isArabic ? "سجل كعميل مجاناً" : "Join for Free"}
              </Link>
              <Link href={`/${locale}/register/worker`} className="btn-onyx py-5 px-12 text-xl border-gold-500/20 text-gold-500 hover:bg-gold-500/10">
                {isArabic ? "سجل كفني محترف" : "Join as a Pro"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-white/5 bg-onyx-950">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex flex-col items-center justify-center gap-6 mb-10">
            <div className="w-fit">
              <img src="/logo.svg" alt="Ostafy" className="h-20 w-auto opacity-95" />
            </div>
            
            {/* Contact Details */}
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-onyx-400 font-medium mt-2">
              <a href="https://wa.me/201009410112" className="flex items-center gap-2 hover:text-gold-500 transition-colors">
                <Phone className="h-4 w-4 text-gold-500" />
                <span>+20 100 941 0112</span>
              </a>
              <a href="mailto:info@osta.net" className="flex items-center gap-2 hover:text-gold-500 transition-colors">
                <Mail className="h-4 w-4 text-gold-500" />
                <span>info@osta.net</span>
              </a>
            </div>

            {/* Social Media Links */}
            <div className="flex items-center justify-center gap-4 mt-2">
              <a href="https://www.facebook.com/2ostafy/" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-xl bg-white/5 hover:bg-gold-500 hover:text-onyx-950 transition-all duration-300 flex items-center justify-center text-onyx-300 border border-white/10 hover:border-gold-500 hover:-translate-y-1">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://instagram.com/osta.egypt" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-xl bg-white/5 hover:bg-gold-500 hover:text-onyx-950 transition-all duration-300 flex items-center justify-center text-onyx-300 border border-white/10 hover:border-gold-500 hover:-translate-y-1">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://wa.me/201009410112" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-xl bg-white/5 hover:bg-gold-500 hover:text-onyx-950 transition-all duration-300 flex items-center justify-center text-onyx-300 border border-white/10 hover:border-gold-500 hover:-translate-y-1">
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.859-4.42 9.863-9.864.002-2.637-1.023-5.115-2.887-6.979C16.582 1.9 14.1 1.05 11.999 1.05c-5.444 0-9.866 4.42-9.87 9.867a9.81 9.81 0 001.5 5.17l-.988 3.606 3.692-.969zm10.741-6.155c-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.668.149-.198.297-.766.967-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.15-.173.198-.297.298-.495.099-.198.05-.371-.025-.521-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                </svg>
              </a>
            </div>
          </div>
          <p className="text-onyx-600 text-xs font-semibold tracking-wide">
            © {new Date().getFullYear()} Ostafy Egypt. {isArabic ? "جميع الحقوق محفوظة." : "All rights reserved."}
          </p>
        </div>
      </footer>
    </div>
  );
}
