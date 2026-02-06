import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/auth/admin";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET() {
  const result = await requireAdmin();
  if ("error" in result) return result.error;

  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("source_documents")
    .select("source, status, ingested_at");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Aggregate by source
  const bySource: Record<
    string,
    { total: number; parsed: number; errors: number; lastRun: string | null }
  > = {};

  for (const doc of data ?? []) {
    const src = doc.source ?? "UNKNOWN";
    if (!bySource[src]) {
      bySource[src] = { total: 0, parsed: 0, errors: 0, lastRun: null };
    }
    bySource[src].total++;
    if (doc.status === "parsed") bySource[src].parsed++;
    if (doc.status === "error") bySource[src].errors++;
    if (
      doc.ingested_at &&
      (!bySource[src].lastRun || doc.ingested_at > bySource[src].lastRun!)
    ) {
      bySource[src].lastRun = doc.ingested_at;
    }
  }

  return NextResponse.json({ sources: bySource });
}
