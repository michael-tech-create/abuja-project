import { Badge } from "@/components/ui/badge";
import { verificationLabel } from "@/lib/properties/format";
import type { VerificationStatus } from "@/types/database";

export function VerificationBadge({ status }: { status: VerificationStatus }) {
  const variant =
    status === "verified"
      ? "default"
      : status === "rejected"
        ? "destructive"
        : "outline";

  return (
    <Badge variant={variant} className="capitalize">
      {verificationLabel(status)}
    </Badge>
  );
}
