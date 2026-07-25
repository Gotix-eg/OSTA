"use client";

import Link from "next/link";
import type { ComponentType, ReactNode } from "react";

import { ArrowUpRight, Crosshair, Search } from "lucide-react";

import type { Locale } from "@/lib/locales";
import { cn } from "@/lib/utils";

import { PublicFooter } from "@/components/public/public-shell";

type IconType = ComponentType<{ className?: string }>;

export function WorkerProShell({ locale, children }: { locale: Locale; children: ReactNode }) {
  return (
    <div className="relative -m-4 min-h-screen bg-gold p-4 text-black sm:-m-6 sm:p-6 lg:-m-8 lg:p-8" dir={locale === "ar" ? "rtl" : "ltr"}>
      <div className="mx-auto max-w-[1280px] space-y-6 lg:space-y-8">
        {children}
        <PublicFooter locale={locale} />
      </div>
    </div>
  );
}

export function WorkerProTopStrip({ locale, title, actionHref, actionLabel }: { locale: Locale; title: string; actionHref?: string; actionLabel?: string }) {
  return (
    <div className="hidden items-center justify-between border-b border-black/20 bg-black px-5 py-3 text-white lg:flex">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-gold">OSTA PRO</p>
        <h1 className="mt-1 text-lg font-black uppercase text-white">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-72 items-center gap-2 border border-white/10 bg-[#121212] px-3 text-xs text-white/40">
          <Search className="h-4 w-4" />
          <span>{locale === "ar" ? "ابحث في العمليات..." : "Search operations..."}</span>
        </div>
        {actionHref && actionLabel ? (
          <Link href={actionHref} className="bg-white px-4 py-3 text-xs font-black uppercase text-black transition-colors hover:bg-gold">
            {actionLabel}
          </Link>
        ) : null}
      </div>
    </div>
  );
}

export function WorkerProHero({
  locale,
  eyebrow,
  title,
  highlight,
  subtitle,
  actionHref,
  actionLabel,
  side
}: {
  locale: Locale;
  eyebrow: string;
  title: string;
  highlight?: string;
  subtitle: string;
  actionHref?: string;
  actionLabel?: string;
  side?: ReactNode;
}) {
  return (
    <section className="grid gap-4 lg:grid-cols-[1fr_0.42fr]">
      <div className="relative overflow-hidden border border-white/10 bg-black p-6 text-white lg:p-8">
        <div className="absolute inset-0 opacity-25 [background:radial-gradient(circle_at_20%_20%,#f5bd18_0,transparent_32%),linear-gradient(135deg,transparent_0,#171717_70%)]" />
        <div className="relative z-10 max-w-3xl">
          <p className="mb-3 inline-flex border border-gold/60 bg-gold px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-black">{eyebrow}</p>
          <h2 className="text-4xl font-black uppercase leading-none text-white sm:text-5xl lg:text-6xl">
            {title}
            {highlight ? <span className="text-gold"> {highlight}</span> : null}
          </h2>
          <p className="mt-5 max-w-2xl text-sm font-semibold leading-7 text-white/65">{subtitle}</p>
          {actionHref && actionLabel ? (
            <Link href={actionHref} className="mt-6 inline-flex items-center gap-3 bg-gold px-6 py-4 text-xs font-black uppercase text-black transition-transform active:translate-x-1 active:translate-y-1">
              {actionLabel}
              <ArrowUpRight className={cn("h-4 w-4", locale === "ar" ? "-scale-x-100" : "")} />
            </Link>
          ) : null}
        </div>
      </div>
      {side ? <div className="grid gap-4">{side}</div> : null}
    </section>
  );
}

export function WorkerProMetric({ label, value, note, icon: Icon, dark, index }: { label: string; value: string; note?: string; icon: IconType; dark?: boolean; index?: string }) {
  return (
    <article className={cn("relative overflow-hidden border p-5", dark ? "border-white/10 bg-black text-white" : "border-black/15 bg-[#111] text-white")}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <Icon className="h-5 w-5 text-gold" />
        {index ? <span className="text-3xl font-black text-white/15">{index}</span> : null}
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/45">{label}</p>
      <p className="mt-2 text-3xl font-black uppercase leading-none text-white">{value}</p>
      {note ? <p className="mt-2 text-[10px] font-black uppercase tracking-[0.12em] text-gold">{note}</p> : null}
    </article>
  );
}

export function WorkerProPanel({ eyebrow, title, action, children, dark = true }: { eyebrow?: string; title: string; action?: ReactNode; children: ReactNode; dark?: boolean }) {
  return (
    <section className={cn("border p-5 lg:p-6", dark ? "border-white/10 bg-black text-white" : "border-black/15 bg-[#f7c21c] text-black")}>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4 border-b border-current/15 pb-4">
        <div>
          {eyebrow ? <p className={cn("text-[10px] font-black uppercase tracking-[0.22em]", dark ? "text-gold" : "text-black/55")}>{eyebrow}</p> : null}
          <h2 className={cn("mt-1 text-2xl font-black uppercase", dark ? "text-white" : "text-black")}>{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function WorkerProInfoCard({ title, text, actionLabel, href, icon: Icon = Crosshair }: { title: string; text: string; actionLabel?: string; href?: string; icon?: IconType }) {
  return (
    <div className="border border-white/10 bg-black p-5 text-white">
      <Icon className="h-5 w-5 text-gold" />
      <h3 className="mt-4 text-lg font-black text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-white/55">{text}</p>
      {href && actionLabel ? (
        <Link href={href} className="mt-4 inline-flex items-center gap-2 text-xs font-black uppercase text-gold">
          {actionLabel}
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      ) : null}
    </div>
  );
}

export function WorkerProEmpty({ title, text, actionLabel, actionHref }: { title: string; text: string; actionLabel?: string; actionHref?: string }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center border border-white/10 bg-[#080808] p-8 text-center text-white">
      <div className="mb-5 flex h-16 w-16 items-center justify-center border border-gold/40 bg-gold/10 text-gold">
        <Crosshair className="h-7 w-7" />
      </div>
      <h3 className="text-xl font-black text-white">{title}</h3>
      <p className="mt-3 max-w-md text-sm leading-6 text-white/50">{text}</p>
      {actionHref && actionLabel ? (
        <Link href={actionHref} className="mt-6 bg-white px-5 py-3 text-xs font-black uppercase text-black">
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

export function WorkerProBadge({ children, tone = "gold" }: { children: ReactNode; tone?: "gold" | "green" | "red" | "muted" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em]",
        tone === "gold" && "border-gold bg-gold text-black",
        tone === "green" && "border-emerald-400/40 bg-emerald-400/15 text-emerald-200",
        tone === "red" && "border-red-400/40 bg-red-500/15 text-red-200",
        tone === "muted" && "border-white/15 bg-white/5 text-white/55"
      )}
    >
      {children}
    </span>
  );
}

export function WorkerProAction({ children, onClick, href, tone = "dark", disabled }: { children: ReactNode; onClick?: () => void; href?: string; tone?: "dark" | "light" | "ghost"; disabled?: boolean }) {
  const className = cn(
    "inline-flex items-center justify-center gap-2 border px-4 py-3 text-xs font-black uppercase transition-colors disabled:opacity-50",
    tone === "dark" && "border-black bg-black text-gold hover:bg-[#1a1a1a]",
    tone === "light" && "border-white bg-white text-black hover:bg-gold",
    tone === "ghost" && "border-white/20 bg-transparent text-white hover:border-gold hover:text-gold"
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} disabled={disabled} className={className}>
      {children}
    </button>
  );
}
