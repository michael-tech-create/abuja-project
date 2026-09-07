"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminAccess } from "@/lib/admin/access";
import { getDemoAdminState } from "@/lib/admin/demo-data";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";

export type AdminActionState = {
  error?: string;
  success?: string;
};

async function logAdminAction(options: {
  adminId: string;
  action: string;
  targetType: string;
  targetId: string;
  notes?: string | null;
}) {
  if (!hasSupabaseEnv()) {
    getDemoAdminState().actions.unshift({
      id: `demo-action-${Date.now()}`,
      admin_id: options.adminId,
      action: options.action,
      target_type: options.targetType,
      target_id: options.targetId,
      notes: options.notes ?? null,
      created_at: new Date().toISOString(),
    });
    return;
  }

  const supabase = await createClient();
  await supabase.from("admin_actions").insert({
    admin_id: options.adminId,
    action: options.action,
    target_type: options.targetType,
    target_id: options.targetId,
    notes: options.notes ?? null,
  });
}

function revalidateAdmin(paths: string[] = []) {
  revalidatePath("/admin");
  revalidatePath("/admin/listings");
  revalidatePath("/admin/kyc");
  revalidatePath("/browse");
  revalidatePath("/dashboard/listings");
  for (const path of paths) revalidatePath(path);
}

export async function approvePropertyAction(formData: FormData) {
  const { userId, source } = await requireAdminAccess();
  const propertyId = String(formData.get("propertyId") ?? "");
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!propertyId) {
    redirect("/admin/listings?error=missing_property");
  }

  if (source === "demo") {
    const state = getDemoAdminState();
    const property = state.properties.find((p) => p.id === propertyId);
    if (!property) redirect("/admin/listings?error=not_found");
    property.verification_status = "verified";
    property.is_verified = true;
    property.is_published = true;
    property.rejection_reason = null;
    property.verified_at = new Date().toISOString();
    property.verified_by = userId;
    await logAdminAction({
      adminId: userId,
      action: "approve_property",
      targetType: "property",
      targetId: propertyId,
      notes,
    });
    revalidateAdmin([`/admin/listings/${propertyId}`, `/properties/${propertyId}`]);
    redirect(`/admin/listings/${propertyId}?success=approved`);
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("properties")
    .update({
      verification_status: "verified",
      is_published: true,
      rejection_reason: null,
      verified_at: new Date().toISOString(),
      verified_by: userId,
    })
    .eq("id", propertyId);

  if (error) {
    redirect(
      `/admin/listings/${propertyId}?error=${encodeURIComponent(error.message)}`,
    );
  }

  await supabase
    .from("verification_documents")
    .update({
      status: "verified",
      reviewer_id: userId,
      reviewed_at: new Date().toISOString(),
      review_notes: notes,
    })
    .eq("property_id", propertyId)
    .eq("status", "pending");

  await logAdminAction({
    adminId: userId,
    action: "approve_property",
    targetType: "property",
    targetId: propertyId,
    notes,
  });

  revalidateAdmin([`/admin/listings/${propertyId}`, `/properties/${propertyId}`]);
  redirect(`/admin/listings/${propertyId}?success=approved`);
}

