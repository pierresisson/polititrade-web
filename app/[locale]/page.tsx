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

export default async function LandingPage() {
  return (
    <MotionProvider>
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <Hero />
          <LiveFeed />
          <TopPoliticians />
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
