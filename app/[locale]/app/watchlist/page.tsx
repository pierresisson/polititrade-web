import { WatchlistContent } from "@/components/app/watchlist-content";
import { getUserAccessLevel } from "@/lib/auth";

export const metadata = {
  title: "Watchlist | PolitiTrades",
  description: "Your personalized watchlist of politicians and stocks.",
};

export default async function WatchlistPage() {
  const { level } = await getUserAccessLevel();

  return <WatchlistContent accessLevel={level} />;
}
