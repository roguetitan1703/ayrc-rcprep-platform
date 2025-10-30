# Plan Feature Gating

This document describes the feature-gating model used by the ARC platform. It focuses on the `archive` gating feature implemented initially, explains data shapes, and gives examples for admins and developers. Use this as the canonical reference when adding new features.

## Principles

- Plans are the single source of truth for pricing and access.
- Each Plan can declare `features` as a typed object describing access rules.
- The server implements a `planAccess` helper which interprets feature rules.
- Admins configure plans via admin UI or seed scripts; plans have `slug` and `finalPriceCents` (required).
- `finalPriceCents` is authoritative and used when creating payment orders.

## Archive feature (supported types)

The `features.archive` key supports three typed shapes:

1. attempted-only

- Shape: `{ type: 'attempted-only' }`
- Semantics: users can only view RCs they have attempted. Today's scheduled RCs are always accessible.
- Use case: the Free plan.

2. window

- Shape: `{ type: 'window', windowDays: <number>, includeAttempted: true|false }
- Semantics: users can view RCs that were created between their `subon` (or join date) and `subon + windowDays`. If `includeAttempted` is true, they also always see RCs they attempted regardless of date.
- Use case: Weekly plan with `windowDays: 7`.

3. all

- Shape: `{ type: 'all' }`
- Semantics: unrestricted access to archives.
- Use case: Till-CAT plan.

## How the server evaluates archive access

- The server attempts to resolve a `Plan` for the user:

  1. If `user.subscriptionPlan` (ObjectId) is present, the corresponding Plan is loaded.
  2. Otherwise the legacy `user.subscription` string is checked for common values (free, weekly, cat) as a fallback.

- The archive evaluation pipeline:

  - If RC is scheduled for today (IST day), grant access.
  - If plan rule is `all` -> grant.
  - If `attempted-only` -> grant only if the user has an `Attempt` for that RC.
  - If `window` -> if `includeAttempted` and user attempted -> grant; else check RC.createdAt within `[subon, subon + windowDays]`.

- The helper `canAccessArchive(user, rc, attempted)` returns `{ allowed: boolean, reason: string }`.

## Examples

- Free user (attempted-only): only RCs they attempted, plus today.
- Weekly user (windowDays:7): RCs created within 7 days of `subon`, plus RCs they attempted.
- Till-CAT user: all RCs.

## Adding a new feature key

1. Decide on a typed shape for the feature and document it in this file.
2. Add UI controls in admin UI to create/edit the feature shape for a plan.
3. Implement an interpreter in `server/src/lib/planAccess.js` for the new feature.
4. Replace ad-hoc checks in controllers with calls to the helper.

## Notes

- All dates are stored in UTC in the DB. Day-level comparisons use IST (UTC+5:30) via `startOfIST`/`endOfIST` utilities.
- `finalPriceCents` is required and is used as the amount for Razorpay orders.
- `markupPriceCents` is optional and used for UI strike-through display if present.

## Migration guidance

- Seed canonical plans first (`server/scripts/seedPlans.js`).
- Migrate old `user.subscription` strings to `subscriptionPlan` references using a migration script (dry-run before write).

Decisions & Deployment notes

- Canonical Free plan: the Free tier will be represented by a real Plan document with slug `free` (see `docs/FREE_PLAN_MIGRATION.md` for canonical JSON). All new users should be assigned this plan at signup so runtime gating can read `subscriptionPlan` reliably.
- Default archive behaviour when a plan does not declare `features.archive`: we will treat the absence as `attempted-only` (conservative default). The server currently treats missing `archive` as permissive `all`; that will be changed as a controlled follow-up once you approve.
- Feedback lock: by product decision, feedback lock enforcement applies to free users by default. Admins may enable feedback lock on a plan to apply it to paid users, but the simplest rollout is to toggle the Free plan's `features.feedbackLock.enabled` to `true`.

Admin UI guidance (Plan editor)

- Add a `Features` panel to the Plan create / edit modal that exposes the following controls (client should submit the `features` object to the existing admin endpoints and rely on server validation):

  - Feedback Lock: checkbox (features.feedbackLock.enabled)
    - Help text: "Require users on this plan to submit yesterday's feedback before submitting new attempts."
  - Archive Access: radio (features.archive.type)
    - Attempted-only
    - Window: when selected show `windowDays` (integer >= 0) and `includeAttempted` (checkbox)
    - All
  - (Do not show dailyLimits at this time)

- When editing the Free plan in the UI, hide/disable billing fields (duration/accessUntil) and mark the plan as non-deletable.
- In the plans list/table, add a compact "Features" column summarising each plan's gating (e.g., "Archive: window(7) · FeedbackLock: on").

Migration & nullification policy (high-level)

- When nullifying expired subscriptions we will: (1) mark Subscription documents `expired`, (2) preserve users' historical `subon` and `subexp` for audit, (3) set `user.subscriptionPlan` to the Free plan `_id`, and (4) set `user.issubexp = true`. The legacy `user.subscription` string will be preserved during the initial migration and can be removed later after verification.
- See `docs/FREE_PLAN_MIGRATION.md` for the dry-run/apply migration script design and safe-run checklists.

Questions you should confirm before changing server logic

- Do you approve changing the `planAccess.archiveRuleForUser` default from `all` to `attempted-only` when a Plan document lacks `features.archive`? (This makes plan authors opt-in for permissive archive behaviour.)
- Confirm that Free plan slug is `free` and must remain non-deletable.
- Confirm whether new users should be assigned the Free plan at signup (recommended: yes).

If you confirm these design points I will prepare a small, reviewable PR that: (1) updates `planAccess` default behavior, (2) adds defensive checks in the Plan controller to protect the Free plan billing fields, and (3) provides the client-side UI spec or patch for the admin Plan modal. No change will be applied without your explicit "go".

Migration script (action item)

- If a migration script does not already exist in `server/scripts`, create a planned script at
  `server/scripts/migrateSubscriptions.js` which supports a `--dry` flag. It should:
  - Read users with legacy `user.subscription` values.
  - Attempt to resolve a matching `Plan` by slug and populate `subscriptionPlan` for those users.
  - Preserve `subon`, `subexp`, and `issubexp` where present; log ambiguous records for manual review.
  - When run without `--dry`, perform writes in small batches and produce a summary report.

Note: migration scripts are intentionally not included here. Create and test the migration in staging first, and always run with `--dry` before writing to production.

\*\*\* End of Document
