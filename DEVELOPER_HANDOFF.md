# ARC Developer Handoff

Authoring Date: 2025-09-08
Scope: MVP (Daily RC delivery, Attempt/Analysis, Feedback Lock, Admin Scheduling, Analytics)

---

## 1. System Overview

ARC (Ace Reading Comprehension) is a MERN-stack MVP delivering daily Reading Comprehension passages (RCs) with official and practice attempt modes, feedback gating, streak tracking, and lightweight analytics.

### High-Level Architecture

- Client: React (Vite) + Tailwind; feature-based folders (`features/<domain>`). Auth via JWT stored as httpOnly cookie (also returned in body for flexibility).
- Server: Express API (ESM) + MongoDB (Mongoose). Business policies centralized in controllers + middleware.
- Core Cross-Cutting Concerns: IST day-boundary utilities, standardized error responses `{ error, errorCode }`, role-based auth, attempt policy, feedback lock, analytics derivation.

### Primary Domain Concepts

| Concept   | Summary                                                                                                           |
| --------- | ----------------------------------------------------------------------------------------------------------------- |
| User      | Learner or Admin; tracks `dailyStreak`, `lastActiveDate`                                                          |
| RcPassage | RC unit (4 questions fixed); lifecycle: draft → scheduled → live → archived                                       |
| Attempt   | User submission; unique per (user, rc, attemptType) for `official`; unlimited practice via distinct `attemptType` |
| Feedback  | Daily qualitative metrics gating continued progression                                                            |
| Analytics | Topic accuracy & 7‑day attempt trend                                                                              |

---

## 2. Local Development

### Prerequisites

- Node 18+
- MongoDB (local or Atlas). Ensure timezone consistency (UTC internally; IST logic handled in app layer).

### Setup (Backend)

1. Copy `server/.env.example` → `server/.env` (create if missing). Required keys:
   - `MONGODB_URI` (connection string)
   - `JWT_SECRET`
   - `PORT` (optional; default handled in code if present)
2. From `server/`: `npm install` then `npm run dev` (nodemon expected if configured).

### Setup (Frontend)

1. From `client/`: `npm install`
2. Run: `npm run dev`
3. Configure proxy (if needed) or ensure consistent API base (check any `api.js` base URL constant).

### Seeding Admin

Dev-only endpoint: `POST /auth/dev/seed-admin?email=admin@example.com&password=admin123` (disabled only logically by environment—remove for production hardening later).

---

## 3. Data Models (Mongo)

### User

`{ name, email(unique), password(hash), role('aspirant'|'admin'), dailyStreak, lastActiveDate }`
Indexes: email, (implicit \_id). Streak updated only on official attempt completion per IST day.

### RcPassage

`{ title, passageText, source?, topicTags[], status, scheduledDate, questions[4] }`
Questions embed `{ questionText, options[4:{id(A-D), text}], correctAnswerId, explanation }`.
Lifecycle: draft (incomplete) → scheduled (has `scheduledDate`) → live (optionally same day), archived (past or manually retired).

### Attempt

`{ userId, rcPassageId, answers[4], progress[4], score, attemptedAt, analysisFeedback[], attemptType('official'|'practice') }`
Compound unique index: (userId, rcPassageId, attemptType) ensures 1 official attempt; infinite practice (distinct record per practice attempt). (Note: If many practice attempts accumulate, consider alternative structure or TTL policies later.)

### Feedback

`{ userId, date (IST-normalized start), difficultyRating(1–5), explanationClarityRating(1–5), comment? }`
Unique index: (userId, date).

---

## 4. Endpoint Catalogue (MVP)

Format: METHOD path – purpose (Auth: A=auth required, Adm=admin only)

AUTH / USER

