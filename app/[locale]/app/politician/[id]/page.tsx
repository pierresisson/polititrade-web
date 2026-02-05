import { notFound } from "next/navigation";
import { politicians } from "@/lib/mock-data";
import { AppPoliticianDetail } from "@/components/app/politician-detail";

type Props = {
  params: Promise<{ id: string; locale: string }>;
};

export async function generateStaticParams() {
  return politicians.flatMap((p) => [
    { locale: "en", id: p.id },
    { locale: "fr", id: p.id },
  ]);
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const politician = politicians.find((p) => p.id === id);

  if (!politician) {
    return { title: "Politician Not Found | PolitiTrades" };
  }

  return {
    title: `${politician.name} | PolitiTrades`,
    description: `Track stock trades from ${politician.name} (${politician.party}-${politician.state}).`,
  };
}

export default async function PoliticianPage({ params }: Props) {
  const { id } = await params;
  const politician = politicians.find((p) => p.id === id);

  if (!politician) {
    notFound();
  }

  return <AppPoliticianDetail politician={politician} />;
}
