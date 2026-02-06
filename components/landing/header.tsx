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
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { LogOut, Menu } from "lucide-react";
import { useTranslations, useLocalePath, useLocale } from "@/lib/i18n-context";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { signInWithGoogle, signOut } from "@/lib/auth/actions";
import type { User } from "@supabase/supabase-js";

const NAV_LINKS = [
  { key: "header.liveFeed", href: "/app/feed" },
  { key: "header.politicians", href: "/app/politicians" },
  { key: "header.subscribe", href: "#pricing", isAnchor: true },
] as const;

export function Header() {
  const { t } = useTranslations();
  const localePath = useLocalePath();
  const locale = useLocale();
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Scroll detection — passive listener, threshold at 8px
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Auth state
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
        "sticky top-0 z-50 w-full",
        // Transition: bg, shadow, border, backdrop — 200ms premium ease
        "transition-[background-color,box-shadow,border-color,backdrop-filter] duration-200",
        "ease-[cubic-bezier(0.16,1,0.3,1)]",
        "motion-reduce:transition-none",
        // Scrolled = glass blur + hairline + subtle shadow
        isScrolled
          ? [
              "bg-background/80 backdrop-blur-xl",
              "border-b border-border/50",
              "shadow-[0_1px_2px_0_rgba(0,0,0,0.03),0_1px_6px_-1px_rgba(0,0,0,0.02)]",
              // Fallback for no backdrop-filter support
              "supports-[not(backdrop-filter)]:bg-background",
            ]
          : "bg-transparent border-b border-transparent"
      )}
    >
      <div className="mx-auto max-w-6xl px-6">
        <div
          className={cn(
            "flex items-center justify-between",
            // Height transition: 64px → 56px
            "transition-[height] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]",
            "motion-reduce:transition-none",
            isScrolled ? "h-14" : "h-16"
          )}
        >
          {/* ─── Logo ─── */}
          <Link
            href={localePath("/")}
            className="group shrink-0 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <span
              className={cn(
                "font-display font-semibold tracking-tight block",
                "transition-[font-size] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]",
                "motion-reduce:transition-none",
                isScrolled ? "text-xl md:text-2xl" : "text-2xl md:text-3xl"
              )}
            >
              Politi<span className="text-primary">Trades</span>
            </span>
          </Link>

          {/* ─── Desktop nav ─── */}
          <nav
            className="hidden items-center gap-1 md:flex"
            aria-label="Main navigation"
          >
            {NAV_LINKS.map(({ key, href, isAnchor }) => (
              <Link
                key={key}
                href={isAnchor ? href : localePath(href)}
                className={cn(
                  "relative px-3 py-1.5 text-sm font-medium",
                  "text-muted-foreground rounded-md",
                  "transition-colors duration-150",
                  "hover:text-foreground hover:bg-foreground/[0.04]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                )}
              >
                {t(key)}
              </Link>
            ))}
          </nav>

          {/* ─── Actions ─── */}
          <div className="flex items-center gap-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
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

            {/* ─── Mobile burger ─── */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="md:hidden"
                  aria-label="Open menu"
                >
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 p-0">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <div className="flex h-full flex-col">
                  {/* Sheet header */}
                  <div className="flex h-16 items-center border-b border-border px-6">
                    <span className="font-display text-xl font-semibold tracking-tight">
                      Politi<span className="text-primary">Trades</span>
                    </span>
                  </div>

                  {/* Sheet nav links */}
                  <nav className="flex flex-col gap-1 p-4" aria-label="Mobile navigation">
                    {NAV_LINKS.map(({ key, href, isAnchor }) => (
                      <Link
                        key={key}
                        href={isAnchor ? href : localePath(href)}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "rounded-md px-3 py-2.5 text-sm font-medium text-foreground",
                          "transition-colors duration-150",
                          "hover:bg-muted active:bg-muted",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        )}
                      >
                        {t(key)}
                      </Link>
                    ))}
                  </nav>

                  {/* Sheet footer — auth actions */}
                  <div className="mt-auto border-t border-border p-4">
                    {user ? (
                      <div className="flex items-center gap-3">
                        <Avatar size="sm">
                          <AvatarImage
                            src={user.user_metadata?.avatar_url}
                            alt={user.user_metadata?.full_name || ""}
                          />
                          <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">
                            {user.user_metadata?.full_name}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                        <form action={() => signOut(locale)}>
                          <Button type="submit" variant="ghost" size="icon-sm">
                            <LogOut className="size-4" />
                          </Button>
                        </form>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <form action={() => signInWithGoogle(locale)}>
                          <Button
                            type="submit"
                            variant="outline"
                            className="w-full"
                            disabled={loading}
                          >
                            {loading ? t("auth.signingIn") : t("common.login")}
                          </Button>
                        </form>
                        <Button className="w-full" onClick={() => setMobileOpen(false)}>
                          {t("common.subscribe")}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
