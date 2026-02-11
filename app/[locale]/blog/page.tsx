export const runtime = "edge";

import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui/page-hero";
import { listContent } from "@/lib/content";
import { isLocale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { pageMetadata } from "@/lib/page-metadata";
import { withLocale } from "@/lib/i18n/routing";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const messages = await getMessages(locale);
  return pageMetadata(locale, "blogTitle", "/blog", messages.blog.description);
}

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;

  const messages = await getMessages(locale);
  const items = await listContent("blog", locale);

  return (
    <div className="space-y-4">
      <PageHero title={messages.blog.title} description={messages.blog.description} />
      <div className="grid gap-3">
        {items.map((item) => (
          <Link
            key={item.slug}
            href={withLocale(locale, `/blog/${item.slug}`)}
            className="rounded-2xl border border-white/12 bg-white/[0.03] p-5"
          >
            <h2 className="text-lg font-semibold text-zinc-100">{item.title}</h2>
            <p className="mt-1 text-sm text-zinc-300">{item.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
