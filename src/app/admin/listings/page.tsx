import type { Metadata } from "next";
import Link from "next/link";

import { AdminShell } from "@/components/admin/admin-shell";
import { StatusPill } from "@/components/admin/status-pill";
import { requireAdminAccess } from "@/lib/admin/access";
import { listPendingProperties } from "@/lib/admin/queries";
import {
  districtLabel,
  formatRentLabel,
  propertyTypeLabel,
} from "@/lib/properties/format";

export const metadata: Metadata = {
  title: "Review listings",
};

export default async function AdminListingsPage() {
  const { profile, source } = await requireAdminAccess();
  const { items } = await listPendingProperties();

  return (
    <AdminShell
      profile={profile}
      active="listings"
      demo={source === "demo"}
      title="Listing verification"
      description="Approve only after checking ownership documents and that photos match the claimed Abuja address."
    >
      {items.length === 0 ? (
        <div className="soft-card px-6 py-16 text-center">
          <h2 className="font-heading text-xl font-semibold">No pending listings</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            New landlord submissions will appear here for review.
          </p>
        </div>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {items.map((property) => {
            const cover = property.images[0];
            return (
              <li key={property.id}>
                <Link
                  href={`/admin/listings/${property.id}`}
                  className="soft-card group block overflow-hidden transition-transform hover:-translate-y-0.5"
                >
                  <div className="aspect-[16/10] bg-sand">
                    {cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={cover}
                        alt=""
                        className="size-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="space-y-3 p-5">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="font-heading text-lg font-semibold leading-snug group-hover:underline">
                        {property.title}
                      </h2>
                      <StatusPill status={property.verification_status} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {propertyTypeLabel(property.property_type)} ·{" "}
                      {districtLabel(property.district)}
                    </p>
                    <p className="font-heading text-xl font-semibold">
                      {formatRentLabel(property.price)}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </AdminShell>
  );
}
