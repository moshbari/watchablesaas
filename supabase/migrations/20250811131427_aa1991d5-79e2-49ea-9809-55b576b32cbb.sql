-- 1) Create profiles table matching requested schema
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'interested',
  created_at timestamptz not null default now(),
  constraint profiles_role_valid check (role in ('admin','user','interested'))
);

-- Helpful indexes
create index if not exists idx_profiles_email on public.profiles (email);
create index if not exists idx_profiles_role on public.profiles (role);
create index if not exists idx_profiles_created_at on public.profiles (created_at);

-- 2) RLS
alter table public.profiles enable row level security;

-- Security definer helper to avoid recursive policies
create or replace function public.is_admin(_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = _user_id and p.role = 'admin'
  );
$$;

-- Policies
-- Authenticated users can read their own profile
create policy if not exists "Users can view their own profile"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

-- Admins can view all profiles
create policy if not exists "Admins can view all profiles"
  on public.profiles
  for select
  to authenticated
  using (public.is_admin(auth.uid()));

-- Admins can update any profile
create policy if not exists "Admins can update any profile"
  on public.profiles
  for update
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- (No INSERT policy: rows are created by trigger only)

-- 3) Trigger to auto-create profiles on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Attach trigger to auth.users
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4) Secure RPC for admins to set roles
create or replace function public.admin_set_role(_user_id uuid, _new_role text)
returns public.profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  updated_row public.profiles;
begin
  -- Only allow admins to change roles
  if not public.is_admin(auth.uid()) then
    raise exception 'Not authorized' using errcode = '42501';
  end if;

  -- Validate role
  if _new_role not in ('admin','user','interested') then
    raise exception 'Invalid role';
  end if;

  update public.profiles
  set role = _new_role
  where id = _user_id
  returning * into updated_row;

  if not found then
    raise exception 'Profile not found';
  end if;

  return updated_row;
end;
$$;
