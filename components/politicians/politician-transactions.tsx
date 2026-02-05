"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowDownRight, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { transactions } from "@/lib/mock-data";
import type { TradeType } from "@/lib/mock-data";

type Props = {
  politicianId: string;
};

export function PoliticianTransactions({ politicianId }: Props) {
  const [filter, setFilter] = useState<TradeType | "all">("all");

  // Get transactions for this politician
  const politicianTransactions = transactions.filter(
    (t) => t.politicianId === politicianId
  );

  // Apply type filter
  const filteredTransactions =
    filter === "all"
      ? politicianTransactions
      : politicianTransactions.filter((t) => t.type === filter);

  // If no transactions, show message
  if (politicianTransactions.length === 0) {
    return (
      <section className="mx-auto max-w-6xl px-6 py-8 lg:py-12">
        <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Recent Transactions
        </p>
        <div className="border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">
            No recent transactions disclosed for this member.
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
            Recent Transactions
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {politicianTransactions.length} trades in the last 12 months
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-1 border border-border">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 text-sm transition-colors ${
              filter === "all"
                ? "bg-foreground text-background"
                : "hover:bg-secondary"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("buy")}
            className={`px-3 py-1.5 text-sm transition-colors ${
              filter === "buy"
                ? "bg-success text-white"
                : "hover:bg-secondary"
            }`}
          >
            Buys
          </button>
          <button
            onClick={() => setFilter("sell")}
            className={`px-3 py-1.5 text-sm transition-colors ${
              filter === "sell"
                ? "bg-destructive text-white"
                : "hover:bg-secondary"
            }`}
          >
            Sells
          </button>
        </div>
      </div>

      {/* Transactions table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-foreground">
              <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider">
                Stock
              </th>
              <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider">
                Type
              </th>
              <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider">
                Amount
              </th>
              <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider">
                Trade Date
              </th>
              <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider">
                Filed
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((tx) => (
              <tr
                key={tx.id}
                className="group cursor-pointer border-b border-border transition-colors hover:bg-secondary/50"
              >
                <td className="py-4">
                  <Link href={`/stock/${tx.stock}`} className="block">
                    <span className="font-mono text-lg font-semibold group-hover:text-primary">
                      {tx.stock}
                    </span>
                    <p className="text-sm text-muted-foreground">{tx.company}</p>
                  </Link>
                </td>
                <td className="py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded px-2 py-1 text-sm font-medium ${
                      tx.type === "buy"
                        ? "bg-success-light text-success"
                        : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {tx.type === "buy" ? (
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    ) : (
                      <ArrowDownRight className="h-3.5 w-3.5" />
                    )}
                    {tx.type === "buy" ? "Buy" : "Sell"}
                  </span>
                </td>
                <td className="py-4">
                  <span className="font-mono">{tx.amount}</span>
                </td>
                <td className="py-4 text-muted-foreground">{tx.date}</td>
                <td className="py-4 text-right text-sm text-muted-foreground">
                  {tx.filedDate}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty filtered state */}
      {filteredTransactions.length === 0 && (
        <div className="border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">
            No {filter === "buy" ? "buy" : "sell"} transactions found.
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

      {/* Source note */}
      <p className="mt-6 text-xs text-muted-foreground">
        Data sourced from official congressional financial disclosure filings.
        Amounts shown are reported ranges, not exact figures.
      </p>
    </section>
  );
}
