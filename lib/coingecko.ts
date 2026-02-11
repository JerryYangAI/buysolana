import "server-only";

const API_BASE = "https://api.coingecko.com/api/v3";

export const DEFAULT_PRICE_IDS = [
  "solana",
  "bitcoin",
  "ethereum",
  "usd-coin",
  "ripple",
  "dogecoin",
  "binancecoin",
] as const;

export type MarketsOrder =
  | "market_cap_desc"
  | "market_cap_asc"
  | "volume_desc"
  | "volume_asc"
  | "id_asc"
  | "id_desc";

export type CoinMarket = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  market_cap_rank: number;
  current_price: number;
  price_change_percentage_1h_in_currency: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency: number;
  market_cap: number;
  total_volume: number;
  sparkline_in_7d?: { price: number[] };
};

export type GlobalOverview = {
  marketCapUsd: number;
  marketCapChange24h: number;
  totalVolumeUsd: number;
  btcDominance: number;
  activeCryptocurrencies: number;
  markets: number;
};

export type TrendingCoin = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  marketCapRank: number;
  price: number;
  change24h: number;
};

export type CoinTicker = {
  exchange: string;
  pair: string;
  lastPrice: number;
  volume24h: number;
  trustScore: string | null;
  lastTradedAt: string;
};

export type CoinTickersResponse = {
  tickers: CoinTicker[];
  page: number;
  total: number;
};

export type CoinDetail = {
  id: string;
  symbol: string;
  name: string;
  image: { large: string };
  market_cap_rank?: number;
  market_data: {
    current_price: { usd: number };
    price_change_percentage_24h: number;
    market_cap: { usd: number };
    total_volume: { usd: number };
    fully_diluted_valuation?: { usd?: number };
    circulating_supply?: number;
    total_supply?: number;
    max_supply?: number;
    sparkline_7d?: { price: number[] };
  };
};

function buildHeaders() {
  const apiKey = process.env.COINGECKO_API_KEY;
  if (!apiKey) return undefined;

  return {
    "x-cg-demo-api-key": apiKey,
    "x-cg-pro-api-key": apiKey,
  };
}

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: buildHeaders(),
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error(`CoinGecko request failed (${response.status})`);
  }

  return (await response.json()) as T;
}

