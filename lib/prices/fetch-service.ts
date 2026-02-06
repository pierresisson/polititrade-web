import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  fetchHistoricalPrices,
  upsertPrices,
  needsRefresh,
  updateFetchLog,
} from "./yahoo-finance";

const SP500_TICKER = "^GSPC";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(url, key);
}

export async function refreshPricesForTicker(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any>,
  ticker: string,
  startDate: string
) {
  // Check if we already have recent data — fetch incrementally from latest_date + 1
  const { data: log } = await supabase
    .from("price_fetch_log")
    .select("latest_date")
    .eq("ticker", ticker)
    .single();

  const fetchFrom = log?.latest_date
    ? addDays(log.latest_date, 1)
    : startDate;

  const today = new Date().toISOString().split("T")[0];

  if (fetchFrom > today) {
    return { ticker, inserted: 0, skipped: true };
  }

  try {
    const prices = await fetchHistoricalPrices(ticker, fetchFrom, today);

    if (prices.length === 0) {
      await updateFetchLog(supabase, ticker, "ok", log?.latest_date ?? undefined, log?.latest_date ?? undefined);
      return { ticker, inserted: 0, skipped: false };
    }

    const { inserted, errors } = await upsertPrices(supabase, prices);

    const dates = prices.map((p) => p.price_date).sort();
    const earliest = log?.latest_date && log.latest_date < dates[0] ? log.latest_date : dates[0];
    const latest = dates[dates.length - 1];

    await updateFetchLog(supabase, ticker, errors > 0 ? "error" : "ok", earliest, latest);

    console.log(`  ${ticker}: ${inserted} prices (${fetchFrom} → ${today})`);
    return { ticker, inserted, skipped: false };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`  ${ticker}: FAILED — ${msg}`);

    // Check if it's a "not found" type error
    const isNotFound = msg.includes("Not Found") || msg.includes("no data");
    await updateFetchLog(supabase, ticker, isNotFound ? "not_found" : "error");

    return { ticker, inserted: 0, error: msg };
  }
}

export async function refreshPricesForAllTickers(options?: {
  maxAgeMinutes?: number;
  startDate?: string;
}) {
  const supabase = getSupabaseAdmin();
  const maxAge = options?.maxAgeMinutes ?? 360;
  const defaultStart = options?.startDate ?? "2020-01-01";

  // Get distinct tickers from trades
  const { data: tickerRows } = await supabase
    .from("trades")
    .select("ticker")
    .not("ticker", "is", null);

  const tickers = new Set<string>();
  tickers.add(SP500_TICKER); // Always include S&P 500

  if (tickerRows) {
    for (const row of tickerRows) {
      if (row.ticker) tickers.add(row.ticker);
    }
  }

  console.log(`Found ${tickers.size} tickers to process`);

  let total = 0;
  let skipped = 0;
  let errors = 0;

  for (const ticker of tickers) {
    const stale = await needsRefresh(supabase, ticker, maxAge);
    if (!stale) {
      skipped++;
      continue;
    }

    const result = await refreshPricesForTicker(supabase, ticker, defaultStart);
    if ("error" in result) {
      errors++;
    } else {
      total += result.inserted;
      if (result.skipped) skipped++;
    }
  }

  console.log(`\nDone: ${total} prices inserted, ${skipped} skipped, ${errors} errors`);
  return { total, skipped, errors };
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}
