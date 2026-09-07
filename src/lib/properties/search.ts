import { z } from "zod";

import { ABUJA_DISTRICTS, PROPERTY_TYPES } from "@/types/database";
import type { AbujaDistrict, Property, PropertyType } from "@/types/database";

const districtValues = ABUJA_DISTRICTS.map((d) => d.value) as [
  AbujaDistrict,
  ...AbujaDistrict[],
];

const propertyTypeValues = PROPERTY_TYPES.map((t) => t.value) as [
  PropertyType,
  ...PropertyType[],
];

export const searchParamsSchema = z.object({
  q: z.string().trim().max(120).optional().default(""),
  district: z.enum(districtValues).optional(),
  type: z.enum(propertyTypeValues).optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  beds: z.coerce.number().int().min(0).max(20).optional(),
  sort: z
    .enum(["newest", "price_asc", "price_desc"])
    .optional()
    .default("newest"),
  view: z.enum(["grid", "map"]).optional().default("grid"),
});

export type PropertySearchFilters = z.infer<typeof searchParamsSchema>;

export function parseSearchParams(
  input: Record<string, string | string[] | undefined>,
): PropertySearchFilters {
  const flat: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(input)) {
    flat[key] = Array.isArray(value) ? value[0] : value;
  }

  const parsed = searchParamsSchema.safeParse({
    q: flat.q || undefined,
    district: flat.district || undefined,
    type: flat.type || undefined,
    minPrice: flat.minPrice || undefined,
    maxPrice: flat.maxPrice || undefined,
    beds: flat.beds || undefined,
    sort: flat.sort || undefined,
    view: flat.view || undefined,
  });

  if (!parsed.success) {
    return searchParamsSchema.parse({});
  }

  const data = parsed.data;
  if (
    data.minPrice != null &&
    data.maxPrice != null &&
    data.minPrice > data.maxPrice
  ) {
    return { ...data, maxPrice: data.minPrice, minPrice: data.maxPrice };
  }

  return data;
}

export function filtersToQueryString(filters: Partial<PropertySearchFilters>) {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.district) params.set("district", filters.district);
  if (filters.type) params.set("type", filters.type);
  if (filters.minPrice != null) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice != null) params.set("maxPrice", String(filters.maxPrice));
  if (filters.beds != null) params.set("beds", String(filters.beds));
  if (filters.sort && filters.sort !== "newest") params.set("sort", filters.sort);
  if (filters.view && filters.view !== "grid") params.set("view", filters.view);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function applyClientFilters(
  properties: Property[],
  filters: PropertySearchFilters,
): Property[] {
  let results = [...properties];

  if (filters.q) {
    const q = filters.q.toLowerCase();
    results = results.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.address_line?.toLowerCase().includes(q) ?? false),
    );
  }

  if (filters.district) {
    results = results.filter((p) => p.district === filters.district);
  }

  if (filters.type) {
    results = results.filter((p) => p.property_type === filters.type);
  }

  if (filters.minPrice != null) {
    results = results.filter((p) => Number(p.price) >= filters.minPrice!);
  }

  if (filters.maxPrice != null) {
    results = results.filter((p) => Number(p.price) <= filters.maxPrice!);
  }

  if (filters.beds != null) {
    results = results.filter(
      (p) => p.bedrooms != null && p.bedrooms >= filters.beds!,
    );
  }

  switch (filters.sort) {
    case "price_asc":
      results.sort((a, b) => Number(a.price) - Number(b.price));
      break;
    case "price_desc":
      results.sort((a, b) => Number(b.price) - Number(a.price));
      break;
    default:
      results.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
  }

  return results;
}

export function countActiveFilters(filters: PropertySearchFilters) {
  let count = 0;
  if (filters.q) count += 1;
  if (filters.district) count += 1;
  if (filters.type) count += 1;
  if (filters.minPrice != null) count += 1;
  if (filters.maxPrice != null) count += 1;
  if (filters.beds != null) count += 1;
  return count;
}
