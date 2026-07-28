"use client";

import { useState } from "react";
import Link from "next/link";
import {
  UserCheck,
  ClipboardList,
  FileText,
  MessageSquare,
  CheckCircle2,
  Star,
  UserCircle2,
  Wrench,
  Bell,
  ListChecks,
  Wallet,
  Store,
  Package,
  Truck,
  CreditCard,
  Factory,
  BadgeDollarSign,
  UserPlus,
} from "lucide-react";
import type { Locale } from "@/lib/locales";
import { cn } from "@/lib/utils";

type Role = "client" | "worker" | "vendor";

const roleImages: Record<Role, string> = {
  client: "/images/auth-client.jpg",
  worker: "/images/auth-worker.jpg",
  vendor: "/images/auth-vendor.jpg",
};

const roleImageAlt: Record<Locale, Record<Role, string>> = {
  ar: {
    client: "عميل يستخدم منصة أُسطفاي",
    worker: "فني محترف على أُسطفاي",
    vendor: "متجر مورد على أُسطفاي",
  },
  en: {
    client: "OSTA client",
    worker: "OSTA professional worker",
    vendor: "OSTA vendor store",
  },
};

type StepDef = {
  number: number;
  title: string;
  desc: string;
  Icon: React.ElementType;
};

type RoleDef = {
  label: string;
  desc: string;
  cta: string;
  steps: StepDef[];
};

type Copy = {
  title: string;
  titleHighlight: string;
  subtitle: string;
  ctaTitle: string;
  ctaTitleHighlight?: string;
  ctaSub: string;
  ctaClientBtn: string;
  ctaPartnerBtn: string;
  roles: Record<Role, RoleDef>;
};

