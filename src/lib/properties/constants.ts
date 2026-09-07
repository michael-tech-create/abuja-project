export const AMENITY_OPTIONS = [
  { value: "parking", label: "Parking" },
  { value: "generator", label: "Generator" },
  { value: "inverter", label: "Inverter / solar" },
  { value: "security", label: "24/7 security" },
  { value: "borehole", label: "Borehole / water" },
  { value: "furnished", label: "Furnished" },
  { value: "air_conditioning", label: "Air conditioning" },
  { value: "prepaid_meter", label: "Prepaid meter" },
  { value: "pop_ceiling", label: "POP ceiling" },
  { value: "wardrobe", label: "Wardrobes" },
  { value: "balcony", label: "Balcony" },
  { value: "bq", label: "BQ / boys' quarters" },
  { value: "gym", label: "Gym" },
  { value: "pool", label: "Pool" },
  { value: "cctv", label: "CCTV" },
] as const;

export const MAX_PROPERTY_IMAGES = 12;
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10MB — matches storage bucket
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;
