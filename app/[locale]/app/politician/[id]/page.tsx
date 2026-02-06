import { notFound } from "next/navigation";
import { getPoliticianById, getPoliticianTrades } from "@/lib/supabase/queries";
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

  const [politician, { trades, total }] = await Promise.all([
    getPoliticianById(id),
    getPoliticianTrades(id, perPage, offset),
  ]);

  if (!politician) {
    notFound();
  }

  const totalPages = Math.ceil(total / perPage);

  return (
    <AppPoliticianDetail
      politician={politician}
      trades={trades}
      currentPage={currentPage}
      totalPages={totalPages}
      total={total}
    />
  );
}
