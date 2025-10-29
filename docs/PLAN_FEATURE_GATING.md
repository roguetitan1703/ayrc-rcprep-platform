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

\*\*\* End of Document
