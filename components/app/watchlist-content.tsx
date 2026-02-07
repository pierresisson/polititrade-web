"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Star,
  Trash2,
  Plus,
  Users,
  TrendingUp,
  Search,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTranslations, useLocalePath } from "@/lib/i18n-context";
import { useWatchlist, type WatchlistItem } from "@/lib/hooks/use-watchlist";
import { getInitials, getPartyColor, getPartyBgColor, formatDisplayName } from "@/lib/helpers";
import { signInWithGoogle } from "@/lib/auth/actions";
import { useLocale } from "@/lib/i18n-context";
import type { SearchResult } from "@/lib/command-items";

type Props = {
  accessLevel: string;
};

export function WatchlistContent({ accessLevel }: Props) {
  const { t } = useTranslations();
  const localePath = useLocalePath();
  const locale = useLocale();
  const wl = useWatchlist(accessLevel);
  const [activeTab, setActiveTab] = useState<"politicians" | "stocks">("politicians");

  const isGuest = accessLevel === "guest";

  const personItems = wl.items.filter((i) => i.entity_type === "person");
  const assetItems = wl.items.filter((i) => i.entity_type === "asset");

  // Guest state
  if (isGuest) {
    return (
      <div className="p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
            {t("app.watchlist.title")}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {t("app.watchlist.subtitle")}
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <Star className="mx-auto h-12 w-12 text-muted-foreground/30" />
          <h2 className="mt-4 font-display text-xl font-semibold">
            {t("app.watchlist.signInToAccess")}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {t("app.watchlist.signInToAccessDescription")}
          </p>
          <form action={() => signInWithGoogle(locale)} className="mt-6">
            <Button type="submit">
              {t("app.watchlist.signIn")}
            </Button>
          </form>
        </div>
      </div>
    );
  }

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

        <div className="flex items-center gap-3">
          {wl.limit !== null && (
            <span className="text-sm text-muted-foreground">
              {t("app.watchlist.itemCount")
                .replace("{count}", String(wl.counts.person + wl.counts.asset))
                .replace("{limit}", String(wl.limit))}
            </span>
          )}
          {wl.limit === null && (wl.counts.person + wl.counts.asset) > 0 && (
            <span className="text-sm text-muted-foreground">
              {t("app.watchlist.itemCountUnlimited")
                .replace("{count}", String(wl.counts.person + wl.counts.asset))}
            </span>
          )}
          <AddToWatchlistDialog watchlist={wl} accessLevel={accessLevel} />
        </div>
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
            {wl.counts.person}
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
            {wl.counts.asset}
          </span>
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2">
          {activeTab === "politicians" && (
            <div className="rounded-lg border border-border bg-card">
              <div className="border-b border-border p-4">
                <h2 className="font-display text-lg font-semibold">
                  {t("app.watchlist.watchedPoliticians")}
                </h2>
              </div>

              {wl.isLoading ? (
                <div className="p-8 text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : personItems.length > 0 ? (
                <div className="divide-y divide-border">
                  {personItems.map((item) => (
                    <PoliticianRow key={item.id} item={item} onRemove={() => wl.remove(item.id, t)} />
                  ))}
                </div>
              ) : (
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
              )}
            </div>
          )}

          {activeTab === "stocks" && (
            <div className="rounded-lg border border-border bg-card">
              <div className="border-b border-border p-4">
                <h2 className="font-display text-lg font-semibold">
                  {t("app.watchlist.watchedStocks")}
                </h2>
              </div>

              {wl.isLoading ? (
                <div className="p-8 text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : assetItems.length > 0 ? (
                <div className="divide-y divide-border">
                  {assetItems.map((item) => (
                    <AssetRow key={item.id} item={item} onRemove={() => wl.remove(item.id, t)} />
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

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {t("app.watchlist.quickStats")}
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {t("app.watchlist.politicians")}
                </span>
                <span className="font-semibold">{wl.counts.person}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {t("app.watchlist.stocks")}
                </span>
                <span className="font-semibold">{wl.counts.asset}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {t("app.watchlist.totalWatched")}
                </span>
                <span className="font-semibold">{wl.counts.person + wl.counts.asset}</span>
              </div>
            </div>
          </div>

          {wl.limit !== null && accessLevel === "account" && (
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">
                {t("app.watchlist.itemCount")
                  .replace("{count}", String(wl.counts.person + wl.counts.asset))
                  .replace("{limit}", String(wl.limit))}
              </p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{
                    width: `${Math.min(100, ((wl.counts.person + wl.counts.asset) / wl.limit) * 100)}%`,
                  }}
                />
              </div>
              <Link href={localePath("/app/settings")}>
                <Button variant="link" size="sm" className="mt-2 h-auto p-0 text-xs">
                  {t("app.watchlist.upgrade")}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Row components ──────────────────────────────────────────────────

function PoliticianRow({ item, onRemove }: { item: WatchlistItem; onRemove: () => void }) {
  const localePath = useLocalePath();
  const { t } = useTranslations();
  const enriched = item.enriched as {
    name?: string;
    party?: string | null;
    chamber?: string | null;
    state?: string | null;
  } | null;

  const name = enriched?.name ?? item.entity_id;

  return (
    <div className="flex items-center justify-between p-4">
      <Link
        href={localePath(`/app/politician/${item.entity_id}`)}
        className="flex items-center gap-3 hover:opacity-80"
      >
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${getPartyBgColor(enriched?.party ?? null)} ${getPartyColor(enriched?.party ?? null)}`}
        >
          {getInitials(name)}
        </div>
        <div>
          <p className="font-medium">{formatDisplayName(name)}</p>
          <p className="text-sm text-muted-foreground">
            {[
              enriched?.party === "D" ? t("politicians.dem") : enriched?.party === "R" ? t("politicians.rep") : null,
              enriched?.chamber,
              enriched?.state,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
      </Link>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-destructive"
        onClick={onRemove}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

function AssetRow({ item, onRemove }: { item: WatchlistItem; onRemove: () => void }) {
  const localePath = useLocalePath();
  const { t } = useTranslations();
  const enriched = item.enriched as {
    asset_name?: string | null;
    trade_count?: number;
  } | null;

  return (
    <div className="flex items-center justify-between p-4">
      <Link
        href={localePath(`/app/feed?ticker=${encodeURIComponent(item.entity_id)}`)}
        className="flex items-center gap-3 hover:opacity-80"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-bold font-mono">
          {item.entity_id.slice(0, 2)}
        </div>
        <div>
          <p className="font-mono font-medium">{item.entity_id}</p>
          <p className="text-sm text-muted-foreground">
            {enriched?.asset_name ?? ""}
            {enriched?.trade_count ? ` · ${enriched.trade_count} ${t("app.watchlist.trades")}` : ""}
          </p>
        </div>
      </Link>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-destructive"
        onClick={onRemove}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

// ─── Add dialog with search ──────────────────────────────────────────

function AddToWatchlistDialog({
  watchlist: wl,
  accessLevel,
}: {
  watchlist: ReturnType<typeof useWatchlist>;
  accessLevel: string;
}) {
  const { t } = useTranslations();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);

  const search = useCallback(
    async (q: string) => {
      if (q.length < 2) {
        setResults([]);
        return;
      }
      setSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        // Filter to person and asset results only
        setResults(
          (data.results as SearchResult[]).filter(
            (r) => r.type === "person" || r.type === "asset"
          )
        );
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    },
    []
  );

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  async function handleAdd(result: SearchResult) {
    const entityType = result.type as "person" | "asset";
    const entityId = entityType === "person"
      ? result.id
      : result.title; // ticker is the title for assets

    if (wl.isFollowing(entityType, entityId)) return;

    setAdding(result.id);
    await wl.toggle(entityType, entityId, t);
    setAdding(null);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setQuery(""); setResults([]); } }}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          {t("app.watchlist.addNew")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>{t("app.watchlist.addSearchTitle")}</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("app.watchlist.searchPlaceholder")}
            className="pl-10"
            autoFocus
          />
        </div>
        <div className="max-h-[50vh] overflow-y-auto">
          {searching && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
          {!searching && query.length >= 2 && results.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {t("app.watchlist.noSearchResults")}
            </p>
          )}
          {!searching && results.length > 0 && (
            <div className="divide-y divide-border">
              {results.map((result) => {
                const entityType = result.type as "person" | "asset";
                const entityId = entityType === "person" ? result.id : result.title;
                const alreadyFollowing = wl.isFollowing(entityType, entityId);

                return (
                  <button
                    key={result.id}
                    className="flex w-full items-center justify-between px-2 py-3 text-left transition-colors hover:bg-secondary/50 disabled:opacity-50"
                    onClick={() => handleAdd(result)}
                    disabled={alreadyFollowing || adding === result.id}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-medium">
                        {result.type === "person" ? (
                          <Users className="h-4 w-4" />
                        ) : (
                          <TrendingUp className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{result.title}</p>
                        {result.subtitle && (
                          <p className="text-xs text-muted-foreground">
                            {result.subtitle}
                          </p>
                        )}
                      </div>
                    </div>
                    {adding === result.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : alreadyFollowing ? (
                      <Star className="h-4 w-4 fill-primary text-primary" />
                    ) : (
                      <Plus className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
