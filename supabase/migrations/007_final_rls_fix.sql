-- ============================================================
-- Migration 007 — Final RLS fix
--
-- The EXISTS subquery pattern on profiles causes recursion when
-- evaluating policies on profiles itself. The only safe approach:
--
-- 1. A security-definer function that reads profiles bypassing RLS
-- 2. Profiles own-row policy uses auth.uid() = id only (no function)
-- 3. All other tables use the function
-- 4. The function is never dropped — only replaced
-- ============================================================

-- ── 1. Replace get_my_role safely (no drop needed) ────────────
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

-- ── 2. PROFILES — must NOT use get_my_role() (self-reference) ─
drop policy if exists "Users read own profile"          on public.profiles;
drop policy if exists "Super-admins read all profiles"  on public.profiles;
drop policy if exists "Users update own profile"        on public.profiles;
drop policy if exists "Super-admins update any profile" on public.profiles;
drop policy if exists "Allow trigger to insert profile" on public.profiles;

-- Simple uid check — zero recursion
create policy "Users read own profile"
  on public.profiles as permissive for select
  to authenticated
  using (auth.uid() = id);

-- Super-admin reads all: safe because get_my_role() is security definer
-- and internally reads profiles WITHOUT triggering RLS (security definer bypasses it)
create policy "Super-admins read all profiles"
  on public.profiles as permissive for select
  to authenticated
  using (public.get_my_role() = 'super-admin');

create policy "Users update own profile"
  on public.profiles as permissive for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Super-admins update any profile"
  on public.profiles as permissive for update
  to authenticated
  using (public.get_my_role() = 'super-admin');

create policy "Allow trigger to insert profile"
  on public.profiles as permissive for insert
  with check (true);

-- ── 3. COURSES ────────────────────────────────────────────────
drop policy if exists "Public courses visible to all"             on public.courses;
drop policy if exists "Enrolled learners view own courses"        on public.courses;
drop policy if exists "Enrolled learners can view their courses"  on public.courses;
drop policy if exists "Authenticated users view public courses"   on public.courses;
drop policy if exists "Super-admins manage all courses"           on public.courses;

create policy "Public courses visible to all"
  on public.courses as permissive for select
  using (is_public = true and is_published = true);

create policy "Enrolled learners view own courses"
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

create policy "Super-admins manage all courses"
  on public.courses as permissive for all
  to authenticated
  using (public.get_my_role() = 'super-admin')
  with check (public.get_my_role() = 'super-admin');

-- ── 4. PAYMENTS ───────────────────────────────────────────────
drop policy if exists "Users read own payments"          on public.payments;
drop policy if exists "Super-admins read all payments"   on public.payments;
drop policy if exists "Super-admins manage all payments" on public.payments;

create policy "Users read own payments"
  on public.payments as permissive for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Super-admins manage all payments"
  on public.payments as permissive for all
  to authenticated
  using (public.get_my_role() = 'super-admin')
  with check (public.get_my_role() = 'super-admin');

-- ── 5. ENROLMENTS ─────────────────────────────────────────────
drop policy if exists "Learners read own enrolments"       on public.enrolments;
drop policy if exists "Super-admins read all enrolments"   on public.enrolments;
drop policy if exists "Super-admins manage enrolments"     on public.enrolments;
drop policy if exists "Super-admins manage all enrolments" on public.enrolments;

create policy "Learners read own enrolments"
  on public.enrolments as permissive for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Super-admins manage all enrolments"
  on public.enrolments as permissive for all
  to authenticated
  using (public.get_my_role() = 'super-admin')
  with check (public.get_my_role() = 'super-admin');

-- ── 6. MODULES ────────────────────────────────────────────────
drop policy if exists "Super-admins manage modules"              on public.modules;
drop policy if exists "Authenticated users view public modules"  on public.modules;
drop policy if exists "Enrolled learners view modules"           on public.modules;

create policy "Enrolled learners view modules"
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

create policy "Super-admins manage modules"
  on public.modules as permissive for all
  to authenticated
  using (public.get_my_role() = 'super-admin')
  with check (public.get_my_role() = 'super-admin');

-- ── 7. LESSONS ────────────────────────────────────────────────
drop policy if exists "Super-admins manage lessons"  on public.lessons;
drop policy if exists "Enrolled learners view lessons" on public.lessons;

create policy "Enrolled learners view lessons"
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

create policy "Super-admins manage lessons"
  on public.lessons as permissive for all
  to authenticated
  using (public.get_my_role() = 'super-admin')
  with check (public.get_my_role() = 'super-admin');

