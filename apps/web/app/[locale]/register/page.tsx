import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";

import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterChoices } from "@/components/auth/register-choices";
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
    },
    {
      key: "worker",
      title: isArabic ? "حساب فني / صنايعي" : "Technician / Pro",
      description: isArabic
        ? "استقبل طلبات يومية، كبّر صنعتك، وتحكم بساعات عملك ودخلك."
        : "Accept daily service jobs, grow your career, set flexible hours, and earn steady income.",
      href: `/${locale}/register/worker${querySuffix}`,
    },
    {
      key: "vendor",
      title: isArabic ? "حساب مورد / محل" : "Store Vendor",
      description: isArabic
        ? "أضف متجرك، وبع الخامات والأدوات للحرفيين والعملاء في منطقتك."
        : "Add your store, and sell materials and tools to technicians and clients near you.",
      href: `/${locale}/register/vendor${querySuffix}`,
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
        <RegisterChoices options={options} isArabic={isArabic} />

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
