import { NextResponse } from "next/server";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { getCurrentUserIdOrNull } from "@/lib/auth/current-user";
import { getDb } from "@/lib/db/client";
import { missionAssignments } from "@/lib/db/schema";

export const runtime = "nodejs";

const respondSchema = z.object({
  assignmentId: z.string().uuid(),
  response: z.enum(["accepted", "declined"]),
});

export async function POST(request: Request) {
  const userId = await getCurrentUserIdOrNull();
  if (!userId) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const body = (await request.json()) as unknown;
  const parsed = respondSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const db = await getDb();
  const [updated] = await db
    .update(missionAssignments)
    .set({
      response: parsed.data.response,
      respondedAt: new Date(),
    })
    .where(
      and(
        eq(missionAssignments.id, parsed.data.assignmentId),
        eq(missionAssignments.userId, userId),
      ),
    )
    .returning({ id: missionAssignments.id });

  if (!updated) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
