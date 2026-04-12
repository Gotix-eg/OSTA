import type { ComponentType, ReactNode } from "react";

import Link from "next/link";

import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";

type Tone = "primary" | "accent" | "sun" | "dark";

const toneClasses: Record<Tone, string> = {
  primary: "from-primary-500/14 via-white to-surface-peach",
  accent: "from-accent-500/16 via-white to-accent-50",
  sun: "from-sun-300/20 via-white to-surface-soft",
  dark: "from-dark-950 via-dark-900 to-dark-800 text-white"
};

const iconTones: Record<Tone, string> = {
  primary: "bg-primary-700 text-white",
  accent: "bg-accent-700 text-white",
  sun: "bg-sun-500 text-dark-950",
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
    <section className={cn("dashboard-card deco-frame relative overflow-hidden p-6 sm:p-8", tone === "dark" && "dashboard-card-dark") }>
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-95", toneClasses[tone])} />
      <div className="absolute -right-12 top-6 h-40 w-40 rounded-full border border-sun-400/25 bg-sun-300/10 blur-2xl" />
      <div className="absolute -left-16 bottom-4 h-44 w-44 rounded-full border border-accent-400/15 bg-accent-400/10 blur-3xl" />

      <div className="relative grid gap-8 xl:grid-cols-[1.618fr_1fr] xl:items-end">
        <div>
          <div className={cn("inline-flex rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.34em]", tone === "dark" ? "border-white/15 bg-white/5 text-white/65" : "border-sun-300/70 bg-white/65 text-primary-700") }>
            {eyebrow}
          </div>
          <h1 className={cn("mt-5 max-w-4xl text-balance font-serif text-4xl leading-[1.04] sm:text-5xl xl:text-[3.6rem]", tone === "dark" ? "text-white" : "text-dark-950")}>{title}</h1>
          <div className="deco-rule mt-5 max-w-xl" />
          <p className={cn("mt-5 max-w-3xl text-body leading-8", tone === "dark" ? "text-white/74" : "text-dark-600")}>{subtitle}</p>
        </div>

        <div className={cn("rounded-[1.5rem] border p-5", tone === "dark" ? "border-white/10 bg-white/5" : "border-white/70 bg-white/72 shadow-soft") }>
          <p className={cn("text-xs uppercase tracking-[0.28em]", tone === "dark" ? "text-white/45" : "text-dark-400")}>Design direction</p>
          <p className={cn("mt-3 text-lg font-semibold leading-8", tone === "dark" ? "text-white" : "text-dark-950")}>Refined service atelier with art-deco rhythm, warm ivory surfaces, brass edges, and teal balance.</p>

          {actionLabel && actionHref ? (
            <Link
              href={actionHref as `/${string}`}
              className={cn(
                "mt-6 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold shadow-soft transition",
                tone === "dark" ? "bg-white text-dark-950 hover:bg-white/92" : "bg-dark-950 text-white hover:bg-dark-800"
              )}
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
    <section className={cn(dark ? "dashboard-card-dark bg-dark-950" : "dashboard-card", "deco-frame relative overflow-hidden p-6", className)}>
      <div className={cn("absolute inset-0 opacity-60", dark ? "bg-[radial-gradient(circle_at_top_left,rgba(184,135,39,0.14),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(46,140,137,0.14),transparent_28%)]" : "bg-[radial-gradient(circle_at_top_left,rgba(184,135,39,0.10),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(46,140,137,0.08),transparent_26%)]") } />
      <div className="relative">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            {eyebrow ? <p className={cn("text-[11px] font-semibold uppercase tracking-[0.32em]", dark ? "text-white/50" : "text-primary-700")}>{eyebrow}</p> : null}
            <h2 className={cn("mt-2 font-serif text-[1.8rem] leading-tight", dark ? "text-white" : "text-dark-950")}>{title}</h2>
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
    <article className={cn("dashboard-card deco-frame relative overflow-hidden p-5", tone === "dark" && "dashboard-card-dark") }>
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-95", toneClasses[tone])} />
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className={cn("text-[11px] font-semibold uppercase tracking-[0.28em]", tone === "dark" ? "text-white/52" : "text-dark-400")}>{label}</p>
          <p className={cn("mt-4 font-serif text-4xl leading-none", tone === "dark" ? "text-white" : "text-dark-950")}>{value}</p>
          {note ? <p className={cn("mt-4 max-w-xs text-sm leading-6", tone === "dark" ? "text-white/72" : "text-dark-600")}>{note}</p> : null}
        </div>
        <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-[1rem] shadow-soft", iconTones[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </article>
  );
}

export function SoftCard({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("dashboard-card-soft relative overflow-hidden border border-dark-200/60 p-4", !className?.includes("bg-") && "bg-white/82", className)}>{children}</div>;
}

export function SoftBadge({
  label,
  tone = "primary"
}: {
  label: string;
  tone?: "primary" | "accent" | "sun" | "success" | "error";
}) {
  const classes = {
    primary: "bg-primary-500/10 text-primary-800 border border-primary-200/70",
    accent: "bg-accent-500/10 text-accent-900 border border-accent-200/70",
    sun: "bg-sun-400/16 text-sun-900 border border-sun-300/70",
    success: "bg-success/10 text-success border border-success/20",
    error: "bg-error/10 text-error border border-error/20"
  } as const;

  return <span className={cn("rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]", classes[tone])}>{label}</span>;
}

export function SplitInfo({ items }: { items: Array<{ label: string; value: string }> }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item, index) => (
        <div key={item.label} className={cn("rounded-[1.3rem] border border-dark-200/60 p-4", index % 3 === 0 ? "bg-surface-peach" : index % 3 === 1 ? "bg-accent-50" : "bg-surface-soft") }>
          <p className="text-[11px] uppercase tracking-[0.24em] text-dark-400">{item.label}</p>
          <p className="mt-3 text-lg font-semibold leading-7 text-dark-950">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="rounded-[1.3rem] border border-dashed border-dark-200 bg-surface-soft p-5 text-sm leading-7 text-dark-500">{children}</div>;
}