- POST `/auth/register` – Register user
- POST `/auth/login` – Authenticate and set cookie
- POST `/auth/forgot-password` – Stub (always ok)
- POST `/auth/reset-password` – Direct password reset (MVP simplified)
- POST/GET `/auth/dev/seed-admin` – Dev seeding (remove prod)
- GET `/users/me` (A)
- PATCH `/users/me` (A) – Update name
- POST `/users/me/change-password` (A)
- GET `/users/me/stats` (A) – Summary metrics (all attempts aggregated)
- GET `/users/me/analytics` (A) – Topic accuracy + 7-day trend (official-only in trend)

RC ACCESS

- GET `/rcs/today` (A) – Today's scheduled/live RCs with attempt state
- GET `/rcs/archive?page=&limit=` (A) – Paginated historical RCs
- GET `/rcs/:id` (A) – RC retrieval; query modes: `?mode=practice` or `?mode=preview` (admin-only preview) remove answers by default

ATTEMPTS

- POST `/attempts` (A) – Submit attempt `{ rcPassageId, answers[4], attemptType? }`; enforces: no early official attempts & feedback lock
- PATCH `/attempts/:id/progress` (A) – Interim save (progress only)
- GET `/attempts/analysis/:rcId` (A) – Full analysis with explanations
- PATCH `/attempts/:id/analysis-feedback` (A) – Per-question issue feedback

FEEDBACK

- POST `/feedback` (A) – Submit daily feedback
- GET `/feedback/today` (A) – Submission status
- GET `/feedback/lock-status` (A) – Whether user is locked until feedback

ADMIN

- GET `/admin/rcs` (Adm) – List/manage RC inventory
- POST `/admin/rcs` (Adm) – Create RC
- PUT `/admin/rcs/:id` (Adm) – Update RC (including scheduling / status transitions)
- DELETE `/admin/rcs/:id` (Adm) – Archive
- GET `/admin/rcs-monthly?year=&month=` (Adm) – Calendar counts (capacity status per day)

---

## 5. Core Business Rules

1. Exactly 4 questions per RC (schema-level validation).
2. Official attempt uniqueness per (user, rc); multiple practice attempts allowed (distinct attemptType).
3. Streak increments only when an official attempt is first completed for an IST day (not practice).
4. Feedback Lock: If all RCs from yesterday are officially attempted but daily feedback missing, further attempt submissions (POST /attempts) are blocked until feedback submitted.
5. Future Access: Users cannot access future RCs unless admin preview; cannot submit official attempt before scheduled date.
6. Analysis availability requires an attempt record; answers withheld during test mode, revealed only in analysis or practice mode.
7. Analytics trend counts only official attempts; topic accuracy aggregates each question’s correctness across attempts in last 30 days.
8. Date logic: All “day” semantics use IST normalization (`startOfIST`).

---

## 6. Date & Time Handling (IST Strategy)

Utility functions in `server/src/utils/date.js` define consistent boundaries. Persisted dates remain UTC in Mongo; computations convert to IST at boundaries. Do not store pre-shifted IST values—always store native Date and derive day start via `startOfIST` when querying or comparing.

Potential Enhancement: Pre-compute and store an `istDayKey` (string) on attempts & feedback for faster grouping; add index.

---

## 7. Attempt Lifecycle

1. User fetches RC (questions without answers for test mode).
2. During session user may PATCH progress.
3. Submission writes/upserts Attempt (per attemptType). Score computed server-side (never trust client). Null/blank answers normalized to ''.
4. Streak logic runs (official only).
5. User retrieves analysis (GET) with explanations + correctness breakdown.
6. Optional: user adds per-question feedback for explanations.

---

## 8. Feedback Lock Flow

1. At start of new day (IST), system checks if prior day RC set fully attempted.
2. If yes and no feedback document exists for prior day, `enforceFeedbackLock` forbids new attempt submissions.
3. Submitting feedback lifts lock immediately.

Edge Case: If zero RCs scheduled yesterday, lock never triggers (`no_yesterday_rcs`).

---

## 9. Analytics

