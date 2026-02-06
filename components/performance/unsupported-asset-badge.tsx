"use client";

import { useTranslations } from "@/lib/i18n-context";

type Props = {
  reason: "options" | "no_ticker";
};

export function UnsupportedAssetBadge({ reason }: Props) {
  const { t } = useTranslations();

  const label =
    reason === "options"
      ? t("performance.optionsNotSupported")
      : t("performance.tickerNotRecognized");

  return (
    <span className="inline-block rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
      {label}
    </span>
  );
}
