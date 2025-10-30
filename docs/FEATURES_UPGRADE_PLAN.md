# Features Upgrade & Free-Plan Canonicalization — Roadmap

This document consolidates the product decisions, migration strategy, admin UI requirements, testing checklist and next steps for making Plan-driven feature gating the canonical approach in ARC. It combines the Plan Feature Gating guidance with the Free plan migration plan and the immediate admin UI work you requested.

Status: planning (no code changes executed). This document records the plan and the actions to take when you say "go".

---

## Goals

- Make Plan documents the single source of truth for feature gating and entitlements.
- Ensure free users are represented by a canonical `free` Plan document so gating is consistent and measurable.
- Allow admins to configure `feedbackLock` and `archive` gating via the Plan admin UI (Plan modal), without a backend refactor right away.
- Preserve auditability: when nullifying expired subscriptions, retain `subon`/`subexp` and set `subscriptionPlan` to the Free plan pointer.
- Minimize risk: use dry-run first for any DB migration; keep legacy `subscription` field during verification and only unset after validation.

---

## Final decisions (confirmed by product)

1. Free plan is canonical and must exist with slug `free`. Example canonical JSON is in `docs/FREE_PLAN_MIGRATION.md`.
2. During nullification of expired subscriptions, users will be converted to the Free plan pointer while preserving `subon`/`subexp` for audit (option A from previous discussions).
3. Keep legacy `subscription` string during initial migration runs for verification; unset only after validation and a hold period.
4. New users should be assigned the Free plan at signup to avoid `null` pointers (recommended and accepted).
5. Admins can edit the Free plan's `features` (feedbackLock and archive) but billing fields for Free plan are protected and cannot be changed via the admin UI.
6. Default archive policy when a plan lacks an `archive` feature: use conservative `attempted-only` by default (requires confirmation to change server behavior). This is a product decision to be applied via a small server change when you approve.

---

## Admin UI: Plan modal requirements (deliverable)

Add a `Features` panel to the Plan create/edit modal. The panel should allow editing the following plan-level feature flags.

- Feedback Lock

  - Field: `features.feedbackLock.enabled` (boolean)
  - Control: checkbox labeled "Require daily feedback"
  - Help text: "When enabled, users on this plan must submit feedback for yesterday's scheduled RCs before submitting new attempts."

- Archive access

  - Field: `features.archive.type` (string: `attempted-only | window | all`)
  - Controls:
    - Radio group: Attempted-only / Window / All
    - If Window selected: show `windowDays` (number) -> `features.archive.windowDays` and `Include attempted RCs` -> `features.archive.includeAttempted`
  - Help text for Window: "Users can view RCs created between their subscription start and subscription start + windowDays. If 'Include attempted' is checked, RCs they attempted are always visible."

- UI behavior
  - When opening modal:
    - Prefill values from `plan.features`.
    - If `plan.features.archive` is missing, default the UI selection to `Attempted-only` (product decision).
  - For Free plan (slug `free`): hide/disable billing fields (duration/accessUntil/etc.) and show a protected-system hint.
  - On save: submit the `features` object to the existing create/update admin endpoints. Server will run `validateFeatures()`.

---

## Migration: migrate expired/none users to Free plan (summary)

See `docs/FREE_PLAN_MIGRATION.md` for a step-by-step script plan and dry-run/apply commands. Key points:

- Do a full DB backup before applying migration.
- Dry-run to list candidates: users with `subscription == 'none'` or missing `subscriptionPlan`.
- Apply in batches: set `subscriptionPlan` to the Free plan `_id` and preserve `subon`/`subexp`; set `issubexp = true` if expired.
- Keep legacy `subscription` field during initial validation; optionally unset it later.

---

## Server changes to plan (deferred until approved)

When you say "go" I can prepare a small PR that includes:

1. `planAccess.archiveRuleForUser` default change: when a Plan exists but `features.archive` is missing, return `{ type: 'attempted-only' }` instead of `all`.
2. Plan controller guards: prevent editing Free plan billing fields and prevent deleting Free plan (if not already enforced). These are defensive checks.
3. Nullifier update: where `nullifyExpiredSubscriptions` marks users as expired, set `user.subscriptionPlan = freePlanId` (preserve `subon/subexp`) and ensure no writes to legacy `subscription` string.

No change will be merged or deployed without your explicit approval.

---

## Testing & rollout checklist (staging -> production)

1. Implement admin UI changes in a feature branch and deploy to staging.
2. Staging: verify editing plans updates `features` and UI shows human summary in plans table.
3. Staging: update Free plan to desired `features` and verify gating behavior: free users are subject to feedbackLock, archive attempted-only behavior works.
4. Prepare and run migration script in `--dry` mode on staging DB; review outputs.
5. Run migration in small batches on production during maintenance window; verify batched verification and logs.
6. Monitor support tickets and gating telemetry for 48-72 hours. If OK, schedule legacy `subscription` cleanup.

---

## Questions for final confirmation (answer before PR)

1. Approve server default change for missing `features.archive` from `all` -> `attempted-only`? (yes/no)
2. Confirm Free plan slug is `free` and must remain non-deletable? (yes/no)
3. Confirm we keep legacy `subscription` during initial migration and unset later? (yes/no)
4. Confirm new users should be assigned Free plan at signup? (yes/no)

---

## Next actionable deliverables I will prepare after confirmation

- `server/scripts/migrateToFreePlan.js` (dry-run + apply) with batching and logging.
- Small server PR to protect Free plan billing fields and optionally adjust `planAccess` default.
- Admin UI spec or client patch to add the `Features` panel to the Plan modal (your choice: spec only or code + tests).

Tell me which of the confirmations (the 4 questions above) you approve and whether you want the UI patch (code) or the UI spec (document). I will then prepare the corresponding PRs/scripts ready for your review. No runtime changes will be executed without your explicit `go`.
