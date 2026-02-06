import type { SupabaseClient } from "@supabase/supabase-js";

const SP500_TICKER = "^GSPC";

type TradeRow = {
  id: string;
  ticker: string | null;
  trade_date: string | null;
  disclosure_date: string | null;
  trade_type: string | null;
  amount_min: number | null;
  amount_max: number | null;
  politician_id: string | null;
};

type TradePerformanceRow = {
  trade_id: string;
  reference_date: string;
  reference_price: number;
  is_estimated_date: boolean;
  return_1d: number | null;
  return_1w: number | null;
  return_1m: number | null;
  return_3m: number | null;
  return_6m: number | null;
  return_1y: number | null;
  return_to_date: number | null;
  sp500_return_1m: number | null;
  sp500_return_3m: number | null;
  sp500_return_6m: number | null;
  sp500_return_1y: number | null;
  sp500_return_to_date: number | null;
  current_price: number | null;
  computed_at: string;
};

export type PoliticianPerformanceStats = {
  avg_return_1m: number | null;
  avg_return_3m: number | null;
  avg_return_1y: number | null;
  hit_rate_1m: number | null;
  hit_rate_3m: number | null;
  best_trade: { ticker: string; return_to_date: number; trade_id: string } | null;
  worst_trade: { ticker: string; return_to_date: number; trade_id: string } | null;
  vs_sp500_1y: number | null;
  total_evaluated: number;
};

// ─── Helpers ──────────────────────────────────────────────────────────

async function findNearestPrice(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any>,
  ticker: string,
  targetDate: string
): Promise<{ price_date: string; close: number } | null> {
  // Find the nearest trading day on or after the target date (within 5 business days)
  const { data } = await supabase
    .from("stock_prices")
    .select("price_date, close")
    .eq("ticker", ticker)
    .gte("price_date", targetDate)
    .order("price_date", { ascending: true })
    .limit(1);

  if (data && data.length > 0) {
    // Check it's within 5 business days (~7 calendar days)
    const diff = daysBetween(targetDate, data[0].price_date);
    if (diff <= 7) return data[0];
  }

  // Try looking before the target date
  const { data: before } = await supabase
    .from("stock_prices")
    .select("price_date, close")
    .eq("ticker", ticker)
    .lte("price_date", targetDate)
    .order("price_date", { ascending: false })
    .limit(1);

  if (before && before.length > 0) {
    const diff = daysBetween(before[0].price_date, targetDate);
    if (diff <= 7) return before[0];
  }

  return null;
}

async function getLatestPrice(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any>,
  ticker: string
): Promise<{ price_date: string; close: number } | null> {
  const { data } = await supabase
    .from("stock_prices")
    .select("price_date, close")
    .eq("ticker", ticker)
    .order("price_date", { ascending: false })
    .limit(1);

  return data?.[0] ?? null;
}

function computeReturn(
  refPrice: number,
  currentPrice: number
): number {
  if (refPrice === 0) return 0;
  return ((currentPrice - refPrice) / refPrice) * 100;
}

function addCalendarDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function addMonths(dateStr: string, months: number): string {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split("T")[0];
}

function daysBetween(a: string, b: string): number {
  const da = new Date(a);
  const db = new Date(b);
  return Math.abs(Math.round((db.getTime() - da.getTime()) / (1000 * 60 * 60 * 24)));
}

// ─── Per-trade computation ────────────────────────────────────────────

const TIMEFRAMES = [
  { key: "return_1d", offset: () => ({ days: 1 }) },
  { key: "return_1w", offset: () => ({ days: 7 }) },
  { key: "return_1m", offset: () => ({ months: 1 }) },
  { key: "return_3m", offset: () => ({ months: 3 }) },
  { key: "return_6m", offset: () => ({ months: 6 }) },
  { key: "return_1y", offset: () => ({ months: 12 }) },
] as const;

