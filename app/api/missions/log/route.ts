import { NextResponse } from "next/server";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { getCurrentUserIdOrNull } from "@/lib/auth/current-user";
import { getDb } from "@/lib/db/client";
import { missionAssignments, missionLogs } from "@/lib/db/schema";
import { scanForRisk } from "@/lib/safety/keywords";
import { classifyUtterance } from "@/lib/safety/detect";

export const runtime = "nodejs";

/**
 * Bound on the user-provided note. Long memos are not the intent here —
 * the field exists for a one-line reflection, not journaling.
 */
const NOTE_MAX_CHARS = 500;

const logSchema = z.object({
  assignmentId: z.string().uuid(),
  status: z.enum(["completed", "skipped"]).default("completed"),
  note: z.string().max(NOTE_MAX_CHARS).optional(),
  photoUrl: z.string().url().optional(),
});

export async function POST(request: Request) {
  const userId = await getCurrentUserIdOrNull();
  if (!userId) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const body = (await request.json()) as unknown;
  const parsed = logSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const db = await getDb();
  const [assignment] = await db
    .select({
      id: missionAssignments.id,
      missionId: missionAssignments.missionId,
    })
    .from(missionAssignments)
    .where(
      and(
        eq(missionAssignments.id, parsed.data.assignmentId),
        eq(missionAssignments.userId, userId),
      ),
    )
    .limit(1);

  if (!assignment) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  // Safety: scan the note before persisting. If it matches a risk
  // category, we still record the completion (the user did the thing)
  // but we route the note text to isolated storage rather than the
  // mission_logs.note column. Phase 1 will wire the isolated store; for
  // now, drop the note rather than write it to the standard column.
  let safeNote: string | null = parsed.data.note ?? null;
  let riskRouted = false;

  if (safeNote) {
    const keywordHits = scanForRisk(safeNote);
    if (keywordHits.length > 0) {
      const judgment = await classifyUtterance({
        utterance: safeNote,
        source: "mission_note",
      });
      void judgment;
      safeNote = null;
      riskRouted = true;
    }
  }

  const [log] = await db
    .insert(missionLogs)
    .values({
      userId,
      assignmentId: assignment.id,
      missionId: assignment.missionId,
      status: parsed.data.status,
      note: safeNote,
      photoUrl: parsed.data.photoUrl ?? null,
    })
    .returning({ id: missionLogs.id });

  return NextResponse.json({
    ok: true,
    logId: log.id,
    riskRouted,
  });
}
