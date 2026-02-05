"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useTranslations, useLocalePath, useLocale } from "@/lib/i18n-context";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { signInWithGoogle, signOut } from "@/lib/auth/actions";
import type { User } from "@supabase/supabase-js";

export function Header() {
  const { t } = useTranslations();
  const localePath = useLocalePath();
  const locale = useLocale();
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

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
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary">
                    <Avatar size="sm">
                      <AvatarImage
                        src={user.user_metadata?.avatar_url}
                        alt={user.user_metadata?.full_name || ""}
                      />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-foreground">
                        {user.user_metadata?.full_name || t("auth.myAccount")}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {user.email}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <form action={() => signOut(locale)}>
                    <DropdownMenuItem asChild>
                      <button type="submit" className="w-full cursor-pointer">
                        <LogOut className="mr-2 size-4" />
                        {t("auth.signOut")}
                      </button>
                    </DropdownMenuItem>
                  </form>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <form action={() => signInWithGoogle(locale)}>
                  <Button
                    type="submit"
                    variant="ghost"
                    size="sm"
                    className="hidden text-sm sm:flex"
                    disabled={loading}
                  >
                    {loading ? t("auth.signingIn") : t("common.login")}
                  </Button>
                </form>
                <Button size="sm" className="text-sm">
                  {t("common.subscribe")}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Thick rule - FT signature */}
      <div className="editorial-rule mx-auto max-w-6xl" />
    </header>
  );
}
