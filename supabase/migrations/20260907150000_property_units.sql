-- Mirror of scripts/STEP7-property-units.sql

alter table public.properties
  add column if not exists building_name text,
  add column if not exists is_multi_unit boolean not null default false;

create table if not exists public.property_units (
  id            uuid primary key default gen_random_uuid(),
  property_id   uuid not null references public.properties (id) on delete cascade,
  label         text not null,
  bedrooms      integer check (bedrooms is null or bedrooms >= 0),
  bathrooms     integer check (bathrooms is null or bathrooms >= 0),
  area_sqm      numeric(10, 2),
  price         numeric(14, 2) not null check (price >= 0),
  currency      text not null default 'NGN',
  amenities     text[] not null default '{}',
  images        text[] not null default '{}',
  is_available  boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists property_units_property_idx
  on public.property_units (property_id);

alter table public.property_units enable row level security;

create policy "Anyone can view units of published properties"
  on public.property_units for select
  using (
    exists (
      select 1 from public.properties p
      where p.id = property_id
        and (
          (p.verification_status = 'verified' and p.is_published = true)
          or p.owner_id = auth.uid()
          or public.is_admin()
        )
    )
  );

create policy "Owners insert units"
  on public.property_units for insert to authenticated
  with check (
    exists (
      select 1 from public.properties p
      where p.id = property_id
        and (p.owner_id = auth.uid() or public.is_admin())
    )
  );

create policy "Owners update units"
  on public.property_units for update to authenticated
  using (
    exists (
      select 1 from public.properties p
      where p.id = property_id
        and (p.owner_id = auth.uid() or public.is_admin())
    )
  );

create policy "Owners delete units"
  on public.property_units for delete to authenticated
  using (
    exists (
      select 1 from public.properties p
      where p.id = property_id
        and (p.owner_id = auth.uid() or public.is_admin())
    )
  );

create trigger property_units_updated_at
  before update on public.property_units
  for each row execute function public.set_updated_at();
