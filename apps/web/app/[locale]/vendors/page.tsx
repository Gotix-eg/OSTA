import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/locales";
import { PublicShell } from "@/components/public/public-shell";
import { Construction } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "المتاجر والورش" : "Verified Vendors"
  };
}

export default async function VendorsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  if (!isLocale(locale)) notFound();

  return (
    <PublicShell locale={locale} pathname="/vendors">
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
          <Construction className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-bold mb-4">
          {locale === "ar" ? "قريباً" : "Under Construction"}
        </h1>
        <p className="text-muted-foreground text-lg max-w-md">
          {locale === "ar" 
            ? "نحن نعمل بجد لإطلاق قسم المتاجر والورش. يرجى العودة قريباً!" 
            : "We are working hard to launch the Vendors section. Please check back soon!"}
        </p>
      </div>
    </PublicShell>
  );
}
