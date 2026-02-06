import { createClient } from "./server";
import { formatVolume } from "@/lib/helpers";
import type {
  PoliticianWithStats,
  TradeWithPolitician,
  TrendingStock,
  WeeklyStats,
} from "./types";

export async function getTopPoliticians(
  limit = 12
): Promise<PoliticianWithStats[]> {
  const supabase = await createClient();

  // Fetch all politicians
  const { data: politicians, error: pError } = await supabase
    .from("politicians")
    .select("id, name, party, chamber, state, image_url");

  if (pError || !politicians) return [];

  // Fetch all trades with politician_id set
  const { data: trades, error: tError } = await supabase
    .from("trades")
    .select("politician_id, ticker, amount_min, amount_max")
    .not("politician_id", "is", null);

  if (tError || !trades) {
    // Return politicians with zero stats
    return politicians.slice(0, limit).map((p) => ({
      ...p,
      trade_count: 0,
      volume: 0,
      top_ticker: null,
    }));
  }

  // Group trades by politician_id
  const statsMap = new Map<
    string,
    { count: number; volume: number; tickers: Map<string, number> }
  >();

  for (const t of trades) {
    if (!t.politician_id) continue;
    let entry = statsMap.get(t.politician_id);
    if (!entry) {
      entry = { count: 0, volume: 0, tickers: new Map() };
      statsMap.set(t.politician_id, entry);
    }
    entry.count++;
    const mid =
      t.amount_min != null && t.amount_max != null
        ? (t.amount_min + t.amount_max) / 2
        : t.amount_min ?? t.amount_max ?? 0;
    entry.volume += mid;
    if (t.ticker) {
      entry.tickers.set(t.ticker, (entry.tickers.get(t.ticker) ?? 0) + 1);
    }
  }

  const result: PoliticianWithStats[] = politicians.map((p) => {
    const stats = statsMap.get(p.id);
    let top_ticker: string | null = null;
    if (stats) {
      let maxCount = 0;
      for (const [ticker, count] of stats.tickers) {
        if (count > maxCount) {
          maxCount = count;
          top_ticker = ticker;
        }
      }
    }
    return {
      ...p,
      trade_count: stats?.count ?? 0,
      volume: stats?.volume ?? 0,
      top_ticker,
    };
  });

  // Sort by trade_count descending
  result.sort((a, b) => b.trade_count - a.trade_count);

  return result.slice(0, limit);
}

export async function getRecentTrades(
  limit = 20
): Promise<TradeWithPolitician[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("trades")
    .select(
      "id, person_name, asset_name, ticker, trade_type, trade_date, disclosure_date, amount_min, amount_max, politician_id, politicians(name, party, state, chamber)"
    )
    .order("disclosure_date", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.map((row) => ({
    ...row,
    politicians: Array.isArray(row.politicians) ? row.politicians[0] ?? null : row.politicians ?? null,
  })) as TradeWithPolitician[];
}

export async function getTrendingStocks(
  limit = 5
): Promise<TrendingStock[]> {
  const supabase = await createClient();

  // Get trades from last 30 days with tickers
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data, error } = await supabase
    .from("trades")
    .select("ticker, asset_name")
    .not("ticker", "is", null)
    .gte("disclosure_date", thirtyDaysAgo.toISOString().split("T")[0]);

  if (error || !data) return [];

  // Aggregate by ticker
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
}

export async function getWeeklyStats(): Promise<WeeklyStats> {
  const supabase = await createClient();

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const cutoff = sevenDaysAgo.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("trades")
    .select("politician_id, amount_min, amount_max")
    .gte("disclosure_date", cutoff);

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
}

export async function getPoliticianById(
  id: string
): Promise<PoliticianWithStats | null> {
  const supabase = await createClient();

  const { data: politician, error } = await supabase
    .from("politicians")
    .select("id, name, party, chamber, state, image_url")
    .eq("id", id)
    .single();

  if (error || !politician) return null;

  // Get stats from trades
  const { data: trades } = await supabase
    .from("trades")
    .select("ticker, amount_min, amount_max")
    .eq("politician_id", id);

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
}

export async function getPoliticianTrades(
  politicianId: string
): Promise<TradeWithPolitician[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("trades")
    .select(
      "id, person_name, asset_name, ticker, trade_type, trade_date, disclosure_date, amount_min, amount_max, politician_id, politicians(name, party, state, chamber)"
    )
    .eq("politician_id", politicianId)
    .order("disclosure_date", { ascending: false });

  if (error || !data) return [];

  return data.map((row) => ({
    ...row,
    politicians: Array.isArray(row.politicians) ? row.politicians[0] ?? null : row.politicians ?? null,
  })) as TradeWithPolitician[];
}
