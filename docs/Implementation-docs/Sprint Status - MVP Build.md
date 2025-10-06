# ARC MVP Sprint Status (as of 2025-08-24)

This doc captures the current implementation and remaining items for this sprint. It’s a living checklist. See also “MVP Completion Plan.md” for the full pre-polish task list and acceptance criteria.

## Backend

- Done:

  - Express app with security middlewares, CORS, logging, rate limiting, /health.
  - Mongo models: User, RcPassage, Attempt, Feedback.
  - Auth (JWT): register, login, me, update, change-password; dev seed admin.
  - RCs: /today, /archive, /:id (answers hidden); IST scheduling.
  - Attempts: submit (scores + streak), save progress, get analysis (now returns attemptId), save analysis feedback.
  - Feedback: POST /feedback (upsert by user + date), GET /feedback/today (status).
  - Scripts: seed-admin, seed-rcs (two RCs for today).

- Pending/Next:
  - Forgot/reset password flows.
  - Rate limit tune + production CORS allowlist.
  - Validation (zod) on payloads and consistent error shapes.
  - Admin: more robust scheduling validation/warnings.

## Frontend

- Done:

  - Vite + Tailwind (CJS configs) + design tokens. Core UI: Button, Card, Input, Badge, Modal, Icon.
  - Auth pages: Login, Register, Forgot, Reset (skeleton), Change Password (new).
  - Admin: Login, Dashboard (list), RC Form (CRUD).
  - User: Landing (static, content-driven), Dashboard (today), Test (timer, answer select, mark-for-review, autosave local; practice and admin preview modes), Results (score, accuracy, time, topic tags, streak), Analysis (per-question breakdown), Feedback page (new), About & Terms (static content JSON).
  - Axios client with Authorization header from localStorage.
  - Admin: Schedule overview (visual day grouping, warning when != 2), Preview buttons on RC cards.
  - Design tokens: disabled states and color tokens; score coloring (4/4 green, 3/4 amber) applied on Results.
  - Fonts wired: Poppins (UI) + Inter (passage serif body) via Google Fonts; Tailwind screens sm/md/lg/xl.

- Pending/Next:
  - Dashboard: deeper empty/missing-content states and skeleton loaders.
  - Test: server-side progress PATCH (client autosave exists).
  - Results: optional share CTA.
  - Analysis: broader a11y and keyboard focus traps.
  - Global polish pass on spacing/typography, skeletons.

## QA & Tooling

- Done:

  - Local runs validated (api + web), flows work end-to-end with seeded data.

- Pending/Next:
  - Lint/format (ESLint/Prettier) and a few unit tests around scoring + date logic.
  - Minimal e2e smoke via Playwright or Cypress for Dashboard → Test → Results → Analysis.

## Notes

- Environment:

  - API: http://localhost:4000/api/v1
  - Web: http://localhost:5173
  - CORS origin: http://localhost:5173
  - Token: localStorage key `arc_token`

- Seeding:
  - Admin: POST /api/v1/auth/dev/seed-admin or run script.
  - RCs: node server/scripts/seed-rcs.js

## Screen Coverage vs Foundational Blueprints

- Architectural Blueprints.md

  - Disabled States: Implemented in Button (disabled:bg-neutral-grey, opacity-50).
  - Result Score Coloring: Applied in Results.jsx (4/4 green, 3/4 amber).
  - Tablet Responsiveness: Tailwind screens sm/md/lg/xl configured.
  - Font Usage: Poppins for UI, Inter for body/passage; loaded in index.html; used via Tailwind font families.
  - Streak Definition: Enforced by backend attempt submit; surfaced on Results/Dashboard.
  - Admin Preview Flow: Preview links route to /test/:id?mode=preview, timer hidden, no save.
  - Static Content Management: static.json drives Landing, About, Terms.
  - Scheduling Enforcement: Admin Schedule view warns when day count != 2.

- End-to-End User Flows & Screen Blueprint.md

  - Landing, Auth, Dashboard, Test, Results, Analysis, Feedback, Archive, Profile, Admin Console all present; minor polish pending as noted.

- Foundational Blueprint.md / Core Mission
  - Deep Focus theme colors applied; toasts and a11y being iterated.

### Per-screen polish summary

- Landing (Architectural Blueprints: Static Content Management)
  - Content-driven hero; links to About/Terms; responsive tiles.
- About/Terms (Architectural Blueprints: Static Content Management)
  - Served from single static.json; typography and spacing aligned.
- Dashboard (End-to-End Blueprint: Daily Feedback, Missing Content State)
  - Skeletons for loading; banner gating feedback; missing-content friendly message.
- Test (Test Screen Blueprint; Admin Preview Flow)
  - Practice mode shows correctness/explanations; preview mode hides timer and prevents save.
- Results (Results Screen Blueprint)
  - Score color rules applied; accuracy/time/streak/topics shown; primary CTA to Analysis.
- Analysis (Analysis Screen Blueprint)
  - Skeletons, error banners; per-question feedback with toasts.
- Feedback (Feedback Screen Blueprint)
  - Submit disabled until ratings selected; error banner; one-click return to dashboard.
- Archive
  - Skeletons; helpful empty state; practice CTA per item.
- Admin Dashboard + Schedule (Architectural Blueprints: Scheduling Enforcement, Admin Preview)
  - Schedule overview with day grouping and ⚠ warnings for ≠ 2; preview/edit actions.
