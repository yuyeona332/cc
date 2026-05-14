import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getCurrentUserIdOrNull } from "@/lib/auth/current-user";
import { getDb } from "@/lib/db/client";
import { users, auditLog } from "@/lib/db/schema";
import { ensureUser } from "@/lib/users/ensure";

export const runtime = "nodejs";

const onboardingSchema = z.object({
  ageOver19: z.literal(true),
  preferredLevel: z.enum([
    "L1_cognitive",
    "L2_home_action",
    "L3_outside_action",
    "L4_social_action",
  ]),
  dailyPushHour: z.number().int().min(0).max(23),
  timezone: z.string().default("Asia/Seoul"),
});

export async function POST(request: Request) {
  const userId = await getCurrentUserIdOrNull();
  if (!userId) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const body = (await request.json()) as unknown;
  const parsed = onboardingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  await ensureUser(userId);

  const db = await getDb();
  await db
    .update(users)
    .set({
      ageVerified: parsed.data.ageOver19,
      ageVerifiedAt: new Date(),
      preferredMissionLevel: parsed.data.preferredLevel,
      dailyPushHour: parsed.data.dailyPushHour,
      timezone: parsed.data.timezone,
    })
    .where(eq(users.id, userId));

  await db.insert(auditLog).values({
    userId,
    eventType: "onboarding_completed",
    metadata: {
      method: "self_attest",
      preferredLevel: parsed.data.preferredLevel,
    },
  });

  return NextResponse.json({ ok: true });
}
