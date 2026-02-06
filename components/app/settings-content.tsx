"use client";

import { useState, useEffect, useTransition } from "react";
import { LogOut, Trash2, ShieldCheck } from "lucide-react";
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
import type { User } from "@supabase/supabase-js";

export function SettingsContent() {
  const { t } = useTranslations();
  const locale = useLocale();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPending, startTransition] = useTransition();

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
          .then(({ data }) => setIsAdmin(data?.is_admin === true));
      }
    });
  }, []);

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
