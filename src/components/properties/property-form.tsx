"use client";

import dynamic from "next/dynamic";
import { useActionState, useState } from "react";

import { ImageUploader } from "@/components/properties/image-uploader";
import { VideoUploader } from "@/components/properties/video-uploader";
import {
  UnitsEditor,
  createEmptyUnit,
  type UnitDraft,
} from "@/components/properties/units-editor";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PRICE_UNIT_LABEL } from "@/lib/constants";
import { AMENITY_OPTIONS } from "@/lib/properties/constants";
import {
  createPropertyAction,
  updatePropertyAction,
  type PropertyActionState,
} from "@/lib/properties/actions";
import type { AbujaDistrict, Property, PropertyUnit } from "@/types/database";
import { ABUJA_DISTRICTS, PROPERTY_TYPES } from "@/types/database";

const LocationPinPicker = dynamic(
  () =>
    import("@/components/properties/location-pin-picker").then(
      (m) => m.LocationPinPicker,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[280px] items-center justify-center rounded-2xl border border-dashed text-sm text-muted-foreground">
        Loading map pin…
      </div>
    ),
  },
);

const initialState: PropertyActionState = {};

type PropertyFormProps = {
  mode: "create" | "edit";
  ownerId: string;
  property?: Property;
  initialUnits?: PropertyUnit[];
};

