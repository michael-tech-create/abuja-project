import type { AbujaDistrict } from "@/types/database";

/** Approximate district centroids in Abuja for map pins when lat/lng are missing. */
export const DISTRICT_CENTROIDS: Record<
  AbujaDistrict,
  { lat: number; lng: number }
> = {
  maitama: { lat: 9.0882, lng: 7.4922 },
  asokoro: { lat: 9.0431, lng: 7.5146 },
  wuse: { lat: 9.0643, lng: 7.4691 },
  wuse_2: { lat: 9.0765, lng: 7.4728 },
  garki: { lat: 9.0335, lng: 7.485 },
  gwarinpa: { lat: 9.1105, lng: 7.4062 },
  jabi: { lat: 9.0608, lng: 7.4245 },
  utako: { lat: 9.0698, lng: 7.444 },
  kubwa: { lat: 9.155, lng: 7.3405 },
  lugbe: { lat: 8.9735, lng: 7.365 },
  katampe: { lat: 9.098, lng: 7.448 },
  lifecamp: { lat: 9.088, lng: 7.413 },
  lokogoma: { lat: 8.987, lng: 7.454 },
  apo: { lat: 8.985, lng: 7.498 },
  durumi: { lat: 9.012, lng: 7.478 },
  gudu: { lat: 9.005, lng: 7.49 },
  mpape: { lat: 9.125, lng: 7.495 },
  kado: { lat: 9.085, lng: 7.43 },
  jahi: { lat: 9.095, lng: 7.405 },
  other: { lat: 9.0579, lng: 7.4951 },
};

export const ABUJA_MAP_CENTER = { lat: 9.0579, lng: 7.4951 };
export const ABUJA_MAP_DEFAULT_ZOOM = 11;

export function resolvePropertyCoords(property: {
  latitude: number | null;
  longitude: number | null;
  district: AbujaDistrict;
}) {
  if (
    property.latitude != null &&
    property.longitude != null &&
    Number.isFinite(property.latitude) &&
    Number.isFinite(property.longitude)
  ) {
    return { lat: property.latitude, lng: property.longitude, approx: false };
  }

  const centroid = DISTRICT_CENTROIDS[property.district];
  return { lat: centroid.lat, lng: centroid.lng, approx: true };
}
