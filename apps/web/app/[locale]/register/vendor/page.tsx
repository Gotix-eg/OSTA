import { notFound } from "next/navigation";

import { VendorRegisterForm } from "@/components/auth/auth-forms";
import { AuthShell } from "@/components/auth/auth-shell";
import { authCopy } from "@/lib/copy";
import { isLocale } from "@/lib/locales";

export default async function RegisterVendorPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return (
    <AuthShell
      locale={locale}
      pathname="/register/vendor"
      title={authCopy[locale].registerVendorTitle}
      description={
        locale === "ar"
          ? "سجل كمورد قطع غيار. أضف تفاصيل متجرك وحدد منطقة عملك لاستقبال الطلبات."
          : "Register as a parts vendor. Add your store details and define your area to receive requests."
      }
    >
      <VendorRegisterForm locale={locale} />
    </AuthShell>
  );
}
