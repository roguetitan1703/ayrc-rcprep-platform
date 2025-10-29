```markdown
# Sprint plan — Razorpay & Subscriptions (finalized)

Date: 2025-10-27
Repo: arc

Purpose

- Produce a single, exhaustive sprint document that:
  - Starts from the `PROPOSED_ADMIN_SUB_ASSIGN.md` proposal and reconciles it with the current codebase and the earlier integration plans.
  - Lists completed, partial, and missing work (backend, UI, tests, migration, ops).
  - Calls out decisions that need explicit confirmation (now confirmed where you instructed).
  - Delivers a prioritized backlog, acceptance criteria, and next steps for the immediate sprint.

You confirmed: the Plan schema is correct and the `till_date` and `durationDays` semantics are canonical for this work. I will not add `one_time` unless you ask.

Executive summary (short)

- Backend: core models (`Plan`, `Transaction`, `Subscription`) exist and are usable. `createOrder` persists Transactions and `verifyPayment` updates Transactions and creates Subscriptions. Raw webhook body is captured via `server/src/app.js` (express.json verify hook).
- Gap: reconciliation policy in code differs from `PROPOSED_ADMIN_SUB_ASSIGN.md` — code flags `is_discrepant` but still auto-creates Subscriptions; proposal recommends blocking auto-creation for discrepant payments and using an admin-assign flow. Sprint will align behavior to the proposal.
- UI: client-side plan selection and admin UI pages are missing. Plan listing endpoint exists in routes but the controller may be absent or incomplete.
- Tests: webhook signature (raw-body HMAC) tests and admin assign tests are missing. Migration scripts are missing.

Status: Completed / Present (code)

- `server/src/models/Plan.js` — present; fields: finalPriceCents, markupPriceCents, billingType (duration_days, till_date), durationDays, accessUntil, features, metadata.
- `server/src/models/Transaction.js` — present; fields: user, plan, amount_cents (required), paid_amount_cents, currency, razorpay_order_id, razorpay_payment_id, status, raw_payload, metadata, is_discrepant.
- `server/src/models/Subscription.js` — present.
- `server/src/controllers/sub.Controller.js` — contains `createOrder` (persists Transaction), `verifyPayment` (verifies HMAC using req.rawBody, updates/creates Transaction, creates Subscription), `extendSubscription`, `revokeSubscription`, `getAllSubscriptions`.
- `server/src/app.js` — captures raw webhook body via express.json verify hook (req.rawBody) so webhook verification works without express.raw.

Major gaps / missing work (high-level)

1. Reconciliation behavior: webhook currently flags discrepancies but still creates Subscriptions. Needs change to block auto-creation when `is_discrepant === true`.
2. Admin assign endpoint (`POST /api/v1/sub/admin/assign`) missing — required to assign subscriptions after manual reconciliation.
3. Admin transactions endpoints (`GET /api/v1/transactions`, `GET /api/v1/transactions/:id`) missing — required for admin workflows and reconciliation.
4. Webhook signature tests (raw-body HMAC) are missing — add tests for valid/invalid signature and idempotency.
5. Frontend: plan listing, plan buy flow (send planId), Admin UI (Plans, Transactions, Assign) missing.
6. Migration/backfill scripts missing for historical data.

Detailed requirements derived from `PROPOSED_ADMIN_SUB_ASSIGN.md`, `RAZORPAY_INTEGRATION_PLAN.md`, and `SUBS_PLANNING.md` combined with code inspection

Admin assign contract (authoritative)

POST /api/v1/sub/admin/assign

- Auth: admin role required (`requireRole('admin')`).
- Body (JSON): { userId: string, planId: string, startDate?: ISO, transactionId?: string, note?: string }
- Behavior:
  - Validate user and plan exist; plan.active must be true.
  - Compute start_date/end_date by plan.billingType (duration_days/till_date) using existing logic (reuse `verifyPayment` logic). If startDate provided use that as start.
  - Create Subscription doc: { user, plan, transaction: transactionId || null, start_date, end_date, status:'active', meta: { assignedBy: adminId, assignedAt, note } }.
  - Update User quick fields: subscriptionPlan, subscriptionSnapshot, subon, subexp, issubexp=false.
  - If transactionId provided, link subscription_id into Transaction.metadata.subscription_id.
  - Return 201 with created Subscription.

Edge & audit rules

- If user has active subscription, admin assign will replace by default. (You confirmed: assign-only, no extend.)
- For orphan txs (amount_cents == 0), require manual review — admin assign may still accept and link subscription with `meta.source='admin'`.
- Optional threshold: `RECONCILE_MISMATCH_THRESHOLD_CENTS` can be added later to auto-approve small mismatches; do not implement in sprint unless requested.

Controller-level TODOs (code changes)

- In `server/src/controllers/sub.Controller.js`:

  1. Add function `adminAssignSubscription(req,res)` implementing the contract above.
  2. Modify `verifyPayment` to:
     - After updating tx.paid_amount_cents and computing `is_discrepant`, if `tx.is_discrepant === true` then:
       - Do NOT create Subscription.
       - Save tx metadata noting `held_for_reconciliation: true` and return 200.
     - Else (not discrepant) continue with existing creation flow.

- Add `server/src/controllers/transaction.Controller.js` with `listTransactions` and `getTransactionById` helper methods for admin API.

- Routes:
  - Add to `server/src/routes/subs.js` under `requireRole('admin')`:
    - POST `/admin/assign` -> controller.adminAssignSubscription
  - Create `server/src/routes/transactions.js` (or mount in subs) with admin-only endpoints.

Tests to add

Unit/integration tests (Jest + Supertest)

- Webhook signature tests (raw-buffer + HMAC): valid signature creates/updates tx, invalid signature returns 403 and no DB changes.
- Webhook discrepant test: payment.captured with paid != amount_cents -> tx.is_discrepant=true AND NO Subscription created.
- Admin assign tests: admin can assign plan; non-admin forbidden. Verify linking to transaction if provided.
- Admin transactions tests: list + detail + filters.
- Idempotency tests: replaying same payment.captured does not create duplicate Subscription.

Frontend work (minimal MVP)

Priority minimal client changes (to unblock payments testing):

1. Update checkout/buy flow to send `{ planId }` to `/api/v1/sub/create-order`. `createOrder` already accepts planId and persists Transaction.
2. Add a simple `GET /api/v1/sub/plans` consumer: plan cards or minimal dropdown to choose plan.

Admin UI (MVP):

1. Transactions list: table showing `is_discrepant`, user, plan, amount_cents, paid_amount_cents, createdAt, actions.
2. Transaction detail modal: show raw_payload, metadata, and 'Assign plan' button which opens assign modal.
3. Assign modal: select plan, optional startDate, optional link to transaction (pre-filled), admin note.

Migration / Backfill

- `server/scripts/migrateUserOrderids.js --dry`: iterate users' `orderids` and create Transaction docs with `metadata.source='migration'` and set status captured if payment id exists.
- `server/scripts/migrateSubscriptions.js --dry`: create Subscription docs from existing `User.subscriptionPlan` & `subon/subexp` and link `metadata.source='migration'`.

Monitoring & ops

- Log and alert on high-volume discrepant txs.
- Add an admin CSV export for `is_discrepant` transactions to support manual audits.

Acceptance criteria (exhaustive)

1. Functional

- Webhook signature verification uses raw body and passes tests (valid/invalid signature paths).
- Discrepant payments: tx.is_discrepant=true, no Subscription auto-created, record visible to admin.
- Admin can assign subscription via API and UI (assign linked to tx when desired) and user quick fields updated.

2. Tests

- All new server tests pass in CI: webhook signature, discrepant flow, admin assign, transactions endpoints.

3. Migration

- Dry-run migration produces consistent mapping report; data creation run is manual and auditable.

Prioritized immediate sprint backlog (concrete tasks)

Sprint Day 1

- Task A: Implement verifyPayment gating for discrepant txs + tests (1.5–2h)
- Task B: Add webhook signature tests (1–2h)

Sprint Day 2

- Task C: Implement adminAssignSubscription controller + route + tests (3–4h)
- Task D: Implement transactions list & detail endpoints + tests (3–4h)

Sprint Day 3 (optional / stretch)

- Task E: Add public plans endpoint/seed (2–3h) if controller not present, and update client to use planId in buy flow (1–2h minimal)

Decisions (confirmed)

- Discrepancy policy: block auto-creation of Subscriptions when a Transaction is discrepant (paid_amount_cents !== amount_cents) — CONFIRMED by you.
- Admin assign mode: assign-only (no `extend` mode) — CONFIRMED by you; admin-assigned subscriptions will replace the user's quick fields and be created from Plan metadata alone.
- Plan billingType: keep `duration_days` and `till_date` as canonical (you confirmed). We will NOT add `one_time` unless you ask.
- Migration dry-run: include migration/backfill dry-run scripts in this sprint to validate mapping on mock data — CONFIRMED by you.

Coverage confirmation

- This sprint document incorporates and reconciles the contents of the following source docs:
  - `RAZORPAY_INTEGRATION_PLAN.md`
  - `SUBS_PLANNING.md`
  - `PROPOSED_ADMIN_SUB_ASSIGN.md`

Operational note: subscription nulling service review

- To review the subscription nulling/cleanup service (jobs that run without API invocation), we need to identify and document the scheduled/background tasks that must run daily or at specific intervals. Example tasks to inventory and consider:
  1. Expiry job: daily job to mark subscriptions as `expired` when `end_date` < now and update `User` quick fields accordingly.
  2. Reminder notifications: scheduled reminders to users (email/push) X days before `subexp`.
  3. Reconciliation sweep: periodic job to find `is_discrepant` transactions older than N days and surface them to admin queue or escalate.
  4. Failed payment retry job: if using capture retries, schedule retries / reconcile failed payments.
  5. Data retention/archival: archive or redact old `raw_payload` beyond retention policy while keeping audit traces.
  6. Migration/repair tasks: one-off migration tasks scheduled as needed (dry-run / apply).

If you want I can produce a separate `docs/pg/SUBS_OPS.md` listing each job with frequency, inputs, outputs, safety checks, and rollback steps.

Next steps I will take if you confirm

With your confirmation on the above decisions, I'll:

1. Mark the todo for backend work in-progress.
2. Implement verifyPayment gating and add webhook signature + discrepant tests.
3. Implement admin assign endpoint + tests.
4. Implement admin transactions endpoints + tests.

If you confirm, I will start on Task A immediately (update `verifyPayment` to block on discrepant txs and add tests). I will run the Jest suite locally and iterate until green.

---

End of finalized sprint plan.
```

