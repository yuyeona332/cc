import { NextResponse } from "next/server";
import { isLocal } from "@/lib/runtime/mode";
import { LOCAL_USER_COOKIE } from "@/lib/auth/local-cookie";

export const runtime = "nodejs";

/**
 * Mode-aware sign-out.
 *
 * - local: clear the guest cookie. Caller redirects to "/".
 * - cloud: nothing to do here — the client uses Clerk's signOut() hook
 *   directly. We still respond 200 so the same client code path works
 *   in both modes.
 */
export async function POST() {
  const response = NextResponse.json({ ok: true });
  if (isLocal()) {
    response.cookies.set(LOCAL_USER_COOKIE, "", {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });
  }
  return response;
}
