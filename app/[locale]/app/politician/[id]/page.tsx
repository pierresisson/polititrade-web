import { notFound } from "next/navigation";
import { getPoliticianById, getPoliticianTrades, getTradePerformances, getPoliticianPerformance } from "@/lib/supabase/queries";
import { getUserAccessLevel } from "@/lib/auth";
import { filterPerformanceForAccess, filterStatsForAccess } from "@/lib/prices/access-control";
import type { TradePerformanceMap } from "@/lib/supabase/types";
import { AppPoliticianDetail } from "@/components/app/politician-detail";

type Props = {
  params: Promise<{ id: string; locale: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const politician = await getPoliticianById(id);

  if (!politician) {
    return { title: "Politician Not Found | PolitiTrades" };
  }

  return {
    title: `${politician.name} | PolitiTrades`,
    description: `Track stock trades from ${politician.name} (${politician.party ?? ""}${politician.state ? `-${politician.state}` : ""}).`,
  };
}

export default async function PoliticianPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page ?? "1", 10) || 1);
  const perPage = 20;
  const offset = (currentPage - 1) * perPage;

  const [politician, { trades, total }, { level }] = await Promise.all([
    getPoliticianById(id),
    getPoliticianTrades(id, perPage, offset),
    getUserAccessLevel(),
  ]);

  if (!politician) {
    notFound();
  }

  // Fetch performance data in parallel
  const tradeIds = trades.map((t) => t.id);
  const [rawPerfMap, rawPoliticianStats] = await Promise.all([
    getTradePerformances(tradeIds),
    getPoliticianPerformance(id),
  ]);

  // Apply access control — plain object for RSC serialization
  const performanceMap: TradePerformanceMap = {};
  for (const [tradeId, perf] of rawPerfMap.entries()) {
    performanceMap[tradeId] = filterPerformanceForAccess(perf, level);
  }
  const politicianStats = filterStatsForAccess(rawPoliticianStats, level);

  const totalPages = Math.ceil(total / perPage);

  return (
    <AppPoliticianDetail
      politician={politician}
      trades={trades}
      currentPage={currentPage}
      totalPages={totalPages}
      total={total}
      performanceMap={performanceMap}
      politicianStats={politicianStats}
      accessLevel={level}
    />
  );
}
