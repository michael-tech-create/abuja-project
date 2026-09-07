-- AbujaRentals: core schema, RLS, triggers, storage, realtime
-- Source of truth for Supabase PostgreSQL

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.user_role as enum ('tenant', 'landlord', 'agent', 'admin');

create type public.kyc_status as enum ('unsubmitted', 'pending', 'verified', 'rejected');

create type public.verification_status as enum ('pending', 'verified', 'rejected');

create type public.property_type as enum (
  'apartment',
  'estate_house',
  'duplex',
  'bungalow',
  'studio',
  'commercial',
  'land',
  'other'
);

create type public.abuja_district as enum (
  'maitama',
  'asokoro',
  'wuse',
  'wuse_2',
  'garki',
  'gwarinpa',
  'jabi',
  'utako',
  'kubwa',
  'lugbe',
  'katampe',
  'lifecamp',
  'lokogoma',
  'apo',
  'durumi',
  'gudu',
  'mpape',
  'kado',
  'jahi',
  'other'
);

create type public.document_type as enum (
  'nin',
  'certificate_of_occupancy',
  'deed_of_assignment',
  'agency_licence',
  'utility_bill',
  'property_photo_proof',
  'other'
);

-- ---------------------------------------------------------------------------
-- Profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  role          public.user_role not null default 'tenant',
  full_name     text not null,
  email         text not null,
  phone         text,
  avatar_url    text,
  company_name  text,
  bio           text,
  kyc_status    public.kyc_status not null default 'unsubmitted',
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index profiles_role_idx on public.profiles (role);
create index profiles_kyc_status_idx on public.profiles (kyc_status);

-- ---------------------------------------------------------------------------
-- Properties
-- Price is annual rent in NGN (Abuja market convention)
-- ---------------------------------------------------------------------------
create table public.properties (
  id                    uuid primary key default gen_random_uuid(),
  owner_id              uuid not null references public.profiles (id) on delete cascade,
  title                 text not null,
  description           text not null,
  property_type         public.property_type not null,
  district              public.abuja_district not null,
  address_line          text,
  latitude              double precision,
  longitude             double precision,
  price                 numeric(14, 2) not null check (price >= 0),
  currency              text not null default 'NGN',
  bedrooms              integer check (bedrooms is null or bedrooms >= 0),
  bathrooms             integer check (bathrooms is null or bathrooms >= 0),
  area_sqm              numeric(10, 2),
  amenities             text[] not null default '{}',
  images                text[] not null default '{}',
  verification_status   public.verification_status not null default 'pending',
  is_verified           boolean generated always as (verification_status = 'verified') stored,
  is_published          boolean not null default false,
  rejection_reason      text,
  verified_at           timestamptz,
  verified_by           uuid references public.profiles (id),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  constraint properties_public_ready check (
    not is_published or verification_status = 'verified'
  )
);

create index properties_owner_idx on public.properties (owner_id);
create index properties_district_idx on public.properties (district);
create index properties_price_idx on public.properties (price);
create index properties_status_idx on public.properties (verification_status);
create index properties_public_search_idx
  on public.properties (district, price, property_type)
  where verification_status = 'verified' and is_published = true;

-- ---------------------------------------------------------------------------
-- Verification documents (NIN, C of O, etc.)
-- ---------------------------------------------------------------------------
create table public.verification_documents (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles (id) on delete cascade,
  property_id   uuid references public.properties (id) on delete cascade,
  doc_type      public.document_type not null,
  storage_path  text not null,
  file_name     text,
  mime_type     text,
  status        public.verification_status not null default 'pending',
  reviewer_id   uuid references public.profiles (id),
  review_notes  text,
  submitted_at  timestamptz not null default now(),
  reviewed_at   timestamptz,
  created_at    timestamptz not null default now()
);

create index verification_documents_user_idx on public.verification_documents (user_id);
create index verification_documents_property_idx on public.verification_documents (property_id);
create index verification_documents_status_idx on public.verification_documents (status);

-- ---------------------------------------------------------------------------
-- Favorites
-- ---------------------------------------------------------------------------
create table public.favorites (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles (id) on delete cascade,
  property_id  uuid not null references public.properties (id) on delete cascade,
  created_at   timestamptz not null default now(),
  unique (user_id, property_id)
);

create index favorites_user_idx on public.favorites (user_id);

-- ---------------------------------------------------------------------------
-- Conversations & messages
-- ---------------------------------------------------------------------------
create table public.conversations (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references public.profiles (id) on delete cascade,
  landlord_id     uuid not null references public.profiles (id) on delete cascade,
  property_id     uuid not null references public.properties (id) on delete cascade,
  last_message_at timestamptz,
  created_at      timestamptz not null default now(),
  unique (tenant_id, landlord_id, property_id),
  check (tenant_id <> landlord_id)
);

create index conversations_tenant_idx on public.conversations (tenant_id);
create index conversations_landlord_idx on public.conversations (landlord_id);
create index conversations_property_idx on public.conversations (property_id);

create table public.messages (
  id               uuid primary key default gen_random_uuid(),
  conversation_id  uuid not null references public.conversations (id) on delete cascade,
  sender_id        uuid not null references public.profiles (id) on delete cascade,
  content          text not null check (char_length(trim(content)) > 0),
  is_read          boolean not null default false,
  read_at          timestamptz,
  created_at       timestamptz not null default now()
);

create index messages_conversation_created_idx
  on public.messages (conversation_id, created_at);
create index messages_unread_idx
  on public.messages (conversation_id, is_read)
  where is_read = false;

