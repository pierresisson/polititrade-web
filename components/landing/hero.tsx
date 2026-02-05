"use client";

import Link from "next/link";
import { Search, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { politicians, trendingStocks, getInitials, getPartyColor, getPartyBgColor } from "@/lib/mock-data";
import { HeroIllustration } from "./hero-illustration";
import { useTranslations, useLocalePath } from "@/lib/i18n-context";

export function Hero() {
  const { t } = useTranslations();
  const localePath = useLocalePath();
  const featuredPoliticians = politicians.slice(0, 4);

  return (
    <section className="mx-auto max-w-6xl px-6">
      <div className="grid gap-8 py-12 lg:grid-cols-2 lg:gap-12 lg:py-20">
        {/* Left column - Content */}
        <div className="flex flex-col justify-center">
          {/* Eyebrow */}
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-primary">
            {t("hero.eyebrow")}
          </p>

          {/* Main headline */}
          <h1 className="font-display text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl lg:text-[3.5rem]">
            {t("hero.title")}{" "}
            <em className="not-italic text-primary">{t("hero.titleHighlight")}</em>
            <br />
            {t("hero.titleEnd")}
          </h1>

          {/* Subhead */}
          <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
            {t("hero.subtitle")}
          </p>

          {/* Search bar */}
          <div className="mt-8 max-w-md">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t("hero.searchPlaceholder")}
                className="h-12 border-2 border-border bg-card pl-12 pr-4 text-base placeholder:text-muted-foreground focus:border-primary"
              />
            </div>
          </div>

          {/* Trending Politicians */}
          <div className="mt-8">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {t("hero.trendingNow")}
            </p>
            <div className="flex flex-wrap gap-2">
              {featuredPoliticians.map((politician) => (
                <Link
                  key={politician.id}
                  href={localePath(`/politician/${politician.id}`)}
                  className="group flex items-center gap-2 border border-border bg-card px-3 py-2 transition-all hover:border-primary hover:bg-secondary/50"
                >
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${getPartyBgColor(politician.party)} ${getPartyColor(politician.party)}`}
                  >
                    {getInitials(politician.name)}
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-tight group-hover:text-primary">
                      {politician.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {politician.party === "D" ? "Dem" : "Rep"} · {politician.chamber}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href={localePath("/app")}
              className="inline-flex items-center justify-center gap-2 bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              {t("hero.startTrial")}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={localePath("/app/feed")}
              className="editorial-link inline-flex items-center gap-2 px-2 text-sm font-medium"
            >
              {t("hero.viewLiveFeed")}
            </Link>
          </div>
        </div>

        {/* Right column - Illustration */}
        <div className="hidden lg:block">
          <HeroIllustration />
        </div>
      </div>

      {/* Bottom stats row - visible on all screens */}
      <div className="border-t border-border py-6">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {/* Most traded stocks */}
          {trendingStocks.slice(0, 4).map((stock) => (
            <Link
              key={stock.symbol}
              href={localePath(`/stock/${stock.symbol}`)}
              className="group flex items-center justify-between"
            >
              <div>
                <span className="font-mono text-lg font-bold group-hover:text-primary">{stock.symbol}</span>
                <p className="text-xs text-muted-foreground">{stock.transactions} {t("hero.tradesThisWeek")}</p>
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

      {/* Bottom rule */}
      <div className="editorial-rule-thin" />
    </section>
  );
}
