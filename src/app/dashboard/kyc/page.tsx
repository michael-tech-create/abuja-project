import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { KycUploadForm } from "@/components/kyc/kyc-upload-form";
import { SiteHeader } from "@/components/layout/site-header";
import { StatusPill } from "@/components/admin/status-pill";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DOCUMENT_TYPE_LABELS } from "@/lib/admin/labels";
import { getCurrentProfile, getSessionUser } from "@/lib/auth/session";
import { getMyKycDocuments } from "@/lib/kyc/queries";
import { attachViewUrls } from "@/lib/kyc/signed-url";
import { canManageListings } from "@/lib/properties/access";

export const metadata: Metadata = {
  title: "KYC documents",
};

type PageProps = {
  searchParams: Promise<{ success?: string }>;
};

export default async function DashboardKycPage({ searchParams }: PageProps) {
  const query = await searchParams;
  const user = await getSessionUser();
  if (!user) redirect("/auth/login?next=/dashboard/kyc");

  const profile = await getCurrentProfile();
  if (!profile) redirect("/auth/login");
  if (!profile.onboarding_completed) redirect("/onboarding");
  if (!canManageListings(profile)) redirect("/dashboard");

  if (!user.id) notFound();

  const documents = await attachViewUrls(await getMyKycDocuments(user.id));
  const canSubmit =
    profile.kyc_status === "unsubmitted" ||
    profile.kyc_status === "rejected" ||
    profile.kyc_status === "pending";

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader profile={profile} />
      <main className="mx-auto w-full max-w-3xl flex-1 space-y-8 px-6 py-10">
        <div className="space-y-2">
          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Dashboard
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-heading text-3xl font-semibold tracking-tight">
              KYC documents
            </h1>
            <StatusPill status={profile.kyc_status} kind="kyc" />
          </div>
          <p className="text-sm text-muted-foreground">
            Enter your NIN for automated Dojah verification, and upload supporting
            docs (NIN slip, C of O, licence). This is separate from property
            photos. Once verified, publish listings to Browse yourself.
          </p>
        </div>

        {(query.success === "verified" || query.success === "verified_mock") && (
          <Alert className="rounded-3xl border-border/70 bg-card">
            <AlertTitle>KYC auto-verified</AlertTitle>
            <AlertDescription>
              {query.success === "verified_mock"
                ? "NIN format passed (mock mode — add DOJAH_APP_ID + DOJAH_SECRET_KEY on Vercel for live Dojah checks). "
                : "Your NIN was verified with Dojah. "}
              You can now{" "}
              <Link href="/dashboard/listings" className="underline">
                publish listings
              </Link>
              .
            </AlertDescription>
          </Alert>
        )}

        {query.success === "submitted" && (
          <Alert className="rounded-3xl border-border/70 bg-card">
            <AlertTitle>Submitted</AlertTitle>
            <AlertDescription>
              Documents saved. If NIN verification succeeded, your KYC is
              verified automatically.
            </AlertDescription>
          </Alert>
        )}

        {profile.kyc_status === "verified" && (
          <Alert className="rounded-3xl border-border/70 bg-card">
            <AlertTitle>KYC verified</AlertTitle>
            <AlertDescription>
              You can publish listings from{" "}
              <Link
                href="/dashboard/listings"
                className="font-medium underline underline-offset-4"
              >
                My listings
              </Link>
              .
            </AlertDescription>
          </Alert>
        )}

        {profile.kyc_status === "pending" && (
          <Alert className="rounded-3xl border-border/70 bg-card">
            <AlertTitle>Waiting for admin review</AlertTitle>
            <AlertDescription>
              Your KYC is pending. You can still create listings, but Publish
              unlocks after approval.
            </AlertDescription>
          </Alert>
        )}

        {documents.length > 0 && (
          <section className="space-y-3">
            <h2 className="font-heading text-xl font-semibold">
              Submitted documents
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {documents.map((doc) => (
                <li key={doc.id} className="soft-card overflow-hidden">
                  <div className="aspect-[4/3] bg-sand">
                    {doc.view_url && doc.mime_type?.startsWith("image/") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={doc.view_url}
                        alt=""
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
                        {doc.file_name ?? "Document"}
                      </div>
                    )}
                  </div>
                  <div className="space-y-1 p-3">
                    <p className="text-sm font-medium">
                      {DOCUMENT_TYPE_LABELS[doc.doc_type]}
                    </p>
                    <StatusPill status={doc.status} />
                    {doc.view_url && (
                      <a
                        href={doc.view_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex text-xs font-medium underline underline-offset-4"
                      >
                        Open
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {canSubmit ? (
          <section className="soft-card space-y-4 p-6">
            <h2 className="font-heading text-xl font-semibold">
              {profile.kyc_status === "rejected"
                ? "Re-submit documents"
                : "Upload documents"}
            </h2>
            {profile.kyc_status === "rejected" && (
              <p className="text-sm text-destructive">
                Previous KYC was rejected. Upload clearer documents and submit
                again.
              </p>
            )}
            <KycUploadForm userId={user.id} role={profile.role} />
          </section>
        ) : null}
      </main>
    </div>
  );
}
