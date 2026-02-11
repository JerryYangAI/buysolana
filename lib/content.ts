import "server-only";

import catalogRaw from "@/content/catalog.generated.json";
import type { Locale } from "@/lib/i18n/config";

export type ContentKind = "learn" | "blog" | "podcast" | "glossary" | "course";

export type TocItem = {
  id: string;
  text: string;
  depth: number;
};

export type ContentMeta = {
  slug: string;
  title: string;
  description: string;
  type?: string;
  locale?: string;
  date?: string;
  source?: "docs" | "basics" | "youtube" | "github";
  tldr?: string[];
  nextRead?: string[];
  term?: string;
  step?: number;
  next?: string;
  nextLink?: string;
  routeHint?: string;
  tags?: string[];
  glossary?: string[];
  relatedLessons?: string[];
  relatedTerms?: string[];
};

export type ContentEntry = ContentMeta & {
  body: string;
  toc: TocItem[];
};

type CatalogShape = {
  entries: {
    [K in ContentKind]?: {
      [L in Locale]?: ContentEntry[];
    };
  };
};

const catalog = catalogRaw as CatalogShape;

function getEntries(kind: ContentKind, locale: Locale): ContentEntry[] {
  return catalog.entries?.[kind]?.[locale] || [];
}

function toMeta(entry: ContentEntry): ContentMeta {
  return {
    slug: entry.slug,
    title: entry.title,
    description: entry.description,
    type: entry.type,
    locale: entry.locale,
    date: entry.date,
    source: entry.source,
    tldr: entry.tldr,
    nextRead: entry.nextRead,
    term: entry.term,
    step: entry.step,
    next: entry.next,
    nextLink: entry.nextLink,
    routeHint: entry.routeHint,
    tags: entry.tags,
    glossary: entry.glossary,
    relatedLessons: entry.relatedLessons,
    relatedTerms: entry.relatedTerms,
  };
}

export async function listContent(
  kind: ContentKind,
  locale: Locale,
  options?: { includeIndex?: boolean },
): Promise<ContentMeta[]> {
  const includeIndex = options?.includeIndex ?? false;

  const items = getEntries(kind, locale)
    .filter((entry) => includeIndex || entry.slug !== "_index")
    .map(toMeta);

  if (kind === "course") {
    return items.sort((a, b) => {
      const stepA = a.step ?? Number.MAX_SAFE_INTEGER;
      const stepB = b.step ?? Number.MAX_SAFE_INTEGER;
      if (stepA !== stepB) return stepA - stepB;
      return a.slug.localeCompare(b.slug);
    });
  }

  return items.sort((a, b) => {
    if (a.date && b.date) {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    return a.slug.localeCompare(b.slug);
  });
}

export async function getContentBySlug(
  kind: ContentKind,
  locale: Locale,
  slug: string,
): Promise<ContentEntry | null> {
  const hit = getEntries(kind, locale).find((entry) => entry.slug === slug);
  return hit || null;
}

export async function getIndexContent(kind: ContentKind, locale: Locale) {
  return getContentBySlug(kind, locale, "_index");
}
