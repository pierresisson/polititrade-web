#!/usr/bin/env bun
/**
 * Reconcile trades → politicians.
 * Creates missing politician entries and links unlinked trades.
 *
 * Usage:
 *   bun --env-file=.env.local run scripts/reconcile-politicians.ts
 */

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars");
}
const supabase = createClient(url, key);

async function main() {
  console.log("=== Reconcile Politicians ===\n");

  const { data: unlinked } = await supabase
    .from("trades")
    .select("person_name, office")
    .is("politician_id", null)
    .limit(1000);

  if (!unlinked || unlinked.length === 0) {
    console.log("All trades already linked. Nothing to do.");
    return;
  }

  // Deduplicate by person_name
  const seen = new Set<string>();
  const unique: { name: string; office: string }[] = [];
  for (const row of unlinked) {
    if (!row.person_name || seen.has(row.person_name)) continue;
    seen.add(row.person_name);
    unique.push({ name: row.person_name, office: row.office || "" });
  }

  console.log(`${unique.length} unlinked politician names found\n`);

  let linked = 0;
  let errors = 0;

  for (const { name, office } of unique) {
    const stateMatch = office.match(/^([A-Z]{2})(\d+)?$/);
    const state = stateMatch ? stateMatch[1] : null;
    const district = stateMatch ? stateMatch[2] || null : null;

    const { data: politician, error: polError } = await supabase
      .from("politicians")
      .upsert(
        { name, chamber: "House", state, district },
        { onConflict: "name,chamber" }
      )
      .select("id")
      .single();

    if (polError) {
      console.error(`  ✗ ${name}: ${polError.message}`);
      errors++;
      continue;
    }

    const { data: linkedTrades, error: linkError } = await supabase
      .from("trades")
      .update({ politician_id: politician.id })
      .eq("person_name", name)
      .is("politician_id", null)
      .select("id");

    if (linkError) {
      console.error(`  ✗ ${name}: link failed — ${linkError.message}`);
      errors++;
    } else {
      console.log(`  ✓ ${name} (${office}) → ${linkedTrades?.length ?? 0} trades linked`);
      linked++;
    }
  }

  console.log(`\n=== Done ===`);
  console.log(`  Politicians created/updated: ${linked}`);
  console.log(`  Errors: ${errors}`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
