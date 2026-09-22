"use client";

import Link from "next/link";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

import type { UserRole } from "@/types/database";

type DashboardActionsProps = {
  isLister: boolean;
  role: UserRole;
};

export function DashboardActions({ isLister, role }: DashboardActionsProps) {
  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
      {isLister && (
        <>
          <Button component={Link} href="/dashboard/listings" variant="contained">
            Manage listings
          </Button>
          <Button
            component={Link}
            href="/dashboard/listings/new"
            variant="outlined"
          >
            Post building / apartments
          </Button>
          <Button component={Link} href="/dashboard/kyc" variant="outlined">
            KYC / NIN
          </Button>
        </>
      )}
      {role === "tenant" && (
        <Button component={Link} href="/browse" variant="contained">
          Browse verified homes
        </Button>
      )}
      {role === "admin" && (
        <Button
          component={Link}
          href="/admin"
          variant="contained"
          color="secondary"
        >
          Admin portal
        </Button>
      )}
    </Stack>
  );
}
