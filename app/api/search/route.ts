import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import type { SearchResult } from "@/lib/command-items";

const LIMIT_PER_TYPE = 8;

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(url, key);
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const supabase = getSupabaseAdmin();
  const pattern = `%${q}%`;

  const [politiciansRes, tradesRes] = await Promise.all([
    supabase
      .from("politicians")
      .select("id, name, party, chamber, state")
      .ilike("name", pattern)
      .limit(LIMIT_PER_TYPE),
    supabase
      .from("trades")
      .select("id, person_name, asset_name, ticker, trade_type")
      .or(`person_name.ilike.${pattern},asset_name.ilike.${pattern},ticker.ilike.${pattern}`)
      .order("trade_date", { ascending: false, nullsFirst: false })
      .limit(LIMIT_PER_TYPE),
  ]);

  if (politiciansRes.error || tradesRes.error) {
    console.error("[search] Supabase errors:", {
      politicians: politiciansRes.error,
      trades: tradesRes.error,
    });
    return NextResponse.json(
      { results: [], error: "Search query failed" },
      { status: 500 }
    );
  }

  const results: SearchResult[] = [];

  if (politiciansRes.data) {
    for (const p of politiciansRes.data) {
      results.push({
        type: "person",
        id: p.id,
        title: p.name,
        subtitle: [p.party, p.chamber, p.state].filter(Boolean).join(" · "),
        href: `/app/politician/${p.id}`,
      });
    }
  }

  if (tradesRes.data) {
    // Deduplicate persons from trades (when politicians table is empty)
    const seenPersons = new Set<string>();
    if (!politiciansRes.data?.length) {
      for (const t of tradesRes.data) {
        if (t.person_name && !seenPersons.has(t.person_name)) {
          seenPersons.add(t.person_name);
          results.push({
            type: "person",
            id: `person-${t.person_name}`,
            title: t.person_name,
            subtitle: undefined,
            href: `/app/politicians`,
          });
        }
      }
    }

    // Deduplicate assets by ticker
    const seenTickers = new Set<string>();
    for (const t of tradesRes.data) {
      if (t.ticker && !seenTickers.has(t.ticker)) {
        seenTickers.add(t.ticker);
        results.push({
          type: "asset",
          id: `asset-${t.ticker}`,
          title: t.ticker,
          subtitle: t.asset_name,
          href: `/app/feed?ticker=${encodeURIComponent(t.ticker)}`,
        });
      }
    }

    for (const t of tradesRes.data) {
      results.push({
        type: "trade",
        id: t.id,
        title: `${t.person_name} — ${t.ticker || t.asset_name}`,
        subtitle: t.trade_type,
        href: `/app/feed`,
      });
    }
  }

  return NextResponse.json({ results });
}
