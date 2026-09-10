import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BathIcon,
  BedDoubleIcon,
  Building2Icon,
  MapPinIcon,
  RulerIcon,
} from "lucide-react";

import { SiteHeader } from "@/components/layout/site-header";
import { LikeButton } from "@/components/properties/like-button";
import { ReviewSection } from "@/components/properties/review-section";
import { startConversationAction } from "@/lib/chat/actions";
import { getCurrentProfile, getSessionUser } from "@/lib/auth/session";
import { isPropertyFavorited } from "@/lib/favorites/queries";
import { AMENITY_OPTIONS } from "@/lib/properties/constants";
import {
  budgetHint,
  budgetLabel,
  classifyBudget,
} from "@/lib/properties/budget";
import {
  districtLabel,
  formatRentLabel,
  propertyTypeLabel,
} from "@/lib/properties/format";
import { getPublicProperty } from "@/lib/properties/queries";
import { getPropertyReviews } from "@/lib/reviews/queries";
import { hasSupabaseEnv } from "@/lib/supabase/env";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; reviewed?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const { property } = await getPublicProperty(id);
  if (!property) return { title: "Listing not found" };
  return {
    title: property.title,
    description: property.description.slice(0, 160),
  };
}

export default async function PublicPropertyPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const { error, reviewed } = await searchParams;
  const profile = await getCurrentProfile();
  const user = await getSessionUser();
  const { property, source } = await getPublicProperty(id);

  if (!property) notFound();

  const amenityLabels = property.amenities.map(
    (value) => AMENITY_OPTIONS.find((a) => a.value === value)?.label ?? value,
  );

  const canMessage =
    !profile || profile.role === "tenant" || profile.role === "admin";
  const demoMode = !hasSupabaseEnv();
  const tier = classifyBudget(property.price);
  const liked = user
    ? await isPropertyFavorited(user.id, property.id)
    : false;
  const { reviews, average, count } = await getPropertyReviews(property.id);
  const canReview = Boolean(user);

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader profile={profile} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8 sm:py-12">
        <div className="mb-6">
          <Link
            href="/browse"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to browse
          </Link>
        </div>

        {error && (
          <div className="mb-6 rounded-3xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error === "tenants_only"
              ? "Only tenant accounts can message landlords."
              : error === "own_listing"
                ? "You cannot message yourself about your own listing."
                : "Could not start chat. Please try again."}
          </div>
        )}
        {reviewed && (
          <div className="mb-6 rounded-3xl border border-border/70 bg-card px-4 py-3 text-sm">
            Thanks — your review was posted.
          </div>
        )}

        <div className="soft-card overflow-hidden">
          {property.images[0] && (
            <div className="relative aspect-[16/10] bg-sand sm:aspect-[2/1]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={property.images[0]}
                alt=""
                className="size-full object-cover"
              />
              {user && (
                <div className="absolute top-4 right-4">
                  <LikeButton
                    propertyId={property.id}
                    liked={liked}
                    path={`/properties/${property.id}`}
                  />
                </div>
              )}
            </div>
          )}

          <div className="space-y-8 p-6 sm:p-10">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="sage-pill">Verified · For Rent</span>
                <span className="rounded-full bg-sand px-3 py-1 text-xs font-medium">
                  {budgetLabel(tier)} · {budgetHint(tier)}
                </span>
                {count > 0 && average != null && (
                  <span className="rounded-full bg-sand px-3 py-1 text-xs font-medium">
                    {average}★ ({count})
                  </span>
                )}
                {source === "demo" && (
                  <span className="rounded-full bg-sand px-3 py-1 text-xs font-medium text-muted-foreground">
                    Demo
                  </span>
                )}
              </div>

              <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
                {property.title}
              </h1>

              <p className="flex items-center gap-2 text-muted-foreground">
                <MapPinIcon className="size-4 shrink-0" />
                {districtLabel(property.district)}
                {property.address_line ? `, ${property.address_line}` : ""}
              </p>

              <p className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
                {formatRentLabel(property.price)}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Spec
                icon={<BedDoubleIcon className="size-4" />}
                label="Bedrooms"
                value={property.bedrooms != null ? String(property.bedrooms) : "—"}
              />
              <Spec
                icon={<BathIcon className="size-4" />}
                label="Bathrooms"
                value={
                  property.bathrooms != null ? String(property.bathrooms) : "—"
                }
              />
              <Spec
                icon={<RulerIcon className="size-4" />}
                label="Area"
                value={property.area_sqm ? `${property.area_sqm} sqm` : "—"}
              />
              <Spec
                icon={<Building2Icon className="size-4" />}
                label="Type"
                value={propertyTypeLabel(property.property_type)}
              />
            </div>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-semibold">Description</h2>
              <p className="max-w-3xl whitespace-pre-wrap text-sm leading-7 text-muted-foreground sm:text-base">
                {property.description}
              </p>
            </section>

            {amenityLabels.length > 0 && (
              <section className="space-y-3">
                <h2 className="font-heading text-xl font-semibold">Amenities</h2>
                <ul className="flex flex-wrap gap-2">
                  {amenityLabels.map((label) => (
                    <li
                      key={label}
                      className="rounded-full bg-sand px-3 py-1.5 text-sm text-foreground/80"
                    >
                      {label}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {(property.videos ?? []).length > 0 && (
              <section className="space-y-3">
                <h2 className="font-heading text-xl font-semibold">
                  Tour videos
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {(property.videos ?? []).map((url) => (
                    <div
                      key={url}
                      className="overflow-hidden rounded-3xl border border-border/70 bg-black"
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
              </section>
            )}

            {property.images.length > 1 && (
              <section className="space-y-3">
                <h2 className="font-heading text-xl font-semibold">Gallery</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {property.images.slice(1).map((url) => (
                    <div
                      key={url}
                      className="aspect-[4/3] overflow-hidden rounded-3xl bg-sand"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="" className="size-full object-cover" />
                    </div>
                  ))}
                </div>
              </section>
            )}

            <ReviewSection
              propertyId={property.id}
              reviews={reviews}
              average={average}
              count={count}
              canReview={canReview}
              signedIn={Boolean(user)}
            />

            <div className="flex flex-col gap-3 border-t border-border/70 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-md text-sm text-muted-foreground">
                Chat in real time with the verified landlord or agent about this
                home.
              </p>

              {canMessage ? (
                <form action={startConversationAction}>
                  <input type="hidden" name="propertyId" value={property.id} />
                  <button
                    type="submit"
                    className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    {demoMode
                      ? "Message landlord (demo)"
                      : profile
                        ? "Message landlord"
                        : "Sign in to message"}
                  </button>
                </form>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Messaging is available on tenant accounts.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Spec({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl bg-sand/80 px-4 py-4">
      <div className="mb-2 text-muted-foreground">{icon}</div>
      <p className="text-xs tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-1 font-heading text-lg font-semibold">{value}</p>
    </div>
  );
}
