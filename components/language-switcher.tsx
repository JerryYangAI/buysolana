"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n/config";
import { LOCALE_COOKIE } from "@/lib/i18n/config";
import { swapLocaleInPath } from "@/lib/i18n/routing";
import { cn } from "@/lib/utils";

type Props = {
  locale: Locale;
  labels: {
    en: string;
    zhCN: string;
  };
};

function buildHref(pathname: string, locale: Locale) {
  const nextPath = swapLocaleInPath(pathname, locale);
  return nextPath;
}

function setLocaleCookie(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
}

export function LanguageSwitcher({ locale, labels }: Props) {
  const pathname = usePathname();

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-200">
      <Link
        href={buildHref(pathname, "en")}
        onClick={() => setLocaleCookie("en")}
        className={cn("transition-colors", locale === "en" ? "text-white" : "text-zinc-400 hover:text-zinc-200")}
      >
        {labels.en}
      </Link>
      <span className="text-zinc-500">|</span>
      <Link
        href={buildHref(pathname, "zh-CN")}
        onClick={() => setLocaleCookie("zh-CN")}
        className={cn(
          "transition-colors",
          locale === "zh-CN" ? "text-white" : "text-zinc-400 hover:text-zinc-200",
        )}
      >
        {labels.zhCN}
      </Link>
    </div>
  );
}
