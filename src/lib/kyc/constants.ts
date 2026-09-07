import type { DocumentType } from "@/types/database";

export const KYC_DOC_OPTIONS: {
  value: DocumentType;
  label: string;
  hint: string;
  requiredFor: Array<"landlord" | "agent">;
}[] = [
  {
    value: "nin",
    label: "NIN slip / National ID",
    hint: "Clear photo or PDF of your NIN",
    requiredFor: ["landlord", "agent"],
  },
  {
    value: "certificate_of_occupancy",
    label: "Certificate of Occupancy (C of O)",
    hint: "For property owners — C of O or title proof",
    requiredFor: ["landlord"],
  },
  {
    value: "agency_licence",
    label: "Agency licence",
    hint: "For agents — valid agency / realtor licence",
    requiredFor: ["agent"],
  },
  {
    value: "utility_bill",
    label: "Utility bill",
    hint: "Recent bill matching your name or company",
    requiredFor: ["landlord", "agent"],
  },
  {
    value: "deed_of_assignment",
    label: "Deed of Assignment",
    hint: "Optional ownership document",
    requiredFor: [],
  },
  {
    value: "other",
    label: "Other supporting document",
    hint: "Any extra proof that helps verification",
    requiredFor: [],
  },
];

export const ACCEPTED_KYC_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
] as const;

export const MAX_KYC_BYTES = 20 * 1024 * 1024; // 20MB — matches bucket
