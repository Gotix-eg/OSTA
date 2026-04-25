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
  disabled
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <label className="block space-y-2 text-start">
      <span className="text-sm font-medium text-onyx-200">{label}</span>
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          "h-12 w-full appearance-none rounded-[1.2rem] border border-onyx-700 bg-onyx-800/50 px-4 text-body text-white transition focus:border-primary-400 focus:ring-2 focus:ring-primary-500/30 disabled:cursor-not-allowed disabled:opacity-50",
          !value && "text-onyx-500"
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
