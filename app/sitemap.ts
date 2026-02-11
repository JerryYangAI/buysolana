import type { MetadataRoute } from "next";
import { LOCALES, SITE_URL } from "@/lib/i18n/config";
import { listContent } from "@/lib/content";

const STATIC_ROUTES = [
  "",
  "/start",
  "/course",
  "/learn",
  "/glossary",
  "/prices",
  "/solutions",
  "/solutions/rwa",
  "/solutions/musicsforyou",
  "/solutions/nft",
  "/solutions/games",
  "/community",
  "/community/new",
  "/news",
  "/blog",
  "/podcast",
  "/ask",
  "/security",
];

function localizedUrl(locale: string, route: string) {
  const path = route ? `/${locale}${route}` : `/${locale}`;
  return `${SITE_URL}${path}`;
}

function alternates(route: string) {
  return {
    en: localizedUrl("en", route),
    "zh-CN": localizedUrl("zh-CN", route),
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of LOCALES) {
    for (const route of STATIC_ROUTES) {
      entries.push({
        url: localizedUrl(locale, route),
        lastModified: now,
        alternates: {
          languages: alternates(route),
        },
      });
    }

    const [learn, blog, podcast, glossary] = await Promise.all([
      listContent("learn", locale),
      listContent("blog", locale),
      listContent("podcast", locale),
      listContent("glossary", locale),
    ]);

    for (const item of learn) {
      entries.push({
        url: localizedUrl(locale, `/learn/${item.slug}`),
        lastModified: item.date ? new Date(item.date) : now,
        alternates: { languages: alternates(`/learn/${item.slug}`) },
      });
    }

    for (const item of blog) {
      entries.push({
        url: localizedUrl(locale, `/blog/${item.slug}`),
        lastModified: item.date ? new Date(item.date) : now,
        alternates: { languages: alternates(`/blog/${item.slug}`) },
      });
    }

    for (const item of podcast) {
      entries.push({
        url: localizedUrl(locale, `/podcast/${item.slug}`),
        lastModified: item.date ? new Date(item.date) : now,
        alternates: { languages: alternates(`/podcast/${item.slug}`) },
      });
    }

    for (const item of glossary) {
      const term = item.term || item.slug;
      entries.push({
        url: localizedUrl(locale, `/glossary/${term}`),
        lastModified: now,
        alternates: { languages: alternates(`/glossary/${term}`) },
      });
    }
  }

  return entries;
}
