"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs } from "@/components/ui/tabs";
import { Sparkline } from "@/components/prices/sparkline";
import type { CoinMarket, GlobalOverview, TrendingCoin } from "@/lib/coingecko";
import { formatCompactNumber, formatPercent, formatPrice, percentColorClass, percentTone } from "@/lib/formatters";
import type { Locale } from "@/lib/i18n/config";
import { withLocale } from "@/lib/i18n/routing";

type DashboardTab = "all" | "highlights" | "categories";
type SortValue = "marketCap" | "change24h" | "volume" | "price";

type Props = {
  locale: Locale;
  markets: CoinMarket[];
  overview: GlobalOverview | null;
  trending: TrendingCoin[];
  topGainers: CoinMarket[];
  page: number;
  perPage: number;
  query: string;
  tab: DashboardTab;
  sort: SortValue;
  hasError: boolean;
  errorMessage?: string;
};

function toTone(value: number) {
  const tone = percentTone(value);
  if (tone === "up") return "up" as const;
  if (tone === "down") return "down" as const;
  return "neutral" as const;
}

function sortMarkets(markets: CoinMarket[], sort: SortValue) {
  const next = [...markets];

  next.sort((a, b) => {
    if (sort === "marketCap") return b.market_cap - a.market_cap;
    if (sort === "change24h") return b.price_change_percentage_24h - a.price_change_percentage_24h;
    if (sort === "volume") return b.total_volume - a.total_volume;
    return b.current_price - a.current_price;
  });

  return next;
}

