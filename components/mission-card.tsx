"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { MissionLevel } from "@/lib/missions/types";
import { levelLabel } from "@/lib/missions/types";
import { CrisisResourceModal } from "./crisis-resource-modal";
import { PhotoUpload } from "./photo-upload";
import { scanForRisk } from "@/lib/safety/keywords";

export interface MissionCardData {
  assignmentId: string;
  level: MissionLevel;
  prompt: string;
  expectedMinutes: number;
  response: "accepted" | "declined" | "no_response";
}

interface MissionCardProps {
  mission: MissionCardData;
}

type Phase = "intro" | "accepted" | "logging" | "done";

/**
 * Single-mission card. Three explicit states:
 *   intro   — user has not responded; shows accept / pass buttons
 *   accepted — user accepted; shows a single "완료" button
 *   logging  — user is writing the optional note before finishing
 *   done     — log persisted
 *
 * The note input runs through the client-side risk-keyword scan before
 * submit. Any match triggers the crisis modal and blocks the submit so
 * the user does not unintentionally route a crisis note through the
 * standard mission log endpoint.
 */
export function MissionCard({ mission }: MissionCardProps) {
  const router = useRouter();
  const initialPhase: Phase =
    mission.response === "accepted" ? "accepted" : "intro";
  const [phase, setPhase] = useState<Phase>(initialPhase);
  const [note, setNote] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [showCrisis, setShowCrisis] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function respond(response: "accepted" | "declined") {
    setSubmitting(true);
    try {
      const res = await fetch("/api/missions/respond", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          assignmentId: mission.assignmentId,
          response,
        }),
      });
      if (!res.ok) {
        throw new Error(`respond failed: ${res.status}`);
      }
      if (response === "accepted") {
        setPhase("accepted");
      } else {
        setPhase("done");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function submitLog(status: "completed" | "skipped") {
    setSubmitting(true);
    try {
      const trimmedNote = note.trim();
      if (trimmedNote.length > 0) {
        const matches = scanForRisk(trimmedNote);
        if (matches.length > 0) {
          setShowCrisis(true);
          return;
        }
      }
      const res = await fetch("/api/missions/log", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          assignmentId: mission.assignmentId,
          status,
          note: trimmedNote.length > 0 ? trimmedNote : undefined,
          photoUrl: photoUrl ?? undefined,
        }),
      });
      if (!res.ok) {
        throw new Error(`log failed: ${res.status}`);
      }
      setPhase("done");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
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
            disabled={submitting}
            onClick={() => respond("accepted")}
            className="w-full rounded-xl bg-zinc-900 py-3 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            할게요
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => respond("declined")}
            className="w-full rounded-xl border border-zinc-200 py-3 text-sm text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            오늘은 패스
          </button>
        </div>
      )}

      {phase === "accepted" && (
        <button
          type="button"
          disabled={submitting}
          onClick={() => setPhase("logging")}
          className="mt-6 w-full rounded-xl bg-zinc-900 py-3 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          완료했어요
        </button>
      )}

      {phase === "logging" && (
        <form
          className="mt-6 space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            void submitLog("completed");
          }}
        >
          <label className="block text-xs text-zinc-500" htmlFor="mission-note">
            한 줄 메모 (선택)
          </label>
          <textarea
            id="mission-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            maxLength={500}
            rows={3}
            placeholder="어땠는지 한 줄로. 비워둬도 괜찮아요."
            className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
          <PhotoUpload onUploaded={setPhotoUrl} />
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-xl bg-zinc-900 py-3 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              기록하기
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => void submitLog("skipped")}
              className="rounded-xl border border-zinc-200 px-4 text-sm text-zinc-500 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              그냥 끝내기
            </button>
          </div>
        </form>
      )}

      {phase === "done" && (
        <p className="mt-6 text-sm text-zinc-500">오늘은 여기까지. 잘 했어요.</p>
      )}

      <CrisisResourceModal
        open={showCrisis}
        categories={["suicide", "mental_health", "domestic_violence"]}
        onDismiss={() => setShowCrisis(false)}
      />
    </article>
  );
}
