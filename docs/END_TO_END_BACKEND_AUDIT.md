# End-to-End Backend Audit — User-Facing Features

This document maps each user-facing frontend feature (see `docs/USER_FEATURES_TAGS_STATS_AUDIT.md`) to the backend endpoints, controllers, models and services that provide the data/logic. It also marks implementation status (Implemented, Partial, Placeholder), lists notable mismatches, and provides concrete action items to complete missing pieces.

Date: 2025-10-25
Repository: ayrc-rcprep-platform
Branch: main

---

## Methodology

- I inspected server-side controllers, routes, models and analytics services under `server/src/*`.
- For each frontend feature I located the relevant API route (or controller function) and read the implementation to mark status and caveats.
- Where code was partially implemented (e.g. stubs, commented logic, dev-only behavior) it is flagged as Partial or Placeholder and described.

---

## Summary (Top-level)

- Most core features are implemented server-side: attempts submission, analysis, dashboard bundle, archive/today RCs, feedback question flow, performance/analytics, leaderboard aggregation.
- Several admin features and analytics pipelines are implemented and fairly complete (admin RC lifecycle, per-RC analytics).
- Placeholders / partial implementations found:
  - Password reset/forgot flows (email/tokening are MVP stubs)
  - Payments (Razorpay) require config; code handles unconfigured state (returns 501) — works only if keys are set.
  - `User.personalBest` is present but not consistently updated by attempt submission code (Attempt.isPersonalBest is set; user.personalBest updated only in seed script).
  - Subscription enum/value mismatches and string variations between frontend and backend could cause logic gaps.

---

## Detailed Mapping & Status

### 1) Dashboard (frontend `Dashboard.jsx` / `AnalyticsPanel` / `StatsRow`)

- Frontend needs:
  - Stats (attempts, accuracy, streak, rolling days)
  - Topic distribution (last 30d)
  - Coverage & reason counts
  - Today's RCs and feedback lock status
- Backend endpoints / impl:
  - Endpoint: `GET /users/me/dashboard` → `dashboardBundle` in `server/src/controllers/dashboard.controller.js`
    - Returns: `user`, `stats`, `analytics`, `today`, `feedback` (submitted + lockStatus)
    - Uses `getUserAnalytics(userId)` inside same controller to compute: topics, trend(7d), coverage, top reasons, attempts7d, taggedWrong, totalWrong.
  - Models used: `Attempt`, `RcPassage`, `Feedback`, `User` (via `models/*`)
- Status: Implemented (server calculates all values used by frontend)
- Caveats / Notes:
  - Coverage and topic accuracy calculations use last-30d attempts and most recent official attempt per passage. This matches frontend expectations.
  - `dashboardBundle` returns `feedback.lockStatus` via `feedbackLockInfo` middleware logic.

### 2) Today’s RCs / Archive / RC details

- Frontend needs:
  - Today list: title, scheduledDate, topicTags, status (attempted/pending), score
  - Archive: pagination, filter by subscription and attempted state
  - RC detail (practice/preview/official) with question visibility rules
- Backend endpoints / impl:
  - `GET /rcs/today` → `getTodayRcs` in `rc.controller.js` (authRequired)
    - Returns today RCs and user attempt mapping
  - `GET /rcs/archive` → `getArchive` in `rc.controller.js`
    - Implements subscription-aware filtering; for `free`/`none` users returns only attempted RCs
    - Pagination supported (`page`, `limit`)
  - `GET /rcs/:id` → `getRcById` in `rc.controller.js`
    - Access control: preview/practice modes supported via query params
    - Restricts access for free/weekly users for future or pre-join RCs
- Status: Implemented
- Caveats / Notes:
  - Backend contains detailed subscription gating logic. The subscription values in backend (`free`, `weekly`, `cat2026`) should be cross-checked vs frontend strings (frontend shows `till-cat`, `1 Week Plan`, etc.). Normalize strings to avoid mismatches.

### 3) Attempt submission, progress save, analysis (Results & Analysis screens)

- Frontend needs:
  - Submit attempt, autosave progress, get analysis payload (questions, option distributions, coverage), list attempts for Results
