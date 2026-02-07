import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserAccessLevel } from "@/lib/auth";

const ACCOUNT_LIMIT = 10;

export async function GET() {
  const { level, user } = await getUserAccessLevel();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();

  const { data: items, error } = await supabase
    .from("watchlist_items")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const personIds = items
    .filter((i) => i.entity_type === "person")
    .map((i) => i.entity_id);

  const assetIds = items
    .filter((i) => i.entity_type === "asset")
    .map((i) => i.entity_id);

  // Enrich politicians
  let politicians: Record<string, { name: string; party: string | null; chamber: string | null; state: string | null }> = {};
  if (personIds.length > 0) {
    const { data } = await supabase
      .from("politicians")
      .select("id, name, party, chamber, state")
      .in("id", personIds);

    if (data) {
      for (const p of data) {
        politicians[p.id] = { name: p.name, party: p.party, chamber: p.chamber, state: p.state };
      }
    }
  }

  // Enrich assets — get latest trade info per ticker
  let assets: Record<string, { asset_name: string | null; trade_count: number }> = {};
  if (assetIds.length > 0) {
    const { data } = await supabase
      .from("trades")
      .select("ticker, asset_name")
      .in("ticker", assetIds);

    if (data) {
      for (const t of data) {
        if (!t.ticker) continue;
        const existing = assets[t.ticker];
        if (existing) {
          existing.trade_count++;
        } else {
          assets[t.ticker] = { asset_name: t.asset_name, trade_count: 1 };
        }
      }
    }
  }

  const enrichedItems = items.map((item) => ({
    ...item,
    enriched:
      item.entity_type === "person"
        ? politicians[item.entity_id] ?? null
        : assets[item.entity_id] ?? null,
  }));

  const counts = {
    person: items.filter((i) => i.entity_type === "person").length,
    asset: items.filter((i) => i.entity_type === "asset").length,
  };

  return NextResponse.json({
    items: enrichedItems,
    counts,
    limit: level === "premium" ? null : ACCOUNT_LIMIT,
  });
}

export async function POST(request: NextRequest) {
  const { level, user } = await getUserAccessLevel();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { entity_type, entity_id } = body;

  if (!entity_type || !entity_id) {
    return NextResponse.json(
      { error: "entity_type and entity_id are required" },
      { status: 400 }
    );
  }

  if (!["person", "asset"].includes(entity_type)) {
    return NextResponse.json(
      { error: "entity_type must be 'person' or 'asset'" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  // Check limit for non-premium users
  if (level === "account") {
    const { count, error: countError } = await supabase
      .from("watchlist_items")
      .select("*", { count: "exact", head: true });

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 500 });
    }

    if ((count ?? 0) >= ACCOUNT_LIMIT) {
      return NextResponse.json(
        { error: "limit_reached", limit: ACCOUNT_LIMIT },
        { status: 403 }
      );
    }
  }

  const { data: item, error } = await supabase
    .from("watchlist_items")
    .insert({
      user_id: user.id,
      entity_type,
      entity_id,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Already in watchlist" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ item });
}
