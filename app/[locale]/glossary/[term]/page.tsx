export const dynamic = "force-static";

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MdxRenderer } from "@/components/content/mdx-renderer";
import { listContent, getContentBySlug } from "@/lib/content";
import { isLocale, LOCALES } from "@/lib/i18n/config";
import { localizedMetadata } from "@/lib/metadata";

export const dynamicParams = false;

export async function generateStaticParams() {
  const params = await Promise.all(
    LOCALES.map(async (locale) => {
      const entries = await listContent("glossary", locale);
      return entries.map((entry) => ({ locale, term: entry.term || entry.slug }));
    }),
  );

  return params.flat();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; term: string }>;
}): Promise<Metadata> {
  const { locale, term } = await params;
  if (!isLocale(locale)) return {};

  const entries = await listContent("glossary", locale);
  const entry = entries.find((item) => (item.term || item.slug) === term);
  if (!entry) return {};

  return localizedMetadata({
    locale,
    title: `${entry.title} | buysolanas.com`,
    description: entry.description,
    path: `/glossary/${term}`,
  });
}

export default async function GlossaryTermPage({
  params,
}: {
  params: Promise<{ locale: string; term: string }>;
}) {
  const { locale, term } = await params;
  if (!isLocale(locale)) return null;

  const entries = await listContent("glossary", locale);
  const entry = entries.find((item) => (item.term || item.slug) === term);
  if (!entry) notFound();

  const full = await getContentBySlug("glossary", locale, entry.slug);
  if (!full) notFound();

  return (
    <article className="rounded-2xl border border-white/12 bg-white/[0.03] p-6">
      <h1 className="text-3xl font-semibold text-zinc-100">{full.title}</h1>
      <p className="mt-3 text-zinc-300">{full.description}</p>
      <div className="mt-6">
        <MdxRenderer source={full.body} />
      </div>
    </article>
  );
}
