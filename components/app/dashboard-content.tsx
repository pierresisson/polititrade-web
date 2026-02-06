"use client";

import Link from "next/link";
import { ArrowUpRight, ArrowDownRight, TrendingUp, Users, Activity } from "lucide-react";
import { getPartyColor, formatAmountRange, formatVolume } from "@/lib/helpers";
import { useTranslations, useLocalePath } from "@/lib/i18n-context";
import type { TradeWithPolitician, PoliticianWithStats, TrendingStock, WeeklyStats } from "@/lib/supabase/types";

type Props = {
  trades: TradeWithPolitician[];
  politicians: PoliticianWithStats[];
  trendingStocks: TrendingStock[];
  stats: WeeklyStats;
};

export function DashboardContent({ trades, politicians, trendingStocks, stats }: Props) {
  const { t } = useTranslations();
  const localePath = useLocalePath();

  const recentTransactions = trades.slice(0, 5);
  const topPoliticians = politicians.slice(0, 5);

  return (
    <div className="p-6 lg:p-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
          {t("app.dashboard.title")}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {t("app.dashboard.subtitle")}
        </p>
      </div>

      {/* Stats cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{t("app.dashboard.todayTrades")}</p>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="mt-2 font-display text-3xl font-semibold">{stats.totalTrades}</p>
          <p className="mt-1 text-xs text-muted-foreground">this week</p>
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{t("app.dashboard.activeMembers")}</p>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="mt-2 font-display text-3xl font-semibold">{stats.activePoliticians}</p>
          <p className="mt-1 text-xs text-muted-foreground">this week</p>
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{t("app.dashboard.totalVolume")}</p>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="mt-2 font-display text-3xl font-semibold">{stats.totalVolume}</p>
          <p className="mt-1 text-xs text-muted-foreground">this week</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent transactions */}
        <div className="rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border p-4">
            <h2 className="font-display text-lg font-semibold">{t("app.dashboard.recentTrades")}</h2>
            <Link
              href={localePath("/app/feed")}
              className="text-sm text-primary hover:underline"
            >
              {t("common.viewAll")}
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      tx.trade_type === "buy" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {tx.trade_type === "buy" ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                  </span>
                  <div>
                    <p className="font-medium">{tx.politicians?.name ?? tx.person_name}</p>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-mono font-semibold">{tx.ticker ?? "—"}</span>
                      {" · "}
                      {formatAmountRange(tx.amount_min, tx.amount_max)}
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-medium ${getPartyColor(tx.politicians?.party ?? null)}`}>
                  {tx.politicians?.party ? `${tx.politicians.party}-${tx.politicians.state ?? ""}` : ""}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top politicians */}
        <div className="rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border p-4">
            <h2 className="font-display text-lg font-semibold">{t("app.dashboard.topTraders")}</h2>
            <Link
              href={localePath("/app/politicians")}
              className="text-sm text-primary hover:underline"
            >
              {t("common.viewAll")}
            </Link>
          </div>
          <div className="divide-y divide-border">
            {topPoliticians.map((p, i) => (
              <Link
                key={p.id}
                href={localePath(`/app/politician/${p.id}`)}
                className="flex items-center justify-between p-4 transition-colors hover:bg-secondary/50"
              >
                <div className="flex items-center gap-3">
                  <span className="font-display text-lg font-semibold text-muted-foreground/30">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-sm text-muted-foreground">
                      <span className={getPartyColor(p.party)}>
                        {p.party === "D" ? "Dem" : p.party === "R" ? "Rep" : "Ind"}
                      </span>
                      {" · "}
                      {p.chamber ?? ""}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-display font-semibold">{p.trade_count}</p>
                  <p className="text-xs text-muted-foreground">trades</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Trending stocks */}
      <div className="mt-6 rounded-lg border border-border bg-card">
        <div className="border-b border-border p-4">
          <h2 className="font-display text-lg font-semibold">{t("app.dashboard.trendingStocks")}</h2>
        </div>
        <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-5">
          {trendingStocks.map((stock) => (
            <div key={stock.ticker} className="bg-card p-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-lg font-bold">{stock.ticker}</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {stock.trade_count} trades this week
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
