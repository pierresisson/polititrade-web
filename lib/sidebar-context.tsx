"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";

const STORAGE_KEY = "sidebar:collapsed";

function getSnapshot(): boolean {
  return localStorage.getItem(STORAGE_KEY) === "true";
}

function getServerSnapshot(): boolean {
  return false;
}

function subscribe(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

type SidebarContextValue = {
  collapsed: boolean;
  toggleCollapsed: () => void;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const collapsed = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggleCollapsed = useCallback(() => {
    const next = !getSnapshot();
    localStorage.setItem(STORAGE_KEY, String(next));
    // Dispatch storage event so useSyncExternalStore picks up the change
    window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
  }, []);

  // Keyboard shortcut: Cmd/Ctrl + B
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        // Skip if focus is in an input/textarea
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;

        e.preventDefault();
        toggleCollapsed();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [toggleCollapsed]);

  return (
    <SidebarContext.Provider value={{ collapsed, toggleCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within SidebarProvider");
  return ctx;
}
