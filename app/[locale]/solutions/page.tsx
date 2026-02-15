export const dynamic = "force-static";
export const dynamicParams = false;
export { generateLocaleParams as generateStaticParams } from "@/lib/i18n/static-params";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui/page-hero";
import { isLocale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { pageMetadata } from "@/lib/page-metadata";
import { withLocale } from "@/lib/i18n/routing";

const ITEMS = [
  { slug: "rwa", title: "RWA", description: "Asset tokenization and compliance-aware workflows." },
  { slug: "musicsforyou", title: "MusicSForYou", description: "Creator ownership and direct fan engagement." },
  { slug: "nft", title: "NFT", description: "Membership, ticketing, and digital collectibles." },
  { slug: "games", title: "Games", description: "Fast in-game assets and player-owned economy models." },
];

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const messages = await getMessages(locale);
  return pageMetadata(locale, "solutionsTitle", "/solutions", messages.solutions.description);
}

export default async function SolutionsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;

  const messages = await getMessages(locale);

  return (
    <div className="space-y-4">
      <PageHero title={messages.solutions.title} description={messages.solutions.description} />
      <div className="grid gap-3 sm:grid-cols-2">
        {ITEMS.map((item) => (
          <Link
            key={item.slug}
            href={withLocale(locale, `/solutions/${item.slug}`)}
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
