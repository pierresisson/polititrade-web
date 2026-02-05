import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/en";

  // Validate redirect to prevent open redirects
  const redirectTo = next.startsWith("/") ? next : "/en";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${redirectTo}`);
    }
  }

  // Auth error - redirect to error page
  const locale = redirectTo.split("/")[1] || "en";
  return NextResponse.redirect(`${origin}/${locale}/auth/error`);
}
