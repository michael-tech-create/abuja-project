import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getSessionUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Reset password",
};

export default async function ResetPasswordPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect(
      `/auth/forgot-password?error=${encodeURIComponent(
        "Open the reset link from your email first. If it expired, request a new one.",
      )}`,
    );
  }

  return (
    <AuthShell
      title="Choose a new password"
      description="Enter a new password for your AbujaRentals account."
    >
      <Alert className="mb-6 rounded-3xl border-border/70 bg-card">
        <AlertTitle>Secure reset</AlertTitle>
        <AlertDescription>
          Signed in as <strong>{user.email}</strong>. After saving, you&apos;ll
          continue to your dashboard.{" "}
          <Link href="/auth/login" className="underline">
            Back to login
          </Link>
        </AlertDescription>
      </Alert>
      <ResetPasswordForm />
    </AuthShell>
  );
}
