"use client";

import Link from "next/link";
import { ChevronDownIcon } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOutAction } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";

export type NavDropdownItem = {
  href: string;
  label: string;
};

type NavDropdownProps = {
  label: string;
  items: NavDropdownItem[];
  showSignOut?: boolean;
};

const itemClass =
  "flex w-full rounded-xl px-3 py-2 text-sm font-medium text-foreground outline-none hover:bg-secondary hover:text-primary";

export function NavDropdown({
  label,
  items,
  showSignOut = false,
}: NavDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "inline-flex h-9 items-center gap-1 rounded-full border border-primary/30 bg-white px-3 text-sm font-semibold text-primary shadow-sm",
          "hover:bg-secondary data-popup-open:bg-secondary data-popup-open:border-primary",
        )}
      >
        {label}
        <ChevronDownIcon className="size-4 opacity-80" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-48 rounded-2xl border-primary/20 bg-white p-1.5 shadow-lg shadow-primary/15"
      >
        {items.map((item) => (
          <Link key={item.href} href={item.href} className={itemClass}>
            {item.label}
          </Link>
        ))}
        {showSignOut && (
          <>
            <DropdownMenuSeparator className="bg-border" />
            <form action={signOutAction}>
              <button
                type="submit"
                className="flex w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-destructive hover:bg-destructive/10"
              >
                Sign out
              </button>
            </form>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
