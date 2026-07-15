"use client";

import Link from "next/link";
import type { ComponentType, ReactNode } from "react";

import { ArrowUpRight, Boxes, Search } from "lucide-react";

import type { Locale } from "@/lib/locales";
import { cn } from "@/lib/utils";

type IconType = ComponentType<{ className?: string }>;

export function VendorStitchShell({ locale, children }: { locale: Locale; children: ReactNode }) {
  return (
    <div className="relative -m-4 min-h-screen bg-[#f5bd18] p-4 text-black sm:-m-6 sm:p-6 lg:-m-8 lg:p-8" dir={locale === "ar" ? "rtl" : "ltr"}>
      <div className="mx-auto max-w-[1280px] space-y-6 lg:space-y-8">{children}</div>
    </div>
  );
}

export function VendorStitchTopStrip({ locale, title, actionHref, actionLabel }: { locale: Locale; title: string; actionHref?: string; actionLabel?: string }) {
  return (
    <div className="hidden items-center justify-between border-b border-black/20 bg-black px-5 py-3 text-white lg:flex">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#f5bd18]">OSTA VENDOR</p>
        <h1 className="mt-1 text-lg font-black uppercase text-white">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-72 items-center gap-2 border border-white/10 bg-[#121212] px-3 text-xs text-white/40">
          <Search className="h-4 w-4" />
          <span>{locale === "ar" ? "ابحث في الطلبات أو المخزون..." : "Search orders or inventory..."}</span>
        </div>
        {actionHref && actionLabel ? (
          <Link href={actionHref} className="bg-white px-4 py-3 text-xs font-black uppercase text-black transition-colors hover:bg-[#f5bd18]">
            {actionLabel}
          </Link>
        ) : null}
      </div>
    </div>
  );
}

export function VendorStitchHero({
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
      <div className="relative overflow-hidden border border-white/10 bg-black p-6 text-white shadow-[5px_5px_0_#1d1600] lg:p-8">
        <div className="absolute inset-0 opacity-25 [background:radial-gradient(circle_at_20%_20%,#f5bd18_0,transparent_32%),linear-gradient(135deg,transparent_0,#171717_70%)]" />
        <div className="relative z-10 max-w-3xl">
          <p className="mb-3 inline-flex border border-[#f5bd18]/60 bg-[#f5bd18] px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-black">{eyebrow}</p>
          <h2 className="text-4xl font-black uppercase leading-none text-white sm:text-5xl lg:text-6xl">
            {title}
            {highlight ? <span className="text-[#f5bd18]"> {highlight}</span> : null}
          </h2>
          <p className="mt-5 max-w-2xl text-sm font-semibold leading-7 text-white/65">{subtitle}</p>
          {actionHref && actionLabel ? (
            <Link href={actionHref} className="mt-6 inline-flex items-center gap-3 bg-[#f5bd18] px-6 py-4 text-xs font-black uppercase text-black shadow-[4px_4px_0_#fff] transition-transform active:translate-x-1 active:translate-y-1 active:shadow-none">
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

export function VendorStitchMetric({ label, value, note, icon: Icon, index }: { label: string; value: string; note?: string; icon: IconType; index?: string }) {
  return (
    <article className="relative overflow-hidden border border-white/10 bg-black p-5 text-white shadow-[4px_4px_0_#1d1600]">
      <div className="mb-5 flex items-start justify-between gap-4">
        <Icon className="h-5 w-5 text-[#f5bd18]" />
        {index ? <span className="text-3xl font-black text-white/15">{index}</span> : null}
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/45">{label}</p>
      <p className="mt-2 text-3xl font-black uppercase leading-none text-white">{value}</p>
      {note ? <p className="mt-2 text-[10px] font-black uppercase tracking-[0.12em] text-[#f5bd18]">{note}</p> : null}
    </article>
  );
}

export function VendorStitchPanel({ eyebrow, title, action, children, dark = true, className }: { eyebrow?: string; title: string; action?: ReactNode; children: ReactNode; dark?: boolean; className?: string }) {
  return (
    <section className={cn("border p-5 shadow-[4px_4px_0_#1d1600] lg:p-6", dark ? "border-white/10 bg-black text-white" : "border-black/15 bg-[#f7c21c] text-black", className)}>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4 border-b border-current/15 pb-4">
        <div>
          {eyebrow ? <p className={cn("text-[10px] font-black uppercase tracking-[0.22em]", dark ? "text-[#f5bd18]" : "text-black/55")}>{eyebrow}</p> : null}
          <h2 className={cn("mt-1 text-2xl font-black uppercase", dark ? "text-white" : "text-black")}>{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function VendorStitchEmpty({ title, text, actionLabel, actionHref }: { title: string; text: string; actionLabel?: string; actionHref?: string }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center border border-white/10 bg-[#080808] p-8 text-center text-white">
      <div className="mb-5 flex h-16 w-16 items-center justify-center border border-[#f5bd18]/40 bg-[#f5bd18]/10 text-[#f5bd18]">
        <Boxes className="h-7 w-7" />
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

export function VendorStitchBadge({ children, tone = "gold" }: { children: ReactNode; tone?: "gold" | "green" | "red" | "muted" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em]",
        tone === "gold" && "border-[#f5bd18] bg-[#f5bd18] text-black",
        tone === "green" && "border-emerald-400/40 bg-emerald-400/15 text-emerald-200",
        tone === "red" && "border-red-400/40 bg-red-500/15 text-red-200",
        tone === "muted" && "border-white/15 bg-white/5 text-white/55"
      )}
    >
      {children}
    </span>
  );
}

export function VendorStitchAction({ children, onClick, href, tone = "dark", disabled }: { children: ReactNode; onClick?: () => void; href?: string; tone?: "dark" | "light" | "ghost"; disabled?: boolean }) {
  const className = cn(
    "inline-flex items-center justify-center gap-2 border px-4 py-3 text-xs font-black uppercase transition-colors disabled:opacity-50",
    tone === "dark" && "border-black bg-black text-[#f5bd18] hover:bg-[#1a1a1a]",
    tone === "light" && "border-white bg-white text-black hover:bg-[#f5bd18]",
    tone === "ghost" && "border-white/20 bg-transparent text-white hover:border-[#f5bd18] hover:text-[#f5bd18]"
  );

  if (href) {
    return <Link href={href} className={className}>{children}</Link>;
  }

  return <button type="button" onClick={onClick} disabled={disabled} className={className}>{children}</button>;
}
