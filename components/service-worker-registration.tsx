"use client";

import { useEffect } from "react";

/**
 * Registers /sw.js after the app mounts. Renders nothing.
 *
 * Failures are swallowed — the app still works without the worker,
 * we just lose "add to home screen" and push capabilities.
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // ignore; PWA features are best-effort during the MVP
    });
  }, []);

  return null;
}
