import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { PoliticiansPageHeader } from "@/components/politicians/politicians-page-header";
import { PoliticiansList } from "@/components/politicians/politicians-list";

export const metadata = {
  title: "Politicians | PolitiTrades",
  description: "Track stock trades from all members of Congress. Filter by party, chamber, and trading activity.",
};

export default function PoliticiansPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <PoliticiansPageHeader />
        <div className="editorial-rule-thin mx-auto max-w-6xl" />
        <PoliticiansList />
      </main>
      <Footer />
    </div>
  );
}
