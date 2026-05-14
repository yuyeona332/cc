import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";

export const runtime = "nodejs";

/**
 * Issue a signed client-side upload URL for a mission completion photo.
 *
 * Flow:
 *   1. Client POSTs to this endpoint with a HandleUploadBody.
 *   2. We require an authenticated user; if absent we reject.
 *   3. We constrain the content type and put the URL under a per-user
 *      prefix so a leaked URL only exposes that user's own files.
 *
 * The actual blob upload happens directly from client to Vercel Blob —
 * we don't proxy the bytes through this function.
 */
export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const { userId } = await auth();
        if (!userId) {
          throw new Error("unauthenticated");
        }

        // Enforce per-user prefix.
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
        // No-op for now. Phase 2: write an audit-log row referencing
        // the blob URL so we can detect orphaned uploads.
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
