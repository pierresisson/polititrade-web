import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { getUserAccessLevel } from "@/lib/auth";
import { filterPerformanceForAccess } from "@/lib/prices/access-control";
import type { TradePerformanceData } from "@/lib/supabase/types";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(url, key);
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ tradeId: string }> }
) {
  const { tradeId } = await params;
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("trade_performance")
    .select("*")
    .eq("trade_id", tradeId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { level } = await getUserAccessLevel();
  const filtered = filterPerformanceForAccess(data as TradePerformanceData, level);

  return NextResponse.json(filtered);
}
