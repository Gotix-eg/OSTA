import type { ComponentType, ReactNode } from "react";

import Link from "next/link";

import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";

type Tone = "primary" | "accent" | "sun" | "dark";

const toneClasses: Record<Tone, string> = {
  primary: "from-gold-500/10 via-transparent to-transparent",
  accent: "from-accent-500/10 via-transparent to-transparent",
  sun: "from-warning/10 via-transparent to-transparent",
  dark: "from-onyx-900 via-onyx-950 to-black text-white"
};

const iconTones: Record<Tone, string> = {
  primary: "bg-gold-500 text-onyx-950",
  accent: "bg-accent-500 text-white",
  sun: "bg-warning text-onyx-950",
  dark: "bg-white/10 text-white"
};

export function SubpageHero({
  eyebrow,
  title,
  subtitle,
  actionLabel,
  actionHref,
  tone = "primary"
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  actionLabel?: string;
  actionHref?: string;
  tone?: Tone;
}) {
  return (
    <section className={cn("onyx-card relative overflow-hidden p-8 sm:p-10", tone === "dark" && "bg-onyx-950") }>
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50", toneClasses[tone])} />
      <div className="absolute -right-12 top-6 h-48 w-48 rounded-full bg-gold-500/5 blur-3xl" />
      <div className="absolute -left-16 bottom-4 h-56 w-56 rounded-full bg-accent-500/5 blur-[100px]" />

      <div className="relative grid gap-10 xl:grid-cols-[1.618fr_1fr] xl:items-end">
        <div>
          <div className="text-eyebrow">
            {eyebrow}
          </div>
          <h1 className="mt-6 max-w-4xl text-balance font-serif text-5xl leading-[1.1] sm:text-6xl xl:text-[4rem] text-white">
            {title}
          </h1>
          <div className="mt-8 h-px w-24 bg-gradient-to-r from-gold-500/50 to-transparent" />
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-onyx-400">
            {subtitle}
          </p>
        </div>

        <div className="glass-card p-6 lg:p-8">
          <p className="text-caption text-white/30 uppercase">OSTA | SIGNATURE</p>
          <p className="mt-4 text-lg font-medium leading-relaxed text-white/90">
            Crafting premium experiences through meticulous detail and cinematic precision.
          </p>

          {actionLabel && actionHref ? (
            <Link
              href={actionHref as `/${string}`}
              className="mt-8 btn-gold inline-flex items-center gap-3"
            >
              {actionLabel}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function DashboardBlock({
  title,
  eyebrow,
  children,
  dark = false,
  className
}: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
  dark?: boolean;
  className?: string;
}) {
  return (
    <section className={cn("onyx-card relative overflow-hidden p-8", dark && "bg-onyx-950", className)}>
      <div className={cn("absolute inset-0 opacity-40", dark ? "bg-[radial-gradient(circle_at_top_left,oklch(75%_0.15_85/0.1),transparent_40%)]" : "bg-[radial-gradient(circle_at_top_left,oklch(75%_0.15_85/0.05),transparent_40%)]") } />
      <div className="relative">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            {eyebrow ? <p className="text-eyebrow">{eyebrow}</p> : null}
            <h2 className="mt-3 font-serif text-3xl leading-tight text-white">{title}</h2>
          </div>
        </div>
        {children}
      </div>
    </section>
  );
}

export function MiniMetric({
  label,
  value,
  note,
  icon: Icon,
  tone = "primary"
}: {
  label: string;
  value: string;
  note?: string;
  icon: ComponentType<{ className?: string }>;
  tone?: Tone;
}) {
  return (
    <article className={cn("onyx-card relative overflow-hidden p-6", tone === "dark" && "bg-onyx-950") }>
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-30", toneClasses[tone])} />
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-eyebrow opacity-60">{label}</p>
          <p className="mt-5 font-serif text-4xl leading-none text-white">{value}</p>
          {note ? <p className="mt-5 max-w-xs text-metadata">{note}</p> : null}
        </div>
        <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-xl transition-transform duration-500 group-hover:scale-110", iconTones[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </article>
  );
}

export function SoftCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-[2rem] border border-white/5 bg-white/[0.02] p-6 transition-all duration-500 hover:bg-white/[0.04]", className)}>
      {children}
    </div>
  );
}

export function SoftBadge({
  label,
  tone = "primary"
}: {
  label: string;
  tone?: "primary" | "accent" | "sun" | "success" | "error";
}) {
  const classes = {
    primary: "bg-gold-500/10 text-gold-400 border border-gold-500/20",
    accent: "bg-accent-500/10 text-accent-400 border border-accent-500/20",
    sun: "bg-warning/10 text-warning border border-warning/20",
    success: "bg-success/10 text-success border border-success/20",
    error: "bg-error/10 text-error border border-error/20"
  } as const;

  return (
    <span className={cn("rounded-full px-4 py-1.5 text-eyebrow mb-0", classes[tone])}>
      {label}
    </span>
  );
}

export function SplitInfo({ items }: { items: Array<{ label: string; value: string }> }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
          <p className="text-eyebrow opacity-40 mb-3">{item.label}</p>
          <p className="text-xl font-bold leading-none text-white">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[2rem] border border-dashed border-white/10 bg-white/[0.02] p-8 text-center text-sm leading-relaxed text-onyx-500">
      {children}
    </div>
  );
}
