import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentProfile, getSessionUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/auth/login");
  }

  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/auth/login");
  }

  if (!profile.onboarding_completed) {
    redirect("/onboarding");
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader profile={profile} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <div className="mb-8 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Hello, {profile.full_name.split(" ")[0]}
            </h1>
            <Badge variant="secondary" className="capitalize">
              {profile.role}
            </Badge>
            <Badge
              variant={
                profile.kyc_status === "verified" ? "default" : "outline"
              }
              className="capitalize"
            >
              KYC: {profile.kyc_status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Manage your AbujaRentals account
            {profile.role === "landlord" || profile.role === "agent"
              ? " and property listings"
              : ""}
            .
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Contact details from onboarding</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">Email:</span>{" "}
                {profile.email}
              </p>
              <p>
                <span className="text-muted-foreground">Phone:</span>{" "}
                {profile.phone}
              </p>
              {profile.company_name && (
                <p>
                  <span className="text-muted-foreground">Company:</span>{" "}
                  {profile.company_name}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                {profile.role === "tenant"
                  ? "Next up"
                  : profile.role === "admin"
                    ? "Moderation"
                    : "Listings"}
              </CardTitle>
              <CardDescription>
                {profile.role === "tenant"
                  ? "Coming soon for tenants"
                  : profile.role === "admin"
                    ? "Review tools"
                    : "Create and manage your properties"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              {profile.role === "tenant" ? (
                <>
                  <ul className="list-disc space-y-1 pl-5">
                    <li>Browse verified homes by district and budget</li>
                    <li>Message landlords in real time from any listing</li>
                  </ul>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href="/browse"
                      className="inline-flex h-8 items-center rounded-full bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                      Browse listings
                    </Link>
                    <Link
                      href="/messages"
                      className="inline-flex h-8 items-center rounded-full border border-border px-3 text-sm font-medium hover:bg-sand"
                    >
                      Messages
                    </Link>
                  </div>
                </>
              ) : profile.role === "admin" ? (
                <ul className="list-disc space-y-1 pl-5">
                  <li>
                    Open the{" "}
                    <Link href="/admin" className="text-foreground underline">
                      admin portal
                    </Link>{" "}
                    to review KYC and listings
                  </li>
                  <li>
                    Or manage your own listings in{" "}
                    <Link
                      href="/dashboard/listings"
                      className="text-foreground underline"
                    >
                      My listings
                    </Link>
                  </li>
                </ul>
              ) : (
                <>
                  <ul className="list-disc space-y-1 pl-5">
                    <li>
                      Upload KYC docs (NIN / C of O) at{" "}
                      <Link href="/dashboard/kyc" className="underline">
                        KYC
                      </Link>{" "}
                      (status:{" "}
                      <span className="capitalize text-foreground">
                        {profile.kyc_status}
                      </span>
                      )
                    </li>
                    <li>Create listings with photos/videos</li>
                    <li>After KYC approval, publish listings to Browse</li>
                  </ul>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href="/dashboard/kyc"
                      className="inline-flex h-8 items-center rounded-full bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                      Upload KYC
                    </Link>
                    <Link
                      href="/dashboard/listings"
                      className="inline-flex h-8 items-center rounded-full border border-border px-3 text-sm font-medium hover:bg-sand"
                    >
                      Listings
                    </Link>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
