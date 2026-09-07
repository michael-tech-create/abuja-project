"use client";

import { NIGERIA_SPONSORS } from "@/lib/marketing/home-data";

export function SponsorMarquee() {
  const row = [...NIGERIA_SPONSORS, ...NIGERIA_SPONSORS];

  return (
    <div className="relative overflow-hidden py-2">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent" />
      <div className="sponsor-marquee flex w-max gap-4">
        {row.map((sponsor, index) => (
          <div
            key={`${sponsor.name}-${index}`}
            className="flex h-16 min-w-[160px] items-center justify-center rounded-2xl border border-border/70 bg-card px-5 shadow-sm"
          >
            <div className="text-center">
              <p className="font-heading text-sm font-semibold tracking-tight">
                {sponsor.name}
              </p>
              <p className="text-[10px] tracking-wide text-muted-foreground uppercase">
                {sponsor.tag}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
