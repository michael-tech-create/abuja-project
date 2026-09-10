import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot password",
};

type PageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function ForgotPasswordPage({ searchParams }: PageProps) {
  const { error } = await searchParams;

  return (
    <AuthShell
      title="Forgot your password?"
      description="Reset with an email link, or get a magic link to sign in without a password."
    >
      <ForgotPasswordForm errorFromQuery={error} />
    </AuthShell>
  );
}
