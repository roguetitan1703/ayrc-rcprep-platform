# ARC MVP Completion Plan

This plan lists all tasks to finish the MVP feature-set before the dedicated UI polish pass. It includes scope, acceptance criteria, and a lean timeline.

## 1) Scope & Assumptions

- Stack: MERN + Tailwind (already set up).
- Time zone: IST for “today” logic and streaks.
- Auth: JWT in Authorization header (localStorage); cookies supported but not required in dev.
- MVP prioritizes function over visuals; polish comes after this plan is delivered.

## 2) Workstreams and Tasks

### A. Backend

1. Validation & Error Shape

- Apply zod validation to all write endpoints: attempts, feedback, users/update, admin/rcs.
- Standardize error JSON shape: { error: string, code?: string }.
- Acceptance: Invalid payloads return 400 with consistent message; happy paths unchanged.

2. Auth Completeness

- Forgot/Reset: Use existing stubs; ensure reset path works with email + newPassword.
- Me/Update/Change-password: Confirm names and payloads are stable; ensure 401/403 handled.
- Acceptance: Basic reset flow via Reset page succeeds; change-password works with old->new guard.

3. RC Scheduling & Admin Guards

- Enforce at most two “scheduled/live” RCs per IST day (warning, not a hard blocker for MVP).
- Add preview token/query support: GET /rcs/:id?preview=1 returns full (with correct answers) to admins only.
- Acceptance: Admin sees a warning if scheduling >2 for day; preview fetch allowed for admin and denied for regular users.

4. Attempts & Progress

- Ensure submitAttempt idempotency per (userId, rcPassageId) — already upsert; add simple rate limit (per IP) on /attempts.
- Save progress: Support PATCH /attempts/:id/progress (exists). Add small server-side length and type validation.
- Acceptance: Concurrent submits don’t create duplicates; invalid progress array rejected with 400.

5. Feedback Gating

- Today status endpoint exists; confirm gating logic: when both RCs are attempted today and feedback is missing, Dashboard shows banner and disables Start.
- Next-day unlock is implied; no back-end date mutation needed.
- Acceptance: After submitting feedback, GET /feedback/today returns submitted:true.

6. Observability & Ops

- Add request-id (X-Request-Id) middleware; include in errors and logs.
- Add minimal CORS production allowlist reading from env.
- Acceptance: Health endpoint still OK; logs include request id.

### B. Frontend

1. Route Guards

- Implement <RequireAuth> and <RequireAdmin> wrappers.
- Protect /dashboard, /test/:id, /results/:id, /analysis/:id for signed-in users; protect /admin/\* for admin role.
- Acceptance: Unauthorized redirects to /login; non-admin denied from admin screens.

2. Practice Mode

- Open RC in practice mode from Dashboard and Archive. Behavior: hide timer; selecting an answer reveals correct + explanation; no attempt is recorded.
- Acceptance: Practice mode never calls POST /attempts, and explains answers inline.

3. Archive Screen

- Paginated GET /rcs/archive; list with date/tags; “Practice” CTA opens practice mode.
- Acceptance: Pagination works; empty-state friendly.

4. Test Screen – Server Progress Sync

- Every 30s (and on navigation), if an attempt id is available, PATCH progress. For MVP, we may create attempt on first navigate by POSTing with partial answers (or keep local-only; optional).
- Acceptance: No console errors; PATCH succeeds when attempt exists; local autosave remains.

5. Results Enhancements

- Show topic tags and user streak on results (GET /users/me for streak).
- Acceptance: Results displays streak number and topics.

6. Analysis UX

- Per-question feedback save exists; add success toast and disable save button when no entries.
- Acceptance: Saves only when at least one non-empty reason is present.

7. Profile

- Minimal “My Profile” page: view name/email/role, change name, change password link.
- Acceptance: Update name works and is reflected after refresh.

8. Admin UX

- Preview button to open Test in preview mode (admin only).
- Scheduling warnings UI when selecting a date that would exceed two RCs.
- Acceptance: Preview opens read-only with answer visibility; warning banner appears.

### C. QA & Tooling

1. Lint/Format

- Add ESLint + Prettier to client and server; npm scripts: lint, format.
- Acceptance: Lint passes; format applies without code changes in unrelated files.

2. Unit Tests (Targeted)

- server: scoring function, startOfIST date helper, feedback GET/POST contract.
- client: small utility tests if any; otherwise skip for MVP.
- Acceptance: Tests green locally.

3. E2E Smoke (Optional MVP)

- Playwright/Cypress basic flow: login → dashboard → test → results → analysis → feedback.
- Acceptance: One happy-path spec runs locally.

## 3) Acceptance Criteria (Summary)

- Auth: Login/register/reset/change-password stable; protected routes enforced.
- RCs: Today and archive lists populate; admin can CRUD and preview.
- Test: Timed test works; mark-for-review; autosave; submit computes score and navigates.
- Results: Shows score, time, accuracy, topics, user streak.
- Analysis: Shows explanations; allows optional per-question feedback save.
- Feedback gating: After both RCs attempted today, banner appears; submitting feedback clears it.
- Quality: Lint passes; basic unit tests pass.

## 4) Timeline (conservative)

- Day 1: Route guards, Archive screen, Results streak/tags, Profile page.
- Day 2: Practice mode, Admin preview, Scheduling warnings.
- Day 3: Validation/error shape sweep (zod), attempts/progress validation, rate limiting.
- Day 4: Lint/Prettier setup, unit tests, smoke E2E, docs update.

## 5) Risks & Mitigations

- Time zone edge cases (midnight rollovers): Test IST helper thoroughly.
- Auth state drift (token expiration): Redirect on 401; keep UX graceful.
- Windows dev quirks (esbuild EPERM): document npm rebuild esbuild, run terminals as admin.

## 6) Deliverables

- Code changes per tasks above, plus:
  - README updates (run, seed, env).
  - This plan and updated Sprint Status.

---

Link back: see Sprint Status for live progress updates.
