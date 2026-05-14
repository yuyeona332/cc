import { redirect } from "next/navigation";
import { getCurrentUserIdOrNull } from "@/lib/auth/current-user";
import { ensureUser, isOnboarded } from "@/lib/users/ensure";
import { OnboardingForm } from "@/components/onboarding-form";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const userId = await getCurrentUserIdOrNull();
  if (!userId) {
    redirect("/sign-in");
  }

  const user = await ensureUser(userId);
  if (isOnboarded(user)) {
    redirect("/today");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6 py-16 dark:bg-zinc-950">
      <p className="mb-6 text-xs uppercase tracking-widest text-zinc-500">
        시작하기 전에
      </p>
      <OnboardingForm />
    </main>
  );
}
