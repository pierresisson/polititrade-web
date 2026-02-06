import { PDFParse } from "pdf-parse";
import type { ParsedDocument, ParsedTrade } from "./types";

/** Standard PTR amount ranges mapped to min/max cents-free dollar values */
const AMOUNT_RANGES: Record<string, { min: number; max: number }> = {
  "$1,001 - $15,000": { min: 1001, max: 15000 },
  "$15,001 - $50,000": { min: 15001, max: 50000 },
  "$50,001 - $100,000": { min: 50001, max: 100000 },
  "$100,001 - $250,000": { min: 100001, max: 250000 },
  "$250,001 - $500,000": { min: 250001, max: 500000 },
  "$500,001 - $1,000,000": { min: 500001, max: 1000000 },
  "$1,000,001 - $5,000,000": { min: 1000001, max: 5000000 },
  "$5,000,001 - $25,000,000": { min: 5000001, max: 25000000 },
  "$25,000,001 - $50,000,000": { min: 25000001, max: 50000000 },
  "Over $50,000,000": { min: 50000001, max: 50000001 },
};

/** Parse an amount range string into min/max */
function parseAmountRange(text: string): { min: number | null; max: number | null } {
  for (const [key, value] of Object.entries(AMOUNT_RANGES)) {
    if (text.includes(key)) {
      return value;
    }
  }
  return { min: null, max: null };
}

/** Determine trade type from text indicators */
function parseTradeType(text: string): ParsedTrade["tradeType"] {
  const upper = text.toUpperCase();
  if (upper.includes("PURCHASE") || upper === "P") return "buy";
  if (upper.includes("SALE") || upper.includes("SELL") || upper === "S") return "sell";
  if (upper.includes("EXCHANGE")) return "exchange";
  return "other";
}

/** Parse a date in MM/DD/YYYY format to YYYY-MM-DD */
function parseDate(text: string): string | null {
  const match = text.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (!match) return null;
  const [, mm, dd, yyyy] = match;
  return `${yyyy}-${mm}-${dd}`;
}

/** Extract ticker from text like "(AAPL)" or "[AAPL]" */
function extractTicker(text: string): string | null {
  // Match ticker symbols in parentheses or brackets
  const match = text.match(/[\[(]([A-Z]{1,5})[\])]/);
  return match ? match[1] : null;
}

/**
 * Parse a PTR PDF buffer into structured trades.
 *
 * House PTR PDFs have a tabular format with rows like:
 * <asset description> | <ticker> | <type> | <date> | <amount range> | ...
 *
 * The exact layout varies, so we use flexible regex matching.
 */
export async function parsePTRDocument(
  pdfBuffer: Buffer,
  docId: string,
  filerName: string
): Promise<ParsedDocument> {
  const parser = new PDFParse({ data: new Uint8Array(pdfBuffer) });
  const textResult = await parser.getText();
  await parser.destroy();
  const rawText = textResult.text;

  const trades: ParsedTrade[] = [];
  const lines = rawText.split("\n").map((l: string) => l.trim()).filter(Boolean);

  // Strategy: scan each line for amount range patterns (most reliable anchor)
  // then extract surrounding trade information
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip header/boilerplate lines
    if (isHeaderLine(line)) continue;

    // Check if this line contains an amount range (strong signal of a trade line)
    const hasAmount = Object.keys(AMOUNT_RANGES).some((r) => line.includes(r));
    if (!hasAmount) continue;

    // Build context from this line and possibly adjacent lines
    const context = [lines[i - 1], line, lines[i + 1]].filter(Boolean).join(" ");

    const { min, max } = parseAmountRange(line);
    const ticker = extractTicker(context);

    // Determine trade type
    let tradeType: ParsedTrade["tradeType"] = "other";
    const typeMatch = context.match(/\b(P|S|PURCHASE|SALE|SELL|EXCHANGE)\b/i);
    if (typeMatch) {
      tradeType = parseTradeType(typeMatch[1]);
    }

    // Extract date
    const dateMatch = context.match(/\d{2}\/\d{2}\/\d{4}/);
    const tradeDate = dateMatch ? parseDate(dateMatch[0]) : null;

    // Extract asset name - text before the amount range or type indicator
    const assetName = extractAssetName(line, context);

    trades.push({
      assetName,
      ticker,
      tradeType,
      tradeDate,
      amountMin: min,
      amountMax: max,
      rawLine: line,
    });
  }

  console.log(`[parse] DocID ${docId}: extracted ${trades.length} trades from PDF`);

  return { docId, filerName, trades, rawText };
}

function isHeaderLine(line: string): boolean {
  const headers = [
    "PERIODIC TRANSACTION REPORT",
    "UNITED STATES HOUSE",
    "CLERK OF THE HOUSE",
    "FINANCIAL DISCLOSURE",
    "FILING ID",
    "FILER INFORMATION",
    "Name:",
    "Status:",
    "State/District:",
  ];
  return headers.some((h) => line.toUpperCase().includes(h.toUpperCase()));
}

function extractAssetName(line: string, context: string): string {
  // Try to get asset name: text before first $ sign or type indicator
  const dollarIdx = line.indexOf("$");
  if (dollarIdx > 10) {
    return line.substring(0, dollarIdx).replace(/\b(P|S|SP|JT)\b\s*$/i, "").trim();
  }

  // Fallback: first substantial chunk of text
  const parts = context.split(/\s{2,}/).filter((p) => p.length > 3);
  return parts[0] || line.substring(0, 60).trim();
}
