"use client";

import { useState } from "react";
import { VideoIcon, XIcon } from "lucide-react";

import { UploadProgressBar } from "@/components/media/upload-progress";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { STORAGE_BUCKETS } from "@/lib/constants";
import {
  ACCEPTED_VIDEO_TYPES,
  MAX_PROPERTY_VIDEO_BYTES,
  MAX_PROPERTY_VIDEOS,
} from "@/lib/media/constants";
import {
  buildStorageObjectPath,
  simulateUploadWithProgress,
  uploadFileWithProgress,
} from "@/lib/media/upload-with-progress";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { cn } from "@/lib/utils";

type VideoUploaderProps = {
  ownerId: string;
  propertyId?: string;
  existingVideos: string[];
  onExistingChange: (urls: string[]) => void;
  /** Newly uploaded remote/object URLs ready to save on the listing */
  uploadedVideos: string[];
  onUploadedChange: (urls: string[]) => void;
};

export function VideoUploader({
  ownerId,
  propertyId,
  existingVideos,
  onExistingChange,
  uploadedVideos,
  onUploadedChange,
}: VideoUploaderProps) {
  const [error, setError] = useState<string | null>(null);
  const [percent, setPercent] = useState<number | null>(null);
  const [busyName, setBusyName] = useState<string | null>(null);

  const total = existingVideos.length + uploadedVideos.length;

  async function onPick(files: FileList | null) {
    if (!files?.length) return;
    setError(null);

    const remaining = MAX_PROPERTY_VIDEOS - total;
    if (remaining <= 0) {
      setError(`Maximum ${MAX_PROPERTY_VIDEOS} videos per listing.`);
      return;
    }

    const file = files[0];
    if (
      !ACCEPTED_VIDEO_TYPES.includes(
        file.type as (typeof ACCEPTED_VIDEO_TYPES)[number],
      )
    ) {
      setError("Use MP4, WebM, or MOV.");
      return;
    }
    if (file.size > MAX_PROPERTY_VIDEO_BYTES) {
      setError("Each video must be under 200MB.");
      return;
    }

    setBusyName(file.name);
    setPercent(0);

    try {
      if (!hasSupabaseEnv()) {
        const url = await simulateUploadWithProgress(file, (p) =>
          setPercent(p.percent),
        );
        onUploadedChange([...uploadedVideos, url]);
        return;
      }

      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("Sign in again to upload videos.");
      }

      const path = buildStorageObjectPath(
        ownerId,
        propertyId ?? "draft",
        `${Date.now()}-${file.name}`,
      );

      const result = await uploadFileWithProgress({
        bucket: STORAGE_BUCKETS.propertyVideos,
        path,
        file,
        accessToken: session.access_token,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
        onProgress: (p) => setPercent(p.percent),
      });

      onUploadedChange([...uploadedVideos, result.publicUrl]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Video upload failed.");
    } finally {
      setPercent(null);
      setBusyName(null);
    }
  }

  const all = [
    ...existingVideos.map((url) => ({ url, kind: "existing" as const })),
    ...uploadedVideos.map((url) => ({ url, kind: "new" as const })),
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <Label htmlFor="property-videos">Tour videos</Label>
          <p className="mt-1 text-xs text-muted-foreground">
            Up to {MAX_PROPERTY_VIDEOS} videos ({total}/{MAX_PROPERTY_VIDEOS}).
            Uploads show live progress.
          </p>
        </div>
        <label
          htmlFor="property-videos"
          className={cn(
            "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-border bg-background px-3 text-sm font-medium hover:bg-muted",
            percent != null && "pointer-events-none opacity-50",
          )}
        >
          <VideoIcon className="size-3.5" />
          Add video
        </label>
        <input
          id="property-videos"
          type="file"
          accept={ACCEPTED_VIDEO_TYPES.join(",")}
          className="sr-only"
          disabled={percent != null}
          onChange={(e) => {
            void onPick(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      <input
        type="hidden"
        name="existingVideos"
        value={JSON.stringify(existingVideos)}
      />
      <input
        type="hidden"
        name="uploadedVideos"
        value={JSON.stringify(uploadedVideos)}
      />

      {error && <p className="text-xs text-destructive">{error}</p>}

      {percent != null && (
        <UploadProgressBar
          percent={percent}
          label={busyName ? `Uploading ${busyName}…` : "Uploading video…"}
        />
      )}

      {all.length > 0 ? (
        <ul className="grid gap-3 sm:grid-cols-2">
          {all.map((item, index) => (
            <li
              key={`${item.kind}-${item.url}-${index}`}
              className="group relative overflow-hidden rounded-2xl border border-border bg-muted"
            >
              <video
                src={item.url}
                controls
                playsInline
                preload="metadata"
                className="aspect-video w-full bg-black object-cover"
              />
              <Button
                type="button"
                size="icon-xs"
                variant="secondary"
                className="absolute top-2 right-2 rounded-full"
                onClick={() => {
                  if (item.kind === "existing") {
                    onExistingChange(
                      existingVideos.filter((url) => url !== item.url),
                    );
                  } else {
                    onUploadedChange(
                      uploadedVideos.filter((url) => url !== item.url),
                    );
                  }
                }}
                aria-label="Remove video"
              >
                <XIcon />
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
          No tour videos yet. A short walkthrough helps tenants trust the home.
        </div>
      )}
    </div>
  );
}
