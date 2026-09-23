import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { DeleteListingButton } from "@/components/properties/delete-listing-button";
import { PublishControls } from "@/components/properties/publish-controls";
import { VerificationBadge } from "@/components/properties/verification-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { canManageListings } from "@/lib/properties/access";
import {
  districtLabel,
  formatRentLabel,
  propertyTypeLabel,
} from "@/lib/properties/format";
import { getManageableProperty } from "@/lib/properties/queries";
import { AMENITY_OPTIONS } from "@/lib/properties/constants";
import { getCurrentProfile, getSessionUser } from "@/lib/auth/session";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return { title: `Listing ${id.slice(0, 8)}` };
}

export default async function ListingDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const query = await searchParams;
  const user = await getSessionUser();
  if (!user) redirect("/auth/login");

  const profile = await getCurrentProfile();
  if (!profile) redirect("/auth/login");
  if (!profile.onboarding_completed) redirect("/onboarding");
  if (!canManageListings(profile)) redirect("/dashboard");

  const property = await getManageableProperty(
    user.id,
    id,
    profile.role === "admin",
  );

  if (!property) notFound();

  const amenityLabels = property.amenities.map(
    (value) => AMENITY_OPTIONS.find((a) => a.value === value)?.label ?? value,
  );

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        <div className="mb-6">
          <Link
            href="/dashboard/listings"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to listings
          </Link>
        </div>

        {query.success === "published" && (
          <Alert className="mb-6 rounded-3xl border-border/70 bg-card">
            <AlertTitle>Published</AlertTitle>
            <AlertDescription>
              This listing is now visible on{" "}
              <Link
                href="/browse"
                className="font-medium underline underline-offset-4"
              >
                Browse
              </Link>
              .
            </AlertDescription>
          </Alert>
        )}
        {query.success === "unpublished" && (
          <Alert className="mb-6 rounded-3xl border-border/70 bg-card">
            <AlertTitle>Unpublished</AlertTitle>
            <AlertDescription>
              This listing is hidden from Browse until you publish again.
            </AlertDescription>
          </Alert>
        )}
        {query.error && (
          <Alert variant="destructive" className="mb-6 rounded-3xl">
            <AlertTitle>Could not update listing</AlertTitle>
            <AlertDescription>{query.error}</AlertDescription>
          </Alert>
        )}

        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <VerificationBadge status={property.verification_status} />
              {property.is_published ? (
                <Badge variant="secondary">Published</Badge>
              ) : (
                <Badge variant="outline">Unpublished</Badge>
              )}
            </div>
            <h1 className="font-heading text-3xl font-semibold tracking-tight">
              {property.title}
            </h1>
            <p className="text-muted-foreground">
              {propertyTypeLabel(property.property_type)} ·{" "}
              {districtLabel(property.district)}
              {property.address_line ? ` · ${property.address_line}` : ""}
            </p>
            <p className="text-lg font-medium">
              {formatRentLabel(property.price)}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href={`/dashboard/listings/${property.id}/edit`}
              className="inline-flex h-8 items-center rounded-full border border-border bg-background px-3 text-sm font-medium hover:bg-muted"
            >
              Edit
            </Link>
            <DeleteListingButton
              propertyId={property.id}
              title={property.title}
            />
          </div>
        </div>

        <div className="mb-8">
          <PublishControls
            property={property}
            kycStatus={profile.kyc_status}
            isAdmin={profile.role === "admin"}
          />
        </div>

        {property.verification_status === "rejected" &&
          property.rejection_reason && (
            <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              Rejected: {property.rejection_reason}. Edit and save to re-submit,
              then publish again after KYC is verified.
            </div>
          )}

        {property.images.length > 0 ? (
          <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {property.images.map((url) => (
              <div
                key={url}
                className="aspect-[4/3] overflow-hidden rounded-xl border border-border bg-muted"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="size-full object-cover" />
              </div>
            ))}
          </div>
        ) : (
          <div className="mb-8 rounded-xl border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground">
            No photos uploaded yet.
          </div>
        )}

        {(property.videos ?? []).length > 0 && (
          <div className="mb-8 grid gap-3 sm:grid-cols-2">
            {(property.videos ?? []).map((url) => (
              <div
                key={url}
                className="overflow-hidden rounded-xl border border-border bg-black"
              >
                <video
                  src={url}
                  controls
                  playsInline
                  preload="metadata"
                  className="aspect-video w-full"
                />
              </div>
            ))}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <section className="space-y-3">
            <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
              Description
            </h2>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {property.description}
            </p>
          </section>

          <aside className="space-y-6 rounded-2xl border border-border p-5">
            <div className="space-y-2 text-sm">
              <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                Details
              </h2>
              <p>
                <span className="text-muted-foreground">Bedrooms:</span>{" "}
                {property.bedrooms ?? "—"}
              </p>
              <p>
                <span className="text-muted-foreground">Bathrooms:</span>{" "}
                {property.bathrooms ?? "—"}
              </p>
              <p>
                <span className="text-muted-foreground">Area:</span>{" "}
                {property.area_sqm ? `${property.area_sqm} sqm` : "—"}
              </p>
              <p>
                <span className="text-muted-foreground">Your KYC:</span>{" "}
                <span className="capitalize">{profile.kyc_status}</span>
              </p>
            </div>

            {amenityLabels.length > 0 && (
              <div className="space-y-2">
                <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                  Amenities
                </h2>
                <ul className="flex flex-wrap gap-2">
                  {amenityLabels.map((label) => (
                    <li key={label}>
                      <Badge variant="secondary">{label}</Badge>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}