# Sprint plan — Razorpay & Subscriptions (finalized)

Date: 2025-10-27
Repo: arc

Purpose

- Produce a single, exhaustive sprint document that:
  - Starts from the `PROPOSED_ADMIN_SUB_ASSIGN.md` proposal and reconciles it with the current codebase.
  - Lists completed, partial, and missing work (backend, UI, tests, migration, ops).
  - Calls out decisions that need explicit confirmation.
  - Delivers a prioritized backlog, acceptance criteria, and next steps for the immediate sprint.

You confirmed: the Plan schema is correct and the `till_date` and `durationDays` semantics are canonical for this work. I will not add `one_time` unless you ask.

Executive summary (short)

- Backend: core models (`Plan`, `Transaction`, `Subscription`) exist and are usable. `createOrder` persists Transactions and `verifyPayment` updates Transactions and creates Subscriptions. Raw webhook body is captured via `server/src/app.js` (express.json verify hook).
- Gap: reconciliation policy in code differs from `PROPOSED_ADMIN_SUB_ASSIGN.md` — code flags `is_discrepant` but still auto-creates Subscriptions; proposal recommends blocking auto-creation for discrepant payments and using an admin-assign flow. Sprint will align behavior to the proposal.
- UI: client-side plan selection and admin UI pages are missing. Plan listing endpoint exists in routes but the controller may be absent or incomplete.
- Tests: webhook signature (raw-body HMAC) tests and admin assign tests are missing. Migration scripts are missing.

