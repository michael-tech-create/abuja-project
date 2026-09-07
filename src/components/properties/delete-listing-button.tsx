"use client";

import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { deletePropertyAction } from "@/lib/properties/actions";

type DeleteListingButtonProps = {
  propertyId: string;
  title: string;
};

export function DeleteListingButton({
  propertyId,
  title,
}: DeleteListingButtonProps) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="destructive"
      disabled={pending}
      onClick={() => {
        const confirmed = window.confirm(
          `Delete “${title}” and its photos permanently? This cannot be undone.`,
        );
        if (!confirmed) return;
        const fd = new FormData();
        fd.set("propertyId", propertyId);
        startTransition(() => {
          void deletePropertyAction(fd);
        });
      }}
    >
      {pending ? "Deleting…" : "Delete listing"}
    </Button>
  );
}
