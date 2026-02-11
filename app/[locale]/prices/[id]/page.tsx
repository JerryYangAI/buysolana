import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PriceDetailPanel } from "@/components/prices/price-detail-panel";
import { getCoinDetail, getCoinTickers } from "@/lib/coingecko";
import { isLocale } from "@/lib/i18n/config";
import { localizedMetadata } from "@/lib/metadata";

function parsePage(value: string | undefined, fallback = 1) {
  const n = Number.parseInt(value || "", 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(1, n);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  if (!isLocale(locale)) return {};

  return localizedMetadata({
    locale,
    title: `${id.toUpperCase()} Trading Info | buysolanas.com`,
    description: "Market metrics and exchange-level ticker information.",
    path: `/prices/${id}`,
  });
}

export default async function PriceDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ tickersPage?: string }>;
}) {
  const { locale, id } = await params;
  if (!isLocale(locale)) return null;

  const sp = await searchParams;
  const tickersPage = parsePage(sp.tickersPage, 1);

  const [{ data: coin, error: coinError }, { data: tickersData, error: tickersError }] = await Promise.all([
    getCoinDetail(id),
    getCoinTickers(id, { page: tickersPage, perPage: 50 }),
  ]);

  if (!coin && !coinError) {
    notFound();
  }

  if (!coin) {
    return (
      <section className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-6 text-sm text-rose-200">
        Unable to load asset data right now.
      </section>
    );
  }

  return (
    <PriceDetailPanel
      locale={locale}
      coin={coin}
      tickers={tickersData.tickers}
      tickerPage={tickersPage}
      hasError={Boolean(tickersError)}
      errorMessage={tickersError || undefined}
    />
  );
}