Status: Completed / Present (code)

- `server/src/models/Plan.js` — present; fields: finalPriceCents, markupPriceCents, billingType (duration_days, till_date), durationDays, accessUntil, features, metadata.
- `server/src/models/Transaction.js` — present; fields: user, plan, amount_cents (required), paid_amount_cents, currency, razorpay_order_id, razorpay_payment_id, status, raw_payload, metadata, is_discrepant.
- `server/src/models/Subscription.js` — present.
- `server/src/controllers/sub.Controller.js` — contains `createOrder` (persists Transaction), `verifyPayment` (verifies HMAC using req.rawBody, updates/creates Transaction, creates Subscription), `extendSubscription`, `revokeSubscription`, `getAllSubscriptions`.
- `server/src/app.js` — captures raw webhook body via express.json verify hook (req.rawBody) so webhook verification works without express.raw.

Major gaps / missing work (high-level)

1. Reconciliation behavior: webhook currently flags discrepancies but still creates Subscriptions. Needs change to block auto-creation when `is_discrepant === true`.
2. Admin assign endpoint (`POST /api/v1/sub/admin/assign`) missing — required to assign subscriptions after manual reconciliation.
3. Admin transactions endpoints (`GET /api/v1/transactions`, `GET /api/v1/transactions/:id`) missing — required for admin workflows and reconciliation.
4. Webhook signature tests (raw-body HMAC) are missing — add tests for valid/invalid signature and idempotency.
5. Frontend: plan listing, plan buy flow (send planId), Admin UI (Plans, Transactions, Assign) missing.
6. Migration/backfill scripts missing for historical data.

