import Link from "next/link";

type Politician = {
  rank: number;
  name: string;
  party: "D" | "R";
  chamber: "House" | "Senate";
  state: string;
  trades: number;
  volume: string;
  topHolding: string;
  returnYTD: string;
};

const politicians: Politician[] = [
  { rank: 1, name: "Nancy Pelosi", party: "D", chamber: "House", state: "CA", trades: 43, volume: "$12.4M", topHolding: "NVDA", returnYTD: "+67%" },
  { rank: 2, name: "Tommy Tuberville", party: "R", chamber: "Senate", state: "AL", trades: 156, volume: "$8.7M", topHolding: "AAPL", returnYTD: "+45%" },
  { rank: 3, name: "Dan Crenshaw", party: "R", chamber: "House", state: "TX", trades: 28, volume: "$3.2M", topHolding: "MSFT", returnYTD: "+34%" },
  { rank: 4, name: "Mark Warner", party: "D", chamber: "Senate", state: "VA", trades: 12, volume: "$5.1M", topHolding: "GOOGL", returnYTD: "+28%" },
  { rank: 5, name: "Josh Gottheimer", party: "D", chamber: "House", state: "NJ", trades: 89, volume: "$2.8M", topHolding: "META", returnYTD: "+52%" },
  { rank: 6, name: "Michael McCaul", party: "R", chamber: "House", state: "TX", trades: 34, volume: "$6.3M", topHolding: "TSLA", returnYTD: "+41%" },
];

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

        {/* Grid - editorial cards */}
        <div className="grid gap-px overflow-hidden border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
          {politicians.map((p) => (
            <article
              key={p.rank}
              className="group cursor-pointer bg-card p-6 transition-colors hover:bg-secondary/50"
            >
              {/* Rank + Name */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-display text-4xl font-semibold text-muted-foreground/30">
                    {String(p.rank).padStart(2, "0")}
                  </span>
                  <h3 className="mt-1 font-display text-xl font-semibold group-hover:text-primary">
                    {p.name}
                  </h3>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    <span className={p.party === "D" ? "text-blue-600" : "text-red-600"}>
                      {p.party}
                    </span>
                    {" · "}
                    {p.chamber}
                    {" · "}
                    {p.state}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Trades
                  </p>
                  <p className="mt-1 font-display text-2xl font-semibold">{p.trades}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Volume
                  </p>
                  <p className="mt-1 font-display text-2xl font-semibold">{p.volume}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Top Holding
                  </p>
                  <p className="mt-1 font-mono text-lg font-semibold">{p.topHolding}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Return YTD
                  </p>
                  <p className="mt-1 font-display text-lg font-semibold text-success">
                    {p.returnYTD}
                  </p>
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
