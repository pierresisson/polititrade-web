import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="border-b border-foreground/10">
      {/* Top bar - minimal */}
      <div className="border-b border-border">
        <div className="mx-auto flex h-10 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>Congressional Trading Data</span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">Updated live</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/en" className="text-xs text-muted-foreground hover:text-foreground">
              EN
            </Link>
            <span className="text-muted-foreground">/</span>
            <Link href="/fr" className="text-xs text-muted-foreground hover:text-foreground">
              FR
            </Link>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="mx-auto max-w-6xl px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo - editorial style */}
          <Link href="/" className="group">
            <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
              Politi<span className="text-primary">Trades</span>
            </h1>
          </Link>

          {/* Nav - minimal */}
          <nav className="hidden items-center gap-8 md:flex">
            <Link
              href="#feed"
              className="editorial-link text-sm"
            >
              Live Feed
            </Link>
            <Link
              href="#politicians"
              className="editorial-link text-sm"
            >
              Politicians
            </Link>
            <Link
              href="#pricing"
              className="editorial-link text-sm"
            >
              Subscribe
            </Link>
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="hidden text-sm sm:flex">
              Sign in
            </Button>
            <Button size="sm" className="text-sm">
              Subscribe
            </Button>
          </div>
        </div>
      </div>

      {/* Thick rule - FT signature */}
      <div className="editorial-rule mx-auto max-w-6xl" />
    </header>
  );
}
