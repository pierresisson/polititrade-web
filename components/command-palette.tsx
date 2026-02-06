"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { User, TrendingUp, ArrowRight } from "lucide-react";
import { useTranslations, useLocalePath } from "@/lib/i18n-context";
import {
  navigationItems,
  actionItems,
  type SearchResult,
} from "@/lib/command-items";
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

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

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
    }
  }, [open]);

  // Debounced remote search
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    abortRef.current?.abort();

    if (query.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);

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

  const personResults = results.filter((r) => r.type === "person");
  const assetResults = results.filter((r) => r.type === "asset");
  const tradeResults = results.filter((r) => r.type === "trade");
  const hasRemoteResults =
    personResults.length > 0 || assetResults.length > 0 || tradeResults.length > 0;

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title={t("app.commandPalette.title")}
      description={t("app.commandPalette.description")}
    >
      <Command shouldFilter={!query || query.length < 2}>
        <CommandInput
          placeholder={t("app.commandPalette.placeholder")}
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>
            {loading
              ? t("app.commandPalette.searching")
              : t("app.commandPalette.noResults")}
          </CommandEmpty>

          {/* Navigation */}
          <CommandGroup heading={t("app.commandPalette.navigation")}>
            {navigationItems.map((item) => (
              <CommandItem
                key={item.labelKey}
                value={t(`app.nav.${item.labelKey}`)}
                onSelect={() => navigate(item.href)}
              >
                <item.icon className="h-4 w-4 text-muted-foreground" />
                <span>{t(`app.nav.${item.labelKey}`)}</span>
              </CommandItem>
            ))}
          </CommandGroup>

          {/* Remote results */}
          {hasRemoteResults && (
            <>
              <CommandSeparator />
              <CommandGroup heading={t("app.commandPalette.results")}>
                {personResults.map((r) => (
                  <CommandItem
                    key={r.id}
                    value={r.title}
                    onSelect={() => navigate(r.href)}
                  >
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div className="flex flex-col">
                      <span>{r.title}</span>
                      {r.subtitle && (
                        <span className="text-xs text-muted-foreground">
                          {r.subtitle}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
                {assetResults.map((r) => (
                  <CommandItem
                    key={r.id}
                    value={`${r.title} ${r.subtitle ?? ""}`}
                    onSelect={() => navigate(r.href)}
                  >
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <div className="flex flex-col">
                      <span className="font-medium">{r.title}</span>
                      {r.subtitle && (
                        <span className="text-xs text-muted-foreground">
                          {r.subtitle}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
                {tradeResults.map((r) => (
                  <CommandItem
                    key={r.id}
                    value={r.title}
                    onSelect={() => navigate(r.href)}
                  >
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <div className="flex flex-col">
                      <span>{r.title}</span>
                      {r.subtitle && (
                        <span className="text-xs text-muted-foreground capitalize">
                          {r.subtitle}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {/* Actions */}
          <CommandSeparator />
          <CommandGroup heading={t("app.commandPalette.actions")}>
            {actionItems.map((item) => (
              <CommandItem
                key={item.labelKey}
                value={t(`app.commandPalette.${item.labelKey}`)}
                onSelect={() => navigate(item.href)}
              >
                <item.icon className="h-4 w-4 text-muted-foreground" />
                <span>{t(`app.commandPalette.${item.labelKey}`)}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
