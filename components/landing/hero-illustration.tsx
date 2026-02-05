"use client";

// Illustration hero - Mini dashboard preview
// Style éditorial avec données visuelles + animations subtiles

import { m, useReducedMotion } from "framer-motion";
import { AreaChart, Area } from "recharts";
import {
  ChartContainer,
  useChart,
  type ChartConfig,
} from "@/components/ui/chart";

// Animation timing (starts after the parent fade-left animation)
const BASE_DELAY = 0.4;

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: BASE_DELAY,
    },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
  },
};

const fadeInUpReduced = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
};

const slideInRight = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: BASE_DELAY + 0.6 },
  },
};

const slideInLeft = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: BASE_DELAY + 0.8 },
  },
};

const slideInRightReduced = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3, delay: BASE_DELAY + 0.6 },
  },
};

const slideInLeftReduced = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3, delay: BASE_DELAY + 0.8 },
  },
};

// Sparkline mock data
const sparklineData = [
  { v: 45 },
  { v: 42 },
  { v: 38 },
  { v: 40 },
  { v: 25 },
  { v: 28 },
  { v: 15 },
  { v: 18 },
  { v: 10 },
  { v: 12 },
  { v: 8 },
];

const sparklineConfig: ChartConfig = {
  v: { label: "Performance", color: "var(--chart-1)" },
};

function HeroSparkline() {
  const { reducedMotion } = useChart();

  return (
    <AreaChart data={sparklineData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
      <defs>
        <linearGradient id="heroSparklineGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-v)" stopOpacity={0.15} />
          <stop offset="100%" stopColor="var(--color-v)" stopOpacity={0} />
        </linearGradient>
      </defs>
      <Area
        type="monotone"
        dataKey="v"
        stroke="var(--color-v)"
        strokeWidth={2}
        fill="url(#heroSparklineGradient)"
        isAnimationActive={!reducedMotion}
        animationDuration={800}
        animationEasing="ease-out"
      />
    </AreaChart>
  );
}

export function HeroIllustration() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="relative flex h-full w-full justify-end" aria-hidden="true">
      {/* Container with subtle perspective */}
      <m.div
        className="relative h-[400px] w-full max-w-md lg:h-[480px]"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Background card - dashboard frame */}
        <div className="absolute inset-0 rounded-sm border border-border bg-card shadow-lg">
          {/* Header bar */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
              <div className="h-2.5 w-2.5 rounded-full bg-amber-400/60" />
              <div className="h-2.5 w-2.5 rounded-full bg-success/60" />
            </div>
            <div className="h-2 w-24 rounded bg-muted" />
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Chart area */}
            <m.div
              className="mb-4 rounded border border-border bg-secondary/30 p-3"
              variants={prefersReducedMotion ? fadeInUpReduced : fadeInUp}
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="h-2 w-16 rounded bg-muted" />
                <div className="h-2 w-8 rounded bg-primary/30" />
              </div>
              {/* Recharts sparkline */}
              <ChartContainer config={sparklineConfig} className="h-16 w-full">
                <HeroSparkline />
              </ChartContainer>
            </m.div>

            {/* Transaction rows */}
            <div className="space-y-2">
              {/* Row 1 - Buy */}
              <m.div
                className="flex items-center gap-3 rounded border border-border bg-card p-2.5"
                variants={prefersReducedMotion ? fadeInUpReduced : fadeInUp}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-600">
                  NP
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold">NVDA</span>
                    <span className="text-xs font-medium text-success">Buy</span>
                  </div>
                  <div className="h-1.5 w-20 rounded bg-muted" />
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm font-medium">$1M+</div>
                </div>
              </m.div>

              {/* Row 2 - Sell */}
              <m.div
                className="flex items-center gap-3 rounded border border-border bg-card p-2.5"
                variants={prefersReducedMotion ? fadeInUpReduced : fadeInUp}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-xs font-semibold text-red-600">
                  TT
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold">AAPL</span>
                    <span className="text-xs font-medium text-destructive">Sell</span>
                  </div>
                  <div className="h-1.5 w-16 rounded bg-muted" />
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm font-medium">$250K</div>
                </div>
              </m.div>

              {/* Row 3 - Buy */}
              <m.div
                className="flex items-center gap-3 rounded border border-border bg-card p-2.5"
                variants={prefersReducedMotion ? fadeInUpReduced : fadeInUp}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-xs font-semibold text-red-600">
                  DC
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold">MSFT</span>
                    <span className="text-xs font-medium text-success">Buy</span>
                  </div>
                  <div className="h-1.5 w-24 rounded bg-muted" />
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm font-medium">$100K</div>
                </div>
              </m.div>
            </div>

            {/* Bottom stats bar */}
            <div className="mt-4 grid grid-cols-3 gap-2">
              <m.div
                className="rounded border border-border bg-secondary/30 p-2 text-center"
                variants={prefersReducedMotion ? fadeInUpReduced : fadeInUp}
              >
                <div className="font-display text-lg font-semibold">156</div>
                <div className="text-[10px] text-muted-foreground">Trades</div>
              </m.div>
              <m.div
                className="rounded border border-border bg-secondary/30 p-2 text-center"
                variants={prefersReducedMotion ? fadeInUpReduced : fadeInUp}
              >
                <div className="font-display text-lg font-semibold text-success">+34%</div>
                <div className="text-[10px] text-muted-foreground">Avg Return</div>
              </m.div>
              <m.div
                className="rounded border border-border bg-secondary/30 p-2 text-center"
                variants={prefersReducedMotion ? fadeInUpReduced : fadeInUp}
              >
                <div className="font-display text-lg font-semibold">$47M</div>
                <div className="text-[10px] text-muted-foreground">Volume</div>
              </m.div>
            </div>
          </div>
        </div>

        {/* Floating notification card */}
        <m.div
          className="absolute -right-4 top-20 z-10 rounded border border-border bg-card p-3 shadow-lg lg:-right-8"
          variants={prefersReducedMotion ? slideInRightReduced : slideInRight}
        >
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
              <svg className="h-3 w-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium">New trade filed</p>
              <p className="text-[10px] text-muted-foreground">Nancy Pelosi · NVDA</p>
            </div>
          </div>
        </m.div>

        {/* Floating badge */}
        <m.div
          className="absolute -left-2 bottom-24 z-10 rounded border border-success/30 bg-success-light px-3 py-1.5 shadow-md lg:-left-6"
          variants={prefersReducedMotion ? slideInLeftReduced : slideInLeft}
        >
          <div className="flex items-center gap-1.5">
            <svg className="h-3 w-3 text-success" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
            </svg>
            <span className="text-xs font-semibold text-success">+67% YTD</span>
          </div>
        </m.div>
      </m.div>
    </div>
  );
}
