"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  requestPasswordResetAction,
  sendMagicLinkAction,
  type AuthActionState,
} from "@/lib/auth/actions";

const initialState: AuthActionState = {};

type ForgotPasswordFormProps = {
  errorFromQuery?: string;
};

export function ForgotPasswordForm({ errorFromQuery }: ForgotPasswordFormProps) {
  const [resetState, resetAction, resetPending] = useActionState(
    requestPasswordResetAction,
    initialState,
  );
  const [magicState, magicAction, magicPending] = useActionState(
    sendMagicLinkAction,
    initialState,
  );

  const error = resetState.error || magicState.error || errorFromQuery;

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Could not send email</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form action={resetAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={resetPending || magicPending}>
          {resetPending ? "Sending…" : "Send password reset link"}
        </Button>
      </form>

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">or</span>
        <Separator className="flex-1" />
      </div>

      <form action={magicAction} className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Prefer a one-click sign-in? We&apos;ll email a magic link (no password).
        </p>
        <Input
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
        />
        <Button
          type="submit"
          variant="outline"
          className="w-full"
          disabled={resetPending || magicPending}
        >
          {magicPending ? "Sending…" : "Send magic link"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Remembered it?{" "}
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
