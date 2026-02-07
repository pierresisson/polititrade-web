"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Settings,
  ChevronsUpDown,
  Globe,
  Check,
  PanelLeft,
} from "lucide-react";
import { useTranslations, useLocale, useLocalePath } from "@/lib/i18n-context";
import { stripLocaleFromPathname, buildLocalePath } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/lib/sidebar-context";
import { navigationItems, adminNavigationItems } from "@/lib/command-items";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { User } from "@supabase/supabase-js";

function FlagGB({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 640 480" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 0h640v480H0z" fill="#012169" />
      <path d="m75 0 244 181L562 0h78v62L400 241l240 178v61h-80L320 301 81 480H0v-60l239-178L0 64V0h75z" fill="#fff" />
      <path d="m424 281 216 159v40L369 281h55zm-184 20 6 35L54 480H0l240-179zM640 0v3L391 191l2-44L590 0h50zM0 0l239 176h-60L0 42V0z" fill="#C8102E" />
      <path d="M241 0v480h160V0H241zM0 160v160h640V160H0z" fill="#fff" />
      <path d="M0 193v96h640v-96H0zM273 0v480h96V0h-96z" fill="#C8102E" />
    </svg>
  );
}

function FlagFR({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 640 480" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill="#002395" d="M0 0h213.3v480H0z" />
      <path fill="#fff" d="M213.3 0h213.4v480H213.3z" />
      <path fill="#ED2939" d="M426.7 0H640v480H426.7z" />
    </svg>
  );
}

const languages = [
  { code: "en", icon: FlagGB },
  { code: "fr", icon: FlagFR },
] as const;

/** Sidebar uses the first 5 items (excludes settings — shown in user menu) */
const navigation = navigationItems.filter((item) => item.labelKey !== "settings");

type AppSidebarProps = {
  user: User | null;
  isAdmin: boolean;
};

