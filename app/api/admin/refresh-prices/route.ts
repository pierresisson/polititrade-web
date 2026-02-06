import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { refreshPricesForAllTickers } from "@/lib/prices/fetch-service";
import { createClient } from "@supabase/supabase-js";
import { computeAllTradePerformances } from "@/lib/prices/performance";

export async function POST() {
  const result = await requireAdmin();
  if ("error" in result) return result.error;

  try {
    const priceStats = await refreshPricesForAllTickers();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const perfStats = await computeAllTradePerformances(supabase);

    return NextResponse.json({
      prices: priceStats,
      performance: perfStats,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
