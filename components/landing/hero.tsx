"use client";

import Link from "next/link";
import { Search, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getInitials, getPartyColor, getPartyBgColor, formatDisplayName } from "@/lib/helpers";
import type { PoliticianWithStats, TrendingStock } from "@/lib/supabase/types";
import { HeroIllustration } from "./hero-illustration";
import { useTranslations, useLocalePath } from "@/lib/i18n-context";
import {
  m,
  Reveal,
  StaggerContainer,
  StaggerItem,
  fadeLeft,
  fadeLeftReduced,
  useIsReducedMotion,
} from "./motion";

type Props = {
  politicians: PoliticianWithStats[];
  trendingStocks: TrendingStock[];
};

export function Hero({ politicians, trendingStocks }: Props) {
  const { t } = useTranslations();
  const localePath = useLocalePath();
  const featuredPoliticians = politicians.slice(0, 4);
  const prefersReducedMotion = useIsReducedMotion();

  return (
    <section className="mx-auto max-w-6xl px-6">
      <div className="grid gap-8 py-12 lg:grid-cols-2 lg:gap-12 lg:py-20">
        {/* Left column - Content */}
        <div className="flex flex-col justify-center">
          {/* Eyebrow */}
          <Reveal>
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-primary">
              {t("hero.eyebrow")}
            </p>
          </Reveal>

          {/* Main headline */}
          <Reveal delay={0.05}>
            <h1 className="font-display text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl lg:text-[3.5rem]">
              {t("hero.title")}{" "}
              <em className="not-italic text-primary">{t("hero.titleHighlight")}</em>
              <br />
              {t("hero.titleEnd")}
            </h1>
          </Reveal>

          {/* Subhead */}
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
              {t("hero.subtitle")}
            </p>
          </Reveal>

          {/* Search bar */}
          <Reveal delay={0.15}>
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
          </Reveal>

          {/* Trending Politicians */}
          <div className="mt-8">
            <Reveal delay={0.2}>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {t("hero.trendingNow")}
              </p>
            </Reveal>
            <StaggerContainer className="flex flex-wrap gap-2">
              {featuredPoliticians.map((politician) => (
                <StaggerItem key={politician.id}>
                  <Link
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
                        {formatDisplayName(politician.name)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {politician.party === "D" ? "Dem" : politician.party === "R" ? "Rep" : "Ind"} · {politician.chamber ?? ""}
                      </p>
                    </div>
                  </Link>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>

          {/* CTA */}
          <Reveal delay={0.25}>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <m.div
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.12 }}
              >
                <Link
                  href={localePath("/app")}
                  className="inline-flex items-center justify-center gap-2 bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
                >
                  {t("hero.startTrial")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </m.div>
              <Link
                href={localePath("/app/feed")}
                className="editorial-link inline-flex items-center gap-2 px-2 text-sm font-medium"
              >
                {t("hero.viewLiveFeed")}
              </Link>
            </div>
          </Reveal>
        </div>

        {/* Right column - Illustration */}
        <m.div
          className="hidden lg:block"
          initial="hidden"
          animate="visible"
          variants={prefersReducedMotion ? fadeLeftReduced : fadeLeft}
          transition={{ delay: 0.2 }}
        >
          <HeroIllustration />
        </m.div>
      </div>

      {/* Bottom stats row - visible on all screens */}
      <Reveal>
        <div className="border-t border-border py-6">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {/* Most traded stocks */}
            {trendingStocks.slice(0, 4).map((stock) => (
              <Link
                key={stock.ticker}
                href={localePath(`/stock/${stock.ticker}`)}
                className="group flex items-center justify-between"
              >
                <div>
                  <span className="font-mono text-lg font-bold group-hover:text-primary">{stock.ticker}</span>
                  <p className="text-xs text-muted-foreground">{stock.trade_count} {t("hero.tradesThisWeek")}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Bottom rule */}
      <div className="editorial-rule-thin" />
    </section>
  );
}
