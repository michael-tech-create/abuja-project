-- Backfill profiles for users created before schema existed
insert into public.profiles (id, role, full_name, email)
select
  u.id,
  case
    when coalesce(u.raw_user_meta_data->>'role', '') in ('tenant', 'landlord', 'agent')
      then (u.raw_user_meta_data->>'role')::public.user_role
    else 'tenant'::public.user_role
  end,
  coalesce(
    nullif(u.raw_user_meta_data->>'full_name', ''),
    split_part(u.email, '@', 1)
  ),
  u.email
from auth.users u
on conflict (id) do nothing;
