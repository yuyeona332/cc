"use client";

import { useState } from "react";
import type { MissionLevel } from "@/lib/missions/types";
import { levelLabel } from "@/lib/missions/types";
import { CrisisResourceModal } from "./crisis-resource-modal";
import { scanForRisk } from "@/lib/safety/keywords";

export interface DemoMissionCardData {
  level: MissionLevel;
  prompt: string;
  expectedMinutes: number;
}

interface DemoMissionCardProps {
  mission: DemoMissionCardData;
}

type Phase = "intro" | "accepted" | "logging" | "done";

/**
 * Demo variant of MissionCard with no server calls. Drives the same
 * UX flow against pure local state so reviewers can click through the
 * mission interaction without Clerk or the DB being wired.
 */
export function DemoMissionCard({ mission }: DemoMissionCardProps) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [note, setNote] = useState("");
  const [showCrisis, setShowCrisis] = useState(false);

  function trySubmit(status: "completed" | "skipped") {
    const trimmedNote = note.trim();
    if (trimmedNote.length > 0) {
      const matches = scanForRisk(trimmedNote);
      if (matches.length > 0) {
        setShowCrisis(true);
        return;
      }
    }
    void status;
    setPhase("done");
  }

  return (
    <article className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
      <p className="text-xs uppercase tracking-widest text-zinc-500">
        {levelLabel[mission.level]} · 약 {mission.expectedMinutes}분
      </p>
      <p className="mt-3 text-lg leading-relaxed text-zinc-900 dark:text-zinc-50">
        {mission.prompt}
      </p>

      {phase === "intro" && (
        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => setPhase("accepted")}
            className="w-full rounded-xl bg-zinc-900 py-3 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            할게요
          </button>
          <button
            type="button"
            onClick={() => setPhase("done")}
            className="w-full rounded-xl border border-zinc-200 py-3 text-sm text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            오늘은 패스
          </button>
        </div>
      )}

      {phase === "accepted" && (
        <button
          type="button"
          onClick={() => setPhase("logging")}
          className="mt-6 w-full rounded-xl bg-zinc-900 py-3 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          완료했어요
        </button>
      )}

      {phase === "logging" && (
        <form
          className="mt-6 space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            trySubmit("completed");
          }}
        >
          <label className="block text-xs text-zinc-500" htmlFor="demo-note">
            한 줄 메모 (선택)
          </label>
          <textarea
            id="demo-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            maxLength={500}
            rows={3}
            placeholder="어땠는지 한 줄로. 비워둬도 괜찮아요."
            className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
          <p className="text-xs text-zinc-400">
            (데모: 사진 업로드는 비활성 · 위험 키워드 입력 시 crisis modal 띄움)
          </p>
          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 rounded-xl bg-zinc-900 py-3 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              기록하기
            </button>
            <button
              type="button"
              onClick={() => trySubmit("skipped")}
              className="rounded-xl border border-zinc-200 px-4 text-sm text-zinc-500 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              그냥 끝내기
            </button>
          </div>
        </form>
      )}

      {phase === "done" && (
        <div className="mt-6 space-y-3">
          <p className="text-sm text-zinc-500">오늘은 여기까지. 잘 했어요.</p>
          <button
            type="button"
            onClick={() => {
              setPhase("intro");
              setNote("");
            }}
            className="w-full rounded-xl border border-zinc-200 py-2 text-xs text-zinc-500 dark:border-zinc-700"
          >
            데모 다시 시작
          </button>
        </div>
      )}

      <CrisisResourceModal
        open={showCrisis}
        categories={["suicide", "mental_health", "domestic_violence"]}
        onDismiss={() => setShowCrisis(false)}
      />
    </article>
  );
}