create table public.message_notifications (
  id           uuid primary key default gen_random_uuid(),
  message_id   uuid not null references public.messages (id) on delete cascade,
  recipient_id uuid not null references public.profiles (id) on delete cascade,
  channel      text not null default 'in_app',
  delivered_at timestamptz,
  created_at   timestamptz not null default now()
);

create index message_notifications_recipient_idx
  on public.message_notifications (recipient_id);

-- ---------------------------------------------------------------------------
-- Admin audit log
-- ---------------------------------------------------------------------------
create table public.admin_actions (
  id          uuid primary key default gen_random_uuid(),
  admin_id    uuid not null references public.profiles (id),
  action      text not null,
  target_type text not null,
  target_id   uuid not null,
  notes       text,
  created_at  timestamptz not null default now()
);

create index admin_actions_admin_idx on public.admin_actions (admin_id);
create index admin_actions_target_idx on public.admin_actions (target_type, target_id);

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger properties_updated_at
  before update on public.properties
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  selected_role public.user_role;
begin
  begin
    selected_role := coalesce(
      (new.raw_user_meta_data->>'role')::public.user_role,
      'tenant'
    );
  exception
    when others then
      selected_role := 'tenant';
  end;

  -- Never allow self-signup as admin
  if selected_role = 'admin' then
    selected_role := 'tenant';
  end if;

  insert into public.profiles (id, role, full_name, email)
  values (
    new.id,
    selected_role,
    coalesce(
      nullif(new.raw_user_meta_data->>'full_name', ''),
      split_part(new.email, '@', 1)
    ),
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.touch_conversation_on_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.conversations
  set last_message_at = new.created_at
  where id = new.conversation_id;
  return new;
end;
$$;

create trigger messages_touch_conversation
  after insert on public.messages
  for each row execute function public.touch_conversation_on_message();

-- ---------------------------------------------------------------------------
-- RLS helpers
-- ---------------------------------------------------------------------------
create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.properties enable row level security;
alter table public.verification_documents enable row level security;
alter table public.favorites enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.message_notifications enable row level security;
alter table public.admin_actions enable row level security;

-- Profiles
create policy "Profiles are viewable by authenticated users"
  on public.profiles for select to authenticated
  using (true);

create policy "Users update own profile"
  on public.profiles for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (
    (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()))
    or public.is_admin()
  );

-- Properties
create policy "Anyone can view verified published properties"
  on public.properties for select
  using (
    (verification_status = 'verified' and is_published = true)
    or owner_id = auth.uid()
    or public.is_admin()
  );

create policy "Listers insert own properties"
  on public.properties for insert to authenticated
  with check (
    owner_id = auth.uid()
    and public.current_user_role() in ('landlord', 'agent', 'admin')
  );

create policy "Owners or admins update properties"
  on public.properties for update to authenticated
  using (owner_id = auth.uid() or public.is_admin())
  with check (owner_id = auth.uid() or public.is_admin());

create policy "Owners or admins delete properties"
  on public.properties for delete to authenticated
  using (owner_id = auth.uid() or public.is_admin());

-- Verification documents
create policy "Owners or admins read documents"
  on public.verification_documents for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

create policy "Users insert own documents"
  on public.verification_documents for insert to authenticated
  with check (user_id = auth.uid() or public.is_admin());

create policy "Owners or admins update documents"
  on public.verification_documents for update to authenticated
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

create policy "Owners or admins delete documents"
  on public.verification_documents for delete to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- Favorites
create policy "Users manage own favorites"
  on public.favorites for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Conversations
create policy "Participants read conversations"
  on public.conversations for select to authenticated
  using (
    tenant_id = auth.uid()
    or landlord_id = auth.uid()
    or public.is_admin()
  );

create policy "Tenants create conversations"
  on public.conversations for insert to authenticated
  with check (
    tenant_id = auth.uid()
    and public.current_user_role() in ('tenant', 'admin')
  );

-- Messages
create policy "Participants read messages"
  on public.messages for select to authenticated
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.tenant_id = auth.uid() or c.landlord_id = auth.uid())
    )
    or public.is_admin()
  );

create policy "Participants send messages"
  on public.messages for insert to authenticated
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.tenant_id = auth.uid() or c.landlord_id = auth.uid())
    )
  );

create policy "Participants update messages"
  on public.messages for update to authenticated
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.tenant_id = auth.uid() or c.landlord_id = auth.uid())
    )
    or public.is_admin()
  );

-- Message notifications
create policy "Recipients read own notifications"
  on public.message_notifications for select to authenticated
  using (recipient_id = auth.uid() or public.is_admin());

create policy "System or participants insert notifications"
  on public.message_notifications for insert to authenticated
  with check (recipient_id = auth.uid() or public.is_admin());

create policy "Recipients update own notifications"
  on public.message_notifications for update to authenticated
  using (recipient_id = auth.uid() or public.is_admin());

-- Admin actions
create policy "Admins manage audit log"
  on public.admin_actions for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Storage buckets
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'property-images',
    'property-images',
    true,
    10485760,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  ),
  (
    'verification-docs',
    'verification-docs',
    false,
    20971520,
    array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
  )
on conflict (id) do nothing;

-- Property images: public read; owners upload under their folder
create policy "Public read property images"
  on storage.objects for select
  using (bucket_id = 'property-images');

create policy "Authenticated upload property images"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'property-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Owners update own property images"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'property-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Owners delete own property images"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'property-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Verification docs: private; owner + admin
create policy "Owners or admins read verification docs"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'verification-docs'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin()
    )
  );

create policy "Users upload verification docs"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'verification-docs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Owners or admins delete verification docs"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'verification-docs'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin()
    )
  );

-- ---------------------------------------------------------------------------
-- Realtime (chat)
-- ---------------------------------------------------------------------------
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.conversations;
