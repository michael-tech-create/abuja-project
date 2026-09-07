import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth/auth-shell";
import { OnboardingForm } from "@/components/auth/onboarding-form";
import { getCurrentProfile, getSessionUser } from "@/lib/auth/session";
import { getSchemaStatus } from "@/lib/supabase/schema";

export const metadata: Metadata = {
  title: "Complete your profile",
};

export default async function OnboardingPage() {
  const schema = await getSchemaStatus();
  if (!schema.ok) {
    redirect("/setup");
  }

  const user = await getSessionUser();
  if (!user) {
    redirect("/auth/login");
  }

  const profile = await getCurrentProfile();
  if (!profile) {
    // Auth succeeded but profile row missing (trigger not installed / schema incomplete)
    redirect("/setup");
  }

  if (profile.onboarding_completed) {
    redirect("/dashboard");
  }

  return (
    <AuthShell
      title="Complete your profile"
      description="Add a phone number so landlords and tenants can trust and reach you. This takes under a minute."
    >
      <OnboardingForm profile={profile} />
    </AuthShell>
  );
}
