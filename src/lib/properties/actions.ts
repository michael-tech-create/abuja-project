"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { assertCanManageListings } from "@/lib/properties/access";
import { propertyFormSchema } from "@/lib/properties/schemas";
import {
  enforceImageLimit,
  removePropertyImages,
  uploadPropertyImages,
} from "@/lib/properties/storage";
import { getCurrentProfile, getSessionUser } from "@/lib/auth/session";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";

export type PropertyActionState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string[]>;
};

function parseAmenities(formData: FormData): string[] {
  return formData
    .getAll("amenities")
    .map(String)
    .map((v) => v.trim())
    .filter(Boolean);
}

function parseJsonStringArray(formData: FormData, key: string): string[] {
  const raw = formData.get(key);
  if (!raw || typeof raw !== "string" || !raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map(String).filter(Boolean);
  } catch {
    return [];
  }
}

function parseExistingImages(formData: FormData): string[] {
  return parseJsonStringArray(formData, "existingImages");
}

function parsePropertyVideos(formData: FormData): string[] {
  const existing = parseJsonStringArray(formData, "existingVideos");
  const uploaded = parseJsonStringArray(formData, "uploadedVideos");
  return [...existing, ...uploaded].slice(0, 3);
}

function collectImageFiles(formData: FormData): File[] {
  return formData
    .getAll("images")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);
}

async function requireLister() {
  if (!hasSupabaseEnv()) {
    return {
      error:
        "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.",
    } as const;
  }

  const user = await getSessionUser();
  const profile = await getCurrentProfile();

  if (!user || !profile) {
    return { error: "You must be signed in." } as const;
  }

  try {
    assertCanManageListings(profile);
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Not allowed.",
    } as const;
  }

  if (!profile.onboarding_completed) {
    return { error: "Complete onboarding before managing listings." } as const;
  }

  return { user, profile } as const;
}

