import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/locales";
import { WorkerProfileDetail } from "@/components/workers/worker-profile-detail";
import { PublicShell } from "@/components/public/public-shell";

export default async function WorkerProfilePage({
  params
}: {
  params: Promise<{ locale: string; workerId: string }>;
}) {
  const { locale, workerId } = await params;

  if (!isLocale(locale)) notFound();

  return (
    <PublicShell locale={locale as Locale} pathname={`/workers/${workerId}`}>
      <div className="section-shell py-12">
        <WorkerProfileDetail locale={locale as Locale} workerId={workerId} />
      </div>
    </PublicShell>
  );
}
