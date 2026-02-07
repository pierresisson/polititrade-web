import { cache } from "react";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export type AccessLevel = "guest" | "account" | "premium";

/**
 * Per-request cached version — safe to call from layout + page
 * without hitting Supabase twice.
 */
export const getUserAccessLevel = cache(async function getUserAccessLevel() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { level: "guest" as AccessLevel, user: null, isAdmin: false, isSimulated: false };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_premium, is_admin")
    .eq("id", user.id)
    .single();

  const level: AccessLevel = profile?.is_premium ? "premium" : "account";
  const isAdmin: boolean = profile?.is_admin === true;

  if (isAdmin) {
    const cookieStore = await cookies();
    const testMode = cookieStore.get("admin_test_mode")?.value as AccessLevel | undefined;
    if (testMode && ["guest", "account", "premium"].includes(testMode)) {
      return { level: testMode, user, isAdmin, isSimulated: true };
    }
    return { level: "premium" as AccessLevel, user, isAdmin, isSimulated: false };
  }

  return { level, user, isAdmin: false, isSimulated: false };
});
