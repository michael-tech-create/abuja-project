import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { DashboardActions } from "@/components/dashboard/dashboard-actions";
import { StatsCharts } from "@/components/dashboard/stats-charts";
import { SiteHeader } from "@/components/layout/site-header";
import { getCurrentProfile, getSessionUser } from "@/lib/auth/session";
import { refreshDashboardStatsAction } from "@/lib/dashboard/actions";
import { getDashboardStats } from "@/lib/dashboard/stats";
import { canManageListings } from "@/lib/properties/access";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/auth/login");

  const profile = await getCurrentProfile();
  if (!profile) redirect("/auth/login");
  if (!profile.onboarding_completed) redirect("/onboarding");

  const stats = await getDashboardStats(profile);
  const lister = canManageListings(profile);

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader profile={profile} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <Stack spacing={3}>
          <Box>
            <Stack
              direction="row"
              spacing={1}
              useFlexGap
              sx={{ alignItems: "center", flexWrap: "wrap" }}
            >
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                Hello, {profile.full_name.split(" ")[0]}
              </Typography>
              <Chip size="small" label={profile.role} sx={{ textTransform: "capitalize" }} />
              <Chip
                size="small"
                color={profile.kyc_status === "verified" ? "secondary" : "default"}
                label={`KYC: ${profile.kyc_status}`}
                sx={{ textTransform: "capitalize" }}
              />
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Live analytics for your AbujaRentals activity.
            </Typography>
          </Box>

          <StatsCharts
            initial={stats}
            userId={user.id}
            refreshAction={refreshDashboardStatsAction}
          />

          <DashboardActions
            isLister={lister}
            role={profile.role}
          />

          <Card elevation={0}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                Profile
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Email: {profile.email}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Phone: {profile.phone}
              </Typography>
              {profile.company_name && (
                <Typography variant="body2" color="text.secondary">
                  Company: {profile.company_name}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Stack>
      </main>
    </div>
  );
}
