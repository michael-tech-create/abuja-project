import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";

export type ReviewRow = {
  id: string;
  property_id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  reviewer_name?: string | null;
};

export async function getPropertyReviews(propertyId: string): Promise<{
  reviews: ReviewRow[];
  average: number | null;
  count: number;
}> {
  if (!hasSupabaseEnv()) {
    return { reviews: [], average: null, count: 0 };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("id, property_id, user_id, rating, comment, created_at")
    .eq("property_id", propertyId)
    .order("created_at", { ascending: false });

  if (error) {
    return { reviews: [], average: null, count: 0 };
  }

  const rows = data ?? [];
  const userIds = [...new Set(rows.map((r) => r.user_id))];
  const { data: profiles } = userIds.length
    ? await supabase.from("profiles").select("id, full_name").in("id", userIds)
    : { data: [] as { id: string; full_name: string }[] };

  const nameMap = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));
  const reviews: ReviewRow[] = rows.map((r) => ({
    ...r,
    reviewer_name: nameMap.get(r.user_id) ?? "Resident",
  }));

  const count = reviews.length;
  const average =
    count === 0
      ? null
      : Math.round(
          (reviews.reduce((sum, r) => sum + r.rating, 0) / count) * 10,
        ) / 10;

  return { reviews, average, count };
}
