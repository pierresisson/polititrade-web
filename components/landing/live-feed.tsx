"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { getPartyColor, formatAmountRange, getDaysAgo } from "@/lib/helpers";
import type { TradeWithPolitician } from "@/lib/supabase/types";
import { useTranslations, useLocalePath } from "@/lib/i18n-context";
import {
  m,
  Reveal,
  fadeUp,
  fadeUpReduced,
  staggerFast,
  useIsReducedMotion,
} from "./motion";

type Props = {
  trades: TradeWithPolitician[];
};

export function LiveFeed({ trades }: Props) {
  const { t } = useTranslations();
  const localePath = useLocalePath();
  const [showAll, setShowAll] = useState(false);
  const displayed = showAll ? trades : trades.slice(0, 5);
  const prefersReducedMotion = useIsReducedMotion();

  const formatDaysAgo = (days: number) => {
    if (days === 0) return t("liveFeed.today");
    if (days === 1) return t("liveFeed.yesterday");
    return `${days}${t("liveFeed.daysAgo")}`;
  };

  return (
    <section id="feed" className="mx-auto max-w-6xl px-6 py-16 lg:py-24">
      {/* Section header */}
      <div className="mb-8 flex items-end justify-between">
        <Reveal>
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-primary">
              {t("liveFeed.eyebrow")}
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">
              {t("liveFeed.title")}
            </h2>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <Link
            href={localePath("/transactions")}
            className="editorial-link hidden text-sm font-medium sm:inline"
          >
            {t("liveFeed.viewAll")}
          </Link>
        </Reveal>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-foreground">
              <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider">
                {t("liveFeed.member")}
              </th>
              <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider">
                {t("liveFeed.stock")}
              </th>
              <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider">
                {t("liveFeed.type")}
              </th>
              <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider">
                {t("liveFeed.amount")}
              </th>
              <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider">
                {t("liveFeed.filed")}
              </th>
            </tr>
          </thead>
          <m.tbody
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerFast}
          >
            {displayed.map((tx) => {
              const party = tx.politicians?.party ?? null;
              const state = tx.politicians?.state ?? "";
              const tradeType = tx.trade_type as "buy" | "sell" | null;

              return (
                <m.tr
                  key={tx.id}
                  className="group cursor-pointer border-b border-border transition-colors hover:bg-secondary/50"
                  variants={prefersReducedMotion ? fadeUpReduced : fadeUp}
                >
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium group-hover:text-primary">
                        {tx.politicians?.name ?? tx.person_name}
                      </span>
                      <span className={`text-xs font-medium ${getPartyColor(party)}`}>
                        {party ? `${party}-${state}` : state}
                      </span>
                    </div>
                  </td>
                  <td className="py-4">
                    <div>
                      <span className="font-mono font-semibold">{tx.ticker ?? "—"}</span>
                      <p className="text-sm text-muted-foreground">{tx.asset_name ?? ""}</p>
                    </div>
                  </td>
                  <td className="py-4">
                    <span
                      className={`inline-flex items-center gap-1 text-sm font-medium ${
                        tradeType === "buy" ? "text-success" : tradeType === "sell" ? "text-destructive" : "text-muted-foreground"
                      }`}
                    >
                      {tradeType === "buy" ? (
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      ) : tradeType === "sell" ? (
                        <ArrowDownRight className="h-3.5 w-3.5" />
                      ) : null}
                      {tradeType === "buy" ? t("liveFeed.buy") : tradeType === "sell" ? t("liveFeed.sell") : tx.trade_type ?? "—"}
                    </span>
                  </td>
                  <td className="py-4">
                    <span className="font-mono text-sm">{formatAmountRange(tx.amount_min, tx.amount_max)}</span>
                  </td>
                  <td className="py-4 text-right">
                    <span className="text-sm text-muted-foreground">
                      {formatDaysAgo(getDaysAgo(tx.disclosure_date ?? tx.trade_date))}
                    </span>
                  </td>
                </m.tr>
              );
            })}
          </m.tbody>
        </table>
      </div>

      {/* Load more */}
      {!showAll && trades.length > 5 && (
        <Reveal>
          <button
            onClick={() => setShowAll(true)}
            className="mt-6 text-sm font-medium text-primary hover:underline"
          >
            {t("common.showMore")}
          </button>
        </Reveal>
      )}

      {/* Mobile CTA */}
      <Reveal>
        <Link
          href={localePath("/transactions")}
          className="mt-6 block text-sm font-medium text-primary hover:underline sm:hidden"
        >
          {t("liveFeed.viewAll")} →
        </Link>
      </Reveal>
    </section>
  );
}
