import Link from "next/link";

import { ArrowUpRight, Layers3, ShieldCheck, UserCircle2 } from "lucide-react";

import { publicPageCopy, type PublicPageKey } from "@/lib/public-pages-copy";
import type { Locale } from "@/lib/locales";

const iconMap = [Layers3, ShieldCheck, UserCircle2];

export function PublicContentPage({ locale, pageKey }: { locale: Locale; pageKey: PublicPageKey }) {
  const content = publicPageCopy[locale].pages[pageKey];

  return (
    <div>
      <section className="dashboard-card deco-frame relative overflow-hidden p-7 sm:p-8">
        <div className="absolute inset-0 bg-dashboardGlow opacity-90" />
        <div className="relative max-w-4xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-primary-700">{content.eyebrow}</p>
          <h1 className="mt-4 font-serif text-5xl leading-[1.03] text-dark-950 sm:text-[3.8rem]">{content.title}</h1>
          <div className="deco-rule mt-5 max-w-xl" />
          <p className="mt-5 text-lg leading-8 text-dark-600">{content.description}</p>
        </div>
      </section>

      <div className="mt-10 grid gap-6 xl:grid-cols-3">
        {content.sections.map((section, index) => {
          const Icon = iconMap[index] ?? Layers3;

          return (
            <article key={section.title} className={index % 2 === 0 ? "dashboard-card deco-frame relative overflow-hidden p-6" : "dashboard-card deco-frame relative overflow-hidden bg-surface-peach p-6"}>
              <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-dark-950 text-white shadow-soft">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-5 font-serif text-3xl leading-tight text-dark-950">{section.title}</h2>
              <p className="mt-4 text-body leading-8 text-dark-600">{section.body}</p>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export function DashboardHubPage({ locale }: { locale: Locale }) {
  const content = publicPageCopy[locale].dashboards;

  return (
    <div>
      <section className="dashboard-card deco-frame relative overflow-hidden p-7 sm:p-8">
        <div className="absolute inset-0 bg-dashboardGlow opacity-90" />
        <div className="relative max-w-4xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-primary-700">{content.eyebrow}</p>
          <h1 className="mt-4 font-serif text-5xl leading-[1.03] text-dark-950 sm:text-[3.8rem]">{content.title}</h1>
          <div className="deco-rule mt-5 max-w-xl" />
          <p className="mt-5 text-lg leading-8 text-dark-600">{content.description}</p>
        </div>
      </section>

      <div className="mt-10 grid gap-6 xl:grid-cols-3">
        {content.cards.map((card, index) => {
          const Icon = iconMap[index] ?? Layers3;

          return (
            <Link
              key={card.href}
              href={`/${locale}${card.href}` as `/${string}`}
              className={index === 1 ? "group dashboard-card deco-frame relative overflow-hidden bg-surface-peach p-6 transition hover:-translate-y-1 hover:shadow-panel" : "group dashboard-card deco-frame relative overflow-hidden p-6 transition hover:-translate-y-1 hover:shadow-panel"}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-dark-950 text-white shadow-soft">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-5 font-serif text-3xl leading-tight text-dark-950">{card.title}</h2>
              <p className="mt-4 text-body leading-8 text-dark-600">{card.body}</p>
              <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary-700">
                Open
                <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-1 group-hover:-translate-y-1" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
