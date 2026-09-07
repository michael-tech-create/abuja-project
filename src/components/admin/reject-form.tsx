"use client";

import { useActionState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { AdminActionState } from "@/lib/admin/actions";

const initialState: AdminActionState = {};

type RejectFormProps = {
  hiddenFields: Record<string, string>;
  action: (
    prev: AdminActionState,
    formData: FormData,
  ) => Promise<AdminActionState>;
  submitLabel: string;
  placeholder?: string;
};

export function RejectForm({
  hiddenFields,
  action,
  submitLabel,
  placeholder = "Explain what is missing or incorrect…",
}: RejectFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-3">
      {Object.entries(hiddenFields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      {state.error && (
        <Alert variant="destructive">
          <AlertTitle>Could not reject</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      <div className="space-y-2">
        <Label htmlFor="reason">Rejection reason</Label>
        <Textarea
          id="reason"
          name="reason"
          required
          rows={3}
          placeholder={placeholder}
          className="rounded-2xl bg-background"
        />
      </div>
      <Button type="submit" variant="destructive" disabled={pending} className="rounded-full">
        {pending ? "Rejecting…" : submitLabel}
      </Button>
    </form>
  );
}
