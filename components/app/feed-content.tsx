"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowDownRight, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { transactions, getPartyColor } from "@/lib/mock-data";
import { useTranslations, useLocalePath } from "@/lib/i18n-context";
import type { TradeType } from "@/lib/mock-data";

export function FeedContent() {
  const { t } = useTranslations();
  const localePath = useLocalePath();
  const [filter, setFilter] = useState<TradeType | "all">("all");

  const filteredTransactions =
    filter === "all"
      ? transactions
      : transactions.filter((tx) => tx.type === filter);

  const formatDaysAgo = (days: number) => {
    if (days === 0) return t("liveFeed.today");
    if (days === 1) return t("liveFeed.yesterday");
    return `${days}${t("liveFeed.daysAgo")}`;
  };

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
              {filteredTransactions.map((tx) => (
                <tr
                  key={tx.id}
                  className="group transition-colors hover:bg-secondary/30"
                >
                  <td className="px-4 py-4">
                    <Link
                      href={localePath(`/app/politician/${tx.politicianId}`)}
                      className="flex items-center gap-2"
                    >
                      <span className="font-medium group-hover:text-primary">
                        {tx.politician}
                      </span>
                      <span className={`text-xs font-medium ${getPartyColor(tx.party)}`}>
                        {tx.party}-{tx.state}
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <span className="font-mono font-semibold">{tx.stock}</span>
                      <p className="text-sm text-muted-foreground">{tx.company}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded px-2 py-1 text-sm font-medium ${
                        tx.type === "buy"
                          ? "bg-success/10 text-success"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {tx.type === "buy" ? (
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      ) : (
                        <ArrowDownRight className="h-3.5 w-3.5" />
                      )}
                      {tx.type === "buy" ? t("liveFeed.buy") : t("liveFeed.sell")}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-mono text-sm">{tx.amount}</span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="text-sm text-muted-foreground">
                      {formatDaysAgo(tx.daysAgo)}
                    </span>
                  </td>
                </tr>
              ))}
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
    </div>
  );
}
