import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { PropertyForm } from "@/components/properties/property-form";
import { canManageListings } from "@/lib/properties/access";
import { getCurrentProfile, getSessionUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "New listing",
};

export default async function NewListingPage() {
  const user = await getSessionUser();
  if (!user) redirect("/auth/login");

  const profile = await getCurrentProfile();
  if (!profile) redirect("/auth/login");
  if (!profile.onboarding_completed) redirect("/onboarding");
  if (!canManageListings(profile)) redirect("/dashboard");

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        <div className="mb-8 space-y-2">
          <Link
            href="/dashboard/listings"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to listings
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">New listing</h1>
          <p className="text-sm text-muted-foreground">
            Upload photos and details. Verification starts as pending.
          </p>
        </div>
        <PropertyForm mode="create" ownerId={user.id} />
      </main>
    </div>
  );
}
