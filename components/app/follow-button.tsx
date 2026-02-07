"use client";

import { useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTranslations, useLocale } from "@/lib/i18n-context";
import { useWatchlist } from "@/lib/hooks/use-watchlist";
import { signInWithGoogle } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";

type Props = {
  entityType: "person" | "asset";
  entityId: string;
  accessLevel: string;
  variant?: "default" | "compact";
  watchlist?: ReturnType<typeof useWatchlist>;
};

export function FollowButton({
  entityType,
  entityId,
  accessLevel,
  variant = "default",
  watchlist: externalWatchlist,
}: Props) {
  const { t } = useTranslations();
  const locale = useLocale();
  const internalWatchlist = useWatchlist(accessLevel);
  const wl = externalWatchlist ?? internalWatchlist;
  const [pending, setPending] = useState(false);

  const isGuest = accessLevel === "guest";
  const following = wl.isFollowing(entityType, entityId);

  async function handleToggle() {
    if (pending) return;
    setPending(true);
    try {
      await wl.toggle(entityType, entityId, t);
    } finally {
      setPending(false);
    }
  }

  if (isGuest) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          {variant === "compact" ? (
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Star className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="outline" size="sm" className="gap-2">
              <Star className="h-4 w-4" />
              {t("app.watchlist.watch")}
            </Button>
          )}
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("app.watchlist.signInPrompt")}</DialogTitle>
            <DialogDescription>
              {t("app.watchlist.signInDescription")}
            </DialogDescription>
          </DialogHeader>
          <form action={() => signInWithGoogle(locale)}>
            <Button type="submit" className="w-full">
              {t("app.watchlist.signIn")}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  if (variant === "compact") {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={handleToggle}
        disabled={pending}
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Star
            className={cn(
              "h-4 w-4",
              following && "fill-primary text-primary"
            )}
          />
        )}
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className={cn("gap-2", following && "border-primary/30 bg-primary/5")}
      onClick={handleToggle}
      disabled={pending}
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Star
          className={cn(
            "h-4 w-4",
            following && "fill-primary text-primary"
          )}
        />
      )}
      {following ? t("app.watchlist.watching") : t("app.watchlist.watch")}
    </Button>
  );
}
