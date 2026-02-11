"use client";

import { cn } from "@/lib/utils";

export type TabOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export function Tabs({
  value,
  options,
  onChange,
  className,
}: {
  value: string;
  options: TabOption[];
  onChange: (next: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("inline-flex items-center gap-1 rounded-xl border border-white/15 bg-white/[0.03] p-1", className)}>
      {options.map((option) => {
        const selected = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            disabled={option.disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              selected ? "bg-white/10 text-zinc-100" : "text-zinc-400 hover:text-zinc-200",
              option.disabled ? "cursor-not-allowed opacity-50" : "",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
