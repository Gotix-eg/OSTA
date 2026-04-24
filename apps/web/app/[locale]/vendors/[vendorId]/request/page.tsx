import { notFound } from "next/navigation";
import { isLocale } from "@/lib/locales";
import { VendorRequestWizard } from "@/components/vendors/vendor-request-wizard";
import { PublicShell } from "@/components/public/public-shell";

export default async function VendorRequestPage({
  params
}: {
  params: Promise<{ locale: string; vendorId: string }>;
}) {
  const { locale, vendorId } = await params;

  if (!isLocale(locale)) notFound();

  return (
    <PublicShell locale={locale} pathname={`/vendors/${vendorId}/request`}>
      <VendorRequestWizard locale={locale} vendorId={vendorId} />
    </PublicShell>
  );
}
