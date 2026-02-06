#!/usr/bin/env bun
/**
 * CLI script to compute trade performance from stock prices.
 *
 * Usage:
 *   bun run compute:performance [options]
 *
 * Options:
 *   --force          Recompute all trades (not just missing ones)
 *   --limit 1000     Max trades to process (default: 1000)
 */

import { createClient } from "@supabase/supabase-js";
import { computeAllTradePerformances } from "@/lib/prices/performance";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(url, key);
}

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
    forceRecompute: opts.force === true,
    limit: opts.limit ? parseInt(String(opts.limit), 10) : undefined,
  };
}

async function main() {
  const opts = parseArgs();

  console.log("Trade Performance Computation");
  console.log("Options:", JSON.stringify(opts, null, 2));
  console.log("");

  const supabase = getSupabaseAdmin();
  const stats = await computeAllTradePerformances(supabase, opts);

  if (stats.errors > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
