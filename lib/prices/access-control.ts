import type {
  AccessLevel,
  Timeframe,
  TradePerformanceData,
  PoliticianPerformanceStats,
} from "@/lib/supabase/types";

const GUEST_TIMEFRAMES: Timeframe[] = ["1m"];
const ACCOUNT_TIMEFRAMES: Timeframe[] = ["1d", "1w", "1m", "3m"];
const PREMIUM_TIMEFRAMES: Timeframe[] = ["1d", "1w", "1m", "3m", "6m", "1y", "to_date"];

export function getAllowedTimeframes(level: AccessLevel): Timeframe[] {
  switch (level) {
    case "premium":
      return PREMIUM_TIMEFRAMES;
    case "account":
      return ACCOUNT_TIMEFRAMES;
    default:
      return GUEST_TIMEFRAMES;
  }
}

export function canViewChart(level: AccessLevel): boolean {
  return level !== "guest";
}

export function canViewSP500(level: AccessLevel): boolean {
  return level === "premium";
}

export function canViewCumulative(level: AccessLevel): boolean {
  return level === "premium";
}

export function filterPerformanceForAccess(
  perf: TradePerformanceData,
  level: AccessLevel
): TradePerformanceData {
  const allowed = getAllowedTimeframes(level);
  const filtered = { ...perf };

  const timeframeMap: Record<Timeframe, keyof TradePerformanceData> = {
    "1d": "return_1d",
    "1w": "return_1w",
    "1m": "return_1m",
    "3m": "return_3m",
    "6m": "return_6m",
    "1y": "return_1y",
    to_date: "return_to_date",
  };

  for (const [tf, key] of Object.entries(timeframeMap) as [Timeframe, keyof TradePerformanceData][]) {
    if (!allowed.includes(tf)) {
      (filtered as Record<string, unknown>)[key] = null;
    }
  }

  // Strip S&P 500 data for non-premium
  if (!canViewSP500(level)) {
    filtered.sp500_return_1m = null;
    filtered.sp500_return_3m = null;
    filtered.sp500_return_6m = null;
    filtered.sp500_return_1y = null;
    filtered.sp500_return_to_date = null;
  }

  return filtered;
}

export function filterStatsForAccess(
  stats: PoliticianPerformanceStats,
  level: AccessLevel
): PoliticianPerformanceStats {
  if (level === "premium") return stats;

  const filtered = { ...stats };

  if (level === "guest") {
    // Guest: hit rate only
    filtered.avg_return_1m = null;
    filtered.avg_return_3m = null;
    filtered.avg_return_1y = null;
    filtered.best_trade = null;
    filtered.worst_trade = null;
    filtered.vs_sp500_1y = null;
  } else {
    // Account: + avg return, best/worst trade, but no alpha
    filtered.vs_sp500_1y = null;
  }

  return filtered;
}
