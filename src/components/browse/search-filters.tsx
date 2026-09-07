import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  countActiveFilters,
  filtersToQueryString,
  type PropertySearchFilters,
} from "@/lib/properties/search";
import { ABUJA_DISTRICTS, PROPERTY_TYPES } from "@/types/database";

type SearchFiltersProps = {
  filters: PropertySearchFilters;
  resultCount: number;
};

const selectClassName =
  "flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function SearchFilters({ filters, resultCount }: SearchFiltersProps) {
  const active = countActiveFilters(filters);
  const gridHref = `/browse${filtersToQueryString({ ...filters, view: "grid" })}`;
  const mapHref = `/browse${filtersToQueryString({ ...filters, view: "map" })}`;

  return (
    <div className="space-y-4">
      <form
        method="get"
        action="/browse"
        className="soft-card grid gap-3 p-4 md:grid-cols-2 lg:grid-cols-6"
      >
        <input type="hidden" name="view" value={filters.view} />

        <div className="space-y-1.5 lg:col-span-2">
          <Label htmlFor="q">Search</Label>
          <Input
            id="q"
            name="q"
            placeholder="Estate, street, keyword…"
            defaultValue={filters.q}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="district">District</Label>
          <select
            id="district"
            name="district"
            defaultValue={filters.district ?? ""}
            className={selectClassName}
          >
            <option value="">All districts</option>
            {ABUJA_DISTRICTS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="type">Type</Label>
          <select
            id="type"
            name="type"
            defaultValue={filters.type ?? ""}
            className={selectClassName}
          >
            <option value="">All types</option>
            {PROPERTY_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="minPrice">Min rent (₦/yr)</Label>
          <Input
            id="minPrice"
            name="minPrice"
            type="number"
            min={0}
            step={100000}
            placeholder="e.g. 2000000"
            defaultValue={filters.minPrice ?? ""}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="maxPrice">Max rent (₦/yr)</Label>
          <Input
            id="maxPrice"
            name="maxPrice"
            type="number"
            min={0}
            step={100000}
            placeholder="e.g. 10000000"
            defaultValue={filters.maxPrice ?? ""}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="beds">Min beds</Label>
          <select
            id="beds"
            name="beds"
            defaultValue={filters.beds ?? ""}
            className={selectClassName}
          >
            <option value="">Any</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}+
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="sort">Sort</Label>
          <select
            id="sort"
            name="sort"
            defaultValue={filters.sort}
            className={selectClassName}
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
          </select>
        </div>

        <div className="flex items-end gap-2 md:col-span-2 lg:col-span-4">
          <Button type="submit" className="h-8">
            Apply filters
          </Button>
          {active > 0 && (
            <Link
              href={`/browse${filters.view === "map" ? "?view=map" : ""}`}
              className="inline-flex h-8 items-center rounded-lg border border-border px-3 text-sm font-medium hover:bg-muted"
            >
              Clear ({active})
            </Link>
          )}
        </div>
      </form>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{resultCount}</span>{" "}
          verified listing{resultCount === 1 ? "" : "s"}
        </p>
        <div className="inline-flex rounded-lg border border-border p-0.5">
          <Link
            href={gridHref}
            className={`inline-flex h-7 items-center rounded-md px-3 text-sm font-medium ${
              filters.view === "grid"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            }`}
          >
            Grid
          </Link>
          <Link
            href={mapHref}
            className={`inline-flex h-7 items-center rounded-md px-3 text-sm font-medium ${
              filters.view === "map"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            }`}
          >
            Map
          </Link>
        </div>
      </div>
    </div>
  );
}
