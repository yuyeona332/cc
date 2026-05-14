"use client";

import { useEffect, useRef } from "react";
import {
  resourcesFor,
  type CrisisResource,
} from "@/lib/crisis-resources/catalog";

interface CrisisResourceModalProps {
  open: boolean;
  /**
   * Which kinds of resources to show. The detection layer maps risk
   * categories onto resource categories (see lib/safety/detect.ts).
   */
  categories: ReadonlyArray<CrisisResource["categories"][number]>;
  /**
   * Caller can dismiss the modal. PLAN.md mandates this is the ONLY safety
   * UI in flow — no chat input remains visible while it is open.
   */
  onDismiss: () => void;
}

/**
 * Crisis resource modal.
 *
 * Surfaces immediately when the safety layer detects high-confidence risk
 * (severity >= 7) or when the user explicitly requests help. The modal is
 * intentionally simple: phone links the user can tap, no scrolling list
 * of every resource. Resources are selected by category, not user state.
 */
export function CrisisResourceModal({
  open,
  categories,
  onDismiss,
}: CrisisResourceModalProps) {
  const dismissRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      dismissRef.current?.focus();
    }
  }, [open]);

  if (!open) {
    return null;
  }

  const resources = resourcesFor(categories);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="crisis-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6"
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900">
        <h2
          id="crisis-modal-title"
          className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
        >
          지금 도움이 필요하신가요?
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          전문 상담사가 지금 바로 연결됩니다. 무료, 익명, 24시간.
        </p>

        <ul className="mt-5 space-y-3">
          {resources.map((resource) => (
            <li key={resource.id}>
              {resource.phone ? (
                <a
                  href={`tel:${resource.phone}`}
                  className="flex flex-col rounded-xl border border-zinc-200 p-3 text-left transition-colors hover:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 dark:hover:border-zinc-500"
                >
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    {resource.label}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {resource.description}
                  </span>
                  <span className="mt-1 text-xs text-zinc-400">
                    {resource.hours}
                  </span>
                </a>
              ) : resource.url ? (
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col rounded-xl border border-zinc-200 p-3 text-left transition-colors hover:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 dark:hover:border-zinc-500"
                >
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    {resource.label}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {resource.description}
                  </span>
                </a>
              ) : null}
            </li>
          ))}
        </ul>

        <button
          ref={dismissRef}
          type="button"
          onClick={onDismiss}
          className="mt-5 w-full rounded-xl border border-zinc-200 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          나중에 보기
        </button>
      </div>
    </div>
  );
}
