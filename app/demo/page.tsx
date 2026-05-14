import Link from "next/link";
import { missionSeed } from "@/lib/missions/seed";
import { DemoMissionCard } from "@/components/demo-mission-card";

export const dynamic = "force-static";

/**
 * Static demo of the daily mission flow. No auth, no DB.
 *
 * Picks one mission per level from the seed so a reviewer can swap
 * between difficulties to see how tone scales. Live deploy keeps this
 * page reachable so a teammate can preview the UX without an account.
 */
export default function DemoPage() {
  const samples = (
    [
      "L1_cognitive",
      "L2_home_action",
      "L3_outside_action",
      "L4_social_action",
    ] as const
  ).map((level) => {
    const candidate = missionSeed.find((entry) => entry.level === level);
    if (!candidate) {
      throw new Error(`Missing demo mission for level ${level}`);
    }
    return candidate;
  });

  return (
    <main className="flex min-h-screen flex-col items-center bg-zinc-50 px-6 py-16 dark:bg-zinc-950">
      <div className="mb-8 max-w-md text-center">
        <p className="text-xs uppercase tracking-widest text-zinc-500">
          데모 페이지
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          미션 카드 시연
        </h1>
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
          가입·로그인·DB 없이 미션 카드 흐름만 그대로 보여줍니다. 메모에
          "죽고싶어" 같은 위험 키워드를 적으면 crisis modal이 즉시 뜹니다.
        </p>
      </div>

      <div className="grid w-full max-w-4xl gap-6 md:grid-cols-2">
        {samples.map((mission) => (
          <DemoMissionCard
            key={mission.id}
            mission={{
              level: mission.level,
              prompt: mission.prompt,
              expectedMinutes: mission.expectedMinutes,
            }}
          />
        ))}
      </div>

      <Link
        href="/"
        className="mt-10 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"
      >
        ← 랜딩으로
      </Link>
    </main>
  );
}
