"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

type Option = {
  value: string;
  label: string;
};

export function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled,
  variant = "default",
  compact = false
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
  variant?: "default" | "auth";
  compact?: boolean;
}) {
  const isAuth = variant === "auth";

  return (
    <label className={cn("block text-start", compact ? "space-y-0.5" : "space-y-1.5")}>
      <span className={isAuth ? cn(compact ? "text-[10px]" : "text-xs", "font-black uppercase tracking-widest text-white") : "text-sm font-medium text-onyx-200"}>{label}</span>
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          isAuth
            ? compact
              ? "h-8 w-full appearance-none rounded-none border border-white/20 bg-[#121212] px-2 text-xs font-semibold text-white outline-none transition-colors focus:border-gold disabled:cursor-not-allowed disabled:opacity-50"
              : "h-11 w-full appearance-none rounded-none border border-white/20 bg-[#121212] px-3 text-sm font-semibold text-white outline-none transition-colors focus:border-gold disabled:cursor-not-allowed disabled:opacity-50"
            : "h-12 w-full appearance-none rounded-[1.2rem] border border-onyx-700 bg-onyx-800/50 px-4 text-body text-white transition focus:border-primary-400 focus:ring-2 focus:ring-primary-500/30 disabled:cursor-not-allowed disabled:opacity-50",
          !value && (isAuth ? "text-white/35" : "text-onyx-500")
        )}
      >
        <option value="" disabled>
          {placeholder || label}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
