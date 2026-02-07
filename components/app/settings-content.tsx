"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import { LogOut, Trash2, ShieldCheck, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useTranslations, useLocale } from "@/lib/i18n-context";
import { createClient } from "@/lib/supabase/client";
import { signOut, deleteAccount } from "@/lib/auth/actions";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

type TestMode = "auto" | "guest" | "account" | "premium";

function getCookie(name: string): string | undefined {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

export function SettingsContent() {
  const { t } = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [testMode, setTestMode] = useState<TestMode>("auto");

  const readTestMode = useCallback(() => {
    const cookie = getCookie("admin_test_mode") as TestMode | undefined;
    setTestMode(cookie && ["guest", "account", "premium"].includes(cookie) ? cookie : "auto");
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .single()
          .then(({ data }) => {
            setIsAdmin(data?.is_admin === true);
            if (data?.is_admin) readTestMode();
          });
      }
    });
  }, [readTestMode]);

  async function handleTestModeChange(mode: TestMode) {
    setTestMode(mode);
    await fetch("/api/admin/test-mode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode }),
    });
    router.refresh();
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          {t("app.settings.title")}
        </h1>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Account card */}
        <Card>
          <CardHeader>
            <CardTitle>{t("app.settings.account")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t("app.settings.email")}
              </label>
              <p className="mt-1 text-sm">{user?.email ?? "..."}</p>
            </div>
            {isAdmin && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("app.settings.role")}
                </label>
                <div className="mt-1">
                  <Badge variant="secondary" className="gap-1">
                    <ShieldCheck className="h-3 w-3" />
                    {t("app.admin.badge")}
                  </Badge>
                </div>
              </div>
            )}
            <Button
              variant="outline"
              onClick={() => startTransition(() => signOut(locale))}
              disabled={isPending}
            >
              <LogOut className="h-4 w-4" />
              {t("app.settings.signOut")}
            </Button>
          </CardContent>
        </Card>

        {/* Test mode card (admin only) */}
        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FlaskConical className="h-5 w-5" />
                {t("app.admin.testMode.title")}
              </CardTitle>
              <CardDescription>
                {t("app.admin.testMode.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {testMode !== "auto" && (
                <Badge variant="outline" className="border-amber-500 text-amber-600">
                  {t("app.admin.testMode.simulationActive")}
                </Badge>
              )}
              <div className="flex flex-wrap gap-2">
                {(["auto", "guest", "account", "premium"] as const).map((mode) => (
                  <Button
                    key={mode}
                    variant={testMode === mode ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleTestModeChange(mode)}
                  >
                    {t(`app.admin.testMode.${mode}`)}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Danger zone card */}
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-destructive">
              {t("app.settings.dangerZone")}
            </CardTitle>
            <CardDescription>
              {t("app.settings.deleteConfirmDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4" />
                  {t("app.settings.deleteAccount")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {t("app.settings.deleteConfirmTitle")}
                  </AlertDialogTitle>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
