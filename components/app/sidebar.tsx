"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Activity,
  Users,
  Bell,
  Settings,
  Star,
  TrendingUp,
} from "lucide-react";
import { useTranslations, useLocalePath } from "@/lib/i18n-context";
import { cn } from "@/lib/utils";

const navigation = [
  { key: "dashboard", href: "/app", icon: LayoutDashboard },
  { key: "feed", href: "/app/feed", icon: Activity },
  { key: "politicians", href: "/app/politicians", icon: Users },
  { key: "watchlist", href: "/app/watchlist", icon: Star },
  { key: "alerts", href: "/app/alerts", icon: Bell },
];

const secondaryNav = [
  { key: "settings", href: "/app/settings", icon: Settings },
];

export function AppSidebar() {
  const { t } = useTranslations();
  const localePath = useLocalePath();
  const pathname = usePathname();

  const isActive = (href: string) => {
    const fullPath = localePath(href);
    if (href === "/app") {
      return pathname === fullPath;
    }
    return pathname.startsWith(fullPath);
  };

  return (
    <aside className="hidden w-64 flex-col border-r border-border bg-card lg:flex">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-border px-6">
        <Link href={localePath("/")} className="font-display text-xl font-semibold">
          Politi<span className="text-primary">Trades</span>
        </Link>
      </div>

      {/* Main nav */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.key}
              href={localePath(item.href)}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {t(`app.nav.${item.key}`)}
            </Link>
          );
        })}
      </nav>

      {/* Secondary nav */}
      <div className="border-t border-border p-4">
        {secondaryNav.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.key}
              href={localePath(item.href)}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {t(`app.nav.${item.key}`)}
            </Link>
          );
        })}
      </div>

      {/* User / Pro badge */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3 rounded-md bg-primary/5 px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            PS
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Pierre S.</p>
            <p className="text-xs text-muted-foreground">Pro Plan</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
