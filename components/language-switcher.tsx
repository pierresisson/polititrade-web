"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export function LanguageSwitcher() {
  const pathname = usePathname();

  // Extract current locale and path without locale
  const segments = pathname.split("/").filter(Boolean);
  const currentLocale = segments[0];
  const pathWithoutLocale = segments.slice(1).join("/");

  // Build new paths
  const enPath = `/en${pathWithoutLocale ? `/${pathWithoutLocale}` : ""}`;
  const frPath = `/fr${pathWithoutLocale ? `/${pathWithoutLocale}` : ""}`;

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
