// ── House PTR Ingestion Types ──

export interface PTRIndexEntry {
  docId: string;
  filerName: string;
  office: string;
  filingDate: string; // raw date string from XML
  filingYear: number;
  pdfUrl: string;
}

export interface ParsedTrade {
  assetName: string;
  ticker: string | null;
  tradeType: "buy" | "sell" | "exchange" | "other";
  tradeDate: string | null; // YYYY-MM-DD
  amountMin: number | null;
  amountMax: number | null;
  rawLine: string;
}

export interface ParsedDocument {
  docId: string;
  filerName: string;
  trades: ParsedTrade[];
  rawText: string;
}

export interface IngestOptions {
  year?: number;
  lookbackDays?: number;
  maxPages?: number;
  throttleMs?: number;
  skipSearch?: boolean;
}

export interface IngestStats {
  found: number;
  new: number;
  downloaded: number;
  parsed: number;
  inserted: number;
  skipped: number;
  errors: number;
}

export interface HouseSession {
  cookies: string;
  token: string;
}
