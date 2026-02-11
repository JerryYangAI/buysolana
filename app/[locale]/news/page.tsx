import type { Metadata } from "next";
import { PageHero } from "@/components/ui/page-hero";
import { isLocale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { pageMetadata } from "@/lib/page-metadata";

const NEWS = [
  {
    id: "n1",
    title: "Network tooling update improves developer onboarding",
    summary: "A new release simplifies local testing and wallet simulation for learners.",
    date: "2026-02-10",
  },
  {
    id: "n2",
    title: "Community workshop series expands beginner tracks",
    summary: "More Q&A sessions now focus on wallet safety and transaction literacy.",
    date: "2026-02-08",
  },
];

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const messages = await getMessages(locale);
  return pageMetadata(locale, "newsTitle", "/news", messages.news.description);
}

export default async function NewsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;

  const messages = await getMessages(locale);

  return (
    <div className="space-y-4">
      <PageHero title={messages.news.title} description={messages.news.description} />
      <div className="grid gap-3">
        {NEWS.map((item) => (
          <article key={item.id} className="rounded-2xl border border-white/12 bg-white/[0.03] p-5">
            <p className="text-xs text-zinc-400">{item.date}</p>
            <h2 className="mt-1 text-lg font-semibold text-zinc-100">{item.title}</h2>
            <p className="mt-2 text-sm text-zinc-300">{item.summary}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
