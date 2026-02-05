import { Bell, BarChart3, Shield, Clock, Users, FileText } from "lucide-react";

const features = [
  {
    icon: Clock,
    title: "Real-time tracking",
    description: "Trades appear within minutes of official filing. Set alerts for specific politicians or stocks.",
  },
  {
    icon: FileText,
    title: "Official sources only",
    description: "Data pulled directly from House, Senate, and SEC disclosure filings. Verified and accurate.",
  },
  {
    icon: BarChart3,
    title: "Performance analytics",
    description: "Track returns over time. Compare politician portfolios against market benchmarks.",
  },
  {
    icon: Users,
    title: "Follow politicians",
    description: "Build watchlists. Get notified when your tracked members disclose new trades.",
  },
  {
    icon: Bell,
    title: "Custom alerts",
    description: "Email, SMS, or push notifications. Filter by stock, sector, trade size, or party.",
  },
  {
    icon: Shield,
    title: "Historical data",
    description: "Full archive back to 2012. Analyze patterns and trends over time.",
  },
];

export function ValueProps() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 lg:py-24">
      {/* Section header */}
      <div className="mb-12 max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">
          Why PolitiTrades
        </p>
        <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">
          The edge you&apos;ve been missing
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Congress members consistently outperform the market. Now you can see exactly what they&apos;re trading—and when.
        </p>
      </div>

      {/* Features grid - minimal, text-focused */}
      <div className="grid gap-x-12 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, i) => (
          <div key={i} className="group">
            <feature.icon className="h-5 w-5 text-primary" />
            <h3 className="mt-3 font-display text-lg font-semibold">
              {feature.title}
            </h3>
            <p className="mt-2 text-muted-foreground">
              {feature.description}
            </p>
          </div>
        ))}
      </div>

      {/* Pull quote */}
      <blockquote className="pull-quote mt-16 max-w-3xl text-xl text-muted-foreground md:text-2xl">
        &ldquo;Members of Congress have access to non-public information that could affect stock prices.
        Their trades are a signal—we help you see it.&rdquo;
      </blockquote>
    </section>
  );
}
