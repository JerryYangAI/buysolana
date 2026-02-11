import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui/page-hero";
import { listContent } from "@/lib/content";
import { isLocale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { pageMetadata } from "@/lib/page-metadata";
import { withLocale } from "@/lib/i18n/routing";

const GROUPS = ["docs", "basics", "youtube", "github"] as const;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const messages = await getMessages(locale);
  return pageMetadata(locale, "learnTitle", "/learn", messages.learn.description);
}

export default async function LearnPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;

  const messages = await getMessages(locale);
  const entries = await listContent("learn", locale);

  return (
    <div className="space-y-4">
      <PageHero title={messages.learn.title} description={messages.learn.description} />

      <div className="space-y-6">
        {GROUPS.map((group) => {
          const grouped = entries.filter((entry) => entry.source === group);
          return (
            <section key={group} className="rounded-2xl border border-white/12 bg-white/[0.03] p-5">
              <h2 className="text-lg font-semibold text-zinc-100">{messages.learn.groups[group]}</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {grouped.map((entry) => (
                  <Link
                    key={entry.slug}
                    href={withLocale(locale, `/learn/${entry.slug}`)}
                    className="rounded-xl border border-white/10 bg-[#0d111a] p-4"
                  >
                    <h3 className="text-base font-semibold text-zinc-100">{entry.title}</h3>
                    <p className="mt-1 text-sm text-zinc-300">{entry.description}</p>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
