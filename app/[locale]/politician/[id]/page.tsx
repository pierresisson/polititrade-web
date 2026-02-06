import { notFound } from "next/navigation";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { PoliticianBackLink } from "@/components/politicians/politician-back-link";
import { PoliticianProfile } from "@/components/politicians/politician-profile";
import { PoliticianTransactions } from "@/components/politicians/politician-transactions";
import { PoliticianStats } from "@/components/politicians/politician-stats";
import { PoliticianPerformanceSection } from "@/components/performance/politician-performance-section";
import { getPoliticianById, getPoliticianTrades, getTradePerformances, getPoliticianPerformance } from "@/lib/supabase/queries";
import { getUserAccessLevel } from "@/lib/auth";
import { filterPerformanceForAccess, filterStatsForAccess } from "@/lib/prices/access-control";
import type { TradePerformanceMap } from "@/lib/supabase/types";

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
    description: `Track stock trades from ${politician.name} (${politician.party ?? ""}${politician.state ? `-${politician.state}` : ""}). View trading history, portfolio, and performance.`,
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
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Back link */}
        <div className="mx-auto max-w-6xl px-6 pt-8">
          <PoliticianBackLink />
        </div>

        {/* Profile header */}
        <PoliticianProfile politician={politician} />

        <div className="editorial-rule-thin mx-auto max-w-6xl" />

        {/* Stats cards */}
        <PoliticianStats politician={politician} />

        <div className="editorial-rule-thin mx-auto max-w-6xl" />

        {/* Performance section */}
        {politicianStats.total_evaluated > 0 && (
          <>
            <PoliticianPerformanceSection
              stats={politicianStats}
              accessLevel={level}
            />
            <div className="editorial-rule-thin mx-auto max-w-6xl" />
          </>
        )}

        {/* Transactions */}
        <PoliticianTransactions
          trades={trades}
          currentPage={currentPage}
          totalPages={totalPages}
          total={total}
          performanceMap={performanceMap}
          accessLevel={level}
        />
      </main>
      <Footer />
    </div>
  );
}
