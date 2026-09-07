import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
  title: "Create account",
};

export default function SignupPage() {
  return (
    <AuthShell
      title="Create your account"
      description="Choose your role, then continue with Google or email. Landlords and agents will verify listings before they go public."
    >
      <SignupForm />
    </AuthShell>
  );
}
