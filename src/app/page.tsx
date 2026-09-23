import Link from "next/link";

import { HomeCta } from "@/components/home/home-cta";
import { HomeFeatures } from "@/components/home/home-features";
import { HomeHero } from "@/components/home/home-hero";
import { HomeMarkets } from "@/components/home/home-markets";
import { HomeSponsors } from "@/components/home/home-sponsors";
import { HomeUsedBy } from "@/components/home/home-used-by";
import { BrandLogo } from "@/components/brand/brand-logo";
import { SiteHeader } from "@/components/layout/site-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getCurrentProfile } from "@/lib/auth/session";
import { getSchemaStatus } from "@/lib/supabase/schema";

export default async function HomePage() {
  const schema = await getSchemaStatus();
  const profile = schema.ok ? await getCurrentProfile() : null;

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader profile={profile} />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-20 px-6 py-10 sm:py-14">
        {!schema.ok && (
          <Alert className="rounded-3xl border-amber-500/30 bg-amber-50 text-foreground">
            <AlertTitle>Database setup required</AlertTitle>
            <AlertDescription>
              Your Supabase project is connected, but tables are missing.{" "}
              <Link
                href="/setup"
                className="font-medium underline underline-offset-4"
              >
                Open setup instructions
              </Link>{" "}
              and run <code>scripts/INSTALL.sql</code> in the SQL Editor.
            </AlertDescription>
          </Alert>
        )}

        <HomeHero profileName={profile?.full_name ?? null} />
        <HomeSponsors />
        <HomeMarkets />
        <HomeFeatures />
        <HomeUsedBy />
        <HomeCta />
      </main>

      <footer className="border-t border-border/60 bg-card/40">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
          <BrandLogo imgClassName="h-8 w-auto rounded-md" />
          <p className="text-xs text-muted-foreground">
            Verified rentals for Abuja, Nigeria · Trust first, chat in real time
          </p>
          <div className="flex gap-4 text-xs font-medium">
            <Link href="/browse" className="hover:underline">
              Browse
            </Link>
            <Link href="/auth/signup" className="hover:underline">
              Sign up
            </Link>
            <Link href="/dashboard/kyc" className="hover:underline">
              KYC
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
