"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, ArrowUpDown, Star } from "lucide-react";
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
import type { PoliticianWithStats, Party, Chamber } from "@/lib/supabase/types";

type SortKey = "name" | "trades" | "volume";

const PER_PAGE = 25;

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

export function AppPoliticiansList({ politicians }: Props) {
  const { t } = useTranslations();
  const localePath = useLocalePath();
  const [search, setSearch] = useState("");
  const [partyFilter, setPartyFilter] = useState<Party | "all">("all");
  const [chamberFilter, setChamberFilter] = useState<Chamber | "all">("all");
  const [sortBy, setSortBy] = useState<SortKey>("trades");
  const [sortDesc, setSortDesc] = useState(true);
  const [page, setPage] = useState(1);

  const filteredPoliticians = useMemo(() => {
    let result = [...politicians];

    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          (p.state?.toLowerCase().includes(searchLower) ?? false) ||
          (p.top_ticker?.toLowerCase().includes(searchLower) ?? false)
      );
    }

    if (partyFilter !== "all") {
      result = result.filter((p) => p.party === partyFilter);
    }

    if (chamberFilter !== "all") {
      result = result.filter((p) => p.chamber === chamberFilter);
    }

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
    <div className="p-6 lg:p-8">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
          {t("app.politicians.title")}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {t("app.politicians.subtitle")}
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
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

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-md border border-border">
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
              {t("politicians.dem")}
            </button>
            <button
              onClick={() => handleFilterChange(setPartyFilter, "R")}
              className={`px-3 py-1.5 text-sm transition-colors ${
                partyFilter === "R"
                  ? "bg-red-600 text-white"
                  : "hover:bg-secondary"
              }`}
            >
              {t("politicians.rep")}
            </button>
          </div>

          <div className="flex items-center gap-1 rounded-md border border-border">
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
        </div>
      </div>

      {/* Results count */}
      <p className="mb-4 text-sm text-muted-foreground">
        {t("politicians.showing")} {filteredPoliticians.length} {t("politicians.of")} {politicians.length} {t("politicians.members")}
      </p>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                  <button
                    onClick={() => handleSort("name")}
                    className="inline-flex items-center gap-1 hover:text-primary"
                  >
                    {t("liveFeed.member")}
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                  Party
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                  Chamber
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider">
                  <button
                    onClick={() => handleSort("trades")}
                    className="inline-flex items-center gap-1 hover:text-primary"
                  >
                    {t("politicians.trades")}
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider">
                  <button
                    onClick={() => handleSort("volume")}
                    className="inline-flex items-center gap-1 hover:text-primary"
                  >
                    {t("politicians.volume")}
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                  {t("politicians.topHolding")}
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">
                  Watch
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedPoliticians.map((p) => (
                <tr
                  key={p.id}
                  className="group transition-colors hover:bg-secondary/30"
                >
                  <td className="px-4 py-4">
                    <Link
                      href={localePath(`/app/politician/${p.id}`)}
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
                  <td className="px-4 py-4">
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
                  <td className="px-4 py-4 text-sm text-muted-foreground">
                    {p.chamber === "House" ? t("politicians.house") : p.chamber === "Senate" ? t("politicians.senate") : "\u2014"}
                  </td>
                  <td className="px-4 py-4 text-right font-body font-semibold">{p.trade_count}</td>
                  <td className="px-4 py-4 text-right font-mono">{formatVolume(p.volume)}</td>
                  <td className="px-4 py-4 font-mono font-semibold">{p.top_ticker ?? "\u2014"}</td>
                  <td className="px-4 py-4 text-center">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Star className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty state */}
      {filteredPoliticians.length === 0 && (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
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
    </div>
  );
}
