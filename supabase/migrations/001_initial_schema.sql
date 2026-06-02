-- ============================================================
-- Secquiz — Nigeria's Cybersecurity Learning Academy
-- Supabase Schema v2.0
--
-- Roles:     learner | super-admin  (no instructor role)
-- Enrolment: pay via Paystack → auto-approved → course access
-- Mentorship: WhatsApp link (no in-app drop/appeal system)
--
-- Run in Supabase SQL Editor or:  supabase db push
-- ============================================================

create extension if not exists "uuid-ossp";

-- ──────────────────────────────────────────────────────────────
-- profiles
-- ──────────────────────────────────────────────────────────────
create table if not exists profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  first_name   text,
  last_name    text,
  role         text not null default 'learner'
                 check (role in ('learner', 'super-admin')),
  status       text not null default 'active'
                 check (status in ('active', 'inactive', 'suspended')),
  avatar       text,
  bio          text,
  title        text,
  phone_number text,
  location     text,
  social_links jsonb,
  learner_details jsonb,    -- { learningGoals, interests, education, occupation }
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- Auto-create profile when a new auth user registers
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, first_name, last_name, role)
  values (
    new.id,
    new.raw_user_meta_data->>'firstName',
    new.raw_user_meta_data->>'lastName',
    coalesce(new.raw_user_meta_data->>'role', 'learner')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ──────────────────────────────────────────────────────────────
-- payment_plans  (the tiers available for purchase)
-- ──────────────────────────────────────────────────────────────
create table if not exists payment_plans (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null unique,        -- e.g. 'Starter', 'Pro', 'Elite'
  slug          text not null unique,        -- e.g. 'starter', 'pro', 'elite'
  amount_kobo   int  not null,               -- price in kobo (₦1 = 100 kobo)
  billing_cycle text not null default 'one-time'
                  check (billing_cycle in ('one-time', 'monthly', 'quarterly', 'annual')),
  course_limit  int  not null default 1,     -- max courses accessible (-1 = unlimited)
  features      jsonb,                       -- array of feature strings for UI display
  is_active     boolean default true,
  sort_order    int  default 0,
  created_at    timestamptz default now()
);

-- ──────────────────────────────────────────────────────────────
-- payments  (Paystack transaction records)
-- ──────────────────────────────────────────────────────────────
create table if not exists payments (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references profiles(id) on delete cascade,
  plan_id             uuid references payment_plans(id),
  course_id           uuid,                  -- null if plan covers all courses
  paystack_reference  text unique not null,  -- Paystack transaction reference
  paystack_status     text not null default 'pending'
                        check (paystack_status in ('pending','success','failed','abandoned')),
  amount_kobo         int  not null,
  currency            text not null default 'NGN',
  paid_at             timestamptz,
  metadata            jsonb,                 -- raw Paystack webhook payload
  created_at          timestamptz default now()
);

-- ──────────────────────────────────────────────────────────────
-- courses
-- ──────────────────────────────────────────────────────────────
create table if not exists courses (
  id           uuid primary key default uuid_generate_v4(),
  name         text not null,
  description  text,
  thumbnail    text,
  duration     int,           -- estimated hours
  level        text default 'beginner'
                 check (level in ('beginner', 'intermediate', 'advanced')),
  is_public    boolean default true,   -- visible in public catalogue
  is_published boolean default false,  -- false = draft
  price_kobo   int  default 0,         -- 0 = free; used for per-course purchases
  created_by   uuid references profiles(id),
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- ──────────────────────────────────────────────────────────────
-- modules
-- ──────────────────────────────────────────────────────────────
create table if not exists modules (
  id          uuid primary key default uuid_generate_v4(),
  course_id   uuid not null references courses(id) on delete cascade,
  name        text not null,
  description text,
  duration    int,
  sort_order  int default 0,
  created_at  timestamptz default now()
);

-- ──────────────────────────────────────────────────────────────
-- lessons
-- ──────────────────────────────────────────────────────────────
create table if not exists lessons (
  id          uuid primary key default uuid_generate_v4(),
  module_id   uuid not null references modules(id) on delete cascade,
  name        text not null,
  content     text,
  video_url   text,
  duration    int,      -- minutes
  sort_order  int default 0,
  assignment  jsonb,    -- { title, prompt, maxScore }
  quiz        jsonb,    -- [{ question, options[], correctIndex, explanation }]
  created_at  timestamptz default now()
);

-- ──────────────────────────────────────────────────────────────
-- enrolments  (replaces applications — payment triggers auto-approval)
-- ──────────────────────────────────────────────────────────────
create table if not exists enrolments (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references profiles(id) on delete cascade,
  course_id       uuid not null references courses(id) on delete cascade,
  payment_id      uuid references payments(id),   -- null = free course
  plan_id         uuid references payment_plans(id),
  status          text not null default 'active'
                    check (status in ('active', 'suspended', 'completed')),
  enrolled_at     timestamptz default now(),
  completed_at    timestamptz,
  unique (user_id, course_id)
);

-- ──────────────────────────────────────────────────────────────
-- learner_progress
-- ──────────────────────────────────────────────────────────────
create table if not exists learner_progress (
  id                    uuid primary key default uuid_generate_v4(),
  learner_id            uuid not null references profiles(id) on delete cascade,
  course_id             uuid not null references courses(id) on delete cascade,
  completed_lessons     uuid[] default '{}',
  current_score         numeric default 0,
  learning_hours_total  numeric default 0,
  last_activity_date    timestamptz,
  last_lesson_id        uuid references lessons(id),
  module_progress       jsonb default '[]',  -- [{ moduleId, score, completedLessons }]
  updated_at            timestamptz default now(),
  unique (learner_id, course_id)
);

-- ──────────────────────────────────────────────────────────────
-- submissions  (assignment responses)
-- ──────────────────────────────────────────────────────────────
create table if not exists submissions (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references profiles(id) on delete cascade,
  lesson_id   uuid not null references lessons(id) on delete cascade,
  course_id   uuid references courses(id),
  content     text not null,
  grade       numeric,
  feedback    text,
  graded_by   uuid references profiles(id),
  graded_at   timestamptz,
  created_at  timestamptz default now()
);

-- ──────────────────────────────────────────────────────────────
-- quiz_results  (auto-graded quiz attempts)
-- ──────────────────────────────────────────────────────────────
create table if not exists quiz_results (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references profiles(id) on delete cascade,
  lesson_id   uuid not null references lessons(id) on delete cascade,
  score       numeric not null,
  max_score   numeric not null,
  answers     jsonb,   -- [{ questionIndex, selectedOption, correct }]
  attempt_no  int default 1,
  submitted_at timestamptz default now()
);

-- ──────────────────────────────────────────────────────────────
-- notifications
-- ──────────────────────────────────────────────────────────────
create table if not exists notifications (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references profiles(id) on delete cascade,
  title      text not null,
  message    text,
  type       text default 'info'
               check (type in ('info', 'success', 'warning', 'payment')),
  is_read    boolean default false,
  action_url text,    -- optional deep-link
  created_at timestamptz default now()
);

-- ──────────────────────────────────────────────────────────────
-- tasks  (personal learning tasks per learner)
-- ──────────────────────────────────────────────────────────────
create table if not exists tasks (
  id          uuid primary key default uuid_generate_v4(),
  learner_id  uuid not null references profiles(id) on delete cascade,
  lesson_id   uuid references lessons(id),
  course_id   uuid references courses(id),
  title       text not null,
  description text,
  due_date    timestamptz,
  status      text default 'pending'
                check (status in ('pending','in-progress','completed')),
  created_at  timestamptz default now()
);

-- ──────────────────────────────────────────────────────────────
-- mentorship_requests  (WhatsApp click-to-chat log — optional)
-- Records when a learner taps the mentorship button so super-admin
-- can see demand even before WhatsApp is opened.
-- ──────────────────────────────────────────────────────────────
create table if not exists mentorship_requests (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references profiles(id) on delete cascade,
  course_id   uuid references courses(id),
  message     text,    -- pre-filled WhatsApp message shown to learner
  clicked_at  timestamptz default now()
);

-- ──────────────────────────────────────────────────────────────
-- audit_logs  (append-only, super-admin only)
-- ──────────────────────────────────────────────────────────────
create table if not exists audit_logs (
  id             uuid primary key default uuid_generate_v4(),
  actor_id       uuid references profiles(id),
  action         text not null,
  target_user_id uuid references profiles(id),
  target_id      uuid,          -- generic — course, enrolment, payment etc.
  target_type    text,          -- 'course' | 'enrolment' | 'payment' | 'profile'
  details        jsonb,
  created_at     timestamptz default now()
);

-- ──────────────────────────────────────────────────────────────
-- Seed default payment plans
-- ──────────────────────────────────────────────────────────────
insert into payment_plans (name, slug, amount_kobo, billing_cycle, course_limit, features, sort_order)
values
  (
    'Starter',
    'starter',
    1500000,   -- ₦15,000
    'one-time',
    1,
    '["Access to 1 course","Self-paced learning","Quiz & assignments","WhatsApp mentorship","Certificate on completion"]',
    1
  ),
  (
    'Pro',
    'pro',
    3500000,   -- ₦35,000
    'one-time',
    3,
    '["Access to 3 courses","Self-paced learning","Quiz & assignments","Priority WhatsApp mentorship","All certificates","Progress analytics"]',
    2
  ),
  (
    'Elite',
    'elite',
    6000000,   -- ₦60,000
    'one-time',
    -1,
    '["Unlimited course access","Self-paced learning","Quiz & assignments","1-on-1 WhatsApp mentorship","All certificates","Priority support","Exclusive new releases"]',
    3
  )
on conflict (slug) do nothing;

-- ──────────────────────────────────────────────────────────────
-- Row Level Security
-- ──────────────────────────────────────────────────────────────
alter table profiles            enable row level security;
alter table payment_plans       enable row level security;
alter table payments            enable row level security;
alter table courses             enable row level security;
alter table modules             enable row level security;
alter table lessons             enable row level security;
alter table enrolments          enable row level security;
alter table learner_progress    enable row level security;
alter table submissions         enable row level security;
alter table quiz_results        enable row level security;
alter table notifications       enable row level security;
alter table tasks               enable row level security;
alter table mentorship_requests enable row level security;
alter table audit_logs          enable row level security;

-- ── profiles ──────────────────────────────────────────────────
create policy "Users read own profile"
  on profiles for select using (auth.uid() = id);

create policy "Super-admins read all profiles"
  on profiles for select
  using ((select role from profiles where id = auth.uid()) = 'super-admin');

create policy "Users update own profile"
  on profiles for update using (auth.uid() = id);

create policy "Super-admins update any profile"
  on profiles for update
  using ((select role from profiles where id = auth.uid()) = 'super-admin');

-- ── payment_plans ─────────────────────────────────────────────
create policy "Anyone can view active plans"
  on payment_plans for select using (is_active = true);

create policy "Super-admins manage plans"
  on payment_plans for all
  using ((select role from profiles where id = auth.uid()) = 'super-admin');

-- ── payments ──────────────────────────────────────────────────
create policy "Users read own payments"
  on payments for select using (auth.uid() = user_id);

create policy "Super-admins read all payments"
  on payments for select
  using ((select role from profiles where id = auth.uid()) = 'super-admin');

-- ── courses ───────────────────────────────────────────────────
create policy "Public courses visible to all"
  on courses for select using (is_public = true and is_published = true);

create policy "Enrolled learners can view their courses"
  on courses for select
  using (exists (
    select 1 from enrolments e
    where e.course_id = courses.id
      and e.user_id = auth.uid()
      and e.status = 'active'
  ));

create policy "Super-admins manage all courses"
  on courses for all
  using ((select role from profiles where id = auth.uid()) = 'super-admin');

-- ── modules ───────────────────────────────────────────────────
create policy "Enrolled learners view modules"
  on modules for select
  using (exists (
    select 1 from enrolments e
    where e.course_id = modules.course_id
      and e.user_id = auth.uid()
      and e.status = 'active'
  ));

create policy "Super-admins manage modules"
  on modules for all
  using ((select role from profiles where id = auth.uid()) = 'super-admin');

-- ── lessons ───────────────────────────────────────────────────
create policy "Enrolled learners view lessons"
  on lessons for select
  using (exists (
    select 1 from enrolments e
    join modules m on m.course_id = e.course_id
    where m.id = lessons.module_id
      and e.user_id = auth.uid()
      and e.status = 'active'
  ));

create policy "Super-admins manage lessons"
  on lessons for all
  using ((select role from profiles where id = auth.uid()) = 'super-admin');

-- ── enrolments ────────────────────────────────────────────────
create policy "Learners read own enrolments"
  on enrolments for select using (auth.uid() = user_id);

create policy "Super-admins read all enrolments"
  on enrolments for select
  using ((select role from profiles where id = auth.uid()) = 'super-admin');

create policy "Super-admins manage enrolments"
  on enrolments for all
  using ((select role from profiles where id = auth.uid()) = 'super-admin');

-- ── learner_progress ──────────────────────────────────────────
create policy "Learners read own progress"
  on learner_progress for select using (auth.uid() = learner_id);

create policy "Learners update own progress"
  on learner_progress for update using (auth.uid() = learner_id);

create policy "Learners insert own progress"
  on learner_progress for insert with check (auth.uid() = learner_id);

create policy "Super-admins read all progress"
  on learner_progress for select
  using ((select role from profiles where id = auth.uid()) = 'super-admin');

-- ── submissions ───────────────────────────────────────────────
create policy "Learners manage own submissions"
  on submissions for all using (auth.uid() = user_id);

create policy "Super-admins manage all submissions"
  on submissions for all
  using ((select role from profiles where id = auth.uid()) = 'super-admin');

-- ── quiz_results ──────────────────────────────────────────────
create policy "Learners manage own quiz results"
  on quiz_results for all using (auth.uid() = user_id);

create policy "Super-admins read all quiz results"
  on quiz_results for select
  using ((select role from profiles where id = auth.uid()) = 'super-admin');

-- ── notifications ─────────────────────────────────────────────
create policy "Users read own notifications"
  on notifications for select using (auth.uid() = user_id);

create policy "Users mark own notifications read"
  on notifications for update using (auth.uid() = user_id);

create policy "Super-admins manage all notifications"
  on notifications for all
  using ((select role from profiles where id = auth.uid()) = 'super-admin');

-- ── tasks ─────────────────────────────────────────────────────
create policy "Learners manage own tasks"
  on tasks for all using (auth.uid() = learner_id);

create policy "Super-admins manage all tasks"
  on tasks for all
  using ((select role from profiles where id = auth.uid()) = 'super-admin');

-- ── mentorship_requests ───────────────────────────────────────
create policy "Learners insert own mentorship requests"
  on mentorship_requests for insert with check (auth.uid() = user_id);

create policy "Learners read own mentorship requests"
  on mentorship_requests for select using (auth.uid() = user_id);

create policy "Super-admins read all mentorship requests"
  on mentorship_requests for select
  using ((select role from profiles where id = auth.uid()) = 'super-admin');

-- ── audit_logs ────────────────────────────────────────────────
create policy "Super-admins read audit logs"
  on audit_logs for select
  using ((select role from profiles where id = auth.uid()) = 'super-admin');
