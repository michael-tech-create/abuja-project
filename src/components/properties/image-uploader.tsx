"use client";

import { XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_PROPERTY_IMAGES,
} from "@/lib/properties/constants";
import { cn } from "@/lib/utils";

type ImageUploaderProps = {
  existingImages: string[];
  newFiles: File[];
  onExistingChange: (urls: string[]) => void;
  onNewFilesChange: (files: File[]) => void;
};

export function ImageUploader({
  existingImages,
  newFiles,
  onExistingChange,
  onNewFilesChange,
}: ImageUploaderProps) {
  const total = existingImages.length + newFiles.length;

  function onPick(files: FileList | null) {
    if (!files?.length) return;

    const remaining = MAX_PROPERTY_IMAGES - total;
    if (remaining <= 0) return;

    const accepted = Array.from(files)
      .filter((file) =>
        ACCEPTED_IMAGE_TYPES.includes(
          file.type as (typeof ACCEPTED_IMAGE_TYPES)[number],
        ),
      )
      .slice(0, remaining);

    onNewFilesChange([...newFiles, ...accepted]);
  }

  function removeExisting(url: string) {
    onExistingChange(existingImages.filter((item) => item !== url));
  }

  function removeNew(index: number) {
    onNewFilesChange(newFiles.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <Label htmlFor="property-images">Photos</Label>
          <p className="mt-1 text-xs text-muted-foreground">
            Up to {MAX_PROPERTY_IMAGES} images ({total}/{MAX_PROPERTY_IMAGES}).
            First image is the cover.
          </p>
        </div>
        <label
          htmlFor="property-images"
          className="inline-flex h-8 cursor-pointer items-center rounded-lg border border-border bg-background px-3 text-sm font-medium hover:bg-muted"
        >
          Add photos
        </label>
        <input
          id="property-images"
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(",")}
          multiple
          className="sr-only"
          onChange={(e) => {
            onPick(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      <input
        type="hidden"
        name="existingImages"
        value={JSON.stringify(existingImages)}
      />

      {total > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {existingImages.map((url, index) => (
            <li
              key={url}
              className={cn(
                "group relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-muted",
                index === 0 && "ring-2 ring-primary/30",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="size-full object-cover" />
              {index === 0 && (
                <span className="absolute top-2 left-2 rounded-md bg-background/90 px-1.5 py-0.5 text-[10px] font-medium">
                  Cover
                </span>
              )}
              <Button
                type="button"
                size="icon-xs"
                variant="secondary"
                className="absolute top-2 right-2 opacity-90"
                onClick={() => removeExisting(url)}
                aria-label="Remove image"
              >
                <XIcon />
              </Button>
            </li>
          ))}
          {newFiles.map((file, index) => {
            const url = URL.createObjectURL(file);
            const isCover = existingImages.length === 0 && index === 0;
            return (
              <li
                key={`${file.name}-${file.size}-${index}`}
                className={cn(
                  "group relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-muted",
                  isCover && "ring-2 ring-primary/30",
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="size-full object-cover" />
                {isCover && (
                  <span className="absolute top-2 left-2 rounded-md bg-background/90 px-1.5 py-0.5 text-[10px] font-medium">
                    Cover
                  </span>
                )}
                <Button
                  type="button"
                  size="icon-xs"
                  variant="secondary"
                  className="absolute top-2 right-2 opacity-90"
                  onClick={() => removeNew(index)}
                  aria-label="Remove image"
                >
                  <XIcon />
                </Button>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
          No photos yet. Add clear exterior and interior shots.
        </div>
      )}
    </div>
  );
}
