"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import { alpha, useTheme } from "@mui/material/styles";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import TrendingDownRoundedIcon from "@mui/icons-material/TrendingDownRounded";
import { SparkLineChart } from "@mui/x-charts/SparkLineChart";

type WidgetSummaryProps = {
  title: string;
  total: number | string;
  percent?: number;
  color?: "primary" | "info" | "warning" | "error" | "success";
  icon: React.ReactNode;
  chart?: {
    data: number[];
  };
};

const colorMap = {
  primary: "primary",
  info: "info",
  warning: "warning",
  error: "error",
  success: "success",
} as const;

export function WidgetSummary({
  title,
  total,
  percent = 0,
  color = "primary",
  icon,
  chart,
}: WidgetSummaryProps) {
  const theme = useTheme();
  const paletteKey = colorMap[color];
  const main = theme.palette[paletteKey]?.main ?? theme.palette.primary.main;
  const light = theme.palette[paletteKey]?.light ?? theme.palette.primary.light;

  return (
    <Card
      elevation={0}
      sx={{
        p: 3,
        height: "100%",
        position: "relative",
        overflow: "hidden",
        color: main,
        bgcolor: "common.white",
        backgroundImage: `linear-gradient(135deg, ${alpha(light, 0.55)}, ${alpha(main, 0.12)})`,
        border: `1px solid ${alpha(main, 0.12)}`,
      }}
    >
      <Box sx={{ width: 48, height: 48, mb: 2.5, color: main }}>{icon}</Box>

      {percent !== 0 && (
        <Box
          sx={{
            top: 16,
            right: 16,
            gap: 0.5,
            display: "flex",
            position: "absolute",
            alignItems: "center",
          }}
        >
          {percent < 0 ? (
            <TrendingDownRoundedIcon sx={{ fontSize: 18 }} />
          ) : (
            <TrendingUpRoundedIcon sx={{ fontSize: 18 }} />
          )}
          <Typography variant="subtitle2">
            {percent > 0 ? "+" : ""}
            {percent}%
          </Typography>
        </Box>
      )}

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <Box sx={{ flexGrow: 1, minWidth: 112 }}>
          <Typography variant="subtitle2" sx={{ mb: 0.75, opacity: 0.9 }}>
            {title}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            {total}
          </Typography>
        </Box>

        {chart && chart.data.length > 1 && (
          <Box sx={{ width: 84, height: 56 }}>
            <SparkLineChart
              data={chart.data}
              height={56}
              color={main}
              curve="natural"
              area
              sx={{
                ".MuiAreaElement-root": { fillOpacity: 0.2 },
              }}
            />
          </Box>
        )}
      </Box>
    </Card>
  );
}