Detailed requirements derived from `PROPOSED_ADMIN_SUB_ASSIGN.md` and code

Admin assign contract (authoritative)

POST /api/v1/sub/admin/assign

- Auth: admin role required (`requireRole('admin')`).
- Body (JSON): { userId: string, planId: string, startDate?: ISO, transactionId?: string, note?: string }
- Behavior:
  - Validate user and plan exist; plan.active must be true.
  - Compute start_date/end_date by plan.billingType (duration_days/till_date) using existing logic (reuse `verifyPayment` logic). If startDate provided use that as start.
  - Create Subscription doc: { user, plan, transaction: transactionId || null, start_date, end_date, status:'active', meta: { assignedBy: adminId, assignedAt, note } }.
  - Update User quick fields: subscriptionPlan, subscriptionSnapshot, subon, subexp, issubexp=false.
  - If transactionId provided, link subscription_id into Transaction.metadata.subscription_id.
  - Return 201 with created Subscription.

Edge & audit rules

- If user has active subscription, admin assign should either replace or extend per optional `mode` param; default: replace. Document behaviour in UI.
- For orphan txs (amount_cents == 0), require manual review — admin assign may still accept and link subscription with `meta.source='admin'`.
- Optional threshold: `RECONCILE_MISMATCH_THRESHOLD_CENTS` can be added later to auto-approve small mismatches; do not implement in sprint.

Controller-level TODOs (code changes)

- In `server/src/controllers/sub.Controller.js`:

  1. Add function `adminAssignSubscription(req,res)` implementing the contract above.
  2. Modify `verifyPayment` to:
     - After updating tx.paid_amount_cents and computing `is_discrepant`, if `tx.is_discrepant === true` then:
       - Do NOT create Subscription.
       - Save tx metadata noting `held_for_reconciliation: true` and return 200.
     - Else (not discrepant) continue with existing creation flow.

- Add `server/src/controllers/transaction.Controller.js` with `listTransactions` and `getTransactionById` helper methods for admin API.

- Routes:
  - Add to `server/src/routes/subs.js` under `requireRole('admin')`:
    - POST `/admin/assign` -> controller.adminAssignSubscription
  - Create `server/src/routes/transactions.js` (or mount in subs) with admin-only endpoints.