Window: Last 30 days attempts (both attemptTypes loaded; trend filtered to official). Topic accuracy aggregates per-topic per-question correctness. Trend: attempts per IST day (7-day window). Future extension: Add percentile speed metrics and difficulty normalization.

---

## 10. Security Model

Layers:

- Auth: JWT (httpOnly cookie; also token in body). `authRequired` extracts & verifies via secret.
- Authorization: `requireRole('admin')` gating admin routes; preview mode restricted.
- Input Validation: Zod on sensitive controllers (auth, attempts, feedback). Some endpoints (e.g., admin updates) could benefit from additional schema validation.
- Error Handling: Uniform JSON shape via `errorHandler`.
  Hardening To-Do:

1. Add rate limiting globally (only applied to attempts currently) + login burst limiter.
2. Enforce HTTPS/secure cookies in production.
3. Remove dev seeding endpoints in prod build.
4. Add password complexity & breach list check.
5. Sanitize rich text fields (if future HTML content added).

---

## 11. Performance & Scalability Notes

Current Scale Assumptions: Low concurrency MVP.
Observations:

- Attempt & RC queries are id/index-based—O(1) / bounded results.
- Analytics does in-memory aggregation; fine for <10k attempt docs per user. If scaling, move to Mongo aggregation pipeline.
- Feedback lock logic performs multiple queries; consider single aggregation pipeline to reduce round trips.
  Indexes To Consider:
- `RcPassage.scheduledDate` (likely already indexed implicitly; ensure compound with status if frequent filtered sorts).
- `Attempt.rcPassageId` + `Attempt.userId` (partially covered by compound unique; still good).
- Add `Attempt.attemptedAt` index for analytics range queries.

---

## 12. Error Handling & Conventions

All non-200 responses: `{ error: string, errorCode: string|null }`. Helper constructors in `utils/http.js`. Client should branch on status code, not substrings.
Recommendation: Introduce enumerated `errorCode` constants for deterministic client UX flows (e.g., FEEDBACK_LOCKED, INVALID_CREDENTIALS).

---

## 13. Frontend Structure (Brief)

- `features/` segmented by domain (auth, dashboard, admin, test, results, etc.).
- Shared UI in `components/ui/` (Button, Modal, Toast, Skeleton, etc.).
- Auth context centralizes token and user state; redirect guards via `RequireAuth`.
- Toast/error pipeline standardized (Phase 2 unification completed).
  Opportunities:

1. Global design tokens file for color/spacing/typography centralization.
2. Add suspense/data fetching abstraction (React Query) for stale caching.
3. Snapshot tests for critical layout components.

---

## 14. Testing Strategy (Proposed Roadmap)

Current: Minimal unit tests (date & scoring logic placeholders).
Recommended Layers:

1. Unit: utils (date), attempt scoring, feedback lock evaluation.
2. Integration: Attempt submission (official vs practice), feedback lock release, analytics endpoint.
3. E2E (Playwright/Cypress): Auth, attempt flow, feedback lock scenario, admin scheduling.
4. Load (k6 or artillery): Burst of attempt submissions & daily analytics fetch.

Suggested Initial Test Matrix:
| Scenario | Type | Priority |
| -------- | ---- | -------- |
| Official attempt success | Integration | High |
| Duplicate official attempt blocked (upsert idempotent) | Integration | High |
| Practice attempt allowed after official | Integration | Medium |
| Feedback lock triggers after day rollover | Integration | High |
| Future RC blocked (non-admin) | Unit/Int | Medium |
| Streak increments correctly across gap day | Unit | Medium |

---

## 15. Observability & Operations

Current: Console logging only.
Short-Term Enhancements:

1. Add request logging (pino or morgan) with correlation id.
2. Structured error logging (level + stack) & retention.
3. Basic health endpoint `/health` (DB ping + uptime).
4. Metrics: Count attempts/day, feedback compliance rate (Prometheus or hosted APM).

---

## 16. Known Gaps / Open Risks

