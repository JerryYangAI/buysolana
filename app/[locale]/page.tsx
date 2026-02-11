export const runtime = "edge";

import Link from "next/link";
import type { Metadata } from "next";
import { getMessages } from "@/lib/i18n/messages";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { withLocale } from "@/lib/i18n/routing";
import { pageMetadata } from "@/lib/page-metadata";
import { fallbackMarkets, getCoinMarkets } from "@/lib/coingecko";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const messages = await getMessages(locale);
  return pageMetadata(locale, "homeTitle", "/", messages.meta.homeDescription);
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;

  const l = locale as Locale;
  const messages = await getMessages(l);
  const priceResult = await getCoinMarkets(["solana", "bitcoin", "ethereum"]);
  const featured = priceResult.data.length > 0 ? priceResult.data : fallbackMarkets();
  const orderedSections = [
    {
      key: "learn",
      title: messages.home.learn.title,
      description: messages.home.learn.description,
      cta: messages.home.learn.cta,
      href: "/learn",
    },
    {
      key: "solutions",
      title: messages.home.solutions.title,
      description: messages.home.solutions.description,
      cta: messages.home.solutions.cta,
      href: "/solutions",
    },
    {
      key: "community",
      title: messages.home.community.title,
      description: messages.home.community.description,
      cta: messages.home.community.cta,
      href: "/community",
    },
    {
      key: "news",
      title: messages.home.news.title,
      description: messages.home.news.description,
      cta: messages.home.news.cta,
      href: "/news",
    },
    {
      key: "blog-podcast",
      title: messages.home.blogPodcast.title,
      description: messages.home.blogPodcast.description,
      cta: messages.home.blogPodcast.cta,
      href: "/blog",
    },
  ] as const;

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-white/15 bg-gradient-to-br from-cyan-400/20 via-slate-900/40 to-emerald-300/10 p-6 sm:p-8">
        <p className="text-xs tracking-[0.14em] text-cyan-200 uppercase">{messages.hero.eyebrow}</p>
        <h1 className="mt-2 max-w-3xl text-4xl leading-tight font-semibold text-zinc-100 sm:text-5xl">
          {messages.hero.title}
        </h1>
        <p className="mt-4 max-w-2xl text-zinc-200">{messages.hero.description}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={withLocale(l, "/start")}
            className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-semibold text-black"
          >
            {messages.hero.primary}
          </Link>
          <Link
            href={withLocale(l, "/course")}
            className="rounded-lg border border-white/25 bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-100"
          >
            {messages.hero.secondary}
          </Link>
        </div>
      </section>

      <section className="rounded-2xl border border-white/12 bg-white/[0.03] p-5">
        <h2 className="text-lg font-semibold text-zinc-100">{messages.home.prices.title}</h2>
        <p className="mt-2 text-sm text-zinc-300">{messages.home.prices.description}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {featured.map((coin) => (
            <Link
              key={coin.id}
              href={withLocale(l, `/prices/${coin.id}`)}
              className="rounded-xl border border-white/10 bg-[#0c1018] p-3"
            >
              <p className="text-sm text-zinc-300 uppercase">{coin.symbol}</p>
              <p className="mt-1 text-xl font-semibold">${coin.current_price.toLocaleString()}</p>
            </Link>
          ))}
        </div>
        <Link
          href={withLocale(l, "/prices")}
          className="mt-4 inline-flex rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-black"
        >
          {messages.home.prices.cta}
        </Link>
      </section>

      {orderedSections.map((section) => (
        <section key={section.key} className="rounded-2xl border border-white/12 bg-white/[0.03] p-5">
          <h2 className="text-xl font-semibold text-zinc-100">{section.title}</h2>
          <p className="mt-2 text-sm text-zinc-300">{section.description}</p>
          <Link
            href={withLocale(l, section.href)}
            className="mt-4 inline-flex rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-black"
          >
            {section.cta}
          </Link>
        </section>
      ))}
    </div>
  );
}
