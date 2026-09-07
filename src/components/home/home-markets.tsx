"use client";

import Link from "next/link";

import { FadeIn, Stagger, StaggerItem } from "@/components/home/motion";
import { ABUJA_MARKETS } from "@/lib/marketing/home-data";

export function HomeMarkets() {
  return (
    <section className="space-y-8">
      <FadeIn className="max-w-2xl space-y-3">
        <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
          Explore Abuja
        </p>
        <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Rent across the capital&apos;s best districts
        </h2>
        <p className="text-muted-foreground">
          From diplomatic Asokoro to family estates in Gwarinpa — search verified
          homes by neighbourhood in minutes.
        </p>
      </FadeIn>

      <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ABUJA_MARKETS.map((market) => (
          <StaggerItem key={market.name}>
            <Link
              href={market.href}
              className="group soft-card block overflow-hidden transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="relative aspect-[16/11] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={market.image}
                  alt={market.name}
                  className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                <div className="absolute right-4 bottom-4 left-4 text-white">
                  <p className="font-heading text-xl font-semibold">
                    {market.name}
                  </p>
                  <p className="text-sm text-white/85">{market.blurb}</p>
                </div>
              </div>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>

      <FadeIn delay={0.1}>
        <Link
          href="/browse"
          className="inline-flex text-sm font-medium underline underline-offset-4"
        >
          View all districts
        </Link>
      </FadeIn>
    </section>
  );
}
