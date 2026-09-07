import Link from "next/link";

import { VerificationBadge } from "@/components/properties/verification-badge";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  districtLabel,
  formatRentLabel,
  propertyTypeLabel,
} from "@/lib/properties/format";
import type { Property } from "@/types/database";

type ListingCardProps = {
  property: Property;
};

export function ListingCard({ property }: ListingCardProps) {
  const cover = property.images[0];

  return (
    <Card className="overflow-hidden py-0">
      <div className="relative aspect-[16/10] bg-muted">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt=""
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
            No photo
          </div>
        )}
        <div className="absolute top-3 left-3">
          <VerificationBadge status={property.verification_status} />
        </div>
      </div>

      <CardHeader className="gap-1 pt-4">
        <CardTitle className="line-clamp-1">{property.title}</CardTitle>
        <CardDescription>
          {propertyTypeLabel(property.property_type)} ·{" "}
          {districtLabel(property.district)}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-2 text-sm">
        <p className="font-medium text-foreground">
          {formatRentLabel(property.price)}
        </p>
        <div className="flex flex-wrap gap-2 text-muted-foreground">
          {property.bedrooms != null && <span>{property.bedrooms} bed</span>}
          {property.bathrooms != null && <span>{property.bathrooms} bath</span>}
          {property.is_published ? (
            <Badge variant="secondary">Published</Badge>
          ) : (
            <Badge variant="outline">Unpublished</Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="gap-2 border-t py-3">
        <Link
          href={`/dashboard/listings/${property.id}`}
          className="inline-flex h-8 items-center rounded-lg px-2.5 text-sm font-medium hover:bg-muted"
        >
          View
        </Link>
        <Link
          href={`/dashboard/listings/${property.id}/edit`}
          className="inline-flex h-8 items-center rounded-lg px-2.5 text-sm font-medium hover:bg-muted"
        >
          Edit
        </Link>
      </CardFooter>
    </Card>
  );
}
