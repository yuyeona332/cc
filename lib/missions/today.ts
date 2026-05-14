import { eq, and, desc } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { missionAssignments, missions } from "@/lib/db/schema";
import type { MissionLevel } from "./types";

export interface TodayMissionView {
  assignmentId: string;
  missionId: string;
  level: MissionLevel;
  prompt: string;
  expectedMinutes: number;
  response: "accepted" | "declined" | "no_response";
  assignedForDate: string;
}

/**
 * Fetch the user's mission assignment for today's date in their timezone.
 *
 * Returns null if no assignment has been created yet — callers should
 * treat that as "the daily cron has not run for this user today" rather
 * than "no missions exist."
 */
export async function getTodayMission(
  userId: string,
): Promise<TodayMissionView | null> {
  const today = todayInUserTimezone(userId);

  const [row] = await db
    .select({
      assignmentId: missionAssignments.id,
      missionId: missions.id,
      level: missions.level,
      prompt: missions.prompt,
      expectedMinutes: missions.expectedMinutes,
      response: missionAssignments.response,
      assignedForDate: missionAssignments.assignedForDate,
    })
    .from(missionAssignments)
    .innerJoin(missions, eq(missions.id, missionAssignments.missionId))
    .where(
      and(
        eq(missionAssignments.userId, userId),
        eq(missionAssignments.assignedForDate, today),
      ),
    )
    .orderBy(desc(missionAssignments.sentAt))
    .limit(1);

  if (!row) {
    return null;
  }

  return {
    assignmentId: row.assignmentId,
    missionId: row.missionId,
    level: row.level,
    prompt: row.prompt,
    expectedMinutes: row.expectedMinutes,
    response: row.response,
    assignedForDate: row.assignedForDate,
  };
}

/**
 * Compute today's date string in the user's timezone. Phase 1 will load
 * the user's timezone from the users table; until then we use the Seoul
 * default declared in the schema.
 */
function todayInUserTimezone(_userId: string): string {
  void _userId;
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(new Date());
}
