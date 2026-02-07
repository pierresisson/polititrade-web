"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, ArrowUpDown, Grid3X3, List } from "lucide-react";
import { Input } from "@/components/ui/input";
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
import { getInitials, getPartyColor, getPartyBgColor, formatVolume, formatDisplayName } from "@/lib/helpers";
import { useTranslations, useLocalePath } from "@/lib/i18n-context";
import type { PoliticianWithStats } from "@/lib/supabase/types";
import type { Party, Chamber } from "@/lib/supabase/types";

type SortKey = "name" | "trades" | "volume";
type ViewMode = "grid" | "table";

const PER_PAGE = 24; // Divisible by 2, 3, 4 for grid layout

type Props = {
  politicians: PoliticianWithStats[];
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

export function PoliticiansList({ politicians }: Props) {
  const { t } = useTranslations();
  const localePath = useLocalePath();
  const [search, setSearch] = useState("");
  const [partyFilter, setPartyFilter] = useState<Party | "all">("all");
  const [chamberFilter, setChamberFilter] = useState<Chamber | "all">("all");
  const [sortBy, setSortBy] = useState<SortKey>("trades");
  const [sortDesc, setSortDesc] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [page, setPage] = useState(1);

  const filteredPoliticians = useMemo(() => {
    let result = [...politicians];

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          (p.state?.toLowerCase().includes(searchLower) ?? false) ||
          (p.top_ticker?.toLowerCase().includes(searchLower) ?? false)
      );
    }

    // Party filter
    if (partyFilter !== "all") {
      result = result.filter((p) => p.party === partyFilter);
    }

    // Chamber filter
    if (chamberFilter !== "all") {
      result = result.filter((p) => p.chamber === chamberFilter);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "trades":
          comparison = a.trade_count - b.trade_count;
          break;
        case "volume":
          comparison = a.volume - b.volume;
          break;
      }
      return sortDesc ? -comparison : comparison;
    });

    return result;
  }, [politicians, search, partyFilter, chamberFilter, sortBy, sortDesc]);

  const totalPages = Math.ceil(filteredPoliticians.length / PER_PAGE);
  const currentPage = Math.min(page, Math.max(1, totalPages));
  const paginatedPoliticians = filteredPoliticians.slice(
    (currentPage - 1) * PER_PAGE,
    currentPage * PER_PAGE
  );

  const handleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortDesc(!sortDesc);
    } else {
      setSortBy(key);
      setSortDesc(true);
    }
  };

  const handleFilterChange = (setter: (v: any) => void, value: any) => {
    setter(value);
    setPage(1);
  };

  return (
    <section className="mx-auto max-w-6xl px-6 py-8 lg:py-12">
      {/* Filters bar */}
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Search */}
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t("hero.searchPlaceholder")}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-10"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Party filter */}
          <div className="flex items-center gap-1 border border-border">
            <button
              onClick={() => handleFilterChange(setPartyFilter, "all")}
              className={`px-3 py-1.5 text-sm transition-colors ${
                partyFilter === "all"
                  ? "bg-foreground text-background"
                  : "hover:bg-secondary"
              }`}
            >
              {t("common.all")}
            </button>
            <button
              onClick={() => handleFilterChange(setPartyFilter, "D")}
              className={`px-3 py-1.5 text-sm transition-colors ${
                partyFilter === "D"
                  ? "bg-blue-600 text-white"
                  : "hover:bg-secondary"
              }`}
            >
              {t("politicians.democrat")}
            </button>
            <button
              onClick={() => handleFilterChange(setPartyFilter, "R")}
              className={`px-3 py-1.5 text-sm transition-colors ${
                partyFilter === "R"
                  ? "bg-red-600 text-white"
                  : "hover:bg-secondary"
              }`}
            >
              {t("politicians.republican")}
            </button>
          </div>

          {/* Chamber filter */}
          <div className="flex items-center gap-1 border border-border">
            <button
              onClick={() => handleFilterChange(setChamberFilter, "all")}
              className={`px-3 py-1.5 text-sm transition-colors ${
                chamberFilter === "all"
                  ? "bg-foreground text-background"
                  : "hover:bg-secondary"
              }`}
            >
              {t("common.all")}
            </button>
            <button
              onClick={() => handleFilterChange(setChamberFilter, "House")}
              className={`px-3 py-1.5 text-sm transition-colors ${
                chamberFilter === "House"
                  ? "bg-foreground text-background"
                  : "hover:bg-secondary"
              }`}
            >
              {t("politicians.house")}
            </button>
            <button
              onClick={() => handleFilterChange(setChamberFilter, "Senate")}
              className={`px-3 py-1.5 text-sm transition-colors ${
                chamberFilter === "Senate"
                  ? "bg-foreground text-background"
                  : "hover:bg-secondary"
              }`}
            >
              {t("politicians.senate")}
            </button>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-1 border border-border">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 transition-colors ${
                viewMode === "grid"
                  ? "bg-foreground text-background"
                  : "hover:bg-secondary"
              }`}
              aria-label="Grid view"
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 transition-colors ${
                viewMode === "table"
                  ? "bg-foreground text-background"
                  : "hover:bg-secondary"
              }`}
              aria-label="Table view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Results count */}
      <p className="mb-6 text-sm text-muted-foreground">
        {t("politicians.showing")} {filteredPoliticians.length} {t("politicians.of")} {politicians.length} {t("politicians.members")}
      </p>

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {paginatedPoliticians.map((p, index) => (
            <Link
              key={p.id}
              href={localePath(`/politician/${p.id}`)}
              className="group bg-card p-5 transition-colors hover:bg-secondary/50"
            >
              {/* Rank + Avatar */}
              <div className="flex items-start justify-between">
                <span className="font-display text-2xl font-semibold text-muted-foreground/20">
                  {String((currentPage - 1) * PER_PAGE + index + 1).padStart(2, "0")}
                </span>
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold ${getPartyBgColor(p.party)} ${getPartyColor(p.party)}`}
                >
                  {getInitials(p.name)}
                </div>
              </div>

              {/* Name */}
              <h3 className="mt-3 font-display text-lg font-semibold leading-tight group-hover:text-primary">
                {formatDisplayName(p.name)}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                <span className={getPartyColor(p.party)}>
                  {p.party === "D" ? t("politicians.democrat") : p.party === "R" ? t("politicians.republican") : "Ind"}
                </span>
                {" \u00b7 "}
                {p.chamber === "House" ? t("politicians.house") : p.chamber === "Senate" ? t("politicians.senate") : "\u2014"}
                {" \u00b7 "}
                {p.state ?? ""}
              </p>

              {/* Stats */}
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4">
                <div>
                  <p className="text-xs text-muted-foreground">{t("politicians.trades")}</p>
                  <p className="font-display text-xl font-semibold">{p.trade_count}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t("politicians.volume")}</p>
                  <p className="font-display text-xl font-semibold">{formatVolume(p.volume)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t("politicians.topHolding")}</p>
                  <p className="font-mono font-semibold">{p.top_ticker ?? "\u2014"}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Table View */}
      {viewMode === "table" && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-foreground">
                <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider">
                  <button
                    onClick={() => handleSort("name")}
                    className="inline-flex items-center gap-1 hover:text-primary"
                  >
                    {t("liveFeed.member")}
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider">
                  Party
                </th>
                <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider">
                  {t("politicians.house")}/{t("politicians.senate")}
                </th>
                <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider">
                  <button
                    onClick={() => handleSort("trades")}
                    className="inline-flex items-center gap-1 hover:text-primary"
                  >
                    {t("politicians.trades")}
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider">
                  <button
                    onClick={() => handleSort("volume")}
                    className="inline-flex items-center gap-1 hover:text-primary"
                  >
                    {t("politicians.volume")}
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider">
                  {t("politicians.topHolding")}
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedPoliticians.map((p) => (
                <tr
                  key={p.id}
                  className="group cursor-pointer border-b border-border transition-colors hover:bg-secondary/50"
                >
                  <td className="py-4">
                    <Link
                      href={localePath(`/politician/${p.id}`)}
                      className="flex items-center gap-3"
                    >
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold ${getPartyBgColor(p.party)} ${getPartyColor(p.party)}`}
                      >
                        {getInitials(p.name)}
                      </div>
                      <div>
                        <p className="font-medium group-hover:text-primary">{formatDisplayName(p.name)}</p>
                        <p className="text-xs text-muted-foreground">{p.state ?? ""}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="py-4">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
                        p.party === "D"
                          ? "bg-blue-100 text-blue-700"
                          : p.party === "R"
                          ? "bg-red-100 text-red-700"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {p.party === "D" ? t("politicians.dem") : p.party === "R" ? t("politicians.rep") : "Ind"}
                    </span>
                  </td>
                  <td className="py-4 text-sm text-muted-foreground">
                    {p.chamber === "House" ? t("politicians.house") : p.chamber === "Senate" ? t("politicians.senate") : "\u2014"}
                  </td>
                  <td className="py-4 text-right font-body font-semibold">{p.trade_count}</td>
                  <td className="py-4 text-right font-mono">{formatVolume(p.volume)}</td>
                  <td className="py-4 font-mono font-semibold">{p.top_ticker ?? "\u2014"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty state */}
      {filteredPoliticians.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-lg text-muted-foreground">{t("politicians.noResults")}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              setSearch("");
              setPartyFilter("all");
              setChamberFilter("all");
            }}
          >
            {t("common.clearFilters")}
          </Button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  text={t("app.pagination.previous")}
                  onClick={(e) => { e.preventDefault(); setPage(Math.max(1, currentPage - 1)); }}
                  aria-disabled={currentPage <= 1}
                  className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              {getPageNumbers(currentPage, totalPages).map((p, i) =>
                p === "ellipsis" ? (
                  <PaginationItem key={`ellipsis-${i}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={p}>
                    <PaginationLink
                      href="#"
                      isActive={p === currentPage}
                      onClick={(e) => { e.preventDefault(); setPage(p); }}
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  text={t("app.pagination.next")}
                  onClick={(e) => { e.preventDefault(); setPage(Math.min(totalPages, currentPage + 1)); }}
                  aria-disabled={currentPage >= totalPages}
                  className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </section>
  );
}
