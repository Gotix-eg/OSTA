import type { ReactNode } from "react";
import Link from "next/link";
import { LocaleSwitcher } from "@/components/shared/locale-switcher";
import type { Locale } from "@/lib/locales";
import { ShieldCheck, Lock, Headphones } from "lucide-react";

interface AuthShellProps {
  locale: Locale;
  pathname: string;
  title: string;
  description: string;
  children: ReactNode;
}

export function AuthShell({ locale, pathname, title, description, children }: AuthShellProps) {
  const isArabic = locale === "ar";

  return (
    <main className="relative min-h-screen overflow-hidden bg-onyx-950 onyx-shell-bg text-onyx-50 selection:bg-gold-500 selection:text-onyx-950">
      <div className="absolute inset-0 onyx-grid opacity-10" />
      
      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid w-full gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="flex flex-col justify-center py-8">
            <Link href={`/${locale}`} className="flex items-center gap-2 mb-12 group">
               <div className="h-10 w-10 bg-gold-500 rounded-xl flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform duration-500 shadow-gold/20 shadow-lg">
                <span className="text-onyx-950 font-black text-xl">أ</span>
              </div>
              <span className="text-2xl font-black text-white tracking-tighter">OSTA <span className="text-gold-500">أُسطى</span></span>
            </Link>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-500 text-xs font-bold mb-8 w-fit">
              <ShieldCheck className="h-3.5 w-3.5" />
              {isArabic ? "منصة الحرفيين الموثقة" : "Verified Pro Marketplace"}
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
              {title}
            </h1>
            <p className="text-onyx-400 text-lg leading-relaxed max-w-xl mb-12">
              {description}
            </p>

            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { icon: ShieldCheck, label: isArabic ? "توثيق آمن" : "Secure Auth" },
                { icon: Lock, label: isArabic ? "بيانات محمية" : "Data Safety" },
                { icon: Headphones, label: isArabic ? "دعم مستمر" : "24/7 Support" }
              ].map((item, i) => (
                <div key={i} className="onyx-card p-4 border-white/5 bg-white/5">
                   <item.icon className="h-6 w-6 text-gold-500 mb-3" />
                   <p className="text-sm font-bold text-white">{item.label}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="relative">
            <div className="absolute inset-0 bg-gold-500/10 blur-[80px] rounded-full -z-10" />
            <div className="onyx-card p-8 md:p-12 border-gold-500/20 bg-onyx-900/80 backdrop-blur-2xl">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-xl font-bold text-white">
                  {isArabic ? "أهلاً بك" : "Welcome Back"}
                </h2>
                <LocaleSwitcher locale={locale} pathname={pathname} className="rounded-xl border border-onyx-700 bg-onyx-800 px-4 py-2 text-sm font-semibold text-onyx-200" />
              </div>
              
              {children}

              <div className="mt-10 pt-8 border-t border-white/5 text-center">
                <p className="text-sm text-onyx-500">
                  {isArabic ? "بالتسجيل، أنت توافق على شروط الخدمة." : "By joining, you agree to our Terms of Service."}
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
