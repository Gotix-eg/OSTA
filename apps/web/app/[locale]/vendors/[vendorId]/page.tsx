import { notFound } from "next/navigation";
import { isLocale } from "@/lib/locales";
import { VendorStore } from "@/components/vendors/vendor-store";
import { PublicShell } from "@/components/public/public-shell";

export default async function VendorStorePage({
  params
}: {
  params: Promise<{ locale: string; vendorId: string }>;
}) {
  const { locale, vendorId } = await params;

  if (!isLocale(locale)) notFound();

  return (
    <PublicShell locale={locale} pathname={`/vendors/${vendorId}`}>
      <div className="section-shell py-12">
        <VendorStore locale={locale} vendorId={vendorId} />
      </div>
    </PublicShell>
  );
}
