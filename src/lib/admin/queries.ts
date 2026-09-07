import { getDemoAdminState } from "@/lib/admin/demo-data";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";
import type {
  AdminAction,
  Profile,
  Property,
  VerificationDocument,
} from "@/types/database";

export type AdminQueueSummary = {
  pendingListings: number;
  pendingKyc: number;
  pendingDocuments: number;
  source: "supabase" | "demo";
};

export type PropertyReviewBundle = {
  property: Property;
  owner: Profile | null;
  documents: VerificationDocument[];
};

export type KycReviewBundle = {
  profile: Profile;
  documents: VerificationDocument[];
  properties: Property[];
};

export async function getAdminQueueSummary(): Promise<AdminQueueSummary> {
  if (!hasSupabaseEnv()) {
    const state = getDemoAdminState();
    return {
      pendingListings: state.properties.filter(
        (p) => p.verification_status === "pending",
      ).length,
      pendingKyc: state.profiles.filter((p) => p.kyc_status === "pending")
        .length,
      pendingDocuments: state.documents.filter((d) => d.status === "pending")
        .length,
      source: "demo",
    };
  }

  const supabase = await createClient();
  const [listings, kyc, docs] = await Promise.all([
    supabase
      .from("properties")
      .select("*", { count: "exact", head: true })
      .eq("verification_status", "pending"),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("kyc_status", "pending")
      .in("role", ["landlord", "agent"]),
    supabase
      .from("verification_documents")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
  ]);

  return {
    pendingListings: listings.count ?? 0,
    pendingKyc: kyc.count ?? 0,
    pendingDocuments: docs.count ?? 0,
    source: "supabase",
  };
}

export async function listPendingProperties(): Promise<{
  items: Property[];
  source: "supabase" | "demo";
}> {
  if (!hasSupabaseEnv()) {
    return {
      items: getDemoAdminState().properties.filter(
        (p) => p.verification_status === "pending",
      ),
      source: "demo",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("verification_status", "pending")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("listPendingProperties:", error.message);
    return { items: [], source: "supabase" };
  }

  return { items: data ?? [], source: "supabase" };
}

export async function getPropertyReview(
  propertyId: string,
): Promise<{ bundle: PropertyReviewBundle | null; source: "supabase" | "demo" }> {
  if (!hasSupabaseEnv()) {
    const state = getDemoAdminState();
    const property =
      state.properties.find((p) => p.id === propertyId) ?? null;
    if (!property) return { bundle: null, source: "demo" };
    const owner =
      state.profiles.find((p) => p.id === property.owner_id) ?? null;
    const documents = state.documents.filter(
      (d) => d.property_id === propertyId || d.user_id === property.owner_id,
    );
    return { bundle: { property, owner, documents }, source: "demo" };
  }

  const supabase = await createClient();
  const { data: property, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", propertyId)
    .maybeSingle();

  if (error || !property) {
    return { bundle: null, source: "supabase" };
  }

  const [{ data: owner }, { data: documents }] = await Promise.all([
    supabase
      .from("profiles")
      .select("*")
      .eq("id", property.owner_id)
      .maybeSingle(),
    supabase
      .from("verification_documents")
      .select("*")
      .or(`property_id.eq.${propertyId},user_id.eq.${property.owner_id}`)
      .order("submitted_at", { ascending: false }),
  ]);

  return {
    bundle: {
      property,
      owner: owner ?? null,
      documents: documents ?? [],
    },
    source: "supabase",
  };
}

export async function listPendingKyc(): Promise<{
  items: Profile[];
  source: "supabase" | "demo";
}> {
  if (!hasSupabaseEnv()) {
    return {
      items: getDemoAdminState().profiles.filter((p) => p.kyc_status === "pending"),
      source: "demo",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("kyc_status", "pending")
    .in("role", ["landlord", "agent"])
    .order("updated_at", { ascending: true });

  if (error) {
    console.error("listPendingKyc:", error.message);
    return { items: [], source: "supabase" };
  }

  return { items: data ?? [], source: "supabase" };
}

export async function getKycReview(
  userId: string,
): Promise<{ bundle: KycReviewBundle | null; source: "supabase" | "demo" }> {
  if (!hasSupabaseEnv()) {
    const state = getDemoAdminState();
    const profile = state.profiles.find((p) => p.id === userId) ?? null;
    if (!profile) return { bundle: null, source: "demo" };
    return {
      bundle: {
        profile,
        documents: state.documents.filter((d) => d.user_id === userId),
        properties: state.properties.filter((p) => p.owner_id === userId),
      },
      source: "demo",
    };
  }

  const supabase = await createClient();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error || !profile) {
    return { bundle: null, source: "supabase" };
  }

  const [{ data: documents }, { data: properties }] = await Promise.all([
    supabase
      .from("verification_documents")
      .select("*")
      .eq("user_id", userId)
      .order("submitted_at", { ascending: false }),
    supabase
      .from("properties")
      .select("*")
      .eq("owner_id", userId)
      .order("created_at", { ascending: false }),
  ]);

  return {
    bundle: {
      profile,
      documents: documents ?? [],
      properties: properties ?? [],
    },
    source: "supabase",
  };
}

export async function listRecentAdminActions(limit = 8): Promise<{
  items: AdminAction[];
  source: "supabase" | "demo";
}> {
  if (!hasSupabaseEnv()) {
    return {
      items: getDemoAdminState().actions.slice(0, limit),
      source: "demo",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("admin_actions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("listRecentAdminActions:", error.message);
    return { items: [], source: "supabase" };
  }

  return { items: data ?? [], source: "supabase" };
}
