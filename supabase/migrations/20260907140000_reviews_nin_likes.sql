-- Reviews + NIN fields for automated KYC

alter table public.profiles
  add column if not exists nin_number text,
  add column if not exists nin_verified_at timestamptz;

create unique index if not exists profiles_nin_number_uidx
  on public.profiles (nin_number)
  where nin_number is not null;

create table if not exists public.reviews (
  id           uuid primary key default gen_random_uuid(),
  property_id  uuid not null references public.properties (id) on delete cascade,
  user_id      uuid not null references public.profiles (id) on delete cascade,
  rating       integer not null check (rating >= 1 and rating <= 5),
  comment      text not null check (char_length(trim(comment)) >= 10),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (property_id, user_id)
);

create index if not exists reviews_property_idx on public.reviews (property_id);
create index if not exists reviews_user_idx on public.reviews (user_id);

alter table public.reviews enable row level security;

drop policy if exists "Anyone can read reviews" on public.reviews;
create policy "Anyone can read reviews"
  on public.reviews for select
  using (true);

drop policy if exists "Authenticated users insert own reviews" on public.reviews;
create policy "Authenticated users insert own reviews"
  on public.reviews for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "Users update own reviews" on public.reviews;
create policy "Users update own reviews"
  on public.reviews for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Users delete own reviews" on public.reviews;
create policy "Users delete own reviews"
  on public.reviews for delete to authenticated
  using (user_id = auth.uid());

drop trigger if exists reviews_updated_at on public.reviews;
create trigger reviews_updated_at
  before update on public.reviews
  for each row execute function public.set_updated_at();
