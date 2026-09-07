export const ACCEPTED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
] as const;

export const ACCEPTED_CHAT_MEDIA_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  ...ACCEPTED_VIDEO_TYPES,
] as const;

export const MAX_CHAT_MEDIA_BYTES = 100 * 1024 * 1024; // 100MB
export const MAX_PROPERTY_VIDEO_BYTES = 200 * 1024 * 1024; // 200MB
export const MAX_PROPERTY_VIDEOS = 3;

export type MediaKind = "none" | "image" | "video";

export function mediaKindFromMime(mime: string): Exclude<MediaKind, "none"> {
  if (mime.startsWith("video/")) return "video";
  return "image";
}
