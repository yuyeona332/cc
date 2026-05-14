import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { users, type User } from "@/lib/db/schema";

/**
 * Ensure a row exists in our users table for the authenticated Clerk user.
 *
 * Returns the existing row, or inserts a new row with defaults and returns
 * it. Onboarding sets the meaningful fields (ageVerified, preferredMissionLevel,
 * dailyPushHour); a freshly-created row is "exists but not onboarded".
 *
 * Idempotent — uses onConflictDoNothing keyed on the Clerk user id.
 */
export async function ensureUser(clerkUserId: string): Promise<User> {
  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.id, clerkUserId))
    .limit(1);

  if (existing) {
    return existing;
  }

  await db
    .insert(users)
    .values({ id: clerkUserId })
    .onConflictDoNothing({ target: users.id });

  const [created] = await db
    .select()
    .from(users)
    .where(eq(users.id, clerkUserId))
    .limit(1);

  if (!created) {
    throw new Error("failed to create user row");
  }

  return created;
}

export function isOnboarded(user: User): boolean {
  return user.ageVerified === true;
}
