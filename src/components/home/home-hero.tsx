"use client";

import Link from "next/link";
import * as React from "react";
import { motion } from "framer-motion";
import { MapPinIcon, SearchIcon, ShieldCheckIcon } from "lucide-react";
import Image from "next/image";

// MUI Imports
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

import { BrandLogo } from "@/components/brand/brand-logo";
import { BRAND_HERO } from "@/lib/brand";
import { HOME_STATS } from "@/lib/marketing/home-data";
import { APP_NAME } from "@/lib/constants";

type HomeHeroProps = {
  profileName?: string | null;
};

export function HomeHero({ profileName }: HomeHeroProps) {
  const [district, setDistrict] = React.useState("");

  const handleChange = (event: SelectChangeEvent) => {
    setDistrict(event.target.value);
  };

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-gradient-to-br from-card via-sand/40 to-sage/30 px-6 py-12 sm:px-10 sm:py-16 lg:px-14">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-16 size-72 rounded-full bg-sage/40 blur-3xl"
        animate={{ opacity: [0.35, 0.7, 0.35], scale: [1, 1.08, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -bottom-28 -left-10 size-80 rounded-full bg-primary/10 blur-3xl"
        animate={{ opacity: [0.2, 0.45, 0.2], x: [0, 20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="max-w-xl space-y-7">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="flex flex-wrap items-center gap-3"
          >
            <BrandLogo href="" imgClassName="h-14 w-auto rounded-xl" priority />
            <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/80 px-3 py-1 text-xs font-medium tracking-wide text-muted-foreground uppercase backdrop-blur">
              <ShieldCheckIcon className="size-3.5 text-sage-foreground" />
              Abuja · Verified rentals · Nigeria
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="font-heading text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
          >
            Renting in Abuja,
            <span className="block text-sage-foreground">done right.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            {APP_NAME} helps tenants find verified homes and helps landlords
            publish after KYC — with realtime chat, tour videos, and
            district-first search from Maitama to Lugbe.
          </motion.p>

          <motion.form
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18 }}
            action="/browse"
            method="get"
            className="flex flex-col gap-2 rounded-2xl border border-border/80 bg-card p-2 shadow-lg sm:flex-row sm:items-center"
          >
            <div className="flex flex-1 items-center gap-2 px-3">
              <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
              <input
                name="q"
                placeholder="Search estates, streets, keywords…"
                className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>

            <div className="flex flex-1 items-center gap-2 border-t border-border/60 px-3 sm:border-t-0 sm:border-l">
              <MapPinIcon className="size-4 shrink-0 text-muted-foreground" />
              <FormControl fullWidth variant="standard">
                <Select
                  name="district"
                  value={district}
                  onChange={handleChange}
                  displayEmpty
                  disableUnderline
                  className="h-10 text-sm"
                  sx={{
                    "& .MuiSelect-select": {
                      paddingY: "8px",
                      color: "inherit",
                    },
                  }}
                >
                  <MenuItem value="">All Abuja districts</MenuItem>
                  <MenuItem value="maitama">Maitama</MenuItem>
                  <MenuItem value="wuse_2">Wuse II</MenuItem>
                  <MenuItem value="gwarinpa">Gwarinpa</MenuItem>
                  <MenuItem value="asokoro">Asokoro</MenuItem>
                  <MenuItem value="lugbe">Lugbe</MenuItem>
                  <MenuItem value="lifecamp">Life Camp</MenuItem>
                </Select>
              </FormControl>
            </div>

            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Search
            </button>
          </motion.form>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24 }}
            className="flex flex-wrap gap-3"
          >
            <Link
              href="/browse"
              className="inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Browse listings
            </Link>
            <Link
              href={profileName ? "/dashboard" : "/auth/signup"}
              className="inline-flex h-11 items-center rounded-full border border-border/80 bg-card/80 px-5 text-sm font-medium backdrop-blur hover:bg-sand"
            >
              {profileName ? `Go to dashboard` : "Get started free"}
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="grid grid-cols-2 gap-3 sm:grid-cols-4"
          >
            {HOME_STATS.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-border/50 bg-card/70 px-3 py-3 backdrop-blur"
              >
                <p className="font-heading text-lg font-semibold">
                  {stat.value}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="relative"
        >
          <div className="soft-card relative overflow-hidden p-2">
            <Image
              src={BRAND_HERO}
              alt={`${APP_NAME} homes in Abuja`}
              width={1200}
              height={630}
              priority
              className="aspect-[4/5] w-full rounded-[1.4rem] object-cover sm:aspect-[4/3]"
            />
            <motion.div
              className="absolute top-6 left-6"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <span className="sage-pill shadow-sm">EcoNest · Verified</span>
            </motion.div>
            <motion.div
              className="absolute right-6 bottom-6 left-6 rounded-3xl border border-border/60 bg-card/95 p-4 shadow-xl backdrop-blur"
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <p className="font-heading text-lg font-semibold">
                EcoNest Homes
              </p>
              <p className="text-sm text-muted-foreground">
                Verified Abuja rentals · Trust first, chat in real time
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}