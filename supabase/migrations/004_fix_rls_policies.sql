-- ============================================================
-- Migration 004 — Definitive RLS fix
--
-- Fixes 403 errors on profiles, tasks, learner_progress for
-- authenticated learners. The issue is that policies using
-- get_my_role() can still recurse if the function's security
-- context is stale or the policy evaluation order causes
-- the learner's own-row SELECT to be blocked.
--
-- Strategy:
--   - Recreate get_my_role() as security definer (guaranteed)
--   - Drop and cleanly recreate all policies for the three
--     failing tables: profiles, tasks, learner_progress
--   - Ensure INSERT policy exists on profiles for the trigger
-- ============================================================

-- ── 1. Recreate the security-definer role helper ─────────────
create or replace function public.get_my_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- ── 2. profiles ──────────────────────────────────────────────
drop policy if exists "Users read own profile"           on profiles;
drop policy if exists "Super-admins read all profiles"   on profiles;
drop policy if exists "Users update own profile"         on profiles;
drop policy if exists "Super-admins update any profile"  on profiles;
drop policy if exists "Service role insert profile"      on profiles;
drop policy if exists "Allow trigger to insert profile"  on profiles;

-- Learner reads their own row — simple uid check, zero recursion
create policy "Users read own profile"
  on profiles for select
  using (auth.uid() = id);

-- Super-admin reads all profiles via security-definer helper
create policy "Super-admins read all profiles"
  on profiles for select
  using (public.get_my_role() = 'super-admin');

-- Learner updates own profile
create policy "Users update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Super-admin updates any profile
create policy "Super-admins update any profile"
  on profiles for update
  using (public.get_my_role() = 'super-admin');

-- Allow the on_auth_user_created trigger (security definer) to insert
-- Without this the trigger fails for new signups when RLS is on
create policy "Allow trigger to insert profile"
  on profiles for insert
  with check (true);

-- ── 3. tasks ─────────────────────────────────────────────────
drop policy if exists "Learners manage own tasks"        on tasks;
drop policy if exists "Super-admins manage all tasks"    on tasks;

-- Full CRUD for own tasks
create policy "Learners manage own tasks"
  on tasks for all
  using (auth.uid() = learner_id)
  with check (auth.uid() = learner_id);

-- Super-admin full access
create policy "Super-admins manage all tasks"
  on tasks for all
  using (public.get_my_role() = 'super-admin')
  with check (public.get_my_role() = 'super-admin');

-- ── 4. learner_progress ──────────────────────────────────────
drop policy if exists "Learners read own progress"       on learner_progress;
drop policy if exists "Learners update own progress"     on learner_progress;
drop policy if exists "Learners insert own progress"     on learner_progress;
drop policy if exists "Super-admins read all progress"   on learner_progress;

-- SELECT own
create policy "Learners read own progress"
  on learner_progress for select
  using (auth.uid() = learner_id);

-- INSERT own
create policy "Learners insert own progress"
  on learner_progress for insert
  with check (auth.uid() = learner_id);

-- UPDATE own
create policy "Learners update own progress"
  on learner_progress for update
  using (auth.uid() = learner_id)
  with check (auth.uid() = learner_id);

-- Super-admin reads all
create policy "Super-admins read all progress"
  on learner_progress for select
  using (public.get_my_role() = 'super-admin');

-- ── 5. notifications — also add INSERT so system can notify ──
drop policy if exists "System insert notifications"      on notifications;

create policy "System insert notifications"
  on notifications for insert
  with check (true);
