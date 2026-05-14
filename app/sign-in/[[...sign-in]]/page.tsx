import { redirect } from "next/navigation";
import { isLocal } from "@/lib/runtime/mode";

export default async function SignInPage() {
  if (isLocal()) {
    redirect("/today");
  }
  const { SignIn } = await import("@clerk/nextjs");
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 dark:bg-zinc-950">
      <SignIn />
    </main>
  );
}
