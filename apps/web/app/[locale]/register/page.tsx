import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { User, Wrench, Store, ArrowRight, ArrowLeft } from "lucide-react";

import { AuthShell } from "@/components/auth/auth-shell";
import { isLocale, type Locale } from "@/lib/locales";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "اختر نوع الحساب" : "Select Account Type",
    description:
      locale === "ar"
        ? "اختر نوع حسابك على أُسطفاي للبدء كعميل، فني/أُسطفاي، أو مورد خامات وأدوات."
        : "Choose your account type on Ostafy to get started as a client, technician/pro, or store vendor."
  };
}

export default async function RegisterChoicePage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ phone?: string; firstName?: string; lastName?: string; have?: string }>;
}) {
  const { locale } = await params;
  const { phone, firstName, lastName, have } = await searchParams;

  if (!isLocale(locale)) {
    notFound();
  }

  const isArabic = locale === "ar";

  const prefillQuery = new URLSearchParams();
  if (phone) prefillQuery.set("phone", phone);
  if (firstName) prefillQuery.set("firstName", firstName);
  if (lastName) prefillQuery.set("lastName", lastName);
  const querySuffix = prefillQuery.toString() ? `?${prefillQuery.toString()}` : "";

  const ownedRoles = new Set((have || "").split(",").map((r) => r.trim().toLowerCase()).filter(Boolean));

  const options = [
    {
      key: "client",
      title: isArabic ? "حساب عميل" : "Client Account",
      description: isArabic
        ? "اطلب فنيين موثقين، تتبع طلباتك، واحصل على ضمان للخدمات."
        : "Book verified technicians, trace active requests, and get guaranteed work quality.",
      href: `/${locale}/register/client${querySuffix}`,
      Icon: User
    },
    {
      key: "worker",
      title: isArabic ? "حساب فني / صنايعي" : "Technician / Pro",
      description: isArabic
        ? "استقبل طلبات يومية، كبّر صنعتك، وتحكم بساعات عملك ودخلك."
        : "Accept daily service jobs, grow your career, set flexible hours, and earn steady income.",
      href: `/${locale}/register/worker${querySuffix}`,
      Icon: Wrench
    },
    {
      key: "vendor",
      title: isArabic ? "حساب مورد / محل" : "Store Vendor",
      description: isArabic
        ? "أضف متجرك، وبع الخامات والأدوات للحرفيين والعملاء في منطقتك."
        : "Add your store, and sell materials and tools to technicians and clients near you.",
      href: `/${locale}/register/vendor${querySuffix}`,
      Icon: Store
    }
  ].filter((option) => !ownedRoles.has(option.key));

  const isAddingMode = ownedRoles.size > 0;

  return (
    <AuthShell
      locale={locale as Locale}
      pathname="/register"
      heading={isAddingMode ? (isArabic ? "إضافة وضع جديد" : "ADD A NEW MODE") : undefined}
      title={isAddingMode ? (isArabic ? "إضافة وضع جديد" : "Add a New Mode") : isArabic ? "انضم إلى أُسطفاي" : "Join Ostafy"}
      description={
        isAddingMode
          ? isArabic
            ? "اختر نوع الحساب الجديد الذي تريد إضافته. بياناتك الأساسية جاهزة بالفعل."
            : "Choose the new account type you'd like to add. Your basic details are already filled in."
          : isArabic
            ? "اختر نوع الحساب المناسب لك للبدء في استخدام المنصة."
            : "Select the account type that fits your needs to start using the platform."
      }
    >
      <div className="space-y-4 animate-fadeIn">
        <div className="grid gap-4">
          {options.map(({ key, title, description, href, Icon }) => (
            <Link
              key={key}
              href={href as `/${string}`}
              className="group relative flex items-start gap-4 border border-white/10 bg-[#121212] p-5 text-start transition-all hover:border-gold hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_#f5bd18] active:border-gold active:translate-x-1 active:translate-y-1 active:shadow-none duration-200"
              style={{
                boxShadow: "4px 4px 0px #000000"
              }}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-white/20 bg-black/40 text-gold transition-colors group-hover:bg-gold group-hover:text-black">
                <Icon className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-black uppercase text-white group-hover:text-gold transition-colors flex items-center gap-2">
                  {title}
                  {isArabic ? (
                    <ArrowLeft className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  ) : (
                    <ArrowRight className="h-4 w-4 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  )}
                </h3>
                <p className="mt-1 text-xs text-white/50 leading-relaxed font-semibold">
                  {description}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="pt-6 text-center text-sm font-semibold text-white/60 border-t border-white/5">
          {isArabic ? (
            <>
              لديك حساب بالفعل؟{" "}
              <Link href={`/${locale}/login`} className="text-gold hover:underline transition-colors font-bold">
                تسجيل الدخول
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link href={`/${locale}/login`} className="text-gold hover:underline transition-colors font-bold">
                Sign in
              </Link>
            </>
          )}
        </div>
      </div>
    </AuthShell>
  );
}
