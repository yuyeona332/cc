import { NextResponse, type NextRequest } from "next/server";
import { LOCAL_USER_COOKIE } from "@/lib/auth/local-cookie";
import { isLocal } from "@/lib/runtime/mode";

const LOCAL_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export default async function middleware(request: NextRequest) {
  if (isLocal()) {
    return localMiddleware(request);
  }
  const { clerkMiddleware, createRouteMatcher } = await import(
    "@clerk/nextjs/server"
  );
  const isPublicRoute = createRouteMatcher([
    "/",
    "/demo(.*)",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/api/health",
    "/api/cron/(.*)",
  ]);
  const handler = clerkMiddleware(async (auth, req) => {
    if (isPublicRoute(req)) return;
    await auth.protect();
  });
  // clerkMiddleware returns a handler with the same (req, event) signature
  // Next.js expects.
  return handler(request, {
    waitUntil: () => undefined,
  } as unknown as Parameters<typeof handler>[1]);
}

function localMiddleware(request: NextRequest) {
  const response = NextResponse.next();
  const existing = request.cookies.get(LOCAL_USER_COOKIE)?.value;
  if (!existing) {
    response.cookies.set(LOCAL_USER_COOKIE, crypto.randomUUID(), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: LOCAL_COOKIE_MAX_AGE_SECONDS,
      path: "/",
    });
  }
  return response;
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
