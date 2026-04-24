"use client";

import Link from "next/link";
import { ArrowUpRight, Layers3, ShieldCheck, UserCircle2, Sparkles } from "lucide-react";
import { publicPageCopy, type PublicPageKey } from "@/lib/public-pages-copy";
import type { Locale } from "@/lib/locales";
import { cn } from "@/lib/utils";

const iconMap = [Layers3, ShieldCheck, UserCircle2];

export function PublicContentPage({ locale, pageKey }: { locale: Locale; pageKey: PublicPageKey }) {
  const isArabic = locale === "ar";
  const content = publicPageCopy[locale].pages[pageKey];

  return (
    <div className="animate-fadeIn space-y-12">
      {/* ── Hero Section ── */}
      <section className="onyx-card relative overflow-hidden p-8 sm:p-12 lg:p-16 border-gold-500/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/5 blur-[120px] rounded-full -mr-48 -mt-48" />
        <div className="relative max-w-4xl">
          <span className="inline-flex rounded-full bg-gold-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.4em] text-gold-500 mb-6 border border-gold-500/20">
            {content.eyebrow}
          </span>
          <h1 className="text-4xl sm:text-6xl font-black text-white leading-tight tracking-tight mb-8">
            {content.title}
          </h1>
          <div className="h-1 w-24 bg-gradient-to-r from-gold-500 to-transparent mb-8 rounded-full" />
          <p className="text-xl leading-relaxed text-onyx-400 max-w-2xl">
            {content.description}
          </p>
        </div>
      </section>

      {/* ── Feature Grid ── */}
      <div className="grid gap-6 xl:grid-cols-3">
        {content.sections.map((section, index) => {
          const Icon = iconMap[index] ?? Layers3;

          return (
            <article 
              key={section.title} 
              className={cn(
                "onyx-card p-8 group hover:border-gold-500/30 transition-all duration-500",
                index % 2 !== 0 && "bg-onyx-800/80 border-gold-500/5"
              )}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-500 text-onyx-950 shadow-gold/20 shadow-xl mb-8 group-hover:scale-110 transition-transform duration-500">
                <Icon className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-black text-white mb-4 group-hover:text-gold-500 transition-colors">
                {section.title}
              </h2>
              <p className="text-onyx-400 leading-relaxed">
                {section.body}
              </p>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export function DashboardHubPage({ locale }: { locale: Locale }) {
  const isArabic = locale === "ar";
  const content = publicPageCopy[locale].dashboards;

  return (
    <div className="animate-fadeIn space-y-12">
      <section className="onyx-card relative overflow-hidden p-8 sm:p-12 border-gold-500/10">
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold-500/5 blur-[100px] rounded-full -ml-32 -mb-32" />
        <div className="relative max-w-4xl">
          <span className="inline-flex rounded-full bg-gold-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.4em] text-gold-500 mb-6 border border-gold-500/20">
            {content.eyebrow}
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight tracking-tight mb-8">
            {content.title}
          </h1>
          <div className="h-1 w-24 bg-gradient-to-r from-gold-500 to-transparent mb-8 rounded-full" />
          <p className="text-lg leading-relaxed text-onyx-400 max-w-2xl">
            {content.description}
          </p>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        {content.cards.map((card, index) => {
          const Icon = iconMap[index] ?? Layers3;

          return (
            <Link
              key={card.href}
              href={`/${locale}${card.href}` as `/${string}`}
              className={cn(
                "onyx-card p-8 group hover:-translate-y-2 transition-all duration-500 block relative overflow-hidden",
                index === 1 && "border-gold-500/30 bg-onyx-800/80"
              )}
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Sparkles className="h-24 w-24 text-gold-500" />
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-500 text-onyx-950 shadow-gold/20 shadow-xl mb-8 group-hover:rotate-12 transition-all duration-500">
                <Icon className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-black text-white mb-4 group-hover:text-gold-500 transition-colors">
                {card.title}
              </h2>
              <p className="text-onyx-400 leading-relaxed mb-8">
                {card.body}
              </p>
              <div className="flex items-center gap-2 text-sm font-black text-gold-500">
                {isArabic ? "فتح اللوحة" : "Open Portal"}
                <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-1 group-hover:-translate-y-1" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
