import { notFound } from "next/navigation";

import { ContactForm } from "@/components/public/contact-form";
import { PublicShell } from "@/components/public/public-shell";
import { isLocale } from "@/lib/locales";

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  if (!isLocale(locale)) notFound();

  return (
    <PublicShell locale={locale} pathname="/contact">
      <ContactForm locale={locale} />
    </PublicShell>
  );
}
