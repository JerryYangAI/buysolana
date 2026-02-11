export const runtime = "experimental-edge";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  looksLikeLocaleSegment,
  isLocale,
} from "@/lib/i18n/config";

function detectLocale(request: NextRequest) {
  const saved = request.cookies.get(LOCALE_COOKIE)?.value;
  if (saved && isLocale(saved)) return saved;

  const accept = request.headers.get("accept-language") || "";
  const normalized = accept.toLowerCase();
  if (normalized.includes("zh-cn") || normalized.includes("zh")) return "zh-CN";
  return DEFAULT_LOCALE;
}

function isPublicFile(pathname: string) {
  return /\.[a-zA-Z0-9]+$/.test(pathname);
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const host = request.headers.get("host") || "";

  if (
    process.env.ENFORCE_CANONICAL_REDIRECT === "1" &&
    host &&
    host !== "buysolanas.com" &&
    !host.startsWith("localhost")
  ) {
    const url = request.nextUrl.clone();
    url.hostname = "buysolanas.com";
    return NextResponse.redirect(url, 308);
  }

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    isPublicFile(pathname)
  ) {
    return NextResponse.next();
  }

  const segments = pathname.split("/");
  const first = segments[1] || "";

  if (isLocale(first)) {
    const response = NextResponse.next();
    response.cookies.set(LOCALE_COOKIE, first, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
    return response;
  }

  if (first && looksLikeLocaleSegment(first)) {
    return NextResponse.next();
  }

  const locale = detectLocale(request);
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = `/${locale}${pathname}`;
  redirectUrl.search = search;

  return NextResponse.redirect(redirectUrl, 307);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