Tests to add

Unit/integration tests (Jest + Supertest)

- Webhook signature tests (raw-buffer + HMAC): valid signature creates/updates tx, invalid signature returns 403 and no DB changes.
- Webhook discrepant test: payment.captured with paid != amount_cents -> tx.is_discrepant=true AND NO Subscription created.
- Admin assign tests: admin can assign plan; non-admin forbidden. Verify linking to transaction if provided.
- Admin transactions tests: list + detail + filters.
- Idempotency tests: replaying same payment.captured does not create duplicate Subscription.

Frontend work (minimal MVP)

Priority minimal client changes (to unblock payments testing):

1. Update checkout/buy flow to send `{ planId }` to `/api/v1/sub/create-order`. `createOrder` already accepts planId and persists Transaction.
2. Add a simple `GET /api/v1/sub/plans` consumer: plan cards or minimal dropdown to choose plan.

Admin UI (MVP):

1. Transactions list: table showing `is_discrepant`, user, plan, amount_cents, paid_amount_cents, createdAt, actions.
2. Transaction detail modal: show raw_payload, metadata, and 'Assign plan' button which opens assign modal.
3. Assign modal: select plan, optional startDate, optional link to transaction (pre-filled), admin note.

Migration / Backfill

- `server/scripts/migrateUserOrderids.js --dry`: iterate users' `orderids` and create Transaction docs with `metadata.source='migration'` and set status captured if payment id exists.
- `server/scripts/migrateSubscriptions.js --dry`: create Subscription docs from existing `User.subscriptionPlan` & `subon/subexp` and link `metadata.source='migration'`.

Monitoring & ops

- Log and alert on high-volume discrepant txs.
- Add an admin CSV export for `is_discrepant` transactions to support manual audits.

Acceptance criteria (exhaustive)

1. Functional

- Webhook signature verification uses raw body and passes tests (valid/invalid signature paths).
- Discrepant payments: tx.is_discrepant=true, no Subscription auto-created, record visible to admin.
- Admin can assign subscription via API and UI (assign linked to tx when desired) and user quick fields updated.

2. Tests

- All new server tests pass in CI: webhook signature, discrepant flow, admin assign, transactions endpoints.

3. Migration

- Dry-run migration produces consistent mapping report; data creation run is manual and auditable.

Prioritized immediate sprint backlog (concrete tasks)

Sprint Day 1

- Task A: Implement verifyPayment gating for discrepant txs + tests (1.5–2h)
- Task B: Add webhook signature tests (1–2h)

Sprint Day 2

- Task C: Implement adminAssignSubscription controller + route + tests (3–4h)
- Task D: Implement transactions list & detail endpoints + tests (3–4h)

Sprint Day 3 (optional / stretch)

- Task E: Add public plans endpoint/seed (2–3h) if controller not present, and update client to use planId in buy flow (1–2h minimal)

Questions for you (requires explicit answers)

1. Confirmed: keep Plan billingType set to `duration_days` and `till_date` only. (You confirmed this.)
2. Discrepancy policy: confirm block auto-create on discrepancy (recommended). (Assume YES unless you instruct otherwise.)
3. Admin assign: should the endpoint accept `mode: 'replace'|'extend'`? (Default: replace. Confirm if extend desired.)
4. Migration: do you want me to implement the dry-run scripts in this sprint or schedule for follow-up? (Recommend dry-run in this sprint.)

Next steps I will take if you confirm

- With your confirmation on discrepancy policy and admin assign mode, I'll:
  1. Mark the todo for backend work in-progress.
  2. Implement verifyPayment gating and add webhook signature + discrepant tests.
  3. Implement admin assign endpoint + tests.
  4. Implement admin transactions endpoints + tests.

If you confirm, I will start on Task A immediately (update `verifyPayment` to block on discrepant txs and add test). I will run the Jest suite locally and iterate until green.

---

End of finalized sprint plan.
