"use client";

import Link from "next/link";
import * as React from "react";

// MUI Imports
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BUDGET_TIERS } from "@/lib/properties/budget";
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

// Custom MUI styles to perfectly match your shadcn/tailwind "h-9" inputs
const muiSelectSx = {
  height: "36px", // matches h-9
  borderRadius: "calc(var(--radius) - 2px)",
  fontSize: "0.875rem", // text-sm
  backgroundColor: "transparent",
  "& .MuiSelect-select": {
    paddingTop: "6px",
    paddingBottom: "6px",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "hsl(var(--input))",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "hsl(var(--ring))",
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "hsl(var(--ring))",
    borderWidth: "1px",
  },
};

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
            key={`q-${filters.q ?? ""}`}
            id="q"
            name="q"
            placeholder="Estate, street, keyword…"
            defaultValue={filters.q}
            className="h-9"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="district">District</Label>
          <FormControl fullWidth>
            <Select
              key={`district-${filters.district ?? ""}`}
              id="district"
              name="district"
              defaultValue={filters.district ?? ""}
              displayEmpty
              sx={muiSelectSx}
              inputProps={{ "aria-label": "District" }}
            >
              <MenuItem value="">All districts</MenuItem>
              {ABUJA_DISTRICTS.map((d) => (
                <MenuItem key={d.value} value={d.value}>
                  {d.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="type">Type</Label>
          <FormControl fullWidth>
            <Select
              key={`type-${filters.type ?? ""}`}
              id="type"
              name="type"
              defaultValue={filters.type ?? ""}
              displayEmpty
              sx={muiSelectSx}
            >
              <MenuItem value="">All types</MenuItem>
              {PROPERTY_TYPES.map((t) => (
                <MenuItem key={t.value} value={t.value}>
                  {t.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="budget">Budget class</Label>
          <FormControl fullWidth>
            <Select
              key={`budget-${filters.budget ?? ""}`}
              id="budget"
              name="budget"
              defaultValue={filters.budget ?? ""}
              displayEmpty
              sx={muiSelectSx}
            >
              <MenuItem value="">All budgets</MenuItem>
              {BUDGET_TIERS.map((tier) => (
                <MenuItem key={tier.value} value={tier.value}>
                  {tier.label} — {tier.hint}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="minPrice">Min rent (₦/yr)</Label>
          <Input
            key={`min-${filters.minPrice ?? ""}`}
            id="minPrice"
            name="minPrice"
            type="number"
            min={0}
            step={100000}
            placeholder="e.g. 2000000"
            defaultValue={filters.minPrice ?? ""}
            className="h-9"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="maxPrice">Max rent (₦/yr)</Label>
          <Input
            key={`max-${filters.maxPrice ?? ""}`}
            id="maxPrice"
            name="maxPrice"
            type="number"
            min={0}
            step={100000}
            placeholder="e.g. 10000000"
            defaultValue={filters.maxPrice ?? ""}
            className="h-9"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="beds">Min beds</Label>
          <FormControl fullWidth>
            <Select
              key={`beds-${filters.beds ?? ""}`}
              id="beds"
              name="beds"
              defaultValue={filters.beds ?? ""}
              displayEmpty
              sx={muiSelectSx}
            >
              <MenuItem value="">Any</MenuItem>
              {[1, 2, 3, 4, 5].map((n) => (
                <MenuItem key={n} value={n}>
                  {n}+
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="sort">Sort</Label>
          <FormControl fullWidth>
            <Select
              key={`sort-${filters.sort ?? "newest"}`}
              id="sort"
              name="sort"
              defaultValue={filters.sort ?? "newest"}
              displayEmpty
              sx={muiSelectSx}
            >
              <MenuItem value="newest">Newest</MenuItem>
              <MenuItem value="price_asc">Price: low to high</MenuItem>
              <MenuItem value="price_desc">Price: high to low</MenuItem>
            </Select>
          </FormControl>
        </div>

        <div className="flex items-end gap-2 md:col-span-2 lg:col-span-4">
          <Button type="submit" className="h-9">
            Apply filters
          </Button>
          {active > 0 && (
            <Link
              href={`/browse${filters.view === "map" ? "?view=map" : ""}`}
              className="inline-flex h-9 items-center rounded-lg border border-border px-3 text-sm font-medium hover:bg-muted"
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