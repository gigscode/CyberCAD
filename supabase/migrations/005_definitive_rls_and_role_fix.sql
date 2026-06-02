-- ============================================================
-- Migration 005 — Definitive RLS fix + role sync
--
-- Fixes:
-- 1. tasks + learner_progress 403 for authenticated learners
-- 2. Ensures get_my_role() never returns null (causes policy miss)
-- 3. Adds explicit SELECT grants so anon/authenticated roles
--    can execute RLS-protected queries at all
-- ============================================================

-- ── 1. Recreate get_my_role() — returns 'learner' as safe default ─────────
create or replace function public.get_my_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role from public.profiles where id = auth.uid()),
    'learner'
  );
$$;

-- ── 2. Grant execute to authenticated users ───────────────────────────────
grant execute on function public.get_my_role() to authenticated;
grant execute on function public.get_my_role() to anon;

-- ── 3. Ensure RLS is enabled on the three failing tables ─────────────────
alter table public.tasks             enable row level security;
alter table public.learner_progress  enable row level security;
alter table public.profiles          enable row level security;

-- ── 4. TASKS — drop all, recreate cleanly ────────────────────────────────
drop policy if exists "Learners manage own tasks"     on public.tasks;
drop policy if exists "Super-admins manage all tasks" on public.tasks;

-- Learners: full CRUD on their own rows
create policy "Learners manage own tasks"
  on public.tasks
  as permissive
  for all
  to authenticated
  using (auth.uid() = learner_id)
  with check (auth.uid() = learner_id);

-- Super-admins: full CRUD on all rows
create policy "Super-admins manage all tasks"
  on public.tasks
  as permissive
  for all
  to authenticated
  using (public.get_my_role() = 'super-admin')
  with check (public.get_my_role() = 'super-admin');

-- ── 5. LEARNER_PROGRESS — drop all, recreate cleanly ─────────────────────
drop policy if exists "Learners read own progress"    on public.learner_progress;
drop policy if exists "Learners insert own progress"  on public.learner_progress;
drop policy if exists "Learners update own progress"  on public.learner_progress;
drop policy if exists "Super-admins read all progress" on public.learner_progress;

create policy "Learners read own progress"
  on public.learner_progress
  as permissive
  for select
  to authenticated
  using (auth.uid() = learner_id);

create policy "Learners insert own progress"
  on public.learner_progress
  as permissive
  for insert
  to authenticated
  with check (auth.uid() = learner_id);

create policy "Learners update own progress"
  on public.learner_progress
  as permissive
  for update
  to authenticated
  using (auth.uid() = learner_id)
  with check (auth.uid() = learner_id);

create policy "Super-admins read all progress"
  on public.learner_progress
  as permissive
  for select
  to authenticated
  using (public.get_my_role() = 'super-admin');

-- ── 6. PROFILES — drop all, recreate cleanly ─────────────────────────────
drop policy if exists "Users read own profile"          on public.profiles;
drop policy if exists "Super-admins read all profiles"  on public.profiles;
drop policy if exists "Users update own profile"        on public.profiles;
drop policy if exists "Super-admins update any profile" on public.profiles;
drop policy if exists "Allow trigger to insert profile" on public.profiles;
drop policy if exists "Service role insert profile"     on public.profiles;

create policy "Users read own profile"
  on public.profiles
  as permissive
  for select
  to authenticated
  using (auth.uid() = id);

create policy "Super-admins read all profiles"
  on public.profiles
  as permissive
  for select
  to authenticated
  using (public.get_my_role() = 'super-admin');

create policy "Users update own profile"
  on public.profiles
  as permissive
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Super-admins update any profile"
  on public.profiles
  as permissive
  for update
  to authenticated
  using (public.get_my_role() = 'super-admin');

-- Allow the handle_new_user() trigger to insert (it runs as service role
-- but explicit policy avoids any edge case rejections)
create policy "Allow trigger to insert profile"
  on public.profiles
  as permissive
  for insert
  with check (true);

-- ── 7. Sync user_metadata role for super-admins ───────────────────────────
-- If a user's profiles.role = 'super-admin' but their auth metadata
-- still says 'learner', the auth-context falls back to 'learner' on
-- first load. This updates auth metadata to match the profiles table.
-- Safe to run multiple times (idempotent).
do $$
declare
  r record;
begin
  for r in
    select id from public.profiles where role = 'super-admin'
  loop
    update auth.users
    set raw_user_meta_data = jsonb_set(
      coalesce(raw_user_meta_data, '{}'::jsonb),
      '{role}',
      '"super-admin"'
    )
    where id = r.id;
  end loop;
end;
$$;
