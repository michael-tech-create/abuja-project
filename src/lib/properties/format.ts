import { ABUJA_DISTRICTS, PROPERTY_TYPES } from "@/types/database";
import type {
  AbujaDistrict,
  PropertyType,
  VerificationStatus,
} from "@/types/database";
import { PRICE_UNIT_LABEL } from "@/lib/constants";

export function formatNaira(amount: number | string) {
  const value = typeof amount === "string" ? Number(amount) : amount;
  if (Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatRentLabel(amount: number | string) {
  return `${formatNaira(amount)} ${PRICE_UNIT_LABEL}`;
}

export function districtLabel(district: AbujaDistrict) {
  return ABUJA_DISTRICTS.find((d) => d.value === district)?.label ?? district;
}

export function propertyTypeLabel(type: PropertyType) {
  return PROPERTY_TYPES.find((t) => t.value === type)?.label ?? type;
}

export function verificationLabel(status: VerificationStatus) {
  switch (status) {
    case "verified":
      return "Verified";
    case "rejected":
      return "Rejected";
    default:
      return "Pending review";
  }
}
