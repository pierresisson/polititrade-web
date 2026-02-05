import { TrendingUp, DollarSign, BarChart3, Briefcase } from "lucide-react";
import type { Politician } from "@/lib/mock-data";

type Props = {
  politician: Politician;
};

export function PoliticianStats({ politician }: Props) {
  const stats = [
    {
      label: "Total Trades",
      value: politician.trades.toString(),
      subtext: "Last 12 months",
      icon: BarChart3,
    },
    {
      label: "Trading Volume",
      value: politician.volume,
      subtext: "Disclosed amount",
      icon: DollarSign,
    },
    {
      label: "Return YTD",
      value: politician.returnYTD,
      subtext: "Based on disclosed trades",
      icon: TrendingUp,
      highlight: true,
    },
    {
      label: "Top Holding",
      value: politician.topHolding,
      subtext: "Most traded stock",
      icon: Briefcase,
      mono: true,
    },
  ];

  return (
    <section className="mx-auto max-w-6xl px-6 py-8 lg:py-12">
      <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Trading Overview
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="border border-border bg-card p-5"
          >
            <div className="flex items-start justify-between">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p
              className={`mt-2 text-3xl font-semibold ${
                stat.highlight ? "text-success" : ""
              } ${stat.mono ? "font-mono" : "font-display"}`}
            >
              {stat.value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{stat.subtext}</p>
          </div>
        ))}
      </div>

      {/* Performance chart placeholder */}
      <div className="mt-8 border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Performance vs S&P 500
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Trailing 12 months
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              {politician.name}
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-muted-foreground" />
              S&P 500
            </span>
          </div>
        </div>

        {/* Simple chart visualization */}
        <div className="relative h-48">
          <svg viewBox="0 0 400 150" className="h-full w-full">
            {/* Grid lines */}
            <line x1="0" y1="37.5" x2="400" y2="37.5" stroke="currentColor" strokeOpacity="0.1" />
            <line x1="0" y1="75" x2="400" y2="75" stroke="currentColor" strokeOpacity="0.1" />
            <line x1="0" y1="112.5" x2="400" y2="112.5" stroke="currentColor" strokeOpacity="0.1" />

            {/* S&P 500 line (benchmark) */}
            <polyline
              points="0,100 50,95 100,90 150,85 200,80 250,78 300,72 350,68 400,65"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeOpacity="0.3"
              className="text-muted-foreground"
            />

            {/* Politician performance line */}
            <polyline
              points="0,110 50,100 100,85 150,70 200,60 250,55 300,40 350,35 400,25"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="text-primary"
            />

            {/* Area under politician line */}
            <polygon
              points="0,110 50,100 100,85 150,70 200,60 250,55 300,40 350,35 400,25 400,150 0,150"
              fill="currentColor"
              fillOpacity="0.05"
              className="text-primary"
            />
          </svg>

          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 flex h-full flex-col justify-between text-xs text-muted-foreground">
            <span>+80%</span>
            <span>+40%</span>
            <span>0%</span>
            <span>-20%</span>
          </div>
        </div>

        {/* X-axis labels */}
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>Jan</span>
          <span>Apr</span>
          <span>Jul</span>
          <span>Oct</span>
          <span>Dec</span>
        </div>
      </div>
    </section>
  );
}
