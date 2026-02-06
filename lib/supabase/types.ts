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
