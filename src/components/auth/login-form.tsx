"use client";

import Link from "next/link";
import { useActionState } from "react";

import { GoogleButton } from "@/components/auth/google-button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { signInAction, type AuthActionState } from "@/lib/auth/actions";

const initialState: AuthActionState = {};

type LoginFormProps = {
  errorFromQuery?: string;
};

export function LoginForm({ errorFromQuery }: LoginFormProps) {
  const [state, formAction, pending] = useActionState(signInAction, initialState);

  return (
    <div className="space-y-6">
      {(state.error || errorFromQuery) && (
        <Alert variant="destructive">
          <AlertTitle>Could not sign in</AlertTitle>
          <AlertDescription>{state.error ?? errorFromQuery}</AlertDescription>
        </Alert>
      )}

      <GoogleButton mode="login" label="Sign in with Google" />

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">or email</span>
        <Separator className="flex-1" />
      </div>

      <form action={formAction} className="space-y-4">
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

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            aria-invalid={Boolean(state.fieldErrors?.password)}
          />
          {state.fieldErrors?.password?.[0] && (
            <p className="text-xs text-destructive">
              {state.fieldErrors.password[0]}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        New to AbujaRentals?{" "}
        <Link href="/auth/signup" className="font-medium text-foreground underline-offset-4 hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