- Backend endpoints / impl:
  - `POST /attempts` → `submitAttempt` in `attempt.controller.js`
    - Validates payload with Zod; enforces subscription access control and scheduled-date checks
    - Normalizes answers, computes score, upserts Attempt document (unique constraint on userId + rcPassageId + attemptType)
    - Logs AnalyticsEvent, updates user dailyStreak, recalculates attempt-level `isPersonalBest` flags
  - `PATCH /attempts/:id/progress` → `saveProgress` (stores partial progress)
  - `GET /attempts/analysis/:rcId` → `getAnalysis` (returns analysis payload used by Analysis.jsx)
  - `GET /attempts` → `listUserAttempts` (pagination, stats for Results page)
  - `PATCH /attempts/:id/reasons` → `captureReason` (submit reason tag for a question)
  - `PATCH /attempts/:id/analysis-notes` → `saveAnalysisNotes`
- Models used: `Attempt`, `RcPassage` (for question metadata)
- Status: Implemented (feature-complete)
- Caveats / Notes:
  - `submitAttempt` marks Attempt.isPersonalBest and updates other attempts' flags, but does not update `User.personalBest`, which is read by analytics service (see below). This leads to potential inconsistency if frontend expects `user.personalBest` to reflect the current value.
  - `attemptSchema` enforces unique official attempt per user/RC (index) — good.

### 4) Coverage, Reason tagging, Feedback

- Frontend needs:
  - Tag reasons per incorrect question, coverage percentages, daily feedback flow that gates access
- Backend endpoints / impl:
  - `PATCH /attempts/:id/reasons` (`captureReason`) — records reason codes into `analysisFeedback` on the Attempt (idempotent replace for a question index)
  - `POST /feedback` → `submitFeedback` (stores user feedback answers for today)
  - `GET /feedback/today` → `getTodayFeedbackStatus` (returns submitted status)
  - `GET /feedback/questions/today` → `getTodaysQuestions` (returns questions for today)
  - Middleware `policy.enforceFeedbackLock` used on `POST /attempts` to require feedback before new attempts (enforces daily feedback lock)
- Models: `Feedback`, `FeedbackQuestion`, `Attempt` (analysisFeedback)
- Status: Implemented
- Caveats / Notes:
  - Feedback question management has admin routes; getTodaysQuestions returns both global and dated questions.

### 5) Subscriptions & Payments

- Frontend needs:
  - View available plans, manage/upgrade, block/unblock features based on subscription
- Backend endpoints / impl:
  - `POST /subs/create-order` (?) — actual route file path is `server/src/routes/subs.js` exists; controller functions are in `sub.Controller.js` (createOrder, verifyPayment, getAllSubscriptions, revokeSubscription, extendSubscription)
  - `createOrder` uses Razorpay SDK if keys available; otherwise returns 501 with message 'Razorpay not configured on this server'.
  - `verifyPayment` expects webhook events and updates user subscription fields (`subscription`, `subon`, `subexp`, `issubexp`) accordingly.
- Models: `User` (subscription fields: `subscription`, `subon`, `subexp`, `issubexp`)
- Status: Partial / Conditional
- Caveats / Notes:
  - Razorpay initialization is conditional on env keys; in dev keys are often not set — payment flow will not function until keys are configured and webhooks set up.
  - The code contains some special referral/bonus rules that depend on `parentrefCode` and `refinc` fields — audit referral data model before enabling in prod.
  - Subscription enum values in model are `['free','weekly','cat2026']` which do not match some frontend strings like 'till-cat' or '1 Week Plan'. This mismatch should be normalized.

### 6) Auth / Profile

- Frontend needs:
  - Login, register, forgot/reset flows, profile `GET /users/me`, update name `PATCH /users/me`, change password
- Backend endpoints / impl:
  - `POST /auth/register` → `register` (creates user, calls `updateDailyStreak`)
  - `POST /auth/login` → `login` (returns token cookie)
  - `GET /users/me` → `me` (returns user without password)
  - `PATCH /users/me` → `updateMe` (updates name)
  - `POST /users/me/change-password` → `changePassword` (requires old password)
  - `GET /auth/forgot-password` & `POST /auth/reset-password` — minimal stubs implemented in `auth.controller.js` and return success; no email token flow.
- Models: `User`
- Status: Partially implemented
- Caveats / Notes:
  - `forgotPassword` is a stub — it returns success to frontend but does not send email or token. `resetPassword` accepts email + newPassword and updates the password if user exists (no token verification). These are intentionally MVP stubs and must be replaced with a secure token-based flow for production.

### 7) Performance Studio / Insights

- Frontend needs:
  - Performance Studio data: overview metrics, question rollups, radar data, timeline, recent attempts
