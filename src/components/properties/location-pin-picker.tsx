"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import {
  ABUJA_MAP_CENTER,
  DISTRICT_CENTROIDS,
} from "@/lib/properties/districts-geo";
import type { AbujaDistrict } from "@/types/database";

type LocationPinPickerProps = {
  latitude: number | null;
  longitude: number | null;
  district?: AbujaDistrict;
  onChange: (coords: { lat: number; lng: number }) => void;
};

const pinIcon = L.divIcon({
  className: "",
  html: `<div style="width:16px;height:16px;border-radius:9999px;background:#2c241b;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.35)"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

function ClickHandler({
  onPick,
}: {
  onPick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function LocationPinPicker({
  latitude,
  longitude,
  district,
  onChange,
}: LocationPinPickerProps) {
  const [ready, setReady] = useState(false);
  const fallback = district
    ? DISTRICT_CENTROIDS[district]
    : ABUJA_MAP_CENTER;
  const lat = latitude ?? fallback.lat;
  const lng = longitude ?? fallback.lng;

  useEffect(() => setReady(true), []);

  function useMyLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        // ignore denial
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  if (!ready) {
    return (
      <Box
        sx={{
          height: 280,
          borderRadius: 3,
          bgcolor: "secondary.light",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Loading map…
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={1.5}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        sx={{
          justifyContent: "space-between",
          alignItems: { sm: "center" },
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Click the map to drop a pin on the exact building location.
        </Typography>
        <Button size="small" variant="outlined" onClick={useMyLocation}>
          Use my location
        </Button>
      </Stack>
      <Box
        sx={{
          height: 280,
          borderRadius: 3,
          overflow: "hidden",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <MapContainer
          center={[lat, lng]}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler
            onPick={(nextLat, nextLng) =>
              onChange({ lat: nextLat, lng: nextLng })
            }
          />
          <Marker
            position={[lat, lng]}
            icon={pinIcon}
            draggable
            eventHandlers={{
              dragend: (e) => {
                const marker = e.target as L.Marker;
                const pos = marker.getLatLng();
                onChange({ lat: pos.lat, lng: pos.lng });
              },
            }}
          />
        </MapContainer>
      </Box>
      <Typography variant="caption" color="text.secondary">
        Pin: {lat.toFixed(5)}, {lng.toFixed(5)}
      </Typography>
      <input type="hidden" name="latitude" value={lat} />
      <input type="hidden" name="longitude" value={lng} />
    </Stack>
  );
}
