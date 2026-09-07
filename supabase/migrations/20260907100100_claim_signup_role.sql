-- Allow new users to claim tenant/landlord/agent once before onboarding completes.
-- Needed for Google OAuth where role is chosen before redirect.

create or replace function public.claim_signup_role(desired_role public.user_role)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if desired_role not in ('tenant', 'landlord', 'agent') then
    raise exception 'Invalid signup role';
  end if;

  update public.profiles
  set role = desired_role
  where id = auth.uid()
    and coalesce(onboarding_completed, false) = false
    and role is distinct from 'admin';
end;
$$;

revoke all on function public.claim_signup_role(public.user_role) from public;
grant execute on function public.claim_signup_role(public.user_role) to authenticated;
