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
  const isLogin = pathname === "/login";

  return (
    <main className="relative min-h-screen overflow-hidden bg-onyx-950 onyx-shell-bg text-onyx-50 selection:bg-gold-500 selection:text-onyx-950">
      <div className="absolute inset-0 onyx-grid opacity-10" />
      
      {/* Top Navigation Bar */}
      <header className="relative z-10 mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between border-b border-white/5 pb-4">
          <Link href={`/${locale}`} className="flex items-center gap-2 group">
            <img src="/logo.svg" alt="Ostafy" className="h-12 w-auto" />
          </Link>
          <LocaleSwitcher locale={locale} pathname={pathname} className="rounded-xl border border-onyx-700 bg-onyx-800 px-4 py-2 text-sm font-semibold text-onyx-950 md:text-onyx-200 hover:border-onyx-600 transition" />
        </div>
      </header>

      <div className="relative mx-auto flex min-h-[calc(100vh-5.5rem)] max-w-7xl items-center px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <div className="grid w-full gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="flex flex-col justify-center py-8">
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
                  {isArabic ? "أهلاً بك" : (isLogin ? "Welcome Back" : "Welcome")}
                </h2>
              </div>
              
              {children}

              <div className="mt-10 pt-8 border-t border-white/5 text-center">
                <p className="text-sm text-onyx-500">
                  {isArabic ? (
                    <>
                      بالتسجيل، أنت توافق على{" "}
                      <Link href={`/${locale}/terms`} className="underline text-gold-500 hover:text-gold-400 transition-colors">
                        شروط الخدمة
                      </Link>
                      .
                    </>
                  ) : (
                    <>
                      By joining, you agree to our{" "}
                      <Link href={`/${locale}/terms`} className="underline text-gold-500 hover:text-gold-400 transition-colors">
                        Terms of Service
                      </Link>
                      .
                    </>
                  )}
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
