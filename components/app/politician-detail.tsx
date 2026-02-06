"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, ArrowDownRight, Star, Bell, ExternalLink, DollarSign, BarChart3, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { getInitials, getPartyColor, getPartyBgColor, formatAmountRange, formatDate, formatVolume } from "@/lib/helpers";
import { useTranslations, useLocalePath } from "@/lib/i18n-context";
import { TradeReturnBadge } from "@/components/performance/trade-return-badge";
import { UnsupportedAssetBadge } from "@/components/performance/unsupported-asset-badge";
import { TimeframeSelector } from "@/components/performance/timeframe-selector";
import { PoliticianPerformanceSection } from "@/components/performance/politician-performance-section";
import type { PoliticianWithStats, TradeWithPolitician, TradePerformanceData, TradePerformanceMap, PoliticianPerformanceStats, Timeframe, AccessLevel } from "@/lib/supabase/types";

type TradeFilter = "buy" | "sell" | "all";

const TIMEFRAME_RETURN_KEY: Record<Timeframe, keyof TradePerformanceData> = {
  "1d": "return_1d",
  "1w": "return_1w",
  "1m": "return_1m",
  "3m": "return_3m",
  "6m": "return_6m",
  "1y": "return_1y",
  to_date: "return_to_date",
};

type Props = {
  politician: PoliticianWithStats;
  trades: TradeWithPolitician[];
  currentPage: number;
  totalPages: number;
  total: number;
  performanceMap?: TradePerformanceMap;
  politicianStats?: PoliticianPerformanceStats;
  accessLevel?: AccessLevel;
};

function getPageNumbers(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "ellipsis")[] = [1];
  if (current > 3) pages.push("ellipsis");
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push("ellipsis");
  pages.push(total);
  return pages;
}

