import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n/config";
import { SITE_URL } from "@/lib/i18n/config";

function toAbsolute(urlPath: string) {
  return `${SITE_URL}${urlPath}`;
}

export function localizedMetadata(params: {
  locale: Locale;
  title: string;
  description: string;
  path: string;
}): Metadata {
  const { locale, title, description, path } = params;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const localPath = normalized === "/" ? `/${locale}` : `/${locale}${normalized}`;
  const canonical = toAbsolute(localPath);

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        en: toAbsolute(localPath.replace(`/${locale}`, "/en")),
        "zh-CN": toAbsolute(localPath.replace(`/${locale}`, "/zh-CN")),
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "buysolanas.com",
      locale: locale === "zh-CN" ? "zh_CN" : "en_US",
      type: "website",
    },
  };
}
