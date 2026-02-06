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

// Polyfill DOM APIs required by pdfjs-dist in Bun/Node
if (typeof globalThis.DOMMatrix === "undefined") {
  (globalThis as Record<string, unknown>).DOMMatrix = class DOMMatrix {
    constructor() {
      return Object.assign(this, {
        a: 1, b: 0, c: 0, d: 1, e: 0, f: 0,
        m11: 1, m12: 0, m13: 0, m14: 0,
        m21: 0, m22: 1, m23: 0, m24: 0,
        m31: 0, m32: 0, m33: 1, m34: 0,
        m41: 0, m42: 0, m43: 0, m44: 1,
        is2D: true, isIdentity: true,
      });
    }
  };
}
if (typeof globalThis.ImageData === "undefined") {
  (globalThis as Record<string, unknown>).ImageData = class ImageData {
    data: Uint8ClampedArray;
    width: number;
    height: number;
    constructor(w: number, h: number) {
      this.width = w;
      this.height = h;
      this.data = new Uint8ClampedArray(w * h * 4);
    }
  };
}
if (typeof globalThis.Path2D === "undefined") {
  (globalThis as Record<string, unknown>).Path2D = class Path2D {};
}

import { ingestHousePTR } from "@/lib/ingestion/house-ptr/ingest";

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
