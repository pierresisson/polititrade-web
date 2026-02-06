"use client";

import Link from "next/link";
import { ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations, useLocalePath } from "@/lib/i18n-context";

export function AccessDenied() {
  const { t } = useTranslations();
  const localePath = useLocalePath();

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
      <ShieldX className="h-16 w-16 text-muted-foreground" />
      <h1 className="font-display text-2xl font-semibold">
        {t("app.admin.accessDenied")}
      </h1>
      <p className="text-muted-foreground">
        {t("app.admin.accessDeniedDescription")}
      </p>
      <Button asChild variant="outline">
        <Link href={localePath("/app")}>
          {t("app.admin.backToDashboard")}
        </Link>
      </Button>
    </div>
  );
}
