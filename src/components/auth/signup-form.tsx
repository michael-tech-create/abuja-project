"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { GoogleButton } from "@/components/auth/google-button";
import { RolePicker } from "@/components/auth/role-picker";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ROLE_OPTIONS } from "@/lib/auth/constants";
import { signUpAction, type AuthActionState } from "@/lib/auth/actions";

const initialState: AuthActionState = {};

type RoleValue = (typeof ROLE_OPTIONS)[number]["value"];

export function SignupForm() {
  const [role, setRole] = useState<RoleValue>("tenant");
  const [state, formAction, pending] = useActionState(signUpAction, initialState);

  return (
    <div className="space-y-6">
      {state.error && (
        <Alert variant="destructive">
          <AlertTitle>Could not create account</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <RolePicker value={role} onChange={setRole} />

      <GoogleButton
        mode="signup"
        role={role}
        label="Sign up with Google"
      />

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">or email</span>
        <Separator className="flex-1" />
      </div>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="role" value={role} />

        <div className="space-y-2">
          <Label htmlFor="fullName">Full name</Label>
          <Input
            id="fullName"
            name="fullName"
            autoComplete="name"
            placeholder="Adaeze Okonkwo"
            required
            aria-invalid={Boolean(state.fieldErrors?.fullName)}
          />
          {state.fieldErrors?.fullName?.[0] && (
            <p className="text-xs text-destructive">
              {state.fieldErrors.fullName[0]}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
            aria-invalid={Boolean(state.fieldErrors?.email)}
          />
          {state.fieldErrors?.email?.[0] && (
            <p className="text-xs text-destructive">{state.fieldErrors.email[0]}</p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              aria-invalid={Boolean(state.fieldErrors?.password)}
            />
            {state.fieldErrors?.password?.[0] && (
              <p className="text-xs text-destructive">
                {state.fieldErrors.password[0]}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              aria-invalid={Boolean(state.fieldErrors?.confirmPassword)}
            />
            {state.fieldErrors?.confirmPassword?.[0] && (
              <p className="text-xs text-destructive">
                {state.fieldErrors.confirmPassword[0]}
              </p>
            )}
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/auth/login"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
