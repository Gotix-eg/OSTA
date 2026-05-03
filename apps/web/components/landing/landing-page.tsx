"use client";

import { motion } from "framer-motion";
import { 
  Zap, Waves, Hammer, Wind, Smartphone, 
  Palette, Layout, Globe, Monitor, Camera, 
  ChevronRight, ArrowLeft, Star, ShieldCheck, 
  Store, Users, CheckCircle2, Menu, X
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/locales";

const CRAFTS = [
  { id: "electrical", name: { ar: "الكهرباء", en: "Electrical" }, image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=1000&auto=format&fit=crop&v=osta4", color: "from-yellow-400 to-gold-600" },
  { id: "plumbing", name: { ar: "السباكة", en: "Plumbing" }, image: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?q=80&w=1000&auto=format&fit=crop&v=osta5", color: "from-blue-400 to-blue-600" },
  { id: "carpentry", name: { ar: "النجارة", en: "Carpentry" }, image: "https://images.unsplash.com/photo-1601058268499-e52658b8bb88?q=80&w=1000&auto=format&fit=crop&v=osta4", color: "from-amber-600 to-amber-800" },
  { id: "ac", name: { ar: "التكييفات", en: "AC Maintenance" }, image: "https://images.unsplash.com/photo-1621905252507-b352224075b8?q=80&w=1000&auto=format&fit=crop&v=osta4", color: "from-cyan-400 to-cyan-600" },
  { id: "appliances", name: { ar: "صيانة أجهزة", en: "Home Appliances" }, image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=1000&auto=format&fit=crop&v=osta4", color: "from-purple-400 to-purple-600" },
  { id: "painting", name: { ar: "الدهانات", en: "Painting" }, image: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?q=80&w=1000&auto=format&fit=crop&v=osta4", color: "from-rose-400 to-rose-600" },
  { id: "aluminum", name: { ar: "الوميتال", en: "Aluminum" }, image: "https://images.unsplash.com/photo-1503708928676-1cb796a0891e?q=80&w=1000&auto=format&fit=crop&v=osta5", color: "from-slate-400 to-slate-600" },
  { id: "networks", name: { ar: "الشبكات", en: "Networks" }, image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=1000&auto=format&fit=crop&v=osta4", color: "from-indigo-400 to-indigo-600" },
  { id: "computer", name: { ar: "صيانة كمبيوتر", en: "Computer" }, image: "https://images.unsplash.com/photo-1588508065123-287b28e013da?q=80&w=1000&auto=format&fit=crop&v=osta4", color: "from-emerald-400 to-emerald-600" },
  { id: "cameras", name: { ar: "تركيب كاميرات", en: "CCTV" }, image: "https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=1000&auto=format&fit=crop&v=osta5", color: "from-red-400 to-red-600" },
];

export function LandingPage({ locale }: { locale: Locale }) {
  const isArabic = locale === "ar";
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  return (
    <div className="min-h-screen bg-onyx-950 onyx-shell-bg selection:bg-gold-500 selection:text-onyx-950 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-onyx-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <Link href={`/${locale}`} className="flex items-center gap-2 group">
            <div className="h-10 w-10 bg-gold-500 rounded-xl flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform duration-500">
              <span className="text-onyx-950 font-black text-xl">أ</span>
            </div>
            <span className="text-2xl font-black text-white tracking-tighter">OSTA <span className="text-gold-500">أُسطى v1.1</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href={`/${locale}/vendors`} className="text-sm font-medium text-onyx-300 hover:text-gold-500 transition-colors">
              {isArabic ? "المتاجر" : "Marketplace"}
            </Link>
            <Link href={`/${locale}/login`} className="text-sm font-medium text-onyx-300 hover:text-gold-500 transition-colors">
              {isArabic ? "تسجيل دخول" : "Login"}
            </Link>
            <Link href={`/${locale}/register/client`} className="btn-gold shadow-gold/20">
              {isArabic ? "ابدأ الآن" : "Get Started"}
            </Link>
          </div>

          <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-4">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ x: isArabic ? 100 : -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-500 text-xs font-bold mb-6">
              <ShieldCheck className="h-3.5 w-3.5" />
              {isArabic ? "منصة الحرفيين رقم 1 في مصر" : "Egypt's #1 Craftsman Platform"}
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.1] mb-6">
              {isArabic ? (
                <>
                  اطلب <span className="text-gold-gradient">أُسطى</span> محترف <br /> بنقرة واحدة
                </>
              ) : (
                <>
                  Hire a Professional <br /> <span className="text-gold-gradient">OSTA</span> in Seconds
                </>
              )}
            </h1>
            <p className="text-onyx-400 text-lg md:text-xl max-w-xl mb-10 leading-relaxed">
              {isArabic 
                ? "أول منصة تجمع أمهر الفنيين والمتاجر الموثقة في مصر. جودة مضمونة، أسعار عادلة، وتجربة مستخدم فاخرة."
                : "The first platform connecting skilled pros and verified stores in Egypt. Guaranteed quality, fair prices, and a premium experience."}
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link href={`/${locale}/register/worker`} className="w-full sm:w-auto btn-gold text-center py-4 px-8 text-lg">
                {isArabic ? "انضم كصنايعي" : "Join as Pro"}
              </Link>
              <Link href={`/${locale}/register/vendor`} className="w-full sm:w-auto btn-onyx text-center py-4 px-8 text-lg border-gold-500/30 text-gold-500">
                {isArabic ? "انضم كمتجر" : "Join as Vendor"}
              </Link>
            </div>

            <div className="mt-12 flex items-center gap-6">
              <div className="flex -space-x-3 rtl:space-x-reverse">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-10 w-10 rounded-full border-2 border-onyx-950 bg-onyx-800 flex items-center justify-center">
                    <Users className="h-5 w-5 text-gold-500" />
                  </div>
                ))}
              </div>
              <div className="text-sm">
                <div className="flex items-center gap-1 text-gold-500 mb-0.5">
                  {[1,2,3,4,5].map(i => <Star key={i} className="h-3 w-3 fill-current" />)}
                </div>
                <p className="text-onyx-400">
                  {isArabic ? "أكثر من 50,000 عميل يثقون بنا" : "Trusted by 50k+ customers"}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="absolute inset-0 bg-gold-500/20 blur-[120px] rounded-full animate-gold-pulse" />
            <div className="relative onyx-card-gold p-4 aspect-square flex items-center justify-center overflow-hidden">
               <div className="grid grid-cols-2 gap-4 w-full h-full">
                  {CRAFTS.slice(0, 4).map((craft, idx) => (
                    <div key={craft.id} className={cn(
                      "rounded-3xl relative overflow-hidden group transition-all duration-500",
                      "hover:scale-105 shadow-2xl shadow-black/50"
                    )}>
                      <img 
                        src={craft.image} 
                        alt={isArabic ? craft.name.ar : craft.name.en}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-onyx-950 via-onyx-950/20 to-transparent" />
                      <div className="absolute bottom-4 inset-x-4">
                        <span className="font-bold text-white text-lg">{isArabic ? craft.name.ar : craft.name.en}</span>
                      </div>
                    </div>
                  ))}
               </div>
            </div>
          </motion.div>
        </div>
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
                    "h-20 w-full rounded-2xl overflow-hidden mb-6 transition-transform duration-500 group-hover:scale-105 group-hover:rotate-1 relative",
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
                image: "https://images.unsplash.com/photo-1557597774-9d2739f85a76?q=80&w=800&auto=format&fit=crop", 
                title: isArabic ? "أمان تام" : "Full Security", 
                desc: isArabic ? "جميع الصنايعية موثقين بصورة البطاقة والفيش الجنائي." : "All pros are verified with national ID and criminal records." 
              },
              { 
                image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=800&auto=format&fit=crop", 
                title: isArabic ? "ضمان الجودة" : "Quality Guarantee", 
                desc: isArabic ? "نضمن لك جودة العمل، وفي حالة وجود مشكلة، نحن بجانبك." : "We guarantee the work quality, and we're here if anything goes wrong." 
              },
              { 
                image: "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?q=80&w=800&auto=format&fit=crop", 
                title: isArabic ? "سوق الخامات" : "Materials Market", 
                desc: isArabic ? "اطلب خاماتك من أقرب المتاجر الموثقة لباب بيتك." : "Order materials from the nearest verified stores to your doorstep." 
              }
            ].map((feature, i) => (
              <div key={i} className="text-center group">
                <div className="h-24 w-24 bg-onyx-800 rounded-3xl overflow-hidden mx-auto mb-8 border border-onyx-700 group-hover:border-gold-500/50 group-hover:gold-glow transition-all duration-500">
                  <img src={feature.image} alt={feature.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
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
        <div className="max-w-5xl mx-auto onyx-card-gold p-12 text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gold-gradient opacity-0 group-hover:opacity-5 transition-opacity" />
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
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 bg-onyx-950">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-8">
             <div className="h-8 w-8 bg-gold-500 rounded-lg flex items-center justify-center">
              <span className="text-onyx-950 font-black text-sm">أ</span>
            </div>
            <span className="text-xl font-black text-white tracking-tighter">OSTA <span className="text-gold-500">أُسطى</span></span>
          </div>
          <p className="text-onyx-500 text-sm">
            © {new Date().getFullYear()} OSTA Egypt. {isArabic ? "جميع الحقوق محفوظة." : "All rights reserved."}
          </p>
        </div>
      </footer>
    </div>
  );
}
