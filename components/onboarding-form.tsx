"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { MissionLevel } from "@/lib/missions/types";
import { levelLabel } from "@/lib/missions/types";

type Step = "age" | "level" | "push" | "submitting";

const LEVEL_HINTS: Record<MissionLevel, string> = {
  L1_cognitive: "창문 열기, 물 한 잔. 집 안에서 가장 작은 행동.",
  L2_home_action: "5분 정리, 한 끼 만들기. 집 안에서 몸 움직이기.",
  L3_outside_action: "동네 5분 걷기, 가게 한 번. 집 밖으로.",
  L4_social_action: "친구에게 메시지, 직원에게 인사. 사람과 짧은 접촉.",
};

const PUSH_HOURS: ReadonlyArray<{ value: number; label: string }> = [
  { value: 8, label: "오전 8시" },
  { value: 9, label: "오전 9시" },
  { value: 10, label: "오전 10시" },
  { value: 12, label: "오후 12시" },
  { value: 15, label: "오후 3시" },
  { value: 18, label: "오후 6시" },
  { value: 20, label: "오후 8시" },
];

export function OnboardingForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("age");
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [level, setLevel] = useState<MissionLevel>("L1_cognitive");
  const [pushHour, setPushHour] = useState<number>(9);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setStep("submitting");
    setError(null);
    try {
      const res = await fetch("/api/users/onboarding", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ageOver19: ageConfirmed,
          preferredLevel: level,
          dailyPushHour: pushHour,
          timezone:
            Intl.DateTimeFormat().resolvedOptions().timeZone ?? "Asia/Seoul",
        }),
      });
      if (!res.ok) {
        throw new Error(`onboarding failed: ${res.status}`);
      }
      router.push("/today");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
      setStep("push");
    }
  }

  return (
    <div className="w-full max-w-md space-y-6">
      {step === "age" && (
        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            먼저 한 가지 확인할게요
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            이 앱은 만 19세 이상만 사용할 수 있어요. 미성년자는 청소년상담전화
            1388을 이용해주세요.
          </p>
          <label className="mt-5 flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={ageConfirmed}
              onChange={(event) => setAgeConfirmed(event.target.checked)}
              className="mt-1 h-4 w-4 rounded border-zinc-300"
            />
            <span>저는 만 19세 이상이며 위 내용을 확인했어요.</span>
          </label>
          <button
            type="button"
            disabled={!ageConfirmed}
            onClick={() => setStep("level")}
            className="mt-5 w-full rounded-xl bg-zinc-900 py-3 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            다음
          </button>
        </section>
      )}

      {step === "level" && (
        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            어떤 크기의 행동부터 시작할까요?
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            언제든 settings에서 바꿀 수 있어요. 정답은 없습니다.
          </p>
          <div className="mt-5 space-y-2">
            {(
              [
                "L1_cognitive",
                "L2_home_action",
                "L3_outside_action",
                "L4_social_action",
              ] as const
            ).map((value) => (
              <label
                key={value}
                className={`flex cursor-pointer flex-col rounded-xl border p-3 text-left transition-colors ${
                  level === value
                    ? "border-zinc-900 bg-zinc-50 dark:border-zinc-100 dark:bg-zinc-800"
                    : "border-zinc-200 hover:border-zinc-400 dark:border-zinc-700"
                }`}
              >
                <input
                  type="radio"
                  name="level"
                  value={value}
                  checked={level === value}
                  onChange={() => setLevel(value)}
                  className="sr-only"
                />
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {levelLabel[value]}
                </span>
                <span className="mt-1 text-xs text-zinc-500">
                  {LEVEL_HINTS[value]}
                </span>
              </label>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setStep("push")}
            className="mt-5 w-full rounded-xl bg-zinc-900 py-3 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            다음
          </button>
        </section>
      )}

      {(step === "push" || step === "submitting") && (
        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            언제 알림 받을까요?
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            하루 한 번만 보내요. 무시해도 괜찮습니다.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-2">
            {PUSH_HOURS.map((option) => (
              <button
                type="button"
                key={option.value}
                onClick={() => setPushHour(option.value)}
                className={`rounded-xl border p-3 text-sm transition-colors ${
                  pushHour === option.value
                    ? "border-zinc-900 bg-zinc-50 text-zinc-900 dark:border-zinc-100 dark:bg-zinc-800 dark:text-zinc-50"
                    : "border-zinc-200 text-zinc-700 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-300"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          {error && (
            <p className="mt-3 text-xs text-red-600" role="alert">
              {error}
            </p>
          )}
          <button
            type="button"
            disabled={step === "submitting"}
            onClick={() => void submit()}
            className="mt-5 w-full rounded-xl bg-zinc-900 py-3 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {step === "submitting" ? "저장 중..." : "시작하기"}
          </button>
        </section>
      )}
    </div>
  );
}
