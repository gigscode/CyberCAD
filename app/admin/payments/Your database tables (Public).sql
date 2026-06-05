Your database tables (Public)
profiles
Columns: id (uuid), first_name (text), last_name (text), role (text default 'learner'), status (text default 'active'), avatar (text), bio (text), title (text), phone_number (text), location (text), social_links (jsonb), learner_details (jsonb), created_at (timestamptz default now()), updated_at (timestamptz default now())
payment_plans
Columns: id (uuid), name (text), slug (text), amount_kobo (int4), billing_cycle (text default 'one-time'), course_limit (int4 default 1), features (jsonb), is_active (bool default true), sort_order (int4 default 0), created_at (timestamptz default now())
payments
Columns: id (uuid), user_id (uuid), plan_id (uuid), course_id (uuid), paystack_reference (text), paystack_status (text default 'pending'), amount_kobo (int4), currency (text default 'NGN'), paid_at (timestamptz), metadata (jsonb), created_at (timestamptz default now())
courses
Columns: id (uuid), name (text), description (text), thumbnail (text), duration (int4), level (text default 'beginner'), is_public (bool default true), is_published (bool default false), price_kobo (int4 default 0), created_by (uuid), created_at (timestamptz default now()), updated_at (timestamptz default now())
modules
Columns: id (uuid), course_id (uuid), name (text), description (text), duration (int4), sort_order (int4 default 0), created_at (timestamptz default now())
lessons
Columns: id (uuid), module_id (uuid), name (text), content (text), video_url (text), duration (int4), sort_order (int4 default 0), assignment (jsonb), quiz (jsonb), created_at (timestamptz default now())
enrolments
Columns: id (uuid), user_id (uuid), course_id (uuid), payment_id (uuid), plan_id (uuid), status (text default 'active'), enrolled_at (timestamptz default now()), completed_at (timestamptz)
learner_progress
Columns: id (uuid), learner_id (uuid), course_id (uuid), completed_lessons (uuid[] default '{}'), current_score (numeric default 0), learning_hours_total (numeric default 0), last_activity_date (timestamptz), last_lesson_id (uuid), module_progress (jsonb default '[]'), updated_at (timestamptz default now())
submissions
Columns: id (uuid), user_id (uuid), lesson_id (uuid), course_id (uuid), content (text), grade (numeric), feedback (text), graded_by (uuid), graded_at (timestamptz), created_at (timestamptz default now())
quiz_results
Columns: id (uuid), user_id (uuid), lesson_id (uuid), score (numeric), max_score (numeric), answers (jsonb), attempt_no (int4 default 1), submitted_at (timestamptz default now())
notifications
Columns: id (uuid), user_id (uuid), title (text), message (text), type (text default 'info'), is_read (bool default false), action_url (text), created_at (timestamptz default now())
tasks
Columns: id (uuid), learner_id (uuid), lesson_id (uuid), course_id (uuid), title (text), description (text), due_date (timestamptz), status (text default 'pending'), created_at (timestamptz default now())
mentorship_requests
Columns: id (uuid), user_id (uuid), course_id (uuid), message (text), clicked_at (timestamptz default now())
audit_logs
Columns: id (uuid), actor_id (uuid), action (text), target_user_id (uuid), target_id (uuid), target_type (text), details (jsonb), created_at (timestamptz default now())
Your functions (copyable)
public.get_my_role() -> text
Function: get_my_role (no arguments)
public.handle_new_user() -> trigger
Function: handle_new_user (trigger)
public.rls_auto_enable() -> event_trigger
Function: rls_auto_enable (event trigger)
