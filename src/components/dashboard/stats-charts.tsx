"use client";

import { useCallback, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { BarChart } from "@mui/x-charts/BarChart";
import { PieChart } from "@mui/x-charts/PieChart";

import type { DashboardStats } from "@/lib/dashboard/stats";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/supabase/env";

type StatsChartsProps = {
  initial: DashboardStats;
  userId: string;
  refreshAction: () => Promise<DashboardStats>;
};

export function StatsCharts({
  initial,
  userId,
  refreshAction,
}: StatsChartsProps) {
  const [stats, setStats] = useState(initial);

  const refresh = useCallback(async () => {
    try {
      const next = await refreshAction();
      setStats(next);
    } catch {
      // keep last good snapshot
    }
  }, [refreshAction]);

  useEffect(() => {
    setStats(initial);
  }, [initial]);

  useEffect(() => {
    if (!hasSupabaseEnv()) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`dashboard-stats:${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "properties" },
        () => void refresh(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        () => void refresh(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "favorites" },
        () => void refresh(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reviews" },
        () => void refresh(),
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId, refresh]);

  const isLister =
    stats.role === "landlord" ||
    stats.role === "agent" ||
    stats.role === "admin";

  const kpi = isLister
    ? [
        { label: "Listings", value: stats.listingsTotal },
        { label: "Published", value: stats.listingsPublished },
        { label: "Likes received", value: stats.favoritesOnListings },
        { label: "Unread chats", value: stats.unreadMessages },
      ]
    : [
        { label: "Saved homes", value: stats.favoritesOnListings },
        { label: "Conversations", value: stats.conversations },
        { label: "Reviews written", value: stats.reviewsReceived },
        { label: "Unread chats", value: stats.unreadMessages },
      ];

  return (
    <Stack spacing={2.5}>
      <Grid container spacing={2}>
        {kpi.map((item) => (
          <Grid key={item.label} size={{ xs: 6, md: 3 }}>
            <Card elevation={0}>
              <CardContent>
                <Typography variant="caption" color="text.secondary">
                  {item.label}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                  {item.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {isLister && (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card elevation={0} sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                  Listings by status
                </Typography>
                {stats.listingsByStatus.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    Create a listing to see live charts.
                  </Typography>
                ) : (
                  <Box sx={{ width: "100%", height: 260 }}>
                    <PieChart
                      series={[
                        {
                          data: stats.listingsByStatus.map((row, i) => ({
                            id: i,
                            value: row.count,
                            label: row.status,
                          })),
                          innerRadius: 40,
                        },
                      ]}
                      height={240}
                    />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card elevation={0} sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                  Listings created (by month)
                </Typography>
                {stats.listingsByMonth.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No timeline data yet.
                  </Typography>
                ) : (
                  <Box sx={{ width: "100%", height: 260 }}>
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
                          color: "#5a7a4a",
                        },
                      ]}
                      height={240}
                    />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {stats.role === "admin" && (
        <Grid container spacing={2}>
          <Grid size={{ xs: 6 }}>
            <Card elevation={0}>
              <CardContent>
                <Typography variant="caption" color="text.secondary">
                  Pending KYC
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                  {stats.pendingKyc}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Card elevation={0}>
              <CardContent>
                <Typography variant="caption" color="text.secondary">
                  Pending listings
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                  {stats.pendingListingsAdmin}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Typography variant="caption" color="text.secondary">
        Charts update in realtime when listings, chats, likes, or reviews change.
      </Typography>
    </Stack>
  );
}
