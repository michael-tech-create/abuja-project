import type { Metadata } from "next";
import Link from "next/link";

import { AuthShell } from "@/components/auth/auth-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const metadata: Metadata = {
  title: "Check your email",
};

type CheckEmailPageProps = {
  searchParams: Promise<{ email?: string }>;
};

export default async function CheckEmailPage({ searchParams }: CheckEmailPageProps) {
  const { email } = await searchParams;

  return (
    <AuthShell
      title="Check your email"
      description="We sent a confirmation link to activate your AbujaRentals account."
    >
      <Alert>
        <AlertTitle>Confirmation required</AlertTitle>
        <AlertDescription>
          {email ? (
            <>
              Open the link sent to <strong>{email}</strong> to finish signing
              up. After confirming, you will complete a short onboarding step.
            </>
          ) : (
            <>
              Open the confirmation link in your inbox, then return here to sign
              in.
            </>
          )}
        </AlertDescription>
      </Alert>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Wrong email?{" "}
        <Link
          href="/auth/signup"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Sign up again
        </Link>{" "}
        or{" "}
        <Link
          href="/auth/login"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          sign in
        </Link>
        .
      </p>
    </AuthShell>
  );
}
