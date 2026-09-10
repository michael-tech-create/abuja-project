import type { Metadata } from "next";
import Link from "next/link";

import { AuthShell } from "@/components/auth/auth-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const metadata: Metadata = {
  title: "Check your email",
};

type CheckEmailPageProps = {
  searchParams: Promise<{ email?: string; type?: string }>;
};

export default async function CheckEmailPage({ searchParams }: CheckEmailPageProps) {
  const { email, type } = await searchParams;

  const title =
    type === "reset"
      ? "Reset link sent"
      : type === "magic"
        ? "Magic link sent"
        : "Check your email";

  const description =
    type === "reset"
      ? "Open the password reset email and tap the link to choose a new password."
      : type === "magic"
        ? "Open the magic link email to sign in without a password."
        : "We sent a confirmation link to activate your AbujaRentals account.";

  return (
    <AuthShell title={title} description={description}>
      <Alert>
        <AlertTitle>
          {type === "reset"
            ? "Password reset"
            : type === "magic"
              ? "Magic link"
              : "Confirmation required"}
        </AlertTitle>
        <AlertDescription>
          {email ? (
            <>
              Open the link sent to <strong>{email}</strong>.
              {type === "reset" && (
                <>
                  {" "}
                  It will take you to a page where you can set a new password —
                  not the homepage.
                </>
              )}
            </>
          ) : (
            <>Open the link in your inbox, then return here to continue.</>
          )}
        </AlertDescription>
      </Alert>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link
          href="/auth/login"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Back to sign in
        </Link>
        {" · "}
        <Link
          href="/auth/forgot-password"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Resend link
        </Link>
      </p>
    </AuthShell>
  );
}
