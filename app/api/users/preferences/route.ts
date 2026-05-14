import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";

export const runtime = "nodejs";

const updateSchema = z.object({
  preferredLevel: z
    .enum([
      "L1_cognitive",
      "L2_home_action",
      "L3_outside_action",
      "L4_social_action",
    ])
    .optional(),
  dailyPushHour: z.number().int().min(0).max(23).optional(),
});

export async function PATCH(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const body = (await request.json()) as unknown;
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const updates: Record<string, unknown> = {};
  if (parsed.data.preferredLevel) {
    updates.preferredMissionLevel = parsed.data.preferredLevel;
  }
  if (parsed.data.dailyPushHour !== undefined) {
    updates.dailyPushHour = parsed.data.dailyPushHour;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ ok: true });
  }

  await db.update(users).set(updates).where(eq(users.id, userId));
  return NextResponse.json({ ok: true });
}