export async function createPropertyAction(
  _prev: PropertyActionState,
  formData: FormData,
): Promise<PropertyActionState> {
  const gate = await requireLister();
  if ("error" in gate) return { error: gate.error };

  const { user } = gate;
  const parsed = propertyFormSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    propertyType: formData.get("propertyType"),
    district: formData.get("district"),
    addressLine: formData.get("addressLine") ?? "",
    price: formData.get("price"),
    bedrooms: formData.get("bedrooms"),
    bathrooms: formData.get("bathrooms"),
    areaSqm: formData.get("areaSqm"),
    amenities: parseAmenities(formData),
    existingImages: [],
  });

  if (!parsed.success) {
    return {
      error: "Please fix the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const files = collectImageFiles(formData);
  const limitError = enforceImageLimit(0, files.length);
  if (limitError) return { error: limitError };
  const videos = parsePropertyVideos(formData);

  const supabase = await createClient();
  const input = parsed.data;

  const { data: created, error: insertError } = await supabase
    .from("properties")
    .insert({
      owner_id: user.id,
      title: input.title.trim(),
      description: input.description.trim(),
      property_type: input.propertyType,
      district: input.district,
      address_line: input.addressLine?.trim() || null,
      price: input.price,
      bedrooms: input.bedrooms,
      bathrooms: input.bathrooms,
      area_sqm: input.areaSqm,
      amenities: input.amenities,
      images: [],
      videos,
      verification_status: "pending",
      is_published: false,
    })
    .select("id")
    .single();

  if (insertError || !created) {
    return { error: insertError?.message ?? "Could not create listing." };
  }

  const { urls, error: uploadError } = await uploadPropertyImages({
    supabase,
    ownerId: user.id,
    propertyId: created.id,
    files,
  });

  if (uploadError) {
    await supabase.from("properties").delete().eq("id", created.id);
    return { error: `Image upload failed: ${uploadError}` };
  }

  if (urls.length > 0) {
    const { error: updateError } = await supabase
      .from("properties")
      .update({ images: urls })
      .eq("id", created.id)
      .eq("owner_id", user.id);

    if (updateError) {
      return { error: updateError.message };
    }
  }

  revalidatePath("/dashboard/listings");
  revalidatePath("/dashboard");
  redirect(`/dashboard/listings/${created.id}`);
}

export async function updatePropertyAction(
  _prev: PropertyActionState,
  formData: FormData,
): Promise<PropertyActionState> {
  const gate = await requireLister();
  if ("error" in gate) return { error: gate.error };

  const { user, profile } = gate;
  const propertyId = String(formData.get("propertyId") ?? "");
  if (!propertyId) return { error: "Missing listing id." };

  const existingImages = parseExistingImages(formData);
  const parsed = propertyFormSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    propertyType: formData.get("propertyType"),
    district: formData.get("district"),
    addressLine: formData.get("addressLine") ?? "",
    price: formData.get("price"),
    bedrooms: formData.get("bedrooms"),
    bathrooms: formData.get("bathrooms"),
    areaSqm: formData.get("areaSqm"),
    amenities: parseAmenities(formData),
    existingImages,
  });

  if (!parsed.success) {
    return {
      error: "Please fix the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const files = collectImageFiles(formData);
  const limitError = enforceImageLimit(existingImages.length, files.length);
  if (limitError) return { error: limitError };
  const videos = parsePropertyVideos(formData);

  const supabase = await createClient();
  const isAdmin = profile.role === "admin";

  let ownershipQuery = supabase
    .from("properties")
    .select("id, owner_id, images, videos, verification_status")
    .eq("id", propertyId);

  if (!isAdmin) {
    ownershipQuery = ownershipQuery.eq("owner_id", user.id);
  }

  const { data: existing, error: loadError } = await ownershipQuery.maybeSingle();

  if (loadError || !existing) {
    return { error: loadError?.message ?? "Listing not found." };
  }

  const { urls: newUrls, error: uploadError } = await uploadPropertyImages({
    supabase,
    ownerId: existing.owner_id,
    propertyId,
    files,
  });

  if (uploadError) {
    return { error: `Image upload failed: ${uploadError}` };
  }

  const removed = (existing.images ?? []).filter(
    (url) => !existingImages.includes(url),
  );
  if (removed.length > 0) {
    await removePropertyImages({ supabase, urlsOrPaths: removed });
  }

  const images = [...existingImages, ...newUrls];
  const input = parsed.data;

  // Editing a rejected listing re-queues it for review
  const nextStatus =
    existing.verification_status === "rejected" ? "pending" : existing.verification_status;

  const { error: updateError } = await supabase
    .from("properties")
    .update({
      title: input.title.trim(),
      description: input.description.trim(),
      property_type: input.propertyType,
      district: input.district,
      address_line: input.addressLine?.trim() || null,
      price: input.price,
      bedrooms: input.bedrooms,
      bathrooms: input.bathrooms,
      area_sqm: input.areaSqm,
      amenities: input.amenities,
      images,
      videos,
      verification_status: nextStatus,
      ...(nextStatus === "pending" && existing.verification_status === "rejected"
        ? {
            rejection_reason: null,
            is_published: false,
            verified_at: null,
            verified_by: null,
          }
        : {}),
    })
    .eq("id", propertyId);

  if (updateError) {
    return { error: updateError.message };
  }

  revalidatePath("/dashboard/listings");
  revalidatePath(`/dashboard/listings/${propertyId}`);
  revalidatePath(`/dashboard/listings/${propertyId}/edit`);
  redirect(`/dashboard/listings/${propertyId}`);
}

/**
 * KYC-verified landlords/agents can publish their own listings to public browse.
 * Sets verification_status=verified + is_published=true (matches browse filter + DB check).
 */
export async function publishPropertyAction(formData: FormData) {
  const gate = await requireLister();
  if ("error" in gate) {
    redirect(
      `/dashboard/listings?error=${encodeURIComponent(gate.error ?? "Not allowed")}`,
    );
  }

  const { user, profile } = gate;
  const propertyId = String(formData.get("propertyId") ?? "");
  if (!propertyId) {
    redirect("/dashboard/listings?error=Missing%20listing%20id");
  }

  if (profile.kyc_status !== "verified" && profile.role !== "admin") {
    redirect(
      `/dashboard/listings/${propertyId}?error=${encodeURIComponent(
        "Complete KYC verification before publishing. An admin must approve your documents first.",
      )}`,
    );
  }

  if (!hasSupabaseEnv()) {
    redirect(
      `/dashboard/listings/${propertyId}?error=${encodeURIComponent(
        "Connect Supabase to publish listings.",
      )}`,
    );
  }

  const supabase = await createClient();
  const isAdmin = profile.role === "admin";

  let query = supabase
    .from("properties")
    .select("id, owner_id, verification_status")
    .eq("id", propertyId);

  if (!isAdmin) {
    query = query.eq("owner_id", user.id);
  }

  const { data: existing, error: loadError } = await query.maybeSingle();
  if (loadError || !existing) {
    redirect(
      `/dashboard/listings/${propertyId}?error=${encodeURIComponent(
        loadError?.message ?? "Listing not found",
      )}`,
    );
  }

  if (existing.verification_status === "rejected" && !isAdmin) {
    redirect(
      `/dashboard/listings/${propertyId}?error=${encodeURIComponent(
        "This listing was rejected. Edit and save it first, then publish again.",
      )}`,
    );
  }

  const { error } = await supabase
    .from("properties")
    .update({
      verification_status: "verified",
      is_published: true,
      rejection_reason: null,
      verified_at: new Date().toISOString(),
      verified_by: user.id,
    })
    .eq("id", propertyId);

  if (error) {
    redirect(
      `/dashboard/listings/${propertyId}?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath("/dashboard/listings");
  revalidatePath(`/dashboard/listings/${propertyId}`);
  revalidatePath("/browse");
  revalidatePath(`/properties/${propertyId}`);
  redirect(`/dashboard/listings/${propertyId}?success=published`);
}

export async function unpublishPropertyAction(formData: FormData) {
  const gate = await requireLister();
  if ("error" in gate) {
    redirect(
      `/dashboard/listings?error=${encodeURIComponent(gate.error ?? "Not allowed")}`,
    );
  }

  const { user, profile } = gate;
  const propertyId = String(formData.get("propertyId") ?? "");
  if (!propertyId) {
    redirect("/dashboard/listings?error=Missing%20listing%20id");
  }

  if (!hasSupabaseEnv()) {
    redirect(`/dashboard/listings/${propertyId}`);
  }

  const supabase = await createClient();
  const isAdmin = profile.role === "admin";

  let query = supabase
    .from("properties")
    .update({ is_published: false })
    .eq("id", propertyId);

  if (!isAdmin) {
    query = query.eq("owner_id", user.id);
  }

  const { error } = await query;
  if (error) {
    redirect(
      `/dashboard/listings/${propertyId}?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath("/dashboard/listings");
  revalidatePath(`/dashboard/listings/${propertyId}`);
  revalidatePath("/browse");
  revalidatePath(`/properties/${propertyId}`);
  redirect(`/dashboard/listings/${propertyId}?success=unpublished`);
}

export async function deletePropertyAction(formData: FormData) {
  const gate = await requireLister();
  if ("error" in gate) {
    redirect(
      `/dashboard/listings?error=${encodeURIComponent(gate.error ?? "Not allowed")}`,
    );
  }

  const { user, profile } = gate;
  const propertyId = String(formData.get("propertyId") ?? "");
  if (!propertyId) {
    redirect("/dashboard/listings?error=Missing%20listing%20id");
  }

  const supabase = await createClient();
  const isAdmin = profile.role === "admin";

  let query = supabase
    .from("properties")
    .select("id, owner_id, images")
    .eq("id", propertyId);

  if (!isAdmin) {
    query = query.eq("owner_id", user.id);
  }

  const { data: existing, error: loadError } = await query.maybeSingle();
  if (loadError || !existing) {
    redirect(
      `/dashboard/listings?error=${encodeURIComponent(loadError?.message ?? "Listing not found")}`,
    );
  }

  if (existing.images?.length) {
    await removePropertyImages({
      supabase,
      urlsOrPaths: existing.images,
    });
  }

  const { error } = await supabase.from("properties").delete().eq("id", propertyId);
  if (error) {
    redirect(`/dashboard/listings?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard/listings");
  revalidatePath("/dashboard");
  redirect("/dashboard/listings");
}
