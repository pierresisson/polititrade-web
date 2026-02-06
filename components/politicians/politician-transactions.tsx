"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
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
import { formatAmountRange, formatDate } from "@/lib/helpers";
import { useTranslations, useLocalePath } from "@/lib/i18n-context";
import { TradeReturnBadge } from "@/components/performance/trade-return-badge";
import { UnsupportedAssetBadge } from "@/components/performance/unsupported-asset-badge";
import { TimeframeSelector } from "@/components/performance/timeframe-selector";
import type { TradeWithPolitician, TradePerformanceData, TradePerformanceMap, Timeframe, AccessLevel } from "@/lib/supabase/types";

type TradeType = "buy" | "sell" | "all";

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
  trades: TradeWithPolitician[];
  currentPage: number;
  totalPages: number;
  total: number;
  performanceMap?: TradePerformanceMap;
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

export function PoliticianTransactions({ trades, currentPage, totalPages, total, performanceMap, accessLevel = "guest" }: Props) {
  const { t } = useTranslations();
  const localePath = useLocalePath();
  const [filter, setFilter] = useState<TradeType>("all");
  const [timeframe, setTimeframe] = useState<Timeframe>("1m");
  const hasPerformance = performanceMap && Object.keys(performanceMap).length > 0;

  // Apply type filter
  const filteredTransactions =
    filter === "all"
      ? trades
      : trades.filter((tx) => tx.trade_type === filter);

  // If no transactions, show message
  if (trades.length === 0) {
    return (
      <section className="mx-auto max-w-6xl px-6 py-8 lg:py-12">
        <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {t("politicianDetail.recentTransactions")}
        </p>
        <div className="border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">
            {t("politicianDetail.noTransactions")}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-8 lg:py-12">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {t("politicianDetail.recentTransactions")}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {total} {t("politicianDetail.tradesInLast12Months")}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {hasPerformance && (
            <TimeframeSelector
              selected={timeframe}
              onSelect={setTimeframe}
              accessLevel={accessLevel}
            />
          )}
          <div className="flex items-center gap-1 border border-border">
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

      {/* Transactions table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-foreground">
              <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider">
                {t("liveFeed.stock")}
              </th>
              <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider">
                {t("liveFeed.type")}
              </th>
              <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider">
                {t("liveFeed.amount")}
              </th>
              <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider">
                {t("politicianDetail.tradeDate")}
              </th>
              <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider">
                {t("liveFeed.filed")}
              </th>
              {hasPerformance && (
                <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider">
                  {t("performance.column")}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((tx) => (
              <tr
                key={tx.id}
                className="group cursor-pointer border-b border-border transition-colors hover:bg-secondary/50"
              >
                <td className="py-4">
                  <Link href={localePath(`/stock/${tx.ticker ?? ""}`)} className="block">
                    <span className="font-mono text-lg font-semibold group-hover:text-primary">
                      {tx.ticker ?? "—"}
                    </span>
                    <p className="text-sm text-muted-foreground">{tx.asset_name ?? ""}</p>
                  </Link>
                </td>
                <td className="py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded px-2 py-1 text-sm font-medium ${
                      tx.trade_type === "buy"
                        ? "bg-success-light text-success"
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
                <td className="py-4">
                  <span className="font-mono">{formatAmountRange(tx.amount_min, tx.amount_max)}</span>
                </td>
                <td className="py-4 text-muted-foreground">{formatDate(tx.trade_date)}</td>
                <td className="py-4 text-right text-sm text-muted-foreground">
                  {formatDate(tx.disclosure_date ?? tx.trade_date)}
                </td>
                {hasPerformance && (
                  <td className="py-4 text-right">
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

      {/* Empty filtered state */}
      {filteredTransactions.length === 0 && (
        <div className="border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">
            {t("politicianDetail.noFilteredTransactions").replace("{type}", filter === "buy" ? t("politicianDetail.buys").toLowerCase() : t("politicianDetail.sells").toLowerCase())}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => setFilter("all")}
          >
            {t("politicianDetail.showAllTransactions")}
          </Button>
        </div>
      )}

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
                  href={`?page=${currentPage - 1}`}
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
                      href={`?page=${p}`}
                      isActive={p === currentPage}
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}
              <PaginationItem>
                <PaginationNext
                  href={`?page=${currentPage + 1}`}
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
    </section>
  );
}

