import Link from "next/link";

import { Button } from "@/components/ui/button";
import { signOutAction } from "@/lib/auth/actions";
import { isAdminProfile } from "@/lib/admin/access";
import { canManageListings } from "@/lib/properties/access";
import { APP_NAME } from "@/lib/constants";
import type { Profile } from "@/types/database";

type SiteHeaderProps = {
  profile: Profile | null;
};

export function SiteHeader({ profile }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-6">
        <Link
          href="/"
          className="font-heading text-lg font-semibold tracking-tight text-foreground"
        >
          {APP_NAME}
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/browse"
            className="inline-flex h-9 items-center rounded-full px-3 text-sm font-medium text-foreground/80 hover:bg-sand hover:text-foreground"
          >
            Browse
          </Link>
          <Link
            href="/messages"
            className="inline-flex h-9 items-center rounded-full px-3 text-sm font-medium text-foreground/80 hover:bg-sand hover:text-foreground"
          >
            Messages
          </Link>
          {profile ? (
            <>
              <Link
                href="/dashboard"
                className="hidden h-9 items-center rounded-full px-3 text-sm font-medium text-foreground/80 hover:bg-sand hover:text-foreground sm:inline-flex"
              >
                Dashboard
              </Link>
              {canManageListings(profile) && (
                <>
                  <Link
                    href="/dashboard/listings"
                    className="hidden h-9 items-center rounded-full px-3 text-sm font-medium text-foreground/80 hover:bg-sand hover:text-foreground md:inline-flex"
                  >
                    Listings
                  </Link>
                  <Link
                    href="/dashboard/kyc"
                    className="hidden h-9 items-center rounded-full px-3 text-sm font-medium text-foreground/80 hover:bg-sand hover:text-foreground md:inline-flex"
                  >
                    KYC
                  </Link>
                </>
              )}
              {isAdminProfile(profile) && (
                <Link
                  href="/admin"
                  className="inline-flex h-9 items-center rounded-full px-3 text-sm font-medium text-foreground/80 hover:bg-sand hover:text-foreground"
                >
                  Admin
                </Link>
              )}
              <form action={signOutAction}>
                <Button
                  type="submit"
                  variant="outline"
                  className="rounded-full border-border/80"
                >
                  Sign out
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="inline-flex h-9 items-center rounded-full px-3 text-sm font-medium text-foreground/80 hover:bg-sand hover:text-foreground"
              >
                Sign in
              </Link>
              <Link
                href="/auth/signup"
                className="inline-flex h-9 items-center rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
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
