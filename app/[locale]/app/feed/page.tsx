import { FeedContent } from "@/components/app/feed-content";
import { getRecentTrades } from "@/lib/supabase/queries";

export const metadata = {
  title: "Live Feed | PolitiTrades",
  description: "Real-time feed of congressional stock trades.",
};

export default async function FeedPage() {
  const trades = await getRecentTrades(50);

  return <FeedContent trades={trades} />;
}