export function MarketDashboard({
  locale,
  markets,
  overview,
  trending,
  topGainers,
  page,
  perPage,
  query,
  tab,
  sort,
  hasError,
  errorMessage,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(query);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = sortMarkets(markets, sort);

    if (!q) return sorted;

    return sorted.filter((coin) => {
      return coin.name.toLowerCase().includes(q) || coin.symbol.toLowerCase().includes(q);
    });
  }, [markets, query, sort]);

  const maxPage = Math.max(1, page + (markets.length < perPage ? 0 : 1));

  function pushQuery(update: Record<string, string | number | null | undefined>) {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(update)) {
      if (value === null || value === undefined || value === "") {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    }

    const queryText = params.toString();
    router.push(queryText ? `${pathname}?${queryText}` : pathname);
  }

  const resetFilters = () => {
    setSearch("");
    pushQuery({ q: null, tab: "all", sort: "marketCap", page: 1, perPage });
  };

  const onSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    pushQuery({ q: search || null, page: 1 });
  };

  return (
    <div className="space-y-4 overflow-x-hidden">
      <div className="rounded-xl border border-amber-300/40 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
        No buy/sell timing advice. Educational market data only. <Link href={withLocale(locale, "/security")} className="underline">/security</Link>
      </div>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Global Market Cap</CardTitle>
              <CardDescription>24h change and ecosystem breadth</CardDescription>
            </CardHeader>
            <CardContent>
              {overview ? (
                <>
                  <p className="text-2xl font-semibold text-zinc-100 tabular-nums">${formatCompactNumber(overview.marketCapUsd)}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge tone={toTone(overview.marketCapChange24h)}>{formatPercent(overview.marketCapChange24h)}</Badge>
                    <span className="text-xs text-zinc-400 tabular-nums">BTC DOM {overview.btcDominance.toFixed(2)}%</span>
                  </div>
                  <p className="mt-2 text-xs text-zinc-500 tabular-nums">{overview.activeCryptocurrencies} assets / {overview.markets} markets</p>
                </>
              ) : (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-40" />
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-4 w-48" />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>24h Trading Volume</CardTitle>
              <CardDescription>Liquidity pulse snapshot</CardDescription>
            </CardHeader>
            <CardContent>
              {overview ? (
                <>
                  <p className="text-2xl font-semibold text-zinc-100 tabular-nums">${formatCompactNumber(overview.totalVolumeUsd)}</p>
                  <p className="mt-2 text-xs text-zinc-400">Volume to market cap ratio</p>
                  <p className="text-sm text-zinc-200 tabular-nums">{overview.marketCapUsd > 0 ? ((overview.totalVolumeUsd / overview.marketCapUsd) * 100).toFixed(2) : "0.00"}%</p>
                </>
              ) : (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-40" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-5 w-16" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <Card>
            <CardHeader>
              <CardTitle>Trending</CardTitle>
              <CardDescription>Most watched assets now</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {trending.length === 0 ? <Skeleton className="h-24 w-full" /> : null}
              {trending.map((coin) => (
                <Link key={coin.id} href={withLocale(locale, `/prices/${coin.id}`)} className="flex items-center justify-between rounded-lg px-2 py-1 hover:bg-white/5">
                  <div>
                    <p className="text-sm font-medium text-zinc-100">{coin.name}</p>
                    <p className="text-xs uppercase text-zinc-400">{coin.symbol}</p>
                  </div>
                  <div className="text-right tabular-nums">
                    <p className="text-sm text-zinc-100">{formatPrice(coin.price)}</p>
                    <p className={`text-xs ${percentColorClass(coin.change24h)}`}>{formatPercent(coin.change24h)}</p>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Gainers</CardTitle>
              <CardDescription>24h momentum leaders</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {topGainers.length === 0 ? <Skeleton className="h-24 w-full" /> : null}
              {topGainers.map((coin) => (
                <Link key={coin.id} href={withLocale(locale, `/prices/${coin.id}`)} className="flex items-center justify-between rounded-lg px-2 py-1 hover:bg-white/5">
                  <div>
                    <p className="text-sm font-medium text-zinc-100">{coin.name}</p>
                    <p className="text-xs uppercase text-zinc-400">{coin.symbol}</p>
                  </div>
                  <div className="text-right tabular-nums">
                    <p className="text-sm text-zinc-100">{formatPrice(coin.current_price)}</p>
                    <p className={`text-xs ${percentColorClass(coin.price_change_percentage_24h)}`}>
                      {formatPercent(coin.price_change_percentage_24h)}
                    </p>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <Card className="overflow-hidden">
        <CardContent className="pt-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <Tabs
              value={tab}
              onChange={(next) => pushQuery({ tab: next, page: 1 })}
              options={[
                { value: "all", label: "All" },
                { value: "highlights", label: "Highlights" },
                { value: "categories", label: "Categories" },
              ]}
            />

            <form onSubmit={onSearchSubmit} className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search coin"
                className="h-10 w-full rounded-lg border border-white/20 bg-[#0c1018] px-3 text-sm text-zinc-100 outline-none focus:border-cyan-300 sm:w-56"
              />

              <select
                value={sort}
                onChange={(event) => pushQuery({ sort: event.target.value, page: 1 })}
                className="h-10 rounded-lg border border-white/20 bg-[#0c1018] px-3 text-sm text-zinc-100 outline-none"
              >
                <option value="marketCap">Market Cap</option>
                <option value="change24h">24h%</option>
                <option value="volume">Volume</option>
                <option value="price">Price</option>
              </select>

              <button type="submit" className="h-10 rounded-lg border border-white/20 px-3 text-sm text-zinc-200">
                Apply
              </button>
            </form>
          </div>
        </CardContent>
      </Card>

      {tab !== "all" ? (
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm text-zinc-300">{tab === "highlights" ? "Highlights module is coming soon." : "Categories module is coming soon."}</p>
          </CardContent>
        </Card>
      ) : null}

      {hasError ? (
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm text-rose-300">{errorMessage || "Market feed unavailable right now."}</p>
            <div className="mt-3 flex gap-2">
              <button onClick={() => router.refresh()} type="button" className="rounded-lg border border-white/20 px-3 py-1 text-sm text-zinc-200">Retry</button>
              <button onClick={resetFilters} type="button" className="rounded-lg border border-white/20 px-3 py-1 text-sm text-zinc-200">Clear filters</button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardContent className="pt-4">
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-white/10 p-6 text-center">
              <p className="text-sm text-zinc-300">No assets matched your filters.</p>
              <div className="mt-3 flex justify-center gap-2">
                <button onClick={() => router.refresh()} type="button" className="rounded-lg border border-white/20 px-3 py-1 text-sm text-zinc-200">Retry</button>
                <button onClick={resetFilters} type="button" className="rounded-lg border border-white/20 px-3 py-1 text-sm text-zinc-200">Clear filters</button>
              </div>
            </div>
          ) : (
            <>
              <div className="hidden overflow-hidden md:block">
                <table className="w-full table-fixed text-sm">
                  <thead className="sticky top-0 z-10 bg-[#0b0f16]/95 backdrop-blur">
                    <tr className="text-left text-xs text-zinc-400">
                      <th className="w-14 py-2">Rank</th>
                      <th className="w-[28%] py-2">Coin</th>
                      <th className="py-2">Price</th>
                      <th className="hidden py-2 md:hidden lg:table-cell">1h%</th>
                      <th className="py-2">24h%</th>
                      <th className="py-2">7d%</th>
                      <th className="py-2">Volume</th>
                      <th className="py-2">Market Cap</th>
                      <th className="hidden py-2 lg:table-cell">Last 7 Days</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((coin) => (
                      <tr
                        key={coin.id}
                        className="cursor-pointer border-b border-white/10 text-zinc-200 transition-colors hover:bg-white/5"
                        onClick={() => router.push(withLocale(locale, `/prices/${coin.id}`))}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") router.push(withLocale(locale, `/prices/${coin.id}`));
                        }}
                        tabIndex={0}
                      >
                        <td className="py-3 text-xs text-zinc-500 tabular-nums">#{coin.market_cap_rank || "-"}</td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            {coin.image ? <img src={coin.image} alt="" className="h-5 w-5 rounded-full" /> : <span className="h-5 w-5 rounded-full bg-white/10" />}
                            <div className="min-w-0">
                              <p className="truncate font-medium text-zinc-100">{coin.name}</p>
                              <p className="truncate text-xs uppercase text-zinc-400">{coin.symbol}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 tabular-nums">{formatPrice(coin.current_price)}</td>
                        <td className={`hidden py-3 tabular-nums lg:table-cell ${percentColorClass(coin.price_change_percentage_1h_in_currency || 0)}`}>
                          {formatPercent(coin.price_change_percentage_1h_in_currency || 0)}
                        </td>
                        <td className={`py-3 tabular-nums ${percentColorClass(coin.price_change_percentage_24h || 0)}`}>
                          {formatPercent(coin.price_change_percentage_24h || 0)}
                        </td>
                        <td className={`py-3 tabular-nums ${percentColorClass(coin.price_change_percentage_7d_in_currency || 0)}`}>
                          {formatPercent(coin.price_change_percentage_7d_in_currency || 0)}
                        </td>
                        <td className="py-3 tabular-nums">${formatCompactNumber(coin.total_volume || 0)}</td>
                        <td className="py-3 tabular-nums">${formatCompactNumber(coin.market_cap || 0)}</td>
                        <td className="hidden py-3 lg:table-cell">
                          <Sparkline
                            values={coin.sparkline_in_7d?.price || []}
                            strokeClassName={percentColorClass(coin.price_change_percentage_7d_in_currency || 0)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-3 md:hidden">
                {filtered.map((coin) => (
                  <button
                    key={coin.id}
                    type="button"
                    onClick={() => router.push(withLocale(locale, `/prices/${coin.id}`))}
                    className="w-full rounded-xl border border-white/10 bg-[#0d111a] p-4 text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex min-w-0 items-center gap-2">
                        {coin.image ? <img src={coin.image} alt="" className="h-6 w-6 rounded-full" /> : <span className="h-6 w-6 rounded-full bg-white/10" />}
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-zinc-100">{coin.name}</p>
                          <p className="text-xs uppercase text-zinc-400">{coin.symbol}</p>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-zinc-100 tabular-nums">{formatPrice(coin.current_price)}</p>
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2 text-xs tabular-nums">
                      <div>
                        <p className="text-zinc-500">24h</p>
                        <p className={percentColorClass(coin.price_change_percentage_24h || 0)}>{formatPercent(coin.price_change_percentage_24h || 0)}</p>
                      </div>
                      <div>
                        <p className="text-zinc-500">7d</p>
                        <p className={percentColorClass(coin.price_change_percentage_7d_in_currency || 0)}>{formatPercent(coin.price_change_percentage_7d_in_currency || 0)}</p>
                      </div>
                      <div>
                        <p className="text-zinc-500">MCap</p>
                        <p className="text-zinc-200">${formatCompactNumber(coin.market_cap || 0)}</p>
                      </div>
                    </div>

                    <div className="mt-2 text-xs tabular-nums">
                      <p className="text-zinc-500">Volume</p>
                      <p className="text-zinc-200">${formatCompactNumber(coin.total_volume || 0)}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between text-sm text-zinc-300">
                <p className="tabular-nums">Page {page}</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => pushQuery({ page: Math.max(1, page - 1) })}
                    disabled={page <= 1}
                    className="rounded-lg border border-white/20 px-3 py-1 disabled:opacity-40"
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    onClick={() => pushQuery({ page: Math.min(maxPage, page + 1) })}
                    className="rounded-lg border border-white/20 px-3 py-1"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
