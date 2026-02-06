import type { PTRIndexEntry } from "./types";

const USER_AGENT = "PolitiTrades/1.0 (contact@polititrades.com)";
const SEARCH_URL =
  "https://disclosures-clerk.house.gov/FinancialDisclosure/ViewMemberSearchResult";

/**
 * Search for recent PTR filings using the House disclosure search form (Phase 2).
 * The endpoint no longer requires a CSRF token or session cookie.
 */
export async function fetchRecentPTRs(
  options: {
    lookbackDays?: number;
    maxPages?: number;
    throttleMs?: number;
  } = {}
): Promise<PTRIndexEntry[]> {
  const { maxPages = 3, throttleMs = 800 } = options;
  const year = new Date().getFullYear();

  const results: PTRIndexEntry[] = [];

  for (let page = 1; page <= maxPages; page++) {
    if (page > 1) {
      await new Promise((r) => setTimeout(r, throttleMs));
    }

    console.log(`[search] Fetching page ${page}...`);

    const body = new URLSearchParams({
      LastName: "",
      FilingYear: String(year),
      State: "",
      District: "",
    });

    const response = await fetch(SEARCH_URL, {
      method: "POST",
      headers: {
        "User-Agent": USER_AGENT,
        "Content-Type": "application/x-www-form-urlencoded",
        Referer: "https://disclosures-clerk.house.gov/FinancialDisclosure",
      },
      body: body.toString(),
      redirect: "follow",
    });

    if (!response.ok) {
      console.warn(`[search] Page ${page} failed: ${response.status}`);
      break;
    }

    const html = await response.text();
    const pageResults = parseSearchResults(html, year);

    if (pageResults.length === 0) {
      console.log(`[search] No more results at page ${page}`);
      break;
    }

    results.push(...pageResults);
    console.log(`[search] Page ${page}: ${pageResults.length} results`);

    // This endpoint returns all results at once (no pagination), so break after page 1
    break;
  }

  console.log(`[search] Total: ${results.length} PTR entries from search`);
  return results;
}

/** Parse the HTML search results table into PTRIndexEntry[] */
function parseSearchResults(html: string, defaultYear: number): PTRIndexEntry[] {
  const entries: PTRIndexEntry[] = [];

  // Match each <tr role="row"> in the results table
  const rowRegex = /<tr\s+role="row">([\s\S]*?)<\/tr>/g;
  let match: RegExpExecArray | null;

  while ((match = rowRegex.exec(html)) !== null) {
    const row = match[1];

    // Only keep PTR filings
    if (!/PTR/i.test(row)) continue;

    const cells = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((m) =>
      m[1].replace(/<[^>]+>/g, "").trim()
    );

    if (cells.length < 4) continue;

    // Extract DocID from PDF link href (e.g. "public_disc/ptr-pdfs/2026/20033725.pdf")
    const linkMatch = row.match(/href="[^"]*\/(\d+)\.pdf"/i);
    if (!linkMatch) continue;

    const docId = linkMatch[1];
    const filerName = cells[0] || "";
    const office = cells[1] || "";
    const filingYear = parseInt(cells[2], 10) || defaultYear;

    entries.push({
      docId,
      filerName,
      office,
      filingDate: "",
      filingYear,
      pdfUrl: `https://disclosures-clerk.house.gov/public_disc/ptr-pdfs/${filingYear}/${docId}.pdf`,
    });
  }

  return entries;
}
