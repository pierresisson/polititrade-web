"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Star,
  Trash2,
  Plus,
  Users,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations, useLocalePath } from "@/lib/i18n-context";

export function WatchlistContent() {
  const { t } = useTranslations();
  const localePath = useLocalePath();
  const [activeTab, setActiveTab] = useState<"politicians" | "stocks">("politicians");

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
            0
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
            0
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

              <div className="p-8 text-center">
                <Star className="mx-auto h-12 w-12 text-muted-foreground/30" />
                <p className="mt-4 text-muted-foreground">
                  {t("app.watchlist.noPoliticians")}
                </p>
                <Link href={localePath("/app/politicians")}>
                  <Button variant="outline" className="mt-4 gap-2">
                    <Plus className="h-4 w-4" />
                    {t("app.watchlist.browsePoliticians")}
                  </Button>
                </Link>
              </div>
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
            </div>
          )}
        </div>

        {/* Sidebar - Quick stats */}
        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border p-4">
              <h2 className="font-display text-lg font-semibold">
                {t("app.watchlist.recentActivity")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t("app.watchlist.fromYourWatchlist")}
              </p>
            </div>
            <div className="p-6 text-center text-sm text-muted-foreground">
              {t("app.watchlist.noRecentActivity")}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {t("app.watchlist.quickStats")}
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {t("app.watchlist.totalWatched")}
                </span>
                <span className="font-semibold">0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {t("app.watchlist.tradesThisWeek")}
                </span>
                <span className="font-semibold">0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
