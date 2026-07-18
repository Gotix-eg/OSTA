"use client";

import type { ComponentType, ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Locale } from "@/lib/locales";
import { cn } from "@/lib/utils";

type IconType = ComponentType<{ className?: string }>;

export function ClientStitchHero({
  locale,
  eyebrow,
  title,
  subtitle,
  actionLabel,
  actionHref,
  icon: Icon
}: {
  locale: Locale;
  eyebrow: string;
  title: string;
  subtitle: string;
  actionLabel?: string;
  actionHref?: string;
  icon?: IconType;
}) {
  const isArabic = locale === "ar";

  return (
    <section className="relative overflow-hidden border border-white/10 bg-black p-6 text-white shadow-[6px_6px_0_#1a1c1c] sm:p-8 lg:p-10">
      <div className="absolute inset-y-0 end-0 hidden w-1/3 bg-[linear-gradient(135deg,rgba(245,189,24,0.26),transparent)] lg:block" />
      <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-gold">{eyebrow}</p>
          <h1 className="mt-4 text-4xl font-black uppercase leading-none tracking-tight text-white sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/65 sm:text-lg">{subtitle}</p>
        </div>

        <div className="flex shrink-0 items-center gap-4">
          {Icon ? (
            <div className="hidden h-16 w-16 items-center justify-center border border-gold bg-[#121212] text-gold sm:flex">
              <Icon className="h-8 w-8" />
            </div>
          ) : null}
          {actionLabel && actionHref ? (
            <Link
              href={actionHref as `/${string}`}
              className="inline-flex min-h-12 items-center justify-center gap-2 bg-white px-5 py-3 text-sm font-black uppercase text-black shadow-[4px_4px_0_#f5bd18] transition active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              {actionLabel}
              <ArrowUpRight className={cn("h-4 w-4", isArabic && "-scale-x-100")} />
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function ClientStitchMetric({
  label,
  value,
  note,
  icon: Icon,
  dark = false
}: {
  label: string;
  value: string;
  note?: string;
  icon: IconType;
  dark?: boolean;
}) {
  return (
    <article className={cn("border p-5 shadow-[4px_4px_0_#1a1c1c]", dark ? "border-white/10 bg-black text-white" : "border-black/10 bg-white text-black")}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className={cn("text-[10px] font-black uppercase tracking-[0.22em]", dark ? "text-white/45" : "text-black/45")}>{label}</p>
          <p className={cn("mt-4 truncate text-3xl font-black leading-none", dark ? "text-gold" : "text-black")}>{value}</p>
          {note ? <p className={cn("mt-3 truncate text-xs font-bold", dark ? "text-white/45" : "text-black/50")}>{note}</p> : null}
        </div>
        <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center", dark ? "bg-gold text-black" : "bg-black text-gold")}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </article>
  );
}

export function ClientStitchPanel({
  eyebrow,
  title,
  children,
  className
}: {
  eyebrow?: string;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("border border-white/10 bg-black p-5 text-white shadow-[6px_6px_0_#1a1c1c] sm:p-6 lg:p-8", className)}>
      <div className="mb-6">
        {eyebrow ? <p className="text-[10px] font-black uppercase tracking-[0.24em] text-gold">{eyebrow}</p> : null}
        <h2 className="mt-2 text-2xl font-black uppercase leading-tight text-white sm:text-3xl">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export function ClientStitchBadge({
  children,
  tone = "gold"
}: {
  children: ReactNode;
  tone?: "gold" | "dark" | "success" | "danger" | "muted";
}) {
  const tones = {
    gold: "border-gold bg-gold text-black",
    dark: "border-white/15 bg-[#121212] text-white",
    success: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
    danger: "border-red-400/40 bg-red-400/10 text-red-300",
    muted: "border-white/10 bg-white/5 text-white/55"
  };

  return (
    <span className={cn("inline-flex items-center border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em]", tones[tone])}>
      {children}
    </span>
  );
}

export function ClientStitchEmpty({ children }: { children: ReactNode }) {
  return (
    <div className="border border-dashed border-white/15 bg-[#121212] p-8 text-center text-sm font-semibold leading-relaxed text-white/50">
      {children}
    </div>
  );
}
