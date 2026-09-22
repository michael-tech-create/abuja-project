import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";
import type { PropertyUnit } from "@/types/database";

export async function getUnitsForProperty(
  propertyId: string,
): Promise<PropertyUnit[]> {
  if (!hasSupabaseEnv()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("property_units")
    .select("*")
    .eq("property_id", propertyId)
    .order("created_at", { ascending: true });
  if (error) return [];
  return data ?? [];
}

export async function getUnitSummaries(
  propertyIds: string[],
): Promise<Map<string, { count: number; fromPrice: number }>> {
  const map = new Map<string, { count: number; fromPrice: number }>();
  if (!hasSupabaseEnv() || propertyIds.length === 0) return map;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("property_units")
    .select("property_id, price")
    .in("property_id", propertyIds);

  if (error || !data) return map;

  for (const row of data) {
    const current = map.get(row.property_id);
    const price = Number(row.price);
    if (!current) {
      map.set(row.property_id, { count: 1, fromPrice: price });
    } else {
      map.set(row.property_id, {
        count: current.count + 1,
        fromPrice: Math.min(current.fromPrice, price),
      });
    }
  }
  return map;
}
