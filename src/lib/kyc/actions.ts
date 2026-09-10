"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentProfile, getSessionUser } from "@/lib/auth/session";
import { normalizeNin, verifyNinWithDojah } from "@/lib/kyc/nin-verify";
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
 * Saves KYC docs + verifies NIN via Dojah (or mock if keys missing).
 * On success: kyc_status = verified automatically.
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

  const nin = normalizeNin(String(formData.get("nin") ?? ""));
  if (!nin) {
    return { error: "Enter your 11-digit NIN for automated verification." };
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
    return { error: "Upload at least one supporting document (e.g. NIN slip)." };
  }

  const ninCheck = await verifyNinWithDojah(nin);
  if (!ninCheck.ok) {
    return { error: ninCheck.message };
  }

  const supabase = await createClient();

  // Prevent another account from using the same NIN
  const { data: existingNin } = await supabase
    .from("profiles")
    .select("id")
    .eq("nin_number", nin)
    .neq("id", user.id)
    .maybeSingle();

  if (existingNin) {
    return { error: "This NIN is already linked to another account." };
  }

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
        status: "verified" as const,
        review_notes: `Auto-verified via ${ninCheck.provider.toUpperCase()} NIN lookup`,
        reviewed_at: new Date().toISOString(),
      })),
    );

  if (insertError) {
    return { error: insertError.message };
  }

  const fullNameFromNin = [ninCheck.firstName, ninCheck.middleName, ninCheck.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      kyc_status: "verified",
      nin_number: nin,
      nin_verified_at: new Date().toISOString(),
      ...(fullNameFromNin ? { full_name: fullNameFromNin } : {}),
    })
    .eq("id", user.id);

  if (profileError) {
    // Column may be missing before STEP6 migration
    if (/nin_number|schema cache/i.test(profileError.message)) {
      return {
        error:
          "Database needs an update. Run scripts/STEP6-reviews-nin.sql in the Supabase SQL Editor, then try again.",
      };
    }
    return { error: profileError.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/kyc");
  revalidatePath("/dashboard/listings");
  revalidatePath("/admin/kyc");
  redirect(
    `/dashboard/kyc?success=${ninCheck.provider === "dojah" ? "verified" : "verified_mock"}`,
  );
}
