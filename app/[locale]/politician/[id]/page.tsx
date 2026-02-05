import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { PoliticianProfile } from "@/components/politicians/politician-profile";
import { PoliticianTransactions } from "@/components/politicians/politician-transactions";
import { PoliticianStats } from "@/components/politicians/politician-stats";
import { politicians } from "@/lib/mock-data";

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
    description: `Track stock trades from ${politician.name} (${politician.party}-${politician.state}). View trading history, portfolio, and performance.`,
  };
}

export default async function PoliticianPage({ params }: Props) {
  const { id } = await params;
  const politician = politicians.find((p) => p.id === id);

  if (!politician) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Back link */}
        <div className="mx-auto max-w-6xl px-6 pt-8">
          <Link
            href="/politicians"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            All Politicians
          </Link>
        </div>

        {/* Profile header */}
        <PoliticianProfile politician={politician} />

        <div className="editorial-rule-thin mx-auto max-w-6xl" />

        {/* Stats cards */}
        <PoliticianStats politician={politician} />

        <div className="editorial-rule-thin mx-auto max-w-6xl" />

        {/* Transactions */}
        <PoliticianTransactions politicianId={politician.id} />
      </main>
      <Footer />
    </div>
  );
}
