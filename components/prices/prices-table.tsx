"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { withLocale } from "@/lib/i18n/routing";
import type { CoinMarket } from "@/lib/coingecko";

type Props = {
  locale: Locale;
  coins: CoinMarket[];
  searchPlaceholder: string;
};

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value < 1 ? 4 : 2,
  }).format(value);
}

function percent(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

export function PricesTable({ locale, coins, searchPlaceholder }: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return coins;

    return coins.filter((coin) => {
      return coin.name.toLowerCase().includes(q) || coin.symbol.toLowerCase().includes(q);
    });
  }, [coins, query]);

  return (
    <section className="rounded-2xl border border-white/12 bg-white/[0.03] p-4 sm:p-6">
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={searchPlaceholder}
        className="mb-4 w-full rounded-lg border border-white/20 bg-[#0c1018] px-3 py-2 text-sm text-zinc-100 outline-none focus:border-cyan-300"
      />

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-zinc-400">
              <th className="py-2">Asset</th>
              <th className="py-2">Price</th>
              <th className="py-2">24h</th>
              <th className="py-2">Market Cap</th>
              <th className="py-2">Volume</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((coin) => (
              <tr key={coin.id} className="border-b border-white/5 text-zinc-200">
                <td className="py-3">
                  <Link href={withLocale(locale, `/prices/${coin.id}`)} className="font-medium hover:underline">
                    {coin.name} <span className="text-zinc-400 uppercase">{coin.symbol}</span>
                  </Link>
                </td>
                <td className="py-3">{money(coin.current_price)}</td>
                <td className={`py-3 ${coin.price_change_percentage_24h >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                  {percent(coin.price_change_percentage_24h)}
                </td>
                <td className="py-3">{money(coin.market_cap)}</td>
                <td className="py-3">{money(coin.total_volume)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
