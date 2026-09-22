"use server";

import { getCurrentProfile } from "@/lib/auth/session";
import { getDashboardStats } from "@/lib/dashboard/stats";

export async function refreshDashboardStatsAction() {
  const profile = await getCurrentProfile();
  if (!profile) {
    throw new Error("Not signed in");
  }
  return getDashboardStats(profile);
}