- Backend endpoints / impl:
  - `GET /aggregation/performance` → `performanceDetail` in `aggregation.controller.js`
    - Calls `buildPerformanceStudio(userId, range)` in `server/src/services/analytics.service.js`
    - `buildPerformanceStudio` composes `buildQuestionRollups`, `buildProgressTimeline`, `buildRadarDataset`, `calculateAdvancedMetrics` and returns structured dataset used by frontend.
- Models: `Attempt`, `RcPassage`, `User`
- Status: Implemented (comprehensive)
- Caveats / Notes:
  - This code is reasonably complete. Verify range param behavior and that frontend passes expected date formats for startDate/endDate.

### 8) Community / Leaderboard

- Frontend needs:
  - Leaderboard (today, monthly, tag-based)
- Backend endpoints / impl:
  - `GET /aggregation/leaderboard` → `leaderboard` in `aggregation.controller.js`
    - Implements `getTodaysLeaderboard`, `getMonthlyLeaderboard`, `getAllTagLeaderboards` pipelines (aggregation queries on `Attempt` and joins to `Users`/`RcPassages`)
    - In-memory caching by total attempt count to avoid re-calculation on every request
- Models: `Attempt`, `RcPassage`, `User`
- Status: Implemented
- Caveats / Notes:
  - Leaderboard calculation is heavier; caching is in place. Make sure caching invalidation strategy suits production scale.

### 9) Admin features (RC CRUD, RC analytics)

- Frontend needs (admin): RC create/update/archive, RC analytics
- Backend endpoints / impl:
  - `POST/PUT/DELETE` controllers in `admin.controller.js` provide RC CRUD
  - `analyticsRcDetail` provides rich per-RC analytics (time-of-day buckets, practice->official conversion, time-to-mastery)
- Status: Implemented for admin users

### 10) Static pages & Home

- Frontend shows static content (Pricing, About, Terms). Backend does not need dynamic support (static front-end pages). Pricing page uses front-end data.
- Status: N/A (front-end static)

## Notable Implementation Gaps & Placeholders

1. Password reset / forgot password

   - Location: `server/src/controllers/auth.controller.js` (`forgotPassword`, `resetPassword`)
   - Status: Placeholder / MVP stub.
   - Impact: Frontend "Forgot" flow will show success, but no email/token; `reset` endpoint accepts email+newPassword without token. Security risk for production.
   - Recommendation: Implement secure token issuance, email sending (SMTP or transactional provider), and token verification for `resetPassword`.

2. Payments / Razorpay

   - Location: `server/src/controllers/sub.Controller.js`
   - Status: Partial/Conditional. If env keys not present, `createOrder` returns 501 and payment cannot be created.
   - Impact: Subscriptions flow in frontend will be blocked until keys/webhooks configured.
   - Recommendation: Document required env vars and webhook setup; add local dev fallback (e.g., mock order endpoint) if desired.

3. personalBest consistency

   - Location: `Attempt` updates in `attempt.controller.js` mark attempts with `isPersonalBest`, but `User.personalBest` is only set in a seed script.
   - Status: Partial
   - Impact: `buildPerformanceStudio` reads `User.personalBest`. This may be stale unless a separate routine updates the user doc on PB changes.
   - Recommendation: After recalculating attempt-level PBs in `submitAttempt`, update `User.personalBest` with the numeric best score for consistency.

4. Subscription enum/value mismatch

   - Backend `User.subscription` enum: `['free','weekly','cat2026']`
   - Frontend uses strings like `till-cat`, `1 Week Plan`, `Till CAT 2025`, `'none'` etc.
   - Status: Mismatch (possible bugs)
   - Impact: Access-control checks and UI may disagree on a user's subscription status.
   - Recommendation: Normalize subscription identifiers (canonical values) and use a small mapping layer in frontend or backend to translate user-facing labels to canonical codes.

5. Email / notifications & other integrations

   - There are stubs and TODOs for email flows and some admin automation; confirm delivery channels.

6. Legacy fields and deprecations
   - `wrongReasons` is kept for backward compatibility; `analysisFeedback` is the canonical field. Ensure frontend uses `analysisFeedback` and backend maintains `wrongReasons` only when necessary.

---

## Action Items (concrete repairs & priorities)

Priority = P1 (urgent for prod), P2 (important), P3 (nice-to-have)

1. (P1) Secure password reset flow

   - Implement token-based reset with expiry and email sending.
   - Files: `server/src/controllers/auth.controller.js`, add email service (SES/Sendgrid/Mailgun) helper.

