import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/lib/i18n-context";

type Props = {
  description: string;
  variant?: "inline" | "card";
  className?: string;
};

export function PremiumLockedOverlay({
  description,
  variant = "card",
  className,
}: Props) {
  const { t } = useTranslations();

  if (variant === "inline") {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-lg border border-dashed border-border bg-secondary/30 px-4 py-3",
          className,
        )}
      >
        <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">{description}</span>
        <a
          href="#pricing"
          className="ml-auto shrink-0 rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {t("premium.unlock")}
        </a>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-secondary/30 py-12",
        className,
      )}
    >
      <Lock className="h-5 w-5 text-muted-foreground" />
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">
          {t("premium.locked")}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <a
        href="#pricing"
        className="mt-1 rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        {t("premium.unlock")}
      </a>
    </div>
  );
}
