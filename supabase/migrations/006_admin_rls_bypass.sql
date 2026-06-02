-- ============================================================
-- Migration 006 — Fix super-admin RLS for browser client
--
-- Root cause: get_my_role() called inside a policy on table X
-- triggers an RLS check on profiles to evaluate the policy,
-- which itself calls get_my_role() — infinite recursion or
-- silent policy miss depending on Postgres version.
--
-- Fix: For each table the super-admin needs to access, add a
-- policy that checks profiles.role = 'super-admin' directly
-- using a subquery with the SECURITY DEFINER function, AND
-- ensure courses/payments/enrolments have explicit policies
-- that actually cover the anon→authenticated→service chain.
--
-- Better fix for admin reads: use a server-side API route with
-- the service role key. This migration covers the immediate
-- browser-client access by adding a safe subquery pattern.
-- ============================================================

-- ── Re-drop and recreate get_my_role cleanly ─────────────────
drop function if exists public.get_my_role() cascade;

create or replace function public.get_my_role()
returns text
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_role text;
begin
  select role into v_role
  from public.profiles
  where id = auth.uid();
  return coalesce(v_role, 'learner');
end;
$$;

grant execute on function public.get_my_role() to authenticated;
grant execute on function public.get_my_role() to anon;
grant execute on function public.get_my_role() to service_role;

-- ── COURSES ───────────────────────────────────────────────────
drop policy if exists "Super-admins manage all courses"       on public.courses;
drop policy if exists "Public courses visible to all"         on public.courses;
drop policy if exists "Authenticated users view public courses" on public.courses;
drop policy if exists "Enrolled learners can view their courses" on public.courses;

-- Everyone (including unauthenticated) can browse published public courses
create policy "Public courses visible to all"
  on public.courses
  as permissive for select
  using (is_public = true and is_published = true);

-- Authenticated learners enrolled in a course can see it
create policy "Enrolled learners view own courses"
  on public.courses
  as permissive for select
  to authenticated
  using (
    exists (
      select 1 from public.enrolments e
      where e.course_id = courses.id
        and e.user_id = auth.uid()
        and e.status = 'active'
    )
  );

-- Super-admin full access — using EXISTS subquery to avoid recursion
create policy "Super-admins manage all courses"
  on public.courses
  as permissive for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'super-admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'super-admin'
    )
  );

-- ── PAYMENTS ──────────────────────────────────────────────────
drop policy if exists "Users read own payments"               on public.payments;
drop policy if exists "Super-admins read all payments"        on public.payments;

create policy "Users read own payments"
  on public.payments
  as permissive for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Super-admins manage all payments"
  on public.payments
  as permissive for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'super-admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'super-admin'
    )
  );

-- ── ENROLMENTS ────────────────────────────────────────────────
drop policy if exists "Learners read own enrolments"          on public.enrolments;
drop policy if exists "Super-admins read all enrolments"      on public.enrolments;
drop policy if exists "Super-admins manage enrolments"        on public.enrolments;

create policy "Learners read own enrolments"
  on public.enrolments
  as permissive for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Super-admins manage all enrolments"
  on public.enrolments
  as permissive for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'super-admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'super-admin'
    )
  );

-- ── PROFILES ──────────────────────────────────────────────────
-- (already fixed in 005 but reapply with EXISTS pattern)
drop policy if exists "Super-admins read all profiles"        on public.profiles;
drop policy if exists "Super-admins update any profile"       on public.profiles;

create policy "Super-admins read all profiles"
  on public.profiles
  as permissive for select
  to authenticated
  using (
    auth.uid() = id
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'super-admin'
    )
  );

create policy "Super-admins update any profile"
  on public.profiles
  as permissive for update
  to authenticated
  using (
    auth.uid() = id
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'super-admin'
    )
  );

-- ── SUBMISSIONS ───────────────────────────────────────────────
drop policy if exists "Super-admins manage all submissions"   on public.submissions;

create policy "Super-admins manage all submissions"
  on public.submissions
  as permissive for all
  to authenticated
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'super-admin'
    )
  )
  with check (
    auth.uid() = user_id
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'super-admin'
    )
  );

-- ── MODULES ───────────────────────────────────────────────────
drop policy if exists "Super-admins manage modules"           on public.modules;
drop policy if exists "Authenticated users view public modules" on public.modules;

create policy "Super-admins manage modules"
  on public.modules
  as permissive for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'super-admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'super-admin'
    )
  );

-- ── LESSONS ───────────────────────────────────────────────────
drop policy if exists "Super-admins manage lessons"           on public.lessons;

create policy "Super-admins manage lessons"
  on public.lessons
  as permissive for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'super-admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'super-admin'
    )
  );

-- ── MENTORSHIP_REQUESTS ───────────────────────────────────────
drop policy if exists "Super-admins read all mentorship requests" on public.mentorship_requests;

create policy "Super-admins read all mentorship requests"
  on public.mentorship_requests
  as permissive for select
  to authenticated
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'super-admin'
    )
  );

-- ── AUDIT_LOGS ────────────────────────────────────────────────
drop policy if exists "Super-admins read audit logs"          on public.audit_logs;

create policy "Super-admins read audit logs"
  on public.audit_logs
  as permissive for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'super-admin'
    )
  );

-- ── NOTIFICATIONS ─────────────────────────────────────────────
drop policy if exists "Super-admins manage all notifications" on public.notifications;

create policy "Super-admins manage all notifications"
  on public.notifications
  as permissive for all
  to authenticated
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'super-admin'
    )
  )
  with check (
    auth.uid() = user_id
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'super-admin'
    )
  );

-- ── TASKS ─────────────────────────────────────────────────────
drop policy if exists "Super-admins manage all tasks"         on public.tasks;

create policy "Super-admins manage all tasks"
  on public.tasks
  as permissive for all
  to authenticated
  using (
    auth.uid() = learner_id
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'super-admin'
    )
  )
  with check (
    auth.uid() = learner_id
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'super-admin'
    )
  );

-- ── LEARNER_PROGRESS ──────────────────────────────────────────
drop policy if exists "Super-admins read all progress"        on public.learner_progress;

create policy "Super-admins read all progress"
  on public.learner_progress
  as permissive for select
  to authenticated
  using (
    auth.uid() = learner_id
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'super-admin'
    )
  );

-- ── QUIZ_RESULTS ──────────────────────────────────────────────
drop policy if exists "Super-admins read all quiz results"    on public.quiz_results;

create policy "Super-admins read all quiz results"
  on public.quiz_results
  as permissive for all
  to authenticated
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'super-admin'
    )
  );

-- ── PAYMENT_PLANS ─────────────────────────────────────────────
drop policy if exists "Super-admins manage plans"             on public.payment_plans;

create policy "Super-admins manage plans"
  on public.payment_plans
  as permissive for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'super-admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'super-admin'
    )
  );
