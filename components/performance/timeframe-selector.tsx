"use client";

import { Lock } from "lucide-react";
import { useTranslations } from "@/lib/i18n-context";
import type { Timeframe, AccessLevel } from "@/lib/supabase/types";
import { getAllowedTimeframes } from "@/lib/prices/access-control";

const ALL_TIMEFRAMES: Timeframe[] = ["1d", "1w", "1m", "3m", "6m", "1y", "to_date"];

type Props = {
  selected: Timeframe;
  onSelect: (tf: Timeframe) => void;
  accessLevel: AccessLevel;
};

export function TimeframeSelector({ selected, onSelect, accessLevel }: Props) {
  const { t } = useTranslations();
  const allowed = getAllowedTimeframes(accessLevel);

  return (
    <div className="flex items-center gap-1 border border-border">
      {ALL_TIMEFRAMES.map((tf) => {
        const isAllowed = allowed.includes(tf);
        const isActive = selected === tf;

        return (
          <button
            key={tf}
            onClick={() => isAllowed && onSelect(tf)}
            disabled={!isAllowed}
            className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium transition-colors ${
              isActive
                ? "bg-foreground text-background"
                : isAllowed
                ? "hover:bg-secondary"
                : "cursor-not-allowed text-muted-foreground/50"
            }`}
            title={!isAllowed ? t("performance.upgradeForTimeframes") : undefined}
          >
            {t(`performance.timeframes.${tf}`)}
            {!isAllowed && <Lock className="h-3 w-3" />}
          </button>
        );
      })}
    </div>
  );
}
