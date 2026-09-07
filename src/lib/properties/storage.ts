import type { SupabaseClient } from "@supabase/supabase-js";

import {
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  MAX_PROPERTY_IMAGES,
} from "@/lib/properties/constants";
import { STORAGE_BUCKETS } from "@/lib/constants";
import type { Database } from "@/types/database";

type Client = SupabaseClient<Database>;

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
}

export function validateImageFile(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type as (typeof ACCEPTED_IMAGE_TYPES)[number])) {
    return `${file.name}: use JPEG, PNG, WebP, or GIF.`;
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return `${file.name}: must be under 10MB.`;
  }
  return null;
}

export async function uploadPropertyImages(options: {
  supabase: Client;
  ownerId: string;
  propertyId: string;
  files: File[];
}): Promise<{ urls: string[]; error?: string }> {
  const { supabase, ownerId, propertyId, files } = options;

  if (files.length === 0) return { urls: [] };

  const urls: string[] = [];

  for (const file of files) {
    const validationError = validateImageFile(file);
    if (validationError) {
      return { urls, error: validationError };
    }

    const path = `${ownerId}/${propertyId}/${Date.now()}-${sanitizeFileName(file.name)}`;
    const { error } = await supabase.storage
      .from(STORAGE_BUCKETS.propertyImages)
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (error) {
      return { urls, error: error.message };
    }

    const { data } = supabase.storage
      .from(STORAGE_BUCKETS.propertyImages)
      .getPublicUrl(path);

    urls.push(data.publicUrl);
  }

  return { urls };
}

export async function removePropertyImages(options: {
  supabase: Client;
  urlsOrPaths: string[];
}) {
  const { supabase, urlsOrPaths } = options;
  if (urlsOrPaths.length === 0) return;

  const paths = urlsOrPaths
    .map((value) => extractStoragePath(value))
    .filter((path): path is string => Boolean(path));

  if (paths.length === 0) return;

  await supabase.storage.from(STORAGE_BUCKETS.propertyImages).remove(paths);
}

/** Accepts a public URL or a raw storage path and returns the object path. */
export function extractStoragePath(urlOrPath: string): string | null {
  if (!urlOrPath) return null;
  if (!urlOrPath.includes("://")) {
    return urlOrPath.replace(/^\/+/, "");
  }

  const marker = `/${STORAGE_BUCKETS.propertyImages}/`;
  const idx = urlOrPath.indexOf(marker);
  if (idx === -1) return null;
  return decodeURIComponent(urlOrPath.slice(idx + marker.length).split("?")[0]);
}

export function enforceImageLimit(existingCount: number, incomingCount: number) {
  if (existingCount + incomingCount > MAX_PROPERTY_IMAGES) {
    return `You can upload up to ${MAX_PROPERTY_IMAGES} images per listing.`;
  }
  return null;
}
