import { NextRequest, NextResponse } from "next/server";
import { getUserAccessLevel } from "@/lib/auth";
import { getPoliticianPerformance } from "@/lib/supabase/queries";
import { filterStatsForAccess } from "@/lib/prices/access-control";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ politicianId: string }> }
) {
  const { politicianId } = await params;
  const { searchParams } = request.nextUrl;

  const tradeType = searchParams.get("type") as "buy" | "sell" | null;

  const stats = await getPoliticianPerformance(
    politicianId,
    tradeType ? { tradeType } : undefined
  );

  const { level } = await getUserAccessLevel();
  const filtered = filterStatsForAccess(stats, level);

  return NextResponse.json(filtered);
}
