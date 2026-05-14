export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6 py-16 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <div className="max-w-md space-y-6 text-center">
        <p className="text-sm uppercase tracking-widest text-zinc-500">
          connection-care
        </p>
        <h1 className="text-3xl font-semibold leading-tight">
          작은 행동 하나로도 충분합니다.
        </h1>
        <p className="text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
          하루에 하나, 5분짜리 일. 안 해도 괜찮은 일.
          이 product는 변화를 약속하지 않습니다. 다만 옆에 있을게요.
        </p>
        <p className="text-xs text-zinc-400">
          현재 베타 준비 중입니다 (Phase 0 인터뷰 진행 중).
        </p>
      </div>
    </main>
  );
}
