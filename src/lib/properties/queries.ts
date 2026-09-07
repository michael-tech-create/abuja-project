import { DEMO_PUBLIC_PROPERTIES } from "@/lib/properties/demo-data";
import {
  applyClientFilters,
  type PropertySearchFilters,
} from "@/lib/properties/search";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";
import type { Property } from "@/types/database";

export type PublicSearchResult = {
  properties: Property[];
  source: "supabase" | "demo";
};

export async function searchPublicProperties(
  filters: PropertySearchFilters,
): Promise<PublicSearchResult> {
  if (!hasSupabaseEnv()) {
    return {
      properties: applyClientFilters(DEMO_PUBLIC_PROPERTIES, filters),
      source: "demo",
    };
  }

  const supabase = await createClient();
  let query = supabase
    .from("properties")
    .select("*")
    .eq("verification_status", "verified")
    .eq("is_published", true);

  if (filters.district) {
    query = query.eq("district", filters.district);
  }
  if (filters.type) {
    query = query.eq("property_type", filters.type);
  }
  if (filters.minPrice != null) {
    query = query.gte("price", filters.minPrice);
  }
  if (filters.maxPrice != null) {
    query = query.lte("price", filters.maxPrice);
  }
  if (filters.beds != null) {
    query = query.gte("bedrooms", filters.beds);
  }

  switch (filters.sort) {
    case "price_asc":
      query = query.order("price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("price", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query.limit(100);

  if (error) {
    console.error("searchPublicProperties:", error.message);
    return { properties: [], source: "supabase" };
  }

  let properties = data ?? [];

  if (filters.q) {
    const q = filters.q.toLowerCase();
    properties = properties.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.address_line?.toLowerCase().includes(q) ?? false),
    );
  }

  return { properties, source: "supabase" };
}

export async function getPublicProperty(
  propertyId: string,
): Promise<{ property: Property | null; source: "supabase" | "demo" }> {
  if (!hasSupabaseEnv()) {
    const property =
      DEMO_PUBLIC_PROPERTIES.find((p) => p.id === propertyId) ?? null;
    return { property, source: "demo" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", propertyId)
    .eq("verification_status", "verified")
    .eq("is_published", true)
    .maybeSingle();

  if (error) {
    console.error("getPublicProperty:", error.message);
    return { property: null, source: "supabase" };
  }

  return { property: data, source: "supabase" };
}

export async function getOwnedProperties(ownerId: string): Promise<Property[]> {
  if (!hasSupabaseEnv()) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("owner_id", ownerId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("getOwnedProperties:", error.message);
    return [];
  }

  return data ?? [];
}

export async function getOwnedProperty(
  ownerId: string,
  propertyId: string,
): Promise<Property | null> {
  if (!hasSupabaseEnv()) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", propertyId)
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (error) {
    console.error("getOwnedProperty:", error.message);
    return null;
  }

  return data;
}

/** Admins can load any property; owners only their own. */
export async function getManageableProperty(
  userId: string,
  propertyId: string,
  isAdmin: boolean,
): Promise<Property | null> {
  if (!hasSupabaseEnv()) return null;

  const supabase = await createClient();
  let query = supabase.from("properties").select("*").eq("id", propertyId);

  if (!isAdmin) {
    query = query.eq("owner_id", userId);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    console.error("getManageableProperty:", error.message);
    return null;
  }

  return data;
}
