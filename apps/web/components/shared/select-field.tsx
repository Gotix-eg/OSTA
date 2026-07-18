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
  variant = "default"
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
  variant?: "default" | "auth";
}) {
  const isAuth = variant === "auth";

  return (
    <label className="block space-y-2 text-start">
      <span className={isAuth ? "text-xs font-black uppercase tracking-widest text-white/70" : "text-sm font-medium text-onyx-200"}>{label}</span>
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          isAuth
            ? "h-14 w-full appearance-none rounded-none border border-white/20 bg-[#121212] px-4 text-sm font-semibold text-white outline-none transition-colors focus:border-gold disabled:cursor-not-allowed disabled:opacity-50"
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
