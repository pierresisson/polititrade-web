import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireAdmin } from "@/lib/auth/admin";

export async function POST(request: Request) {
  const result = await requireAdmin();
  if ("error" in result) return result.error;

  const { mode } = await request.json();

  if (!["guest", "account", "premium", "auto"].includes(mode)) {
    return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
  }

  const cookieStore = await cookies();

  if (mode === "auto") {
    cookieStore.delete("admin_test_mode");
  } else {
    cookieStore.set("admin_test_mode", mode, {
      httpOnly: false,
      sameSite: "strict",
      path: "/",
      maxAge: 86400,
    });
  }

  return NextResponse.json({ mode });
}
