import { NextResponse } from "next/server";

export function apiError(status: number, code: string, message: string) {
  return NextResponse.json(
    {
      error: {
        code,
        message,
      },
    },
    { status },
  );
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function toBoundedInt(raw: string | null, defaults: { fallback: number; min: number; max: number }) {
  const value = Number.parseInt(raw || "", 10);
  if (!Number.isFinite(value)) return defaults.fallback;
  return Math.min(defaults.max, Math.max(defaults.min, value));
}

export function normalizeOptionalString(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim();
}
