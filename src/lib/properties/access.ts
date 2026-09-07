import type { Profile, UserRole } from "@/types/database";

const LISTER_ROLES: UserRole[] = ["landlord", "agent", "admin"];

export function canManageListings(profile: Profile | null | undefined) {
  if (!profile) return false;
  return LISTER_ROLES.includes(profile.role);
}

export function assertCanManageListings(profile: Profile | null | undefined) {
  if (!canManageListings(profile)) {
    throw new Error("Only landlords, agents, and admins can manage listings.");
  }
}
