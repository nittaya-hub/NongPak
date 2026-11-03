-- Koel: run once in Supabase → SQL Editor → New query → Run
-- Free app: accounts, user/admin roles, progress sync. No billing.

-- 1) profiles: one row per account
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  role text not null default 'user' check (role in ('user','admin')),
  status text not null default 'active' check (status in ('active','blocked')),
  created_at timestamptz not null default now(),
  last_seen timestamptz
);

-- columns added in later versions (safe to re-run)
alter table public.profiles add column if not exists onboarded boolean not null default false;

-- 2) progress: the learner's saved progress (all languages) as JSON
create table if not exists public.progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- 3) app_secrets: the key that unlocks the lesson content, readable only by signed-in active users
create table if not exists public.app_secrets (
  key text primary key,
  value text not null
);

-- helpers (security definer so policies don't recurse)
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin' and status = 'active');
$$;
create or replace function public.is_active() returns boolean
language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.profiles where id = auth.uid() and status = 'active');
$$;

-- create a profile automatically when someone signs up
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'display_name', ''))
  on conflict (id) do nothing;
  return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- users may not promote themselves or unblock themselves
create or replace function public.guard_profile() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() and (new.role is distinct from old.role or new.status is distinct from old.status) then
    raise exception 'only admins can change role or status';
  end if;
  return new;
end; $$;
drop trigger if exists guard_profile on public.profiles;
create trigger guard_profile before update on public.profiles
  for each row execute function public.guard_profile();

-- row level security
alter table public.profiles enable row level security;
alter table public.progress enable row level security;
alter table public.app_secrets enable row level security;

drop policy if exists "profiles: read own or admin" on public.profiles;
create policy "profiles: read own or admin" on public.profiles for select using (id = auth.uid() or public.is_admin());
drop policy if exists "profiles: update own or admin" on public.profiles;
create policy "profiles: update own or admin" on public.profiles for update using (id = auth.uid() or public.is_admin());

drop policy if exists "progress: own" on public.progress;
create policy "progress: own" on public.progress for all using (user_id = auth.uid() and public.is_active()) with check (user_id = auth.uid() and public.is_active());
drop policy if exists "progress: admin read" on public.progress;
create policy "progress: admin read" on public.progress for select using (public.is_admin());

drop policy if exists "secrets: active users read" on public.app_secrets;
create policy "secrets: active users read" on public.app_secrets for select using (public.is_active());
drop policy if exists "secrets: admin write" on public.app_secrets;
create policy "secrets: admin write" on public.app_secrets for all using (public.is_admin()) with check (public.is_admin());

-- 4) make yourself admin AFTER you have signed up once in the app (change the email if needed)
update public.profiles set role = 'admin' where email = 'nittaya@greydigi.com';
