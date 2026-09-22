import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/types/database";

export type DashboardStats = {
  role: UserRole;
  listingsTotal: number;
  listingsPublished: number;
  listingsPending: number;
  favoritesOnListings: number;
  unreadMessages: number;
  conversations: number;
  reviewsReceived: number;
  listingsByStatus: { status: string; count: number }[];
  listingsByMonth: { month: string; count: number }[];
  pendingKyc: number;
  pendingListingsAdmin: number;
};

export async function getDashboardStats(
  profile: Profile,
): Promise<DashboardStats> {
  const empty: DashboardStats = {
    role: profile.role,
    listingsTotal: 0,
    listingsPublished: 0,
    listingsPending: 0,
    favoritesOnListings: 0,
    unreadMessages: 0,
    conversations: 0,
    reviewsReceived: 0,
    listingsByStatus: [],
    listingsByMonth: [],
    pendingKyc: 0,
    pendingListingsAdmin: 0,
  };

  if (!hasSupabaseEnv()) return empty;

  const supabase = await createClient();
  const userId = profile.id;

  if (profile.role === "landlord" || profile.role === "agent" || profile.role === "admin") {
    const { data: listings } = await supabase
      .from("properties")
      .select("id, verification_status, is_published, created_at")
      .eq("owner_id", userId);

    const mine = listings ?? [];
    const ids = mine.map((l) => l.id);

    const statusMap = new Map<string, number>();
    const monthMap = new Map<string, number>();
    for (const l of mine) {
      const key = l.is_published
        ? "published"
        : l.verification_status === "rejected"
          ? "rejected"
          : "draft/pending";
      statusMap.set(key, (statusMap.get(key) ?? 0) + 1);
      const month = new Date(l.created_at).toLocaleString("en-NG", {
        month: "short",
        year: "2-digit",
      });
      monthMap.set(month, (monthMap.get(month) ?? 0) + 1);
    }

    let favoritesOnListings = 0;
    let reviewsReceived = 0;
    if (ids.length) {
      const [{ count: favCount }, { count: reviewCount }] = await Promise.all([
        supabase
          .from("favorites")
          .select("*", { count: "exact", head: true })
          .in("property_id", ids),
        supabase
          .from("reviews")
          .select("*", { count: "exact", head: true })
          .in("property_id", ids),
      ]);
      favoritesOnListings = favCount ?? 0;
      reviewsReceived = reviewCount ?? 0;
    }

    const { data: convos } = await supabase
      .from("conversations")
      .select("id")
      .eq("landlord_id", userId);
    const convoIds = (convos ?? []).map((c) => c.id);

    let unreadMessages = 0;
    if (convoIds.length) {
      const { count } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .in("conversation_id", convoIds)
        .eq("is_read", false)
        .neq("sender_id", userId);
      unreadMessages = count ?? 0;
    }

    let pendingKyc = 0;
    let pendingListingsAdmin = 0;
    if (profile.role === "admin") {
      const [kyc, pending] = await Promise.all([
        supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("kyc_status", "pending"),
        supabase
          .from("properties")
          .select("*", { count: "exact", head: true })
          .eq("verification_status", "pending"),
      ]);
      pendingKyc = kyc.count ?? 0;
      pendingListingsAdmin = pending.count ?? 0;
    }

    return {
      role: profile.role,
      listingsTotal: mine.length,
      listingsPublished: mine.filter((l) => l.is_published).length,
      listingsPending: mine.filter((l) => !l.is_published).length,
      favoritesOnListings,
      unreadMessages,
      conversations: convoIds.length,
      reviewsReceived,
      listingsByStatus: [...statusMap.entries()].map(([status, count]) => ({
        status,
        count,
      })),
      listingsByMonth: [...monthMap.entries()].map(([month, count]) => ({
        month,
        count,
      })),
      pendingKyc,
      pendingListingsAdmin,
    };
  }

  // Tenant
  const [{ count: favs }, { data: convos }, { count: reviews }] =
    await Promise.all([
      supabase
        .from("favorites")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId),
      supabase.from("conversations").select("id").eq("tenant_id", userId),
      supabase
        .from("reviews")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId),
    ]);

  const convoIds = (convos ?? []).map((c) => c.id);
  let unreadMessages = 0;
  if (convoIds.length) {
    const { count } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .in("conversation_id", convoIds)
      .eq("is_read", false)
      .neq("sender_id", userId);
    unreadMessages = count ?? 0;
  }

  return {
    ...empty,
    favoritesOnListings: favs ?? 0,
    conversations: convoIds.length,
    unreadMessages,
    reviewsReceived: reviews ?? 0,
  };
}
