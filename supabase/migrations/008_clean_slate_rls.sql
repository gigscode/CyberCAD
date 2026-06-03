-- ============================================================
-- Migration 008 — Clean slate RLS
--
-- Strategy that eliminates ALL recursion:
-- 1. Drop ALL existing policies on ALL tables
-- 2. Recreate get_my_role() as security definer (bypasses RLS)
-- 3. profiles SELECT/UPDATE: only auth.uid() = id (no function)
--    Super-admin reads all profiles via the function — safe
--    because the function runs as postgres (owner), not the user
-- 4. Every other table uses get_my_role() freely
-- ============================================================

-- ── Nuke all policies ─────────────────────────────────────────
do $$
declare
  r record;
begin
  for r in
    select policyname, tablename
    from pg_policies
    where schemaname = 'public'
  loop
    execute format(
      'drop policy if exists %I on public.%I',
      r.policyname, r.tablename
    );
  end loop;
end;
$$;

-- ── Recreate get_my_role() ────────────────────────────────────
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

grant execute on function public.get_my_role() to authenticated;
grant execute on function public.get_my_role() to anon;
grant execute on function public.get_my_role() to service_role;

-- ══════════════════════════════════════════════════════════════
-- PROFILES
-- get_my_role() is security definer so it reads profiles as
-- postgres (owner) — bypasses RLS — zero recursion.
-- ══════════════════════════════════════════════════════════════
create policy "profiles_select_own"
  on public.profiles as permissive for select
  to authenticated
  using (auth.uid() = id);

create policy "profiles_select_admin"
  on public.profiles as permissive for select
  to authenticated
  using (public.get_my_role() = 'super-admin');

create policy "profiles_update_own"
  on public.profiles as permissive for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "profiles_update_admin"
  on public.profiles as permissive for update
  to authenticated
  using (public.get_my_role() = 'super-admin');

create policy "profiles_insert_trigger"
  on public.profiles as permissive for insert
  with check (true);

-- ══════════════════════════════════════════════════════════════
-- PAYMENT_PLANS
-- ══════════════════════════════════════════════════════════════
create policy "plans_select_active"
  on public.payment_plans as permissive for select
  using (is_active = true);

create policy "plans_all_admin"
  on public.payment_plans as permissive for all
  to authenticated
  using (public.get_my_role() = 'super-admin')
  with check (public.get_my_role() = 'super-admin');

-- ══════════════════════════════════════════════════════════════
-- COURSES
-- ══════════════════════════════════════════════════════════════
create policy "courses_select_public"
  on public.courses as permissive for select
  using (is_public = true and is_published = true);

create policy "courses_select_enrolled"
  on public.courses as permissive for select
  to authenticated
  using (
    exists (
      select 1 from public.enrolments e
      where e.course_id = courses.id
        and e.user_id = auth.uid()
        and e.status = 'active'
    )
  );

create policy "courses_all_admin"
  on public.courses as permissive for all
  to authenticated
  using (public.get_my_role() = 'super-admin')
  with check (public.get_my_role() = 'super-admin');

-- ══════════════════════════════════════════════════════════════
-- MODULES
-- ══════════════════════════════════════════════════════════════
create policy "modules_select_enrolled"
  on public.modules as permissive for select
  to authenticated
  using (
    exists (
      select 1 from public.enrolments e
      where e.course_id = modules.course_id
        and e.user_id = auth.uid()
        and e.status = 'active'
    )
  );

create policy "modules_all_admin"
  on public.modules as permissive for all
  to authenticated
  using (public.get_my_role() = 'super-admin')
  with check (public.get_my_role() = 'super-admin');

-- ══════════════════════════════════════════════════════════════
-- LESSONS
-- ══════════════════════════════════════════════════════════════
create policy "lessons_select_enrolled"
  on public.lessons as permissive for select
  to authenticated
  using (
    exists (
      select 1 from public.enrolments e
      join public.modules m on m.course_id = e.course_id
      where m.id = lessons.module_id
        and e.user_id = auth.uid()
        and e.status = 'active'
    )
  );

create policy "lessons_all_admin"
  on public.lessons as permissive for all
  to authenticated
  using (public.get_my_role() = 'super-admin')
  with check (public.get_my_role() = 'super-admin');

