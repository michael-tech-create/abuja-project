import { headers } from "next/headers";

/**
 * Canonical public site URL for auth redirects and emails.
 * Prefer NEXT_PUBLIC_SITE_URL in production (set to your Vercel domain).
 */
export function getConfiguredSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (configured) return configured;

  const vercel = process.env.VERCEL_URL?.trim().replace(/\/$/, "");
  if (vercel) {
    const host = vercel.startsWith("http") ? vercel : `https://${vercel}`;
    return host.replace(/\/$/, "");
  }

  return "http://localhost:3000";
}

/** Resolve the request origin on the server (signup/OAuth redirects). */
export async function resolveOrigin() {
  try {
    const headerStore = await headers();
    const origin = headerStore.get("origin");
    if (origin) return origin.replace(/\/$/, "");

    const host =
      headerStore.get("x-forwarded-host") ?? headerStore.get("host");
    const proto = headerStore.get("x-forwarded-proto") ?? "https";
    if (host) return `${proto}://${host}`.replace(/\/$/, "");
  } catch {
    // headers() unavailable outside a request
  }

  return getConfiguredSiteUrl();
}
