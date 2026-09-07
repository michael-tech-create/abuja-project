"use client";

import { FadeIn, Stagger, StaggerItem } from "@/components/home/motion";
import { FEATURES } from "@/lib/marketing/home-data";

export function HomeFeatures() {
  return (
    <section className="space-y-8">
      <FadeIn className="max-w-2xl space-y-3">
        <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
          Why AbujaRentals
        </p>
        <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Built for tenants, landlords, and agents who expect calm.
        </h2>
      </FadeIn>

      <Stagger className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => (
          <StaggerItem key={feature.title}>
            <article className="soft-card h-full space-y-3 p-6 transition-shadow hover:shadow-lg">
              <div className="size-2 rounded-full bg-sage-foreground" />
              <h3 className="font-heading text-xl font-semibold">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.body}
              </p>
            </article>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