| Area                      | Risk                                 | Impact                       | Suggested Remediation                      |
| ------------------------- | ------------------------------------ | ---------------------------- | ------------------------------------------ |
| Stats Endpoint            | Counts practice attempts in accuracy | Skewed accuracy              | Filter `attemptType==='official'`          |
| Dev Seed Route            | Accessible in prod if not blocked    | Privilege escalation         | Explicit env guard + remove route in build |
| Rate Limiting             | Only attempts protected              | Abuse of auth endpoints      | Add limiter for login/register             |
| Password Policy           | Min length only                      | Weak password acceptance     | Add complexity + zxcvbn score threshold    |
| Analytics Scaling         | In-memory per-user scan              | Performance degrade at scale | Mongo aggregation pipeline                 |
| Feedback Lock Data Volume | Multiple queries per request         | Latency                      | Single aggregation or cached daily summary |
| Error Codes               | Plain text only                      | Fragile client parsing       | Introduce stable error codes               |

---

## 17. 30 / 60 / 90 Day Roadmap (Post-MVP)

30 Days:

- Harden security (remove dev seed, secure cookies, rate limit auth, password complexity).
- Add official/practice filter refinement to stats.
- Introduce error codes & health endpoint.

60 Days:

- Implement analytics aggregation pipeline & indexes.
- Add integration + E2E test suites CI.
- Introduce React Query + optimistic UI for progress saves.
- Add structured logging + basic metrics.

90 Days:

- Advanced adaptive difficulty model (topic weighting).
- Performance profiling & caching (Redis layer for frequently accessed RCs / analytics snapshots).
- Multi-tenant or cohort support (if roadmap expands).
- Accessibility full audit + WCAG AA compliance pass.

---

## 18. Deployment Guidance

Minimal Steps:

1. Provision MongoDB (Atlas) with IP allowlist & user credentials.
2. Set environment variables securely (JWT_SECRET rotation policy).
3. Serve frontend via static host / CDN; configure API base URL & cookie domain.
4. Enable HTTPS + Secure & SameSite=strict cookies (adjust client fetch if cross-site needed).
5. Set Node process manager (PM2 / systemd) with restart & memory bounds.

---

## 19. Contribution Workflow

Branch Strategy (Suggested):

- `main`: production.
- `develop`: integration branch.
- Feature branches: `feat/<slug>`, bugfix: `fix/<slug>`.
  PR Checklist:

1. Lint & tests pass.
2. Added/updated docs for new endpoints/policies.
3. Security review if touching auth/attempt logic.

---

## 20. Quick Reference Cheat Sheet

| Need                    | Location                                                      |
| ----------------------- | ------------------------------------------------------------- |
| IST Utilities           | `server/src/utils/date.js`                                    |
| Attempt Policy & Streak | `attempt.controller.js`                                       |
| Feedback Lock           | `middleware/policy.js`                                        |
| Analytics               | `auth.controller.js` (analytics fn)                           |
| Admin Scheduling        | `admin.controller.js` + `rc.controller.js#getMonthlySchedule` |
| Error Shape             | `middleware/errors.js` & `utils/http.js`                      |

---

## 21. Immediate Improvement Fast Wins

1. Filter official attempts in stats endpoint.
2. Add global login rate limit (e.g., 10/min per IP + incremental backoff).
3. Convert analytics to use `$lookup` + group pipeline (foundation for future expansion).
4. Introduce `ERROR_CODES.js` constants module consumed by both server & client.
5. Add `istDayKey` on Attempt & Feedback write paths with index for faster daily queries.

---

## 22. Final Readiness Summary

MVP is coherent, domain rules enforced, and architecture is straightforward to extend. Primary pre-production tasks are security hardening, test coverage expansion, and operational visibility. No critical architectural blockers identified for initial launch scale.

---

## 23. Contact & Ownership

Assign internal owners for: Content (RC creation), Infra (deployment / DB), Security (auth & policies), Analytics (future KPIs). Rotate on-call once monitoring in place.

End of Document.
