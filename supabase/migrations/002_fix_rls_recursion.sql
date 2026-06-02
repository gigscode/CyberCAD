-- ============================================================
-- Migration 002 — Fix RLS infinite recursion on profiles
--
-- Root cause: policies that do
--   (select role from profiles where id = auth.uid())
-- cause infinite recursion because evaluating a policy on
-- "profiles" triggers another RLS check on "profiles".
--
-- Fix: create a security-definer function that reads the role
-- bypassing RLS, then use that function in all policies.
-- ============================================================

-- ── 1. Create the helper function ────────────────────────────
create or replace function public.get_my_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- ── 2. Drop all old policies that cause recursion ────────────

-- profiles
drop policy if exists "Super-admins read all profiles"     on profiles;
drop policy if exists "Super-admins update any profile"    on profiles;

-- payment_plans
drop policy if exists "Super-admins manage plans"          on payment_plans;

-- payments
drop policy if exists "Super-admins read all payments"     on payments;

-- courses
drop policy if exists "Super-admins manage all courses"    on courses;

-- modules
drop policy if exists "Super-admins manage modules"        on modules;

-- lessons
drop policy if exists "Super-admins manage lessons"        on lessons;

-- enrolments
drop policy if exists "Super-admins read all enrolments"   on enrolments;
drop policy if exists "Super-admins manage enrolments"     on enrolments;

-- learner_progress
drop policy if exists "Super-admins read all progress"     on learner_progress;

-- submissions
drop policy if exists "Super-admins manage all submissions" on submissions;

-- quiz_results
drop policy if exists "Super-admins read all quiz results" on quiz_results;

-- notifications
drop policy if exists "Super-admins manage all notifications" on notifications;

-- tasks
drop policy if exists "Super-admins manage all tasks"      on tasks;

-- mentorship_requests
drop policy if exists "Super-admins read all mentorship requests" on mentorship_requests;

-- audit_logs
drop policy if exists "Super-admins read audit logs"       on audit_logs;

-- ── 3. Re-create all policies using get_my_role() ────────────

-- profiles (the critical one — was self-referencing)
create policy "Super-admins read all profiles"
  on profiles for select
  using (public.get_my_role() = 'super-admin');

create policy "Super-admins update any profile"
  on profiles for update
  using (public.get_my_role() = 'super-admin');

-- payment_plans
create policy "Super-admins manage plans"
  on payment_plans for all
  using (public.get_my_role() = 'super-admin');

-- payments
create policy "Super-admins read all payments"
  on payments for select
  using (public.get_my_role() = 'super-admin');

-- courses
create policy "Super-admins manage all courses"
  on courses for all
  using (public.get_my_role() = 'super-admin');

-- modules
create policy "Super-admins manage modules"
  on modules for all
  using (public.get_my_role() = 'super-admin');

-- lessons
create policy "Super-admins manage lessons"
  on lessons for all
  using (public.get_my_role() = 'super-admin');

-- enrolments
create policy "Super-admins read all enrolments"
  on enrolments for select
  using (public.get_my_role() = 'super-admin');

create policy "Super-admins manage enrolments"
  on enrolments for all
  using (public.get_my_role() = 'super-admin');

-- learner_progress
create policy "Super-admins read all progress"
  on learner_progress for select
  using (public.get_my_role() = 'super-admin');

-- submissions
create policy "Super-admins manage all submissions"
  on submissions for all
  using (public.get_my_role() = 'super-admin');

-- quiz_results
create policy "Super-admins read all quiz results"
  on quiz_results for select
  using (public.get_my_role() = 'super-admin');

-- notifications
create policy "Super-admins manage all notifications"
  on notifications for all
  using (public.get_my_role() = 'super-admin');

-- tasks
create policy "Super-admins manage all tasks"
  on tasks for all
  using (public.get_my_role() = 'super-admin');

-- mentorship_requests
create policy "Super-admins read all mentorship requests"
  on mentorship_requests for select
  using (public.get_my_role() = 'super-admin');

-- audit_logs
create policy "Super-admins read audit logs"
  on audit_logs for select
  using (public.get_my_role() = 'super-admin');

-- ── 4. Also fix the profiles INSERT policy ────────────────────
-- The trigger inserts into profiles as service role so no INSERT
-- policy is needed on profiles for normal users.
-- But ensure the trigger function has correct permissions.
-- (Already set as security definer in migration 001 — no change needed.)

-- ── 5. Allow authenticated learners to browse published courses ───
-- Without this, a logged-in learner who isn't enrolled gets
-- "permission denied" when the dashboard tries to list courses.

drop policy if exists "Authenticated users view public courses" on courses;
create policy "Authenticated users view public courses"
  on courses for select
  using (
    auth.role() = 'authenticated'
    and is_public = true
    and is_published = true
  );

drop policy if exists "Authenticated users view public modules" on modules;
create policy "Authenticated users view public modules"
  on modules for select
  using (
    exists (
      select 1 from courses c
      where c.id = modules.course_id
        and c.is_public = true
        and c.is_published = true
    )
  );
