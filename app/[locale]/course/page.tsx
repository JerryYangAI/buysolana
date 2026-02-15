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
import { withLocale } from "@/lib/i18n/routing";
import { pageMetadata } from "@/lib/page-metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const messages = await getMessages(locale);
  return pageMetadata(locale, "courseTitle", "/course", messages.learn.description);
}

export default async function CoursePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;

  const messages = await getMessages(locale);
  const index = await getIndexContent("course", locale);
  const steps = await listContent("course", locale);

  return (
    <div className="space-y-4">
      <PageHero
        title={index?.title || messages.nav.course}
        description={index?.description || messages.learn.description}
      />

      {index?.body ? (
        <section className="rounded-2xl border border-white/12 bg-white/[0.03] p-6">
          <MdxRenderer source={index.body} />
        </section>
      ) : null}

      <div className="grid gap-3">
        {steps.map((step, idx) => (
          <Link
            key={step.slug}
            href={withLocale(locale, `/course/${step.slug}`)}
            className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 transition-colors hover:border-white/30"
          >
            <p className="text-xs text-zinc-400">STEP {step.step || idx + 1}</p>
            <h2 className="mt-1 text-lg font-semibold text-zinc-100">{step.title}</h2>
            <p className="mt-1 text-sm text-zinc-300">{step.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
