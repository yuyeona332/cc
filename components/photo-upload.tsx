"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";

interface PhotoUploadProps {
  /** Called once with the final blob URL after a successful upload. */
  onUploaded: (url: string) => void;
  /** Caller controls user-facing copy; default is intentionally minimal. */
  label?: string;
}

export function PhotoUpload({
  onUploaded,
  label = "사진 (선택)",
}: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const blob = await upload(`mission-photos/me/${file.name}`, file, {
        access: "public", // toggle to "private" once Vercel Blob exposes the API knob
        handleUploadUrl: "/api/upload/mission-photo",
      });
      setUploadedUrl(blob.url);
      onUploaded(blob.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "업로드 실패");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <label
        htmlFor="mission-photo"
        className="block text-xs text-zinc-500"
      >
        {label}
      </label>
      <input
        id="mission-photo"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleChange}
        disabled={uploading}
        className="block w-full text-xs text-zinc-600 file:mr-3 file:rounded-lg file:border file:border-zinc-200 file:bg-white file:px-3 file:py-2 file:text-xs file:font-medium file:text-zinc-700 hover:file:bg-zinc-50 disabled:opacity-50 dark:text-zinc-300 dark:file:border-zinc-700 dark:file:bg-zinc-900 dark:file:text-zinc-200"
      />
      {uploading && (
        <p className="text-xs text-zinc-500">올리는 중...</p>
      )}
      {uploadedUrl && (
        <p className="text-xs text-zinc-500">사진이 첨부됐어요.</p>
      )}
      {error && (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
