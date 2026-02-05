export function TrustSection() {
  return (
    <section className="border-y border-border bg-secondary/30">
      <div className="mx-auto max-w-6xl px-6 py-16 lg:py-24">
        {/* Section header */}
        <div className="mb-12 max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">
            Data Sources
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">
            Official filings. Verified data.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Every transaction is pulled directly from government disclosure systems and cross-referenced against original documents.
          </p>
        </div>

        {/* Sources - editorial list */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-display text-lg font-semibold">House of Representatives</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Financial Disclosure Reports filed with the Clerk of the House
            </p>
          </div>
          <div>
            <p className="font-display text-lg font-semibold">U.S. Senate</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Periodic Transaction Reports from the Secretary of the Senate
            </p>
          </div>
          <div>
            <p className="font-display text-lg font-semibold">SEC EDGAR</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Form 4 filings for executive insider transactions
            </p>
          </div>
          <div>
            <p className="font-display text-lg font-semibold">STOCK Act</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Compliance data mandated by federal law since 2012
            </p>
          </div>
        </div>

        {/* Stats bar */}
        <div className="mt-16 grid grid-cols-2 gap-8 border-t border-border pt-8 md:grid-cols-4">
          <div>
            <p className="font-display text-3xl font-semibold md:text-4xl">99.9%</p>
            <p className="mt-1 text-sm text-muted-foreground">Data accuracy</p>
          </div>
          <div>
            <p className="font-display text-3xl font-semibold md:text-4xl">&lt;15min</p>
            <p className="mt-1 text-sm text-muted-foreground">Filing to alert</p>
          </div>
          <div>
            <p className="font-display text-3xl font-semibold md:text-4xl">12 yrs</p>
            <p className="mt-1 text-sm text-muted-foreground">Historical data</p>
          </div>
          <div>
            <p className="font-display text-3xl font-semibold md:text-4xl">535</p>
            <p className="mt-1 text-sm text-muted-foreground">Members tracked</p>
          </div>
        </div>
      </div>
    </section>
  );
}