export async function rejectPropertyAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const { userId, source } = await requireAdminAccess();
  const propertyId = String(formData.get("propertyId") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();

  if (!propertyId) return { error: "Missing listing id." };
  if (reason.length < 8) {
    return { error: "Add a clear rejection reason (at least 8 characters)." };
  }

  if (source === "demo") {
    const state = getDemoAdminState();
    const property = state.properties.find((p) => p.id === propertyId);
    if (!property) return { error: "Listing not found." };
    property.verification_status = "rejected";
    property.is_verified = false;
    property.is_published = false;
    property.rejection_reason = reason;
    property.verified_at = null;
    property.verified_by = null;
    await logAdminAction({
      adminId: userId,
      action: "reject_property",
      targetType: "property",
      targetId: propertyId,
      notes: reason,
    });
    revalidateAdmin([`/admin/listings/${propertyId}`]);
    redirect(`/admin/listings/${propertyId}?success=rejected`);
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("properties")
    .update({
      verification_status: "rejected",
      is_published: false,
      rejection_reason: reason,
      verified_at: null,
      verified_by: null,
    })
    .eq("id", propertyId);

  if (error) return { error: error.message };

  await supabase
    .from("verification_documents")
    .update({
      status: "rejected",
      reviewer_id: userId,
      reviewed_at: new Date().toISOString(),
      review_notes: reason,
    })
    .eq("property_id", propertyId)
    .eq("status", "pending");

  await logAdminAction({
    adminId: userId,
    action: "reject_property",
    targetType: "property",
    targetId: propertyId,
    notes: reason,
  });

  revalidateAdmin([`/admin/listings/${propertyId}`]);
  redirect(`/admin/listings/${propertyId}?success=rejected`);
}

export async function approveKycAction(formData: FormData) {
  const { userId, source } = await requireAdminAccess();
  const profileId = String(formData.get("profileId") ?? "");
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!profileId) redirect("/admin/kyc?error=missing_profile");

  if (source === "demo") {
    const state = getDemoAdminState();
    const profile = state.profiles.find((p) => p.id === profileId);
    if (!profile) redirect("/admin/kyc?error=not_found");
    profile.kyc_status = "verified";
    for (const doc of state.documents) {
      if (doc.user_id === profileId && doc.status === "pending") {
        doc.status = "verified";
        doc.reviewer_id = userId;
        doc.reviewed_at = new Date().toISOString();
        doc.review_notes = notes;
      }
    }
    await logAdminAction({
      adminId: userId,
      action: "approve_kyc",
      targetType: "profile",
      targetId: profileId,
      notes,
    });
    revalidateAdmin([`/admin/kyc/${profileId}`]);
    redirect(`/admin/kyc/${profileId}?success=approved`);
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ kyc_status: "verified" })
    .eq("id", profileId);

  if (error) {
    redirect(
      `/admin/kyc/${profileId}?error=${encodeURIComponent(error.message)}`,
    );
  }

  await supabase
    .from("verification_documents")
    .update({
      status: "verified",
      reviewer_id: userId,
      reviewed_at: new Date().toISOString(),
      review_notes: notes,
    })
    .eq("user_id", profileId)
    .eq("status", "pending");

  await logAdminAction({
    adminId: userId,
    action: "approve_kyc",
    targetType: "profile",
    targetId: profileId,
    notes,
  });

  revalidateAdmin([`/admin/kyc/${profileId}`]);
  redirect(`/admin/kyc/${profileId}?success=approved`);
}

export async function rejectKycAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const { userId, source } = await requireAdminAccess();
  const profileId = String(formData.get("profileId") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();

  if (!profileId) return { error: "Missing profile id." };
  if (reason.length < 8) {
    return { error: "Add a clear rejection reason (at least 8 characters)." };
  }

  if (source === "demo") {
    const state = getDemoAdminState();
    const profile = state.profiles.find((p) => p.id === profileId);
    if (!profile) return { error: "Profile not found." };
    profile.kyc_status = "rejected";
    for (const doc of state.documents) {
      if (doc.user_id === profileId && doc.status === "pending") {
        doc.status = "rejected";
        doc.reviewer_id = userId;
        doc.reviewed_at = new Date().toISOString();
        doc.review_notes = reason;
      }
    }
    await logAdminAction({
      adminId: userId,
      action: "reject_kyc",
      targetType: "profile",
      targetId: profileId,
      notes: reason,
    });
    revalidateAdmin([`/admin/kyc/${profileId}`]);
    redirect(`/admin/kyc/${profileId}?success=rejected`);
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ kyc_status: "rejected" })
    .eq("id", profileId);

  if (error) return { error: error.message };

  await supabase
    .from("verification_documents")
    .update({
      status: "rejected",
      reviewer_id: userId,
      reviewed_at: new Date().toISOString(),
      review_notes: reason,
    })
    .eq("user_id", profileId)
    .eq("status", "pending");

  await logAdminAction({
    adminId: userId,
    action: "reject_kyc",
    targetType: "profile",
    targetId: profileId,
    notes: reason,
  });

  revalidateAdmin([`/admin/kyc/${profileId}`]);
  redirect(`/admin/kyc/${profileId}?success=rejected`);
}
