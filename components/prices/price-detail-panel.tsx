"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkline } from "@/components/prices/sparkline";
import type { CoinDetail, CoinTicker } from "@/lib/coingecko";
import { formatCompactNumber, formatPercent, formatPrice, percentColorClass, percentTone } from "@/lib/formatters";
import type { Locale } from "@/lib/i18n/config";
import { withLocale } from "@/lib/i18n/routing";

type Props = {
  locale: Locale;
  coin: CoinDetail;
  tickers: CoinTicker[];
  tickerPage: number;
  hasError: boolean;
  errorMessage?: string;
};

function badgeTone(value: number) {
  const tone = percentTone(value);
  if (tone === "up") return "up" as const;
  if (tone === "down") return "down" as const;
  return "neutral" as const;
}

export function PriceDetailPanel({ locale, coin, tickers, tickerPage, hasError, errorMessage }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState("");

  const filteredTickers = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return tickers;

    return tickers.filter((ticker) => {
      return ticker.exchange.toLowerCase().includes(q) || ticker.pair.toLowerCase().includes(q);
    });
  }, [filter, tickers]);

  function updateQuery(update: Record<string, string | number | null>) {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(update)) {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    }

    const q = params.toString();
    router.push(q ? `${pathname}?${q}` : pathname);
  }

  const volumeToMcap = coin.market_data.market_cap.usd > 0
    ? (coin.market_data.total_volume.usd / coin.market_data.market_cap.usd) * 100
    : 0;

  return (
    <div className="space-y-4 overflow-x-hidden">
      <Card>
        <CardContent className="pt-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              {coin.image?.large ? (
                <img src={coin.image.large} alt={coin.name} className="h-10 w-10 rounded-full" />
              ) : (
                <span className="h-10 w-10 rounded-full bg-white/10" />
              )}
              <div className="min-w-0">
                <h1 className="truncate text-3xl font-semibold text-zinc-100">{coin.name}</h1>
                <p className="text-xs uppercase text-zinc-400">{coin.symbol}</p>
              </div>
            </div>

            <div className="text-right tabular-nums">
              <p className="text-3xl font-semibold text-zinc-100">{formatPrice(coin.market_data.current_price.usd || 0)}</p>
              <Badge tone={badgeTone(coin.market_data.price_change_percentage_24h || 0)} className="mt-2">
                {formatPercent(coin.market_data.price_change_percentage_24h || 0)}
              </Badge>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div>
              <p className="text-xs text-zinc-400">Market Cap</p>
              <p className="text-sm text-zinc-100 tabular-nums">${formatCompactNumber(coin.market_data.market_cap.usd || 0)}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-400">24h Volume</p>
              <p className="text-sm text-zinc-100 tabular-nums">${formatCompactNumber(coin.market_data.total_volume.usd || 0)}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-400">Rank</p>
              <p className="text-sm text-zinc-100 tabular-nums">#{coin.market_cap_rank || "-"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>7d Price Trend</CardTitle>
          <CardDescription>Short-term context only, not a timing signal</CardDescription>
        </CardHeader>
        <CardContent>
          <Sparkline
            values={coin.market_data.sparkline_7d?.price || []}
            className="h-36"
            strokeClassName={percentColorClass(coin.market_data.price_change_percentage_24h || 0)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Market Metrics</CardTitle>
          <CardDescription>Supply and liquidity snapshot</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-[#0d111a] p-3">
            <p className="text-xs text-zinc-400">Fully Diluted Valuation</p>
            <p className="mt-1 text-sm text-zinc-100 tabular-nums">${formatCompactNumber(coin.market_data.fully_diluted_valuation?.usd || 0)}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#0d111a] p-3">
            <p className="text-xs text-zinc-400">Circulating Supply</p>
            <p className="mt-1 text-sm text-zinc-100 tabular-nums">{formatCompactNumber(coin.market_data.circulating_supply || 0)}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#0d111a] p-3">
            <p className="text-xs text-zinc-400">Max Supply</p>
            <p className="mt-1 text-sm text-zinc-100 tabular-nums">{formatCompactNumber(coin.market_data.max_supply || 0)}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#0d111a] p-3">
            <p className="text-xs text-zinc-400">Total Supply</p>
            <p className="mt-1 text-sm text-zinc-100 tabular-nums">{formatCompactNumber(coin.market_data.total_supply || 0)}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#0d111a] p-3">
            <p className="text-xs text-zinc-400">Volume / Market Cap</p>
            <p className="mt-1 text-sm text-zinc-100 tabular-nums">{volumeToMcap.toFixed(2)}%</p>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Trading Info</CardTitle>
          <CardDescription>Exchange/pair level tickers from CoinGecko</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <input
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              placeholder="Filter by exchange or pair"
              className="h-10 rounded-lg border border-white/20 bg-[#0c1018] px-3 text-sm text-zinc-100 outline-none focus:border-cyan-300"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => updateQuery({ tickersPage: Math.max(1, tickerPage - 1) })}
                disabled={tickerPage <= 1}
                className="rounded-lg border border-white/20 px-3 py-1 text-sm text-zinc-200 disabled:opacity-40"
              >
                Prev
              </button>
              <button
                type="button"
                onClick={() => updateQuery({ tickersPage: tickerPage + 1 })}
                className="rounded-lg border border-white/20 px-3 py-1 text-sm text-zinc-200"
              >
                Next
              </button>
            </div>
          </div>

          {hasError ? (
            <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-4">
              <p className="text-sm text-rose-300">{errorMessage || "Ticker feed unavailable."}</p>
              <button
                type="button"
                onClick={() => router.refresh()}
                className="mt-2 rounded-lg border border-white/20 px-3 py-1 text-sm text-zinc-200"
              >
                Retry
              </button>
            </div>
          ) : null}

          {!hasError && filteredTickers.length === 0 ? (
            <div className="rounded-xl border border-white/10 p-4 text-sm text-zinc-300">
              No tickers matched the filter.
              <button
                type="button"
                onClick={() => setFilter("")}
                className="ml-2 rounded border border-white/20 px-2 py-1 text-xs"
              >
                Clear filters
              </button>
            </div>
          ) : null}

          {!hasError && filteredTickers.length > 0 ? (
            <>
              <div className="hidden overflow-hidden md:block">
                <table className="w-full table-fixed text-sm">
                  <thead className="sticky top-0 z-10 bg-[#0b0f16]/95 backdrop-blur">
                    <tr className="text-left text-xs text-zinc-400">
                      <th className="w-[22%] py-2">Exchange</th>
                      <th className="w-[18%] py-2">Pair</th>
                      <th className="w-[15%] py-2">Last Price</th>
                      <th className="w-[15%] py-2">24h Volume</th>
                      <th className="w-[12%] py-2">Trust</th>
                      <th className="w-[18%] py-2">Last Traded</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTickers.map((ticker, idx) => (
                      <tr key={`${ticker.exchange}-${ticker.pair}-${idx}`} className="border-b border-white/10 text-zinc-200 hover:bg-white/5">
                        <td className="truncate py-3">{ticker.exchange}</td>
                        <td className="truncate py-3 tabular-nums">{ticker.pair}</td>
                        <td className="py-3 tabular-nums">{formatPrice(ticker.lastPrice || 0)}</td>
                        <td className="py-3 tabular-nums">${formatCompactNumber(ticker.volume24h || 0)}</td>
                        <td className="py-3 tabular-nums text-zinc-300">{ticker.trustScore || "-"}</td>
                        <td className="py-3 text-xs text-zinc-400">{new Date(ticker.lastTradedAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-3 md:hidden">
                {filteredTickers.map((ticker, idx) => (
                  <article key={`${ticker.exchange}-${ticker.pair}-${idx}`} className="rounded-xl border border-white/10 bg-[#0d111a] p-3 text-sm">
                    <p className="font-medium text-zinc-100">{ticker.exchange}</p>
                    <p className="text-xs text-zinc-400">{ticker.pair}</p>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs tabular-nums">
                      <div>
                        <p className="text-zinc-500">Last</p>
                        <p className="text-zinc-200">{formatPrice(ticker.lastPrice || 0)}</p>
                      </div>
                      <div>
                        <p className="text-zinc-500">24h Vol</p>
                        <p className="text-zinc-200">${formatCompactNumber(ticker.volume24h || 0)}</p>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-zinc-500">{new Date(ticker.lastTradedAt).toLocaleString()}</p>
                  </article>
                ))}
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>

      <Card className="border-amber-300/40 bg-amber-300/10">
        <CardContent className="pt-4 text-sm text-amber-100">
          No buy/sell timing advice. Use this page for education and verification only. <Link href={withLocale(locale, "/security")} className="underline">/security</Link>
        </CardContent>
      </Card>
    </div>
  );
}
