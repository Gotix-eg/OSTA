"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserCircle2,
  Wrench,
  Store,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  MessageSquare,
  DollarSign,
  CheckCircle2,
  Layers3,
  UserPlus,
  MapPin,
  FileText,
  FileCheck,
  TrendingUp,
  Image,
  Upload
} from "lucide-react";
import type { Locale } from "@/lib/locales";
import { cn } from "@/lib/utils";

type Role = "client" | "worker" | "vendor";

interface Step {
  number: number;
  title: string;
  desc: string;
  icon: string; // Material Symbols icon name
  highlight?: string;
}

export function HowItWorksCustom({ locale }: { locale: Locale }) {
  const isArabic = locale === "ar";
  const [activeRole, setActiveRole] = useState<Role>("client");

  // Translation copy dictionary
  const copy = {
    ar: {
      eyebrow: "دليل الاستخدام",
      title: "يُمكِّن",
      titleHighlight: "المحترف",
      subtitle: "أوستا هو النظام البيئي الصناعي المتكامل الذي يربط الحرفيين المهرة بالموردين الموثوقين والعملاء الباحثين عن الجودة.",
      ctaTitle: "هل أنت مستعد للبدء؟",
      ctaSub: "سجل حسابك الآن وانضم إلى شبكة أوستا المتكاملة.",
      ctaClientBtn: "سجل كعميل",
      ctaPartnerBtn: "انضم كشريك",
      roles: {
        client: {
          label: "العملاء",
          desc: "احصل على خدمات منزلية فورية ومضمونة من فنيين موثقين.",
          cta: "سجل كعميل الآن",
          steps: [
            { number: 1, title: "سجل", desc: "أنشئ ملفك الشخصي الآمن في دقائق. التحقق عالي الجودة يضمن بيئة آمنة لجميع احتياجات الخدمة المتميزة.", icon: "how_to_reg" },
            { number: 2, title: "اطلب", desc: "انشر متطلبات مشروعك بتفاصيل دقيقة. نظامنا يصنف احتياجاتك لمطابقتها مع أكثر الحرفيين تأهلاً.", icon: "pending_actions" },
            { number: 3, title: "عروض", desc: "استقبل عروضاً شفافة ومفصلة من المحترفين الموثقين. بدون تكاليف خفية، مجرد قيمة حقيقية وحرفية خبيرة.", icon: "request_quote" },
            { number: 4, title: "تواصل", desc: "خط تواصل مباشر مع الخبير المختار. ناقش المخططات والجداول الزمنية والخدمات اللوجستية.", icon: "chat" },
            { number: 5, title: "اقبل", desc: "أبرم العقد بمصافحة رقمية. تُحتجز الأموال في الضمان لضمان جودة التسليم والتعويض العادل.", icon: "check_circle" },
            { number: 6, title: "قيّم", desc: "أكمل حلقة التغذية الراجعة. مراجعتك تبني سمعة أسطواتنا وتحافظ على معاييرنا العالية.", icon: "star_rate" }
          ]
        },
        worker: {
          label: "العمال",
          desc: "زد من دخلك اليومي واحصل على طلبات عمل حقيقية في منطقتك.",
          cta: "انضم كفني محترف",
          steps: [
            { number: 1, title: "الملف الشخصي", desc: "اعرض محفظتك وشهاداتك وخبراتك. تميّز كحرفي متميز في الصناعة.", icon: "account_box" },
            { number: 2, title: "الحرفة", desc: "اختر تخصصاتك الدقيقة في الحرفة. خوارزميتنا تُوجّه العروض ذات الصلة التي تتناسب مع مستوى مهاراتك.", icon: "construction" },
            { number: 3, title: "التنبيهات", desc: "إشعارات فورية للمشاريع ذات القيمة العالية في منطقتك. لا تفوّت فرصة لتطبيق خبراتك.", icon: "notification_important" },
            { number: 4, title: "عرض السعر", desc: "قدّم عطاءات احترافية باستخدام أدوات التقدير المدمجة. حدد نطاق عملك والمواد بوضوح.", icon: "list_alt" },
            { number: 5, title: "التفاوض", desc: "أنهِ الشروط مع العملاء مباشرة. منصتنا تدعم الشفافية المهنية في كل مرحلة من مراحل التفاوض.", icon: "handshake" },
            { number: 6, title: "المدفوعات", desc: "احصل على أجرك بأمان وفي الوقت المحدد. استمتع بأسرع دورة مدفوعات صناعية في السوق.", icon: "payments" }
          ]
        },
        vendor: {
          label: "الموردون",
          desc: "اعرض بضائعك لآلاف الفنيين والعملاء ووفر قطع الغيار اللازمة.",
          cta: "سجل متجرك الآن",
          steps: [
            { number: 1, title: "سجّل المتجر", desc: "أحضر متجرك للتوريد عبر الإنترنت. أدرج تفاصيل الخدمات اللوجستية والتوصيل في مركز الموردين المركزي.", icon: "storefront" },
            { number: 2, title: "المخزون", desc: "زامن كتالوج المواد الخاص بك. اسمح للحرفيين برؤية التوافر الفوري لمستلزمات التجارة الأساسية.", icon: "inventory_2" },
            { number: 3, title: "الطلبات", desc: "استقبل طلبات المواد بالجملة مباشرة من مواقع المشاريع. بسّط قمعك في B2B مع تنبيهات آلية.", icon: "local_shipping" },
            { number: 4, title: "عرض السعر", desc: "قدّم أسعاراً تنافسية للمواد والخدمات اللوجستية. اكسب العقود من خلال الحجم والموثوقية.", icon: "point_of_sale" },
            { number: 5, title: "الشحن", desc: "نسّق عمليات التوصيل بدقة. تتبع الخدمات اللوجستية من مستودعك إلى موقع مشروع الحرفي.", icon: "conveyor_belt" }
          ]
        }
      }
    },
    en: {
      eyebrow: "HOW-TO GUIDE",
      title: "Empowering the",
      titleHighlight: "Master Builder",
      subtitle: "OSTA is the premium industrial ecosystem connecting skilled craftsmen, reliable vendors, and quality-seeking clients through a seamless, high-integrity platform.",
      ctaTitle: "Ready to start your next",
      ctaTitleHighlight: "Masterpiece?",
      ctaSub: "Join OSTA today and be part of the premium industrial network.",
      ctaClientBtn: "Join as a Client",
      ctaPartnerBtn: "Become a Partner",
      roles: {
        client: {
          label: "Clients",
          desc: "Get instant, guaranteed home services from verified technicians.",
          cta: "Register as Client Now",
          steps: [
            { number: 1, title: "Register", desc: "Create your secure profile in minutes. High-integrity verification ensures a safe environment for all premium service needs.", icon: "how_to_reg" },
            { number: 2, title: "Request", desc: "Post your project requirements with precise details. Our system categorizes your needs to match with the most qualified craftsmen.", icon: "pending_actions" },
            { number: 3, title: "Quotes", desc: "Receive transparent, itemized quotes from verified professionals. No hidden costs, just raw value and expert craftsmanship.", icon: "request_quote" },
            { number: 4, title: "Chat", desc: "Direct line of communication with your chosen expert. Discuss blueprints, timelines, and logistics within our secure encrypted portal.", icon: "chat" },
            { number: 5, title: "Accept", desc: "Lock in the contract with a digital handshake. Funds are held in escrow to ensure quality delivery and fair compensation.", icon: "check_circle" },
            { number: 6, title: "Rate", desc: "Complete the feedback loop. Your review builds the reputation of our master builders and maintains our high standards.", icon: "star_rate" }
          ]
        },
        worker: {
          label: "Workers",
          desc: "Boost your daily income and get real maintenance jobs in your area.",
          cta: "Join as Professional Tech",
          steps: [
            { number: 1, title: "Profile", desc: "Showcase your portfolio, certifications, and expertise. Stand out as a premium craftsman in the industry.", icon: "account_box" },
            { number: 2, title: "Trade", desc: "Select your specific trade specialties. Our algorithm routes relevant leads that match your high-level skill set.", icon: "construction" },
            { number: 3, title: "Alerts", desc: "Real-time notifications for high-value projects in your area. Never miss an opportunity to apply your expertise.", icon: "notification_important" },
            { number: 4, title: "Quote", desc: "Submit professional bids using our built-in estimation tools. Clearly define your scope of work and materials.", icon: "list_alt" },
            { number: 5, title: "Negotiate", desc: "Finalize terms with clients directly. Our platform supports professional transparency at every negotiation stage.", icon: "handshake" },
            { number: 6, title: "Payout", desc: "Get paid securely and on time. Experience the fastest industrial payout cycle in the market upon job completion.", icon: "payments" }
          ]
        },
        vendor: {
          label: "Vendors",
          desc: "List your materials and spare parts for thousands of workers and clients.",
          cta: "Register Your Store Now",
          steps: [
            { number: 1, title: "Register Shop", desc: "Bring your supply store online. Onboard your logistics and fulfillment details to our centralized vendor hub.", icon: "storefront" },
            { number: 2, title: "Inventory", desc: "Sync your material catalog. Allow craftsmen to see real-time availability of essential trade supplies.", icon: "inventory_2" },
            { number: 3, title: "Requests", desc: "Receive bulk material requests directly from project sites. Streamline your B2B sales funnel with automated alerts.", icon: "local_shipping" },
            { number: 4, title: "Quote", desc: "Provide competitive pricing for materials and logistics. Win contracts through volume and reliability.", icon: "point_of_sale" },
            { number: 5, title: "Dispatch", desc: "Coordinate deliveries with precision. Track logistics from your warehouse to the craftsman's project location with full transparency.", icon: "conveyor_belt" }
          ]
        }
      }
    }
  };

  const currentCopy = (copy as any)[locale] || copy.en;
  const currentRoleData = currentCopy.roles[activeRole];

  const roleKeys: Role[] = ["client", "worker", "vendor"];

  return (
    <div
      dir={isArabic ? "rtl" : "ltr"}
      style={{ backgroundColor: "#f5bd18", minHeight: "100vh" }}
      className="font-sans"
    >
      {/* ── Hero Section ── */}
      <section className="px-4 md:px-12 py-20 flex flex-col items-center text-center max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-7xl font-black text-[#1a1c1c] mb-3 uppercase leading-tight tracking-tight">
          {currentCopy.title}{" "}
          <br />
          <span className="bg-[#1a1c1c] text-[#f5bd18] px-3 inline-block mt-1">
            {currentCopy.titleHighlight}
          </span>
        </h1>
        <p className="font-[Inter] text-lg text-[#1a1c1c]/80 max-w-2xl mt-6">
          {currentCopy.subtitle}
        </p>
      </section>

      {/* ── Interactive Tabs Section ── */}
      <section className="px-4 md:px-12 pb-20 max-w-[1280px] mx-auto">
        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {roleKeys.map((role) => {
            const isActive = activeRole === role;
            return (
              <button
                key={role}
                onClick={() => setActiveRole(role)}
                className={cn(
                  "px-8 py-3 font-black uppercase text-sm border-2 border-[#1a1c1c] transition-all duration-150",
                  isActive
                    ? "bg-white text-[#1a1c1c] shadow-[4px_4px_0px_#1a1c1c]"
                    : "bg-[#1a1c1c] text-[#f5bd18] hover:bg-[#1a1c1c]/80"
                )}
              >
                {currentCopy.roles[role].label}
              </button>
            );
          })}
        </div>

        {/* Step Cards Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeRole}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {currentRoleData.steps.map((step: any) => (
              <div
                key={step.number}
                className="group flex flex-col gap-4 p-6 border border-white/10 hover:border-[#f5bd18] transition-colors duration-300"
                style={{ backgroundColor: "#000000" }}
              >
                {/* Number + Icon */}
                <div className="flex justify-between items-start">
                  <span
                    className="font-black text-[#f5bd18] leading-none"
                    style={{ fontSize: "48px", opacity: 0.2 }}
                  >
                    {String(step.number).padStart(2, "0")}
                  </span>
                  <span
                    className="material-symbols-outlined text-[#f5bd18]"
                    style={{ fontSize: "36px" }}
                  >
                    {step.icon}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-black text-white uppercase text-xl tracking-wide">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="font-[Inter] text-base text-[#c6c6c6] leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </section>

      {/* ── Final CTA ── */}
      <section className="px-4 md:px-12 pb-20 max-w-[1280px] mx-auto">
        <div
          className="relative overflow-hidden p-12 md:p-16 text-center border border-white/10"
          style={{ backgroundColor: "#000000" }}
        >
          {/* Background glow decoration */}
          <div
            className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full blur-3xl"
            style={{ backgroundColor: "#f5bd18", opacity: 0.1 }}
          />

          <h2 className="font-black text-white uppercase text-3xl md:text-5xl mb-8">
            {currentCopy.ctaTitle}{" "}
            <br />
            <span className="text-[#f5bd18]">{currentCopy.ctaTitleHighlight || currentCopy.ctaSub}</span>
          </h2>

          <div className="flex flex-col md:flex-row justify-center gap-6">
            <Link
              href={`/${locale}/register/client`}
              className="inline-block px-10 py-4 font-black uppercase text-sm transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5"
              style={{
                backgroundColor: "#f5bd18",
                color: "#1a1c1c",
                boxShadow: "4px 4px 0px #ffffff40"
              }}
            >
              {currentCopy.ctaClientBtn}
            </Link>
            <Link
              href={`/${locale}/register/worker`}
              className="inline-block px-10 py-4 font-black uppercase text-sm border-2 border-[#f5bd18] text-[#f5bd18] hover:bg-[#f5bd18] hover:text-[#1a1c1c] transition-colors duration-200"
            >
              {currentCopy.ctaPartnerBtn}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
