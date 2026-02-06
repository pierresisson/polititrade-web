#!/usr/bin/env bun
/**
 * CLI script to ingest House PTR filings.
 *
 * Usage:
 *   bun run scripts/ingest-house-ptr.ts [options]
 *
 * Options:
 *   --year 2025         Year to ingest (default: current year)
 *   --lookbackDays 14   Days to look back for delta search
 *   --maxPages 3        Max search pages
 *   --throttleMs 800    Delay between requests (ms)
 *   --once              One-shot mode (no loop)
 *   --skipSearch         Skip Phase 2 (search), ZIP only
 */

// Polyfills MUST run before pdfjs-dist is loaded (static imports are hoisted)
import "@/lib/ingestion/pdf-polyfills";

// Dynamic import so polyfills are applied first
const { ingestHousePTR } = await import("@/lib/ingestion/house-ptr/ingest");

function parseArgs() {
  const args = process.argv.slice(2);
  const opts: Record<string, string | boolean> = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const next = args[i + 1];
      if (next && !next.startsWith("--")) {
        opts[key] = next;
        i++;
      } else {
        opts[key] = true;
      }
    }
  }

  return {
    year: opts.year ? parseInt(String(opts.year), 10) : undefined,
    lookbackDays: opts.lookbackDays ? parseInt(String(opts.lookbackDays), 10) : undefined,
    maxPages: opts.maxPages ? parseInt(String(opts.maxPages), 10) : undefined,
    throttleMs: opts.throttleMs ? parseInt(String(opts.throttleMs), 10) : undefined,
    once: opts.once === true,
    skipSearch: opts.skipSearch === true,
  };
}

async function main() {
  const opts = parseArgs();

  console.log("House PTR Ingestion");
  console.log("Options:", JSON.stringify(opts, null, 2));
  console.log("");

  const stats = await ingestHousePTR({
    year: opts.year,
    lookbackDays: opts.lookbackDays,
    maxPages: opts.maxPages,
    throttleMs: opts.throttleMs,
    skipSearch: opts.skipSearch,
  });

  if (stats.errors > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
