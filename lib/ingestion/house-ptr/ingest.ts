import { createClient } from "@supabase/supabase-js";
import { parseXmlIndex } from "./xml-index";
import { downloadPDF } from "./download";
import { parsePTRDocument } from "./parse";
import { fetchRecentPTRs } from "./search";
import type { IngestOptions, IngestStats, PTRIndexEntry } from "./types";

const SOURCE = "HOUSE_PTR";
const KNOWN_STREAK_THRESHOLD = 20;

/** Strip characters that PostgreSQL rejects in text/jsonb: null bytes, surrogates, control chars */
function sanitize(str: string): string {
  // eslint-disable-next-line no-control-regex
  return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F\uFFFE\uFFFF]|\ud800[\udc00-\udfff]|[\ud800-\udfff]/g, "");
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars");
  }
  return createClient(url, key);
}

/** Main ingestion orchestrator for House PTR filings */
export async function ingestHousePTR(options: IngestOptions = {}): Promise<IngestStats> {
  const {
    year = new Date().getFullYear(),
    lookbackDays = 14,
    maxPages = 3,
    throttleMs = 800,
    skipSearch = false,
  } = options;

  const supabase = getSupabaseAdmin();

  const stats: IngestStats = {
    found: 0,
    new: 0,
    downloaded: 0,
    parsed: 0,
    inserted: 0,
    skipped: 0,
    errors: 0,
  };

  // ── Phase 1: XML Index from annual ZIP ──
  console.log(`\n=== Phase 1: XML Index for ${year} ===`);
  let entries: PTRIndexEntry[] = [];
  try {
    entries = await parseXmlIndex(year);
  } catch (err) {
    console.error(`[ingest] Failed to parse XML index:`, err);
    // Continue with Phase 2 if available
  }

  // ── Phase 2: Delta search for recent PTRs ──
  if (!skipSearch) {
    console.log(`\n=== Phase 2: Delta Search (last ${lookbackDays} days) ===`);
    try {
      const recentEntries = await fetchRecentPTRs({
        lookbackDays,
        maxPages,
        throttleMs,
      });

      // Merge: add entries not already in the XML index
      const existingDocIds = new Set(entries.map((e) => e.docId));
      let mergedCount = 0;
      for (const entry of recentEntries) {
        if (!existingDocIds.has(entry.docId)) {
          entries.push(entry);
          mergedCount++;
        }
      }
      console.log(`[ingest] Merged ${mergedCount} new entries from search`);
    } catch (err) {
      console.warn(`[ingest] Phase 2 search failed (non-fatal):`, err);
    }
  }

  stats.found = entries.length;
  console.log(`\n=== Processing ${entries.length} entries ===`);

  // ── Process each entry ──
  let knownStreak = 0;

  for (const entry of entries) {
    try {
      // Check if document already exists in DB
      const { data: existing } = await supabase
        .from("source_documents")
        .select("id, content_hash, status")
        .eq("source", SOURCE)
        .eq("external_id", entry.docId)
        .maybeSingle();

      if (existing && existing.status === "parsed") {
        stats.skipped++;
        knownStreak++;

        // Stop early if we've seen many consecutive known docs
        if (knownStreak >= KNOWN_STREAK_THRESHOLD) {
          console.log(`[ingest] Reached ${KNOWN_STREAK_THRESHOLD} consecutive known docs, stopping early`);
          break;
        }
        continue;
      }

      // Reset streak on new document
      knownStreak = 0;
      stats.new++;

      // Download PDF
      const { buffer, hash } = await downloadPDF(entry.docId, entry.filingYear, throttleMs);
      stats.downloaded++;

      // Skip if hash matches (same content)
      if (existing && existing.content_hash === hash) {
        console.log(`[ingest] DocID ${entry.docId}: same hash, skipping re-parse`);
        stats.skipped++;
        continue;
      }

      // Parse PDF
      const parsed = await parsePTRDocument(buffer, entry.docId, entry.filerName);
      stats.parsed++;

      // Parse filing date
      let filedAt: string | null = null;
      if (entry.filingDate) {
        const dateMatch = entry.filingDate.match(/(\d{2})\/(\d{2})\/(\d{4})/);
        if (dateMatch) {
          filedAt = `${dateMatch[3]}-${dateMatch[1]}-${dateMatch[2]}`;
        }
      }

      // Upsert source_document
      const { data: doc, error: docError } = await supabase
        .from("source_documents")
        .upsert(
          {
            source: SOURCE,
            external_id: entry.docId,
            source_url: entry.pdfUrl,
            filer_name: entry.filerName,
            office: entry.office,
            filing_year: entry.filingYear,
            filed_at: filedAt,
            content_hash: hash,
            status: "parsed",
            raw_text: sanitize(parsed.rawText).substring(0, 50000),
            ingested_at: new Date().toISOString(),
          },
          { onConflict: "source,external_id" }
        )
        .select("id")
        .single();

      if (docError) {
        console.error(`[ingest] DocID ${entry.docId}: upsert error:`, docError.message);
        stats.errors++;
        continue;
      }

      // Delete old trades for this document (re-parse case)
      await supabase
        .from("trades")
        .delete()
        .eq("source_document_id", doc.id);

      // Insert new trades
      if (parsed.trades.length > 0) {
        const tradeRows = parsed.trades.map((t) => ({
          source_document_id: doc.id,
          source: SOURCE,
          person_name: entry.filerName,
          office: entry.office,
          asset_name: sanitize(t.assetName),
          ticker: t.ticker,
          trade_type: t.tradeType,
          trade_date: t.tradeDate,
          disclosure_date: filedAt,
          amount_min: t.amountMin,
          amount_max: t.amountMax,
          raw_line: sanitize(t.rawLine),
          source_url: entry.pdfUrl,
        }));

        const { error: tradesError } = await supabase.from("trades").insert(tradeRows);

        if (tradesError) {
          console.error(`[ingest] DocID ${entry.docId}: trades insert error:`, tradesError.message);
          stats.errors++;
          continue;
        }

        stats.inserted += parsed.trades.length;
      }

      console.log(
        `[ingest] DocID ${entry.docId}: ${entry.filerName} → ${parsed.trades.length} trades`
      );
    } catch (err) {
      console.error(`[ingest] DocID ${entry.docId}: error:`, err);
      stats.errors++;

      // Record error in source_documents
      await supabase
        .from("source_documents")
        .upsert(
          {
            source: SOURCE,
            external_id: entry.docId,
            source_url: entry.pdfUrl,
            filer_name: entry.filerName,
            filing_year: entry.filingYear,
            status: "error",
            error_message: err instanceof Error ? err.message : String(err),
          },
          { onConflict: "source,external_id" }
        );
    }
  }

  // ── Phase 3: Reconcile politicians ──
  console.log(`\n=== Phase 3: Reconcile Politicians ===`);
  try {
    // Get distinct person_name + office from trades that have no politician_id
    const { data: unlinked } = await supabase
      .from("trades")
      .select("person_name, office")
      .is("politician_id", null)
      .limit(1000);

    if (unlinked && unlinked.length > 0) {
      // Deduplicate by person_name
      const seen = new Set<string>();
      const unique: { name: string; office: string }[] = [];
      for (const row of unlinked) {
        if (!row.person_name || seen.has(row.person_name)) continue;
        seen.add(row.person_name);
        unique.push({ name: row.person_name, office: row.office || "" });
      }

      console.log(`[reconcile] ${unique.length} unlinked politician names found`);

      for (const { name, office } of unique) {
        // Parse state/district from office (e.g. "GA12" → state "GA", district "12")
        const stateMatch = office.match(/^([A-Z]{2})(\d+)?$/);
        const state = stateMatch ? stateMatch[1] : null;
        const district = stateMatch ? stateMatch[2] || null : null;

        // Upsert politician
        const { data: politician, error: polError } = await supabase
          .from("politicians")
          .upsert(
            {
              name,
              chamber: "House",
              state,
              district,
            },
            { onConflict: "name,chamber" }
          )
          .select("id")
          .single();

        if (polError) {
          console.warn(`[reconcile] Failed to upsert politician "${name}":`, polError.message);
          continue;
        }

        // Link trades to politician
        const { error: linkError } = await supabase
          .from("trades")
          .update({ politician_id: politician.id })
          .eq("person_name", name)
          .is("politician_id", null);

        if (linkError) {
          console.warn(`[reconcile] Failed to link trades for "${name}":`, linkError.message);
        } else {
          console.log(`[reconcile] ${name} (${office}) → linked`);
        }
      }
    } else {
      console.log(`[reconcile] All trades already linked`);
    }
  } catch (err) {
    console.warn(`[reconcile] Phase 3 failed (non-fatal):`, err);
  }

  // ── Summary ──
  console.log(`\n=== Ingestion Complete ===`);
  console.log(`  Found:      ${stats.found}`);
  console.log(`  New:        ${stats.new}`);
  console.log(`  Downloaded: ${stats.downloaded}`);
  console.log(`  Parsed:     ${stats.parsed}`);
  console.log(`  Inserted:   ${stats.inserted} trades`);
  console.log(`  Skipped:    ${stats.skipped}`);
  console.log(`  Errors:     ${stats.errors}`);

  return stats;
}
