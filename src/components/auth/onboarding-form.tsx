"use client";

import { useActionState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  completeOnboardingAction,
  type AuthActionState,
} from "@/lib/auth/actions";
import type { Profile } from "@/types/database";

const initialState: AuthActionState = {};

type OnboardingFormProps = {
  profile: Profile;
};

export function OnboardingForm({ profile }: OnboardingFormProps) {
  const [state, formAction, pending] = useActionState(
    completeOnboardingAction,
    initialState,
  );

  const isLister = profile.role === "landlord" || profile.role === "agent";

  return (
    <div className="space-y-6">
      {state.error && (
        <Alert variant="destructive">
          <AlertTitle>Could not save profile</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <div className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm">
        <p className="font-medium text-foreground">
          Signed up as{" "}
          <span className="capitalize">{profile.role}</span>
        </p>
        <p className="mt-1 text-muted-foreground">{profile.email}</p>
      </div>

      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full name</Label>
          <Input
            id="fullName"
            name="fullName"
            defaultValue={profile.full_name}
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
          <Label htmlFor="phone">Phone number</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="+234 801 234 5678"
            defaultValue={profile.phone ?? ""}
            required
            aria-invalid={Boolean(state.fieldErrors?.phone)}
          />
          {state.fieldErrors?.phone?.[0] && (
            <p className="text-xs text-destructive">{state.fieldErrors.phone[0]}</p>
          )}
        </div>

        {isLister && (
          <div className="space-y-2">
            <Label htmlFor="companyName">
              {profile.role === "agent" ? "Agency name" : "Company / trading name"}
            </Label>
            <Input
              id="companyName"
              name="companyName"
              defaultValue={profile.company_name ?? ""}
              placeholder={
                profile.role === "agent"
                  ? "e.g. Capital Homes Agency"
                  : "e.g. Okonkwo Properties"
              }
              required
              aria-invalid={Boolean(state.fieldErrors?.companyName)}
            />
            {state.fieldErrors?.companyName?.[0] && (
              <p className="text-xs text-destructive">
                {state.fieldErrors.companyName[0]}
              </p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="bio">Short bio (optional)</Label>
          <Textarea
            id="bio"
            name="bio"
            rows={3}
            defaultValue={profile.bio ?? ""}
            placeholder="Tell tenants a bit about yourself…"
            aria-invalid={Boolean(state.fieldErrors?.bio)}
          />
          {state.fieldErrors?.bio?.[0] && (
            <p className="text-xs text-destructive">{state.fieldErrors.bio[0]}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Saving…" : "Finish setup"}
        </Button>
      </form>
    </div>
  );
}
