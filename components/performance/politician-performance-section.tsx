"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown, Target, BarChart3, Lock } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { ChartContainer, ChartTooltipContent, ChartLegendContent, useChart } from "@/components/ui/chart";
import { useTranslations } from "@/lib/i18n-context";
import { formatReturn, getReturnColor } from "@/lib/helpers";
import { canViewCumulative, canViewSP500 } from "@/lib/prices/access-control";
import type { PoliticianPerformanceStats, AccessLevel } from "@/lib/supabase/types";
import { PerformanceDisclaimer } from "./performance-disclaimer";

type Props = {
  stats: PoliticianPerformanceStats;
  accessLevel: AccessLevel;
  cumulativeData?: Array<{ date: string; return: number; sp500: number }>;
};

const chartConfig = {
  return: {
    label: "Politician",
    color: "var(--chart-1)",
  },
  sp500: {
    label: "S&P 500",
    color: "var(--chart-3)",
  },
};

function CumulativeChart({ data, showSP500 }: { data: Props["cumulativeData"]; showSP500: boolean }) {
  const { reducedMotion } = useChart();

  if (!data || data.length < 2) return null;

  return (
    <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
      <XAxis
        dataKey="date"
        tickFormatter={(d: string) =>
          new Date(d).toLocaleDateString("en-US", { month: "short", year: "2-digit" })
        }
      />
      <YAxis
        tickFormatter={(v: number) => `${v >= 0 ? "+" : ""}${v.toFixed(0)}%`}
      />
      <Tooltip
        content={
          <ChartTooltipContent
            valueFormatter={(v) => formatReturn(Number(v))}
          />
        }
      />
      <Legend content={<ChartLegendContent />} />
      <Line
        type="monotone"
        dataKey="return"
        stroke="var(--chart-1)"
        strokeWidth={2}
        dot={false}
        isAnimationActive={!reducedMotion}
      />
      {showSP500 && (
        <Line
          type="monotone"
          dataKey="sp500"
          stroke="var(--chart-3)"
          strokeWidth={1.5}
          strokeDasharray="4 4"
          dot={false}
          isAnimationActive={!reducedMotion}
        />
      )}
    </LineChart>
  );
}

export function PoliticianPerformanceSection({ stats, accessLevel, cumulativeData }: Props) {
  const { t } = useTranslations();
  const [filter, setFilter] = useState<"all" | "buy" | "sell">("all");

  const showCumulative = canViewCumulative(accessLevel);
  const showSP500 = canViewSP500(accessLevel);

  if (stats.total_evaluated === 0) {
    return null;
  }

  const statCards = [
    {
      label: t("performance.avgReturn") + " (1M)",
      value: formatReturn(stats.avg_return_1m),
      color: getReturnColor(stats.avg_return_1m),
      icon: BarChart3,
      visible: stats.avg_return_1m != null,
    },
    {
      label: t("performance.hitRate") + " (1M)",
      value: stats.hit_rate_1m != null ? `${stats.hit_rate_1m.toFixed(0)}%` : "—",
      color: stats.hit_rate_1m != null && stats.hit_rate_1m >= 50 ? "text-success" : "text-muted-foreground",
      icon: Target,
      subtext: t("performance.hitRateDescription"),
      visible: stats.hit_rate_1m != null,
    },
    {
      label: t("performance.bestTrade"),
      value: stats.best_trade
        ? `${stats.best_trade.ticker} ${formatReturn(stats.best_trade.return_to_date)}`
        : "—",
      color: getReturnColor(stats.best_trade?.return_to_date ?? null),
      icon: TrendingUp,
      visible: stats.best_trade != null,
    },
    {
      label: t("performance.worstTrade"),
      value: stats.worst_trade
        ? `${stats.worst_trade.ticker} ${formatReturn(stats.worst_trade.return_to_date)}`
        : "—",
      color: getReturnColor(stats.worst_trade?.return_to_date ?? null),
      icon: TrendingDown,
      visible: stats.worst_trade != null,
    },
  ].filter((s) => s.visible);

  return (
    <section className="rounded-lg border border-border bg-card p-6">
      {/* Section header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {t("performance.eyebrow")}
          </p>
          <h2 className="mt-1 font-display text-xl font-semibold">
            {t("performance.statsTitle")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("performance.totalEvaluated").replace("{count}", String(stats.total_evaluated))}
          </p>
        </div>

        {/* Buy/Sell filter */}
        <div className="flex items-center gap-1 border border-border">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 text-sm transition-colors ${
              filter === "all" ? "bg-foreground text-background" : "hover:bg-secondary"
            }`}
          >
            {t("performance.filterAll")}
          </button>
          <button
            onClick={() => setFilter("buy")}
            className={`px-3 py-1.5 text-sm transition-colors ${
              filter === "buy" ? "bg-success text-white" : "hover:bg-secondary"
            }`}
          >
            {t("performance.filterBuys")}
          </button>
          <button
            onClick={() => setFilter("sell")}
            className={`px-3 py-1.5 text-sm transition-colors ${
              filter === "sell" ? "bg-destructive text-white" : "hover:bg-secondary"
            }`}
          >
            {t("performance.filterSells")}
          </button>
        </div>
      </div>

      {/* Stats grid */}
      <div className={`mb-6 grid gap-4 sm:grid-cols-2 ${statCards.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-lg border border-border bg-card p-4"
          >
            <div className="flex items-start justify-between">
              <p className="text-xs text-muted-foreground">{card.label}</p>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className={`mt-2 font-mono text-2xl font-semibold ${card.color}`}>
              {card.value}
            </p>
            {card.subtext && (
              <p className="mt-1 text-xs text-muted-foreground">{card.subtext}</p>
            )}
          </div>
        ))}
      </div>

      {/* Alpha vs S&P 500 */}
      {showSP500 && stats.vs_sp500_1y != null && (
        <div className="mb-6 rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">{t("performance.alpha")}</p>
          <p className={`mt-1 font-mono text-xl font-semibold ${getReturnColor(stats.vs_sp500_1y)}`}>
            {formatReturn(stats.vs_sp500_1y)}
          </p>
        </div>
      )}

      {!showSP500 && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
          <Lock className="h-4 w-4" />
          {t("performance.upgradeForAlpha")}
        </div>
      )}

      {/* Cumulative performance chart */}
      {showCumulative && cumulativeData && cumulativeData.length > 1 ? (
        <div className="mb-6 rounded-lg border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-medium">{t("performance.cumulativeChart")}</h3>
          <ChartContainer config={chartConfig} className="h-64" minHeight={256}>
            <CumulativeChart data={cumulativeData} showSP500={showSP500} />
          </ChartContainer>
        </div>
      ) : !showCumulative ? (
        <div className="mb-6 flex items-center justify-center gap-2 rounded-lg border border-dashed border-border py-12 text-sm text-muted-foreground">
          <Lock className="h-4 w-4" />
          {t("performance.upgradeForCumulative")}
        </div>
      ) : null}

      <PerformanceDisclaimer />
    </section>
  );
}
