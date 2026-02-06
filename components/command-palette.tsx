"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { User, TrendingUp, ArrowRight, Loader2 } from "lucide-react";
import { useTranslations, useLocalePath } from "@/lib/i18n-context";
import {
  navigationItems,
  actionItems,
  type SearchResult,
} from "@/lib/command-items";
import { politicians } from "@/lib/mock-data";
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

function matchesQuery(label: string, q: string) {
  return label.toLowerCase().includes(q.toLowerCase());
}

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

  // Local filtering — we handle it ourselves, cmdk shouldFilter={false}
  const filteredNav = useMemo(() => {
    if (!query) return navigationItems;
    return navigationItems.filter((item) =>
      matchesQuery(t(`app.nav.${item.labelKey}`), query)
    );
  }, [query, t]);

  const filteredActions = useMemo(() => {
    if (!query) return actionItems;
    return actionItems.filter((item) =>
      matchesQuery(t(`app.commandPalette.${item.labelKey}`), query)
    );
  }, [query, t]);

  // Local politician search (mock data — same source as the rest of the app)
  const filteredPoliticians = useMemo(() => {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase();
    return politicians.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.state.toLowerCase().includes(q) ||
        p.party.toLowerCase().includes(q)
    );
  }, [query]);

  const assetResults = results.filter((r) => r.type === "asset");
  const tradeResults = results.filter((r) => r.type === "trade");
  const hasResults =
    filteredPoliticians.length > 0 ||
    assetResults.length > 0 ||
    tradeResults.length > 0;

  const hasAnyResults =
    filteredNav.length > 0 || filteredActions.length > 0 || hasResults;

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
          {/* Loading indicator */}
          {loading && (
            <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("app.commandPalette.searching")}
            </div>
          )}

          {/* Empty state — only when not loading and nothing matches */}
          {!loading && !hasAnyResults && query.length > 0 && (
            <CommandEmpty>{t("app.commandPalette.noResults")}</CommandEmpty>
          )}

          {/* Navigation */}
          {filteredNav.length > 0 && (
            <CommandGroup heading={t("app.commandPalette.navigation")}>
              {filteredNav.map((item) => (
                <CommandItem
                  key={item.labelKey}
                  onSelect={() => navigate(item.href)}
                >
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                  <span>{t(`app.nav.${item.labelKey}`)}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Results — politicians (local mock) + assets/trades (remote) */}
          {hasResults && (
            <>
              <CommandSeparator />
              <CommandGroup heading={t("app.commandPalette.results")}>
                {filteredPoliticians.map((p) => (
                  <CommandItem
                    key={p.id}
                    onSelect={() => navigate(`/app/politician/${p.id}`)}
                  >
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div className="flex flex-col">
                      <span>{p.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {p.party} · {p.chamber} · {p.state}
                      </span>
                    </div>
                  </CommandItem>
                ))}
                {assetResults.map((r) => (
                  <CommandItem
                    key={r.id}
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
          {filteredActions.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading={t("app.commandPalette.actions")}>
                {filteredActions.map((item) => (
                  <CommandItem
                    key={item.labelKey}
                    onSelect={() => navigate(item.href)}
                  >
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                    <span>{t(`app.commandPalette.${item.labelKey}`)}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
