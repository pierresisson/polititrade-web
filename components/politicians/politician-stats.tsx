"use client";

import { DollarSign, BarChart3, Briefcase } from "lucide-react";
import { useTranslations } from "@/lib/i18n-context";
import { formatVolume } from "@/lib/helpers";
import type { PoliticianWithStats } from "@/lib/supabase/types";

type Props = {
  politician: PoliticianWithStats;
};

export function PoliticianStats({ politician }: Props) {
  const { t } = useTranslations();

  const stats = [
    {
      label: t("politicianDetail.totalTrades"),
      value: politician.trade_count.toString(),
      subtext: t("politicianDetail.last12Months"),
      icon: BarChart3,
    },
    {
      label: t("politicianDetail.tradingVolume"),
      value: formatVolume(politician.volume),
      subtext: t("politicianDetail.disclosedAmount"),
      icon: DollarSign,
    },
    {
      label: t("politicians.topHolding"),
      value: politician.top_ticker ?? "—",
      subtext: t("politicianDetail.mostTradedStock"),
      icon: Briefcase,
      mono: true,
    },
  ];

  return (
    <section className="mx-auto max-w-6xl px-6 py-8 lg:py-12">
      <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {t("politicianDetail.tradingOverview")}
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="border border-border bg-card p-5"
          >
            <div className="flex items-start justify-between">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p
              className={`mt-2 text-3xl font-semibold ${stat.mono ? "font-mono" : "font-display"}`}
            >
              {stat.value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{stat.subtext}</p>
          </div>
        ))}
      </div>

    </section>
  );
}
