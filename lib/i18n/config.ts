export const LOCALES = ["en", "zh-CN"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "preferred-locale";
export const SITE_URL = "https://buysolanas.com";

export function isLocale(value: string): value is Locale {
  return LOCALES.includes(value as Locale);
}

export function looksLikeLocaleSegment(value: string): boolean {
  return /^[a-z]{2}(?:-[A-Za-z]{2,4})?$/.test(value);
}
