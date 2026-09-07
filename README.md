# AbujaRentals

Real-time web app for **verified** rental properties in Abuja, Nigeria (estates, apartments, commercial). Trust via strict KYC / document verification; speed via Supabase Realtime chat between tenants and verified landlords/agents.

## Stack

- **Frontend:** Next.js (App Router), React, Tailwind CSS, Shadcn UI
- **Backend:** Supabase (PostgreSQL, Auth, Realtime, Storage)
- **Maps:** Mapbox or Google Maps (wire up when building discovery)

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.local.example .env.local
```

Fill in values from your [Supabase project](https://supabase.com/dashboard) → Settings → API.

### 3. Apply the database migration

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

Or paste `supabase/migrations/20260907092705_abuja_rentals_schema.sql` into the Supabase SQL Editor and run it.

### 4. Enable Auth providers

In Supabase Dashboard → Authentication → Providers:

- Enable **Email**
- Enable **Google** OAuth (set Client ID / Secret)
- Add redirect URL: `http://localhost:3000/auth/callback`

### 5. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```text
src/
  app/                 # App Router pages (UI coming next)
  components/ui/       # Shadcn primitives
  lib/supabase/        # Browser, server, middleware clients
  types/database.ts    # Typed schema helpers
supabase/
  migrations/          # SQL source of truth (RLS, triggers, storage)
```

## Roles

| Role | Access |
|------|--------|
| Tenant | Browse verified listings, favorites, start chat |
| Landlord / Agent | List properties, upload KYC docs, reply in chat |
| Admin | `/admin` verification portal (promote a user via SQL) |

Promote an admin after signup:

```sql
update public.profiles
set role = 'admin'
where email = 'you@example.com';
```

## Defaults locked in for v1

- **Storage:** Supabase Storage (`property-images`, `verification-docs`)
- **Data access:** SQL migrations + `@supabase/supabase-js` (no Prisma)
- **Roles:** `tenant` | `landlord` | `agent` | `admin` (admin cannot self-signup)
- **Price:** annual rent in **NGN**
- **Public search:** only `verification_status = 'verified'` and `is_published = true`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Local Next.js server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npx supabase db push` | Push migrations to linked project |

## Auth & onboarding (implemented)

| Route | Purpose |
|-------|---------|
| `/auth/signup` | Email/password + Google; role = tenant / landlord / agent |
| `/auth/login` | Email/password + Google |
| `/auth/callback` | OAuth / magic-link code exchange |
| `/auth/check-email` | Shown when email confirmation is required |
| `/onboarding` | Phone (+ company for listers); sets `onboarding_completed` |
| `/dashboard` | Post-onboarding home (role-aware placeholder) |

Protected routes redirect to login. Completed users are bounced off auth pages to the dashboard.

After linking Supabase, push migrations (includes `onboarding_completed` + `claim_signup_role` for Google role pickup):

```bash
npm run db:push
```

Enable **Email** and **Google** providers. Add redirect URL:

`http://localhost:3000/auth/callback`

## Property listings (implemented)

| Route | Purpose |
|-------|---------|
| `/dashboard/listings` | Owner listing grid + verification badges |
| `/dashboard/listings/new` | Create listing + multi-image upload |
| `/dashboard/listings/[id]` | Owner detail view + delete |
| `/dashboard/listings/[id]/edit` | Update details/photos |

Landlords, agents, and admins can manage listings. New listings are **pending** and **unpublished** until an admin verifies them. Images go to the `property-images` Supabase Storage bucket under `{userId}/{propertyId}/…`.

## Search & browse (implemented)

| Route | Purpose |
|-------|---------|
| `/browse` | Public discovery — filters + grid/map toggle |
| `/properties/[id]` | Public detail for verified + published listings |

Filters: keyword, Abuja district, property type, min/max annual rent, min bedrooms, sort. Map view uses OpenStreetMap + Leaflet (no API key). Listings without coordinates fall back to district centroids.

Without Supabase credentials, browse shows **demo verified listings** so the UI can be exercised locally.

## Real-time chat (implemented)

| Route | Purpose |
|-------|---------|
| `/messages` | Inbox of property conversations |
| `/messages/[id]` | Thread with Realtime inserts, read receipts, typing presence |
| Property CTA | **Message landlord** starts/opens a conversation |

Without Supabase, demo mode unlocks a sample inbox + simulated reply so the UI can be exercised.

## Design

Warm cream / sand surfaces, soft sage “Verified · For Rent” pills, Fraunces headings + DM Sans body — inspired by luxury listing layouts.

## Video uploads (realtime)

| Surface | Behavior |
|---------|----------|
| Chat (`/messages/[id]`) | Attach MP4/WebM/MOV or images · live upload progress · message appears via Supabase Realtime |
| Listings form | Up to 3 tour videos (200MB) with progress bar · stored in `property-videos` |
| Public detail | Plays tour videos on `/properties/[id]` |

Push migration `20260907120000_video_media.sql` (message media columns + storage buckets) with `npm run db:push`.

## Admin verification portal (implemented)

| Route | Purpose |
|-------|---------|
| `/admin` | Queue overview + recent actions |
| `/admin/listings` | Pending listing cards |
| `/admin/listings/[id]` | Approve & publish / reject with reason + docs |
| `/admin/kyc` | Pending landlord/agent KYC |
| `/admin/kyc/[userId]` | Approve/reject KYC + linked documents |

Promote an admin after signup:

```sql
update public.profiles
set role = 'admin'
where email = 'you@example.com';
```

Without Supabase, `/admin` runs in **demo mode** with sample pending listings and KYC so you can exercise approve/reject locally.

## Roadmap (next steps)

1. ~~Auth + role onboarding UI~~  
2. ~~Property listing CRUD + image upload~~  
3. ~~Search (grid + map) with district/price filters~~  
4. ~~Real-time chat (read receipts, typing presence)~~  
5. ~~Admin verification portal at `/admin`~~
