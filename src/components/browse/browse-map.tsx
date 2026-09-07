"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import {
  ABUJA_MAP_CENTER,
  ABUJA_MAP_DEFAULT_ZOOM,
  resolvePropertyCoords,
} from "@/lib/properties/districts-geo";
import {
  districtLabel,
  formatRentLabel,
  propertyTypeLabel,
} from "@/lib/properties/format";
import type { Property } from "@/types/database";

type BrowseMapProps = {
  properties: Property[];
};

const pinIcon = L.divIcon({
  className: "",
  html: `<div style="width:14px;height:14px;border-radius:9999px;background:#111;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35)"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

function FitBounds({
  points,
}: {
  points: { lat: number; lng: number }[];
}) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) {
      map.setView(
        [ABUJA_MAP_CENTER.lat, ABUJA_MAP_CENTER.lng],
        ABUJA_MAP_DEFAULT_ZOOM,
      );
      return;
    }
    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], 13);
      return;
    }
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [map, points]);

  return null;
}

export function BrowseMap({ properties }: BrowseMapProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  const markers = useMemo(
    () =>
      properties.map((property) => ({
        property,
        coords: resolvePropertyCoords(property),
      })),
    [properties],
  );

  if (!ready) {
    return (
      <div className="flex h-[480px] items-center justify-center rounded-2xl border border-border bg-muted text-sm text-muted-foreground">
        Loading map…
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      <MapContainer
        center={[ABUJA_MAP_CENTER.lat, ABUJA_MAP_CENTER.lng]}
        zoom={ABUJA_MAP_DEFAULT_ZOOM}
        scrollWheelZoom
        className="z-0 h-[480px] w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds points={markers.map((m) => m.coords)} />
        {markers.map(({ property, coords }) => (
          <Marker
            key={property.id}
            position={[coords.lat, coords.lng]}
            icon={pinIcon}
          >
            <Popup>
              <div className="min-w-[180px] space-y-1 text-sm">
                <p className="font-medium leading-snug">{property.title}</p>
                <p className="text-xs text-neutral-600">
                  {propertyTypeLabel(property.property_type)} ·{" "}
                  {districtLabel(property.district)}
                  {coords.approx ? " (approx.)" : ""}
                </p>
                <p className="text-xs font-medium">
                  {formatRentLabel(property.price)}
                </p>
                <Link
                  href={`/properties/${property.id}`}
                  className="inline-block text-xs font-medium underline"
                >
                  View listing
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <p className="border-t border-border bg-muted/40 px-4 py-2 text-xs text-muted-foreground">
        Pins use exact coordinates when available; otherwise the district center
        (marked approx.).
      </p>
    </div>
  );
}
