"use client";

import { useActionState, useState } from "react";

import { ImageUploader } from "@/components/properties/image-uploader";
import { VideoUploader } from "@/components/properties/video-uploader";
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
import type { Property } from "@/types/database";
import { ABUJA_DISTRICTS, PROPERTY_TYPES } from "@/types/database";

const initialState: PropertyActionState = {};

type PropertyFormProps = {
  mode: "create" | "edit";
  ownerId: string;
  property?: Property;
};

export function PropertyForm({ mode, ownerId, property }: PropertyFormProps) {
  const action = mode === "create" ? createPropertyAction : updatePropertyAction;
  const [state, formAction, pending] = useActionState(action, initialState);
  const [existingImages, setExistingImages] = useState(property?.images ?? []);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [existingVideos, setExistingVideos] = useState(property?.videos ?? []);
  const [uploadedVideos, setUploadedVideos] = useState<string[]>([]);

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
                className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
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
                defaultValue={property?.district ?? "gwarinpa"}
                className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {ABUJA_DISTRICTS.map((district) => (
                  <option key={district.value} value={district.value}>
                    {district.label}
                  </option>
                ))}
              </select>
            </div>
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
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
            Pricing & size
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
