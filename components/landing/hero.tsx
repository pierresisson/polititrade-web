import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-6">
      {/* Main hero - editorial layout */}
      <div className="grid gap-12 py-16 lg:grid-cols-12 lg:gap-8 lg:py-24">
        {/* Left column - headline */}
        <div className="lg:col-span-7">
          {/* Eyebrow */}
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-primary">
            Market Intelligence
          </p>

          {/* Main headline - dramatic serif */}
          <h1 className="font-display text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl lg:text-6xl">
            What Congress is{" "}
            <em className="not-italic text-primary">buying</em>
            <br />
            before the market knows
          </h1>

          {/* Subhead */}
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            Track stock trades disclosed by members of Congress.
            Real-time alerts from official filings. No insider knowledge required.
          </p>

          {/* CTA row */}
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              href="#pricing"
              className="inline-flex items-center gap-2 bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
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

        {/* Right column - key stat or featured trade */}
        <div className="lg:col-span-5">
          <div className="border-l-2 border-primary pl-6">
            {/* Featured stat */}
            <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
              This week
            </p>
            <p className="mt-2 font-display text-6xl font-semibold tracking-tight md:text-7xl">
              $47M
            </p>
            <p className="mt-2 text-lg text-muted-foreground">
              in disclosed trades by members of Congress
            </p>

            {/* Divider */}
            <div className="editorial-rule-thin my-6" />

            {/* Recent highlight */}
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Most traded this week
              </p>
              <div className="mt-3 flex items-baseline gap-3">
                <span className="font-display text-2xl font-semibold">NVDA</span>
                <span className="text-sm text-muted-foreground">12 transactions</span>
              </div>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="font-display text-2xl font-semibold">MSFT</span>
                <span className="text-sm text-muted-foreground">8 transactions</span>
              </div>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="font-display text-2xl font-semibold">GOOGL</span>
                <span className="text-sm text-muted-foreground">6 transactions</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom rule */}
      <div className="editorial-rule-thin" />
    </section>
  );
}
