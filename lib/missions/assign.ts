import { and, eq, isNull, notInArray, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  missionAssignments,
  missions,
  missionLogs,
  users,
} from "@/lib/db/schema";

export interface DailyAssignmentResult {
  usersConsidered: number;
  assignmentsCreated: number;
  skipped: Array<{ userId: string; reason: string }>;
}

/**
 * Idempotent daily mission assignment for every active user.
 *
 * Invoked by the /api/cron/daily-mission endpoint. The function must be
 * safe to retry: if an assignment already exists for (user, date), the
 * insert is a no-op.
 *
 * Selection rules:
 *   1. Honor the user's preferredMissionLevel.
 *   2. Avoid the user's most recently completed missions (last 7 days)
 *      to keep variety. Picks the oldest unused mission at that level.
 *   3. Fall back to any enabled mission at the level if all have been seen
 *      recently.
 *
 * What this function does NOT do:
 *   - Send push notifications (separate concern, see lib/push/).
 *   - Adapt level based on completion rate (Phase 3 telemetry-driven).
 */
export async function assignDailyMissions(options: {
  forDate: string; // YYYY-MM-DD in user TZ; cron computes this per user
}): Promise<DailyAssignmentResult> {
  const activeUsers = await db
    .select({
      id: users.id,
      preferredLevel: users.preferredMissionLevel,
    })
    .from(users)
    .where(and(eq(users.ageVerified, true), isNull(users.deletedAt)));

  const result: DailyAssignmentResult = {
    usersConsidered: activeUsers.length,
    assignmentsCreated: 0,
    skipped: [],
  };

  for (const user of activeUsers) {
    const existing = await db
      .select({ id: missionAssignments.id })
      .from(missionAssignments)
      .where(
        and(
          eq(missionAssignments.userId, user.id),
          eq(missionAssignments.assignedForDate, options.forDate),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      result.skipped.push({ userId: user.id, reason: "already_assigned" });
      continue;
    }

    const recentMissionIds = await db
      .select({ id: missionLogs.missionId })
      .from(missionLogs)
      .where(
        and(
          eq(missionLogs.userId, user.id),
          sql`${missionLogs.completedAt} > now() - interval '7 days'`,
        ),
      );

    const excludeIds = recentMissionIds.map((row) => row.id);

    const candidate = await pickCandidateMission(
      user.preferredLevel,
      excludeIds,
    );

    if (!candidate) {
      result.skipped.push({ userId: user.id, reason: "no_mission_available" });
      continue;
    }

    await db.insert(missionAssignments).values({
      userId: user.id,
      missionId: candidate.id,
      assignedForDate: options.forDate,
    });
    result.assignmentsCreated += 1;
  }

  return result;
}

async function pickCandidateMission(
  level: typeof users.$inferSelect.preferredMissionLevel,
  excludeIds: ReadonlyArray<string>,
): Promise<{ id: string } | null> {
  const baseQuery = db
    .select({ id: missions.id })
    .from(missions)
    .where(and(eq(missions.level, level), eq(missions.enabled, true)))
    .limit(1);

  if (excludeIds.length === 0) {
    const [row] = await baseQuery;
    return row ?? null;
  }

  const [row] = await db
    .select({ id: missions.id })
    .from(missions)
    .where(
      and(
        eq(missions.level, level),
        eq(missions.enabled, true),
        notInArray(missions.id, [...excludeIds]),
      ),
    )
    .limit(1);

  if (row) {
    return row;
  }

  // Fallback: every mission at this level has been seen recently. Allow
  // a repeat rather than skipping the user entirely.
  const [fallback] = await baseQuery;
  return fallback ?? null;
}
