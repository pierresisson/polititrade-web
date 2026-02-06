import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getLocaleFromPathname, buildLocalePath } from "@/lib/i18n";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  // Validate redirect to prevent open redirects
  const redirectTo = next.startsWith("/") ? next : "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${redirectTo}`);
    }
  }

  // Auth error - redirect to error page
  const locale = getLocaleFromPathname(redirectTo);
  return NextResponse.redirect(`${origin}${buildLocalePath("/auth/error", locale)}`);
}
