"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentProfile, getSessionUser } from "@/lib/auth/session";
import { canManageListings } from "@/lib/properties/access";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";
import type { DocumentType } from "@/types/database";

export type KycActionState = {
  error?: string;
  success?: string;
};

const ALLOWED_DOC_TYPES: DocumentType[] = [
  "nin",
  "certificate_of_occupancy",
  "deed_of_assignment",
  "agency_licence",
  "utility_bill",
  "property_photo_proof",
  "other",
];

/**
 * Saves already-uploaded KYC file metadata and marks profile KYC as pending.
 * Files are uploaded from the browser first (with progress), then this action runs.
 */
export async function submitKycDocumentsAction(
  _prev: KycActionState,
  formData: FormData,
): Promise<KycActionState> {
  if (!hasSupabaseEnv()) {
    return { error: "Supabase is not configured." };
  }

  const user = await getSessionUser();
  const profile = await getCurrentProfile();
  if (!user || !profile) {
    return { error: "You must be signed in." };
  }
  if (!canManageListings(profile)) {
    return { error: "Only landlords and agents submit KYC." };
  }
  if (profile.kyc_status === "verified") {
    return { error: "Your KYC is already verified." };
  }

  const raw = String(formData.get("documents") ?? "");
  let docs: Array<{
    docType: DocumentType;
    storagePath: string;
    fileName: string;
    mimeType: string;
  }> = [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) throw new Error("Invalid payload");
    docs = parsed.map((item) => {
      const row = item as Record<string, string>;
      const docType = row.docType as DocumentType;
      if (!ALLOWED_DOC_TYPES.includes(docType)) {
        throw new Error("Invalid document type");
      }
      if (!row.storagePath?.trim()) {
        throw new Error("Missing file path");
      }
      return {
        docType,
        storagePath: row.storagePath.trim(),
        fileName: row.fileName?.trim() || "document",
        mimeType: row.mimeType?.trim() || "application/octet-stream",
      };
    });
  } catch {
    return { error: "Could not read uploaded documents. Try again." };
  }

  if (docs.length === 0) {
    return { error: "Upload at least one document (NIN is required)." };
  }

  const hasNin = docs.some((d) => d.docType === "nin");
  if (!hasNin) {
    return { error: "Please include your NIN document." };
  }

  const supabase = await createClient();

  const { error: insertError } = await supabase
    .from("verification_documents")
    .insert(
      docs.map((d) => ({
        user_id: user.id,
        property_id: null,
        doc_type: d.docType,
        storage_path: d.storagePath,
        file_name: d.fileName,
        mime_type: d.mimeType,
        status: "pending" as const,
      })),
    );

  if (insertError) {
    return { error: insertError.message };
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ kyc_status: "pending" })
    .eq("id", user.id);

  if (profileError) {
    return { error: profileError.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/kyc");
  revalidatePath("/dashboard/listings");
  revalidatePath("/admin/kyc");
  redirect("/dashboard/kyc?success=submitted");
}
