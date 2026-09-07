import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

function isMissingProfilesTable(message?: string, code?: string) {
  if (code === "PGRST205" || code === "42P01") return true;
  if (!message) return false;
  return (
    /Could not find the table/i.test(message) ||
    /schema cache/i.test(message) ||
    /relation .*profiles.* does not exist/i.test(message)
  );
}

export async function getSessionUser() {
  if (!hasSupabaseEnv()) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  if (!hasSupabaseEnv()) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    // Expected before migrations are applied — avoid noisy console errors on every page.
    if (!isMissingProfilesTable(error.message, error.code)) {
      console.error("Failed to load profile:", error.message);
    }
    return null;
  }

  return data;
}
