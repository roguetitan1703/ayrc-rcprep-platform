# Proposed changes: Admin assign subscription + transaction reconciliation

Date: 2025-10-27
Repo: arc (server)

Purpose

- Add a small admin workflow to allow support/admins to assign subscriptions cleanly by selecting a Plan.
- Provide a safe reconciliation flow for discrepant transactions (payments where the captured amount differs from server-requested amount).

Summary of the change

- Backend changes (minimal, backwards-compatible):

  - Transaction model: store `paid_amount_cents` and `is_discrepant` (already added).
  - Webhook behavior: when `payment.captured` arrives, set `paid_amount_cents` and flag `is_discrepant=true` if paid != requested. If discrepant, do NOT auto-create Subscription nor update `User.subscriptionPlan`. If paid matches requested, create Subscription and update User as before.
  - Add admin convenience endpoint `POST /api/v1/sub/admin/assign` (admin-only) that accepts { userId, planId, startDate?, note? } and:
    - Validates user & plan (plan.active === true)
    - Computes start and end dates from the Plan (billingType/durationDays/accessUntil)
    - Creates a `Subscription` document linked to the user and plan
    - Updates `User.subscriptionPlan`, `subon`, `subexp`, `issubexp=false`
    - Adds audit metadata to the created Subscription (assignedBy, assignedAt, note)
    - Returns created Subscription

- Admin UI guidance (frontend):
  - Transactions table: allow client-side filtering on `is_discrepant` to find flagged txs.
  - When a user contacts support, admin inspects the transaction and, if appropriate, uses the Assign UI to pick a Plan and assign a subscription (no free-text days). The UI calls `POST /api/v1/sub/admin/assign`.
  - Optionally, the admin UI can add a note explaining resolution to the subscription record.

Why this design

- Keeps server-side payment lifecycle (status) separate from business reconciliation state. `status` remains 'captured' for successful captures, while `is_discrepant` flags require manual approval.
- Avoids automatic granting of access on underpayment while retaining simple manual approval flow.
- Minimal backend surface area and simple audit trail.

API Contract (proposal)

POST /api/v1/sub/admin/assign

- Auth: admin role required (use `requireRole('admin')` middleware)
- Body:
  - userId: string (required)
  - planId: string (required)
  - startDate: ISO string (optional) — defaults to now or policy-determined start
  - note: string (optional) — admin note
- Response: 201 Created { subscription }

GET /api/v1/transactions[?is_discrepant=true]

- (Optional) Admin endpoint to filter server-side by discrepant flag. The frontend can also request all transactions and filter client-side. Either is acceptable; server-side filtering is recommended for large datasets.

Data model notes

- `Transaction` fields used:

  - amount_cents: requested amount (server)
  - paid_amount_cents: amount captured (from webhook)
  - is_discrepant: boolean — true when paid_amount_cents !== amount_cents
  - metadata.reconciliation: { requested, paid }
  - raw_payload: store full webhook payload for audits

- `Subscription` creation for admin assign:
  - user, plan, transaction: optional (null), start_date, end_date, status='active', meta: { assignedBy, note }

Behavior and edge cases

- If the user already has an active subscription, admin assign will create a new Subscription and overwrite the user's quick fields (subscriptionPlan, subon, subexp). Admin should decide whether to extend or replace.
- For orphan transactions (no prior server-created order), Transaction.amount_cents will be 0; treat as discrepant and require manual review.
- Tolerance/threshold: we can optionally add an env var `RECONCILE_MISMATCH_THRESHOLD_CENTS` or `%` to auto-approve negligibly small mismatches. Implement later if needed.

Testing

- Add unit/integration tests for:
  - webhook: discrepant payment -> tx.is_discrepant true, no Subscription created, user unchanged
  - webhook: matching payment -> tx.paid_amount_cents set, Subscription created, user updated
  - admin assign endpoint: admin can create subscription for user from plan, User fields updated, audit metadata set
  - permission checks: non-admin receives forbidden

Migration / Backfill

- Optional: create a small migration to convert `User.orderids` entries into `Transaction` documents and to create `Subscription` docs from existing `User.subscriptionPlan` + `subon/subexp`. Mark migrated transactions with `metadata.source='migration'`.

Next steps I will implement if you confirm

1. Add `POST /api/v1/sub/admin/assign` controller + route and tests (admin assign happy path + permission test).
2. (Optional) Add server-side `GET /api/v1/transactions?is_discrepant=true` to help admin UI.

Notes

- This keeps the reconciliation flow minimal and aligns with the plan-first billing model. UI changes are needed to provide the admin Assign action (select plan + submit) but are straightforward.

---

End of proposal
