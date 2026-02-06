"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Activity,
  Users,
  Bell,
  Star,
  Settings,
  LogOut,
  Trash2,
  ChevronsUpDown,
  Globe,
  Check,
} from "lucide-react";
import { useTranslations, useLocale, useLocalePath } from "@/lib/i18n-context";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { signOut, deleteAccount } from "@/lib/auth/actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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

const navigation = [
  { key: "dashboard", href: "/app", icon: LayoutDashboard },
  { key: "feed", href: "/app/feed", icon: Activity },
  { key: "politicians", href: "/app/politicians", icon: Users },
  { key: "watchlist", href: "/app/watchlist", icon: Star },
  { key: "alerts", href: "/app/alerts", icon: Bell },
];

export function AppSidebar() {
  const { t } = useTranslations();
  const locale = useLocale();
  const localePath = useLocalePath();
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const isActive = (href: string) => {
    const fullPath = localePath(href);
    if (href === "/app") {
      return pathname === fullPath;
    }
    return pathname.startsWith(fullPath);
  };

  const switchLocale = (newLocale: string) => {
    const segments = pathname.split("/").filter(Boolean);
    segments[0] = newLocale;
    router.push(`/${segments.join("/")}`);
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

      {/* User dropdown */}
      {user && (
        <div className="border-t border-border p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center gap-3 rounded-md bg-primary/5 px-3 py-2 text-left transition-colors hover:bg-primary/10">
                <Avatar>
                  <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user.user_metadata?.full_name || user.email}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
                <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-56">
              <DropdownMenuLabel>
                <span className="block text-sm font-medium text-foreground">
                  {user.user_metadata?.full_name || user.email}
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
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => {
                  startTransition(() => signOut(locale));
                }}
              >
                <LogOut className="h-4 w-4" />
                {t("auth.signOut")}
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
                {t("app.settings.deleteAccount")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("app.settings.deleteConfirmTitle")}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t("app.settings.deleteConfirmDescription")}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isPending}>
                  {t("app.settings.cancel")}
                </AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  disabled={isPending}
                  onClick={() => {
                    startTransition(() => deleteAccount(locale));
                  }}
                >
                  {isPending
                    ? t("app.settings.deleting")
                    : t("app.settings.deleteConfirmAction")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </aside>
  );
}
