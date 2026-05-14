import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getCurrentUserIdOrNull } from "@/lib/auth/current-user";
import { getDb } from "@/lib/db/client";
import { users, auditLog } from "@/lib/db/schema";

export const runtime = "nodejs";

/**
 * Account deletion endpoint.
 *
 * Soft-deletes the user immediately so the UI can confirm "데이터가
 * 삭제됐습니다" right away. A separate cron (Phase 2) hard-deletes
 * mission_logs / risk_events / blob photos 30 days later — that delay
 * is intentional, so a user who clicked by mistake can be restored by
 * support during the grace window. After the 30-day cron runs, the row
 * is permanently gone.
 */
export async function DELETE() {
  const userId = await getCurrentUserIdOrNull();
  if (!userId) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const db = await getDb();
  await db
    .update(users)
    .set({ deletedAt: new Date() })
    .where(eq(users.id, userId));

  await db.insert(auditLog).values({
    userId,
    eventType: "account_soft_deleted",
    metadata: { method: "self_serve" },
  });

  return NextResponse.json({ ok: true });
}
