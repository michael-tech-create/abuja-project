import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { PropertyForm } from "@/components/properties/property-form";
import { SiteHeader } from "@/components/layout/site-header";
import { canManageListings } from "@/lib/properties/access";
import { getManageableProperty } from "@/lib/properties/queries";
import { getUnitsForProperty } from "@/lib/properties/units";
import { getCurrentProfile, getSessionUser } from "@/lib/auth/session";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Edit listing",
};

export default async function EditListingPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) redirect("/auth/login");

  const profile = await getCurrentProfile();
  if (!profile) redirect("/auth/login");
  if (!profile.onboarding_completed) redirect("/onboarding");
  if (!canManageListings(profile)) redirect("/dashboard");

  const property = await getManageableProperty(
    user.id,
    id,
    profile.role === "admin",
  );

  if (!property) notFound();

  const units = await getUnitsForProperty(property.id);

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader profile={profile} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        <div className="mb-8 space-y-2">
          <Link
            href={`/dashboard/listings/${property.id}`}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to listing
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">Edit listing</h1>
          <p className="text-sm text-muted-foreground">
            Update pin location, apartments in the building, photos, and details.
          </p>
        </div>
        <PropertyForm
          mode="edit"
          ownerId={property.owner_id}
          property={property}
          initialUnits={units}
        />
      </main>
    </div>
  );
}
