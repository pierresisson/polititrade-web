"use client";

import { Button } from "@/components/ui/button";
import { Bell, ExternalLink } from "lucide-react";
import { getInitials, getPartyColor, getPartyBgColor, formatDisplayName } from "@/lib/helpers";
import { useTranslations } from "@/lib/i18n-context";
import type { PoliticianWithStats } from "@/lib/supabase/types";

type Props = {
  politician: PoliticianWithStats;
};

export function PoliticianProfile({ politician }: Props) {
  const { t } = useTranslations();

  return (
    <section className="mx-auto max-w-6xl px-6 py-8 lg:py-12">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        {/* Left: Avatar + Info */}
        <div className="flex items-start gap-5">
          {/* Large avatar */}
          <div
            className={`flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold sm:h-24 sm:w-24 sm:text-3xl ${getPartyBgColor(politician.party)} ${getPartyColor(politician.party)}`}
          >
            {getInitials(politician.name)}
          </div>

          {/* Info */}
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              {formatDisplayName(politician.name)}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              {/* Party badge */}
              <span
                className={`inline-block rounded px-2.5 py-1 text-sm font-medium ${
                  politician.party === "D"
                    ? "bg-blue-100 text-blue-700"
                    : politician.party === "R"
                    ? "bg-red-100 text-red-700"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {politician.party === "D" ? t("politicians.democrat") : politician.party === "R" ? t("politicians.republican") : "Independent"}
              </span>
              {/* Chamber */}
              <span className="text-muted-foreground">
                {politician.chamber === "House" ? t("politicians.house") : politician.chamber === "Senate" ? t("politicians.senate") : "—"}
              </span>
              {/* State */}
              <span className="text-muted-foreground">
                {politician.state ?? ""}
              </span>
            </div>
            <p className="mt-3 text-muted-foreground">
              {t("politicianDetail.memberOf")} {politician.chamber === "House" ? t("politicians.house") : politician.chamber === "Senate" ? t("politicians.senate") : "—"}
              {politician.chamber === "House" && politician.state ? ` · ${politician.state}` : ""}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Bell className="h-4 w-4" />
            {t("common.follow")}
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <ExternalLink className="h-4 w-4" />
            {t("politicianDetail.officialPage")}
          </Button>
        </div>
      </div>
    </section>
  );
}
