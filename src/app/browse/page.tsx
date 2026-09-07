import type { Metadata } from "next";
import Link from "next/link";

import { BrowseMapLoader } from "@/components/browse/browse-map-loader";
import { PropertyCard } from "@/components/browse/property-card";
import { SearchFilters } from "@/components/browse/search-filters";
import { SiteHeader } from "@/components/layout/site-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getCurrentProfile } from "@/lib/auth/session";
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
  const { properties, source } = await searchPublicProperties(filters);

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader profile={profile} />
      <main className="mx-auto w-full max-w-6xl flex-1 space-y-8 px-6 py-10">
        <div className="space-y-2">
          <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            Browse Abuja rentals
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
            Only verified and published listings appear here. Filter by district,
            budget, and property type — switch to map view to explore by location.
          </p>
        </div>

        {source === "demo" && (
          <Alert className="rounded-3xl border-border/70 bg-card">
            <AlertTitle>Demo listings</AlertTitle>
            <AlertDescription>
              Supabase is not configured, so you are seeing sample verified
              properties. Connect `.env.local` and publish verified listings to
              replace this data.
            </AlertDescription>
          </Alert>
        )}

        <SearchFilters filters={filters} resultCount={properties.length} />

        {properties.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border px-6 py-16 text-center">
            <h2 className="text-lg font-medium">No listings match</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Try widening your budget or clearing a district filter. New
              verified homes appear here as admins approve them.
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
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
