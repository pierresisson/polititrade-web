import AdmZip from "adm-zip";
import { existsSync, mkdirSync, statSync, writeFileSync, readFileSync } from "fs";
import { join } from "path";
import type { PTRIndexEntry } from "./types";

const CACHE_DIR = join("/tmp", "house-ptr");
const ZIP_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

const USER_AGENT = "PolitiTrades/1.0 (contact@polititrades.com)";

function ensureCacheDir() {
  if (!existsSync(CACHE_DIR)) {
    mkdirSync(CACHE_DIR, { recursive: true });
  }
}

function isZipFresh(zipPath: string): boolean {
  if (!existsSync(zipPath)) return false;
  const stat = statSync(zipPath);
  return Date.now() - stat.mtimeMs < ZIP_MAX_AGE_MS;
}

/** Download the annual ZIP containing the XML index of financial disclosures */
export async function downloadYearZip(year: number): Promise<Buffer> {
  ensureCacheDir();
  const zipPath = join(CACHE_DIR, `${year}FD.ZIP`);

  if (isZipFresh(zipPath)) {
    console.log(`[xml-index] Using cached ZIP: ${zipPath}`);
    return readFileSync(zipPath) as unknown as Buffer;
  }

  const url = `https://disclosures-clerk.house.gov/public_disc/financial-pdfs/${year}FD.ZIP`;
  console.log(`[xml-index] Downloading ${url}...`);

  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
  });

  if (!response.ok) {
    throw new Error(`Failed to download ZIP for ${year}: ${response.status} ${response.statusText}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  writeFileSync(zipPath, buffer);
  console.log(`[xml-index] Saved ZIP (${(buffer.length / 1024 / 1024).toFixed(1)} MB)`);

  return buffer;
}

/** Parse the XML from the ZIP to extract PTR index entries */
export async function parseXmlIndex(year: number): Promise<PTRIndexEntry[]> {
  const zipBuffer = await downloadYearZip(year);
  const zip = new AdmZip(zipBuffer);
  const entries = zip.getEntries();

  // Find the XML file (e.g., 2025FD.xml)
  const xmlEntry = entries.find((e) => e.entryName.endsWith(".xml"));
  if (!xmlEntry) {
    throw new Error(`No XML file found in ${year}FD.ZIP`);
  }

  const xmlText = xmlEntry.getData().toString("utf8");
  return parseMembersXml(xmlText, year);
}

/** Parse <Member> tags from the XML, filtering for PTR filings */
function parseMembersXml(xml: string, year: number): PTRIndexEntry[] {
  const results: PTRIndexEntry[] = [];

  // Match each <Member>...</Member> block
  const memberRegex = /<Member>([\s\S]*?)<\/Member>/g;
  let match: RegExpExecArray | null;

  while ((match = memberRegex.exec(xml)) !== null) {
    const block = match[1];

    const filingType = extractTag(block, "FilingType");
    // Only PTR filings — XML uses "P" or "PTR" for Periodic Transaction Reports
    if (!filingType) continue;
    const ft = filingType.toUpperCase().trim();
    if (ft !== "P" && !ft.includes("PTR")) continue;

    const docId = extractTag(block, "DocID");
    const prefix = extractTag(block, "Prefix") || "";
    const last = extractTag(block, "Last") || "";
    const first = extractTag(block, "First") || "";
    const suffix = extractTag(block, "Suffix") || "";
    const office = extractTag(block, "StateDst") || "";
    const filingDate = extractTag(block, "FilingDate") || "";
    const filingYear = parseInt(extractTag(block, "Year") || String(year), 10);

    if (!docId) continue;

    // Build name: "LAST, FIRST PREFIX SUFFIX" (trimmed)
    const nameParts = [last, [first, prefix, suffix].filter(Boolean).join(" ")].filter(Boolean);
    const filerName = nameParts.join(", ").trim();

    results.push({
      docId,
      filerName,
      office,
      filingDate,
      filingYear,
      pdfUrl: `https://disclosures-clerk.house.gov/public_disc/ptr-pdfs/${filingYear}/${docId}.pdf`,
    });
  }

  console.log(`[xml-index] Found ${results.length} PTR entries for ${year}`);
  return results;
}

function extractTag(xml: string, tag: string): string | null {
  const regex = new RegExp(`<${tag}>([^<]*)</${tag}>`);
  const m = regex.exec(xml);
  return m ? m[1].trim() : null;
}
