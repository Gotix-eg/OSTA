import { AdminVendorsManagement } from "@/components/admin/admin-vendors";
import type { Locale } from "@/lib/locales";

export default function AdminVendorsPage({
  params: { locale }
}: {
  params: { locale: Locale }
}) {
  return (
    <div className="container mx-auto px-4 py-8">
      <AdminVendorsManagement locale={locale} />
    </div>
  );
}
