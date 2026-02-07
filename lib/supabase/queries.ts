import { unstable_cache } from "next/cache";
import { createClient } from "./server";
import { supabaseStatic } from "./static";
import { formatVolume } from "@/lib/helpers";
import type {
  PoliticianWithStats,
  TradeWithPolitician,
  TradePerformanceData,
  PricePoint,
  TrendingStock,
  WeeklyStats,
} from "./types";
import { computePoliticianPerformance } from "@/lib/prices/performance";
import type { PoliticianPerformanceStats } from "@/lib/prices/performance";

// Exclude non-stock assets (treasury notes, bonds, etc.) while keeping rows with null asset_name
const STOCK_ONLY_FILTER =
  "asset_name.is.null,and(asset_name.not.ilike.%Treasury%,asset_name.not.ilike.%Municipal Bond%,asset_name.not.ilike.%Savings Bond%)";

export const getTopPoliticians = unstable_cache(
  async (limit: number): Promise<PoliticianWithStats[]> => {
    const { data, error } = await supabaseStatic.rpc("get_top_politicians", {
      p_limit: limit,
    });

    if (error || !data) return [];

    return (data as Array<Record<string, unknown>>).map((row) => ({
      id: row.id as string,
      name: row.name as string,
      party: (row.party as string) ?? null,
      chamber: (row.chamber as string) ?? null,
      state: (row.state as string) ?? null,
      image_url: (row.image_url as string) ?? null,
      trade_count: Number(row.trade_count),
      volume: Number(row.volume),
      top_ticker: (row.top_ticker as string) ?? null,
    }));
  },
  ["top-politicians"],
  { revalidate: 300 }
);

export const getRecentTrades = unstable_cache(
  async (
    limit: number,
    offset: number
  ): Promise<{ trades: TradeWithPolitician[]; total: number }> => {
    const { data, error, count } = await supabaseStatic
      .from("trades")
      .select(
        "id, person_name, asset_name, ticker, trade_type, trade_date, disclosure_date, amount_min, amount_max, politician_id, politicians(name, party, state, chamber)",
        { count: "exact" }
      )
      .or(STOCK_ONLY_FILTER)
      .order("trade_date", { ascending: false, nullsFirst: false })
      .range(offset, offset + limit - 1);

    if (error || !data) return { trades: [], total: 0 };

    const trades = data.map((row) => ({
      ...row,
      politicians: Array.isArray(row.politicians) ? row.politicians[0] ?? null : row.politicians ?? null,
    })) as TradeWithPolitician[];

    return { trades, total: count ?? 0 };
  },
  ["recent-trades"],
  { revalidate: 60 }
);

export const getTrendingStocks = unstable_cache(
  async (limit: number): Promise<TrendingStock[]> => {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const cutoff = ninetyDaysAgo.toISOString().split("T")[0];

    const { data, error } = await supabaseStatic
      .from("trades")
      .select("ticker, asset_name")
      .not("ticker", "is", null)
      .or(STOCK_ONLY_FILTER)
      .gte("trade_date", cutoff);

    if (error || !data) return [];

    const tickerMap = new Map<string, { asset_name: string; count: number }>();
    for (const t of data) {
      if (!t.ticker) continue;
      const entry = tickerMap.get(t.ticker);
      if (entry) {
        entry.count++;
      } else {
        tickerMap.set(t.ticker, { asset_name: t.asset_name ?? t.ticker, count: 1 });
      }
    }

    const result: TrendingStock[] = [];
    for (const [ticker, { asset_name, count }] of tickerMap) {
      result.push({ ticker, asset_name, trade_count: count });
    }

    result.sort((a, b) => b.trade_count - a.trade_count);
    return result.slice(0, limit);
  },
  ["trending-stocks"],
  { revalidate: 300 }
);