-- ══════════════════════════════════════════════════════════════
-- ENROLMENTS
-- ══════════════════════════════════════════════════════════════
create policy "enrolments_select_own"
  on public.enrolments as permissive for select
  to authenticated
  using (auth.uid() = user_id);

create policy "enrolments_all_admin"
  on public.enrolments as permissive for all
  to authenticated
  using (public.get_my_role() = 'super-admin')
  with check (public.get_my_role() = 'super-admin');

-- ══════════════════════════════════════════════════════════════
-- PAYMENTS
-- ══════════════════════════════════════════════════════════════
create policy "payments_select_own"
  on public.payments as permissive for select
  to authenticated
  using (auth.uid() = user_id);

create policy "payments_all_admin"
  on public.payments as permissive for all
  to authenticated
  using (public.get_my_role() = 'super-admin')
  with check (public.get_my_role() = 'super-admin');

-- ══════════════════════════════════════════════════════════════
-- LEARNER_PROGRESS
-- ══════════════════════════════════════════════════════════════
create policy "progress_select_own"
  on public.learner_progress as permissive for select
  to authenticated
  using (auth.uid() = learner_id);

create policy "progress_insert_own"
  on public.learner_progress as permissive for insert
  to authenticated
  with check (auth.uid() = learner_id);

create policy "progress_update_own"
  on public.learner_progress as permissive for update
  to authenticated
  using (auth.uid() = learner_id)
  with check (auth.uid() = learner_id);

create policy "progress_select_admin"
  on public.learner_progress as permissive for select
  to authenticated
  using (public.get_my_role() = 'super-admin');

-- ══════════════════════════════════════════════════════════════
-- SUBMISSIONS
-- ══════════════════════════════════════════════════════════════
create policy "submissions_own"
  on public.submissions as permissive for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "submissions_all_admin"
  on public.submissions as permissive for all
  to authenticated
  using (public.get_my_role() = 'super-admin')
  with check (public.get_my_role() = 'super-admin');

-- ══════════════════════════════════════════════════════════════
-- QUIZ_RESULTS
-- ══════════════════════════════════════════════════════════════
create policy "quiz_results_own"
  on public.quiz_results as permissive for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "quiz_results_admin"
  on public.quiz_results as permissive for select
  to authenticated
  using (public.get_my_role() = 'super-admin');

-- ══════════════════════════════════════════════════════════════
-- NOTIFICATIONS
-- ══════════════════════════════════════════════════════════════
create policy "notifications_select_own"
  on public.notifications as permissive for select
  to authenticated
  using (auth.uid() = user_id);

create policy "notifications_update_own"
  on public.notifications as permissive for update
  to authenticated
  using (auth.uid() = user_id);

create policy "notifications_insert_any"
  on public.notifications as permissive for insert
  with check (true);

create policy "notifications_all_admin"
  on public.notifications as permissive for all
  to authenticated
  using (public.get_my_role() = 'super-admin')
  with check (public.get_my_role() = 'super-admin');

-- ══════════════════════════════════════════════════════════════
-- TASKS
-- ══════════════════════════════════════════════════════════════
create policy "tasks_own"
  on public.tasks as permissive for all
  to authenticated
  using (auth.uid() = learner_id)
  with check (auth.uid() = learner_id);

create policy "tasks_all_admin"
  on public.tasks as permissive for all
  to authenticated
  using (public.get_my_role() = 'super-admin')
  with check (public.get_my_role() = 'super-admin');

-- ══════════════════════════════════════════════════════════════
-- MENTORSHIP_REQUESTS
-- ══════════════════════════════════════════════════════════════
create policy "mentorship_insert_own"
  on public.mentorship_requests as permissive for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "mentorship_select_own"
  on public.mentorship_requests as permissive for select
  to authenticated
  using (auth.uid() = user_id);

create policy "mentorship_select_admin"
  on public.mentorship_requests as permissive for select
  to authenticated
  using (public.get_my_role() = 'super-admin');

-- ══════════════════════════════════════════════════════════════
-- AUDIT_LOGS
-- ══════════════════════════════════════════════════════════════
create policy "audit_logs_admin"
  on public.audit_logs as permissive for select
  to authenticated
  using (public.get_my_role() = 'super-admin');
