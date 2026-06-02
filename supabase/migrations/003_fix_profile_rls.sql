-- ============================================================
-- Migration 003 — Fix profiles RLS
-- ============================================================

-- Drop all existing profiles policies
drop policy if exists "Users read own profile"          on profiles;
drop policy if exists "Super-admins read all profiles"  on profiles;
drop policy if exists "Users update own profile"        on profiles;
drop policy if exists "Super-admins update any profile" on profiles;

-- Recreate get_my_role as security definer (reads profiles bypassing RLS)
create or replace function public.get_my_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- Users can always read their own profile (no recursion — simple uid check)
create policy "Users read own profile"
  on profiles for select
  using (auth.uid() = id);

-- Super-admins read all profiles — safe because get_my_role() is security definer
-- and bypasses RLS internally, no recursion
create policy "Super-admins read all profiles"
  on profiles for select
  using (public.get_my_role() = 'super-admin');

-- Users update own profile
create policy "Users update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Super-admins update any profile
create policy "Super-admins update any profile"
  on profiles for update
  using (public.get_my_role() = 'super-admin');
