export const dynamic = "force-static";

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArticleLayout } from "@/components/content/article-layout";
import { MdxRenderer } from "@/components/content/mdx-renderer";
import { getContentBySlug, listContent } from "@/lib/content";
import { isLocale, LOCALES } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { localizedMetadata } from "@/lib/metadata";

export const dynamicParams = false;

export async function generateStaticParams() {
  const params = await Promise.all(
    LOCALES.map(async (locale) => {
      const entries = await listContent("podcast", locale);
      return entries.map((entry) => ({ locale, slug: entry.slug }));
    }),
  );

  return params.flat();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};

  const entry = await getContentBySlug("podcast", locale, slug);
  if (!entry) return {};

  return localizedMetadata({
    locale,
    title: `${entry.title} | buysolanas.com`,
    description: entry.description,
    path: `/podcast/${slug}`,
  });
}

export default async function PodcastDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return null;

  const entry = await getContentBySlug("podcast", locale, slug);
  if (!entry) notFound();

  const messages = await getMessages(locale);

  return (
    <ArticleLayout
      locale={locale}
      title={entry.title}
      description={entry.description}
      toc={entry.toc}
      labels={{
        toc: messages.learn.toc,
        tldr: messages.learn.tldr,
        nextRead: messages.learn.nextRead,
        disclaimer: messages.learn.disclaimer,
      }}
    >
      <MdxRenderer source={entry.body} />
    </ArticleLayout>
  );
}
