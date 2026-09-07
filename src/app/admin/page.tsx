import type { Metadata } from "next";
import Link from "next/link";

import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminAccess } from "@/lib/admin/access";
import {
  getAdminQueueSummary,
  listPendingKyc,
  listPendingProperties,
  listRecentAdminActions,
} from "@/lib/admin/queries";
import { districtLabel, formatRentLabel } from "@/lib/properties/format";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const metadata: Metadata = {
  title: "Admin",
};

export default async function AdminOverviewPage() {
  const { profile, source } = await requireAdminAccess();
  const [summary, pendingListings, pendingKyc, recentActions] =
    await Promise.all([
      getAdminQueueSummary(),
      listPendingProperties(),
      listPendingKyc(),
      listRecentAdminActions(),
    ]);

  return (
    <AdminShell
      profile={profile}
      active="overview"
      demo={source === "demo"}
      title="Verification queue"
      description="Review property documents and landlord/agent KYC before applying the Verified badge."
    >
      {source === "demo" && (
        <Alert className="rounded-3xl border-border/70 bg-card">
          <AlertTitle>Demo admin portal</AlertTitle>
          <AlertDescription>
            Supabase is not connected. Approve/reject actions update in-memory
            demo data for this server process. Promote a real admin with{" "}
            <code className="text-foreground">
              update profiles set role = &apos;admin&apos; where email = &apos;…&apos;
            </code>
            .
          </AlertDescription>
        </Alert>
      )}

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Pending listings"
          value={summary.pendingListings}
          href="/admin/listings"
        />
        <StatCard
          label="Pending KYC"
          value={summary.pendingKyc}
          href="/admin/kyc"
        />
        <StatCard
          label="Pending documents"
          value={summary.pendingDocuments}
          href="/admin/kyc"
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="soft-card p-5">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="font-heading text-xl font-semibold">
              Listings to review
            </h2>
            <Link
              href="/admin/listings"
              className="text-xs font-medium underline underline-offset-4"
            >
              View all
            </Link>
          </div>
          {pendingListings.items.length === 0 ? (
            <p className="text-sm text-muted-foreground">Queue is clear.</p>
          ) : (
            <ul className="divide-y divide-border/60">
              {pendingListings.items.slice(0, 4).map((property) => (
                <li key={property.id}>
                  <Link
                    href={`/admin/listings/${property.id}`}
                    className="flex items-start justify-between gap-3 py-3 hover:bg-sand/40"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{property.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {districtLabel(property.district)} ·{" "}
                        {formatRentLabel(property.price)}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      Review
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="soft-card p-5">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="font-heading text-xl font-semibold">KYC to review</h2>
            <Link
              href="/admin/kyc"
              className="text-xs font-medium underline underline-offset-4"
            >
              View all
            </Link>
          </div>
          {pendingKyc.items.length === 0 ? (
            <p className="text-sm text-muted-foreground">Queue is clear.</p>
          ) : (
            <ul className="divide-y divide-border/60">
              {pendingKyc.items.slice(0, 4).map((person) => (
                <li key={person.id}>
                  <Link
                    href={`/admin/kyc/${person.id}`}
                    className="flex items-start justify-between gap-3 py-3 hover:bg-sand/40"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{person.full_name}</p>
                      <p className="text-xs capitalize text-muted-foreground">
                        {person.role}
                        {person.company_name ? ` · ${person.company_name}` : ""}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      Review
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="soft-card p-5">
        <h2 className="mb-4 font-heading text-xl font-semibold">
          Recent admin actions
        </h2>
        {recentActions.items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No actions yet.</p>
        ) : (
          <ul className="space-y-3">
            {recentActions.items.map((action) => (
              <li
                key={action.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-sand/60 px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium capitalize">
                    {action.action.replaceAll("_", " ")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {action.target_type} · {action.target_id.slice(0, 12)}
                    {action.notes ? ` · ${action.notes}` : ""}
                  </p>
                </div>
                <time className="text-xs text-muted-foreground">
                  {new Date(action.created_at).toLocaleString("en-NG")}
                </time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AdminShell>
  );
}

function StatCard({
  label,
  value,
  href,
}: {
  label: string;
  value: number;
  href: string;
}) {
  return (
    <Link href={href} className="soft-card block p-5 transition-transform hover:-translate-y-0.5">
      <p className="text-xs tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-2 font-heading text-4xl font-semibold">{value}</p>
    </Link>
  );
}
