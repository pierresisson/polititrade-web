"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { stripLocaleFromPathname, buildLocalePath } from "@/lib/i18n";
import { useLocale } from "@/lib/i18n-context";

export function LanguageSwitcher() {
  const pathname = usePathname();
  const currentLocale = useLocale();
  const pathWithoutLocale = stripLocaleFromPathname(pathname);

  // Build new paths
  const enPath = buildLocalePath(pathWithoutLocale, "en");
  const frPath = buildLocalePath(pathWithoutLocale, "fr");

  return (
    <div className="flex items-center gap-2">
      <Link
        href={enPath}
        className={`text-xs transition-colors hover:text-foreground ${
          currentLocale === "en" ? "font-medium text-foreground" : "text-muted-foreground"
        }`}
      >
        EN
      </Link>
      <span className="text-muted-foreground">/</span>
      <Link
        href={frPath}
        className={`text-xs transition-colors hover:text-foreground ${
          currentLocale === "fr" ? "font-medium text-foreground" : "text-muted-foreground"
        }`}
      >
        FR
      </Link>
    </div>
  );
}
