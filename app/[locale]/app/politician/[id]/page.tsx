import { notFound } from "next/navigation";
import { getPoliticianById, getPoliticianTrades } from "@/lib/supabase/queries";
import { AppPoliticianDetail } from "@/components/app/politician-detail";

type Props = {
  params: Promise<{ id: string; locale: string }>;
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

export default async function PoliticianPage({ params }: Props) {
  const { id } = await params;
  const [politician, trades] = await Promise.all([
    getPoliticianById(id),
    getPoliticianTrades(id),
  ]);

  if (!politician) {
    notFound();
  }

  return <AppPoliticianDetail politician={politician} trades={trades} />;
}
