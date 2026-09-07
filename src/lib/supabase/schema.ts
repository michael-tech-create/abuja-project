import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";

export type SchemaStatus =
  | { ok: true }
  | { ok: false; reason: "missing_env" | "missing_profiles" | "unknown"; message: string };

/**
 * Lightweight check used to avoid auth↔onboarding redirect loops
 * when migrations have not been applied yet.
 */
export async function getSchemaStatus(): Promise<SchemaStatus> {
  if (!hasSupabaseEnv()) {
    return {
      ok: false,
      reason: "missing_env",
      message: "Supabase env vars are not configured.",
    };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("profiles").select("id").limit(1);

    if (!error) {
      return { ok: true };
    }

    const message = error.message || "Unknown database error";
    if (
      /Could not find the table/i.test(message) ||
      /schema cache/i.test(message) ||
      error.code === "PGRST205" ||
      error.code === "42P01"
    ) {
      return { ok: false, reason: "missing_profiles", message };
    }

    return { ok: false, reason: "unknown", message };
  } catch (err) {
    return {
      ok: false,
      reason: "unknown",
      message: err instanceof Error ? err.message : "Schema check failed",
    };
  }
}
