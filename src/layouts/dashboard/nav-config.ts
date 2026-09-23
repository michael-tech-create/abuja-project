import type { UserRole } from "@/types/database";

export type DashboardNavItem = {
  title: string;
  path: string;
  icon: "dashboard" | "browse" | "listings" | "kyc" | "messages" | "admin" | "home";
};

export function getDashboardNav(role: UserRole): DashboardNavItem[] {
  const base: DashboardNavItem[] = [
    { title: "Overview", path: "/dashboard", icon: "dashboard" },
    { title: "Browse", path: "/browse", icon: "browse" },
    { title: "Messages", path: "/messages", icon: "messages" },
  ];

  if (role === "landlord" || role === "agent" || role === "admin") {
    base.push(
      { title: "Listings", path: "/dashboard/listings", icon: "listings" },
      { title: "KYC / NIN", path: "/dashboard/kyc", icon: "kyc" },
    );
  }

  if (role === "admin") {
    base.push({ title: "Admin", path: "/admin", icon: "admin" });
  }

  base.push({ title: "Home site", path: "/", icon: "home" });
  return base;
}
