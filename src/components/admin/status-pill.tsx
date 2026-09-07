import { cn } from "@/lib/utils";
import type { KycStatus, VerificationStatus } from "@/types/database";
import { kycStatusLabel, reviewStatusLabel } from "@/lib/admin/labels";

type StatusPillProps = {
  status: VerificationStatus | KycStatus;
  kind?: "verification" | "kyc";
};

export function StatusPill({ status, kind = "verification" }: StatusPillProps) {
  const label =
    kind === "kyc"
      ? kycStatusLabel(status as KycStatus)
      : reviewStatusLabel(status as VerificationStatus);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        status === "verified" && "bg-sage text-sage-foreground",
        status === "pending" && "bg-sand text-foreground/80",
        status === "rejected" && "bg-destructive/10 text-destructive",
        status === "unsubmitted" && "bg-muted text-muted-foreground",
      )}
    >
      {label}
    </span>
  );
}
