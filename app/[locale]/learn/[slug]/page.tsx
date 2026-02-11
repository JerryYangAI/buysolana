export const runtime = "edge";

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArticleLayout } from "@/components/content/article-layout";
import { MdxRenderer } from "@/components/content/mdx-renderer";
import { getContentBySlug } from "@/lib/content";
import { isLocale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { localizedMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};

  const entry = await getContentBySlug("learn", locale, slug);
  if (!entry) return {};

  return localizedMetadata({
    locale,
    title: `${entry.title} | buysolanas.com`,
    description: entry.description,
    path: `/learn/${slug}`,
  });
}

export default async function LearnDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return null;

  const entry = await getContentBySlug("learn", locale, slug);
  if (!entry) notFound();

  const messages = await getMessages(locale);

  return (
    <ArticleLayout
      locale={locale}
      title={entry.title}
      description={entry.description}
      toc={entry.toc}
      tldr={entry.tldr}
      nextRead={entry.nextRead}
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
