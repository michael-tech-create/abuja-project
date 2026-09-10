import type { Metadata } from "next";
import Link from "next/link";

import { BrowseMapLoader } from "@/components/browse/browse-map-loader";
import { PropertyCard } from "@/components/browse/property-card";
import { SearchFilters } from "@/components/browse/search-filters";
import { SiteHeader } from "@/components/layout/site-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getCurrentProfile, getSessionUser } from "@/lib/auth/session";
import { getFavoritePropertyIds } from "@/lib/favorites/queries";
import { searchPublicProperties } from "@/lib/properties/queries";
import { parseSearchParams } from "@/lib/properties/search";

export const metadata: Metadata = {
  title: "Browse verified rentals",
  description:
    "Search verified estates, apartments, and commercial rentals across Abuja districts.",
};

type BrowsePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const raw = await searchParams;
  const filters = parseSearchParams(raw);
  const profile = await getCurrentProfile();
  const user = await getSessionUser();
  const { properties, source } = await searchPublicProperties(filters);
  const likedIds = user
    ? await getFavoritePropertyIds(user.id)
    : new Set<string>();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader profile={profile} />
      <main className="mx-auto w-full max-w-6xl flex-1 space-y-8 px-6 py-10">
        <div className="space-y-2">
          <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            Browse Abuja rentals
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
            Filter by district, budget class (Budget → Luxury), and type. Like
            homes you love and read resident reviews on each listing.
          </p>
        </div>

        {source === "demo" && (
          <Alert className="rounded-3xl border-border/70 bg-card">
            <AlertTitle>Demo listings</AlertTitle>
            <AlertDescription>
              Sample verified properties are shown when live data is empty or
              unavailable.
            </AlertDescription>
          </Alert>
        )}

        <SearchFilters filters={filters} resultCount={properties.length} />

        {properties.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border px-6 py-16 text-center">
            <h2 className="text-lg font-medium">No listings match</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Try another budget class or clear district filters.
            </p>
            <Link
              href="/browse"
              className="mt-6 inline-flex h-9 items-center rounded-lg border border-border px-3 text-sm font-medium hover:bg-muted"
            >
              Reset filters
            </Link>
          </div>
        ) : filters.view === "map" ? (
          <BrowseMapLoader properties={properties} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                showLike={Boolean(user)}
                liked={likedIds.has(property.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
