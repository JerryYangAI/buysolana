export const dynamic = "force-static";
export const dynamicParams = false;
export { generateLocaleParams as generateStaticParams } from "@/lib/i18n/static-params";
import type { Metadata } from "next";
import Link from "next/link";
import { MdxRenderer } from "@/components/content/mdx-renderer";
import { PageHero } from "@/components/ui/page-hero";
import { getIndexContent, listContent } from "@/lib/content";
import { isLocale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { pageMetadata } from "@/lib/page-metadata";
import { withLocale } from "@/lib/i18n/routing";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const messages = await getMessages(locale);
  return pageMetadata(locale, "glossaryTitle", "/glossary", messages.learn.description);
}

export default async function GlossaryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;

  const index = await getIndexContent("glossary", locale);
  const entries = await listContent("glossary", locale);
  const messages = await getMessages(locale);

  return (
    <div className="space-y-4">
      <PageHero
        title={index?.title || messages.nav.glossary}
        description={index?.description || messages.learn.description}
      />

      {index?.body ? (
        <section className="rounded-2xl border border-white/12 bg-white/[0.03] p-6">
          <MdxRenderer source={index.body} />
        </section>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        {entries.map((entry) => (
          <Link
            key={entry.slug}
            href={withLocale(locale, `/glossary/${entry.term || entry.slug}`)}
            className="rounded-2xl border border-white/12 bg-white/[0.03] p-5"
          >
            <h2 className="text-lg font-semibold text-zinc-100">{entry.title}</h2>
            <p className="mt-1 text-sm text-zinc-300">{entry.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
