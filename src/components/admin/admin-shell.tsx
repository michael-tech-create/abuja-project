import Link from "next/link";

import { SiteHeader } from "@/components/layout/site-header";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types/database";

type AdminShellProps = {
  profile: Profile | null;
  title: string;
  description?: string;
  active: "overview" | "listings" | "kyc";
  demo?: boolean;
  children: React.ReactNode;
};

const nav = [
  { href: "/admin", id: "overview" as const, label: "Overview" },
  { href: "/admin/listings", id: "listings" as const, label: "Listings" },
  { href: "/admin/kyc", id: "kyc" as const, label: "KYC / docs" },
];

export function AdminShell({
  profile,
  title,
  description,
  active,
  demo,
  children,
}: AdminShellProps) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader profile={profile} />
      <main className="mx-auto w-full max-w-6xl flex-1 space-y-8 px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
              Admin portal
            </p>
            <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              {title}
            </h1>
            {description && (
              <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
                {description}
              </p>
            )}
          </div>
          {demo && <span className="sage-pill">Demo mode</span>}
        </div>

        <nav className="flex flex-wrap gap-2">
          {nav.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "inline-flex h-9 items-center rounded-full px-4 text-sm font-medium transition-colors",
                active === item.id
                  ? "bg-primary text-primary-foreground"
                  : "border border-border/80 bg-card hover:bg-sand",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {children}
      </main>
    </div>
  );
}
