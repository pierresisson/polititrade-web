"use client";

import { useTranslations } from "@/lib/i18n-context";

type Props = {
  showEstimatedWarning?: boolean;
  className?: string;
};

export function PerformanceDisclaimer({ showEstimatedWarning, className }: Props) {
  const { t } = useTranslations();

  return (
    <div className={className}>
      <p className="text-xs text-muted-foreground">
        {t("performance.disclaimer")}
      </p>
      {showEstimatedWarning && (
        <p className="mt-1 text-xs text-muted-foreground">
          {t("performance.disclaimerEstimated")}
        </p>
      )}
    </div>
  );
}
