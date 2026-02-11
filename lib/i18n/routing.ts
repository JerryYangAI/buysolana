import type { Locale } from "@/lib/i18n/config";

export function withLocale(locale: Locale, path = "/") {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return normalized === "/" ? `/${locale}` : `/${locale}${normalized}`;
}

export function swapLocaleInPath(pathname: string, locale: Locale) {
  const segments = pathname.split("/");
  segments[1] = locale;
  const nextPath = segments.join("/");
  return nextPath || `/${locale}`;
}
