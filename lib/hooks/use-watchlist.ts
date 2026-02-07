"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";

export type WatchlistItem = {
  id: string;
  user_id: string;
  entity_type: "person" | "asset";
  entity_id: string;
  created_at: string;
  enriched: {
    name?: string;
    party?: string | null;
    chamber?: string | null;
    state?: string | null;
    asset_name?: string | null;
    trade_count?: number;
  } | null;
};

type WatchlistData = {
  items: WatchlistItem[];
  counts: { person: number; asset: number };
  limit: number | null;
};

export function useWatchlist(accessLevel: string) {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [counts, setCounts] = useState<{ person: number; asset: number }>({ person: 0, asset: 0 });
  const [limit, setLimit] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const fetchedRef = useRef(false);

  const isGuest = accessLevel === "guest";

  const fetchItems = useCallback(async () => {
    if (isGuest) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/watchlist");
      if (!res.ok) throw new Error("Failed to fetch watchlist");
      const data: WatchlistData = await res.json();
      setItems(data.items);
      setCounts(data.counts);
      setLimit(data.limit);
    } catch {
      // Silently fail — items stay empty
    } finally {
      setIsLoading(false);
    }
  }, [isGuest]);

  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetchItems();
    }
  }, [fetchItems]);

  const isFollowing = useCallback(
    (entityType: string, entityId: string) => {
      return items.some(
        (item) => item.entity_type === entityType && item.entity_id === entityId
      );
    },
    [items]
  );

  const getItemByEntity = useCallback(
    (entityType: string, entityId: string) => {
      return items.find(
        (item) => item.entity_type === entityType && item.entity_id === entityId
      );
    },
    [items]
  );

  const toggle = useCallback(
    async (entityType: "person" | "asset", entityId: string, t: (key: string) => string) => {
      if (isGuest) return;

      const existing = getItemByEntity(entityType, entityId);

      if (existing) {
        // Optimistic remove
        setItems((prev) => prev.filter((i) => i.id !== existing.id));
        setCounts((prev) => ({
          ...prev,
          [entityType]: prev[entityType] - 1,
        }));

        try {
          const res = await fetch(`/api/watchlist/${existing.id}`, {
            method: "DELETE",
          });
          if (!res.ok) throw new Error();
          toast.success(t("app.watchlist.removed"));
        } catch {
          // Revert
          setItems((prev) => [...prev, existing]);
          setCounts((prev) => ({
            ...prev,
            [entityType]: prev[entityType] + 1,
          }));
        }
      } else {
        // Optimistic add
        const tempItem: WatchlistItem = {
          id: `temp-${Date.now()}`,
          user_id: "",
          entity_type: entityType,
          entity_id: entityId,
          created_at: new Date().toISOString(),
          enriched: null,
        };
        setItems((prev) => [tempItem, ...prev]);
        setCounts((prev) => ({
          ...prev,
          [entityType]: prev[entityType] + 1,
        }));

        try {
          const res = await fetch("/api/watchlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ entity_type: entityType, entity_id: entityId }),
          });

          if (res.status === 403) {
            const data = await res.json();
            if (data.error === "limit_reached") {
              toast.error(
                t("app.watchlist.limitReached").replace("{limit}", String(data.limit))
              );
              // Revert
              setItems((prev) => prev.filter((i) => i.id !== tempItem.id));
              setCounts((prev) => ({
                ...prev,
                [entityType]: prev[entityType] - 1,
              }));
              return;
            }
          }

          if (!res.ok) throw new Error();

          const { item } = await res.json();
          // Replace temp item with real one
          setItems((prev) =>
            prev.map((i) => (i.id === tempItem.id ? { ...item, enriched: null } : i))
          );
          toast.success(t("app.watchlist.added"));
        } catch {
          // Revert
          setItems((prev) => prev.filter((i) => i.id !== tempItem.id));
          setCounts((prev) => ({
            ...prev,
            [entityType]: prev[entityType] - 1,
          }));
        }
      }
    },
    [isGuest, getItemByEntity]
  );

  const remove = useCallback(
    async (id: string, t: (key: string) => string) => {
      const item = items.find((i) => i.id === id);
      if (!item) return;

      // Optimistic remove
      setItems((prev) => prev.filter((i) => i.id !== id));
      setCounts((prev) => ({
        ...prev,
        [item.entity_type]: prev[item.entity_type] - 1,
      }));

      try {
        const res = await fetch(`/api/watchlist/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error();
        toast.success(t("app.watchlist.removed"));
      } catch {
        // Revert
        setItems((prev) => [...prev, item]);
        setCounts((prev) => ({
          ...prev,
          [item.entity_type]: prev[item.entity_type] + 1,
        }));
      }
    },
    [items]
  );

  return {
    items,
    counts,
    limit,
    isLoading,
    isFollowing,
    toggle,
    remove,
    refetch: fetchItems,
  };
}
