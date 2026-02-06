"use client";

import { Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/lib/i18n-context";

export function AppHeader() {
  const { t } = useTranslations();

  const openPalette = () => {
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", metaKey: true })
    );
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      {/* Mobile menu button */}
      <Button variant="ghost" size="icon" className="lg:hidden">
        <Menu className="h-5 w-5" />
      </Button>

      {/* Search — triggers command palette */}
      <div className="hidden flex-1 md:block md:max-w-md">
        <button
          type="button"
          onClick={openPalette}
          className="flex w-full items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary"
        >
          <Search className="h-4 w-4" />
          <span className="flex-1 text-left">
            {t("app.commandPalette.placeholder")}
          </span>
          <kbd className="pointer-events-none hidden rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-block">
            ⌘K
          </kbd>
        </button>
      </div>
    </header>
  );
}
