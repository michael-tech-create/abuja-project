import type { Metadata } from "next";

import { OverviewAnalyticsView } from "@/components/dashboard/overview-analytics-view";
import { getCurrentProfile, getSessionUser } from "@/lib/auth/session";
import { refreshDashboardStatsAction } from "@/lib/dashboard/actions";
import { getDashboardStats } from "@/lib/dashboard/stats";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  // Auth/onboarding gated by dashboard/layout.tsx
  const user = await getSessionUser();
  const profile = await getCurrentProfile();
  if (!user || !profile) return null;

  const stats = await getDashboardStats(profile);

  return (
    <OverviewAnalyticsView
      profile={profile}
      initial={stats}
      userId={user.id}
      refreshAction={refreshDashboardStatsAction}
    />
  );
}
