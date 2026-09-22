import type { Metadata } from "next";
import Link from "next/link";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

import { BrowseMapLoader } from "@/components/browse/browse-map-loader";
import { PropertyCard } from "@/components/browse/property-card";
import { SearchFilters } from "@/components/browse/search-filters";
import { SiteHeader } from "@/components/layout/site-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getCurrentProfile, getSessionUser } from "@/lib/auth/session";
import { getFavoritePropertyIds } from "@/lib/favorites/queries";
import { searchPublicProperties } from "@/lib/properties/queries";
import { parseSearchParams } from "@/lib/properties/search";
import { getUnitSummaries } from "@/lib/properties/units";

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
  const unitSummary = await getUnitSummaries(properties.map((p) => p.id));

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader profile={profile} />
      <main className="mx-auto w-full max-w-6xl flex-1 space-y-8 px-6 py-10">
        <div className="space-y-2">
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Browse Abuja rentals
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ maxWidth: 640 }}
          >
            Filter by district and budget. Like homes, open map pins, and navigate
            to buildings with real coordinates.
          </Typography>
        </div>

        {source === "demo" && (
          <Alert className="rounded-3xl border-border/70 bg-card">
            <AlertTitle>Demo listings</AlertTitle>
            <AlertDescription>
              Sample verified properties are shown when live data is empty.
            </AlertDescription>
          </Alert>
        )}

        <SearchFilters filters={filters} resultCount={properties.length} />

        {properties.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border px-6 py-16 text-center">
            <h2 className="text-lg font-medium">No listings match</h2>
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
          <Grid container spacing={2.5}>
            {properties.map((property) => {
              const summary = unitSummary.get(property.id);
              return (
                <Grid key={property.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                  <PropertyCard
                    property={property}
                    showLike={Boolean(user)}
                    liked={likedIds.has(property.id)}
                    unitCount={
                      property.is_multi_unit
                        ? summary?.count
                        : undefined
                    }
                    fromPrice={
                      property.is_multi_unit
                        ? summary?.fromPrice
                        : undefined
                    }
                  />
                </Grid>
              );
            })}
          </Grid>
        )}
      </main>
    </div>
  );
}
