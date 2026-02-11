import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

const LOCALES = ['en', 'zh-CN'];
const KINDS = ['learn', 'blog', 'podcast', 'glossary', 'course'];
const ROOT = path.join(process.cwd(), 'content');
const OUTPUT = path.join(ROOT, 'catalog.generated.json');

function slugify(input) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[\s]+/g, '-')
    .replace(/[^a-z0-9-\u4e00-\u9fa5]/g, '');
}

function buildToc(body) {
  const lines = body.split('\n');
  const toc = [];

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

function toStringArray(value) {
  if (!Array.isArray(value)) return undefined;
  return value.map((item) => String(item));
}

function toNumber(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const n = Number.parseInt(value, 10);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

function parseMeta(slug, data) {
  return {
    slug,
    title: typeof data.title === 'string' ? data.title : slug,
    description: typeof data.description === 'string' ? data.description : '',
    type: typeof data.type === 'string' ? data.type : undefined,
    locale: typeof data.locale === 'string' ? data.locale : undefined,
    date: typeof data.date === 'string' ? data.date : undefined,
    source: data.source,
    tldr: toStringArray(data.tldr),
    nextRead: toStringArray(data.nextRead),
    term: typeof data.term === 'string' ? data.term : typeof data.slug === 'string' ? data.slug : undefined,
    step: toNumber(data.step),
    next: typeof data.next === 'string' ? data.next : undefined,
    nextLink: typeof data.nextLink === 'string' ? data.nextLink : undefined,
    routeHint: typeof data.routeHint === 'string' ? data.routeHint : undefined,
    tags: toStringArray(data.tags),
    glossary: toStringArray(data.glossary),
    relatedLessons: toStringArray(data.relatedLessons),
    relatedTerms: toStringArray(data.relatedTerms),
  };
}

async function findExistingDir(kind, locale) {
  const candidates = [
    path.join(ROOT, locale, kind),
    path.join(ROOT, kind, locale),
  ];

  for (const dir of candidates) {
    try {
      await fs.access(dir);
      return dir;
    } catch {
      // try next
    }
  }

  return null;
}

async function buildCatalog() {
  const entries = {};

  for (const kind of KINDS) {
    entries[kind] = {};

    for (const locale of LOCALES) {
      const dir = await findExistingDir(kind, locale);
      if (!dir) {
        entries[kind][locale] = [];
        continue;
      }

      const files = (await fs.readdir(dir))
        .filter((file) => file.endsWith('.mdx'))
        .sort();

      const list = [];

      for (const file of files) {
        const slug = file.replace(/\.mdx$/, '');
        const raw = await fs.readFile(path.join(dir, file), 'utf8');
        const { data, content } = matter(raw);
        const meta = parseMeta(slug, data || {});

        list.push({
          ...meta,
          body: content,
          toc: buildToc(content),
        });
      }

      entries[kind][locale] = list;
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    entries,
  };
}

const catalog = await buildCatalog();
await fs.writeFile(OUTPUT, `${JSON.stringify(catalog, null, 2)}\n`, 'utf8');
console.log(`Generated ${OUTPUT}`);
