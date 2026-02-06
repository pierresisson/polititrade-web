import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { ingestHousePTR } from "@/lib/ingestion/house-ptr/ingest";

export async function POST() {
  const result = await requireAdmin();
  if ("error" in result) return result.error;

  try {
    const stats = await ingestHousePTR({
      maxPages: 2,
      lookbackDays: 7,
      throttleMs: 1000,
    });

    return NextResponse.json({ ok: true, stats });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Ingestion failed" },
      { status: 500 }
    );
  }
}
