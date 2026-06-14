import { notFound } from "next/navigation";

import { PublicContentPage } from "@/components/public/public-pages";
import { PublicShell } from "@/components/public/public-shell";
import { isLocale } from "@/lib/locales";

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  if (!isLocale(locale)) notFound();

  return (
    <PublicShell locale={locale} pathname="/terms">
      <div className="section-shell py-12">
        <PublicContentPage locale={locale} pageKey="terms" />
      </div>
    </PublicShell>
  );
}
