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
  icon: any;
  highlight?: string;
}

export function HowItWorksCustom({ locale }: { locale: Locale }) {
  const isArabic = locale === "ar";
  const [activeRole, setActiveRole] = useState<Role>("client");

  // Translation copy dictionary
  const copy = {
    ar: {
      eyebrow: "دليل الاستخدام",
      title: "كيف يعمل أُسطفاي؟",
      subtitle: "رحلتك نحو خدمات صيانة منزلية وقطع غيار بضمان وأمان تام تبدأ بخطوات بسيطة. اختر حسابك وتعرف على التفاصيل.",
      ctaTitle: "هل أنت مستعد للبدء؟",
      ctaSub: "سجل حسابك الآن وانضم إلى شبكة أُسطفاي المتكاملة.",
      roles: {
        client: {
          label: "عميل (طلب خدمات)",
          desc: "احصل على خدمات منزلية فورية ومضمونة من فنيين موثقين.",
          cta: "سجل كعميل الآن",
          steps: [
            {
              number: 1,
              title: "سجل حسابك",
              desc: "قم بإنشاء حساب عميل برقم هاتفك واسمك لتفعيل حسابك خلال ثوانٍ.",
              icon: UserPlus,
              highlight: "رقم الهاتف والاسم فقط"
            },
            {
              number: 2,
              title: "أنشئ طلب صيانة",
              desc: "حدد القسم (سباكة، كهرباء، نجارة، إلخ)، واكتب تفاصيل المشكلة مع إرفاق صور ومستوى الاستعجال.",
              icon: FileText,
              highlight: "صور وتفاصيل المشكلة"
            },
            {
              number: 3,
              title: "استقبل عروض الأسعار",
              desc: "ستتلقى عروضًا من فنيين موثقين قريبين منك. قارن بينهم بناءً على السعر، التقييم، وسرعة الرد.",
              icon: Layers3,
              highlight: "فنيين موثقين وقريبين"
            },
            {
              number: 4,
              title: "تواصل وتفاوض لايف",
              desc: "دردش مع الفني مباشرة في شات مباشر بالمنصة لتوضيح أي تفاصيل إضافية والاتفاق على الميزانية.",
              icon: MessageSquare,
              highlight: "شات مباشر فوري"
            },
            {
              number: 5,
              title: "اقبل العرض المناسب",
              desc: "بمجرد قبول العرض، سيبدأ الفني بالتحرك نحو موقعك لتنفيذ المهمة المطلوبة.",
              icon: CheckCircle2,
              highlight: "تحرك فوري للفني"
            },
            {
              number: 6,
              title: "أنهِ الطلب وقيم الخدمة",
              desc: "بعد انتهاء العمل، أكد إتمام الخدمة وقيم الفني لتفعيل ضمان العمل وللحفاظ على جودة الخدمات.",
              icon: ShieldCheck,
              highlight: "تفعيل الضمان والتقييم"
            }
          ]
        },
        worker: {
          label: "فني / عامل (تقديم خدمات)",
          desc: "زد من دخلك اليومي واحصل على طلبات عمل حقيقية في منطقتك.",
          cta: "انضم كفني محترف",
          steps: [
            {
              number: 1,
              title: "أنشئ حسابك المهني",
              desc: "سجل بياناتك الشخصية وارفع بطاقة الهوية والأوراق الرسمية للمراجعة والتوثيق الأمني.",
              icon: UserPlus,
              highlight: "توثيق أمني كامل لسلامتك"
            },
            {
              number: 2,
              title: "حدد تخصصك ونطاق عملك",
              desc: "اختر مهنتك الأساسية (مثل كهربائي، سباك) ومناطق التغطية الجغرافية التي ترغب بالعمل فيها.",
              icon: MapPin,
              highlight: "تخصصات ومناطق مرنة"
            },
            {
              number: 3,
              title: "استقبل طلبات الصيانة",
              desc: "ستصلك إشعارات فورية عن طلبات الصيانة المنشورة من عملاء في نطاقك الجغرافي وبنفس تخصصك.",
              icon: FileCheck,
              highlight: "إشعارات فورية لحظية"
            },
            {
              number: 4,
              title: "قدم عرض سعر مناسب",
              desc: "راجع تفاصيل المشكلة وصورها، وقدم للعميل عرض سعر منافس ومناسب للتنفيذ.",
              icon: DollarSign,
              highlight: "تقديم عروض أسعار"
            },
            {
              number: 5,
              title: "تفاوض واتفق عبر الشات",
              desc: "تحدث مع العميل داخل الشات المباشر، وأجب عن استفساراته لتأكيد الطلب وتعديل الميزانية إن لزم الأمر.",
              icon: MessageSquare,
              highlight: "شات لايف متكامل"
            },
            {
              number: 6,
              title: "نفذ الخدمة واستلم أرباحك",
              desc: "توجه للعميل، أنجز العمل بجودة عالية، وأكد إتمام الطلب لتستلم أرباحك مباشرة في محفظتك الإلكترونية.",
              icon: Wrench,
              highlight: "سحب أرباح سهل وسريع"
            }
          ]
        },
        vendor: {
          label: "متجر (توريد بضائع وقطع غيار)",
          desc: "اعرض بضائعك لآلاف الفنيين والعملاء ووفر قطع الغيار اللازمة للصيانة.",
          cta: "سجل متجرك الآن",
          steps: [
            {
              number: 1,
              title: "سجل بيانات متجرك",
              desc: "أنشئ حساب متجر، وحدد موقعك الجغرافي، وارفع السجل التجاري أو البطاقة الضريبية للمراجعة.",
              icon: UserPlus,
              highlight: "حساب متجر رسمي موثق"
            },
            {
              number: 2,
              title: "أضف منتجاتك وقطع الغيار",
              desc: "ارفع المنتجات، وحدد تفاصيلها، أسعارها، كمياتها المتوفرة، وصورها لتسهيل اختيارها.",
              icon: Upload,
              highlight: "إدارة مخزون مرنة وسهلة"
            },
            {
              number: 3,
              title: "استقبل طلبات قطع الغيار",
              desc: "تلقى طلبات فورية لقطع الغيار والمواد المطلوبة من الفنيين لإكمال طلبات الصيانة الجارية.",
              icon: FileCheck,
              highlight: "طلبات بيع مباشرة"
            },
            {
              number: 4,
              title: "أكد توافر البضائع وعروضك",
              desc: "قدم عروضك للمواد المطلوبة وأكد توافرها وأسعار التوصيل للعميل أو الفني.",
              icon: DollarSign,
              highlight: "عروض أسعار المواد"
            },
            {
              number: 5,
              title: "جهز الطلب للشحن أو الاستلام",
              desc: "بمجرد تأكيد الطلب، جهز المنتجات لتسليمها لشركة الشحن أو تسليمها للفني في موقع متجرك.",
              icon: Store,
              highlight: "شحن سريع واستلام مباشر"
            }
          ]
        }
      }
    },
    en: {
      eyebrow: "HOW-TO GUIDE",
      title: "How Ostafy Works?",
      subtitle: "Your journey to guaranteed, secure home maintenance and spare parts supply starts with simple steps. Select your account type to learn more.",
      ctaTitle: "Ready to get started?",
      ctaSub: "Register your account now and join the integrated Ostafy network.",
      roles: {
        client: {
          label: "Client (Book Services)",
          desc: "Get instant, guaranteed home services from verified technicians.",
          cta: "Register as Client Now",
          steps: [
            {
              number: 1,
              title: "Create Your Account",
              desc: "Create a client account with your name and phone number to activate it within seconds.",
              icon: UserPlus,
              highlight: "Only name and phone number"
            },
            {
              number: 2,
              title: "Post a Service Request",
              desc: "Choose the category (plumbing, electrical, etc.), describe the problem, attach photos and urgency level.",
              icon: FileText,
              highlight: "Photos & issue details"
            },
            {
              number: 3,
              title: "Receive Quotes",
              desc: "Get price offers from nearby verified technicians. Compare based on pricing, reviews, and response times.",
              icon: Layers3,
              highlight: "Verified local workers"
            },
            {
              number: 4,
              title: "Chat & Negotiate",
              desc: "Chat directly with the technician using the live in-app chat to clarify details and adjust budgets.",
              icon: MessageSquare,
              highlight: "Instant live chat"
            },
            {
              number: 5,
              title: "Accept & Begin",
              desc: "Once you accept the quote, the technician will head to your location to execute the job.",
              icon: CheckCircle2,
              highlight: "Worker heads to you"
            },
            {
              number: 6,
              title: "Complete & Review",
              desc: "Confirm completion, review the worker to activate your warranty and maintain service quality.",
              icon: ShieldCheck,
              highlight: "Warranty activation & rating"
            }
          ]
        },
        worker: {
          label: "Worker / Tech (Provide Services)",
          desc: "Boost your daily income and get real maintenance jobs in your neighborhood.",
          cta: "Join as Professional Tech",
          steps: [
            {
              number: 1,
              title: "Create Professional Account",
              desc: "Fill in your details and upload your ID card and documents for background checks and security vetting.",
              icon: UserPlus,
              highlight: "Full verification for safety"
            },
            {
              number: 2,
              title: "Set Trade & Coverage",
              desc: "Choose your primary trade (e.g. plumber, electrician) and define the geographic areas you service.",
              icon: MapPin,
              highlight: "Flexible trades and locations"
            },
            {
              number: 3,
              title: "Receive Job Alerts",
              desc: "Get instant notifications for new maintenance requests published by clients within your service area.",
              icon: FileCheck,
              highlight: "Real-time alerts"
            },
            {
              number: 4,
              title: "Submit Price Quote",
              desc: "Review the client's request details, description, and photos, and submit a competitive price offer.",
              icon: DollarSign,
              highlight: "Send custom bids"
            },
            {
              number: 5,
              title: "Negotiate via Chat",
              desc: "Chat live with the client, answer their questions, and adjust the budget if needed to close the deal.",
              icon: MessageSquare,
              highlight: "Fully integrated live chat"
            },
            {
              number: 6,
              title: "Deliver & Get Paid",
              desc: "Go to the client's site, complete the job with high quality, and mark it complete to receive earnings directly.",
              icon: Wrench,
              highlight: "Easy & fast payout withdrawal"
            }
          ]
        },
        vendor: {
          label: "Store (Supply Materials)",
          desc: "List your materials and spare parts for thousands of workers and clients.",
          cta: "Register Your Store Now",
          steps: [
            {
              number: 1,
              title: "Register Store Info",
              desc: "Create a vendor account, set your location, and upload your commercial register or tax documents.",
              icon: UserPlus,
              highlight: "Official verified store"
            },
            {
              number: 2,
              title: "Upload Products",
              desc: "Upload spare parts and materials with clear names, details, pricing, stock levels, and photos.",
              icon: Upload,
              highlight: "Easy inventory management"
            },
            {
              number: 3,
              title: "Receive Parts Requests",
              desc: "Get orders for spare parts and supplies required by technicians to complete ongoing jobs.",
              icon: FileCheck,
              highlight: "Direct selling opportunities"
            },
            {
              number: 4,
              title: "Provide Material Quotes",
              desc: "Submit your quotes for the requested materials, specifying availability and shipping/delivery details.",
              icon: DollarSign,
              highlight: "Material price quotes"
            },
            {
              number: 5,
              title: "Pack & Ship/Handover",
              desc: "Once accepted, pack the products for shipment or make them ready for technician pickup at your store.",
              icon: Store,
              highlight: "Fast shipping or pickup"
            }
          ]
        }
      }
    }
  };

  const currentCopy = copy[locale] || copy.ar;
  const currentRoleData = currentCopy.roles[activeRole];

  // Icons mapping for role tabs
  const tabIcons = {
    client: UserCircle2,
    worker: Wrench,
    vendor: Store
  };

  return (
    <div className="animate-fadeIn space-y-16 py-8">
      {/* ── Subpage Hero Section ── */}
      <section className="onyx-card relative overflow-hidden p-8 sm:p-12 lg:p-16 border-gold-500/10">
        {/* Decorative glow */}
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

      {/* ── Interactive Role Switcher Tabs ── */}
      <div className="flex flex-col items-center space-y-8">
        <div className="flex flex-wrap justify-center p-1.5 rounded-[2rem] bg-onyx-900 border border-white/5 gap-2 max-w-3xl w-full">
          {(["client", "worker", "vendor"] as Role[]).map((role) => {
            const IconComponent = tabIcons[role];
            const isActive = activeRole === role;

            return (
              <button
                key={role}
                onClick={() => setActiveRole(role)}
                className={cn(
                  "relative flex items-center justify-center gap-3 px-6 py-4 rounded-[1.5rem] font-bold text-sm transition-all duration-300 flex-1 min-w-[200px] outline-none",
                  isActive 
                    ? "text-onyx-950" 
                    : "text-onyx-400 hover:text-white hover:bg-white/[0.02]"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabGlow"
                    className="absolute inset-0 bg-gold-500 rounded-[1.5rem] shadow-lg shadow-gold-500/20"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <IconComponent className={cn("h-5 w-5 relative z-10", isActive ? "text-onyx-950" : "text-gold-500")} />
                <span className="relative z-10">{currentCopy.roles[role].label}</span>
              </button>
            );
          })}
        </div>
        <p className="text-sm font-medium text-onyx-400 text-center max-w-lg">
          {currentCopy.roles[activeRole].desc}
        </p>
      </div>

      {/* ── Step-by-Step Flow ── */}
      <div className="relative">
        {/* Timeline connecting line (desktop only) */}
        <div className={cn(
          "absolute top-0 bottom-0 w-1 bg-gradient-to-b from-gold-500/40 via-gold-500/10 to-transparent hidden lg:block",
          isArabic ? "right-1/2 translate-x-1/2" : "left-1/2 -translate-x-1/2"
        )} />

        <div className="space-y-12 lg:space-y-20 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeRole}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="space-y-12 lg:space-y-16"
            >
              {currentRoleData.steps.map((step, idx) => {
                const StepIcon = step.icon;
                const isEven = idx % 2 === 0;

                return (
                  <div
                    key={step.number}
                    className={cn(
                      "flex flex-col lg:flex-row items-center gap-8 lg:gap-16 w-full",
                      isEven ? "lg:flex-row" : "lg:flex-row-reverse"
                    )}
                  >
                    {/* Left/Right Text Content Card */}
                    <div className="flex-1 w-full">
                      <div className={cn(
                        "onyx-card p-8 sm:p-10 border-gold-500/10 hover:border-gold-500/30 transition-all group relative overflow-hidden",
                        isEven ? "lg:text-left rtl:lg:text-right" : "lg:text-right rtl:lg:text-left"
                      )}>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/[0.02] blur-[40px] rounded-full" />
                        <div className="flex items-center gap-4 mb-6 justify-start">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-500/10 text-gold-500 border border-gold-500/20 group-hover:scale-110 transition-transform duration-500">
                            <StepIcon className="h-5 w-5" />
                          </div>
                          <span className="text-xs font-black tracking-widest text-gold-500/80 uppercase">
                            {isArabic ? `الخطوة ${step.number}` : `STEP ${step.number}`}
                          </span>
                        </div>

                        <h3 className="text-xl sm:text-2xl font-black text-white mb-4 group-hover:text-gold-500 transition-colors">
                          {step.title}
                        </h3>
                        <p className="text-onyx-300 leading-relaxed text-sm sm:text-base">
                          {step.desc}
                        </p>
                        
                        {step.highlight && (
                          <div className="mt-6 inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full text-xs font-medium text-gold-500/90 border border-white/5">
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>{step.highlight}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Timeline Center Point Indicator (desktop only) */}
                    <div className="relative flex items-center justify-center z-10 hidden lg:flex">
                      <div className="h-16 w-16 rounded-full bg-onyx-950 border-4 border-onyx-900 flex items-center justify-center shadow-2xl text-gold-500 font-black text-xl hover:scale-110 transition-transform duration-300">
                        {step.number}
                      </div>
                    </div>

                    {/* Empty placeholder to balance the grid layout */}
                    <div className="flex-1 w-full hidden lg:block" />
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Call to Action / Footer Section ── */}
      <section className="onyx-card relative overflow-hidden p-8 sm:p-12 lg:p-16 border-gold-500/10 text-center space-y-8">
        <div className="absolute inset-0 bg-gradient-to-b from-gold-500/[0.03] to-transparent pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold-500/5 blur-[150px] rounded-full pointer-events-none" />
        
        <div className="max-w-2xl mx-auto space-y-4 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {currentCopy.ctaTitle}
          </h2>
          <p className="text-onyx-400 text-sm sm:text-base max-w-lg mx-auto">
            {currentCopy.ctaSub}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10 max-w-lg mx-auto">
          <Link 
            href={`/${locale}/register/${activeRole}`} 
            className="btn-gold flex items-center justify-center gap-3 w-full py-4 text-center font-black"
          >
            <span>{currentRoleData.cta}</span>
            {isArabic ? <ArrowLeft className="h-4.5 w-4.5" /> : <ArrowRight className="h-4.5 w-4.5" />}
          </Link>
        </div>
      </section>
    </div>
  );
}
