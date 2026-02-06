import { FeedContent } from "@/components/app/feed-content";
import { getRecentTrades } from "@/lib/supabase/queries";

export const metadata = {
  title: "Live Feed | PolitiTrades",
  description: "Real-time feed of congressional stock trades.",
};

type Props = {
  searchParams: Promise<{ page?: string }>;
};

export default async function FeedPage({ searchParams }: Props) {
  const { page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page ?? "1", 10) || 1);
  const perPage = 25;
  const offset = (currentPage - 1) * perPage;
  const { trades, total } = await getRecentTrades(perPage, offset);
  const totalPages = Math.ceil(total / perPage);

  return (
    <FeedContent
      trades={trades}
      currentPage={currentPage}
      totalPages={totalPages}
      total={total}
    />
  );
}
