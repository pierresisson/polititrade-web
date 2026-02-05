import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border">
      {/* Main footer */}
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="font-display text-xl font-semibold">
              Politi<span className="text-primary">Trades</span>
            </Link>
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">
              Track congressional stock trades. See what politicians are buying and selling before the market reacts.
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Product
            </p>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="#feed" className="text-sm hover:text-primary">
                  Live Feed
                </Link>
              </li>
              <li>
                <Link href="#politicians" className="text-sm hover:text-primary">
                  Politicians
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="text-sm hover:text-primary">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/api" className="text-sm hover:text-primary">
                  API
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Company
            </p>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/about" className="text-sm hover:text-primary">
                  About
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm hover:text-primary">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm hover:text-primary">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm hover:text-primary">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar - disclaimer */}
      <div className="border-t border-border bg-secondary/30">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <p className="text-xs text-muted-foreground">
            <strong>Disclaimer:</strong> PolitiTrades provides information for educational and research purposes only.
            This is not investment advice. Stock trading involves risk; past performance does not guarantee future results.
            Data sourced from official U.S. government disclosure filings.
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            © {new Date().getFullYear()} PolitiTrades. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
