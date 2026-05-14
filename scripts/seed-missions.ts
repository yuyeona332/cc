/**
 * Seed the missions table from lib/missions/seed.ts.
 *
 * Idempotent — uses seed_id as the conflict target. Re-running the script
 * after editing copy updates existing rows in place rather than creating
 * duplicates (mission_logs.missionId references the surrogate uuid id,
 * which is preserved across re-runs).
 *
 * Run:
 *   DATABASE_URL=... npx tsx scripts/seed-missions.ts
 */

import { sql } from "drizzle-orm";
import { getDb } from "../lib/db/client";
import { missions } from "../lib/db/schema";
import { missionSeed } from "../lib/missions/seed";

async function main() {
  const db = await getDb();
  let touched = 0;

  for (const template of missionSeed) {
    await db
      .insert(missions)
      .values({
        seedId: template.id,
        level: template.level,
        category: template.category,
        prompt: template.prompt,
        expectedMinutes: template.expectedMinutes,
        enabled: true,
      })
      .onConflictDoUpdate({
        target: missions.seedId,
        set: {
          level: sql`excluded.level`,
          category: sql`excluded.category`,
          prompt: sql`excluded.prompt`,
          expectedMinutes: sql`excluded.expected_minutes`,
          enabled: sql`excluded.enabled`,
        },
      });
    touched += 1;
  }

  console.warn(`Seed complete: ${touched} rows upserted.`);
}

main()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
