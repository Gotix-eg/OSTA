import { AdminWorkersManagement } from "@/components/admin/admin-workers";
import type { Locale } from "@/lib/locales";

export default async function AdminWorkersPage({
  params
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;

  return (
    <div className="section-shell">
      <AdminWorkersManagement locale={locale} />
    </div>
  );
}
