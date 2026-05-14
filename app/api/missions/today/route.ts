import { NextResponse } from "next/server";
import { getCurrentUserIdOrNull } from "@/lib/auth/current-user";
import { getTodayMission } from "@/lib/missions/today";

export const runtime = "nodejs";

export async function GET() {
  const userId = await getCurrentUserIdOrNull();
  if (!userId) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const mission = await getTodayMission(userId);
  return NextResponse.json({ mission });
}
