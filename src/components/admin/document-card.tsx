import { DOCUMENT_TYPE_LABELS } from "@/lib/admin/labels";
import { StatusPill } from "@/components/admin/status-pill";
import type { VerificationDocument } from "@/types/database";

type DocumentCardProps = {
  document: VerificationDocument & { view_url?: string | null };
};

export function DocumentCard({ document }: DocumentCardProps) {
  const viewUrl =
    document.view_url ||
    (document.storage_path.startsWith("http") ? document.storage_path : null);
  const isImage = Boolean(
    viewUrl &&
      (document.mime_type?.startsWith("image/") ||
        /\.(jpe?g|png|webp|gif)(\?|$)/i.test(viewUrl)),
  );

  return (
    <article className="soft-card overflow-hidden">
      <div className="aspect-[4/3] bg-sand">
        {isImage && viewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={viewUrl} alt="" className="size-full object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
            Document file
          </div>
        )}
      </div>
      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-medium leading-snug">
            {DOCUMENT_TYPE_LABELS[document.doc_type]}
          </h3>
          <StatusPill status={document.status} />
        </div>
        <p className="truncate text-xs text-muted-foreground">
          {document.file_name ?? document.storage_path}
        </p>
        {viewUrl ? (
          <a
            href={viewUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex text-xs font-medium underline underline-offset-4"
          >
            Open document
          </a>
        ) : (
          <p className="text-xs text-muted-foreground">Preview unavailable</p>
        )}
      </div>
    </article>
  );
}
