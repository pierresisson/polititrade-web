"use client";

import { createContext, useContext, ReactNode } from "react";
import { usePathname } from "next/navigation";

// Type for the dictionary
type Dictionary = Record<string, unknown>;

const I18nContext = createContext<Dictionary | null>(null);

export function I18nProvider({
  children,
  dictionary,
}: {
  children: ReactNode;
  dictionary: Dictionary;
}) {
  return (
    <I18nContext.Provider value={dictionary}>{children}</I18nContext.Provider>
  );
}

export function useTranslations() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useTranslations must be used within an I18nProvider");
  }

  // Helper function to get nested values
  const t = (key: string): string => {
    const keys = key.split(".");
    let value: unknown = context;
    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        return key; // Return key if not found
      }
    }
    return typeof value === "string" ? value : key;
  };

  // Get a section of the dictionary (supports nested paths like "faq.questions")
  const getSection = <T,>(path: string): T => {
    const keys = path.split(".");
    let value: unknown = context;
    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        return {} as T; // Return empty object if not found
      }
    }
    return (value as T) || ({} as T);
  };

  return { t, getSection, dictionary: context };
}

// Hook to get current locale from pathname
export function useLocale() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  return segments[0] || "en";
}

// Helper to build localized paths
export function useLocalePath() {
  const locale = useLocale();
  return (path: string) => `/${locale}${path.startsWith("/") ? path : `/${path}`}`;
}
