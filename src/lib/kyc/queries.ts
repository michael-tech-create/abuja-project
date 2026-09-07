import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";
import type { VerificationDocument } from "@/types/database";

export async function getMyKycDocuments(
  userId: string,
): Promise<VerificationDocument[]> {
  if (!hasSupabaseEnv()) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("verification_documents")
    .select("*")
    .eq("user_id", userId)
    .is("property_id", null)
    .order("submitted_at", { ascending: false });

  if (error) {
    console.error("getMyKycDocuments:", error.message);
    return [];
  }

  return data ?? [];
}
