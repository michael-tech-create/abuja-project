"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  updatePasswordAction,
  type AuthActionState,
} from "@/lib/auth/actions";

const initialState: AuthActionState = {};

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(
    updatePasswordAction,
    initialState,
  );

  return (
    <div className="space-y-6">
      {state.error && (
        <Alert variant="destructive">
          <AlertTitle>Could not update password</AlertTitle>
          <AlertDescription>
            {state.error}{" "}
            <Link href="/auth/forgot-password" className="underline">
              Request a new link
            </Link>
          </AlertDescription>
        </Alert>
      )}

      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">New password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            aria-invalid={Boolean(state.fieldErrors?.password)}
          />
          {state.fieldErrors?.password?.[0] && (
            <p className="text-xs text-destructive">
              {state.fieldErrors.password[0]}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm new password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            aria-invalid={Boolean(state.fieldErrors?.confirmPassword)}
          />
          {state.fieldErrors?.confirmPassword?.[0] && (
            <p className="text-xs text-destructive">
              {state.fieldErrors.confirmPassword[0]}
            </p>
          )}
        </div>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Saving…" : "Update password"}
        </Button>
      </form>
    </div>
  );
}
