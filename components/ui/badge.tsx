import { cn } from "@/lib/utils";

type BadgeTone = "neutral" | "up" | "down";

const tones: Record<BadgeTone, string> = {
  neutral: "border-white/20 bg-white/5 text-white/70",
  up: "border-emerald-400/40 bg-emerald-500/10 text-emerald-400",
  down: "border-rose-400/40 bg-rose-500/10 text-rose-400",
};

export function Badge({
  className,
  tone = "neutral",
  children,
}: {
  className?: string;
  tone?: BadgeTone;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium tabular-nums",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
