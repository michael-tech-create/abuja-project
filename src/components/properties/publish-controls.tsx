import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  publishPropertyAction,
  unpublishPropertyAction,
} from "@/lib/properties/actions";
import type { KycStatus, Property } from "@/types/database";

type PublishControlsProps = {
  property: Property;
  kycStatus: KycStatus;
  isAdmin?: boolean;
};

export function PublishControls({
  property,
  kycStatus,
  isAdmin = false,
}: PublishControlsProps) {
  const kycOk = kycStatus === "verified" || isAdmin;
  const rejected = property.verification_status === "rejected";
  const published = property.is_published;

  if (published) {
    return (
      <div className="soft-card space-y-3 p-4">
        <p className="text-sm text-muted-foreground">
          This listing is live on{" "}
          <Link
            href={`/properties/${property.id}`}
            className="font-medium text-foreground underline underline-offset-4"
          >
            Browse
          </Link>
          .
        </p>
        <form action={unpublishPropertyAction}>
          <input type="hidden" name="propertyId" value={property.id} />
          <Button type="submit" variant="outline" className="rounded-full">
            Unpublish
          </Button>
        </form>
      </div>
    );
  }

  if (rejected && !isAdmin) {
    return (
      <div className="soft-card space-y-2 p-4 text-sm text-muted-foreground">
        <p>
          This listing was rejected. Edit the details, save again, then you can
          publish once KYC is verified.
        </p>
        <Link
          href={`/dashboard/listings/${property.id}/edit`}
          className="inline-flex font-medium text-foreground underline underline-offset-4"
        >
          Edit listing
        </Link>
      </div>
    );
  }

  if (!kycOk) {
    return (
      <div className="soft-card space-y-3 p-4">
        <p className="text-sm text-muted-foreground">
          Verify your NIN (automated) and upload docs at KYC — not in the
          property photo gallery. Once verified, you can publish.
        </p>
        <p className="text-xs text-muted-foreground">
          Current KYC status:{" "}
          <span className="font-medium capitalize text-foreground">
            {kycStatus}
          </span>
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/kyc"
            className="inline-flex h-8 items-center rounded-full bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Upload KYC documents
          </Link>
          <Button type="button" disabled className="rounded-full opacity-60">
            Publish to Browse
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="soft-card space-y-3 p-4">
      <p className="text-sm text-muted-foreground">
        Your KYC is verified. Publish this listing to make it visible on Browse
        for tenants.
      </p>
      <form action={publishPropertyAction}>
        <input type="hidden" name="propertyId" value={property.id} />
        <Button type="submit" className="rounded-full">
          Publish to Browse
        </Button>
      </form>
    </div>
  );
}
