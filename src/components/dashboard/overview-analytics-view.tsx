"use client";

import { useCallback, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import HomeWorkRoundedIcon from "@mui/icons-material/HomeWorkRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import ChatBubbleRoundedIcon from "@mui/icons-material/ChatBubbleRounded";
import ReviewsRoundedIcon from "@mui/icons-material/ReviewsRounded";
import PublishedWithChangesRoundedIcon from "@mui/icons-material/PublishedWithChangesRounded";
import PendingActionsRoundedIcon from "@mui/icons-material/PendingActionsRounded";
import { BarChart } from "@mui/x-charts/BarChart";
import { PieChart } from "@mui/x-charts/PieChart";

import { DashboardActions } from "@/components/dashboard/dashboard-actions";
import { WidgetSummary } from "@/components/dashboard/widget-summary";
import type { DashboardStats } from "@/lib/dashboard/stats";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { canManageListings } from "@/lib/properties/access";
import type { Profile } from "@/types/database";

type OverviewAnalyticsViewProps = {
  profile: Profile;
  initial: DashboardStats;
  userId: string;
  refreshAction: () => Promise<DashboardStats>;
};

export function OverviewAnalyticsView({
  profile,
  initial,
  userId,
  refreshAction,
}: OverviewAnalyticsViewProps) {
  const [stats, setStats] = useState(initial);
  const lister = canManageListings(profile);

  const refresh = useCallback(async () => {
    try {
      setStats(await refreshAction());
    } catch {
      // keep last snapshot
    }
  }, [refreshAction]);

  useEffect(() => {
    setStats(initial);
  }, [initial]);

  useEffect(() => {
    if (!hasSupabaseEnv()) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`minimal-dashboard:${userId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "properties" }, () =>
        void refresh(),
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, () =>
        void refresh(),
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "favorites" }, () =>
        void refresh(),
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "reviews" }, () =>
        void refresh(),
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId, refresh]);

  const spark = (n: number) =>
    Array.from({ length: 8 }, (_, i) => Math.max(0, n - (7 - i) + (i % 3)));

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: { xs: 3, md: 4 }, fontWeight: 800 }}>
        Hi, {profile.full_name.split(" ")[0]} 👋
      </Typography>

      <Grid container spacing={3}>
        {lister ? (
          <>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <WidgetSummary
                title="Total listings"
                total={stats.listingsTotal}
                percent={2.6}
                color="primary"
                icon={<HomeWorkRoundedIcon sx={{ fontSize: 40 }} />}
                chart={{ data: spark(stats.listingsTotal || 2) }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <WidgetSummary
                title="Published"
                total={stats.listingsPublished}
                percent={1.8}
                color="success"
                icon={<PublishedWithChangesRoundedIcon sx={{ fontSize: 40 }} />}
                chart={{ data: spark(stats.listingsPublished || 1) }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <WidgetSummary
                title="Likes received"
                total={stats.favoritesOnListings}
                percent={3.2}
                color="warning"
                icon={<FavoriteRoundedIcon sx={{ fontSize: 40 }} />}
                chart={{ data: spark(stats.favoritesOnListings || 3) }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <WidgetSummary
                title="Unread messages"
                total={stats.unreadMessages}
                percent={stats.unreadMessages ? 4.1 : 0}
                color="error"
                icon={<ChatBubbleRoundedIcon sx={{ fontSize: 40 }} />}
                chart={{ data: spark(stats.unreadMessages || 2) }}
              />
            </Grid>
          </>
        ) : (
          <>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <WidgetSummary
                title="Saved homes"
                total={stats.favoritesOnListings}
                percent={2.1}
                color="primary"
                icon={<FavoriteRoundedIcon sx={{ fontSize: 40 }} />}
                chart={{ data: spark(stats.favoritesOnListings || 2) }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <WidgetSummary
                title="Conversations"
                total={stats.conversations}
                percent={1.4}
                color="info"
                icon={<ChatBubbleRoundedIcon sx={{ fontSize: 40 }} />}
                chart={{ data: spark(stats.conversations || 2) }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <WidgetSummary
                title="Reviews written"
                total={stats.reviewsReceived}
                percent={0.8}
                color="success"
                icon={<ReviewsRoundedIcon sx={{ fontSize: 40 }} />}
                chart={{ data: spark(stats.reviewsReceived || 1) }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <WidgetSummary
                title="Unread chats"
                total={stats.unreadMessages}
                percent={stats.unreadMessages ? 2.2 : 0}
                color="warning"
                icon={<PendingActionsRoundedIcon sx={{ fontSize: 40 }} />}
                chart={{ data: spark(stats.unreadMessages || 1) }}
              />
            </Grid>
          </>
        )}

        {lister && (
          <>
            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <Card elevation={0} sx={{ height: "100%", p: 1 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                    Listings by status
                  </Typography>
                  {stats.listingsByStatus.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      Create a listing to populate this chart.
                    </Typography>
                  ) : (
                    <Box sx={{ height: 280 }}>
                      <PieChart
                        series={[
                          {
                            innerRadius: 50,
                            data: stats.listingsByStatus.map((row, id) => ({
                              id,
                              value: row.count,
                              label: row.status,
                            })),
                          },
                        ]}
                        height={260}
                      />
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 6, lg: 8 }}>
              <Card elevation={0} sx={{ height: "100%", p: 1 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 700 }}>
                    Listings created
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Monthly activity for your account
                  </Typography>
                  {stats.listingsByMonth.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No timeline yet.
                    </Typography>
                  ) : (
                    <Box sx={{ height: 280 }}>
                      <BarChart
                        xAxis={[
                          {
                            scaleType: "band",
                            data: stats.listingsByMonth.map((m) => m.month),
                          },
                        ]}
                        series={[
                          {
                            data: stats.listingsByMonth.map((m) => m.count),
                            label: "Listings",
                            color: "#0b7a3e",
                          },
                        ]}
                        height={260}
                      />
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </>
        )}

        {profile.role === "admin" && (
          <>
            <Grid size={{ xs: 12, sm: 6 }}>
              <WidgetSummary
                title="Pending KYC"
                total={stats.pendingKyc}
                color="warning"
                icon={<PendingActionsRoundedIcon sx={{ fontSize: 40 }} />}
                chart={{ data: spark(stats.pendingKyc || 2) }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <WidgetSummary
                title="Pending listings"
                total={stats.pendingListingsAdmin}
                color="error"
                icon={<HomeWorkRoundedIcon sx={{ fontSize: 40 }} />}
                chart={{ data: spark(stats.pendingListingsAdmin || 2) }}
              />
            </Grid>
          </>
        )}

        <Grid size={{ xs: 12 }}>
          <Card elevation={0} sx={{ p: 2.5 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
              Quick actions
            </Typography>
            <DashboardActions isLister={lister} role={profile.role} />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: "block" }}>
              Charts refresh in realtime when listings, chats, likes, or reviews change.
            </Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={0} sx={{ p: 2.5, height: "100%" }}>
            <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 700 }}>
              Profile
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Email: {profile.email}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Phone: {profile.phone ?? "—"}
            </Typography>
            {profile.company_name && (
              <Typography variant="body2" color="text.secondary">
                Company: {profile.company_name}
              </Typography>
            )}
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={0} sx={{ p: 2.5, height: "100%" }}>
            <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 700 }}>
              Tips
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              · Verify NIN under KYC to unlock publishing.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              · Drop a map pin so tenants can navigate to your building.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              · Use multi-unit posts for estates with several apartments.
            </Typography>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
