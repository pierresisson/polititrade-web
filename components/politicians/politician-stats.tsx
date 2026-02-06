"use client";

import { DollarSign, BarChart3, Briefcase } from "lucide-react";
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
  AreaChart,
} from "recharts";
import { useTranslations } from "@/lib/i18n-context";
import { formatVolume } from "@/lib/helpers";
import {
  ChartContainer,
  ChartTooltipContent,
  ChartLegendContent,
  useChart,
  type ChartConfig,
} from "@/components/ui/chart";
import type { PoliticianWithStats } from "@/lib/supabase/types";

type Props = {
  politician: PoliticianWithStats;
};

// Mock performance data (12 months) — no stock price data available yet
const performanceData = [
  { month: "Jan", politician: 0, sp500: 0 },
  { month: "Feb", politician: 8, sp500: 4 },
  { month: "Mar", politician: 18, sp500: 8 },
  { month: "Apr", politician: 28, sp500: 12 },
  { month: "May", politician: 35, sp500: 16 },
  { month: "Jun", politician: 40, sp500: 18 },
  { month: "Jul", politician: 48, sp500: 22 },
  { month: "Aug", politician: 55, sp500: 26 },
  { month: "Sep", politician: 50, sp500: 24 },
  { month: "Oct", politician: 58, sp500: 28 },
  { month: "Nov", politician: 62, sp500: 30 },
  { month: "Dec", politician: 67, sp500: 32 },
];

const chartConfig: ChartConfig = {
  politician: { label: "Politician", color: "var(--chart-1)" },
  sp500: { label: "S&P 500", color: "var(--chart-text)" },
};

function PerformanceChart() {
  const { reducedMotion } = useChart();

  return (
    <AreaChart
      data={performanceData}
      margin={{ top: 8, right: 8, bottom: 0, left: -16 }}
    >
      <defs>
        <linearGradient id="politicianFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-politician)" stopOpacity={0.08} />
          <stop offset="100%" stopColor="var(--color-politician)" stopOpacity={0} />
        </linearGradient>
      </defs>
      <CartesianGrid
        strokeDasharray="4 4"
        stroke="var(--chart-grid)"
        vertical={false}
      />
      <XAxis
        dataKey="month"
        axisLine={false}
        tickLine={false}
        tickMargin={8}
        tick={{ fontSize: 12 }}
      />
      <YAxis
        axisLine={false}
        tickLine={false}
        tickMargin={4}
        tick={{ fontSize: 12 }}
        tickFormatter={(v: number) => `${v > 0 ? "+" : ""}${v}%`}
      />
      <Tooltip
        content={
          <ChartTooltipContent
            valueFormatter={(v) => `+${v}%`}
          />
        }
      />
      <Area
        type="monotone"
        dataKey="politician"
        stroke="var(--color-politician)"
        strokeWidth={2.5}
        fill="url(#politicianFill)"
        isAnimationActive={!reducedMotion}
        animationDuration={600}
      />
      <Line
        type="monotone"
        dataKey="sp500"
        stroke="var(--color-sp500)"
        strokeWidth={2}
        strokeOpacity={0.4}
        dot={false}
        isAnimationActive={!reducedMotion}
        animationDuration={600}
      />
    </AreaChart>
  );
}

export function PoliticianStats({ politician }: Props) {
  const { t } = useTranslations();

  const stats = [
    {
      label: t("politicianDetail.totalTrades"),
      value: politician.trade_count.toString(),
      subtext: t("politicianDetail.last12Months"),
      icon: BarChart3,
    },
    {
      label: t("politicianDetail.tradingVolume"),
      value: formatVolume(politician.volume),
      subtext: t("politicianDetail.disclosedAmount"),
      icon: DollarSign,
    },
    {
      label: t("politicians.topHolding"),
      value: politician.top_ticker ?? "—",
      subtext: t("politicianDetail.mostTradedStock"),
      icon: Briefcase,
      mono: true,
    },
  ];

  return (
    <section className="mx-auto max-w-6xl px-6 py-8 lg:py-12">
      <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {t("politicianDetail.tradingOverview")}
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
              className={`mt-2 text-3xl font-semibold ${stat.mono ? "font-mono" : "font-display"}`}
            >
              {stat.value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{stat.subtext}</p>
          </div>
        ))}
      </div>

      {/* Performance chart */}
      <div className="mt-8 border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {t("politicianDetail.performanceVsSP")}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("politicianDetail.trailing12Months")}
            </p>
          </div>
          <ChartLegendContent
            config={chartConfig}
            payload={[
              { value: "politician", color: "var(--chart-1)", dataKey: "politician" },
              { value: "sp500", color: "var(--chart-text)", dataKey: "sp500" },
            ]}
          />
        </div>

        <ChartContainer config={chartConfig} className="h-48 w-full">
          <PerformanceChart />
        </ChartContainer>
      </div>
    </section>
  );
}
