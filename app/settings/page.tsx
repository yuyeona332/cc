import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ensureUser, isOnboarded } from "@/lib/users/ensure";
import { SettingsForm } from "@/components/settings-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const user = await ensureUser(userId);
  if (!isOnboarded(user)) {
    redirect("/onboarding");
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-zinc-50 px-6 py-16 dark:bg-zinc-950">
      <p className="mb-6 text-xs uppercase tracking-widest text-zinc-500">
        설정
      </p>
      <SettingsForm
        initialLevel={user.preferredMissionLevel}
        initialPushHour={user.dailyPushHour}
      />
      <Link
        href="/today"
        className="mt-10 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"
      >
        ← 오늘로 돌아가기
      </Link>
    </main>
  );
}
