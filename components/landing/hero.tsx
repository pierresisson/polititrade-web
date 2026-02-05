import Link from "next/link";
import { Search, ArrowRight, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { politicians, transactions, trendingStocks, getInitials, getPartyColor, getPartyBgColor } from "@/lib/mock-data";

export function Hero() {
  const featuredPoliticians = politicians.slice(0, 4);
  const latestTransaction = transactions[0];

  return (
    <section className="mx-auto max-w-6xl px-6">
      <div className="py-12 lg:py-20">
        {/* Eyebrow */}
        <p className="mb-4 text-sm font-medium uppercase tracking-widest text-primary">
          Market Intelligence
        </p>

        {/* Main headline */}
        <h1 className="max-w-3xl font-display text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl lg:text-6xl">
          What Congress is{" "}
          <em className="not-italic text-primary">buying</em>
          <br />
          before the market knows
        </h1>

        {/* Subhead */}
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
          Track stock trades disclosed by members of Congress.
          Real-time alerts from official filings.
        </p>

        {/* Search bar */}
        <div className="mt-8 max-w-lg">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search politicians, stocks, or sectors..."
              className="h-14 border-2 border-border bg-card pl-12 pr-4 text-base placeholder:text-muted-foreground focus:border-primary"
            />
          </div>
        </div>

        {/* Trending Politicians */}
        <div className="mt-10">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Trending Politicians
          </p>
          <div className="flex flex-wrap gap-3">
            {featuredPoliticians.map((politician) => (
              <Link
                key={politician.id}
                href={`/politician/${politician.id}`}
                className="group flex items-center gap-3 border border-border bg-card px-4 py-3 transition-all hover:border-primary hover:bg-secondary/50"
              >
                {/* Avatar with initials */}
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${getPartyBgColor(politician.party)} ${getPartyColor(politician.party)}`}
                >
                  {getInitials(politician.name)}
                </div>
                {/* Info */}
                <div>
                  <p className="font-medium group-hover:text-primary">
                    {politician.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <span className={getPartyColor(politician.party)}>
                      {politician.party === "D" ? "Dem" : "Rep"}
                    </span>
                    {" · "}
                    {politician.chamber}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="editorial-rule-thin my-10" />

        {/* Bottom row: Latest trade + Trending stocks */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Latest notable trade */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Latest Notable Trade
            </p>
            <div className="border-l-2 border-primary pl-4">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 text-sm font-semibold ${
                    latestTransaction.type === "buy" ? "text-success" : "text-destructive"
                  }`}
                >
                  {latestTransaction.type === "buy" ? (
                    <ArrowUpRight className="h-4 w-4" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4" />
                  )}
                  {latestTransaction.type === "buy" ? "Buy" : "Sell"}
                </span>
                <span className="font-mono text-lg font-bold">{latestTransaction.stock}</span>
              </div>
              <p className="mt-1 text-muted-foreground">
                <span className="font-medium text-foreground">{latestTransaction.politician}</span>
                {" · "}
                {latestTransaction.amount}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Filed {latestTransaction.daysAgo === 0 ? "today" : latestTransaction.daysAgo === 1 ? "yesterday" : `${latestTransaction.daysAgo} days ago`}
              </p>
            </div>
          </div>

          {/* Trending stocks */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Most Traded This Week
            </p>
            <div className="space-y-2">
              {trendingStocks.slice(0, 4).map((stock) => (
                <Link
                  key={stock.symbol}
                  href={`/stock/${stock.symbol}`}
                  className="flex items-center justify-between border-b border-border py-2 transition-colors hover:bg-secondary/30"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-lg font-bold">{stock.symbol}</span>
                    <span className="text-sm text-muted-foreground">{stock.transactions} trades</span>
                  </div>
                  <span
                    className={`font-mono text-sm font-medium ${
                      stock.trending === "up" ? "text-success" : "text-destructive"
                    }`}
                  >
                    {stock.change}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
          <Link
            href="#pricing"
            className="inline-flex items-center justify-center gap-2 bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            Start free trial
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="#feed"
            className="editorial-link inline-flex items-center gap-2 text-sm font-medium"
          >
            View live feed
          </Link>
        </div>
      </div>

      {/* Bottom rule */}
      <div className="editorial-rule-thin" />
    </section>
  );
}
