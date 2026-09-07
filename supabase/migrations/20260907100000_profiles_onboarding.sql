-- Track whether a user finished post-signup onboarding
alter table public.profiles
  add column if not exists onboarding_completed boolean not null default false;

comment on column public.profiles.onboarding_completed is
  'False until the user completes /onboarding (phone and lister details).';
