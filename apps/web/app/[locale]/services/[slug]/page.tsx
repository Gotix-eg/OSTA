import { notFound } from "next/navigation";
import { serviceCategories } from "@/lib/shared";
import type { Locale } from "@/lib/locales";
import { ServiceWizard } from "@/components/services/service-wizard";

interface Props {
  params: { locale: Locale; slug: string };
}

export async function generateStaticParams() {
  const locales: Locale[] = ["ar", "en"];
  return serviceCategories.flatMap((cat) =>
    locales.map((locale) => ({ locale, slug: cat.slug }))
  );
}

export default function ServicePage({ params }: Props) {
  const category = serviceCategories.find((c) => c.slug === params.slug);
  if (!category) notFound();

  return <ServiceWizard locale={params.locale} category={category} />;
}
