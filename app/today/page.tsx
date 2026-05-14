import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getTodayMission } from "@/lib/missions/today";
import { ensureUser, isOnboarded } from "@/lib/users/ensure";
import { MissionCard } from "@/components/mission-card";

export const dynamic = "force-dynamic";

export default async function TodayPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const user = await ensureUser(userId);
  if (!isOnboarded(user)) {
    redirect("/onboarding");
  }

  const mission = await getTodayMission(userId);

  return (
    <main className="flex min-h-screen flex-col items-center bg-zinc-50 px-6 py-16 dark:bg-zinc-950">
      <p className="mb-6 text-xs uppercase tracking-widest text-zinc-500">
        오늘의 한 가지
      </p>
      {mission ? (
        <MissionCard
          mission={{
            assignmentId: mission.assignmentId,
            level: mission.level,
            prompt: mission.prompt,
            expectedMinutes: mission.expectedMinutes,
            response: mission.response,
          }}
        />
      ) : (
        <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            오늘은 아직 받은 일이 없어요. 잠시 후 다시 와주세요.
          </p>
        </div>
      )}

      <nav className="mt-10 flex gap-4 text-xs text-zinc-500">
        <Link href="/history" className="hover:text-zinc-900 dark:hover:text-zinc-50">
          지난 기록
        </Link>
        <Link href="/settings" className="hover:text-zinc-900 dark:hover:text-zinc-50">
          설정
        </Link>
      </nav>
    </main>
  );
}
