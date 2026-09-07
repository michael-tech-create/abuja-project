-- Video support: chat media messages + property tour videos

-- ---------------------------------------------------------------------------
-- Messages: optional media (image/video) with realtime delivery
-- ---------------------------------------------------------------------------
alter table public.messages
  add column if not exists media_url text,
  add column if not exists media_type text not null default 'none',
  add column if not exists media_mime text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'messages_media_type_check'
  ) then
    alter table public.messages
      add constraint messages_media_type_check
      check (media_type in ('none', 'image', 'video'));
  end if;
end $$;

-- Allow caption-less media messages
alter table public.messages drop constraint if exists messages_content_check;

alter table public.messages
  add constraint messages_content_or_media_check
  check (
    char_length(trim(content)) > 0
    or (media_url is not null and media_type in ('image', 'video'))
  );

-- ---------------------------------------------------------------------------
-- Properties: tour videos
-- ---------------------------------------------------------------------------
alter table public.properties
  add column if not exists videos text[] not null default '{}';

-- ---------------------------------------------------------------------------
-- Storage buckets
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'chat-media',
    'chat-media',
    true,
    104857600, -- 100MB
    array[
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'video/mp4',
      'video/webm',
      'video/quicktime'
    ]
  ),
  (
    'property-videos',
    'property-videos',
    true,
    209715200, -- 200MB
    array[
      'video/mp4',
      'video/webm',
      'video/quicktime'
    ]
  )
on conflict (id) do nothing;

-- Chat media: participants upload under their user id folder
create policy "Public read chat media"
  on storage.objects for select
  using (bucket_id = 'chat-media');

create policy "Authenticated upload chat media"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'chat-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Owners delete own chat media"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'chat-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Property videos
create policy "Public read property videos"
  on storage.objects for select
  using (bucket_id = 'property-videos');

create policy "Authenticated upload property videos"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'property-videos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Owners update own property videos"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'property-videos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Owners delete own property videos"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'property-videos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
