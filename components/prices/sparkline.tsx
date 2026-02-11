import { cn } from "@/lib/utils";

type Props = {
  values?: number[];
  className?: string;
  strokeClassName?: string;
};

function pathFromValues(values: number[], width: number, height: number) {
  if (values.length === 0) return "";

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  return values
    .map((value, index) => {
      const x = (index / Math.max(1, values.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

export function Sparkline({ values, className, strokeClassName }: Props) {
  const points = values?.filter((item) => Number.isFinite(item)) || [];
  const path = pathFromValues(points, 100, 36);

  return (
    <svg viewBox="0 0 100 36" className={cn("h-9 w-full", className)} aria-hidden>
      <path d="M0 18 L100 18" className="stroke-white/10" fill="none" strokeWidth={1} />
      {path ? (
        <path
          d={path}
          className={cn("stroke-cyan-300", strokeClassName)}
          fill="none"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : null}
    </svg>
  );
}
