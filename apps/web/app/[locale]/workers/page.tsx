import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/locales";
import { WorkersDirectory } from "@/components/workers/workers-directory";
import { PublicShell } from "@/components/public/public-shell";

export default async function WorkersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  if (!isLocale(locale)) notFound();

  return (
    <PublicShell locale={locale as Locale} pathname="/workers">
      <div className="section-shell py-12">
        <WorkersDirectory locale={locale as Locale} />
      </div>
    </PublicShell>
  );
}
