"use server";

import { revalidatePath } from "next/cache";

import { getSessionUser } from "@/lib/auth/session";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";

export async function toggleFavoriteAction(formData: FormData) {
  if (!hasSupabaseEnv()) return;

  const user = await getSessionUser();
  if (!user) return;

  const propertyId = String(formData.get("propertyId") ?? "");
  const path = String(formData.get("path") ?? "/browse");
  if (!propertyId) return;

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("property_id", propertyId)
    .maybeSingle();

  if (existing) {
    await supabase.from("favorites").delete().eq("id", existing.id);
  } else {
    await supabase.from("favorites").insert({
      user_id: user.id,
      property_id: propertyId,
    });
  }

  revalidatePath(path);
  revalidatePath("/browse");
  revalidatePath(`/properties/${propertyId}`);
  revalidatePath("/dashboard/favorites");
}
