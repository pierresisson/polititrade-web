// UI-facing types for data fetched from Supabase

export type PoliticianWithStats = {
  id: string;
  name: string;
  party: string | null;
  chamber: string | null;
  state: string | null;
  image_url: string | null;
  trade_count: number;
  volume: number;
  top_ticker: string | null;
};

export type TradeWithPolitician = {
  id: string;
  person_name: string;
  asset_name: string | null;
  ticker: string | null;
  trade_type: string | null;
  trade_date: string | null;
  disclosure_date: string | null;
  amount_min: number | null;
  amount_max: number | null;
  politician_id: string | null;
  politicians: {
    name: string;
    party: string | null;
    state: string | null;
    chamber: string | null;
  } | null;
};

export type TrendingStock = {
  ticker: string;
  asset_name: string;
  trade_count: number;
};

export type WeeklyStats = {
  totalVolume: string;
  totalTrades: number;
  activePoliticians: number;
};

export type TradeType = "buy" | "sell" | "exchange" | "other";
export type Party = "D" | "R";
export type Chamber = "House" | "Senate";

// ─── Performance types ────────────────────────────────────────────────

export type Timeframe = "1d" | "1w" | "1m" | "3m" | "6m" | "1y" | "to_date";

export type TradePerformanceData = {
  trade_id: string;
  reference_date: string | null;
  reference_price: number | null;
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
  computed_at: string | null;
};

export type PricePoint = {
  date: string;
  close: number;
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

export type AccessLevel = "guest" | "account" | "premium";

// Serializable performance map (plain object for RSC boundary)
export type TradePerformanceMap = Record<string, TradePerformanceData>;
