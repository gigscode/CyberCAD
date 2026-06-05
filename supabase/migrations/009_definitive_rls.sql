-- ============================================================
-- Migration 009 — Definitive RLS
--
-- Run this directly in Supabase SQL Editor (Dashboard > SQL Editor)
-- if the previous migrations were not applied via supabase db push.
--
-- What this fixes:
-- 1. Drops ALL existing policies to eliminate conflicts from
--    previous migrations running in partial/unknown states
-- 2. Recreates get_my_role() as SECURITY DEFINER (reads profiles
--    as postgres owner, bypassing RLS — no recursion possible)
-- 3. Profiles: own-row access + admin access via get_my_role()
--    (safe because the function itself bypasses RLS internally)
-- 4. Every other table uses get_my_role() for admin checks
-- 5. Fixes the enrolments JOIN issue by ensuring profiles is
--    readable when joined from enrolments as admin
-- ============================================================

-- ── Step 1: Drop ALL existing policies on ALL public tables ──
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON public.%I',
      r.policyname, r.tablename
    );
  END LOOP;
END;
$$;

-- ── Step 2: Recreate get_my_role() cleanly ───────────────────
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.profiles WHERE id = auth.uid()),
    'learner'
  );
$$;

GRANT EXECUTE ON FUNCTION public.get_my_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_role() TO anon;
GRANT EXECUTE ON FUNCTION public.get_my_role() TO service_role;

-- ══════════════════════════════════════════════════════════════
-- PROFILES
-- get_my_role() is SECURITY DEFINER so it reads profiles as
-- postgres (owner) — zero recursion.
-- ══════════════════════════════════════════════════════════════
CREATE POLICY "profiles_select_own"
  ON public.profiles AS PERMISSIVE FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "profiles_select_admin"
  ON public.profiles AS PERMISSIVE FOR SELECT
  TO authenticated
  USING (public.get_my_role() = 'super-admin');

CREATE POLICY "profiles_update_own"
  ON public.profiles AS PERMISSIVE FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_admin"
  ON public.profiles AS PERMISSIVE FOR UPDATE
  TO authenticated
  USING (public.get_my_role() = 'super-admin')
  WITH CHECK (public.get_my_role() = 'super-admin');

-- Allow the auth trigger to create the profile row on signup
CREATE POLICY "profiles_insert_trigger"
  ON public.profiles AS PERMISSIVE FOR INSERT
  WITH CHECK (true);

-- ══════════════════════════════════════════════════════════════
-- PAYMENT_PLANS
-- ══════════════════════════════════════════════════════════════
CREATE POLICY "plans_select_active"
  ON public.payment_plans AS PERMISSIVE FOR SELECT
  USING (is_active = true);

CREATE POLICY "plans_all_admin"
  ON public.payment_plans AS PERMISSIVE FOR ALL
  TO authenticated
  USING (public.get_my_role() = 'super-admin')
  WITH CHECK (public.get_my_role() = 'super-admin');

-- ══════════════════════════════════════════════════════════════
-- COURSES
-- Admin needs to count ALL published courses (not just public ones)
-- so the admin policy covers all, learner policy covers enrolled,
-- and anonymous/public policy covers is_public = true.
-- ══════════════════════════════════════════════════════════════
CREATE POLICY "courses_select_public"
  ON public.courses AS PERMISSIVE FOR SELECT
  USING (is_public = true AND is_published = true);

CREATE POLICY "courses_select_enrolled"
  ON public.courses AS PERMISSIVE FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.enrolments e
      WHERE e.course_id = courses.id
        AND e.user_id = auth.uid()
        AND e.status = 'active'
    )
  );

CREATE POLICY "courses_all_admin"
  ON public.courses AS PERMISSIVE FOR ALL
  TO authenticated
  USING (public.get_my_role() = 'super-admin')
  WITH CHECK (public.get_my_role() = 'super-admin');

-- ══════════════════════════════════════════════════════════════
-- MODULES
-- ══════════════════════════════════════════════════════════════
CREATE POLICY "modules_select_enrolled"
  ON public.modules AS PERMISSIVE FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.enrolments e
      WHERE e.course_id = modules.course_id
        AND e.user_id = auth.uid()
        AND e.status = 'active'
    )
  );

CREATE POLICY "modules_all_admin"
  ON public.modules AS PERMISSIVE FOR ALL
  TO authenticated
  USING (public.get_my_role() = 'super-admin')
  WITH CHECK (public.get_my_role() = 'super-admin');

-- ══════════════════════════════════════════════════════════════
-- LESSONS
-- ══════════════════════════════════════════════════════════════
CREATE POLICY "lessons_select_enrolled"
  ON public.lessons AS PERMISSIVE FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.enrolments e
      JOIN public.modules m ON m.course_id = e.course_id
      WHERE m.id = lessons.module_id
        AND e.user_id = auth.uid()
        AND e.status = 'active'
    )
  );

CREATE POLICY "lessons_all_admin"
  ON public.lessons AS PERMISSIVE FOR ALL
  TO authenticated
  USING (public.get_my_role() = 'super-admin')
  WITH CHECK (public.get_my_role() = 'super-admin');

