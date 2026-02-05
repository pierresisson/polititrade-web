"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function signInWithGoogle(locale: string) {
  const supabase = await createClient();
  const headerStore = await headers();
  const origin = headerStore.get("origin") || headerStore.get("x-forwarded-host") || headerStore.get("host") || "";
  const protocol = headerStore.get("x-forwarded-proto") || "https";
  const baseUrl = origin.startsWith("http") ? origin : `${protocol}://${origin}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${baseUrl}/auth/callback?next=/${locale}`,
    },
  });

  if (error) {
    redirect(`/${locale}/auth/error`);
  }

  if (data.url) {
    redirect(data.url);
  }
}

export async function signOut(locale: string) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(`/${locale}`);
}
