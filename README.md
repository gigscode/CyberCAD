<div align="center">

# 🛡️ Secquiz

### Nigeria's Cybersecurity Learning Academy

**Learn at your pace. Master the skills that get you hired.**

Secquiz is a self-paced online cybersecurity academy built for Nigerians transitioning into
cybersecurity careers. Learners pay once, get instant access, and study on their own schedule
— no deadlines, no instructors, no group pressure. Expert content managed by super-admins.
Personalised mentorship available on demand via WhatsApp.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase)](https://supabase.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38BDF8?logo=tailwindcss)](https://tailwindcss.com)
[![Paystack](https://img.shields.io/badge/Payments-Paystack-00C3F7?logo=paystack)](https://paystack.com)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?logo=vercel)](https://vercel.com)

</div>

---

## 📖 Table of Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Key Features](#key-features)
- [Pricing Tiers](#pricing-tiers)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [User Roles](#user-roles)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## Overview

Secquiz is a full-stack LMS purpose-built for cybersecurity education in Nigeria. The model is
simple: a learner pays via Paystack, gets automatically enrolled in their chosen course, and
starts learning immediately — fully at their own pace.

There are no instructors, no cohort schedules, no drop mechanisms, and no appeals. Content is
created and managed entirely by super-admins. When a learner needs human guidance, they tap a
**WhatsApp button** to request personalised mentorship directly.

**Target roles after completing Secquiz courses:**
Security Analyst · SOC Analyst · Penetration Tester · Network Security Engineer ·
Digital Forensics Specialist · Cloud Security Engineer

---

## How It Works

```
Learner registers
      │
      └── Browses public course catalogue
                │
                └── Selects a plan (Starter / Pro / Elite)
                          │
                          └── Pays via Paystack
                                    │
                          Payment webhook → auto-enrolment created
                                    │
                          Instant access to course curriculum
                                    │
                    ┌───────────────────────────────────┐
                    │  Self-paced learning              │
                    │  Module → Lesson → Quiz           │
                    │  Submit assignments               │
                    │  Track personal progress          │
                    └───────────────────────────────────┘
                                    │
                    Need help? → Tap WhatsApp Mentorship button
                                    │
                          Direct chat with Secquiz team
```

---

## Key Features

### 🎓 For Learners
| Feature | Description |
|---|---|
| **Instant access on payment** | Paystack webhook auto-creates enrolment — no admin approval wait |
| **Fully self-paced** | No deadlines, no schedules, no peers to keep up with |
| **Structured curriculum** | Course → Module → Lesson with video and rich text content |
| **Interactive quizzes** | Auto-graded with instant scores and per-question explanations |
| **Assignment submissions** | Submit written work; graded by super-admin with written feedback |
| **Progress dashboard** | Personal score trend charts, study hours, streaks, badges |
| **Grades & review** | Full grade history and module-by-module breakdown |
| **WhatsApp mentorship** | One-tap button opens a pre-filled WhatsApp chat for personalised help |
| **Notifications** | In-app alerts for payment confirmation, grade updates, new content |
| **Tasks** | Personal task list linked to lessons |
| **Learner profile** | Avatar, bio, learning goals, education, social links |

### 🔐 For Super-Admins
| Feature | Description |
|---|---|
| **Full course management** | Create, edit, publish/unpublish courses with modules and lessons |
| **AI quiz generation** | Generate quiz questions from lesson title and difficulty |
| **Payment dashboard** | View all transactions, amounts, and payment statuses |
| **Enrolment management** | View and manage all active enrolments |
| **Assignment grading** | Review and grade learner submissions with feedback |
| **User management** | View all learners, their status and progress |
| **Mentorship requests** | See all WhatsApp mentorship button clicks with context |
| **Notifications management** | Send in-app notifications to learners |
| **Audit logs** | Immutable record of all platform actions |
| **Payment plan management** | Create and edit pricing tiers |

---

## Pricing Tiers

Three one-time payment tiers. Learner pays → Paystack confirms → auto-enrolled instantly.

| Plan | Price | Courses | Key Features |
|---|---|---|---|
| **Starter** | ₦15,000 | 1 course | Full course access, quizzes, assignments, WhatsApp mentorship, certificate |
| **Pro** | ₦35,000 | 3 courses | Everything in Starter + priority WhatsApp mentorship + progress analytics |
| **Elite** | ₦60,000 | Unlimited | Everything in Pro + 1-on-1 WhatsApp sessions + exclusive new releases |

> Prices are stored in kobo in the database (₦1 = 100 kobo) and can be updated by a super-admin
> without a code deploy.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5 |
| **Backend / Database** | Supabase (PostgreSQL + Auth + Storage) |
| **Payments** | Paystack (inline popup + webhooks) |
| **Styling** | Tailwind CSS v4 |
| **UI Components** | shadcn/ui (Radix UI primitives) |
| **Forms** | React Hook Form + Zod |
| **Charts** | Recharts |
| **Rich Text** | React Quill New |
| **Image Uploads** | Cloudinary (via next-cloudinary) |
| **Notifications** | Sonner (toast) |
| **Analytics** | Vercel Analytics |
| **Deployment** | Vercel |
| **Icons** | Lucide React |

---

## Project Structure

```
secquiz/
├── app/
│   ├── api/
│   │   ├── ai/generate-quiz/          # AI quiz generation
│   │   ├── payments/
│   │   │   ├── initialize/            # Create Paystack transaction
│   │   │   └── webhook/               # Paystack webhook → auto-enrolment
│   │   ├── courses/                   # Course CRUD (super-admin)
│   │   └── mentorship/                # Log WhatsApp button clicks
│   │
│   ├── admin/                         # Super-admin portal
│   │   ├── courses/
│   │   ├── users/
│   │   ├── payments/
│   │   ├── enrolments/
│   │   ├── submissions/
│   │   ├── mentorship/
│   │   └── audit-logs/
│   │
│   ├── dashboard/                     # Learner portal
│   │   ├── courses/
│   │   ├── progress/
│   │   ├── grades/
│   │   ├── submissions/
│   │   ├── tasks/
│   │   ├── notifications/
│   │   └── profile/
│   │
│   ├── pricing/                       # Public pricing page
│   ├── login/
│   ├── register/
│   └── page.tsx                       # Public landing page
│
├── components/
│   ├── ui/                            # shadcn/ui base components
│   ├── dashboard/                     # Learner dashboard widgets
│   ├── course/                        # Curriculum view, quiz player
│   ├── payments/                      # Paystack payment modal
│   └── shared/                        # Rich text renderer, WhatsApp button
│
├── lib/
│   ├── api.ts                         # Supabase API client
│   ├── auth-context.tsx               # Supabase Auth context
│   ├── paystack.ts                    # Paystack helpers
│   ├── whatsapp.ts                    # WhatsApp link builder
│   └── supabase/
│       ├── client.ts
│       ├── server.ts
│       └── middleware.ts
│
├── supabase/migrations/
│   └── 001_initial_schema.sql         # Full schema with RLS + seed plans
│
├── middleware.ts
├── .env.local.example
└── next.config.mjs
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- [Supabase](https://supabase.com) project
- [Paystack](https://paystack.com) account (test keys for development)
- [Cloudinary](https://cloudinary.com) account

```bash
git clone https://github.com/your-org/secquiz.git
cd secquiz
npm install
cp .env.local.example .env.local
# Fill in .env.local then:
npm run dev
```

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Paystack
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxx
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxx

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-upload-preset

# WhatsApp mentorship number (international format, no +)
NEXT_PUBLIC_WHATSAPP_NUMBER=2348012345678
```

> Add all of these to **Vercel → Settings → Environment Variables** for production.
> Never commit `.env.local`.

---

## Database Setup

```bash
# Via Supabase Dashboard → SQL Editor → paste and run:
supabase/migrations/001_initial_schema.sql

# Or via CLI:
npx supabase db push
```

The migration creates all tables, RLS policies, the auto-profile trigger,
and seeds the three default payment plans (Starter / Pro / Elite).

### Tables

| Table | Purpose |
|---|---|
| `profiles` | User accounts — roles: `learner`, `super-admin` |
| `payment_plans` | Pricing tiers (seeded with Starter / Pro / Elite) |
| `payments` | Paystack transaction records |
| `courses` | Course catalogue |
| `modules` | Course sections |
| `lessons` | Lesson content + embedded quiz + assignment |
| `enrolments` | Active course access (auto-created on payment) |
| `learner_progress` | Per-learner progress, scores, last lesson |
| `submissions` | Assignment responses |
| `quiz_results` | Auto-graded quiz attempts |
| `notifications` | In-app alerts |
| `tasks` | Personal learning tasks |
| `mentorship_requests` | WhatsApp mentorship click log |
| `audit_logs` | Immutable admin action log |

---

## User Roles

| Role | Access | Description |
|---|---|---|
| `learner` | `/dashboard/*` | Self-paced students. Enrol via payment. |
| `super-admin` | `/admin/*` + `/dashboard/*` | Manages all content, users, payments, and platform settings. |

No instructor role. No cohorts visible to learners. No drop/appeal system.

---

## Deployment

1. Push to GitHub (`.env.local` is gitignored ✅)
2. Import at [vercel.com/new](https://vercel.com/new)
3. Add all env vars in Vercel settings
4. Set the **Paystack webhook URL** in your Paystack dashboard:
   `https://your-domain.com/api/payments/webhook`
5. Deploy

```bash
npm run build   # verify production build locally before pushing
```

---

## Contributing

1. `git checkout -b feat/your-feature`
2. Make changes and verify with `npm run build`
3. `git commit -m 'feat: describe change'`
4. Open a PR against `main`

---

<div align="center">

Built for Nigeria 🇳🇬 · Powered by Supabase · Payments by Paystack · Deployed on Vercel

*Empowering the next generation of Nigerian cybersecurity professionals.*

</div>
