import { createHash } from "crypto";

const USER_AGENT = "PolitiTrades/1.0 (contact@polititrades.com)";
const MAX_RETRIES = 3;

/** Wait for a given number of milliseconds */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Download a PTR PDF and compute its sha256 hash */
export async function downloadPDF(
  docId: string,
  year: number,
  throttleMs = 800
): Promise<{ buffer: Buffer; hash: string }> {
  const url = `https://disclosures-clerk.house.gov/public_disc/ptr-pdfs/${year}/${docId}.pdf`;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      // Throttle before each request
      if (attempt > 1) {
        const backoff = throttleMs * Math.pow(2, attempt - 1);
        console.log(`[download] Retry ${attempt}/${MAX_RETRIES} for ${docId}, waiting ${backoff}ms...`);
        await sleep(backoff);
      } else {
        await sleep(throttleMs);
      }

      const response = await fetch(url, {
        headers: { "User-Agent": USER_AGENT },
      });

      if (response.status === 429 || response.status >= 500) {
        lastError = new Error(`HTTP ${response.status} for ${url}`);
        continue;
      }

      if (!response.ok) {
        throw new Error(`Failed to download PDF ${docId}: ${response.status} ${response.statusText}`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      const hash = createHash("sha256").update(buffer).digest("hex");

      return { buffer, hash };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt === MAX_RETRIES) break;
    }
  }

  throw lastError ?? new Error(`Failed to download PDF ${docId} after ${MAX_RETRIES} retries`);
}