const copy: Record<string, Copy> = {
  ar: {
    title: "يُمكِّن",
    titleHighlight: "المحترف",
    subtitle: "أُسطفاي هو النظام البيئي الصناعي المتكامل الذي يربط الحرفيين المهرة بالموردين الموثوقين والعملاء الباحثين عن الجودة",
    ctaTitle: "جاهز؟",
    ctaTitleHighlight: "",
    ctaSub: "سجل حسابك الآن وانضم إلى شبكة أُسطفاي المتكاملة",
    ctaClientBtn: "يلا بينا !!",
    ctaPartnerBtn: "يلا بينا !!",
    roles: {
      client: {
        label: "العملاء",
        desc: "احصل على خدمات منزلية فورية ومضمونة من فنيين موثقين",
        cta: "يلا بينا !!",
        steps: [
          { number: 1, title: "سجل", desc: "أنشئ ملفك الشخصي الآمن في دقائق والتحقق عالي الجودة يضمن بيئة آمنة", Icon: UserCheck },
          { number: 2, title: "اطلب", desc: "انشر متطلبات مشروعك بتفاصيل دقيقة ونظامنا يصنف احتياجاتك لأكثر الأسطوات تأهلاً", Icon: ClipboardList },
          { number: 3, title: "عروض", desc: "استقبل عروضاً شفافة من الأسطوات بدون تكاليف خفية", Icon: FileText },
          { number: 4, title: "تواصل", desc: "خط تواصل مباشر مع الخبير المختار لمناقشة المخططات والجداول الزمنية", Icon: MessageSquare },
          { number: 5, title: "اقبل", desc: "إختار أفضل عرض من الأسطوات و أبدأ التنفيذ فورا", Icon: CheckCircle2 },
          { number: 6, title: "قيّم", desc: "كمل جميلك وقيم شغل الأسطى، و خلي غيرك يستفاد", Icon: Star },
        ],
      },
      worker: {
        label: "العمال",
        desc: "زد من دخلك اليومي واحصل على طلبات عمل حقيقية في منطقتك",
        cta: "يلا بينا !!",
        steps: [
          { number: 1, title: "الملف الشخصي", desc: "اعرض أعمالك وشهاداتك وخبراتك الي بتميزك كأسطى", Icon: UserCircle2 },
          { number: 2, title: "الحرفة", desc: "اختر تخصصاتك وخوارزميتنا تُوجّه العروض المناسبة", Icon: Wrench },
          { number: 3, title: "التنبيهات", desc: "إشعارات فورية للمشاريع ذات القيمة العالية في منطقتك", Icon: Bell },
          { number: 4, title: "عرض السعر", desc: "قدّم عطاءات احترافية وحدد نطاق عملك والمواد بوضوح", Icon: ListChecks },
          { number: 5, title: "التفاوض", desc: "أنهِ الشروط مع العملاء مباشرة بشفافية تامة وبدأ الشغلانه", Icon: MessageSquare },
          { number: 6, title: "المدفوعات", desc: "احصل على أجرك من العميل علي طول، بس ماتنساش تطلب تقيم من العميل و بالمره اعمل صور لشغلك وارفعها علي الصفحه بتعتك", Icon: Wallet },
        ],
      },
      vendor: {
        label: "الموردون",
        desc: "اعرض بضائعك لآلاف الفنيين والعملاء ووفر قطع الغيار اللازمة",
        cta: "يلا بينا !!",
        steps: [
          { number: 1, title: "سجّل المتجر", desc: "خلي متجرك متاح علي الانترنت", Icon: Store },
          { number: 2, title: "المخزون", desc: "أرفع بضاعتك علي أُسطفاي و خلي الأسطوات يشفوها", Icon: Package },
          { number: 3, title: "الطلبات", desc: "استقبل الطلبات مباشرة من علي أُسطفاي", Icon: Truck },
          { number: 4, title: "عرض السعر", desc: "قدّم أسعاراً تنافسية للمواد والخدمات اللوجستية", Icon: CreditCard },
          { number: 5, title: "الشحن", desc: "نسّق عمليات التوصيل من المستودع للعميل", Icon: Factory },
          { number: 6, title: "المدفوعات", desc: "استلم مستحقاتك وأرباح مبيعاتك مباشرة من العميل", Icon: Wallet },
        ],
      },
    },
  },
  en: {
    title: "Empowering the",
    titleHighlight: "Master Builder",
    subtitle: "OSTA is the premium industrial ecosystem connecting skilled craftsmen, reliable vendors, and quality-seeking clients through a seamless, high-integrity platform",
    ctaTitle: "Ready to start your next",
    ctaTitleHighlight: "Masterpiece?",
    ctaSub: "Join OSTA today and be part of the premium industrial network",
    ctaClientBtn: "يلا بينا !!",
    ctaPartnerBtn: "يلا بينا !!",
    roles: {
      client: {
        label: "Clients",
        desc: "Get instant, guaranteed home services from verified technicians",
        cta: "يلا بينا !!",
        steps: [
          { number: 1, title: "Register", desc: "Create your secure profile in minutes with high-integrity verification ensuring a safe environment for all premium service needs", Icon: UserCheck },
          { number: 2, title: "Request", desc: "Post your project requirements with precise details as our system categorizes your needs to match with the most qualified craftsmen", Icon: ClipboardList },
          { number: 3, title: "Quotes", desc: "Receive transparent itemized quotes from verified professionals with no hidden costs and pure expert craftsmanship", Icon: FileText },
          { number: 4, title: "Chat", desc: "Direct line of communication with your chosen expert to discuss blueprints timelines and logistics within our secure portal", Icon: MessageSquare },
          { number: 5, title: "Accept", desc: "Lock in the contract with a digital handshake where funds are held in escrow to ensure quality delivery and fair compensation", Icon: CheckCircle2 },
          { number: 6, title: "Rate", desc: "Complete the feedback loop where your review builds the reputation of our master builders and maintains our high standards", Icon: Star },
        ],
      },
      worker: {
        label: "Workers",
        desc: "Boost your daily income and get real maintenance jobs in your area",
        cta: "يلا بينا !!",
        steps: [
          { number: 1, title: "Profile", desc: "Showcase your portfolio certifications and expertise to stand out as a premium craftsman in the industry", Icon: UserCircle2 },
          { number: 2, title: "Trade", desc: "Select your specific trade specialties as our algorithm routes relevant leads that match your high-level skill set", Icon: Wrench },
          { number: 3, title: "Alerts", desc: "Real-time notifications for high-value projects in your area so you never miss an opportunity", Icon: Bell },
          { number: 4, title: "Quote", desc: "Submit professional bids using our built-in estimation tools to clearly define your scope of work and materials", Icon: ListChecks },
          { number: 5, title: "Negotiate", desc: "Finalize terms with clients directly as our platform supports professional transparency at every negotiation stage", Icon: MessageSquare },
          { number: 6, title: "Payout", desc: "Get paid securely and on time experiencing the fastest industrial payout cycle in the market", Icon: Wallet },
        ],
      },
      vendor: {
        label: "Vendors",
        desc: "List your materials and spare parts for thousands of workers and clients",
        cta: "يلا بينا !!",
        steps: [
          { number: 1, title: "Register Shop", desc: "Bring your supply store online and onboard your logistics and fulfillment details to our centralized vendor hub", Icon: Store },
          { number: 2, title: "Inventory", desc: "Sync your material catalog allowing craftsmen to see real-time availability of essential trade supplies", Icon: Package },
          { number: 3, title: "Requests", desc: "Receive bulk material requests directly from project sites to streamline your B2B sales funnel with automated alerts", Icon: Truck },
          { number: 4, title: "Quote", desc: "Provide competitive pricing for materials and logistics to win contracts through volume and reliability", Icon: CreditCard },
          { number: 5, title: "Dispatch", desc: "Coordinate deliveries with precision tracking logistics from your warehouse to the craftsman project location", Icon: Factory },
          { number: 6, title: "Payout", desc: "Receive your payment and sales earnings directly once the order is confirmed delivered", Icon: Wallet },
        ],
      },
    },
  },
};

