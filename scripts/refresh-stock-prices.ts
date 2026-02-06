#!/usr/bin/env bun
/**
 * CLI script to refresh stock prices from Yahoo Finance.
 *
 * Usage:
 *   bun run refresh:prices [options]
 *
 * Options:
 *   --maxAge 360       Max age in minutes before re-fetching (default: 360)
 *   --startDate 2020-01-01  Earliest date to fetch (default: 2020-01-01)
 */

import { refreshPricesForAllTickers } from "@/lib/prices/fetch-service";

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
    maxAgeMinutes: opts.maxAge ? parseInt(String(opts.maxAge), 10) : undefined,
    startDate: opts.startDate ? String(opts.startDate) : undefined,
  };
}

async function main() {
  const opts = parseArgs();

  console.log("Stock Price Refresh");
  console.log("Options:", JSON.stringify(opts, null, 2));
  console.log("");

  const stats = await refreshPricesForAllTickers(opts);

  if (stats.errors > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
