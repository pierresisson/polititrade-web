import { createClient } from "@/lib/supabase/server";

type AccessLevel = "guest" | "account" | "premium";

export async function getUserAccessLevel() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { level: "guest" as AccessLevel, user: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_premium, is_admin")
    .eq("id", user.id)
    .single();

  const level: AccessLevel = profile?.is_premium ? "premium" : "account";
  const isAdmin: boolean = profile?.is_admin === true;

  return { level, user, isAdmin };
}
