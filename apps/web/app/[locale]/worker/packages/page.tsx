import { notFound } from "next/navigation";
import { isLocale } from "@/lib/locales";
import { WorkerPackages } from "@/components/worker/worker-packages";

export default async function WorkerPackagesPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) notFound();

  return (
    <div className="section-shell">
      <WorkerPackages locale={locale} />
    </div>
  );
}
