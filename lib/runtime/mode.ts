/**
 * Runtime mode detector. Reads process.env only — Edge-runtime compatible.
 *
 * - cloud: Clerk + Neon Postgres (production / staging)
 * - local: cookie-based guest session + file SQLite (interview demo on a laptop)
 *
 * Mode is decided at first call and cached for the lifetime of the worker.
 * Env vars decide automatically — no manual override flag.
 */

export type RuntimeMode = "cloud" | "local";

let cached: RuntimeMode | null = null;

export function getRuntimeMode(): RuntimeMode {
  if (cached) return cached;
  const hasClerk = !!process.env.CLERK_SECRET_KEY;
  const hasDb = !!process.env.DATABASE_URL;
  cached = hasClerk && hasDb ? "cloud" : "local";
  return cached;
}

export function isLocal(): boolean {
  return getRuntimeMode() === "local";
}

export function isCloud(): boolean {
  return getRuntimeMode() === "cloud";
}
