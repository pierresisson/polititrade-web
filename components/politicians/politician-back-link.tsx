"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useTranslations, useLocalePath } from "@/lib/i18n-context";

export function PoliticianBackLink() {
  const { t } = useTranslations();
  const localePath = useLocalePath();

  return (
    <Link
      href={localePath("/politicians")}
      className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft className="h-4 w-4" />
      {t("politicians.allPoliticians")}
    </Link>
  );
}
