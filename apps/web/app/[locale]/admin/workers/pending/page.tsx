import { redirect } from "next/navigation";

export default async function AdminPendingWorkersRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect(`/${locale}/admin/workers`);
}

