import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ListingCard } from "@/components/properties/listing-card";
import { SiteHeader } from "@/components/layout/site-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { canManageListings } from "@/lib/properties/access";
import { getOwnedProperties } from "@/lib/properties/queries";
import { getCurrentProfile, getSessionUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "My listings",
};

type ListingsPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function ListingsPage({ searchParams }: ListingsPageProps) {
  const user = await getSessionUser();
  if (!user) redirect("/auth/login");

  const profile = await getCurrentProfile();
  if (!profile) redirect("/auth/login");
  if (!profile.onboarding_completed) redirect("/onboarding");
  if (!canManageListings(profile)) redirect("/dashboard");

  const properties =
    profile.role === "admin"
      ? await getOwnedProperties(user.id) // admin personal listings; full admin queue is separate
      : await getOwnedProperties(user.id);

  const { error } = await searchParams;

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader profile={profile} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">My listings</h1>
            <p className="text-sm text-muted-foreground">
              Create listings, then publish to Browse after your KYC is verified.
            </p>
          </div>
          <Link
            href="/dashboard/listings/new"
            className="inline-flex h-9 items-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/80"
          >
            New listing
          </Link>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {properties.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border px-6 py-16 text-center">
            <h2 className="text-lg font-medium text-foreground">No listings yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Add your first Abuja property with photos, rent, and district details.
              After KYC approval you can publish it to Browse yourself.
            </p>
            <Link
              href="/dashboard/listings/new"
              className="mt-6 inline-flex h-9 items-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/80"
            >
              Create listing
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => (
              <ListingCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
