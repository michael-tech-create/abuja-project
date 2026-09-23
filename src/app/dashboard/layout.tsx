import { redirect } from "next/navigation";

import { DashboardShell } from "@/layouts/dashboard/dashboard-shell";
import { getCurrentProfile, getSessionUser } from "@/lib/auth/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/auth/login");

  const profile = await getCurrentProfile();
  if (!profile) redirect("/auth/login");
  if (!profile.onboarding_completed) redirect("/onboarding");

  return <DashboardShell profile={profile}>{children}</DashboardShell>;
}
