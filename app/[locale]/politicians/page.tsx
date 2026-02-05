import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
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
        {/* Page header */}
        <section className="mx-auto max-w-6xl px-6 py-12 lg:py-16">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-primary">
            Congress Members
          </p>
          <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
            Politicians
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Track trading activity from all 535 members of Congress.
            Filter by party, chamber, or sort by trading volume and performance.
          </p>
        </section>

        <div className="editorial-rule-thin mx-auto max-w-6xl" />

        {/* Politicians list with filters */}
        <PoliticiansList />
      </main>
      <Footer />
    </div>
  );
}
