import { DashboardContent } from "@/components/app/dashboard-content";
import { getTopPoliticians, getRecentTrades, getTrendingStocks, getWeeklyStats } from "@/lib/supabase/queries";

export const metadata = {
  title: "Dashboard | PolitiTrades",
  description: "Your PolitiTrades dashboard - track congressional stock trades in real-time.",
};

export default async function DashboardPage() {
  const [politicians, trades, trendingStocks, stats] = await Promise.all([
    getTopPoliticians(12),
    getRecentTrades(20),
    getTrendingStocks(5),
    getWeeklyStats(),
  ]);

  return (
    <DashboardContent
      trades={trades}
      politicians={politicians}
      trendingStocks={trendingStocks}
      stats={stats}
    />
  );
}
