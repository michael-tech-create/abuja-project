"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import ListItemButton from "@mui/material/ListItemButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { alpha, useTheme } from "@mui/material/styles";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";

import { BrandLogo } from "@/components/brand/brand-logo";
import { NavDropdown } from "@/components/layout/nav-dropdown";
import type { Profile } from "@/types/database";

import { getDashboardNav } from "./nav-config";
import { NavIcon } from "./nav-icons";

const NAV_WIDTH = 280;

type DashboardShellProps = {
  profile: Profile;
  children: React.ReactNode;
};

export function DashboardShell({ profile, children }: DashboardShellProps) {
  const theme = useTheme();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const nav = useMemo(() => getDashboardNav(profile.role), [profile.role]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const accountItems = nav.map((item) => ({
    href: item.path,
    label: item.title,
  }));

  const renderNav = (
    <Box
      sx={{
        height: 1,
        display: "flex",
        flexDirection: "column",
        px: 2.5,
        pt: 2.5,
        pb: 2,
      }}
    >
      <Box sx={{ mb: 3 }}>
        <BrandLogo href="/dashboard" imgClassName="h-11 w-auto rounded-lg" />
      </Box>

      <Box
        sx={{
          mb: 2.5,
          p: 2,
          borderRadius: 2,
          bgcolor: alpha(theme.palette.primary.main, 0.08),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
        }}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          <Avatar sx={{ bgcolor: "primary.main", width: 40, height: 40 }}>
            {profile.full_name.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700 }}>
              {profile.full_name}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ textTransform: "capitalize" }}
            >
              {profile.role} · KYC {profile.kyc_status}
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Box
        component="nav"
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 0.5,
          flex: "1 1 auto",
        }}
      >
        {nav.map((item) => {
          const active =
            item.path === "/dashboard"
              ? pathname === "/dashboard"
              : pathname === item.path || pathname.startsWith(`${item.path}/`);

          return (
            <ListItemButton
              key={item.path}
              component={Link}
              href={item.path}
              sx={{
                pl: 2,
                pr: 1.5,
                py: 1.1,
                gap: 1.5,
                borderRadius: 1.5,
                typography: "body2",
                fontWeight: active ? 700 : 500,
                color: active ? "primary.main" : "text.secondary",
                bgcolor: active
                  ? alpha(theme.palette.primary.main, 0.1)
                  : "transparent",
                "&:hover": {
                  bgcolor: alpha(theme.palette.primary.main, 0.14),
                  color: "primary.main",
                },
              }}
            >
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  display: "grid",
                  placeItems: "center",
                  color: "inherit",
                }}
              >
                <NavIcon name={item.icon} />
              </Box>
              <Box component="span" sx={{ flexGrow: 1 }}>
                {item.title}
              </Box>
            </ListItemButton>
          );
        })}
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
      }}
    >
      {/* Top bar */}
      <Box
        component="header"
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          height: 64,
          px: { xs: 2, md: 3 },
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          bgcolor: alpha("#ffffff", 0.92),
          backdropFilter: "blur(10px)",
          borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
          pl: { lg: `calc(${NAV_WIDTH}px + 24px)` },
        }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <IconButton
            onClick={() => setOpen(true)}
            sx={{ display: { lg: "none" }, color: "primary.main" }}
          >
            <MenuRoundedIcon />
          </IconButton>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 700, display: { xs: "none", sm: "block" } }}
          >
            Dashboard
          </Typography>
        </Stack>

        <NavDropdown label="Account" items={accountItems} showSignOut />
      </Box>

      {/* Desktop sidebar */}
      <Box
        sx={{
          display: { xs: "none", lg: "flex" },
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: NAV_WIDTH,
          borderRight: `1px solid ${alpha(theme.palette.grey[500], 0.16)}`,
          bgcolor: "background.paper",
          zIndex: 30,
        }}
      >
        {renderNav}
      </Box>

      {/* Mobile drawer */}
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        slotProps={{
          paper: {
            sx: {
              width: NAV_WIDTH,
              bgcolor: "background.paper",
            },
          },
        }}
      >
        {renderNav}
      </Drawer>

      <Box
        component="main"
        sx={{
          flex: "1 1 auto",
          px: { xs: 2, md: 3 },
          py: { xs: 3, md: 4 },
          width: 1,
          pl: { lg: `calc(${NAV_WIDTH}px + 24px)` },
          pr: { lg: 3 },
        }}
      >
        <Box sx={{ maxWidth: 1400, mx: "auto", width: 1 }}>{children}</Box>
      </Box>
    </Box>
  );
}
