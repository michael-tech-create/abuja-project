import { redirect } from "next/navigation";

import { getCurrentProfile, getSessionUser } from "@/lib/auth/session";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import type { Profile } from "@/types/database";

export function isAdminProfile(profile: Profile | null | undefined) {
  return profile?.role === "admin";
}

/** Demo portal is open when Supabase is not configured. */
export async function requireAdminAccess(): Promise<{
  profile: Profile | null;
  userId: string;
  source: "supabase" | "demo";
}> {
  if (!hasSupabaseEnv()) {
    return {
      profile: {
        id: "demo-admin",
        role: "admin",
        full_name: "Demo Admin",
        email: "admin@abujarentals.demo",
        phone: "+2348000000000",
        avatar_url: null,
        company_name: "AbujaRentals Ops",
        bio: null,
        kyc_status: "verified",
        is_active: true,
        onboarding_completed: true,
        nin_number: null,
        nin_verified_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      userId: "demo-admin",
      source: "demo",
    };
  }

  const user = await getSessionUser();
  if (!user) {
    redirect("/auth/login?next=/admin");
  }

  const profile = await getCurrentProfile();
  if (!profile?.onboarding_completed) {
    redirect("/onboarding");
  }
  if (!isAdminProfile(profile)) {
    redirect("/dashboard");
  }

  return { profile, userId: user.id, source: "supabase" };
}
