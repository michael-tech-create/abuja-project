"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getSessionUser } from "@/lib/auth/session";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";

const reviewSchema = z.object({
  propertyId: z.string().uuid(),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().min(10, "Review must be at least 10 characters").max(2000),
});

export type ReviewActionState = {
  error?: string;
  success?: string;
};

export async function submitReviewAction(
  _prev: ReviewActionState,
  formData: FormData,
): Promise<ReviewActionState> {
  if (!hasSupabaseEnv()) {
    return { error: "Supabase is not configured." };
  }

  const user = await getSessionUser();
  if (!user) {
    return { error: "Sign in to leave a review." };
  }

  const parsed = reviewSchema.safeParse({
    propertyId: formData.get("propertyId"),
    rating: formData.get("rating"),
    comment: formData.get("comment"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.flatten().fieldErrors.comment?.[0] ?? "Invalid review.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("reviews").upsert(
    {
      property_id: parsed.data.propertyId,
      user_id: user.id,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "property_id,user_id" },
  );

  if (error) {
    if (/reviews|schema cache|42P01/i.test(error.message)) {
      return {
        error:
          "Reviews table missing. Run scripts/STEP6-reviews-nin.sql in Supabase SQL Editor.",
      };
    }
    return { error: error.message };
  }

  revalidatePath(`/properties/${parsed.data.propertyId}`);
  redirect(`/properties/${parsed.data.propertyId}?reviewed=1`);
}
