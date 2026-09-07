"use client";

import { FadeIn } from "@/components/home/motion";
import { SponsorMarquee } from "@/components/home/sponsor-marquee";

export function HomeSponsors() {
  return (
    <section className="space-y-6">
      <FadeIn className="space-y-2 text-center">
        <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
          Nigeria sponsors & ecosystem
        </p>
        <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
          Trusted alongside Nigeria&apos;s payment & property stack
        </h2>
        <p className="mx-auto max-w-2xl text-sm text-muted-foreground">
          Built for the Nigerian rental market — from bank transfers and fintech
          rails tenants already use, to agencies operating across Abuja.
        </p>
      </FadeIn>
      <FadeIn delay={0.08}>
        <SponsorMarquee />
      </FadeIn>
    </section>
  );
}
