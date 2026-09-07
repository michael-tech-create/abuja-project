"use client";

import dynamic from "next/dynamic";

import type { Property } from "@/types/database";

const BrowseMap = dynamic(
  () =>
    import("@/components/browse/browse-map").then((mod) => mod.BrowseMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[480px] items-center justify-center rounded-2xl border border-border bg-muted text-sm text-muted-foreground">
        Loading map…
      </div>
    ),
  },
);

export function BrowseMapLoader({ properties }: { properties: Property[] }) {
  return <BrowseMap properties={properties} />;
}
