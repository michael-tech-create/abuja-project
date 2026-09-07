import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminShell } from "@/components/admin/admin-shell";
import { DocumentCard } from "@/components/admin/document-card";
import { RejectForm } from "@/components/admin/reject-form";
import { StatusPill } from "@/components/admin/status-pill";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { requireAdminAccess } from "@/lib/admin/access";
import {
  approvePropertyAction,
  rejectPropertyAction,
} from "@/lib/admin/actions";
import { getPropertyReview } from "@/lib/admin/queries";
import { attachViewUrls } from "@/lib/kyc/signed-url";
import {
  districtLabel,
  formatRentLabel,
  propertyTypeLabel,
} from "@/lib/properties/format";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
};

export const metadata: Metadata = {
  title: "Review listing",
};

export default async function AdminListingReviewPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const query = await searchParams;
  const { profile, source } = await requireAdminAccess();
  const { bundle } = await getPropertyReview(id);

  if (!bundle) notFound();

  const { property, owner } = bundle;
  const documents = await attachViewUrls(bundle.documents);
  const pending = property.verification_status === "pending";

  return (
    <AdminShell
      profile={profile}
      active="listings"
      demo={source === "demo"}
      title="Review listing"
      description="Confirm documents, photos, and district details before publishing."
    >
      <Link
        href="/admin/listings"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back to listings queue
      </Link>

      {query.success === "approved" && (
        <Alert className="rounded-3xl border-border/70 bg-card">
          <AlertTitle>Listing approved</AlertTitle>
          <AlertDescription>
            Verified badge applied and listing published to public browse.
          </AlertDescription>
        </Alert>
      )}
      {query.success === "rejected" && (
        <Alert className="rounded-3xl border-border/70 bg-card">
          <AlertTitle>Listing rejected</AlertTitle>
          <AlertDescription>
            Owner can edit and re-submit for another review.
          </AlertDescription>
        </Alert>
      )}
      {query.error && (
        <Alert variant="destructive" className="rounded-3xl">
          <AlertTitle>Action failed</AlertTitle>
          <AlertDescription>{query.error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <section className="soft-card overflow-hidden">
          {property.images[0] && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={property.images[0]}
              alt=""
              className="aspect-[16/10] w-full object-cover"
            />
          )}
          <div className="space-y-4 p-6">
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill status={property.verification_status} />
              {property.is_published && (
                <span className="sage-pill">Published</span>
              )}
            </div>
            <h2 className="font-heading text-2xl font-semibold sm:text-3xl">
              {property.title}
            </h2>
            <p className="text-sm text-muted-foreground">
              {propertyTypeLabel(property.property_type)} ·{" "}
              {districtLabel(property.district)}
              {property.address_line ? ` · ${property.address_line}` : ""}
            </p>
            <p className="font-heading text-3xl font-semibold">
              {formatRentLabel(property.price)}
            </p>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {property.description}
            </p>
            {property.rejection_reason && (
              <div className="rounded-2xl bg-destructive/5 px-4 py-3 text-sm text-destructive">
                Rejection reason: {property.rejection_reason}
              </div>
            )}
          </div>
        </section>

        <aside className="space-y-6">
          <section className="soft-card space-y-3 p-5">
            <h3 className="font-heading text-lg font-semibold">Owner</h3>
            {owner ? (
              <div className="space-y-1 text-sm">
                <p className="font-medium">{owner.full_name}</p>
                <p className="capitalize text-muted-foreground">{owner.role}</p>
                <p className="text-muted-foreground">{owner.email}</p>
                {owner.phone && (
                  <p className="text-muted-foreground">{owner.phone}</p>
                )}
                <div className="pt-2">
                  <StatusPill status={owner.kyc_status} kind="kyc" />
                </div>
                <Link
                  href={`/admin/kyc/${owner.id}`}
                  className="inline-flex pt-2 text-xs font-medium underline underline-offset-4"
                >
                  Open KYC review
                </Link>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Owner profile missing.</p>
            )}
          </section>

          {pending && (
            <section className="soft-card space-y-5 p-5">
              <h3 className="font-heading text-lg font-semibold">Decision</h3>
              <form action={approvePropertyAction} className="space-y-3">
                <input type="hidden" name="propertyId" value={property.id} />
                <div className="space-y-2">
                  <Label htmlFor="notes">Internal notes (optional)</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    rows={2}
                    placeholder="e.g. C of O matched Asokoro address"
                    className="rounded-2xl bg-background"
                  />
                </div>
                <Button type="submit" className="w-full rounded-full">
                  Approve & publish
                </Button>
              </form>
              <div className="border-t border-border/70 pt-4">
                <RejectForm
                  action={rejectPropertyAction}
                  hiddenFields={{ propertyId: property.id }}
                  submitLabel="Reject listing"
                  placeholder="e.g. C of O name does not match owner profile"
                />
              </div>
            </section>
          )}
        </aside>
      </div>

      <section className="space-y-4">
        <h3 className="font-heading text-xl font-semibold">
          Submitted documents
        </h3>
        {documents.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No documents attached to this listing or owner yet.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc) => (
              <DocumentCard key={doc.id} document={doc} />
            ))}
          </div>
        )}
      </section>
    </AdminShell>
  );
}
