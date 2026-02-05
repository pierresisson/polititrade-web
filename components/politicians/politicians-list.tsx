"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, ArrowUpDown, Grid3X3, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { politicians, getInitials, getPartyColor, getPartyBgColor } from "@/lib/mock-data";
import type { Party, Chamber } from "@/lib/mock-data";

type SortKey = "name" | "trades" | "volume" | "returnYTD";
type ViewMode = "grid" | "table";

export function PoliticiansList() {
  const [search, setSearch] = useState("");
  const [partyFilter, setPartyFilter] = useState<Party | "all">("all");
  const [chamberFilter, setChamberFilter] = useState<Chamber | "all">("all");
  const [sortBy, setSortBy] = useState<SortKey>("trades");
  const [sortDesc, setSortDesc] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const filteredPoliticians = useMemo(() => {
    let result = [...politicians];

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.state.toLowerCase().includes(searchLower) ||
          p.topHolding.toLowerCase().includes(searchLower)
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
          comparison = a.trades - b.trades;
          break;
        case "volume":
          comparison = parseFloat(a.volume.replace(/[$M,K]/g, "")) - parseFloat(b.volume.replace(/[$M,K]/g, ""));
          break;
        case "returnYTD":
          comparison = parseFloat(a.returnYTD) - parseFloat(b.returnYTD);
          break;
      }
      return sortDesc ? -comparison : comparison;
    });

    return result;
  }, [search, partyFilter, chamberFilter, sortBy, sortDesc]);

  const handleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortDesc(!sortDesc);
    } else {
      setSortBy(key);
      setSortDesc(true);
    }
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
            placeholder="Search by name, state, or stock..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Party filter */}
          <div className="flex items-center gap-1 border border-border">
            <button
              onClick={() => setPartyFilter("all")}
              className={`px-3 py-1.5 text-sm transition-colors ${
                partyFilter === "all"
                  ? "bg-foreground text-background"
                  : "hover:bg-secondary"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setPartyFilter("D")}
              className={`px-3 py-1.5 text-sm transition-colors ${
                partyFilter === "D"
                  ? "bg-blue-600 text-white"
                  : "hover:bg-secondary"
              }`}
            >
              Democrat
            </button>
            <button
              onClick={() => setPartyFilter("R")}
              className={`px-3 py-1.5 text-sm transition-colors ${
                partyFilter === "R"
                  ? "bg-red-600 text-white"
                  : "hover:bg-secondary"
              }`}
            >
              Republican
            </button>
          </div>

          {/* Chamber filter */}
          <div className="flex items-center gap-1 border border-border">
            <button
              onClick={() => setChamberFilter("all")}
              className={`px-3 py-1.5 text-sm transition-colors ${
                chamberFilter === "all"
                  ? "bg-foreground text-background"
                  : "hover:bg-secondary"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setChamberFilter("House")}
              className={`px-3 py-1.5 text-sm transition-colors ${
                chamberFilter === "House"
                  ? "bg-foreground text-background"
                  : "hover:bg-secondary"
              }`}
            >
              House
            </button>
            <button
              onClick={() => setChamberFilter("Senate")}
              className={`px-3 py-1.5 text-sm transition-colors ${
                chamberFilter === "Senate"
                  ? "bg-foreground text-background"
                  : "hover:bg-secondary"
              }`}
            >
              Senate
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
        Showing {filteredPoliticians.length} of {politicians.length} members
      </p>

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredPoliticians.map((p, index) => (
            <Link
              key={p.id}
              href={`/politician/${p.id}`}
              className="group bg-card p-5 transition-colors hover:bg-secondary/50"
            >
              {/* Rank + Avatar */}
              <div className="flex items-start justify-between">
                <span className="font-display text-2xl font-semibold text-muted-foreground/20">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold ${getPartyBgColor(p.party)} ${getPartyColor(p.party)}`}
                >
                  {getInitials(p.name)}
                </div>
              </div>

              {/* Name */}
              <h3 className="mt-3 font-display text-lg font-semibold leading-tight group-hover:text-primary">
                {p.name}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                <span className={getPartyColor(p.party)}>
                  {p.party === "D" ? "Democrat" : "Republican"}
                </span>
                {" · "}
                {p.chamber}
                {" · "}
                {p.state}
              </p>

              {/* Stats */}
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4">
                <div>
                  <p className="text-xs text-muted-foreground">Trades</p>
                  <p className="font-display text-xl font-semibold">{p.trades}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Volume</p>
                  <p className="font-display text-xl font-semibold">{p.volume}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Top Holding</p>
                  <p className="font-mono font-semibold">{p.topHolding}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Return YTD</p>
                  <p className="font-display font-semibold text-success">{p.returnYTD}</p>
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
                    Member
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider">
                  Party
                </th>
                <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider">
                  Chamber
                </th>
                <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider">
                  <button
                    onClick={() => handleSort("trades")}
                    className="inline-flex items-center gap-1 hover:text-primary"
                  >
                    Trades
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider">
                  <button
                    onClick={() => handleSort("volume")}
                    className="inline-flex items-center gap-1 hover:text-primary"
                  >
                    Volume
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider">
                  Top Stock
                </th>
                <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider">
                  <button
                    onClick={() => handleSort("returnYTD")}
                    className="inline-flex items-center gap-1 hover:text-primary"
                  >
                    Return
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPoliticians.map((p) => (
                <tr
                  key={p.id}
                  className="group cursor-pointer border-b border-border transition-colors hover:bg-secondary/50"
                >
                  <td className="py-4">
                    <Link
                      href={`/politician/${p.id}`}
                      className="flex items-center gap-3"
                    >
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold ${getPartyBgColor(p.party)} ${getPartyColor(p.party)}`}
                      >
                        {getInitials(p.name)}
                      </div>
                      <div>
                        <p className="font-medium group-hover:text-primary">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.state}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="py-4">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
                        p.party === "D"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {p.party === "D" ? "Dem" : "Rep"}
                    </span>
                  </td>
                  <td className="py-4 text-sm text-muted-foreground">{p.chamber}</td>
                  <td className="py-4 text-right font-display font-semibold">{p.trades}</td>
                  <td className="py-4 text-right font-mono">{p.volume}</td>
                  <td className="py-4 font-mono font-semibold">{p.topHolding}</td>
                  <td className="py-4 text-right font-display font-semibold text-success">
                    {p.returnYTD}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty state */}
      {filteredPoliticians.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-lg text-muted-foreground">No politicians found matching your criteria.</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              setSearch("");
              setPartyFilter("all");
              setChamberFilter("all");
            }}
          >
            Clear filters
          </Button>
        </div>
      )}
    </section>
  );
}