export async function getGlobalOverview() {
  const url = `${API_BASE}/global`;

  try {
    const data = await getJson<{
      data: {
        total_market_cap: { usd: number };
        market_cap_change_percentage_24h_usd: number;
        total_volume: { usd: number };
        market_cap_percentage: { btc: number };
        active_cryptocurrencies: number;
        markets: number;
      };
    }>(url);

    const overview: GlobalOverview = {
      marketCapUsd: data.data.total_market_cap.usd || 0,
      marketCapChange24h: data.data.market_cap_change_percentage_24h_usd || 0,
      totalVolumeUsd: data.data.total_volume.usd || 0,
      btcDominance: data.data.market_cap_percentage.btc || 0,
      activeCryptocurrencies: data.data.active_cryptocurrencies || 0,
      markets: data.data.markets || 0,
    };

    return { data: overview, error: null as string | null };
  } catch (error) {
    return {
      data: null as GlobalOverview | null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getMarkets(input?: {
  page?: number;
  perPage?: number;
  order?: MarketsOrder;
  ids?: readonly string[];
  sparkline?: boolean;
  priceChangePercentage?: string;
}) {
  const page = input?.page || 1;
  const perPage = input?.perPage || 50;
  const order = input?.order || "market_cap_desc";

  const query = new URLSearchParams({
    vs_currency: "usd",
    order,
    per_page: String(perPage),
    page: String(page),
    sparkline: String(input?.sparkline ?? true),
    price_change_percentage: input?.priceChangePercentage || "1h,24h,7d",
  });

  if (input?.ids && input.ids.length > 0) {
    query.set("ids", input.ids.join(","));
  }

  const url = `${API_BASE}/coins/markets?${query}`;

  try {
    const data = await getJson<CoinMarket[]>(url);
    return { data, error: null as string | null };
  } catch (error) {
    return {
      data: [] as CoinMarket[],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getTrending() {
  const url = `${API_BASE}/search/trending`;

  try {
    const data = await getJson<{
      coins: Array<{
        item: {
          id?: string;
          slug?: string;
          symbol?: string;
          name?: string;
          small?: string;
          market_cap_rank?: number;
        };
      }>;
    }>(url);

    const ids = data.coins
      .map((coin) => coin.item.id || coin.item.slug || "")
      .filter((value) => Boolean(value))
      .slice(0, 5);

    if (ids.length === 0) {
      return { data: [] as TrendingCoin[], error: null as string | null };
    }

    const marketResult = await getMarkets({
      ids,
      sparkline: false,
      perPage: ids.length,
      page: 1,
      priceChangePercentage: "24h",
    });

    const mapped = ids
      .map((id) => marketResult.data.find((coin) => coin.id === id))
      .filter((coin): coin is CoinMarket => Boolean(coin))
      .map((coin) => ({
        id: coin.id,
        symbol: coin.symbol,
        name: coin.name,
        image: coin.image,
        marketCapRank: coin.market_cap_rank,
        price: coin.current_price,
        change24h: coin.price_change_percentage_24h,
      }));

    return { data: mapped, error: marketResult.error };
  } catch (error) {
    return {
      data: [] as TrendingCoin[],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getCoinTickers(id: string, input?: { page?: number; perPage?: number }) {
  const page = input?.page || 1;
  const perPage = input?.perPage || 50;

  const query = new URLSearchParams({
    localization: "false",
    tickers: "true",
    market_data: "false",
    community_data: "false",
    developer_data: "false",
    sparkline: "false",
    page: String(page),
    per_page: String(perPage),
    order: "trust_score_desc",
  });

  const url = `${API_BASE}/coins/${id}?${query}`;

  try {
    const data = await getJson<{
      tickers: Array<{
        base: string;
        target: string;
        last: number;
        volume: number;
        trust_score: string | null;
        last_traded_at: string;
        market: { name: string };
      }>;
    }>(url);

    const tickers: CoinTicker[] = (data.tickers || []).map((ticker) => ({
      exchange: ticker.market.name,
      pair: `${ticker.base}/${ticker.target}`,
      lastPrice: ticker.last || 0,
      volume24h: ticker.volume || 0,
      trustScore: ticker.trust_score,
      lastTradedAt: ticker.last_traded_at,
    }));

    return {
      data: {
        tickers,
        page,
        total: tickers.length,
      } satisfies CoinTickersResponse,
      error: null as string | null,
    };
  } catch (error) {
    return {
      data: {
        tickers: [] as CoinTicker[],
        page,
        total: 0,
      } satisfies CoinTickersResponse,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getCoinDetail(id: string) {
  const query = new URLSearchParams({
    localization: "false",
    tickers: "false",
    market_data: "true",
    community_data: "false",
    developer_data: "false",
    sparkline: "true",
  });

  const url = `${API_BASE}/coins/${id}?${query}`;

  try {
    const data = await getJson<CoinDetail>(url);
    return { data, error: null as string | null };
  } catch (error) {
    return {
      data: null as CoinDetail | null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getCoinMarkets(ids = DEFAULT_PRICE_IDS as readonly string[]) {
  return getMarkets({
    ids,
    order: "market_cap_desc",
    perPage: ids.length,
    page: 1,
    sparkline: false,
    priceChangePercentage: "24h",
  });
}

export function fallbackMarkets(): CoinMarket[] {
  return [
    {
      id: "solana",
      symbol: "sol",
      name: "Solana",
      image: "",
      market_cap_rank: 0,
      current_price: 0,
      price_change_percentage_1h_in_currency: 0,
      price_change_percentage_24h: 0,
      price_change_percentage_7d_in_currency: 0,
      market_cap: 0,
      total_volume: 0,
      sparkline_in_7d: { price: [] },
    },
    {
      id: "bitcoin",
      symbol: "btc",
      name: "Bitcoin",
      image: "",
      market_cap_rank: 0,
      current_price: 0,
      price_change_percentage_1h_in_currency: 0,
      price_change_percentage_24h: 0,
      price_change_percentage_7d_in_currency: 0,
      market_cap: 0,
      total_volume: 0,
      sparkline_in_7d: { price: [] },
    },
    {
      id: "ethereum",
      symbol: "eth",
      name: "Ethereum",
      image: "",
      market_cap_rank: 0,
      current_price: 0,
      price_change_percentage_1h_in_currency: 0,
      price_change_percentage_24h: 0,
      price_change_percentage_7d_in_currency: 0,
      market_cap: 0,
      total_volume: 0,
      sparkline_in_7d: { price: [] },
    },
  ];
}
