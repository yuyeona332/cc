import { NextResponse } from "next/server";
import { assignDailyMissions } from "@/lib/missions/assign";
import { isLocal } from "@/lib/runtime/mode";

export const runtime = "nodejs";

/**
 * Daily cron — assigns one mission per active user.
 *
 * Schedule lives in vercel.ts (`0 0 * * *`). Vercel signs cron requests
 * with an `Authorization: Bearer <CRON_SECRET>` header; we verify that
 * header rather than relying on Clerk auth (cron is system-level).
 *
 * In local mode there is no cron — lazy assignment happens on first
 * visit in getTodayMission. This endpoint returns 200 with a no-op
 * result so health checks still pass.
 */
export async function GET(request: Request) {
  if (isLocal()) {
    return NextResponse.json({
      mode: "local",
      message: "cron disabled; lazy assignment runs on /today visit",
      usersConsidered: 0,
      assignmentsCreated: 0,
      skipped: [],
    });
  }

  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "CRON_SECRET not configured" },
      { status: 500 },
    );
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  const result = await assignDailyMissions({ forDate: today });
  return NextResponse.json(result);
}
