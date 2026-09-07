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
import { approveKycAction, rejectKycAction } from "@/lib/admin/actions";
import { getKycReview } from "@/lib/admin/queries";
import { attachViewUrls } from "@/lib/kyc/signed-url";
import {
  districtLabel,
  formatRentLabel,
} from "@/lib/properties/format";

type PageProps = {
  params: Promise<{ userId: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
};

export const metadata: Metadata = {
  title: "Review KYC",
};

export default async function AdminKycReviewPage({
  params,
  searchParams,
}: PageProps) {
  const { userId } = await params;
  const query = await searchParams;
  const { profile: adminProfile, source } = await requireAdminAccess();
  const { bundle } = await getKycReview(userId);

  if (!bundle) notFound();

  const { profile, properties } = bundle;
  const documents = await attachViewUrls(bundle.documents);
  const pending = profile.kyc_status === "pending";

  return (
    <AdminShell
      profile={adminProfile}
      active="kyc"
      demo={source === "demo"}
      title="KYC review"
      description="Validate identity and ownership documents before marking the profile verified."
    >
      <Link
        href="/admin/kyc"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back to KYC queue
      </Link>

      {query.success === "approved" && (
        <Alert className="rounded-3xl border-border/70 bg-card">
          <AlertTitle>KYC approved</AlertTitle>
          <AlertDescription>
            Profile marked verified. This landlord/agent can now publish their
            own listings to Browse.
          </AlertDescription>
        </Alert>
      )}
      {query.success === "rejected" && (
        <Alert className="rounded-3xl border-border/70 bg-card">
          <AlertTitle>KYC rejected</AlertTitle>
          <AlertDescription>
            The lister can re-upload documents and resubmit.
          </AlertDescription>
        </Alert>
      )}
      {query.error && (
        <Alert variant="destructive" className="rounded-3xl">
          <AlertTitle>Action failed</AlertTitle>
          <AlertDescription>{query.error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="soft-card space-y-4 p-6">
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill status={profile.kyc_status} kind="kyc" />
            <span className="rounded-full bg-sand px-3 py-1 text-xs capitalize">
              {profile.role}
            </span>
          </div>
          <h2 className="font-heading text-3xl font-semibold">
            {profile.full_name}
          </h2>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>{profile.email}</p>
            {profile.phone && <p>{profile.phone}</p>}
            {profile.company_name && <p>{profile.company_name}</p>}
            {profile.bio && <p className="pt-2 text-foreground/80">{profile.bio}</p>}
          </div>

          <div className="border-t border-border/70 pt-4">
            <h3 className="mb-3 font-heading text-lg font-semibold">
              Related listings
            </h3>
            {properties.length === 0 ? (
              <p className="text-sm text-muted-foreground">No listings yet.</p>
            ) : (
              <ul className="space-y-2">
                {properties.map((property) => (
                  <li key={property.id}>
                    <Link
                      href={`/admin/listings/${property.id}`}
                      className="flex items-center justify-between gap-3 rounded-2xl bg-sand/70 px-4 py-3 text-sm hover:bg-sand"
                    >
                      <span className="min-w-0 truncate font-medium">
                        {property.title}
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {districtLabel(property.district)} ·{" "}
                        {formatRentLabel(property.price)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {pending && (
          <aside className="soft-card space-y-5 self-start p-5">
            <h3 className="font-heading text-lg font-semibold">Decision</h3>
            <form action={approveKycAction} className="space-y-3">
              <input type="hidden" name="profileId" value={profile.id} />
              <div className="space-y-2">
                <Label htmlFor="notes">Internal notes (optional)</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  rows={2}
                  placeholder="e.g. NIN matched full name"
                  className="rounded-2xl bg-background"
                />
              </div>
              <Button type="submit" className="w-full rounded-full">
                Approve KYC
              </Button>
            </form>
            <div className="border-t border-border/70 pt-4">
              <RejectForm
                action={rejectKycAction}
                hiddenFields={{ profileId: profile.id }}
                submitLabel="Reject KYC"
                placeholder="e.g. Utility bill address does not match company"
              />
            </div>
          </aside>
        )}
      </div>

      <section className="space-y-4">
        <h3 className="font-heading text-xl font-semibold">Documents</h3>
        {documents.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No documents uploaded for this profile.
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
