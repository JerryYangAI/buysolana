export function formatPrice(value: number) {
  const abs = Math.abs(value);

  let maximumFractionDigits = 2;
  if (abs >= 1) {
    maximumFractionDigits = 2;
  } else if (abs >= 0.01) {
    maximumFractionDigits = 4;
  } else {
    maximumFractionDigits = 6;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits,
  }).format(value);
}

export function formatCompactNumber(value: number) {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (abs >= 1_000_000_000_000) return `${sign}${(abs / 1_000_000_000_000).toFixed(2)}T`;
  if (abs >= 1_000_000_000) return `${sign}${(abs / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(2)}K`;

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export type PercentTone = "up" | "down" | "flat";

export function percentTone(value: number): PercentTone {
  if (Math.abs(value) < 0.05) return "flat";
  return value > 0 ? "up" : "down";
}

export function percentColorClass(value: number) {
  const tone = percentTone(value);
  if (tone === "up") return "text-emerald-400";
  if (tone === "down") return "text-rose-400";
  return "text-white/60";
}
