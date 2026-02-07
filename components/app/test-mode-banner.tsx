"use client";

import { useRouter } from "next/navigation";
import { FlaskConical, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/lib/i18n-context";

export function TestModeBanner({ level }: { level: string }) {
  const { t } = useTranslations();
  const router = useRouter();

  async function handleDisable() {
    await fetch("/api/admin/test-mode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "auto" }),
    });
    router.refresh();
  }

  return (
    <div className="sticky top-0 z-50 flex items-center justify-center gap-3 bg-amber-100 px-4 py-1.5 text-sm font-medium text-amber-800 border-b border-amber-200">
      <FlaskConical className="h-3.5 w-3.5" />
      <span>
        {t("app.admin.testMode.bannerText").replace("{level}", level)}
      </span>
      <Button
        variant="ghost"
        size="sm"
        className="h-6 gap-1 px-2 text-xs text-amber-800 hover:bg-amber-200 hover:text-amber-900"
        onClick={handleDisable}
      >
        <X className="h-3 w-3" />
        {t("app.admin.testMode.disable")}
      </Button>
    </div>
  );
}
