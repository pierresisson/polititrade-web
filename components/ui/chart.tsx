"use client";

import * as React from "react";
import { ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────

export type ChartConfig = Record<
  string,
  {
    label: string;
    color: string; // CSS variable reference, e.g. "var(--chart-1)"
    icon?: React.ComponentType<{ className?: string }>;
  }
>;

// ─── Reduced Motion Hook ──────────────────────────────────────────────

function useReducedMotion() {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

// ─── Context ──────────────────────────────────────────────────────────

const ChartContext = React.createContext<{
  config: ChartConfig;
  reducedMotion: boolean;
} | null>(null);

export function useChart() {
  const ctx = React.useContext(ChartContext);
  if (!ctx) throw new Error("useChart must be used within ChartContainer");
  return ctx;
}

// ─── ChartContainer ──────────────────────────────────────────────────

type ChartContainerProps = React.ComponentProps<"div"> & {
  config: ChartConfig;
  aspect?: number;
  minHeight?: number;
};

export function ChartContainer({
  config,
  children,
  className,
  aspect,
  minHeight = 0,
  ...props
}: ChartContainerProps) {
  const reducedMotion = useReducedMotion();

  // Build inline CSS variables from config
  const style = React.useMemo(() => {
    const vars: Record<string, string> = {};
    for (const [key, value] of Object.entries(config)) {
      vars[`--color-${key}`] = value.color;
    }
    return vars;
  }, [config]);

  return (
    <ChartContext.Provider value={{ config, reducedMotion }}>
      <div
        className={cn(
          "flex w-full [&_.recharts-cartesian-axis-tick_text]:fill-[var(--chart-text)] [&_.recharts-cartesian-axis-tick_text]:text-xs [&_.recharts-cartesian-grid_line]:stroke-[var(--chart-grid)] [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-reference-line_line]:stroke-border [&_.recharts-sector]:outline-none",
          className
        )}
        style={style}
        {...props}
      >
        <ResponsiveContainer
          width="100%"
          height="100%"
          {...(aspect ? { aspect } : {})}
          {...(minHeight ? { minHeight } : {})}
        >
          {children as React.ReactElement}
        </ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

// ─── ChartTooltip ────────────────────────────────────────────────────

type ChartTooltipContentProps = {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number | string;
    color: string;
    dataKey: string;
    payload: Record<string, unknown>;
  }>;
  label?: string;
  labelFormatter?: (label: string) => string;
  valueFormatter?: (value: number | string) => string;
  hideLabel?: boolean;
  hideIndicator?: boolean;
  className?: string;
};

export function ChartTooltipContent({
  active,
  payload,
  label,
  labelFormatter,
  valueFormatter,
  hideLabel = false,
  hideIndicator = false,
  className,
}: ChartTooltipContentProps) {
  const { config } = useChart();

  if (!active || !payload?.length) return null;

  return (
    <div
      className={cn(
        "rounded border border-border bg-card px-3 py-2 shadow-md",
        className
      )}
    >
      {!hideLabel && label && (
        <p className="mb-1 text-xs font-medium text-muted-foreground">
          {labelFormatter ? labelFormatter(label) : label}
        </p>
      )}
      <div className="flex flex-col gap-1">
        {payload.map((entry) => {
          const cfg = config[entry.dataKey];
          const displayLabel = cfg?.label ?? entry.name;
          const displayValue = valueFormatter
            ? valueFormatter(entry.value)
            : entry.value;

          return (
            <div
              key={entry.dataKey}
              className="flex items-center justify-between gap-4 text-sm"
            >
              <span className="flex items-center gap-1.5 text-muted-foreground">
                {!hideIndicator && (
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                )}
                {displayLabel}
              </span>
              <span className="font-mono font-medium tabular-nums">
                {displayValue}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── ChartLegend ─────────────────────────────────────────────────────

type ChartLegendContentProps = {
  payload?: Array<{
    value: string;
    color: string;
    dataKey?: string;
  }>;
  config?: ChartConfig;
  className?: string;
};

export function ChartLegendContent({
  payload,
  config: configProp,
  className,
}: ChartLegendContentProps) {
  const ctx = React.useContext(ChartContext);
  const config = configProp ?? ctx?.config ?? {};

  if (!payload?.length) return null;

  return (
    <div className={cn("flex items-center justify-center gap-4", className)}>
      {payload.map((entry) => {
        const key = entry.dataKey ?? entry.value;
        const cfg = config[key];
        const label = cfg?.label ?? entry.value;

        return (
          <span
            key={key}
            className="flex items-center gap-1.5 text-sm text-muted-foreground"
          >
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            {label}
          </span>
        );
      })}
    </div>
  );
}
