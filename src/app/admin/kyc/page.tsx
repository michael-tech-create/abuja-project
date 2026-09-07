import type { Metadata } from "next";
import Link from "next/link";

import { AdminShell } from "@/components/admin/admin-shell";
import { StatusPill } from "@/components/admin/status-pill";
import { requireAdminAccess } from "@/lib/admin/access";
import { listPendingKyc } from "@/lib/admin/queries";

export const metadata: Metadata = {
  title: "Review KYC",
};

export default async function AdminKycPage() {
  const { profile, source } = await requireAdminAccess();
  const { items } = await listPendingKyc();

  return (
    <AdminShell
      profile={profile}
      active="kyc"
      demo={source === "demo"}
      title="KYC & legal documents"
      description="Review NIN, C of O, agency licences, and supporting bills for landlords and agents."
    >
      {items.length === 0 ? (
        <div className="soft-card px-6 py-16 text-center">
          <h2 className="font-heading text-xl font-semibold">No pending KYC</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            New landlord and agent submissions will show here.
          </p>
        </div>
      ) : (
        <ul className="soft-card divide-y divide-border/60 overflow-hidden">
          {items.map((person) => (
            <li key={person.id}>
              <Link
                href={`/admin/kyc/${person.id}`}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 hover:bg-sand/50"
              >
                <div>
                  <p className="font-medium">{person.full_name}</p>
                  <p className="text-sm capitalize text-muted-foreground">
                    {person.role}
                    {person.company_name ? ` · ${person.company_name}` : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">{person.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusPill status={person.kyc_status} kind="kyc" />
                  <span className="text-xs font-medium">Review</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </AdminShell>
  );
}
