"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useTranslations, useLocalePath } from "@/lib/i18n-context";
import { cn } from "@/lib/utils";

export function Header() {
  const { t } = useTranslations();
  const localePath = useLocalePath();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-foreground/10 bg-background transition-shadow duration-300",
        isScrolled && "shadow-sm border-b-border"
      )}
    >
      {/* Top bar - minimal */}
      <div className="border-b border-border">
        <div className="mx-auto flex h-10 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>{t("header.tagline")}</span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">{t("header.updatedLive")}</span>
          </div>
          <LanguageSwitcher />
        </div>
      </div>

      {/* Main header */}
      <div className="mx-auto max-w-6xl px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo - editorial style */}
          <Link href={localePath("/")} className="group">
            <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
              Politi<span className="text-primary">Trades</span>
            </h1>
          </Link>

          {/* Nav - minimal */}
          <nav className="hidden items-center gap-8 md:flex">
            <Link
              href={localePath("/app/feed")}
              className="editorial-link text-sm"
            >
              {t("header.liveFeed")}
            </Link>
            <Link
              href={localePath("/app/politicians")}
              className="editorial-link text-sm"
            >
              {t("header.politicians")}
            </Link>
            <Link
              href="#pricing"
              className="editorial-link text-sm"
            >
              {t("header.subscribe")}
            </Link>
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="hidden text-sm sm:flex">
              {t("common.login")}
            </Button>
            <Button size="sm" className="text-sm">
              {t("common.subscribe")}
            </Button>
          </div>
        </div>
      </div>

      {/* Thick rule - FT signature */}
      <div className="editorial-rule mx-auto max-w-6xl" />
    </header>
  );
}
