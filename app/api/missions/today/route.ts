import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getTodayMission } from "@/lib/missions/today";

export const runtime = "nodejs";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const mission = await getTodayMission(userId);
  return NextResponse.json({ mission });
}
