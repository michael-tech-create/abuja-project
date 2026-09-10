import Link from "next/link";
import { MapPinIcon } from "lucide-react";

import { LikeButton } from "@/components/properties/like-button";
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
import type { Property } from "@/types/database";

type PropertyCardProps = {
  property: Property;
  liked?: boolean;
  showLike?: boolean;
};

export function PropertyCard({
  property,
  liked = false,
  showLike = false,
}: PropertyCardProps) {
  const cover = property.images[0];
  const tier = classifyBudget(property.price);

  return (
    <article className="soft-card group relative h-full overflow-hidden transition-transform duration-300 hover:-translate-y-0.5">
      <div className="relative aspect-[4/3] bg-sand">
        <Link href={`/properties/${property.id}`} className="block size-full">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cover}
              alt=""
              className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
              No photo
            </div>
          )}
        </Link>
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <span className="sage-pill">Verified · For Rent</span>
          <span className="rounded-full bg-card/95 px-3 py-1 text-xs font-medium shadow-sm backdrop-blur">
            {budgetLabel(tier)}
          </span>
        </div>
        {showLike && (
          <div className="absolute top-3 right-3">
            <LikeButton
              propertyId={property.id}
              liked={liked}
              path="/browse"
            />
          </div>
        )}
      </div>

      <Link href={`/properties/${property.id}`} className="block space-y-3 p-5">
        <div className="space-y-1">
          <h2 className="font-heading text-xl font-semibold leading-snug tracking-tight group-hover:underline">
            {property.title}
          </h2>
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPinIcon className="size-3.5 shrink-0" />
            {districtLabel(property.district)}
            {property.address_line ? `, ${property.address_line}` : ""}
          </p>
        </div>

        <div>
          <p className="font-heading text-2xl font-semibold tracking-tight">
            {formatRentLabel(property.price)}
          </p>
          <p className="text-xs text-muted-foreground">{budgetHint(tier)}</p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="rounded-full bg-sand px-2.5 py-1">
            {propertyTypeLabel(property.property_type)}
          </span>
          {property.bedrooms != null && (
            <span className="rounded-full bg-sand px-2.5 py-1">
              {property.bedrooms} bed
            </span>
          )}
          {property.bathrooms != null && (
            <span className="rounded-full bg-sand px-2.5 py-1">
              {property.bathrooms} bath
            </span>
          )}
          {property.area_sqm != null && (
            <span className="rounded-full bg-sand px-2.5 py-1">
              {property.area_sqm} sqm
            </span>
          )}
        </div>
      </Link>
    </article>
  );
}
