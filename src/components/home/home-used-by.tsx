"use client";

import { FadeIn, Stagger, StaggerItem } from "@/components/home/motion";
import { USED_BY } from "@/lib/marketing/home-data";

export function HomeUsedBy() {
  return (
    <section className="space-y-8">
      <FadeIn className="max-w-2xl space-y-3">
        <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
          Used by
        </p>
        <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Already helping Abuja renters & listers move faster
        </h2>
      </FadeIn>

      <Stagger className="grid gap-4 md:grid-cols-3">
        {USED_BY.map((item) => (
          <StaggerItem key={item.name}>
            <figure className="soft-card flex h-full flex-col gap-4 p-6">
              <span className="sage-pill w-fit">{item.role}</span>
              <blockquote className="flex-1 text-sm leading-relaxed text-foreground/90">
                “{item.quote}”
              </blockquote>
              <figcaption className="text-sm">
                <span className="font-medium">{item.name}</span>
                <span className="text-muted-foreground"> · {item.place}</span>
              </figcaption>
            </figure>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
