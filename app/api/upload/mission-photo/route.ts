import { NextResponse } from "next/server";
import { getCurrentUserIdOrNull } from "@/lib/auth/current-user";
import { isLocal } from "@/lib/runtime/mode";

export const runtime = "nodejs";

/**
 * Issue a signed client-side upload URL for a mission completion photo.
 *
 * Photo upload is a cloud-only feature (Vercel Blob). In local mode we
 * return 501 — the mission card hides the upload button via the
 * `allowPhoto` prop, so this endpoint should not be hit.
 */
export async function POST(request: Request) {
  if (isLocal()) {
    return NextResponse.json(
      { error: "photo_upload_disabled_in_local_mode" },
      { status: 501 },
    );
  }

  const blobClient = await import("@vercel/blob/client");
  const body = (await request.json()) as Parameters<
    typeof blobClient.handleUpload
  >[0]["body"];

  try {
    const result = await blobClient.handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const userId = await getCurrentUserIdOrNull();
        if (!userId) {
          throw new Error("unauthenticated");
        }

        const expectedPrefix = `mission-photos/${userId}/`;
        if (!pathname.startsWith(expectedPrefix)) {
          throw new Error("invalid_pathname");
        }

        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp"],
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ userId }),
        };
      },
      onUploadCompleted: async () => {
        // No-op; Phase 2 wires audit log for orphan detection.
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "upload_failed" },
      { status: 400 },
    );
  }
}
