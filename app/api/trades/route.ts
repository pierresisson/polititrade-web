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

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const source = searchParams.get("source") || "HOUSE_PTR";
  const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 200);
  const offset = parseInt(searchParams.get("offset") || "0", 10);
  const ticker = searchParams.get("ticker");
  const person = searchParams.get("person");

  const supabase = getSupabaseAdmin();

  let query = supabase
    .from("trades")
    .select("*", { count: "exact" })
    .eq("source", source)
    .order("trade_date", { ascending: false, nullsFirst: false })
    .range(offset, offset + limit - 1);

  if (ticker) {
    query = query.ilike("ticker", ticker.toUpperCase());
  }

  if (person) {
    query = query.ilike("person_name", `%${person}%`);
  }

  const { data: trades, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    trades: trades ?? [],
    total: count ?? 0,
    source,
  });
}