-- ── 8. SUBMISSIONS ────────────────────────────────────────────
drop policy if exists "Learners manage own submissions"       on public.submissions;
drop policy if exists "Super-admins manage all submissions"   on public.submissions;

create policy "Learners manage own submissions"
  on public.submissions as permissive for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Super-admins manage all submissions"
  on public.submissions as permissive for all
  to authenticated
  using (public.get_my_role() = 'super-admin')
  with check (public.get_my_role() = 'super-admin');

-- ── 9. QUIZ_RESULTS ───────────────────────────────────────────
drop policy if exists "Learners manage own quiz results"   on public.quiz_results;
drop policy if exists "Super-admins read all quiz results" on public.quiz_results;

create policy "Learners manage own quiz results"
  on public.quiz_results as permissive for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Super-admins read all quiz results"
  on public.quiz_results as permissive for select
  to authenticated
  using (public.get_my_role() = 'super-admin');

-- ── 10. NOTIFICATIONS ─────────────────────────────────────────
drop policy if exists "Users read own notifications"          on public.notifications;
drop policy if exists "Users mark own notifications read"     on public.notifications;
drop policy if exists "Super-admins manage all notifications" on public.notifications;
drop policy if exists "System insert notifications"           on public.notifications;

create policy "Users read own notifications"
  on public.notifications as permissive for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users mark own notifications read"
  on public.notifications as permissive for update
  to authenticated
  using (auth.uid() = user_id);

create policy "System insert notifications"
  on public.notifications as permissive for insert
  with check (true);

create policy "Super-admins manage all notifications"
  on public.notifications as permissive for all
  to authenticated
  using (public.get_my_role() = 'super-admin')
  with check (public.get_my_role() = 'super-admin');

-- ── 11. TASKS ─────────────────────────────────────────────────
drop policy if exists "Learners manage own tasks"     on public.tasks;
drop policy if exists "Super-admins manage all tasks" on public.tasks;

create policy "Learners manage own tasks"
  on public.tasks as permissive for all
  to authenticated
  using (auth.uid() = learner_id)
  with check (auth.uid() = learner_id);

create policy "Super-admins manage all tasks"
  on public.tasks as permissive for all
  to authenticated
  using (public.get_my_role() = 'super-admin')
  with check (public.get_my_role() = 'super-admin');

-- ── 12. LEARNER_PROGRESS ──────────────────────────────────────
drop policy if exists "Learners read own progress"    on public.learner_progress;
drop policy if exists "Learners insert own progress"  on public.learner_progress;
drop policy if exists "Learners update own progress"  on public.learner_progress;
drop policy if exists "Super-admins read all progress" on public.learner_progress;

create policy "Learners read own progress"
  on public.learner_progress as permissive for select
  to authenticated
  using (auth.uid() = learner_id);

create policy "Learners insert own progress"
  on public.learner_progress as permissive for insert
  to authenticated
  with check (auth.uid() = learner_id);

create policy "Learners update own progress"
  on public.learner_progress as permissive for update
  to authenticated
  using (auth.uid() = learner_id)
  with check (auth.uid() = learner_id);

create policy "Super-admins read all progress"
  on public.learner_progress as permissive for select
  to authenticated
  using (public.get_my_role() = 'super-admin');

-- ── 13. MENTORSHIP_REQUESTS ───────────────────────────────────
drop policy if exists "Learners insert own mentorship requests"   on public.mentorship_requests;
drop policy if exists "Learners read own mentorship requests"     on public.mentorship_requests;
drop policy if exists "Super-admins read all mentorship requests" on public.mentorship_requests;

create policy "Learners insert own mentorship requests"
  on public.mentorship_requests as permissive for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Learners read own mentorship requests"
  on public.mentorship_requests as permissive for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Super-admins read all mentorship requests"
  on public.mentorship_requests as permissive for select
  to authenticated
  using (public.get_my_role() = 'super-admin');

-- ── 14. AUDIT_LOGS ────────────────────────────────────────────
drop policy if exists "Super-admins read audit logs" on public.audit_logs;

create policy "Super-admins read audit logs"
  on public.audit_logs as permissive for select
  to authenticated
  using (public.get_my_role() = 'super-admin');

-- ── 15. PAYMENT_PLANS ─────────────────────────────────────────
drop policy if exists "Anyone can view active plans" on public.payment_plans;
drop policy if exists "Super-admins manage plans"    on public.payment_plans;

create policy "Anyone can view active plans"
  on public.payment_plans as permissive for select
  using (is_active = true);

create policy "Super-admins manage plans"
  on public.payment_plans as permissive for all
  to authenticated
  using (public.get_my_role() = 'super-admin')
  with check (public.get_my_role() = 'super-admin');
