"use client";

import Link from "next/link";
import { Scale, ShieldCheck, AlertTriangle, FileText, MessageCircle } from "lucide-react";
import { publicPageCopy } from "@/lib/public-pages-copy";
import type { Locale } from "@/lib/locales";

const sectionIcons = [Scale, ShieldCheck, AlertTriangle, FileText];

export function TermsPage({ locale }: { locale: Locale }) {
  const isArabic = locale === "ar";
  const content = publicPageCopy[locale].pages.terms;

  return (
    <div dir={isArabic ? "rtl" : "ltr"} style={{ backgroundColor: "#f5bd18", minHeight: "100vh" }}>
      {/* ── Hero ── */}
      <section className="mx-auto flex max-w-3xl flex-col items-start px-4 py-8 text-start md:items-center md:px-12 md:py-20 md:text-center">
        <h1 className="mb-4 text-4xl font-black uppercase leading-tight tracking-tight text-[#1a1c1c] md:text-6xl">
          {content.title}
        </h1>
        <p className="max-w-xl text-base font-semibold leading-7 text-[#1a1c1c]/80 md:text-lg">
          {content.description}
        </p>
      </section>

      {/* ── Clauses ── */}
      <section className="mx-auto max-w-3xl px-4 pb-14 md:px-12 md:pb-24">
        <div className="flex flex-col gap-4 md:gap-5">
          {content.sections.map((section, index) => {
            const Icon = sectionIcons[index] ?? FileText;
            return (
              <article key={section.title} className="border-2 border-[#1a1c1c] bg-[#1a1c1c] p-5 md:p-7">
                <div className="mb-3 flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-gold text-[#1a1c1c]">
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <h2 className="text-base font-black uppercase text-white md:text-lg">
                    {section.title}
                  </h2>
                </div>
                <p className="text-sm font-semibold leading-7 text-[#c6c6c6] md:text-base">
                  {section.body}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      {/* ── Questions CTA ── */}
      <section className="mx-auto max-w-3xl px-4 pb-24 md:px-12 md:pb-28">
        <div className="flex flex-col items-start gap-5 border-2 border-[#1a1c1c] bg-[#1a1c1c] p-6 text-start md:flex-row md:items-center md:justify-between md:p-8">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-gold text-[#1a1c1c]">
              <MessageCircle className="h-6 w-6" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase text-white md:text-xl">
                {isArabic ? "عندك سؤال عن الشروط؟" : "Questions about these terms?"}
              </h2>
              <p className="text-sm font-semibold text-[#c6c6c6]">
                {isArabic ? "فريق الدعم جاهز يوضحلك أي بند من الشروط." : "Our support team can walk you through any clause."}
              </p>
            </div>
          </div>
          <Link
            href={`/${locale}/contact`}
            className="inline-block w-full shrink-0 border-2 border-gold px-6 py-3 text-center text-sm font-black uppercase tracking-wide text-gold transition-all duration-150 hover:bg-gold hover:text-[#1a1c1c] md:w-auto"
          >
            {isArabic ? "تواصل معنا" : "Contact Us"}
          </Link>
        </div>
      </section>
    </div>
  );
}
