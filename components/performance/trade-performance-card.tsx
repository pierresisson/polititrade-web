"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Calendar, Lock } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { ChartContainer, ChartTooltipContent, useChart } from "@/components/ui/chart";
import { useTranslations } from "@/lib/i18n-context";
import { formatReturn, getReturnColor, formatPrice, formatDate } from "@/lib/helpers";
import { canViewChart, canViewSP500 } from "@/lib/prices/access-control";
import type { TradePerformanceData, PricePoint, AccessLevel, Timeframe } from "@/lib/supabase/types";
import { PerformanceDisclaimer } from "./performance-disclaimer";

type Props = {
  ticker: string;
  performance: TradePerformanceData;
  priceHistory?: PricePoint[];
  accessLevel: AccessLevel;
  selectedTimeframe: Timeframe;
};

const TIMEFRAME_RETURN_KEY: Record<Timeframe, keyof TradePerformanceData> = {
  "1d": "return_1d",
  "1w": "return_1w",
  "1m": "return_1m",
  "3m": "return_3m",
  "6m": "return_6m",
  "1y": "return_1y",
  to_date: "return_to_date",
};

const chartConfig = {
  close: {
    label: "Price",
    color: "var(--chart-1)",
  },
};

function MiniChart({ data }: { data: PricePoint[] }) {
  const { reducedMotion } = useChart();

  if (data.length < 2) return null;

  return (
    <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
      <defs>
        <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.2} />
          <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
        </linearGradient>
      </defs>
      <XAxis dataKey="date" hide />
      <YAxis hide domain={["auto", "auto"]} />
      <Tooltip
        content={
          <ChartTooltipContent
            labelFormatter={(label) => formatDate(label)}
            valueFormatter={(val) => formatPrice(Number(val))}
          />
        }
      />
      <Area
        type="monotone"
        dataKey="close"
        stroke="var(--chart-1)"
        strokeWidth={1.5}
        fill="url(#priceGradient)"
        isAnimationActive={!reducedMotion}
      />
    </AreaChart>
  );
}

export function TradePerformanceCard({
  ticker,
  performance,
  priceHistory,
  accessLevel,
  selectedTimeframe,
}: Props) {
  const { t } = useTranslations();
  const [expanded, setExpanded] = useState(false);

  const returnKey = TIMEFRAME_RETURN_KEY[selectedTimeframe];
  const returnValue = performance[returnKey] as number | null;
  const showChart = canViewChart(accessLevel);
  const showSP500 = canViewSP500(accessLevel);

  return (
    <div className="border border-border bg-card">
      {/* Header — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-secondary/30"
      >
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm font-semibold">{ticker}</span>
          {performance.is_estimated_date && (
            <span className="flex items-center gap-1 rounded bg-amber-light px-1.5 py-0.5 text-xs text-amber">
              <Calendar className="h-3 w-3" />
              {t("performance.estimatedDate")}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className={`font-mono text-sm font-medium ${getReturnColor(returnValue)}`}>
            {formatReturn(returnValue)}
          </span>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-border px-4 py-4">
          {/* Price info */}
          <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">{t("performance.refPrice")}</p>
              <p className="font-mono font-medium">{formatPrice(performance.reference_price)}</p>
              <p className="text-xs text-muted-foreground">
                {formatDate(performance.reference_date)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t("performance.currentPrice")}</p>
              <p className="font-mono font-medium">{formatPrice(performance.current_price)}</p>
            </div>
          </div>

          {/* S&P 500 benchmark (premium only) */}
          {showSP500 && performance.sp500_return_1m != null && (
            <div className="mb-4 rounded bg-secondary/50 px-3 py-2 text-sm">
              <span className="text-muted-foreground">{t("performance.sp500Comparison")}: </span>
              <span className={`font-mono font-medium ${getReturnColor(performance.sp500_return_1m)}`}>
                {formatReturn(performance.sp500_return_1m)}
              </span>
            </div>
          )}

          {!showSP500 && (
            <div className="mb-4 flex items-center gap-2 rounded bg-secondary/50 px-3 py-2 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" />
              {t("performance.upgradeForSP500")}
            </div>
          )}

          {/* Mini chart */}
          {showChart && priceHistory && priceHistory.length > 1 && (
            <ChartContainer config={chartConfig} className="mb-4 h-32" minHeight={128}>
              <MiniChart data={priceHistory} />
            </ChartContainer>
          )}

          {!showChart && (
            <div className="mb-4 flex items-center justify-center gap-2 rounded border border-dashed border-border py-8 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" />
              {t("performance.upgradeForChart")}
            </div>
          )}

          <PerformanceDisclaimer
            showEstimatedWarning={performance.is_estimated_date}
            className="mt-3"
          />
        </div>
      )}
    </div>
  );
}
