"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowDownRight, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { getPartyColor, formatAmountRange, getDaysAgo, formatDisplayName } from "@/lib/helpers";
import { useTranslations, useLocalePath } from "@/lib/i18n-context";
import type { TradeWithPolitician } from "@/lib/supabase/types";

type TradeFilter = "buy" | "sell" | "all";

type Props = {
  trades: TradeWithPolitician[];
  currentPage: number;
  totalPages: number;
  total: number;
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

export function FeedContent({ trades, currentPage, totalPages, total }: Props) {
  const { t } = useTranslations();
  const localePath = useLocalePath();
  const [filter, setFilter] = useState<TradeFilter>("all");

  const filteredTransactions =
    filter === "all"
      ? trades
      : trades.filter((tx) => tx.trade_type === filter);

  const formatDaysAgo = (days: number) => {
    if (days === 0) return t("liveFeed.today");
    if (days === 1) return t("liveFeed.yesterday");
    return `${days}${t("liveFeed.daysAgo")}`;
  };

  const perPage = 25;
  const from = (currentPage - 1) * perPage + 1;
  const to = Math.min(currentPage * perPage, total);

  return (
    <div className="p-6 lg:p-8">
      {/* Page header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
            {t("app.feed.title")}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {t("app.feed.subtitle")}
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
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
              {t("liveFeed.buy")}
            </button>
            <button
              onClick={() => setFilter("sell")}
              className={`px-3 py-1.5 text-sm transition-colors ${
                filter === "sell"
                  ? "bg-destructive text-white"
                  : "hover:bg-secondary"
              }`}
            >
              {t("liveFeed.sell")}
            </button>
          </div>
        </div>
      </div>

      {/* Showing count */}
      {total > 0 && (
        <p className="mb-4 text-sm text-muted-foreground">
          {t("app.pagination.showing")
            .replace("{from}", String(from))
            .replace("{to}", String(to))
            .replace("{total}", String(total))}
        </p>
      )}

      {/* Transactions table */}
      <div className="rounded-lg border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                  {t("liveFeed.member")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                  {t("liveFeed.stock")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                  {t("liveFeed.type")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                  {t("liveFeed.amount")}
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider">
                  {t("liveFeed.filed")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredTransactions.map((tx) => {
                const party = tx.politicians?.party ?? null;
                const state = tx.politicians?.state ?? "";

                return (
                  <tr
                    key={tx.id}
                    className="group transition-colors hover:bg-secondary/30"
                  >
                    <td className="px-4 py-4">
                      <Link
                        href={localePath(`/app/politician/${tx.politician_id ?? ""}`)}
                        className="flex items-center gap-2"
                      >
                        <span className="font-medium group-hover:text-primary">
                          {formatDisplayName(tx.politicians?.name ?? tx.person_name ?? "")}
                        </span>
                        <span className={`text-xs font-medium ${getPartyColor(party)}`}>
                          {party ? `${party}-${state}` : state}
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <span className="font-mono font-semibold">{tx.ticker ?? "\u2014"}</span>
                        <p className="text-sm text-muted-foreground">{tx.asset_name ?? ""}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded px-2 py-1 text-sm font-medium ${
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
                        {tx.trade_type === "buy" ? t("liveFeed.buy") : tx.trade_type === "sell" ? t("liveFeed.sell") : tx.trade_type ?? "\u2014"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-mono text-sm">{formatAmountRange(tx.amount_min, tx.amount_max)}</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="text-sm text-muted-foreground">
                        {formatDaysAgo(getDaysAgo(tx.disclosure_date ?? tx.trade_date))}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty state */}
      {filteredTransactions.length === 0 && (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">
            No {filter} transactions found.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => setFilter("all")}
          >
            Show all transactions
          </Button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex flex-col items-center gap-4">
          <p className="text-sm text-muted-foreground">
            {t("app.pagination.showing")
              .replace("{from}", String((currentPage - 1) * 25 + 1))
              .replace("{to}", String(Math.min(currentPage * 25, total)))
              .replace("{total}", String(total))}
          </p>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href={localePath(`/app/feed?page=${currentPage - 1}`)}
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
                      href={localePath(`/app/feed?page=${p}`)}
                      isActive={p === currentPage}
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}
              <PaginationItem>
                <PaginationNext
                  href={localePath(`/app/feed?page=${currentPage + 1}`)}
                  text={t("app.pagination.next")}
                  aria-disabled={currentPage >= totalPages}
                  className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}