export async function computeTradePerformance(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any>,
  trade: TradeRow
): Promise<TradePerformanceRow | null> {
  if (!trade.ticker) return null;

  // Determine reference date: prefer trade_date, fallback to disclosure_date
  const useDate = trade.trade_date ?? trade.disclosure_date;
  if (!useDate) return null;

  const isEstimated = !trade.trade_date;

  // Find reference price
  const refPoint = await findNearestPrice(supabase, trade.ticker, useDate);
  if (!refPoint) return null;

  // Get latest price for return_to_date
  const latest = await getLatestPrice(supabase, trade.ticker);
  const latestSp500 = await getLatestPrice(supabase, SP500_TICKER);

  // Get S&P 500 reference price
  const sp500Ref = await findNearestPrice(supabase, SP500_TICKER, useDate);

  // Compute returns at each timeframe
  const returns: Record<string, number | null> = {};
  const sp500Returns: Record<string, number | null> = {};

  for (const tf of TIMEFRAMES) {
    const off = tf.offset();
    const targetDate = "days" in off
      ? addCalendarDays(refPoint.price_date, off.days)
      : addMonths(refPoint.price_date, off.months);

    const priceAtTf = await findNearestPrice(supabase, trade.ticker, targetDate);
    returns[tf.key] = priceAtTf ? computeReturn(refPoint.close, priceAtTf.close) : null;

    // S&P 500 benchmark for longer timeframes
    if (sp500Ref && tf.key.match(/return_(1m|3m|6m|1y)/)) {
      const sp500AtTf = await findNearestPrice(supabase, SP500_TICKER, targetDate);
      const sp500Key = tf.key.replace("return_", "sp500_return_");
      sp500Returns[sp500Key] = sp500AtTf
        ? computeReturn(sp500Ref.close, sp500AtTf.close)
        : null;
    }
  }

  // Return to date
  const returnToDate = latest ? computeReturn(refPoint.close, latest.close) : null;
  const sp500ReturnToDate =
    sp500Ref && latestSp500
      ? computeReturn(sp500Ref.close, latestSp500.close)
      : null;

  return {
    trade_id: trade.id,
    reference_date: refPoint.price_date,
    reference_price: refPoint.close,
    is_estimated_date: isEstimated,
    return_1d: returns.return_1d ?? null,
    return_1w: returns.return_1w ?? null,
    return_1m: returns.return_1m ?? null,
    return_3m: returns.return_3m ?? null,
    return_6m: returns.return_6m ?? null,
    return_1y: returns.return_1y ?? null,
    return_to_date: returnToDate,
    sp500_return_1m: sp500Returns.sp500_return_1m ?? null,
    sp500_return_3m: sp500Returns.sp500_return_3m ?? null,
    sp500_return_6m: sp500Returns.sp500_return_6m ?? null,
    sp500_return_1y: sp500Returns.sp500_return_1y ?? null,
    sp500_return_to_date: sp500ReturnToDate,
    current_price: latest?.close ?? null,
    computed_at: new Date().toISOString(),
  };
}

// ─── Batch computation ────────────────────────────────────────────────

export async function computeAllTradePerformances(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any>,
  options?: { forceRecompute?: boolean; limit?: number }
) {
  const forceRecompute = options?.forceRecompute ?? false;
  const limit = options?.limit ?? 1000;

  // Get trades that need performance computed
  let query = supabase
    .from("trades")
    .select("id, ticker, trade_date, disclosure_date, trade_type, amount_min, amount_max, politician_id")
    .not("ticker", "is", null)
    .order("trade_date", { ascending: false, nullsFirst: false })
    .limit(limit);

  const { data: trades, error } = await query;

  if (error || !trades) {
    console.error("Failed to fetch trades:", error?.message);
    return { computed: 0, errors: 0 };
  }

  // If not forcing, filter out trades that already have performance
  let tradesToProcess = trades;
  if (!forceRecompute) {
    const tradeIds = trades.map((t) => t.id);
    const { data: existing } = await supabase
      .from("trade_performance")
      .select("trade_id")
      .in("trade_id", tradeIds);

    const existingIds = new Set((existing ?? []).map((e) => e.trade_id));
    tradesToProcess = trades.filter((t) => !existingIds.has(t.id));
  }

  console.log(`Processing ${tradesToProcess.length} trades (${trades.length} total, force=${forceRecompute})`);

  let computed = 0;
  let errors = 0;

  for (const trade of tradesToProcess) {
    const perf = await computeTradePerformance(supabase, trade as TradeRow);

    if (!perf) {
      continue; // No price data available
    }

    const { error: upsertError } = await supabase
      .from("trade_performance")
      .upsert(perf, { onConflict: "trade_id" });

    if (upsertError) {
      console.error(`  Error for trade ${trade.id}:`, upsertError.message);
      errors++;
    } else {
      computed++;
    }
  }

  console.log(`Done: ${computed} computed, ${errors} errors`);
  return { computed, errors };
}

