"use client";

import { useActionState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  submitReviewAction,
  type ReviewActionState,
} from "@/lib/reviews/actions";
import type { ReviewRow } from "@/lib/reviews/queries";

const initialState: ReviewActionState = {};

type ReviewSectionProps = {
  propertyId: string;
  reviews: ReviewRow[];
  average: number | null;
  count: number;
  canReview: boolean;
  signedIn: boolean;
};

export function ReviewSection({
  propertyId,
  reviews,
  average,
  count,
  canReview,
  signedIn,
}: ReviewSectionProps) {
  const [state, formAction, pending] = useActionState(
    submitReviewAction,
    initialState,
  );

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl font-semibold">Reviews</h2>
          <p className="text-sm text-muted-foreground">
            {count === 0
              ? "No reviews yet — be the first."
              : `${average}★ average from ${count} review${count === 1 ? "" : "s"}`}
          </p>
        </div>
      </div>

      {canReview && (
        <div className="soft-card space-y-4 p-5">
          <h3 className="font-medium">Write a review</h3>
          {state.error && (
            <Alert variant="destructive">
              <AlertTitle>Could not post review</AlertTitle>
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
          <form action={formAction} className="space-y-3">
            <input type="hidden" name="propertyId" value={propertyId} />
            <div className="space-y-2">
              <Label htmlFor="rating">Rating</Label>
              <select
                id="rating"
                name="rating"
                required
                defaultValue="5"
                className="app-select max-w-xs"
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} star{n === 1 ? "" : "s"}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="comment">Your review</Label>
              <Textarea
                id="comment"
                name="comment"
                required
                minLength={10}
                rows={4}
                placeholder="Share what you liked about this rental, the area, or dealing with the landlord…"
                className="rounded-2xl"
              />
            </div>
            <Button type="submit" className="rounded-full" disabled={pending}>
              {pending ? "Posting…" : "Post review"}
            </Button>
          </form>
        </div>
      )}

      {!signedIn && (
        <p className="text-sm text-muted-foreground">
          Sign in to like this listing and leave a review.
        </p>
      )}

      <ul className="space-y-3">
        {reviews.map((review) => (
          <li key={review.id} className="soft-card space-y-2 p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">
                {review.reviewer_name ?? "Resident"}
              </p>
              <p className="text-sm text-muted-foreground">
                {"★".repeat(review.rating)}
                {"☆".repeat(5 - review.rating)}
              </p>
            </div>
            <p className="text-sm leading-relaxed text-foreground/90">
              {review.comment}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {new Date(review.created_at).toLocaleDateString("en-NG")}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
