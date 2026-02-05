"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { transactions, getPartyColor } from "@/lib/mock-data";

export function LiveFeed() {
  const [showAll, setShowAll] = useState(false);
  const displayed = showAll ? transactions : transactions.slice(0, 5);

  return (
    <section id="feed" className="mx-auto max-w-6xl px-6 py-16 lg:py-24">
      {/* Section header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-primary">
            Live Feed
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">
            Latest Disclosed Trades
          </h2>
        </div>
        <Link
          href="/transactions"
          className="editorial-link hidden text-sm font-medium sm:inline"
        >
          View all transactions
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-foreground">
              <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider">
                Member
              </th>
              <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider">
                Stock
              </th>
              <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider">
                Type
              </th>
              <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider">
                Amount
              </th>
              <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider">
                Filed
              </th>
            </tr>
          </thead>
          <tbody>
            {displayed.map((tx) => (
              <tr
                key={tx.id}
                className="group cursor-pointer border-b border-border transition-colors hover:bg-secondary/50"
              >
                <td className="py-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium group-hover:text-primary">
                      {tx.politician}
                    </span>
                    <span className={`text-xs font-medium ${getPartyColor(tx.party)}`}>
                      {tx.party}-{tx.state}
                    </span>
                  </div>
                </td>
                <td className="py-4">
                  <div>
                    <span className="font-mono font-semibold">{tx.stock}</span>
                    <p className="text-sm text-muted-foreground">{tx.company}</p>
                  </div>
                </td>
                <td className="py-4">
                  <span
                    className={`inline-flex items-center gap-1 text-sm font-medium ${
                      tx.type === "buy" ? "text-success" : "text-destructive"
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
                  <span className="font-mono text-sm">{tx.amount}</span>
                </td>
                <td className="py-4 text-right">
                  <span className="text-sm text-muted-foreground">
                    {tx.daysAgo === 0 ? "Today" : tx.daysAgo === 1 ? "Yesterday" : `${tx.daysAgo}d ago`}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Load more */}
      {!showAll && transactions.length > 5 && (
        <button
          onClick={() => setShowAll(true)}
          className="mt-6 text-sm font-medium text-primary hover:underline"
        >
          Show more transactions
        </button>
      )}

      {/* Mobile CTA */}
      <Link
        href="/transactions"
        className="mt-6 block text-sm font-medium text-primary hover:underline sm:hidden"
      >
        View all transactions →
      </Link>
    </section>
  );
}
