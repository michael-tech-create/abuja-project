"use client";

import { useActionState, useState } from "react";
import { FileTextIcon, Trash2Icon, UploadIcon } from "lucide-react";

import { UploadProgressBar } from "@/components/media/upload-progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { STORAGE_BUCKETS } from "@/lib/constants";
import {
  submitKycDocumentsAction,
  type KycActionState,
} from "@/lib/kyc/actions";
import {
  ACCEPTED_KYC_TYPES,
  KYC_DOC_OPTIONS,
  MAX_KYC_BYTES,
} from "@/lib/kyc/constants";
import {
  buildStorageObjectPath,
  uploadFileWithProgress,
} from "@/lib/media/upload-with-progress";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { DocumentType, UserRole } from "@/types/database";

type PendingDoc = {
  id: string;
  docType: DocumentType;
  file: File;
  storagePath?: string;
  previewUrl?: string;
};

const initialState: KycActionState = {};

type KycUploadFormProps = {
  userId: string;
  role: UserRole;
};

export function KycUploadForm({ userId, role }: KycUploadFormProps) {
  const [docs, setDocs] = useState<PendingDoc[]>([]);
  const [activeType, setActiveType] = useState<DocumentType>("nin");
  const [uploadPercent, setUploadPercent] = useState<number | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [state, formAction, pending] = useActionState(
    submitKycDocumentsAction,
    initialState,
  );

  const suggested = KYC_DOC_OPTIONS.filter(
    (opt) =>
      role === "admin" ||
      opt.requiredFor.includes(role as "landlord" | "agent") ||
      opt.requiredFor.length === 0,
  );

  async function addFile(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;
    setLocalError(null);

    if (
      !ACCEPTED_KYC_TYPES.includes(
        file.type as (typeof ACCEPTED_KYC_TYPES)[number],
      )
    ) {
      setLocalError("Use JPEG, PNG, WebP, or PDF.");
      return;
    }
    if (file.size > MAX_KYC_BYTES) {
      setLocalError("Each file must be under 20MB.");
      return;
    }

    const id = `${Date.now()}-${file.name}`;
    const previewUrl = file.type.startsWith("image/")
      ? URL.createObjectURL(file)
      : undefined;

    const pendingDoc: PendingDoc = {
      id,
      docType: activeType,
      file,
      previewUrl,
    };
    setDocs((prev) => [...prev, pendingDoc]);
    setUploadPercent(0);

    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("Sign in again to upload.");
      }

      const path = buildStorageObjectPath(
        userId,
        "kyc",
        `${Date.now()}-${file.name}`,
      );

      await uploadFileWithProgress({
        bucket: STORAGE_BUCKETS.verificationDocs,
        path,
        file,
        accessToken: session.access_token,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(
          /\/rest\/v1\/?$/i,
          "",
        ).replace(/\/$/, ""),
        onProgress: (p) => setUploadPercent(p.percent),
      });

      setDocs((prev) =>
        prev.map((d) => (d.id === id ? { ...d, storagePath: path } : d)),
      );
    } catch (err) {
      setDocs((prev) => prev.filter((d) => d.id !== id));
      setLocalError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploadPercent(null);
    }
  }

  function removeDoc(id: string) {
    setDocs((prev) => {
      const found = prev.find((d) => d.id === id);
      if (found?.previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(found.previewUrl);
      }
      return prev.filter((d) => d.id !== id);
    });
  }

  const readyDocs = docs.filter((d) => d.storagePath);
  const uploading = uploadPercent != null;

  const payload = JSON.stringify(
    readyDocs.map((d) => ({
      docType: d.docType,
      storagePath: d.storagePath,
      fileName: d.file.name,
      mimeType: d.file.type,
    })),
  );

  return (
    <div className="space-y-6">
      {(state.error || localError) && (
        <Alert variant="destructive">
          <AlertTitle>Could not submit KYC</AlertTitle>
          <AlertDescription>{state.error ?? localError}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="docType">Document type</Label>
        <select
          id="docType"
          value={activeType}
          onChange={(e) => setActiveType(e.target.value as DocumentType)}
          className="flex h-9 w-full rounded-xl border border-input bg-transparent px-3 text-sm"
        >
          {suggested.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground">
          {suggested.find((o) => o.value === activeType)?.hint}
        </p>
      </div>

      <div>
        <label
          htmlFor="kyc-file"
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-border bg-sand/40 px-6 py-10 text-center hover:bg-sand/70",
            uploading && "pointer-events-none opacity-60",
          )}
        >
          <UploadIcon className="size-6 text-muted-foreground" />
          <span className="text-sm font-medium">
            Upload {suggested.find((o) => o.value === activeType)?.label}
          </span>
          <span className="text-xs text-muted-foreground">
            JPEG, PNG, WebP, or PDF · max 20MB
          </span>
        </label>
        <input
          id="kyc-file"
          type="file"
          accept={ACCEPTED_KYC_TYPES.join(",")}
          className="sr-only"
          disabled={uploading || pending}
          onChange={(e) => {
            void addFile(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {uploadPercent != null && (
        <UploadProgressBar
          percent={uploadPercent}
          label="Uploading document…"
        />
      )}

      {docs.length > 0 && (
        <ul className="space-y-3">
          {docs.map((doc) => {
            const label =
              KYC_DOC_OPTIONS.find((o) => o.value === doc.docType)?.label ??
              doc.docType;
            return (
              <li
                key={doc.id}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3"
              >
                {doc.previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={doc.previewUrl}
                    alt=""
                    className="size-14 rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex size-14 items-center justify-center rounded-xl bg-sand">
                    <FileTextIcon className="size-5 text-muted-foreground" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{label}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {doc.file.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {doc.storagePath ? "Uploaded" : "Uploading…"}
                  </p>
                </div>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => removeDoc(doc.id)}
                  disabled={uploading || pending}
                  aria-label="Remove"
                >
                  <Trash2Icon />
                </Button>
              </li>
            );
          })}
        </ul>
      )}

      <form action={formAction}>
        <input type="hidden" name="documents" value={payload} />
        <Button
          type="submit"
          className="rounded-full"
          disabled={
            pending || uploading || readyDocs.length === 0 || readyDocs.length !== docs.length
          }
        >
          {pending ? "Submitting…" : "Submit KYC for review"}
        </Button>
      </form>

      <p className="text-xs text-muted-foreground">
        Tip: upload NIN plus C of O (landlords) or agency licence (agents). An
        admin will review them at <code>/admin/kyc</code>.
      </p>
    </div>
  );
}
