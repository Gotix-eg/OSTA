"use client";

import { motion } from "framer-motion";
import { 
  ShieldCheck, 
  Handshake, 
  Sparkles, 
  Star, 
  Users2, 
  Briefcase, 
  Globe2, 
  CheckCircle,
  Eye,
  Target
} from "lucide-react";
import type { Locale } from "@/lib/locales";
import { cn } from "@/lib/utils";

export function AboutProfileCustom({ locale }: { locale: Locale }) {
  const isArabic = locale === "ar";

  // Translation copy dictionary
  const copy = {
    ar: {
      eyebrow: "من نحن",
      title: "ملف أُسطفاي التعريفي",
      subtitle: "ريادة مصرية متكاملة لتنظيم وتطوير قطاع الصيانة المنزلية والخدمات الفنية من خلال حلول تقنية مبتكرة وآمنة.",
      
      missionTitle: "رسالتنا",
      missionDesc: "نهدف إلى تمكين أصحاب المنازل والمنشآت من الوصول الآمن والسريع لأكفأ الكوادر الفنية (الصنايعية) الموثقين، مع تنظيم وضمان جودة الخدمات وتقديم حلول تقنية تسهل حياة الفرد والمجتمع وتطور أداء الحرفي المصري.",
      
      visionTitle: "رؤيتنا",
      visionDesc: "أن نكون المنصة الأولى والأكثر موثوقية في مصر والشرق الأوسط للخدمات المنزلية والمهنية وتوريد قطع الغيار، ورفع معايير السلامة المهنية ومستوى المعيشة للحرفيين والمهنيين.",
      
      valuesTitle: "قيمنا الأساسية",
      valuesSubtitle: "المبادئ التي توجه عملنا اليومي للحفاظ على ثقة عملائنا وشركائنا.",
      
      values: [
        {
          title: "الأمان والتوثيق الكامل",
          desc: "لا يمكن لأي فني أو متجر النشاط في المنصة قبل المرور بمراجعة أمنية دقيقة تشمل فحص الهوية والفيش الجنائي والأوراق الرسمية.",
          icon: ShieldCheck
        },
        {
          title: "التسعير العادل والشفافية",
          desc: "نحارب الاحتكار والعمولات المخفية، ونعطي العميل والفني كامل الحرية للتواصل والاتفاق المباشر على ميزانية الطلبات بكل وضوح.",
          icon: Handshake
        },
        {
          title: "الضمان والجودة",
          desc: "نضمن حقوق جميع الأطراف. كل عملية صيانة تتم عبر أُسطفاي مغطاة بضمان حقيقي، مع وجود دعم فني مستعد للتدخل وحل الشكاوى.",
          icon: CheckCircle
        },
        {
          title: "التميز التقني",
          desc: "نسخر التكنولوجيا الحديثة لتسهيل التواصل والتشغيل عبر دردشة ذكية فورية، وإشعارات لحظية، وتتبع مباشر لمراحل الطلب.",
          icon: Sparkles
        }
      ],

      statsTitle: "أُسطفاي بالأرقام",
      stats: [
        { value: "+٥,٠٠٠", label: "فني وصنايعي موثق", icon: Users2 },
        { value: "+١٢,٠٠٠", label: "طلب صيانة ناجح", icon: Briefcase },
        { value: "١٥", label: "محافظة مغطاة في مصر", icon: Globe2 },
        { value: "٩٨٪", label: "نسبة رضا العملاء", icon: Star }
      ]
    },
    en: {
      eyebrow: "ABOUT US",
      title: "Ostafy Platform Profile",
      subtitle: "Bilingual Egyptian leadership in organizing and developing the home maintenance and technical services sector through innovative, safe technology.",
      
      missionTitle: "Our Mission",
      missionDesc: "We aim to empower homeowners and businesses with safe, fast access to the most skilled verified technicians, while organizing and guaranteeing service quality, providing technical solutions that improve lives, and elevating the profession of Egyptian craftsmen.",
      
      visionTitle: "Our Vision",
      visionDesc: "To be the leading and most trusted platform in Egypt and the Middle East for home and professional services, spare parts supply, raising occupational safety standards, and improving the standard of living for skilled technicians.",
      
      valuesTitle: "Our Core Values",
      valuesSubtitle: "The principles guiding our daily operations to maintain the trust of our clients and partners.",
      
      values: [
        {
          title: "Safety & Verification",
          desc: "No worker or store is activated without full background checks, including national ID verification, criminal record review, and documentation checks.",
          icon: ShieldCheck
        },
        {
          title: "Transparency & Fair Pricing",
          desc: "We eliminate hidden fees and monopolies, giving clients and technicians full freedom to chat and agree on custom budgets directly.",
          icon: Handshake
        },
        {
          title: "Quality & Warranty",
          desc: "We protect everyone's rights. Every request completed on Ostafy is backed by a real warranty and a dedicated support team to resolve disputes.",
          icon: CheckCircle
        },
        {
          title: "Technical Excellence",
          desc: "We utilize modern technologies to streamline communication: in-app live chat, push notifications, and live status tracking.",
          icon: Sparkles
        }
      ],

      statsTitle: "Ostafy in Numbers",
      stats: [
        { value: "5,000+", label: "Verified Technicians", icon: Users2 },
        { value: "12,000+", label: "Successful Orders", icon: Briefcase },
        { value: "15+", label: "Provinces Covered", icon: Globe2 },
        { value: "98%", label: "Client Satisfaction Rate", icon: Star }
      ]
    }
  };

  const currentCopy = copy[locale] || copy.ar;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="animate-fadeIn space-y-16 py-8">
      {/* ── Subpage Hero Section ── */}
      <section className="onyx-card relative overflow-hidden p-8 sm:p-12 lg:p-16 border-gold-500/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/5 blur-[120px] rounded-full -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold-500/5 blur-[100px] rounded-full -ml-32 -mb-32" />
        
        <div className="relative max-w-4xl space-y-6">
          <span className="inline-flex rounded-full bg-gold-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.4em] text-gold-500 border border-gold-500/20">
            {currentCopy.eyebrow}
          </span>
          <h1 className="text-4xl sm:text-6xl font-black text-white leading-tight tracking-tight">
            {currentCopy.title}
          </h1>
          <div className="h-1.5 w-28 bg-gradient-to-r from-gold-500 to-transparent rounded-full" />
          <p className="text-lg sm:text-xl leading-relaxed text-onyx-300 max-w-3xl">
            {currentCopy.subtitle}
          </p>
        </div>
      </section>

      {/* ── Mission & Vision ── */}
      <div className="grid gap-8 md:grid-cols-2">
        <motion.div 
          initial={{ opacity: 0, x: isArabic ? 30 : -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="onyx-card p-8 sm:p-10 border-gold-500/10 hover:border-gold-500/20 transition-all group"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-500/10 text-gold-500 border border-gold-500/20">
              <Target className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-black text-white group-hover:text-gold-500 transition-colors">
              {currentCopy.missionTitle}
            </h2>
          </div>
          <p className="text-onyx-300 leading-relaxed text-base sm:text-lg">
            {currentCopy.missionDesc}
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: isArabic ? -30 : 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="onyx-card p-8 sm:p-10 border-gold-500/10 hover:border-gold-500/20 transition-all group"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-500/10 text-gold-500 border border-gold-500/20">
              <Eye className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-black text-white group-hover:text-gold-500 transition-colors">
              {currentCopy.visionTitle}
            </h2>
          </div>
          <p className="text-onyx-300 leading-relaxed text-base sm:text-lg">
            {currentCopy.visionDesc}
          </p>
        </motion.div>
      </div>

      {/* ── Statistics Counters ── */}
      <section className="onyx-card p-8 sm:p-12 border-gold-500/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gold-500/[0.01] pointer-events-none" />
        
        <div className="text-center mb-10 max-w-lg mx-auto">
          <h2 className="text-3xl font-black text-white">{currentCopy.statsTitle}</h2>
          <div className="h-1 w-16 bg-gold-500 mx-auto mt-4 rounded-full" />
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid gap-6 grid-cols-2 lg:grid-cols-4"
        >
          {currentCopy.stats.map((stat, idx) => {
            const StatIcon = stat.icon;

            return (
              <motion.div 
                key={idx}
                variants={itemVariants}
                className="flex flex-col items-center justify-center text-center p-6 bg-white/[0.01] rounded-2xl border border-white/5 hover:border-gold-500/20 transition-all group"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-500/10 text-gold-500 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <StatIcon className="h-5 w-5" />
                </div>
                <div className="text-3xl sm:text-4xl font-black text-white text-gold-gradient mb-2">
                  {stat.value}
                </div>
                <p className="text-xs sm:text-sm font-semibold text-onyx-400">
                  {stat.label}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* ── Core Values Grid ── */}
      <div className="space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-3">
          <h2 className="text-3xl font-black text-white">{currentCopy.valuesTitle}</h2>
          <p className="text-sm text-onyx-400">{currentCopy.valuesSubtitle}</p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid gap-6 md:grid-cols-2"
        >
          {currentCopy.values.map((val, idx) => {
            const ValIcon = val.icon;

            return (
              <motion.div 
                key={idx}
                variants={itemVariants}
                className="onyx-card p-8 group border-gold-500/10 hover:border-gold-500/30 transition-all flex gap-6"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-500 text-onyx-950 shadow-gold/10 shadow-lg flex-shrink-0 group-hover:rotate-6 transition-all duration-300">
                  <ValIcon className="h-6 w-6" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-white group-hover:text-gold-500 transition-colors">
                    {val.title}
                  </h3>
                  <p className="text-onyx-400 leading-relaxed text-sm sm:text-base">
                    {val.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