-- ══════════════════════════════════════════════════════════════
-- ENROLMENTS
-- ══════════════════════════════════════════════════════════════
CREATE POLICY "enrolments_select_own"
  ON public.enrolments AS PERMISSIVE FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "enrolments_all_admin"
  ON public.enrolments AS PERMISSIVE FOR ALL
  TO authenticated
  USING (public.get_my_role() = 'super-admin')
  WITH CHECK (public.get_my_role() = 'super-admin');

-- ══════════════════════════════════════════════════════════════
-- PAYMENTS
-- ══════════════════════════════════════════════════════════════
CREATE POLICY "payments_select_own"
  ON public.payments AS PERMISSIVE FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "payments_all_admin"
  ON public.payments AS PERMISSIVE FOR ALL
  TO authenticated
  USING (public.get_my_role() = 'super-admin')
  WITH CHECK (public.get_my_role() = 'super-admin');

-- ══════════════════════════════════════════════════════════════
-- LEARNER_PROGRESS
-- ══════════════════════════════════════════════════════════════
CREATE POLICY "progress_select_own"
  ON public.learner_progress AS PERMISSIVE FOR SELECT
  TO authenticated
  USING (auth.uid() = learner_id);

CREATE POLICY "progress_insert_own"
  ON public.learner_progress AS PERMISSIVE FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = learner_id);

CREATE POLICY "progress_update_own"
  ON public.learner_progress AS PERMISSIVE FOR UPDATE
  TO authenticated
  USING (auth.uid() = learner_id)
  WITH CHECK (auth.uid() = learner_id);

CREATE POLICY "progress_select_admin"
  ON public.learner_progress AS PERMISSIVE FOR SELECT
  TO authenticated
  USING (public.get_my_role() = 'super-admin');

-- ══════════════════════════════════════════════════════════════
-- SUBMISSIONS
-- ══════════════════════════════════════════════════════════════
CREATE POLICY "submissions_own"
  ON public.submissions AS PERMISSIVE FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "submissions_all_admin"
  ON public.submissions AS PERMISSIVE FOR ALL
  TO authenticated
  USING (public.get_my_role() = 'super-admin')
  WITH CHECK (public.get_my_role() = 'super-admin');

-- ══════════════════════════════════════════════════════════════
-- QUIZ_RESULTS
-- ══════════════════════════════════════════════════════════════
CREATE POLICY "quiz_results_own"
  ON public.quiz_results AS PERMISSIVE FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "quiz_results_admin"
  ON public.quiz_results AS PERMISSIVE FOR SELECT
  TO authenticated
  USING (public.get_my_role() = 'super-admin');

-- ══════════════════════════════════════════════════════════════
-- NOTIFICATIONS
-- ══════════════════════════════════════════════════════════════
CREATE POLICY "notifications_select_own"
  ON public.notifications AS PERMISSIVE FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "notifications_update_own"
  ON public.notifications AS PERMISSIVE FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "notifications_insert_any"
  ON public.notifications AS PERMISSIVE FOR INSERT
  WITH CHECK (true);

CREATE POLICY "notifications_all_admin"
  ON public.notifications AS PERMISSIVE FOR ALL
  TO authenticated
  USING (public.get_my_role() = 'super-admin')
  WITH CHECK (public.get_my_role() = 'super-admin');

-- ══════════════════════════════════════════════════════════════
-- TASKS
-- ══════════════════════════════════════════════════════════════
CREATE POLICY "tasks_own"
  ON public.tasks AS PERMISSIVE FOR ALL
  TO authenticated
  USING (auth.uid() = learner_id)
  WITH CHECK (auth.uid() = learner_id);

CREATE POLICY "tasks_all_admin"
  ON public.tasks AS PERMISSIVE FOR ALL
  TO authenticated
  USING (public.get_my_role() = 'super-admin')
  WITH CHECK (public.get_my_role() = 'super-admin');

-- ══════════════════════════════════════════════════════════════
-- MENTORSHIP_REQUESTS
-- ══════════════════════════════════════════════════════════════
CREATE POLICY "mentorship_insert_own"
  ON public.mentorship_requests AS PERMISSIVE FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "mentorship_select_own"
  ON public.mentorship_requests AS PERMISSIVE FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "mentorship_all_admin"
  ON public.mentorship_requests AS PERMISSIVE FOR ALL
  TO authenticated
  USING (public.get_my_role() = 'super-admin')
  WITH CHECK (public.get_my_role() = 'super-admin');

-- ══════════════════════════════════════════════════════════════
-- AUDIT_LOGS
-- ══════════════════════════════════════════════════════════════
CREATE POLICY "audit_logs_insert_any"
  ON public.audit_logs AS PERMISSIVE FOR INSERT
  WITH CHECK (true);

CREATE POLICY "audit_logs_admin"
  ON public.audit_logs AS PERMISSIVE FOR SELECT
  TO authenticated
  USING (public.get_my_role() = 'super-admin');

-- ══════════════════════════════════════════════════════════════
-- TABLE-LEVEL GRANTS
-- RLS policies control which rows are visible, but the role must
-- first have permission to touch the table at all.
-- Without these grants, Postgres returns 403 before evaluating
-- any RLS policy.
-- ══════════════════════════════════════════════════════════════
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- ── Missing FK: payments → courses ───────────────────────────
-- Without this, PostgREST rejects courses(name) joins on payments with 400.
ALTER TABLE public.payments
  ADD CONSTRAINT payments_course_id_fkey
  FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE SET NULL;
