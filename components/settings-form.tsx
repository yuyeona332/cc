"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import type { MissionLevel } from "@/lib/missions/types";
import { levelLabel } from "@/lib/missions/types";

const PUSH_HOURS: ReadonlyArray<{ value: number; label: string }> = [
  { value: 8, label: "오전 8시" },
  { value: 9, label: "오전 9시" },
  { value: 10, label: "오전 10시" },
  { value: 12, label: "오후 12시" },
  { value: 15, label: "오후 3시" },
  { value: 18, label: "오후 6시" },
  { value: 20, label: "오후 8시" },
];

interface SettingsFormProps {
  initialLevel: MissionLevel;
  initialPushHour: number;
}

export function SettingsForm({
  initialLevel,
  initialPushHour,
}: SettingsFormProps) {
  const router = useRouter();
  const { signOut } = useClerk();
  const [level, setLevel] = useState<MissionLevel>(initialLevel);
  const [pushHour, setPushHour] = useState<number>(initialPushHour);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/users/preferences", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          preferredLevel: level,
          dailyPushHour: pushHour,
        }),
      });
      if (!res.ok) {
        throw new Error(`save failed: ${res.status}`);
      }
      setSavedAt(new Date());
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function deleteAccount() {
    setDeleting(true);
    try {
      const res = await fetch("/api/users/me", { method: "DELETE" });
      if (!res.ok) {
        throw new Error(`delete failed: ${res.status}`);
      }
      await signOut({ redirectUrl: "/" });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="w-full max-w-md space-y-8">
      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
          선호 단계
        </h2>
        <div className="mt-4 space-y-2">
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
              className={`flex cursor-pointer items-center rounded-xl border p-3 text-sm transition-colors ${
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
              <span className="text-zinc-900 dark:text-zinc-50">
                {levelLabel[value]}
              </span>
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
          알림 시각
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-2">
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
      </section>

      <button
        type="button"
        disabled={saving}
        onClick={() => void save()}
        className="w-full rounded-xl bg-zinc-900 py-3 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {saving ? "저장 중..." : "저장하기"}
      </button>
      {savedAt && (
        <p className="text-center text-xs text-zinc-500">저장됐어요.</p>
      )}

      <section className="rounded-2xl border border-red-200 bg-white p-6 dark:border-red-900 dark:bg-zinc-900">
        <h2 className="text-base font-semibold text-red-600 dark:text-red-400">
          계정 삭제
        </h2>
        <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
          데이터는 30일 후 영구 삭제돼요. 그 사이엔 다시 가입하면 복구할 수
          있어요.
        </p>
        {!confirmingDelete ? (
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            className="mt-4 w-full rounded-xl border border-red-300 py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-zinc-800"
          >
            계정 삭제하기
          </button>
        ) : (
          <div className="mt-4 space-y-2">
            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              정말 삭제할까요? 30일 안에는 복구할 수 있어요.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className="flex-1 rounded-xl border border-zinc-200 py-3 text-sm dark:border-zinc-700"
              >
                취소
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={() => void deleteAccount()}
                className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "삭제 중..." : "삭제"}
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
