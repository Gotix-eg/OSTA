"use client";

import { motion } from "framer-motion";
import { 
  Zap, Waves, Hammer, Wind, Smartphone, 
  Palette, Layout, Globe, Monitor, Camera, 
  ChevronRight, ArrowLeft, Star, ShieldCheck, 
  Store, Users, CheckCircle2, Menu, X,
  Facebook, Instagram, Phone, Mail
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/locales";
import { LocaleSwitcher } from "@/components/shared/locale-switcher";

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

  const DEFAULT_SLIDES = [
    {
      id: "slide-1",
      eyebrowAr: "منصة الحرفيين رقم 1 في مصر",
      eyebrowEn: "Egypt's #1 Craftsman Platform",
      titleAr: "اطلب أسطى محترف بنقرة واحدة",
      titleEn: "Hire a Professional OSTA in Seconds",
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
            <img src="/logo.svg" alt="OSTA" className="h-12 w-auto" />
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
              {isArabic ? "جاهز لتجربة أُسطى؟" : "Ready for OSTA Experience?"}
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
              <img src="/logo.svg" alt="OSTA" className="h-20 w-auto opacity-95" />
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
              <a href="https://facebook.com/osta.egypt" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-xl bg-white/5 hover:bg-gold-500 hover:text-onyx-950 transition-all duration-300 flex items-center justify-center text-onyx-300 border border-white/10 hover:border-gold-500 hover:-translate-y-1">
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
            © {new Date().getFullYear()} OSTA Egypt. {isArabic ? "جميع الحقوق محفوظة." : "All rights reserved."}
          </p>
        </div>
      </footer>
    </div>
  );
}
