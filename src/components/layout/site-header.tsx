import Link from "next/link";

import { BrandLogo } from "@/components/brand/brand-logo";
import { NavDropdown } from "@/components/layout/nav-dropdown";
import { isAdminProfile } from "@/lib/admin/access";
import { canManageListings } from "@/lib/properties/access";
import type { Profile } from "@/types/database";

type SiteHeaderProps = {
  profile: Profile | null;
};

export function SiteHeader({ profile }: SiteHeaderProps) {
  const accountItems = profile
    ? [
        { href: "/dashboard", label: "Dashboard" },
        { href: "/messages", label: "Messages" },
        ...(canManageListings(profile)
          ? [
              { href: "/dashboard/listings", label: "My listings" },
              { href: "/dashboard/listings/new", label: "Post building" },
              { href: "/dashboard/kyc", label: "KYC / NIN" },
            ]
          : [{ href: "/browse", label: "Browse homes" }]),
        ...(isAdminProfile(profile)
          ? [{ href: "/admin", label: "Admin portal" }]
          : []),
      ]
    : [];

  return (
    <header className="sticky top-0 z-40 border-b border-primary/15 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-6">
        <BrandLogo imgClassName="h-9 w-auto rounded-md" priority />

        <nav className="flex items-center gap-2">
          <Link
            href="/browse"
            className="inline-flex h-9 items-center rounded-full px-3 text-sm font-semibold text-primary/90 hover:bg-secondary"
          >
            Browse
          </Link>

          {profile ? (
            <>
              <Link
                href="/messages"
                className="hidden h-9 items-center rounded-full px-3 text-sm font-semibold text-primary/90 hover:bg-secondary sm:inline-flex"
              >
                Messages
              </Link>
              <NavDropdown
                label="Account"
                items={accountItems}
                showSignOut
              />
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="inline-flex h-9 items-center rounded-full border border-primary/30 bg-white px-3 text-sm font-semibold text-primary hover:bg-secondary"
              >
                Sign in
              </Link>
              <Link
                href="/auth/signup"
                className="inline-flex h-9 items-center rounded-full bg-primary px-4 text-sm font-semibold text-white hover:bg-primary/90"
              >
                Get started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
