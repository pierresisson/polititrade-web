import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { LiveFeed } from "@/components/landing/live-feed";
import { TopPoliticians } from "@/components/landing/top-politicians";
import { ValueProps } from "@/components/landing/value-props";
import { Pricing } from "@/components/landing/pricing";
import { TrustSection } from "@/components/landing/trust-section";
import { FAQ } from "@/components/landing/faq";
import { Footer } from "@/components/landing/footer";
import { MotionProvider } from "@/components/landing/motion";
import { getTopPoliticians, getRecentTrades, getTrendingStocks } from "@/lib/supabase/queries";

export default async function LandingPage() {
  const [politicians, trades, trendingStocks] = await Promise.all([
    getTopPoliticians(12),
    getRecentTrades(20),
    getTrendingStocks(5),
  ]);

  return (
    <MotionProvider>
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <Hero politicians={politicians} trendingStocks={trendingStocks} />
          <LiveFeed trades={trades} />
          <TopPoliticians politicians={politicians} />
          <ValueProps />
          <Pricing />
          <TrustSection />
          <FAQ />
        </main>
        <Footer />
      </div>
    </MotionProvider>
  );
}
