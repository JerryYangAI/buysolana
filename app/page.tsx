export const runtime = "edge";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale } from "@/lib/i18n/config";

function detectFromHeader(acceptLanguage: string | null) {
  const normalized = (acceptLanguage || "").toLowerCase();
  if (normalized.includes("zh-cn") || normalized.includes("zh")) {
    return "zh-CN" as const;
  }
  return DEFAULT_LOCALE;
}

export default async function RootPage() {
  const cookieStore = await cookies();
  const saved = cookieStore.get(LOCALE_COOKIE)?.value;

  if (saved && isLocale(saved)) {
    redirect(`/${saved}`);
  }

  const headerStore = await headers();
  const locale = detectFromHeader(headerStore.get("accept-language"));
  redirect(`/${locale}`);
}
