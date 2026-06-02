# Product Requirements Document (PRD)

## Secquiz — Nigeria's Cybersecurity Learning Academy

**Version:** 2.0
**Status:** Active Development
**Last Updated:** June 2026
**Document Owner:** Product Team

> **v2.0 Changes from v1.1:**
> - No instructor role — super-admins manage everything
> - No drop recommendations, no appeals, no grace periods
> - Enrolment is payment-triggered and fully automatic
> - WhatsApp mentorship button added as the human-support channel
> - Paystack payment gateway integrated with three pricing tiers

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Goals & Success Metrics](#3-goals--success-metrics)
4. [Target Users & Personas](#4-target-users--personas)
5. [Market Context](#5-market-context)
6. [Product Overview](#6-product-overview)
7. [Payment Structure & Tiers](#7-payment-structure--tiers)
8. [Feature Requirements](#8-feature-requirements)
9. [User Stories](#9-user-stories)
10. [Non-Functional Requirements](#10-non-functional-requirements)
11. [Data Model Summary](#11-data-model-summary)
12. [Technical Architecture](#12-technical-architecture)
13. [Security & Compliance](#13-security--compliance)
14. [Out of Scope (v1.0)](#14-out-of-scope-v10)
15. [Release Milestones](#15-release-milestones)
16. [Open Questions & Risks](#16-open-questions--risks)

---

## 1. Executive Summary

**Secquiz** is a self-paced online cybersecurity academy built for the Nigerian market.
Learners browse courses, pay via Paystack, and get **instant, automatic access** — no
admin approval queue, no waiting. They study entirely at their own pace: no deadlines,
no cohort schedules, no group pressure.

The platform has two user types only:

- **Learner** — pays, learns, tracks personal progress, requests mentorship via WhatsApp
- **Super-admin** — creates and manages all content, views payments, grades assignments,
  handles the platform

There are no instructors, no drop recommendations, no appeals, and no grace periods.
When a learner needs human support, a prominent **WhatsApp button** opens a pre-filled
chat directly with the Secquiz team for personalised mentorship.


---

## 2. Problem Statement

### The Nigerian Cybersecurity Skills Gap

Nigeria's digital economy is expanding fast but the supply of trained cybersecurity
professionals is critically short. Key friction points for aspiring learners:

- International platforms (Coursera, Udemy, Cybrary) are not localised — wrong context,
  USD pricing, and no Nigerian career pathway guidance
- Physical bootcamps require quitting a job or relocating — unaffordable for most
- University programmes are too theoretical and too slow to adapt
- Self-study without structure leads to abandonment — no feedback, no next step
- No single affordable, Nigerian-context platform goes from zero to job-ready in cybersecurity

### The Learner's Core Problem

> *"I want to break into cybersecurity. I can't quit my job. I need to study evenings and
> weekends. I just need clear content, to know I'm progressing, and someone I can ask
> when I'm stuck."*

Secquiz solves this with:
- Structured, Nigerian-context cybersecurity content
- Fully self-paced — study anytime, resume anytime
- Instant access after a single Paystack payment
- WhatsApp mentorship for when you need a real person

---

## 3. Goals & Success Metrics

### Business Goals

| Goal | Metric | Target (12 months) |
|---|---|---|
| Become Nigeria's #1 cybersecurity academy | Search rank | Top 3 for "cybersecurity training Nigeria" |
| Grow paying learner base | Paid enrolments | 3,000 |
| Drive course completions | Completion rate | ≥ 60% |
| Achieve revenue | Monthly revenue | ₦5M/month by month 12 |
| Upsell learners to higher tiers | Upgrade rate | ≥ 25% Starter → Pro/Elite |

### Product Goals

| Goal | Metric |
|---|---|
| Frictionless payment-to-access | < 60 seconds from payment to course access |
| Keep learners progressing | ≥ 70% make progress in any given week |
| Quality outcomes | ≥ 70% completers score above 70% average |
| Platform reliability | 99.5% uptime |
| Mobile-first | ≥ 60% of sessions from mobile devices |

---

## 4. Target Users & Personas

### Persona 1 — Tunde, The Career Switcher
- **Age:** 28 · Lagos · Bank teller, BSc Business Administration
- **Goal:** Become a cybersecurity analyst within 12 months
- **Pain points:** No technical background; only 2–3 hrs/day; can't afford a bootcamp
- **Key needs:** Affordable one-time payment, self-paced flexibility, clear syllabus,
  someone to ask when stuck, certificate on completion

### Persona 2 — Amaka, The Recent Graduate
- **Age:** 23 · Abuja · BSc Computer Science, NYSC completed
- **Goal:** Hired as SOC analyst in 6 months
- **Pain points:** Degree too theoretical; needs practical, portfolio-ready work
- **Key needs:** Challenging quizzes, graded assignments with feedback, fast WhatsApp
  answers when she's deep in a topic

### Persona 3 — Chidi, The Super-Admin
- **Age:** 38 · Lagos · Cybersecurity professional, Secquiz platform manager
- **Goal:** Publish great content, ensure quality, track revenue and learner outcomes
- **Pain points:** Needs to manage everything without a large team
- **Key needs:** Efficient course builder with AI quiz help, payment dashboard, grading
  tools, ability to send notifications, audit trail

---

## 5. Market Context

| Platform | Strength | Gap vs. Secquiz |
|---|---|---|
| Coursera / edX | Brand, certifications | Not localised; expensive; no human support |
| Udemy | Large library, cheap | Passive only; no feedback; no Nigerian context |
| CyberSafe Foundation | Nigerian context | Limited breadth; no LMS infrastructure |
| ALX Africa | Community, structure | General tech, not cybersecurity-specific |
| Cybrary | Deep security content | USD pricing; US-centric; no mentorship |

**Secquiz's differentiator:** Nigerian-context cybersecurity curriculum + self-paced
access + instant payment-to-enrolment + real human mentorship on WhatsApp — in one product.

---

## 6. Product Overview

### Core Principles

| Principle | What it means in practice |
|---|---|
| **Pay once, learn forever** | One-time payment gives permanent access to enrolled courses |
| **Instant access** | Paystack webhook auto-creates enrolment — no human in the loop |
| **No deadlines** | Learner is never "late" or "behind"; progress is personal only |
| **No instructor role** | All content created and managed by super-admins |
| **No drop system** | Learners keep access as long as their plan is valid; nothing to appeal |
| **WhatsApp as the human layer** | One button → pre-filled WhatsApp message → direct mentorship |

### Content Hierarchy

```
Course  (published by super-admin)
  └── Module  (topic section, e.g. "Network Fundamentals")
        └── Lesson  (video + rich text + optional quiz + optional assignment)
```

Quiz and assignment are both optional per lesson. Quizzes are auto-graded. Assignments are
graded by the super-admin with a numeric score and written feedback.

### Enrolment Flow

```
Learner selects plan or course
  └── Paystack inline payment popup
        └── Payment confirmed
              └── Paystack webhook → POST /api/payments/webhook
                    └── Server verifies signature + creates enrolment record
                          └── Learner redirected to course curriculum
                                └── Notification: "Welcome! You're enrolled."
```

---

## 7. Payment Structure & Tiers

### Recommended Tier Design

Three one-time payment tiers targeting the full range of the Nigerian learner market.
Prices set at a level that is affordable vs. bootcamps (₦150k–₦500k) but signals quality
vs. free content.

| Tier | Price | Course Access | WhatsApp Support | Best For |
|---|---|---|---|---|
| **Starter** | ₦15,000 | 1 course | Standard (48hr response) | Beginners testing the platform |
| **Pro** | ₦35,000 | 3 courses | Priority (24hr response) | Serious career changers |
| **Elite** | ₦60,000 | All courses (unlimited) | 1-on-1 dedicated sessions | Fast-track professionals |

### Paystack Integration Design

| Concern | Approach |
|---|---|
| **Initialise payment** | Frontend calls `POST /api/payments/initialize` with plan/course; server creates Paystack transaction and returns `authorization_url` |
| **Payment popup** | Use Paystack Inline JS (`@paystack/inline-js`) — no redirect, better UX on mobile |
| **Verification** | Never trust the frontend. Always verify via Paystack webhook (`POST /api/payments/webhook`) using HMAC-SHA512 signature check |
| **Auto-enrolment** | Webhook handler: on `charge.success` → create `enrolments` row + `notifications` row atomically |
| **Idempotency** | Store `paystack_reference` as unique in `payments` table — duplicate webhooks are safe |
| **Currency** | Always store amounts in **kobo** (₦1 = 100 kobo) to avoid floating point errors |
| **Refunds** | Handled via Paystack dashboard by super-admin; platform suspends enrolment manually |

### Future Subscription Option (v1.2)
A monthly subscription tier (₦8,000/month, unlimited courses) can be added using
Paystack's subscription API without schema changes — `billing_cycle` field already supports
`'monthly'`.


---

## 8. Feature Requirements

### 8.1 Authentication

| ID | Requirement | Priority |
|---|---|---|
| AUTH-01 | Register with email + password; role defaults to `learner` | P0 |
| AUTH-02 | Login with email + password; Supabase cookie session | P0 |
| AUTH-03 | Role-based redirect: learner → `/dashboard`, super-admin → `/admin` | P0 |
| AUTH-04 | Session refresh via Next.js middleware on every request | P0 |
| AUTH-05 | Password reset via Supabase email magic link | P1 |
| AUTH-06 | Google OAuth login | P2 |

### 8.2 Public Landing & Pricing Pages

| ID | Requirement | Priority |
|---|---|---|
| LAND-01 | Public course catalogue searchable without login | P0 |
| LAND-02 | Hero section with Nigerian-audience self-paced value proposition | P0 |
| LAND-03 | Dedicated `/pricing` page showing all three tiers with feature lists | P0 |
| LAND-04 | "Enrol Now" CTA on each course card triggers payment flow | P0 |
| LAND-05 | Testimonials section | P1 |
| LAND-06 | Mobile-first responsive design | P0 |

### 8.3 Payment & Auto-Enrolment

| ID | Requirement | Priority |
|---|---|---|
| PAY-01 | Learner selects a plan or a specific course and initiates Paystack payment | P0 |
| PAY-02 | Paystack Inline popup (no full-page redirect) | P0 |
| PAY-03 | `POST /api/payments/initialize` creates Paystack transaction server-side | P0 |
| PAY-04 | `POST /api/payments/webhook` verifies HMAC-SHA512 signature | P0 |
| PAY-05 | On `charge.success`: create `payments` row + `enrolments` row atomically | P0 |
| PAY-06 | On successful enrolment: send in-app notification to learner | P0 |
| PAY-07 | Duplicate Paystack references are safely rejected (unique constraint) | P0 |
| PAY-08 | Learner can view their payment history and enrolment status | P1 |
| PAY-09 | Super-admin can view all payments with filters (date, plan, status) | P0 |
| PAY-10 | Failed/abandoned payments do NOT create enrolments | P0 |

### 8.4 Learner — Dashboard & Progress

| ID | Requirement | Priority |
|---|---|---|
| LEARN-01 | Dashboard shows enrolled courses, personal scores, streak, weekly hours | P0 |
| LEARN-02 | Weekly score trend chart (personal data, no comparison to others) | P1 |
| LEARN-03 | Activity feed: quiz results, grades received, new content notifications | P1 |
| LEARN-04 | Notifications panel: payment confirmation, grade alerts, new lessons | P1 |
| LEARN-05 | Task list: pending assignments and lesson checkpoints | P1 |
| LEARN-06 | Grades page: module-by-module score breakdown | P1 |
| LEARN-07 | No leaderboard, no peer comparison — all progress is personal only | P0 |

### 8.5 Learner — Course Navigation

| ID | Requirement | Priority |
|---|---|---|
| NAV-01 | Access course curriculum immediately after payment | P0 |
| NAV-02 | Module list → lesson list → lesson content navigation | P0 |
| NAV-03 | Video player embedded per lesson (URL-based, e.g. YouTube/Vimeo/Cloudinary) | P0 |
| NAV-04 | Rich text lesson body rendered with proper formatting | P0 |
| NAV-05 | Completed lessons marked visually in the curriculum | P0 |
| NAV-06 | Resume from last accessed lesson on return visit | P1 |
| NAV-07 | Lesson locked until previous lesson is completed (configurable per course) | P2 |

### 8.6 Learner — Quizzes

| ID | Requirement | Priority |
|---|---|---|
| QUIZ-01 | Multiple choice quiz embedded in lesson (optional per lesson) | P0 |
| QUIZ-02 | Auto-graded on submission; score shown immediately | P0 |
| QUIZ-03 | Per-question correct answer and explanation shown after submission | P0 |
| QUIZ-04 | Quiz scores stored in `quiz_results` and feed into overall course score | P1 |
| QUIZ-05 | Learner can retake quiz (latest score used) | P2 |

### 8.7 Learner — Assignments

| ID | Requirement | Priority |
|---|---|---|
| ASSIGN-01 | Learner submits text response to assignment prompt in a lesson | P0 |
| ASSIGN-02 | Submission status visible: submitted / graded / pending | P0 |
| ASSIGN-03 | Learner views super-admin grade (numeric) and written feedback | P0 |

### 8.8 Learner — WhatsApp Mentorship

| ID | Requirement | Priority |
|---|---|---|
| WA-01 | Prominent "Get Mentorship" button visible on learner dashboard and lesson pages | P0 |
| WA-02 | Button opens WhatsApp (web or app) with a pre-filled message including learner name, course name, and optional custom message | P0 |
| WA-03 | WhatsApp number configurable via environment variable (`NEXT_PUBLIC_WHATSAPP_NUMBER`) | P0 |
| WA-04 | Button click is logged to `mentorship_requests` table with user ID, course ID, and timestamp | P1 |
| WA-05 | Super-admin can view mentorship request log to understand demand patterns | P1 |
| WA-06 | Pro plan label: "Priority WhatsApp Mentorship"; Elite label: "1-on-1 WhatsApp Sessions" | P1 |

### 8.9 Learner — Profile

| ID | Requirement | Priority |
|---|---|---|
| PROF-01 | First name, last name, avatar, bio, title, location, phone | P0 |
| PROF-02 | Social links: LinkedIn, Twitter, GitHub, website | P1 |
| PROF-03 | Learning goals, interests, education, current occupation | P1 |
| PROF-04 | Avatar upload via Cloudinary | P1 |
| PROF-05 | Profile saved via Supabase upsert immediately | P0 |

### 8.10 Super-Admin — Content Management

| ID | Requirement | Priority |
|---|---|---|
| SA-01 | Create, edit, publish, and delete courses | P0 |
| SA-02 | Create, reorder, and delete modules within a course | P0 |
| SA-03 | Create lessons with title, video URL, rich text content, and duration | P0 |
| SA-04 | Attach a quiz (array of questions) to any lesson | P0 |
| SA-05 | Attach an assignment prompt to any lesson | P0 |
| SA-06 | AI quiz generation from lesson title + difficulty level | P1 |
| SA-07 | Publish / unpublish a course (draft mode) | P0 |
| SA-08 | Set course thumbnail, level (beginner/intermediate/advanced), duration | P0 |

### 8.11 Super-Admin — Learner & Enrolment Management

| ID | Requirement | Priority |
|---|---|---|
| SA-09 | View all learners with status, enrolment count, last activity | P0 |
| SA-10 | View individual learner progress per course (lessons, scores) | P0 |
| SA-11 | Grade assignment submissions with numeric score and written feedback | P0 |
| SA-12 | Suspend or reinstate a learner enrolment manually | P1 |
| SA-13 | Send in-app notification to a single learner or all learners | P1 |

### 8.12 Super-Admin — Payments & Plans

| ID | Requirement | Priority |
|---|---|---|
| SA-14 | View all payments with date, learner, plan, amount, and status filters | P0 |
| SA-15 | View total revenue, MRR, and enrolment counts on payment dashboard | P1 |
| SA-16 | Create, edit, and deactivate payment plans without a code deploy | P1 |
| SA-17 | View and manage payment plan features list (shown on pricing page) | P1 |

### 8.13 Super-Admin — Platform Operations

| ID | Requirement | Priority |
|---|---|---|
| SA-18 | View and filter audit logs (last 500 entries) | P0 |
| SA-19 | View mentorship request log with learner and course context | P1 |
| SA-20 | View platform health stats: enrolments, completions, active learners | P1 |


---

## 9. User Stories

### Learner

- As a learner, I want to browse the course catalogue without logging in so I can decide if
  Secquiz is right for me before creating an account.
- As a learner, I want to pay once via Paystack and get immediate access to my course so I
  don't have to wait for any admin approval.
- As a learner, I want to study lesson by lesson at my own pace with no deadlines so I can
  fit learning around work and family.
- As a learner, I want to take a quiz after each lesson and see my score immediately so I
  know whether I understood the material.
- As a learner, I want to submit an assignment and receive a grade and written feedback from
  the Secquiz team so I know exactly what to improve.
- As a learner, I want a dashboard showing my personal progress chart and study streak so
  I can stay motivated by seeing my own growth.
- As a learner, I want to tap a WhatsApp button on any lesson page so I can ask a real
  person a question when I'm stuck — without leaving the platform mentally.

### Super-Admin

- As a super-admin, I want to create a course with modules, lessons, quizzes, and assignments
  so I can deliver structured, professional content without any instructor involvement.
- As a super-admin, I want AI to generate quiz questions from a lesson title so I can build
  assessments quickly without writing every question manually.
- As a super-admin, I want to view all Paystack transactions with their status so I can
  monitor revenue and identify failed payments.
- As a super-admin, I want payment webhooks to auto-create enrolments so I never have to
  manually approve a learner after they pay.
- As a super-admin, I want to grade assignment submissions and add written feedback so
  learners receive personalised guidance on their work.
- As a super-admin, I want to see how many learners clicked the WhatsApp mentorship button
  so I can understand demand and plan mentor capacity.
- As a super-admin, I want to update pricing tier features without a code deploy so I can
  respond to market feedback quickly.

---

## 10. Non-Functional Requirements

### Performance
- Page load < 2 seconds on 4G in Nigeria
- Paystack webhook processed and enrolment created < 3 seconds end-to-end
- API responses < 500ms for standard read queries
- Dashboard queries run in parallel to avoid waterfall loading

### Reliability
- 99.5% uptime via Vercel + Supabase managed infrastructure
- Paystack webhook endpoint must be idempotent (safe to call multiple times)
- Enrolment creation is atomic — either both `payments` and `enrolments` rows are created,
  or neither is (use a Supabase RPC or transaction)

### Security
- Paystack webhook verified with HMAC-SHA512 using `PAYSTACK_SECRET_KEY` server-side
- `PAYSTACK_SECRET_KEY` never exposed to the browser (no `NEXT_PUBLIC_` prefix)
- Only `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` exposed to the browser for inline popup
- RLS enforced on all 14 tables — learners can never read other learners' data
- Service role key only in server-side API routes
- Secrets in Vercel environment variables, never committed to Git

### Accessibility
- WCAG 2.1 AA target for all learner-facing pages
- WhatsApp button meets colour contrast and keyboard accessibility requirements
- Radix UI primitives ensure keyboard-navigable modals and dropdowns

### Localisation
- Language: English (Nigerian English tone)
- Currency: Nigerian Naira (₦), stored in kobo
- Prices displayed as ₦X,000 (never "NGN")
- Date format: DD MMM YYYY
- Time zone: WAT (UTC+1)
- Phone format: +234

### Browser & Device Support
- Chrome, Firefox, Edge, Safari — latest 2 major versions
- iOS Safari 15+, Android Chrome
- Responsive from 375px to 2560px
- WhatsApp deep link opens the WhatsApp app on mobile, WhatsApp Web on desktop

---

## 11. Data Model Summary

```
auth.users  (Supabase managed)
    │
    └── profiles  (1:1 — auto-created on registration)
            │
            ├── payments            Paystack transaction records
            │     └── enrolments    auto-created on charge.success
            │
            ├── learner_progress    per course, scores + lesson state
            ├── submissions         assignment responses
            ├── quiz_results        auto-graded quiz attempts
            ├── notifications       in-app alerts
            ├── tasks               personal learning tasks
            └── mentorship_requests WhatsApp button click log

payment_plans   (seeded: Starter / Pro / Elite)
    └── payments  (many payments can reference a plan)

courses
    └── modules
            └── lessons  (contains quiz jsonb + assignment jsonb)
                    ├── submissions
                    └── quiz_results

audit_logs  (append-only, super-admin read only)
```

### Key Design Notes

| Decision | Reason |
|---|---|
| No `instructor_notes`, `drop_recommendations`, `appeals`, `grace_periods` | Removed. No instructor role. No drop system. |
| No `cohorts` table | Removed from learner experience. Intake is managed via payment plans. |
| `enrolments` replaces `applications` | No approval queue. Created automatically by webhook. |
| `quiz` stored as JSONB in `lessons` | Keeps quiz and lesson in one fetch; no separate quiz table needed. |
| `payments` stores kobo, not naira | Avoids floating point; aligns with Paystack's native unit. |
| `mentorship_requests` is a log, not a workflow | No status/resolution. Just a click counter with context for demand analysis. |
| `audit_logs` is append-only | RLS has no UPDATE or DELETE policy. |

---

## 12. Technical Architecture

```
┌──────────────────────────────────────────────────────┐
│                    Client Browser                    │
│   Next.js App Router · React 19 · TypeScript         │
│   Tailwind CSS · shadcn/ui · Recharts                │
│   Paystack Inline JS (@paystack/inline-js)           │
└──────────────────────┬───────────────────────────────┘
                       │  HTTPS
┌──────────────────────▼───────────────────────────────┐
│               Vercel Edge / Serverless               │
│  middleware.ts  ← session refresh on every request   │
│                                                      │
│  /api/payments/initialize  ← create Paystack txn     │
│  /api/payments/webhook     ← verify + auto-enrol     │
│  /api/ai/generate-quiz     ← AI question gen         │
│  /api/mentorship           ← log WhatsApp click      │
└──────────┬──────────────────────────┬────────────────┘
           │ anon key + RLS           │ service role key
┌──────────▼──────────────────────────▼────────────────┐
│                      Supabase                        │
│  Auth · PostgreSQL (PostgREST) · Storage             │
└──────────────────────────────────────────────────────┘
           │                          │
┌──────────▼──────────┐   ┌──────────▼──────────┐
│     Paystack        │   │     Cloudinary       │
│  Payments + webhooks│   │  Avatar / images     │
└─────────────────────┘   └─────────────────────┘
           │
┌──────────▼──────────┐
│     WhatsApp        │
│  wa.me deep link    │
└─────────────────────┘
```

### API Routes

| Route | Method | Auth | Purpose |
|---|---|---|---|
| `/api/payments/initialize` | POST | Learner session | Create Paystack transaction, return reference |
| `/api/payments/webhook` | POST | HMAC-SHA512 | Verify payment, create enrolment, send notification |
| `/api/ai/generate-quiz` | POST | Super-admin session | Generate quiz questions via AI provider |
| `/api/mentorship` | POST | Learner session | Log WhatsApp mentorship click |

---

## 13. Security & Compliance

### Paystack Webhook Security
```
1. Paystack sends POST /api/payments/webhook with X-Paystack-Signature header
2. Server computes HMAC-SHA512 of raw request body using PAYSTACK_SECRET_KEY
3. If signatures don't match → return 400, log attempt, do nothing
4. If event is not 'charge.success' → return 200, do nothing
5. Check payments table for existing reference (idempotency)
6. If new: create payments row + enrolments row in a single RPC call
7. Send notification to learner
8. Return 200
```

### RLS Policy Summary (v2.0)

| Table | Learner | Super-Admin |
|---|---|---|
| `profiles` | Read/update own | Read/update all |
| `payment_plans` | Read active plans | Full CRUD |
| `payments` | Read own | Read all |
| `courses` | Read published + enrolled | Full CRUD |
| `modules` | Read if enrolled | Full CRUD |
| `lessons` | Read if enrolled | Full CRUD |
| `enrolments` | Read own | Full CRUD |
| `learner_progress` | Read/write own | Read all |
| `submissions` | Read/write own | Read all + update grade |
| `quiz_results` | Read/write own | Read all |
| `notifications` | Read own, update own (mark read) | Full CRUD |
| `tasks` | Full CRUD own | Full CRUD |
| `mentorship_requests` | Insert + read own | Read all |
| `audit_logs` | None | Read only |

### NDPR Compliance
- User data hosted on Supabase (configurable region)
- No learner data sold or shared with third parties
- Payment data: only Paystack reference and amount stored — no card data (Paystack handles PCI)
- Cookie consent banner required before v1.0 public launch
- Data deletion request flow in v1.1

---

## 14. Out of Scope (v1.0)

| Feature | Target Version |
|---|---|
| Monthly subscription billing via Paystack Subscriptions API | v1.2 |
| Email notifications on payment / grade (Resend / SendGrid) | v1.1 |
| SMS alerts via Termii | v1.1 |
| Google OAuth login | v1.1 |
| Course completion certificate (PDF) | v1.1 |
| Learner community / discussion forum per course | v1.2 |
| Advanced admin analytics dashboard (revenue, cohort trends) | v1.2 |
| Learner referral programme with discount codes | v1.2 |
| Native mobile apps (iOS / Android) | v2.0 |
| Job board / employer matching | v2.0 |
| Multi-language support (Yoruba, Igbo, Hausa) | v2.0 |
| Quiz retake cooldown periods | v1.1 |
| Lesson-locking (sequential unlock) | v1.1 |
| Live video sessions with screen share | v2.0 |

---

## 15. Release Milestones

### v0.1 — Foundation ✅ Complete
- Next.js 16 + Supabase Auth + Tailwind + shadcn/ui
- Express.js + MongoDB removed; Supabase is the only backend
- Database schema v2.0 migrated (14 tables, RLS, seed payment plans)
- `.gitignore` hardened; Vercel deployment configured

### v0.5 — Core Learning ⬜ In Progress
- [ ] Public landing page + pricing page with live plan data
- [ ] Paystack Inline payment flow (initialize + webhook + auto-enrolment)
- [ ] Course curriculum navigation (module → lesson → quiz → assignment)
- [ ] Auto-graded quiz player with instant feedback
- [ ] Assignment submission UI
- [ ] Learner progress dashboard with score charts
- [ ] WhatsApp mentorship button on dashboard and lesson pages

### v1.0 — Production Launch ⬜
- [ ] Super-admin course builder with AI quiz generation
- [ ] Super-admin assignment grading UI
- [ ] Super-admin payment dashboard
- [ ] Super-admin user and enrolment management
- [ ] Audit logs viewer
- [ ] Mentorship request log
- [ ] In-app notification system
- [ ] NDPR privacy policy + cookie consent + terms of service
- [ ] Mobile-responsive across all pages (375px – 2560px)
- [ ] Paystack webhook hardened (signature verification, idempotency, atomic enrolment)
- [ ] Performance tested on simulated Nigerian 3G/4G
- [ ] Security review: RLS audited, webhook auth verified, secrets confirmed server-only

### v1.1 — Engagement & Retention ⬜
- [ ] Transactional emails: payment receipt, grade notification (Resend)
- [ ] SMS payment confirmation via Termii
- [ ] Course completion certificate (PDF via server-side rendering)
- [ ] Google OAuth login
- [ ] Automated inactivity notification (no activity in 14 days)
- [ ] Data deletion request flow (NDPR)

### v1.2 — Growth & Revenue ⬜
- [ ] Monthly subscription option via Paystack Subscriptions
- [ ] Discount / promo code support
- [ ] Learner referral programme
- [ ] Discussion forum per course
- [ ] Advanced revenue + learner analytics dashboard

---

## 16. Open Questions & Risks

### Open Questions

| # | Question | Owner | Status |
|---|---|---|---|
| 1 | Which AI provider for quiz generation? (OpenAI GPT-4o vs. Anthropic Claude) | Engineering | Open |
| 2 | Is the WhatsApp number one shared number or per-plan? (e.g. Elite gets a dedicated line) | Product | Open |
| 3 | What cybersecurity certs do v1.0 courses align to? (Security+, CEH, eJPT) | Curriculum | Open |
| 4 | Should lesson locking (sequential unlock) be on by default? | Product | Open |
| 5 | Paystack test vs. live keys — what is the go-live checklist? | Engineering | Open |
| 6 | What is the refund policy and who handles it — Paystack dashboard or in-platform? | Operations | Open |

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Paystack webhook delivery failure (timeout, 5xx) | Medium | High | Paystack retries for 72 hours; make webhook idempotent; add retry-safe processing |
| Video delivery slow on Nigerian 3G | High | High | Host on Cloudinary or YouTube CDN; provide text-only lesson fallback |
| Learner abandonment without deadline pressure | High | Medium | Streak tracking, in-app progress nudges, WhatsApp check-ins from admin |
| Supabase free tier limits hit (500MB DB, 50K MAU) | Medium | Medium | Monitor at 70% capacity; upgrade to Pro ($25/month) proactively |
| AI quiz quality too low for security content | Medium | Medium | Human review step before questions go live; manual fallback in v0.5 |
| Paystack `PAYSTACK_SECRET_KEY` accidentally exposed | Low | Critical | CI check for `NEXT_PUBLIC_PAYSTACK_SECRET`; key rotation if exposed |
| NDPR compliance gap at public launch | Low | High | Legal review before v1.0; cookie consent and deletion flow in v1.1 |

---

*This document is a living specification. Update after each milestone review and after user interviews.*

---

**Secquiz** · Built for Nigeria 🇳🇬 · Powered by Supabase · Payments by Paystack · Deployed on Vercel
