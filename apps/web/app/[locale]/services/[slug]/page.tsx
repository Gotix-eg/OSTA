import { serviceCategories } from "@/lib/shared";
import type { Locale } from "@/lib/locales";
import { ServiceWizard } from "@/components/services/service-wizard";

interface Props {
  params: { locale: Locale; slug: string };
}

// Allow any slug from the database (not just statically known ones)
export const dynamic = "force-dynamic";

export default function ServicePage({ params }: Props) {
  // Try to find in constants; if not found, build a generic fallback
  const category = serviceCategories.find((c) => c.slug === params.slug) ?? {
    id: params.slug,
    slug: params.slug,
    icon: "Wrench",
    workersAvailable: 200,
    name: { ar: "خدمة متخصصة", en: "Specialized Service" },
    description: {
      ar: "احجز أفضل فني متخصص في منطقتك الآن.",
      en: "Book the best specialist in your area now."
    },
    services: []
  };

  return <ServiceWizard locale={params.locale} category={category} />;
}
