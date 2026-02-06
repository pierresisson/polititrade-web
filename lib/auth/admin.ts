import { NextResponse } from "next/server";
import { getUserAccessLevel } from "@/lib/auth";

export async function requireAdmin() {
  const { user, isAdmin } = await getUserAccessLevel();

  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  if (!isAdmin) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { user };
}
