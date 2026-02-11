import "server-only";

import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
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

const ROOT = path.join(process.cwd(), "content");

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[\s]+/g, "-")
    .replace(/[^a-z0-9-\u4e00-\u9fa5]/g, "");
}

function buildToc(body: string): TocItem[] {
  const lines = body.split("\n");
  const toc: TocItem[] = [];

  for (const line of lines) {
    const match = /^(##|###)\s+(.+)$/.exec(line.trim());
    if (!match) continue;

    const depth = match[1].length;
    const text = match[2].trim();
    toc.push({
      id: slugify(text),
      text,
      depth,
    });
  }

  return toc;
}

function toStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value.map((item) => String(item));
}

function toNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const n = Number.parseInt(value, 10);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

function parseMeta(slug: string, data: Record<string, unknown>): ContentMeta {
  return {
    slug,
    title: (data.title as string) || slug,
    description: (data.description as string) || "",
    type: data.type as string | undefined,
    locale: data.locale as string | undefined,
    date: data.date as string | undefined,
    source: data.source as ContentMeta["source"],
    tldr: toStringArray(data.tldr),
    nextRead: toStringArray(data.nextRead),
    term: (data.term as string | undefined) || (data.slug as string | undefined),
    step: toNumber(data.step),
    next: data.next as string | undefined,
    nextLink: data.nextLink as string | undefined,
    routeHint: data.routeHint as string | undefined,
    tags: toStringArray(data.tags),
    glossary: toStringArray(data.glossary),
    relatedLessons: toStringArray(data.relatedLessons),
    relatedTerms: toStringArray(data.relatedTerms),
  };
}

function getDirCandidates(kind: ContentKind, locale: Locale) {
  return [
    path.join(ROOT, locale, kind),
    path.join(ROOT, kind, locale),
  ];
}

async function findExistingDir(kind: ContentKind, locale: Locale) {
  for (const dir of getDirCandidates(kind, locale)) {
    try {
      await fs.access(dir);
      return dir;
    } catch {
      // try next candidate
    }
  }

  return null;
}

export async function listContent(
  kind: ContentKind,
  locale: Locale,
  options?: { includeIndex?: boolean },
): Promise<ContentMeta[]> {
  const dir = await findExistingDir(kind, locale);
  if (!dir) return [];

  let files: string[] = [];

  try {
    files = await fs.readdir(dir);
  } catch {
    return [];
  }

  const includeIndex = options?.includeIndex ?? false;

  const items = await Promise.all(
    files
      .filter((file) => file.endsWith(".mdx"))
      .filter((file) => includeIndex || file !== "_index.mdx")
      .map(async (file) => {
        const slug = file.replace(/\.mdx$/, "");
        const fullPath = path.join(dir, file);
        const raw = await fs.readFile(fullPath, "utf8");
        const { data } = matter(raw);

        return parseMeta(slug, data as Record<string, unknown>);
      }),
  );

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
  for (const dir of getDirCandidates(kind, locale)) {
    const fullPath = path.join(dir, `${slug}.mdx`);

    try {
      const raw = await fs.readFile(fullPath, "utf8");
      const { data, content } = matter(raw);
      const meta = parseMeta(slug, data as Record<string, unknown>);

      return {
        ...meta,
        body: content,
        toc: buildToc(content),
      };
    } catch {
      // try next candidate path
    }
  }

  return null;
}

export async function getIndexContent(kind: ContentKind, locale: Locale) {
  return getContentBySlug(kind, locale, "_index");
}