export function AppPoliticianDetail({ politician, trades, currentPage, totalPages, total, performanceMap, politicianStats, accessLevel = "account" }: Props) {
  const { t } = useTranslations();
  const localePath = useLocalePath();
  const [filter, setFilter] = useState<TradeFilter>("all");
  const [timeframe, setTimeframe] = useState<Timeframe>("1m");
  const hasPerformance = performanceMap && Object.keys(performanceMap).length > 0;

  const filteredTransactions =
    filter === "all"
      ? trades
      : trades.filter((tx) => tx.trade_type === filter);

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
    <div className="p-6 lg:p-8">
      {/* Back link */}
      <Link
        href={localePath("/app/politicians")}
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("politicians.allPoliticians")}
      </Link>

      {/* Profile header */}
      <div className="mb-8 flex flex-col gap-6 rounded-lg border border-border bg-card p-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-5">
          <div
            className={`flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold sm:h-20 sm:w-20 sm:text-2xl ${getPartyBgColor(politician.party)} ${getPartyColor(politician.party)}`}
          >
            {getInitials(politician.name)}
          </div>

          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              {politician.name}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <span
                className={`inline-block rounded px-2.5 py-1 text-sm font-medium ${
                  politician.party === "D"
                    ? "bg-blue-100 text-blue-700"
                    : politician.party === "R"
                    ? "bg-red-100 text-red-700"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {politician.party === "D" ? t("politicians.democrat") : politician.party === "R" ? t("politicians.republican") : "Independent"}
              </span>
              <span className="text-muted-foreground">
                {politician.chamber === "House" ? t("politicians.house") : politician.chamber === "Senate" ? t("politicians.senate") : "—"}
              </span>
              <span className="text-muted-foreground">{politician.state ?? ""}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Star className="h-4 w-4" />
            Watch
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Bell className="h-4 w-4" />
            Alert
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <ExternalLink className="h-4 w-4" />
            {t("politicianDetail.officialPage")}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-border bg-card p-5"
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

      {/* Performance section */}
      {politicianStats && politicianStats.total_evaluated > 0 && (
        <div className="mb-8">
          <PoliticianPerformanceSection
            stats={politicianStats}
            accessLevel={accessLevel}
          />
        </div>
      )}

      {/* Transactions */}
      <div className="rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div>
            <h2 className="font-display text-lg font-semibold">
              {t("politicianDetail.recentTransactions")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {total} {t("politicianDetail.tradesInLast12Months")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {hasPerformance && (
              <TimeframeSelector
                selected={timeframe}
                onSelect={setTimeframe}
                accessLevel={accessLevel}
              />
            )}
            <div className="flex items-center gap-1 rounded-md border border-border">
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-1.5 text-sm transition-colors ${
                  filter === "all"
                    ? "bg-foreground text-background"
                    : "hover:bg-secondary"
                }`}
              >
                {t("common.all")}
              </button>
              <button
                onClick={() => setFilter("buy")}
                className={`px-3 py-1.5 text-sm transition-colors ${
                  filter === "buy"
                    ? "bg-success text-white"
                    : "hover:bg-secondary"
                }`}
              >
                {t("politicianDetail.buys")}
              </button>
              <button
                onClick={() => setFilter("sell")}
                className={`px-3 py-1.5 text-sm transition-colors ${
                  filter === "sell"
                    ? "bg-destructive text-white"
                    : "hover:bg-secondary"
                }`}
              >
                {t("politicianDetail.sells")}
              </button>
            </div>
          </div>
        </div>

        {filteredTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                    {t("liveFeed.stock")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                    {t("liveFeed.type")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                    {t("liveFeed.amount")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                    {t("politicianDetail.tradeDate")}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider">
                    {t("liveFeed.filed")}
                  </th>
                  {hasPerformance && (
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider">
                      {t("performance.column")}
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="transition-colors hover:bg-secondary/30"
                  >
                    <td className="px-4 py-4">
                      <span className="font-mono text-lg font-semibold">
                        {tx.ticker ?? "—"}
                      </span>
                      <p className="text-sm text-muted-foreground">{tx.asset_name ?? ""}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded px-2 py-1 text-sm font-medium ${
                          tx.trade_type === "buy"
                            ? "bg-success/10 text-success"
                            : tx.trade_type === "sell"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {tx.trade_type === "buy" ? (
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        ) : tx.trade_type === "sell" ? (
                          <ArrowDownRight className="h-3.5 w-3.5" />
                        ) : null}
                        {tx.trade_type === "buy" ? t("liveFeed.buy") : tx.trade_type === "sell" ? t("liveFeed.sell") : tx.trade_type ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-mono">{formatAmountRange(tx.amount_min, tx.amount_max)}</span>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">{formatDate(tx.trade_date)}</td>
                    <td className="px-4 py-4 text-right text-sm text-muted-foreground">
                      {formatDate(tx.disclosure_date ?? tx.trade_date)}
                    </td>
                    {hasPerformance && (
                      <td className="px-4 py-4 text-right">
                        {(() => {
                          if (!tx.ticker) return <UnsupportedAssetBadge reason="no_ticker" />;
                          const perf = performanceMap?.[tx.id];
                          if (!perf) return <span className="text-xs text-muted-foreground">{t("performance.noData")}</span>;
                          const returnKey = TIMEFRAME_RETURN_KEY[timeframe];
                          return <TradeReturnBadge value={perf[returnKey] as number | null} />;
                        })()}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">
              {trades.length === 0
                ? t("politicianDetail.noTransactions")
                : t("politicianDetail.noFilteredTransactions").replace(
                    "{type}",
                    filter === "buy"
                      ? t("politicianDetail.buys").toLowerCase()
                      : t("politicianDetail.sells").toLowerCase()
                  )}
            </p>
            {filter !== "all" && (
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => setFilter("all")}
              >
                {t("politicianDetail.showAllTransactions")}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex flex-col items-center gap-4">
          <p className="text-sm text-muted-foreground">
            {t("app.pagination.showing")
              .replace("{from}", String((currentPage - 1) * 20 + 1))
              .replace("{to}", String(Math.min(currentPage * 20, total)))
              .replace("{total}", String(total))}
          </p>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href={localePath(`/app/politician/${politician.id}?page=${currentPage - 1}`)}
                  text={t("app.pagination.previous")}
                  aria-disabled={currentPage <= 1}
                  className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              {getPageNumbers(currentPage, totalPages).map((p, i) =>
                p === "ellipsis" ? (
                  <PaginationItem key={`e-${i}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={p}>
                    <PaginationLink
                      href={localePath(`/app/politician/${politician.id}?page=${p}`)}
                      isActive={p === currentPage}
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}
              <PaginationItem>
                <PaginationNext
                  href={localePath(`/app/politician/${politician.id}?page=${currentPage + 1}`)}
                  text={t("app.pagination.next")}
                  aria-disabled={currentPage >= totalPages}
                  className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Source note */}
      <p className="mt-6 text-xs text-muted-foreground">
        {t("politicianDetail.dataSource")}
      </p>
    </div>
  );
}

