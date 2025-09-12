# ARC Developer Handoff

## Overview

ARC delivers daily Reading Comprehension practice (2 RC passages/day, IST calendar) with streak tracking, feedback gating, analysis, and admin scheduling.

## Architecture

- Frontend: React + Vite + Tailwind. Feature folders under `client/src/features/*` with shared UI primitives in `client/src/components/ui`.
- Backend: Express (ESM) + Mongoose, modular controllers & middleware under `server/src`.
- Timezone: All daily boundaries computed in IST (UTC+5:30) via `server/src/utils/date.js`.

## Key Domain Rules

1. Two RCs per IST day; admin schedules via status `draft|scheduled|live|archived`.
2. User must submit daily feedback after completing both RCs to unlock next day (feedback lock middleware).
3. Streak counts only days with at least one OFFICIAL attempt (practice attempts excluded by `attemptType`).
4. Practice mode exposes answers/explanations instantly but does not update streak or official attempt record.

## Recent Changes (Sprints 1–3)

- Central IST utilities, feedback lock, attempt validation, error normalization.
- `attemptType` added enabling multiple practice attempts (see `MIGRATION_NOTES.md`).
- Auth fetch consolidation via `AuthContext` + `RequireAuth`.
- Test screen refactor (three-column) with timer and progress palette.
- Calendar visualization with per-day counts and drill-down panel.
- Analytics endpoint: topic accuracy (30d) + 7-day trend.
- Accessibility: aria labels for timer, results metrics, palette; toast live region.

## Key Endpoints

- User: `/api/v1/users/me`, `/me/stats`, `/me/analytics`.
- RCs: `/api/v1/rcs/today`, `/rcs/:id`, `/rcs/archive`.
- Attempts: `/api/v1/attempts` (POST submit), `/attempts/analysis/:rcId`.
- Feedback: `/api/v1/feedback/today`, `/feedback/lock-status`.
- Admin: `/api/v1/admin/rcs`, `/admin/rcs-monthly`.

## Attempt Model

`Attempt`: `{ userId, rcPassageId, answers[4], score, timeTaken, attemptedAt, attemptType, analysisFeedback[] }`.

- Unique index: `(userId, rcPassageId, attemptType)`.
- Official streak logic in `attempt.controller.js` guarded against future RC submission.

## Frontend Modes

- Preview: `?preview=1` (admin only; full content)
- Practice: `?mode=practice` or `?practice=1` (with answers and explanations).

## Toast & Errors

Use `useToast().show(message, { variant })`. Inline errors kept only for skeleton or non-blocking states. Standard server error shape `{ error, errorCode }`.

## Migration

See `MIGRATION_NOTES.md` for altering attempt index and backfill.

## Dev Quick Start

Backend:

```
cd server
npm install
npm run dev
```

Frontend:

```
cd client
npm install
npm run dev
```

Default client URL: `http://localhost:5173` → Server `http://localhost:4000`.

## Testing

Current minimal tests in `server/tests` (timezone & scoring). Recommended next tests:

- attemptType streak exclusion
- official vs practice future date submission rejection
- analytics endpoint topic accuracy correctness

## Future Ideas (Sprint 4+ Candidates)

- Offline safeguard / beforeunload for active test
- Topic mastery trajectory graph
- Advanced accessibility audit (WCAG contrast automation)
- Service worker caching of today’s RCs

## Contact Points

- Business rules clarifications: review Implementation docs in `/Implementation-docs`.
- Security considerations: ensure no second official attempt can be inserted via direct DB write; consider adding audit logs.

---

Handoff complete. Continue with targeted tests & performance profiling as next priority.
