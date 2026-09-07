import type { DocumentType, KycStatus, VerificationStatus } from "@/types/database";

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  nin: "National Identity Number (NIN)",
  certificate_of_occupancy: "Certificate of Occupancy (C of O)",
  deed_of_assignment: "Deed of Assignment",
  agency_licence: "Agency licence",
  utility_bill: "Utility bill",
  property_photo_proof: "Property photo proof",
  other: "Other document",
};

export function kycStatusLabel(status: KycStatus) {
  switch (status) {
    case "verified":
      return "Verified";
    case "rejected":
      return "Rejected";
    case "pending":
      return "Pending review";
    default:
      return "Not submitted";
  }
}

export function reviewStatusLabel(status: VerificationStatus) {
  switch (status) {
    case "verified":
      return "Approved";
    case "rejected":
      return "Rejected";
    default:
      return "Pending";
  }
}
