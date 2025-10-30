# Features Upgrade & Free-Plan Canonicalization — Consolidated Plan

This consolidated document captures the decisions, design, migration plan, admin UI spec, server considerations, testing checklist and rollout steps for making Plan-driven feature gating the canonical approach in ARC. It merges the previous planning notes and upgrades them to an actionable, reviewable plan.

Status: ready for review. No code changes included here — this is the authoritative plan to implement after you confirm the decision points listed below.

## Executive summary

- Make Plan documents the single source of truth for feature gating and entitlements.
- Canonicalize the Free plan as a real, protected Plan (`slug: 'free'`) and assign it to free users.
- Allow admins to configure `features.feedbackLock` and `features.archive` in the Plan editor (admin UI).
- Migrate legacy `user.subscription` strings to `user.subscriptionPlan` via a dry-run/apply script and preserve `subon`/`subexp` for audit.
- Default conservative behaviour: treat missing `features.archive` as `{ type: 'attempted-only' }` (requires confirmation before server change).

## Goals & acceptance criteria

1. Plans are authoritative for gating (archive, feedbackLock, and future features).
2. Free users are represented by a canonical Plan object (no null subscriptionPlan pointers).
3. Admins can set `features.archive` and `features.feedbackLock` via the Plan modal; UI submissions conform to server validation.
4. Migration scripts provide dry-run outputs and apply updates in safe, small batches.
5. Tests cover webhook signature, discrepant payment gating, plan-level gating behavior and migration dry-runs.

## Key design choices (recommended)

- Free plan: represent free tier with a Plan doc `slug: 'free'`, `finalPriceCents: 0`, `active: true`.
- Archive default (conservative): treat absent `features.archive` as `{ type: 'attempted-only' }` (requires explicit approval to change runtime default).
- Feedback lock: plan-level boolean `features.feedbackLock.enabled`. To enable for free users, turn it on for the Free plan.
- Migration: write `subscriptionPlan` and keep `subscription` legacy field during a hold period for validation; unset after verification.

If you want alternative defaults, list them and I'll prepare a small PR that implements the change for review.

## Admin UI: Plan modal — Features panel (developer spec)

Place: Plan create/edit modal (admin area)

Panel: Features (collapsible)

Controls and bindings

1. Feedback Lock

- UI: Checkbox / Toggle
- Label: "Require daily feedback"
- Binding: `features.feedbackLock.enabled` (boolean)
- Help text: "When enabled, users on this plan must submit yesterday's feedback before submitting new attempts."

2. Archive access

- UI: Radio group (Attempted-only | Window | All)
- Binding: `features.archive.type`
- Window controls (only if Window selected):
  - Window days (number input) -> `features.archive.windowDays` (integer >= 0)
  - Include attempted RCs (checkbox) -> `features.archive.includeAttempted` (boolean)
- Help text: Window: "Users can view RCs created between their subon and subon + windowDays. If 'Include attempted' is checked, RCs they attempted are always visible."

UI behaviour details

- When opening modal for existing Plan: prefill controls from `plan.features`.
- If `plan.features.archive` is missing: default UI to Attempted-only (because product prefers conservative default in UI).
- For Free plan (`slug: 'free'`): hide/disable billing fields (durationDays/accessUntil/billing type) and show a small hint: "Protected system plan — billing fields are not editable." Allow editing of `features` and descriptive metadata only.
- On Save: send the `features` object to existing admin create/update endpoints. Server runs `validateFeatures()` and returns errors on malformed payloads.

Admin Plans table

- Add a compact "Features" column summarizing per-plan gating:
  - Format examples: "Archive: window(7) · FeedbackLock: on" or "Archive: attempted-only · FeedbackLock: off".
- Tooltip: "Plan feature gating — click to edit features."

Developer notes

- Client should rely on existing admin endpoints; no new endpoints are required for simple create/update of `features`.
- Validate `windowDays` client-side (integer >= 0) in addition to server validation.

## Server-side changes (deferred until approval)

The following are small server changes to prepare once decisions are confirmed. They will be authored as a minimal PR and run through staging tests before deployment.

1. planAccess default behaviour

