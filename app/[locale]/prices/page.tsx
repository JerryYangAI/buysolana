export const runtime = "edge";

import type { Metadata } from "next";
import { MarketDashboard } from "@/components/prices/market-dashboard";
import { PageHero } from "@/components/ui/page-hero";
import { fallbackMarkets, getGlobalOverview, getMarkets, getTrending } from "@/lib/coingecko";
import { isLocale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { pageMetadata } from "@/lib/page-metadata";

type DashboardTab = "all" | "highlights" | "categories";
type SortValue = "marketCap" | "change24h" | "volume" | "price";

function parseIntSafe(value: string | undefined, fallback: number, min: number, max: number) {
  const n = Number.parseInt(value || "", 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function parseTab(value: string | undefined): DashboardTab {
  if (value === "highlights" || value === "categories") return value;
  return "all";
}

function parseSort(value: string | undefined): SortValue {
  if (value === "change24h" || value === "volume" || value === "price") return value;
  return "marketCap";
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const messages = await getMessages(locale);
  return pageMetadata(locale, "pricesTitle", "/prices", messages.prices.description);
}

export default async function PricesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string; perPage?: string; q?: string; tab?: string; sort?: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;

  const query = await searchParams;
  const page = parseIntSafe(query.page, 1, 1, 10000);
  const perPage = parseIntSafe(query.perPage, 50, 10, 100);
  const tab = parseTab(query.tab);
  const sort = parseSort(query.sort);
  const q = (query.q || "").trim();

  const messages = await getMessages(locale);

  const [overviewResult, trendingResult, marketsResult] = await Promise.all([
    getGlobalOverview(),
    getTrending(),
    getMarkets({
      page,
      perPage,
      order: "market_cap_desc",
      sparkline: true,
      priceChangePercentage: "1h,24h,7d",
    }),
  ]);

  const markets = marketsResult.data.length > 0 ? marketsResult.data : fallbackMarkets();
  const topGainers = [...markets]
    .filter((coin) => coin.price_change_percentage_24h > 0)
    .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
    .slice(0, 5);

  const errorMessage = [overviewResult.error, trendingResult.error, marketsResult.error]
    .filter(Boolean)
    .join(" | ");

  return (
    <div className="space-y-4">
      <PageHero title={messages.prices.title} description={messages.prices.description} />

      <MarketDashboard
        locale={locale}
        markets={markets}
        overview={overviewResult.data}
        trending={trendingResult.data}
        topGainers={topGainers}
        page={page}
        perPage={perPage}
        query={q}
        tab={tab}
        sort={sort}
        hasError={Boolean(errorMessage)}
        errorMessage={errorMessage || undefined}
      />
    </div>
  );
}