export function PropertyForm({
  mode,
  ownerId,
  property,
  initialUnits = [],
}: PropertyFormProps) {
  const action = mode === "create" ? createPropertyAction : updatePropertyAction;
  const [state, formAction, pending] = useActionState(action, initialState);
  const [existingImages, setExistingImages] = useState(property?.images ?? []);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [existingVideos, setExistingVideos] = useState(property?.videos ?? []);
  const [uploadedVideos, setUploadedVideos] = useState<string[]>([]);
  const [district, setDistrict] = useState<AbujaDistrict>(
    property?.district ?? "gwarinpa",
  );
  const [coords, setCoords] = useState<{ lat: number | null; lng: number | null }>(
    {
      lat: property?.latitude ?? null,
      lng: property?.longitude ?? null,
    },
  );
  const [multiUnit, setMultiUnit] = useState(
    Boolean(property?.is_multi_unit) || initialUnits.length > 0,
  );
  const [units, setUnits] = useState<UnitDraft[]>(
    initialUnits.length > 0
      ? initialUnits.map((u) => ({
          key: u.id,
          label: u.label,
          bedrooms: u.bedrooms != null ? String(u.bedrooms) : "",
          bathrooms: u.bathrooms != null ? String(u.bathrooms) : "",
          price: String(u.price),
          areaSqm: u.area_sqm != null ? String(u.area_sqm) : "",
        }))
      : [createEmptyUnit()],
  );

  const selectedAmenities = new Set(property?.amenities ?? []);

  return (
    <div className="space-y-6">
      {state.error && (
        <Alert variant="destructive">
          <AlertTitle>
            {mode === "create" ? "Could not create listing" : "Could not save listing"}
          </AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <form
        className="space-y-8"
        action={(formData) => {
          newFiles.forEach((file) => formData.append("images", file));
          formAction(formData);
        }}
      >
        {mode === "edit" && property && (
          <input type="hidden" name="propertyId" value={property.id} />
        )}

        <section className="space-y-4">
          <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
            Basics
          </h2>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              required
              placeholder="4-bed duplex in Gwarinpa with BQ"
              defaultValue={property?.title}
              aria-invalid={Boolean(state.fieldErrors?.title)}
            />
            {state.fieldErrors?.title?.[0] && (
              <p className="text-xs text-destructive">{state.fieldErrors.title[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              required
              rows={6}
              placeholder="Describe the property, finishes, estate rules, and nearby landmarks…"
              defaultValue={property?.description}
              aria-invalid={Boolean(state.fieldErrors?.description)}
            />
            {state.fieldErrors?.description?.[0] && (
              <p className="text-xs text-destructive">
                {state.fieldErrors.description[0]}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="propertyType">Property type</Label>
              <select
                id="propertyType"
                name="propertyType"
                required
                defaultValue={property?.property_type ?? "apartment"}
                className="app-select"
              >
                {PROPERTY_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="district">Abuja district</Label>
              <select
                id="district"
                name="district"
                required
                value={district}
                onChange={(e) =>
                  setDistrict(e.target.value as AbujaDistrict)
                }
                className="app-select"
              >
                {ABUJA_DISTRICTS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="buildingName">Building / estate name (optional)</Label>
            <Input
              id="buildingName"
              name="buildingName"
              placeholder="e.g. Palm Grove Residences"
              defaultValue={property?.building_name ?? ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="addressLine">Street address (optional)</Label>
            <Input
              id="addressLine"
              name="addressLine"
              placeholder="e.g. 12 Ebitu Ukiwe Street"
              defaultValue={property?.address_line ?? ""}
            />
          </div>

          <div className="space-y-3">
            <Label>Building location (required)</Label>
            <LocationPinPicker
              latitude={coords.lat}
              longitude={coords.lng}
              district={district}
              onChange={({ lat, lng }) => setCoords({ lat, lng })}
            />
          </div>

          <label className="flex items-center gap-2 rounded-xl border border-border px-3 py-3 text-sm">
            <input
              type="checkbox"
              name="isMultiUnit"
              checked={multiUnit}
              onChange={(e) => {
                setMultiUnit(e.target.checked);
                if (e.target.checked && units.length === 0) {
                  setUnits([createEmptyUnit()]);
                }
              }}
              className="size-4 accent-primary"
            />
            <span>
              This post has <strong>multiple apartments</strong> in one building
            </span>
          </label>
        </section>

        {multiUnit && (
          <section className="space-y-4">
            <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
              Apartments
            </h2>
            <UnitsEditor units={units} onChange={setUnits} />
            <p className="text-xs text-muted-foreground">
              Building card price will show “From ₦…” using the cheapest unit.
            </p>
          </section>
        )}

        <section className="space-y-4">
          <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
            {multiUnit ? "Default / headline pricing" : "Pricing & size"}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="price">Annual rent (NGN)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                min={1}
                step={1000}
                required
                placeholder="5000000"
                defaultValue={property?.price ?? ""}
                aria-invalid={Boolean(state.fieldErrors?.price)}
              />
              <p className="text-xs text-muted-foreground">
                Stored as NGN {PRICE_UNIT_LABEL}.
              </p>
              {state.fieldErrors?.price?.[0] && (
                <p className="text-xs text-destructive">{state.fieldErrors.price[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Input
                id="bedrooms"
                name="bedrooms"
                type="number"
                min={0}
                defaultValue={property?.bedrooms ?? ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Input
                id="bathrooms"
                name="bathrooms"
                type="number"
                min={0}
                defaultValue={property?.bathrooms ?? ""}
              />
            </div>

            <div className="space-y-2 sm:col-span-2 lg:col-span-1">
              <Label htmlFor="areaSqm">Area (sqm)</Label>
              <Input
                id="areaSqm"
                name="areaSqm"
                type="number"
                min={1}
                step={0.1}
                defaultValue={property?.area_sqm ?? ""}
              />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
            Amenities
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            {AMENITY_OPTIONS.map((amenity) => (
              <label
                key={amenity.value}
                className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted/50"
              >
                <input
                  type="checkbox"
                  name="amenities"
                  value={amenity.value}
                  defaultChecked={selectedAmenities.has(amenity.value)}
                  className="size-4 rounded border border-input accent-primary"
                />
                <span>{amenity.label}</span>
              </label>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
            Photos
          </h2>
          <ImageUploader
            existingImages={existingImages}
            newFiles={newFiles}
            onExistingChange={setExistingImages}
            onNewFilesChange={setNewFiles}
          />
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
            Videos
          </h2>
          <VideoUploader
            ownerId={ownerId}
            propertyId={property?.id}
            existingVideos={existingVideos}
            onExistingChange={setExistingVideos}
            uploadedVideos={uploadedVideos}
            onUploadedChange={setUploadedVideos}
          />
        </section>

        <div className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          New listings stay <strong className="text-foreground">unpublished</strong> until
          your KYC is verified by an admin. Then open the listing and click{" "}
          <strong className="text-foreground">Publish to Browse</strong>. Videos upload
          with live progress before you save.
        </div>

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={pending}>
            {pending
              ? mode === "create"
                ? "Creating…"
                : "Saving…"
              : mode === "create"
                ? "Create listing"
                : "Save changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
