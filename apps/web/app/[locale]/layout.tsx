import type { Metadata } from "next";
import type { ReactNode } from "react";

import { notFound } from "next/navigation";

import { getDirection, isLocale, supportedLocales, type Locale } from "@/lib/locales";
import { FloatingSupport } from "@/components/shared/floating-support";
import { SocketProvider } from "@/components/providers/socket-provider";
import { FloatingChatWidget } from "@/components/shared/floating-chat";

export function generateStaticParams() {
  return supportedLocales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isArabic = locale === "ar";

  return {
    title: isArabic ? "أُسطفاي | منصة الصنايعية الموثقين" : "OSTAFY | Verified Skilled Workers",
    description: isArabic
      ? "منصة تجمع أصحاب البيوت بفنيين موثقين مع دفع آمن وضمان على الخدمة."
      : "A premium platform connecting households with verified workers through secure payments and trusted service."
  };
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return (
    <div lang={locale} dir={getDirection(locale as Locale)} className="min-h-screen">
      <SocketProvider>
        {children}
        <FloatingSupport locale={locale as Locale} />
        <FloatingChatWidget />
      </SocketProvider>
    </div>
  );
}
