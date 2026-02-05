import Link from "next/link";
import { politicians, getInitials, getPartyColor, getPartyBgColor } from "@/lib/mock-data";

export function TopPoliticians() {
  return (
    <section id="politicians" className="border-y border-border bg-secondary/30">
      <div className="mx-auto max-w-6xl px-6 py-16 lg:py-24">
        {/* Section header */}
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-primary">
              Leaderboard
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">
              Most Active Traders
            </h2>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Members of Congress ranked by trading activity. Performance based on disclosed trades over the trailing 12 months.
            </p>
          </div>
          <Link
            href="/politicians"
            className="editorial-link hidden text-sm font-medium sm:inline"
          >
            View all members
          </Link>
        </div>

        {/* Grid */}
        <div className="grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {politicians.map((p, index) => (
            <article
              key={p.id}
              className="group cursor-pointer bg-card p-5 transition-colors hover:bg-secondary/50"
            >
              {/* Rank + Avatar */}
              <div className="flex items-start justify-between">
                <span className="font-display text-3xl font-semibold text-muted-foreground/20">
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
                  {p.party === "D" ? "Dem" : "Rep"}
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
              </div>
            </article>
          ))}
        </div>

        {/* Mobile CTA */}
        <Link
          href="/politicians"
          className="mt-6 block text-sm font-medium text-primary hover:underline sm:hidden"
        >
          View all members →
        </Link>
      </div>
    </section>
  );
}
