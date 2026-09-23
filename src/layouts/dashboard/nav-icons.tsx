"use client";

import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import ExploreRoundedIcon from "@mui/icons-material/ExploreRounded";
import HomeWorkRoundedIcon from "@mui/icons-material/HomeWorkRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import ChatBubbleRoundedIcon from "@mui/icons-material/ChatBubbleRounded";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";

import type { DashboardNavItem } from "./nav-config";

export function NavIcon({
  name,
}: {
  name: DashboardNavItem["icon"];
}) {
  const sx = { fontSize: 22 };
  switch (name) {
    case "dashboard":
      return <DashboardRoundedIcon sx={sx} />;
    case "browse":
      return <ExploreRoundedIcon sx={sx} />;
    case "listings":
      return <HomeWorkRoundedIcon sx={sx} />;
    case "kyc":
      return <VerifiedUserRoundedIcon sx={sx} />;
    case "messages":
      return <ChatBubbleRoundedIcon sx={sx} />;
    case "admin":
      return <AdminPanelSettingsRoundedIcon sx={sx} />;
    case "home":
    default:
      return <HomeRoundedIcon sx={sx} />;
  }
}