// ─── Politician aggregate computation ─────────────────────────────────

export async function computePoliticianPerformance(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any>,
  politicianId: string,
  filters?: { tradeType?: "buy" | "sell" }
): Promise<PoliticianPerformanceStats> {
  let query = supabase
    .from("trade_performance")
    .select(
      "trade_id, return_1m, return_3m, return_1y, return_to_date, sp500_return_1y, trades!inner(id, ticker, trade_type, amount_min, amount_max, politician_id)"
    )
    .eq("trades.politician_id", politicianId);

  if (filters?.tradeType) {
    query = query.eq("trades.trade_type", filters.tradeType);
  }

  const { data, error } = await query;

  if (error || !data || data.length === 0) {
    return {
      avg_return_1m: null,
      avg_return_3m: null,
      avg_return_1y: null,
      hit_rate_1m: null,
      hit_rate_3m: null,
      best_trade: null,
      worst_trade: null,
      vs_sp500_1y: null,
      total_evaluated: 0,
    };
  }

  // Compute weighted averages
  type PerfRow = (typeof data)[number];

  function weightedAvg(rows: PerfRow[], key: "return_1m" | "return_3m" | "return_1y"): number | null {
    const valid = rows.filter((r) => r[key] != null);
    if (valid.length === 0) return null;

    let totalWeight = 0;
    let weightedSum = 0;
    for (const r of valid) {
      const trade = r.trades as unknown as TradeRow;
      const weight =
        trade.amount_min != null && trade.amount_max != null
          ? (trade.amount_min + trade.amount_max) / 2
          : 1;
      weightedSum += (r[key] as number) * weight;
      totalWeight += weight;
    }
    return totalWeight > 0 ? weightedSum / totalWeight : null;
  }

  function hitRate(rows: PerfRow[], key: "return_1m" | "return_3m"): number | null {
    // Only count buy trades
    const buys = rows.filter(
      (r) => r[key] != null && (r.trades as unknown as TradeRow).trade_type === "buy"
    );
    if (buys.length === 0) return null;
    const positive = buys.filter((r) => (r[key] as number) > 0);
    return (positive.length / buys.length) * 100;
  }

  // Best/worst by return_to_date
  let best: PoliticianPerformanceStats["best_trade"] = null;
  let worst: PoliticianPerformanceStats["worst_trade"] = null;

  for (const r of data) {
    if (r.return_to_date == null) continue;
    const trade = r.trades as unknown as TradeRow;
    const entry = {
      ticker: trade.ticker ?? "?",
      return_to_date: r.return_to_date as number,
      trade_id: r.trade_id,
    };
    if (!best || entry.return_to_date > best.return_to_date) best = entry;
    if (!worst || entry.return_to_date < worst.return_to_date) worst = entry;
  }

  // Alpha vs S&P 500
  const avgReturn1y = weightedAvg(data, "return_1y");
  const avgSp500 = data.filter((r) => r.sp500_return_1y != null);
  const avgSp500Return =
    avgSp500.length > 0
      ? avgSp500.reduce((s, r) => s + (r.sp500_return_1y as number), 0) / avgSp500.length
      : null;
  const vsSp500 =
    avgReturn1y != null && avgSp500Return != null
      ? avgReturn1y - avgSp500Return
      : null;

  return {
    avg_return_1m: weightedAvg(data, "return_1m"),
    avg_return_3m: weightedAvg(data, "return_3m"),
    avg_return_1y: weightedAvg(data, "return_1y"),
    hit_rate_1m: hitRate(data, "return_1m"),
    hit_rate_3m: hitRate(data, "return_3m"),
    best_trade: best,
    worst_trade: worst,
    vs_sp500_1y: vsSp500,
    total_evaluated: data.length,
  };
}
