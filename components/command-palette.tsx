"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { User, TrendingUp, ArrowRight, Loader2, Search } from "lucide-react";
import { useTranslations, useLocalePath } from "@/lib/i18n-context";
import type { SearchResult } from "@/lib/command-items";
import {
  CommandDialog,
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";

const DEBOUNCE_MS = 250;

const iconByType: Record<string, typeof User> = {
  person: User,
  asset: TrendingUp,
  trade: ArrowRight,
};

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const { t } = useTranslations();
  const localePath = useLocalePath();
  const router = useRouter();

  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Global keyboard shortcut
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  // Reset state when closing
  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setLoading(false);
      setError(false);
    }
  }, [open]);

  // Debounced remote search
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    abortRef.current?.abort();

    if (query.length < 2) {
      setResults([]);
      setLoading(false);
      setError(false);
      return;
    }

    setLoading(true);
    setError(false);

    timerRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(query)}`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error("Search failed");
        const data = await res.json();
        setResults(data.results ?? []);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setResults([]);
          setError(true);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query]);

  const navigate = useCallback(
    (href: string) => {
      setOpen(false);
      router.push(localePath(href));
    },
    [router, localePath]
  );

  // Group results by type
  const personResults = results.filter((r) => r.type === "person");
  const assetResults = results.filter((r) => r.type === "asset");
  const tradeResults = results.filter((r) => r.type === "trade");

  const hasResults = results.length > 0;
  const isIdle = query.length < 2 && !loading;

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title={t("app.commandPalette.title")}
      description={t("app.commandPalette.description")}
    >
      <Command shouldFilter={false}>
        <CommandInput
          placeholder={t("app.commandPalette.placeholder")}
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {/* Idle state */}
          {isIdle && (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
              <Search className="h-4 w-4" />
              {t("app.commandPalette.idle")}
            </div>
          )}

          {/* Loading indicator */}
          {loading && (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("app.commandPalette.searching")}
            </div>
          )}

          {/* Error state */}
          {!loading && error && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              {t("app.commandPalette.error")}
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && !hasResults && query.length >= 2 && (
            <CommandEmpty>{t("app.commandPalette.noResults")}</CommandEmpty>
          )}

          {/* Results — grouped by type */}
          {personResults.length > 0 && (
            <CommandGroup heading={t("app.commandPalette.groupPerson")}>
              {personResults.map((r) => (
                <ResultItem key={r.id} result={r} onSelect={navigate} />
              ))}
            </CommandGroup>
          )}

          {assetResults.length > 0 && (
            <>
              {personResults.length > 0 && <CommandSeparator />}
              <CommandGroup heading={t("app.commandPalette.groupAsset")}>
                {assetResults.map((r) => (
                  <ResultItem key={r.id} result={r} onSelect={navigate} />
                ))}
              </CommandGroup>
            </>
          )}

          {tradeResults.length > 0 && (
            <>
              {(personResults.length > 0 || assetResults.length > 0) && (
                <CommandSeparator />
              )}
              <CommandGroup heading={t("app.commandPalette.groupTrade")}>
                {tradeResults.map((r) => (
                  <ResultItem key={r.id} result={r} onSelect={navigate} />
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}

function ResultItem({
  result,
  onSelect,
}: {
  result: SearchResult;
  onSelect: (href: string) => void;
}) {
  const Icon = iconByType[result.type] ?? ArrowRight;

  return (
    <CommandItem
      onSelect={() => result.href && onSelect(result.href)}
    >
      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
      <div className="flex flex-col min-w-0">
        <span className="truncate">{result.title}</span>
        {result.subtitle && (
          <span className="text-xs text-muted-foreground truncate">
            {result.subtitle}
          </span>
        )}
      </div>
    </CommandItem>
  );
}