export const getWeeklyStats = unstable_cache(
  async (): Promise<WeeklyStats> => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const cutoff = thirtyDaysAgo.toISOString().split("T")[0];

    const { data, error } = await supabaseStatic
      .from("trades")
      .select("politician_id, amount_min, amount_max")
      .or(STOCK_ONLY_FILTER)
      .gte("trade_date", cutoff);

    if (error || !data) {
      return { totalVolume: "$0", totalTrades: 0, activePoliticians: 0 };
    }

    let totalVolume = 0;
    const politicianIds = new Set<string>();
    for (const t of data) {
      const mid =
        t.amount_min != null && t.amount_max != null
          ? (t.amount_min + t.amount_max) / 2
          : t.amount_min ?? t.amount_max ?? 0;
      totalVolume += mid;
      if (t.politician_id) politicianIds.add(t.politician_id);
    }

    return {
      totalVolume: formatVolume(totalVolume),
      totalTrades: data.length,
      activePoliticians: politicianIds.size,
    };
  },
  ["weekly-stats"],
  { revalidate: 300 }
);

export const getPoliticianById = unstable_cache(
  async (id: string): Promise<PoliticianWithStats | null> => {
    const { data: politician, error } = await supabaseStatic
      .from("politicians")
      .select("id, name, party, chamber, state, image_url")
      .eq("id", id)
      .single();

    if (error || !politician) return null;

    const { data: trades } = await supabaseStatic
      .from("trades")
      .select("ticker, amount_min, amount_max")
      .eq("politician_id", id)
      .or(STOCK_ONLY_FILTER);

    let trade_count = 0;
    let volume = 0;
    const tickers = new Map<string, number>();

    if (trades) {
      trade_count = trades.length;
      for (const t of trades) {
        const mid =
          t.amount_min != null && t.amount_max != null
            ? (t.amount_min + t.amount_max) / 2
            : t.amount_min ?? t.amount_max ?? 0;
        volume += mid;
        if (t.ticker) {
          tickers.set(t.ticker, (tickers.get(t.ticker) ?? 0) + 1);
        }
      }
    }

    let top_ticker: string | null = null;
    let maxCount = 0;
    for (const [ticker, count] of tickers) {
      if (count > maxCount) {
        maxCount = count;
        top_ticker = ticker;
      }
    }

    return { ...politician, trade_count, volume, top_ticker };
  },
  ["politician-by-id"],
  { revalidate: 300 }
);

export const getPoliticianTrades = unstable_cache(
  async (
    politicianId: string,
    limit: number,
    offset: number
  ): Promise<{ trades: TradeWithPolitician[]; total: number }> => {
    const { data, error, count } = await supabaseStatic
      .from("trades")
      .select(
        "id, person_name, asset_name, ticker, trade_type, trade_date, disclosure_date, amount_min, amount_max, politician_id, politicians(name, party, state, chamber)",
        { count: "exact" }
      )
      .eq("politician_id", politicianId)
      .or(STOCK_ONLY_FILTER)
      .order("trade_date", { ascending: false, nullsFirst: false })
      .range(offset, offset + limit - 1);

    if (error || !data) return { trades: [], total: 0 };

    const trades = data.map((row) => ({
      ...row,
      politicians: Array.isArray(row.politicians) ? row.politicians[0] ?? null : row.politicians ?? null,
    })) as TradeWithPolitician[];

    return { trades, total: count ?? 0 };
  },
  ["politician-trades"],
  { revalidate: 60 }
);

// ─── Performance queries ──────────────────────────────────────────────

export async function getTradePerformances(
  tradeIds: string[]
): Promise<Map<string, TradePerformanceData>> {
  if (tradeIds.length === 0) return new Map();

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("trade_performance")
    .select("*")
    .in("trade_id", tradeIds);

  if (error || !data) return new Map();

  const map = new Map<string, TradePerformanceData>();
  for (const row of data) {
    map.set(row.trade_id, row as TradePerformanceData);
  }
  return map;
}

export async function getPoliticianPerformance(
  politicianId: string,
  filters?: { tradeType?: "buy" | "sell" }
): Promise<PoliticianPerformanceStats> {
  const supabase = await createClient();
  return computePoliticianPerformance(supabase, politicianId, filters);
}

export async function getPriceHistory(
  ticker: string,
  from: string,
  to: string
): Promise<PricePoint[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("stock_prices")
    .select("price_date, close")
    .eq("ticker", ticker)
    .gte("price_date", from)
    .lte("price_date", to)
    .order("price_date", { ascending: true });

  if (error || !data) return [];

  return data.map((row) => ({
    date: row.price_date,
    close: Number(row.close),
  }));
}
