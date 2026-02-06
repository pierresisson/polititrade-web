import type { HouseSession, PTRIndexEntry } from "./types";

const USER_AGENT = "PolitiTrades/1.0 (contact@polititrades.com)";
const SEARCH_URL = "https://disclosures-clerk.house.gov/FinancialDisclosure/ViewSearch";

/**
 * Search for recent PTR filings using the House disclosure search form (Phase 2).
 * Requires a bootstrapped session with anti-forgery token.
 */
export async function fetchRecentPTRs(
  session: HouseSession,
  options: { lookbackDays?: number; maxPages?: number; throttleMs?: number } = {}
): Promise<PTRIndexEntry[]> {
  const { lookbackDays = 14, maxPages = 3, throttleMs = 800 } = options;

  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - lookbackDays);
  const fromStr = `${String(fromDate.getMonth() + 1).padStart(2, "0")}/${String(fromDate.getDate()).padStart(2, "0")}/${fromDate.getFullYear()}`;

  const toDate = new Date();
  const toStr = `${String(toDate.getMonth() + 1).padStart(2, "0")}/${String(toDate.getDate()).padStart(2, "0")}/${toDate.getFullYear()}`;

  const results: PTRIndexEntry[] = [];

  for (let page = 1; page <= maxPages; page++) {
    if (page > 1) {
      await new Promise((r) => setTimeout(r, throttleMs));
    }

    console.log(`[search] Fetching page ${page}...`);

    const body = new URLSearchParams({
      __RequestVerificationToken: session.token,
      FilingYear: String(new Date().getFullYear()),
      State: "",
      District: "",
      FilingType: "PTR",
      FromDate: fromStr,
      ToDate: toStr,
      LastName: "",
      Page: String(page),
    });

    const response = await fetch(SEARCH_URL, {
      method: "POST",
      headers: {
        "User-Agent": USER_AGENT,
        "Content-Type": "application/x-www-form-urlencoded",
        Cookie: session.cookies,
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
    const pageResults = parseSearchResults(html);

    if (pageResults.length === 0) {
      console.log(`[search] No more results at page ${page}`);
      break;
    }

    results.push(...pageResults);
    console.log(`[search] Page ${page}: ${pageResults.length} results`);
  }

  console.log(`[search] Total: ${results.length} PTR entries from search`);
  return results;
}

/** Parse the HTML search results table into PTRIndexEntry[] */
function parseSearchResults(html: string): PTRIndexEntry[] {
  const entries: PTRIndexEntry[] = [];

  // Match table rows with disclosure data
  // Each result row contains: Name, Office, Year, Filing Type, DocID link
  const rowRegex = /<tr[^>]*class="[^"]*"[^>]*>([\s\S]*?)<\/tr>/g;
  let match: RegExpExecArray | null;

  while ((match = rowRegex.exec(html)) !== null) {
    const row = match[1];
    const cells = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((m) =>
      m[1].replace(/<[^>]+>/g, "").trim()
    );

    if (cells.length < 4) continue;

    // Extract DocID from link href
    const linkMatch = row.match(/href="[^"]*\/(\d+)\.pdf"/i);
    if (!linkMatch) continue;

    const docId = linkMatch[1];
    const filerName = cells[0] || "";
    const office = cells[1] || "";
    const filingYear = parseInt(cells[2], 10) || new Date().getFullYear();
    const filingDate = cells[3] || "";

    entries.push({
      docId,
      filerName,
      office,
      filingDate,
      filingYear,
      pdfUrl: `https://disclosures-clerk.house.gov/public_disc/ptr-pdfs/${filingYear}/${docId}.pdf`,
    });
  }

  return entries;
}
