import { STORAGE_BUCKETS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

/** Turn a storage path or legacy http URL into a browser-viewable URL. */
export async function resolveDocumentViewUrl(storagePath: string) {
  if (!storagePath) return null;
  if (storagePath.startsWith("http://") || storagePath.startsWith("https://")) {
    return storagePath;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKETS.verificationDocs)
      .createSignedUrl(storagePath, 60 * 60); // 1 hour

    if (error || !data?.signedUrl) return null;
    return data.signedUrl;
  } catch {
    return null;
  }
}

export async function attachViewUrls<T extends { storage_path: string }>(
  docs: T[],
): Promise<Array<T & { view_url: string | null }>> {
  return Promise.all(
    docs.map(async (doc) => ({
      ...doc,
      view_url: await resolveDocumentViewUrl(doc.storage_path),
    })),
  );
}
