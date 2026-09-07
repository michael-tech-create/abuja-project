/**
 * Upload a file to Supabase Storage with byte-level progress via XHR.
 * Falls back to a simulated progress curve in demo mode (no Supabase URL).
 */

export type UploadProgress = {
  loaded: number;
  total: number;
  percent: number;
};

export type UploadWithProgressOptions = {
  bucket: string;
  path: string;
  file: File;
  accessToken: string;
  supabaseUrl: string;
  upsert?: boolean;
  onProgress?: (progress: UploadProgress) => void;
  signal?: AbortSignal;
};

export type UploadWithProgressResult = {
  path: string;
  publicUrl: string;
};

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
}

export function buildStorageObjectPath(
  userId: string,
  ...parts: string[]
) {
  const safe = parts.map((part) => sanitizeFileName(part));
  return [userId, ...safe].join("/");
}

export function getPublicStorageUrl(
  supabaseUrl: string,
  bucket: string,
  path: string,
) {
  return `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/${bucket}/${path
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}

export function uploadFileWithProgress(
  options: UploadWithProgressOptions,
): Promise<UploadWithProgressResult> {
  const {
    bucket,
    path,
    file,
    accessToken,
    supabaseUrl,
    upsert = false,
    onProgress,
    signal,
  } = options;

  const endpoint = `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/${bucket}/${path
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", endpoint);
    xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);
    xhr.setRequestHeader("apikey", accessToken);
    xhr.setRequestHeader("x-upsert", upsert ? "true" : "false");
    xhr.setRequestHeader("cache-control", "3600");
    // Let browser set multipart boundary if we used FormData; for raw body use content-type
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      onProgress?.({
        loaded: event.loaded,
        total: event.total,
        percent: Math.round((event.loaded / event.total) * 100),
      });
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.({ loaded: file.size, total: file.size, percent: 100 });
        resolve({
          path,
          publicUrl: getPublicStorageUrl(supabaseUrl, bucket, path),
        });
        return;
      }
      let message = `Upload failed (${xhr.status})`;
      try {
        const parsed = JSON.parse(xhr.responseText) as { message?: string; error?: string };
        message = parsed.message || parsed.error || message;
      } catch {
        // ignore
      }
      reject(new Error(message));
    };

    xhr.onerror = () => reject(new Error("Network error during upload."));
    xhr.onabort = () => reject(new Error("Upload cancelled."));

    if (signal) {
      if (signal.aborted) {
        xhr.abort();
        return;
      }
      signal.addEventListener("abort", () => xhr.abort(), { once: true });
    }

    xhr.send(file);
  });
}

/** Demo / offline: fake progress then return an object URL. */
export async function simulateUploadWithProgress(
  file: File,
  onProgress?: (progress: UploadProgress) => void,
  signal?: AbortSignal,
): Promise<string> {
  const total = file.size || 1;
  let loaded = 0;
  const step = Math.max(total / 12, 1);

  while (loaded < total) {
    if (signal?.aborted) throw new Error("Upload cancelled.");
    await new Promise((r) => setTimeout(r, 80));
    loaded = Math.min(total, loaded + step);
    onProgress?.({
      loaded,
      total,
      percent: Math.round((loaded / total) * 100),
    });
  }

  return URL.createObjectURL(file);
}
