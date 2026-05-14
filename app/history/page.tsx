import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUserIdOrNull } from "@/lib/auth/current-user";
import { ensureUser, isOnboarded } from "@/lib/users/ensure";
import { getRecentHistory } from "@/lib/missions/history";
import { levelLabel } from "@/lib/missions/types";

export const dynamic = "force-dynamic";

const DATE_FORMATTER = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  month: "long",
  day: "numeric",
  weekday: "short",
});

export default async function HistoryPage() {
  const userId = await getCurrentUserIdOrNull();
  if (!userId) {
    redirect("/sign-in");
  }

  const user = await ensureUser(userId);
  if (!isOnboarded(user)) {
    redirect("/onboarding");
  }

  const entries = await getRecentHistory(userId);

  return (
    <main className="flex min-h-screen flex-col items-center bg-zinc-50 px-6 py-16 dark:bg-zinc-950">
      <p className="mb-6 text-xs uppercase tracking-widest text-zinc-500">
        지난 기록
      </p>

      {entries.length === 0 ? (
        <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            아직 기록이 없어요. 오늘 하나 해보는 것부터.
          </p>
        </div>
      ) : (
        <ul className="w-full max-w-md space-y-3">
          {entries.map((entry) => (
            <li
              key={entry.logId}
              className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-zinc-500">
                  {levelLabel[entry.level]}
                </span>
                <time className="text-xs text-zinc-400">
                  {DATE_FORMATTER.format(entry.completedAt)}
                </time>
              </div>
              <p className="mt-2 text-sm text-zinc-900 dark:text-zinc-50">
                {entry.prompt}
              </p>
              {entry.note && (
                <p className="mt-2 text-xs text-zinc-500">{entry.note}</p>
              )}
              {entry.status === "skipped" && (
                <p className="mt-2 text-xs text-zinc-400">패스함</p>
              )}
            </li>
          ))}
        </ul>
      )}

      <Link
        href="/today"
        className="mt-10 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"
      >
        ← 오늘로 돌아가기
      </Link>
    </main>
  );
}
