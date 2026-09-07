"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function HomeCta() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55 }}
      className="relative overflow-hidden rounded-[2rem] bg-primary px-6 py-12 text-primary-foreground sm:px-10"
    >
      <div className="pointer-events-none absolute -right-10 -bottom-16 size-56 rounded-full bg-sage/30 blur-3xl" />
      <div className="relative max-w-2xl space-y-4">
        <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Ready to rent — or list — with trust?
        </h2>
        <p className="text-primary-foreground/80">
          Join tenants searching verified Abuja homes and landlords who publish
          after KYC. Free to get started.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href="/auth/signup"
            className="inline-flex h-11 items-center rounded-full bg-card px-5 text-sm font-medium text-foreground hover:bg-sand"
          >
            Get started free
          </Link>
          <Link
            href="/browse"
            className="inline-flex h-11 items-center rounded-full border border-primary-foreground/30 px-5 text-sm font-medium hover:bg-primary-foreground/10"
          >
            Browse listings
          </Link>
        </div>
      </div>
    </motion.section>
  );
}