export function AppSidebar({ user, isAdmin }: AppSidebarProps) {
  const { t } = useTranslations();
  const locale = useLocale();
  const localePath = useLocalePath();
  const pathname = usePathname();
  const router = useRouter();
  const { collapsed, toggleCollapsed } = useSidebar();

  const isActive = (href: string) => {
    const fullPath = localePath(href);
    if (href === "/app") {
      return pathname === fullPath;
    }
    return pathname.startsWith(fullPath);
  };

  const switchLocale = (newLocale: string) => {
    const pathWithoutLocale = stripLocaleFromPathname(pathname);
    router.push(buildLocalePath(pathWithoutLocale, newLocale));
  };

  const userInitials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "hidden h-screen flex-col overflow-hidden border-r border-border bg-card lg:flex",
          "transition-[width] duration-200 ease-out motion-reduce:transition-none",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo + toggle button */}
        <div className="flex h-16 items-center border-b border-border px-4">
          <Link
            href={localePath("/")}
            className={cn(
              "font-display text-xl font-semibold whitespace-nowrap overflow-hidden",
              "transition-opacity duration-200 ease-out motion-reduce:transition-none",
              collapsed ? "opacity-0 w-0" : "opacity-100 flex-1"
            )}
          >
            Politi<span className="text-primary">Trades</span>
          </Link>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={toggleCollapsed}
                aria-label={collapsed ? t("app.sidebar.expand") : t("app.sidebar.collapse")}
                className={cn(
                  "flex items-center justify-center rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                  collapsed && "mx-auto"
                )}
              >
                <PanelLeft
                  className={cn(
                    "h-5 w-5 transition-transform duration-200 ease-out motion-reduce:transition-none",
                    collapsed && "rotate-180"
                  )}
                />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              {collapsed ? t("app.sidebar.expand") : t("app.sidebar.collapse")}
              <kbd className="ml-2 rounded border border-background/20 px-1 py-0.5 text-[10px]">
                ⌘B
              </kbd>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Main nav */}
        <nav className="flex-1 space-y-1 p-2">
          {navigation.map((item) => {
            const active = isActive(item.href);
            const link = (
              <Link
                key={item.labelKey}
                href={localePath(item.href)}
                className={cn(
                  "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  collapsed ? "justify-center" : "gap-3",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span
                  className={cn(
                    "whitespace-nowrap transition-opacity duration-200 ease-out motion-reduce:transition-none",
                    collapsed ? "sr-only" : "opacity-100"
                  )}
                >
                  {t(`app.nav.${item.labelKey}`)}
                </span>
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.labelKey}>
                  <TooltipTrigger asChild>{link}</TooltipTrigger>
                  <TooltipContent side="right" sideOffset={8}>
                    {t(`app.nav.${item.labelKey}`)}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return link;
          })}

          {isAdmin && (
            <>
              <div className="my-2 border-t border-border" />
              {adminNavigationItems.map((item) => {
                const active = isActive(item.href);
                const link = (
                  <Link
                    key={item.labelKey}
                    href={localePath(item.href)}
                    className={cn(
                      "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      collapsed ? "justify-center" : "gap-3",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span
                      className={cn(
                        "whitespace-nowrap transition-opacity duration-200 ease-out motion-reduce:transition-none",
                        collapsed ? "sr-only" : "opacity-100"
                      )}
                    >
                      {t(`app.nav.${item.labelKey}`)}
                    </span>
                  </Link>
                );

                if (collapsed) {
                  return (
                    <Tooltip key={item.labelKey}>
                      <TooltipTrigger asChild>{link}</TooltipTrigger>
                      <TooltipContent side="right" sideOffset={8}>
                        {t(`app.nav.${item.labelKey}`)}
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                return link;
              })}
            </>
          )}
        </nav>

        {/* User dropdown */}
        {user && (
          <div className="border-t border-border p-2">
            <Tooltip>
              <DropdownMenu>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={cn(
                        "flex w-full cursor-pointer items-center rounded-md bg-primary/5 transition-colors hover:bg-primary/10",
                        collapsed ? "justify-center p-2" : "gap-3 px-3 py-2 text-left"
                      )}
                    >
                      <Avatar className={cn(collapsed && "h-8 w-8")}>
                        <AvatarImage
                          src={user.user_metadata?.avatar_url}
                          alt={user.user_metadata?.full_name || ""}
                          referrerPolicy="no-referrer"
                        />
                        <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                      {!collapsed && (
                        <>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {user.user_metadata?.full_name || user.email}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {user.email}
                            </p>
                          </div>
                          <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                        </>
                      )}
                    </button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right" sideOffset={8}>
                    {user.user_metadata?.full_name || user.email}
                  </TooltipContent>
                )}
                <DropdownMenuContent side="top" align="start" className="w-56">
                  <DropdownMenuLabel>
                    <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                      {user.user_metadata?.full_name || user.email}
                      {isAdmin && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          {t("app.admin.badge")}
                        </Badge>
                      )}
                    </span>
                    <span className="block text-xs font-normal text-muted-foreground truncate">
                      {user.email}
                    </span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => router.push(localePath("/app/settings"))}>
                    <Settings className="h-4 w-4" />
                    {t("app.nav.settings")}
                  </DropdownMenuItem>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <Globe className="h-4 w-4" />
                      {t("app.language")}
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      {languages.map((lang) => (
                        <DropdownMenuItem
                          key={lang.code}
                          onSelect={() => switchLocale(lang.code)}
                        >
                          <lang.icon className="h-4 w-5 rounded-sm" />
                          {t(`app.languages.${lang.code}`)}
                          {locale === lang.code && (
                            <Check className="ml-auto h-4 w-4 text-primary" />
                          )}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                </DropdownMenuContent>
              </DropdownMenu>
            </Tooltip>
          </div>
        )}
      </aside>
    </TooltipProvider>
  );
}
