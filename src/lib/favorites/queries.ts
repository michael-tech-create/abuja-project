import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";

export async function getFavoritePropertyIds(userId: string) {
  if (!hasSupabaseEnv()) return new Set<string>();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("favorites")
    .select("property_id")
    .eq("user_id", userId);

  if (error) return new Set<string>();
  return new Set((data ?? []).map((row) => row.property_id));
}

export async function isPropertyFavorited(userId: string, propertyId: string) {
  if (!hasSupabaseEnv()) return false;
  const supabase = await createClient();
  const { data } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", userId)
    .eq("property_id", propertyId)
    .maybeSingle();
  return Boolean(data);
}