2. (P1) Normalize subscription identifiers

   - Choose canonical strings: e.g., `free`, `weekly`, `till_cat_2026` or `cat2026` and update frontend mapping.
   - Files: Backend `User` model (`server/src/models/User.js`), any code that compares `subscription` strings, frontend `Subscriptions.jsx`, `Archive.jsx`, `rc.controller.js` checks.

3. (P2) Update `User.personalBest` whenever PB changes

   - After recalculating PB in `submitAttempt`, set `User.personalBest = topScore`.
   - Files: `server/src/controllers/attempt.controller.js` (inside PB recalculation block)

4. (P2) Document and optionally mock payment flow for local dev

   - Add README section listing required Razorpay env vars and webhook setup.
   - Optionally provide a dev-mode mock order creation endpoint and admin API to mark payment as captured.
   - Files: `server/src/controllers/sub.Controller.js`, `server/README.md`.

5. (P3) Ensure seed and admin scripts update persistent PB and other derived fields

   - If using seed scripts to maintain PB, add a periodic job or on-submit update.

6. (P3) Review coverage/analysis calculations for edge cases
   - E.g., when RCs have fewer/more than 4 questions (schema enforces 4 but be defensive), ensure division by zero guarded.

---

## Quick Endpoint Reference (important ones)

- `GET /users/me` → `auth.controller.me` (profile)
- `PATCH /users/me` → `auth.controller.updateMe` (update name)
- `POST /users/me/change-password` → `auth.controller.changePassword`
- `GET /users/me/dashboard` → `dashboard.controller.dashboardBundle` (dashboard bundle)
- `GET /rcs/today` → `rc.controller.getTodayRcs` (today list)
- `GET /rcs/archive?page=&limit=` → `rc.controller.getArchive`
- `GET /rcs/:id` → `rc.controller.getRcById` (preview/practice via query)
- `POST /attempts` → `attempt.controller.submitAttempt` (submit attempt)
- `PATCH /attempts/:id/progress` → `attempt.controller.saveProgress`
- `GET /attempts/analysis/:rcId` → `attempt.controller.getAnalysis` (analysis payload)
- `GET /attempts` → `attempt.controller.listUserAttempts` (attempt history)
- `PATCH /attempts/:id/reasons` → `attempt.controller.captureReason` (tag reason)
- `POST /feedback` → `feedback.controller.submitFeedback`
- `GET /feedback/today` → `feedback.controller.getTodayFeedbackStatus`
- `GET /feedback/questions/today` → `feedback.controller.getTodaysQuestions`
- `GET /aggregation/leaderboard` → `aggregation.controller.leaderboard`
- `GET /aggregation/performance?startDate=&endDate=` → `aggregation.controller.performanceDetail` (performance studio)
- `POST /subs/create-order` / webhook verify → `sub.Controller.createOrder` / `verifyPayment` (payment flow)

---

## Verification Status: Tests / Manual Checks to run

- Manual: Run `GET /users/me/dashboard` as a regular user, verify `stats`, `analytics.topics`, `today`, and `feedback.submitted` fields match frontend expectations.
- Test: Submit an attempt with `POST /attempts` (official) and verify streak increment, Attempt saved, coverage calculations update.
- Test: Tag a reason with `PATCH /attempts/:id/reasons` and check that `GET /users/me/dashboard` reflects updated coverage / taggedWrong counts.
- Test: Payments: configure Razorpay keys or use a dev-mock to confirm `createOrder` and `verifyPayment` flows.

---

## Files inspected (representative)

- `server/src/controllers/dashboard.controller.js`
- `server/src/controllers/rc.controller.js`
- `server/src/controllers/attempt.controller.js`
- `server/src/controllers/feedback.controller.js`
- `server/src/controllers/aggregation.controller.js`
- `server/src/services/analytics.service.js`
- `server/src/controllers/sub.Controller.js`
- `server/src/controllers/admin.controller.js`
- `server/src/controllers/auth.controller.js`
- `server/src/models/User.js`, `RcPassage.js`, `Attempt.js`, `Feedback.js`, `FeedbackQuestion.js`, `AnalyticsEvent.js`

---

## Closing notes

- The backend is robust for the primary user flows (test submission, analysis, dashboard, archive, feedback). With a few high-priority fixes (password reset security, subscription normalization, PB consistency and payment documentation), the platform can be hardened for production.

If you'd like, I can:

- Implement the `User.personalBest` update in `submitAttempt` (small patch + tests).
- Implement a token-based password-reset flow (longer task; needs email provider config).
- Add a dev-mode mock for Razorpay to enable local testing of subscription flows.

Tell me which of the action items you want me to implement first and I will create a focused plan and apply the changes.
