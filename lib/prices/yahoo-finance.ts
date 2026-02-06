import yahooFinance from "yahoo-finance2";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import type { SupabaseClient } from "@supabase/supabase-js";

export type PriceRow = {
  ticker: string;
  price_date: string; // YYYY-MM-DD
  open: number | null;
  high: number | null;
  low: number | null;
  close: number;
  adj_close: number | null;
  volume: number | null;
};

const RATE_LIMIT_MS = 200;

let lastCallAt = 0;

async function throttle() {
  const now = Date.now();
  const wait = RATE_LIMIT_MS - (now - lastCallAt);
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastCallAt = Date.now();
}

type HistoricalRow = {
  date: Date;
  open?: number;
  high?: number;
  low?: number;
  close: number;
  adjClose?: number;
  volume?: number;
};

export async function fetchHistoricalPrices(
  ticker: string,
  startDate: string,
  endDate: string
): Promise<PriceRow[]> {
  await throttle();

  const result = (await yahooFinance.historical(ticker, {
    period1: startDate,
    period2: endDate,
  })) as HistoricalRow[];

  return result.map((row) => ({
    ticker,
    price_date: row.date.toISOString().split("T")[0],
    open: row.open ?? null,
    high: row.high ?? null,
    low: row.low ?? null,
    close: row.close,
    adj_close: row.adjClose ?? null,
    volume: row.volume ?? null,
  }));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function upsertPrices(
  supabase: SupabaseClient<any>,
  prices: PriceRow[]
): Promise<{ inserted: number; errors: number }> {
  const CHUNK_SIZE = 500;
  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < prices.length; i += CHUNK_SIZE) {
    const chunk = prices.slice(i, i + CHUNK_SIZE);
    const { error } = await supabase
      .from("stock_prices")
      .upsert(chunk, { onConflict: "ticker,price_date" });

    if (error) {
      console.error(`Upsert error (chunk ${i / CHUNK_SIZE}):`, error.message);
      errors++;
    } else {
      inserted += chunk.length;
    }
  }

  return { inserted, errors };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function needsRefresh(
  supabase: SupabaseClient<any>,
  ticker: string,
  maxAgeMinutes = 360
): Promise<boolean> {
  const { data } = await supabase
    .from("price_fetch_log")
    .select("last_fetched_at, status")
    .eq("ticker", ticker)
    .single();

  if (!data || data.status === "error") return true;
  if (!data.last_fetched_at) return true;

  const ageMs = Date.now() - new Date(data.last_fetched_at as string).getTime();
  return ageMs > maxAgeMinutes * 60 * 1000;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateFetchLog(
  supabase: SupabaseClient<any>,
  ticker: string,
  status: "ok" | "error" | "not_found",
  earliestDate?: string,
  latestDate?: string
) {
  await supabase.from("price_fetch_log").upsert(
    {
      ticker,
      last_fetched_at: new Date().toISOString(),
      earliest_date: earliestDate ?? null,
      latest_date: latestDate ?? null,
      status,
    },
    { onConflict: "ticker" }
  );
}
