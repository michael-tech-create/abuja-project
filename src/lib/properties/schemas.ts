import { z } from "zod";

import { ABUJA_DISTRICTS, PROPERTY_TYPES } from "@/types/database";

const districtValues = ABUJA_DISTRICTS.map((d) => d.value) as [
  (typeof ABUJA_DISTRICTS)[number]["value"],
  ...(typeof ABUJA_DISTRICTS)[number]["value"][],
];

const propertyTypeValues = PROPERTY_TYPES.map((t) => t.value) as [
  (typeof PROPERTY_TYPES)[number]["value"],
  ...(typeof PROPERTY_TYPES)[number]["value"][],
];

const optionalNonNegInt = z.preprocess((val) => {
  if (val === "" || val === null || val === undefined) return null;
  return val;
}, z.coerce.number().int().min(0).max(50).nullable());

const optionalPositiveNumber = z.preprocess((val) => {
  if (val === "" || val === null || val === undefined) return null;
  return val;
}, z.coerce.number().positive().max(100_000).nullable());

export const propertyFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(120),
  description: z
    .string()
    .min(30, "Description must be at least 30 characters")
    .max(5000),
  propertyType: z.enum(propertyTypeValues),
  district: z.enum(districtValues),
  addressLine: z.string().max(200).optional().or(z.literal("")),
  price: z.coerce
    .number({ message: "Enter a valid price" })
    .positive("Price must be greater than 0")
    .max(1_000_000_000, "Price looks too high"),
  bedrooms: optionalNonNegInt,
  bathrooms: optionalNonNegInt,
  areaSqm: optionalPositiveNumber,
  amenities: z.array(z.string()).default([]),
  existingImages: z.array(z.string().min(1)).default([]),
});

export type PropertyFormInput = z.infer<typeof propertyFormSchema>;