export function HowItWorksCustom({ locale }: { locale: Locale }) {
  const isArabic = locale === "ar";
  const [activeRole, setActiveRole] = useState<Role>("client");

  const currentCopy: Copy = (copy[locale] ?? copy.en) as Copy;
  const currentRoleData: RoleDef = currentCopy.roles[activeRole];
  const roleKeys: Role[] = ["client", "worker", "vendor"];

  return (
    <div
      dir={isArabic ? "rtl" : "ltr"}
      style={{ backgroundColor: "#f5bd18", minHeight: "100vh" }}
    >
      {/* ── Hero Section ── */}
      <section className="mx-auto flex max-w-4xl flex-col items-start px-4 py-8 text-start md:items-center md:px-12 md:py-20 md:text-center">
        <h1 className="mb-3 text-4xl font-black uppercase leading-tight tracking-tight text-[#1a1c1c] md:text-7xl">
          {currentCopy.title}{" "}
          <br />
          <span className="bg-[#1a1c1c] text-[#f5bd18] px-3 inline-block mt-1">
            {currentCopy.titleHighlight}
          </span>
        </h1>
        <p className="mt-5 max-w-2xl text-base font-semibold leading-7 text-[#1a1c1c]/80 md:mt-6 md:text-lg">
          {currentCopy.subtitle}
        </p>
      </section>

      {/* ── Interactive Tabs Section ── */}
      <section className="mx-auto max-w-[1280px] px-4 pb-10 md:px-12 md:pb-20">
        {/* Tabs */}
        <div role="tablist" aria-label={currentCopy.title} className="mb-6 flex gap-3 overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch] md:mb-12 md:flex-wrap md:justify-center md:gap-4">
          {roleKeys.map((role) => {
            const isActive = activeRole === role;
            return (
              <button
                key={role}
                role="tab"
                aria-selected={isActive}
                aria-controls={`how-it-works-panel-${role}`}
                onClick={() => setActiveRole(role)}
                className={cn(
                  "min-h-11 shrink-0 border-2 border-[#1a1c1c] px-5 text-xs font-black uppercase transition-all duration-150 md:px-8 md:text-sm",
                  isActive
                    ? "bg-white text-[#1a1c1c]"
                    : "bg-[#1a1c1c] text-[#f5bd18] hover:bg-[#1a1c1c]/80"
                )}
              >
                {currentCopy.roles[role].label}
              </button>
            );
          })}
        </div>

        {/* Step Cards Grid */}
        <div
          id={`how-it-works-panel-${activeRole}`}
          role="tabpanel"
          className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3 opacity-100"
        >
          {currentRoleData.steps.map((step) => {
            const { Icon } = step;
            return (
              <div
                key={step.number}
                className="group flex flex-col gap-4 border border-white/10 p-5 transition-colors duration-300 hover:border-[#f5bd18]/60 md:p-6"
                style={{ backgroundColor: "#000000" }}
              >
                {/* Number + Icon */}
                <div className="flex justify-between items-start">
                  <span
                    className="font-black text-[#f5bd18] leading-none select-none text-3xl md:text-4xl"
                  >
                    {String(step.number).padStart(2, "0")}
                  </span>
                  <Icon
                    className="text-[#f5bd18] group-hover:scale-110 transition-transform duration-300"
                    size={32}
                    strokeWidth={1.5}
                  />
                </div>

                {/* Title */}
                <h3 className="text-2xl font-black uppercase tracking-wide text-[#f5bd18] md:text-3xl">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-sm font-semibold leading-7 text-[#c6c6c6] md:text-base">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="mx-auto max-w-[1280px] px-4 pb-28 md:px-12 md:pb-20">
        <div className="grid grid-cols-1 overflow-hidden border border-white/10 bg-black md:grid-cols-2 md:h-[420px]">
          <div className="relative h-64 w-full overflow-hidden md:h-full">
            <img
              key={activeRole}
              src={roleImages[activeRole]}
              alt={roleImageAlt[locale]?.[activeRole] ?? roleImageAlt.en[activeRole]}
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
          </div>

          <div className="flex flex-col items-start justify-center gap-6 p-8 text-start md:p-12">
            <h2 className="text-4xl font-black uppercase text-white md:text-6xl">
              {currentCopy.ctaTitle}
              {currentCopy.ctaTitleHighlight && (
                <span className="block text-gold mt-1">
                  {currentCopy.ctaTitleHighlight}
                </span>
              )}
            </h2>

            <Link
              href={`/${locale}/register/${activeRole}`}
              className="inline-block px-8 py-3.5 font-black uppercase text-lg md:text-xl tracking-wide transition-all duration-150 hover:bg-white"
              style={{
                backgroundColor: "#f5bd18",
                color: "#1a1c1c",
              }}
            >
              {currentCopy.ctaClientBtn}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