- If you approve: change `planAccess.archiveRuleForUser` so that when a Plan exists but `features.archive` is missing, the helper returns `{ type: 'attempted-only' }` instead of `all` (conservative default).

2. Plan controller guards

- Prevent editing of billing fields for `slug === 'free'` (billingType, durationDays, accessUntil).
- Prevent deletion of the Free plan.

3. Migration script

- Add `server/scripts/migrateToFreePlan.js --dry|--apply` that:
  - Finds candidate users with legacy `subscription` or missing `subscriptionPlan`.
  - Attempts to resolve a Plan by slug (free/weekly/cat) and produces a reconciliation report.
  - On `--apply`, updates users in small batches (e.g., 500) and logs success/failure for manual review.

4. Nullification behavior

- Update the expiry/nullification job so that when a paid subscription is nullified it sets `user.subscriptionPlan = freePlanId` (preserve `subon` and `subexp` for audit) and sets `user.issubexp = true`.

Implementation note: changes above are small and defensive — the migration script must be dry-run first in staging before any production apply.

## Migration & backfill plan (safe approach)

1. Ensure canonical Free plan exists (seed if necessary).
2. Run `server/scripts/migrateToFreePlan.js --dry` against staging DB. Review the reconciliation report.
3. Address ambiguous records manually (script logs them for human review).
4. Run `--apply` in staging in small batches and re-run application tests for gating.
5. After staging verification, run `--dry` in production to collect counts and a full report.
6. Run `--apply` in production during maintenance window in small batches (with DB backups and monitoring in place).

Suggested migration semantics

- Preserve historical `subon` and `subexp` in user record for audit. Set `user.subscriptionPlan = freePlanId` and `user.issubexp = true` for expired accounts (recommended — keeps an audit trail).
- Keep legacy `user.subscription` field for an observation period, then unset once verification completes.

## Testing & rollout checklist (staging -> production)

1. Implement UI changes in a feature branch and deploy to staging.
2. Tests to add:
   - Unit tests for `planAccess` interpretation (attempted-only/window/all semantics).
   - Integration tests to assert `canAccessArchive(user, rc, attempted)` behavior for edge cases (today scheduled, attempted vs not, window boundaries in IST).
   - Migration script unit test/dry-run assertions.
3. Staging validation:
   - Edit plans in admin UI to set features, confirm list shows summary.
   - Run migration `--dry` and review logs.
   - Apply migration on staging and verify free users now have `subscriptionPlan` set and gating works.
4. Production rollout:
   - Run `--dry` on prod and review.
   - Apply in small batches and monitor.
   - After validation window (48–72 hours), unset legacy `user.subscription` if desired.

## Questions & confirmations (action items for product/ops)

Please answer the following before I prepare the PRs and scripts for review:

1. Do you approve changing default archive rule for Plan-without-archive to `attempted-only`? (yes/no)
2. Confirm Free plan slug is `free` and must be protected from deletion and billing edits. (yes/no)
3. Confirm new users should be assigned the Free plan at signup. (yes/no)
4. Confirm migration semantics: write `subscriptionPlan` and keep legacy `subscription` during a validation hold, then unset after verification. (yes/no)
5. Do you want me to also prepare the client UI spec only or the client code patch (React) wired to the admin API? (spec/code)

If you reply with answers, I will prepare the following artifacts in a reviewable branch:

- Small server PR that implements the Plan controller guards and migration script (dry-run) (no automatic deployment).
- Optionally: a client patch for the Plan modal (if you choose `code`).

## Files to add when implementing

- `server/scripts/migrateToFreePlan.js` (dry-run / apply)
- `server/src/lib/planAccess.js` (unit-tested helper — if not present already)
- Optional client changes in `client/src/admin/*` to add Features panel to Plan modal

## Completion summary (what this doc provides)

This file consolidates prior planning artifacts into a single, actionable plan including:

- Design decisions and recommended defaults
- Admin UI form spec for the Plan Features panel
- Migration and rollout steps with safety checks
- Test coverage and acceptance criteria
- Concrete questions to answer before code changes

When you confirm the 4 decision items above and whether you want the client spec or client code, I will open a single PR (or two: server + client) with the changes and tests. Nothing will be merged or run in production without your explicit GO.

\*\*\* End of Document
