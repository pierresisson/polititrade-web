import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(url, key);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;
  const { searchParams } = request.nextUrl;

  const from = searchParams.get("from") || "2020-01-01";
  const to = searchParams.get("to") || new Date().toISOString().split("T")[0];

  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("stock_prices")
    .select("price_date, close, open, high, low, volume")
    .eq("ticker", ticker.toUpperCase())
    .gte("price_date", from)
    .lte("price_date", to)
    .order("price_date", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ticker: ticker.toUpperCase(), prices: data ?? [] });
}
