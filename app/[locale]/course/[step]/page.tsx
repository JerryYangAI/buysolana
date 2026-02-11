import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArticleLayout } from "@/components/content/article-layout";
import { MdxRenderer } from "@/components/content/mdx-renderer";
import { getContentBySlug, listContent } from "@/lib/content";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { withLocale } from "@/lib/i18n/routing";
import { localizedMetadata } from "@/lib/metadata";

function resolveNextLink(locale: Locale, nextLink?: string, next?: string) {
  const raw = (nextLink || "").trim();

  if (!raw && next) {
    return withLocale(locale, `/course/${next}`);
  }

  if (!raw) return null;

  if (/^https?:\/\//.test(raw)) {
    return raw;
  }

  if (raw.startsWith(`/${locale}/`)) {
    return raw;
  }

  if (raw.startsWith("/")) {
    return withLocale(locale, raw);
  }

  return withLocale(locale, `/course/${raw}`);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; step: string }>;
}): Promise<Metadata> {
  const { locale, step } = await params;
  if (!isLocale(locale)) return {};

  const current = await getContentBySlug("course", locale, step);
  if (!current) return {};

  return localizedMetadata({
    locale,
    title: `${current.title} | buysolanas.com`,
    description: current.description,
    path: `/course/${current.slug}`,
  });
}

export default async function CourseStepPage({
  params,
}: {
  params: Promise<{ locale: string; step: string }>;
}) {
  const { locale, step } = await params;
  if (!isLocale(locale)) return null;

  const messages = await getMessages(locale);
  const current = await getContentBySlug("course", locale, step);
  if (!current) notFound();

  const steps = await listContent("course", locale);
  const nextHref = resolveNextLink(locale, current.nextLink, current.next);

  return (
    <div className="space-y-4">
      <ArticleLayout
        locale={locale}
        title={current.title}
        description={current.description}
        toc={current.toc}
        tldr={current.tldr}
        nextRead={current.next ? [current.next] : []}
        nextReadBasePath="/course"
        labels={{
          toc: messages.learn.toc,
          tldr: messages.learn.tldr,
          nextRead: messages.learn.nextRead,
          disclaimer: messages.learn.disclaimer,
        }}
      >
        <MdxRenderer source={current.body} />

        {nextHref ? (
          <section className="mt-8 rounded-xl border border-cyan-300/30 bg-cyan-300/10 p-4 text-sm text-cyan-100">
            <p className="mb-2 font-semibold">Next up</p>
            <Link href={nextHref} className="underline">
              {current.next || current.nextLink}
            </Link>
          </section>
        ) : null}
      </ArticleLayout>

      <div className="flex flex-wrap gap-2 text-sm">
        {steps.map((item, index) => (
          <Link
            key={item.slug}
            href={withLocale(locale, `/course/${item.slug}`)}
            className={`rounded-full border px-3 py-1 ${
              item.slug === current.slug ? "border-cyan-300 text-cyan-200" : "border-white/20 text-zinc-300"
            }`}
          >
            {item.step || index + 1}
          </Link>
        ))}
      </div>
    </div>
  );
}
