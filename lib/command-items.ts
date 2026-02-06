import {
  LayoutDashboard,
  Activity,
  Users,
  Star,
  Bell,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type SearchResultType = "person" | "asset" | "page" | "trade";

export interface SearchResult {
  type: SearchResultType;
  id: string;
  title: string;
  subtitle?: string;
  href: string;
}

export interface CommandNavItem {
  /** i18n key under app.nav */
  labelKey: string;
  href: string;
  icon: LucideIcon;
}

/** Navigation items — single source of truth shared with sidebar */
export const navigationItems: CommandNavItem[] = [
  { labelKey: "dashboard", href: "/app", icon: LayoutDashboard },
  { labelKey: "feed", href: "/app/feed", icon: Activity },
  { labelKey: "politicians", href: "/app/politicians", icon: Users },
  { labelKey: "watchlist", href: "/app/watchlist", icon: Star },
  { labelKey: "alerts", href: "/app/alerts", icon: Bell },
  { labelKey: "settings", href: "/app/settings", icon: Settings },
];

export interface CommandAction {
  /** i18n key under app.commandPalette */
  labelKey: string;
  href: string;
  icon: LucideIcon;
}

/** Quick actions */
export const actionItems: CommandAction[] = [
  { labelKey: "goToFeed", href: "/app/feed", icon: Activity },
  { labelKey: "openSettings", href: "/app/settings", icon: Settings },
];
