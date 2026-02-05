"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Star,
  Bell,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Users,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  politicians,
  transactions,
  trendingStocks,
  getInitials,
  getPartyColor,
  getPartyBgColor,
} from "@/lib/mock-data";
import { useTranslations, useLocalePath } from "@/lib/i18n-context";

// Mock watchlist data - in real app this would come from user's saved data
const watchedPoliticianIds = ["pelosi", "tuberville", "ossoff"];
const watchedStockSymbols = ["NVDA", "AAPL", "MSFT"];

export function WatchlistContent() {
  const { t } = useTranslations();
  const localePath = useLocalePath();
  const [activeTab, setActiveTab] = useState<"politicians" | "stocks">("politicians");

  const watchedPoliticians = politicians.filter((p) =>
    watchedPoliticianIds.includes(p.id)
  );

  const watchedStocks = trendingStocks.filter((s) =>
    watchedStockSymbols.includes(s.symbol)
  );

  // Get recent transactions from watched politicians
  const watchedTransactions = transactions
    .filter((tx) => watchedPoliticianIds.includes(tx.politicianId))
    .slice(0, 5);

  return (
    <div className="p-6 lg:p-8">
      {/* Page header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
            {t("app.watchlist.title")}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {t("app.watchlist.subtitle")}
          </p>
        </div>

        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          {t("app.watchlist.addNew")}
        </Button>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex items-center gap-1 rounded-lg border border-border bg-card p-1">
        <button
          onClick={() => setActiveTab("politicians")}
          className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "politicians"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
          }`}
        >
          <Users className="h-4 w-4" />
          {t("app.watchlist.politicians")}
          <span className="rounded-full bg-background/20 px-2 py-0.5 text-xs">
            {watchedPoliticians.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("stocks")}
          className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "stocks"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          {t("app.watchlist.stocks")}
          <span className="rounded-full bg-background/20 px-2 py-0.5 text-xs">
            {watchedStocks.length}
          </span>
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content - 2 cols */}
        <div className="lg:col-span-2">
          {/* Politicians tab */}
          {activeTab === "politicians" && (
            <div className="rounded-lg border border-border bg-card">
              <div className="border-b border-border p-4">
                <h2 className="font-display text-lg font-semibold">
                  {t("app.watchlist.watchedPoliticians")}
                </h2>
              </div>

              {watchedPoliticians.length > 0 ? (
                <div className="divide-y divide-border">
                  {watchedPoliticians.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-4 transition-colors hover:bg-secondary/30"
                    >
                      <Link
                        href={localePath(`/app/politician/${p.id}`)}
                        className="flex flex-1 items-center gap-4"
                      >
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold ${getPartyBgColor(p.party)} ${getPartyColor(p.party)}`}
                        >
                          {getInitials(p.name)}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium hover:text-primary">
                            {p.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            <span className={getPartyColor(p.party)}>
                              {p.party === "D" ? t("politicians.dem") : t("politicians.rep")}
                            </span>
                            {" · "}
                            {p.chamber === "House" ? t("politicians.house") : t("politicians.senate")}
                            {" · "}
                            {p.state}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-display text-lg font-semibold">
                            {p.trades}
                          </p>
                          <p className="text-xs text-muted-foreground">trades</p>
                        </div>
                        <div className="text-right">
                          <p className="font-display font-semibold text-success">
                            {p.returnYTD}
                          </p>
                          <p className="text-xs text-muted-foreground">YTD</p>
                        </div>
                      </Link>

                      <div className="ml-4 flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Bell className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Star className="mx-auto h-12 w-12 text-muted-foreground/30" />
                  <p className="mt-4 text-muted-foreground">
                    {t("app.watchlist.noPoliticians")}
                  </p>
                  <Button variant="outline" className="mt-4 gap-2">
                    <Plus className="h-4 w-4" />
                    {t("app.watchlist.browsePoliticians")}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Stocks tab */}
          {activeTab === "stocks" && (
            <div className="rounded-lg border border-border bg-card">
              <div className="border-b border-border p-4">
                <h2 className="font-display text-lg font-semibold">
                  {t("app.watchlist.watchedStocks")}
                </h2>
              </div>

              {watchedStocks.length > 0 ? (
                <div className="divide-y divide-border">
                  {watchedStocks.map((stock) => (
                    <div
                      key={stock.symbol}
                      className="flex items-center justify-between p-4 transition-colors hover:bg-secondary/30"
                    >
                      <div className="flex flex-1 items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary font-mono text-lg font-bold">
                          {stock.symbol.slice(0, 2)}
                        </div>
                        <div className="flex-1">
                          <p className="font-mono text-lg font-semibold">
                            {stock.symbol}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {stock.transactions} trades this week
                          </p>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-mono text-lg font-semibold ${
                              stock.trending === "up"
                                ? "text-success"
                                : "text-destructive"
                            }`}
                          >
                            {stock.change}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {stock.trending === "up" ? "▲" : "▼"} today
                          </p>
                        </div>
                      </div>

                      <div className="ml-4 flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Bell className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground/30" />
                  <p className="mt-4 text-muted-foreground">
                    {t("app.watchlist.noStocks")}
                  </p>
                  <Button variant="outline" className="mt-4 gap-2">
                    <Plus className="h-4 w-4" />
                    {t("app.watchlist.browseStocks")}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar - Recent activity from watchlist */}
        <div className="space-y-6">
          {/* Recent trades from watched */}
          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border p-4">
              <h2 className="font-display text-lg font-semibold">
                {t("app.watchlist.recentActivity")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t("app.watchlist.fromYourWatchlist")}
              </p>
            </div>

            {watchedTransactions.length > 0 ? (
              <div className="divide-y divide-border">
                {watchedTransactions.map((tx) => (
                  <div key={tx.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`flex h-6 w-6 items-center justify-center rounded-full ${
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
                        </span>
                        <span className="font-mono font-semibold">{tx.stock}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {tx.daysAgo === 0
                          ? t("liveFeed.today")
                          : tx.daysAgo === 1
                          ? t("liveFeed.yesterday")
                          : `${tx.daysAgo}${t("liveFeed.daysAgo")}`}
                      </span>
                    </div>
                    <p className="mt-1 text-sm">
                      <Link
                        href={localePath(`/app/politician/${tx.politicianId}`)}
                        className="font-medium hover:text-primary"
                      >
                        {tx.politician}
                      </Link>
                      <span className="text-muted-foreground">
                        {" "}
                        {tx.type === "buy" ? "bought" : "sold"} {tx.amount}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-sm text-muted-foreground">
                {t("app.watchlist.noRecentActivity")}
              </div>
            )}
          </div>

          {/* Quick stats */}
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {t("app.watchlist.quickStats")}
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {t("app.watchlist.totalWatched")}
                </span>
                <span className="font-semibold">
                  {watchedPoliticians.length + watchedStocks.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {t("app.watchlist.tradesThisWeek")}
                </span>
                <span className="font-semibold">{watchedTransactions.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {t("app.watchlist.alertsActive")}
                </span>
                <span className="font-semibold">2</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
