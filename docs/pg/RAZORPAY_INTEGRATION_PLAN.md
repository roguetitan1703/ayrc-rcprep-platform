# Razorpay Integration — Implementation & Migration Plan

Date: 2025-10-26
Repo: arc (target)

Goal

- Implement a minimal, secure end-to-end Razorpay payments & subscription flow in this repo that records transactions, assigns subscriptions, supports admin revoke/extend, and verifies webhooks.
- Reuse existing design choices where applicable (server-authoritative Plan.finalPriceCents, webhook-driven mapping to Plan) and add missing persistence and admin tooling.

High-level summary of gaps (source repo vs this repo)

- Source repo (GiRi_sub_back) persists `Transaction` and `Subscription` models and stores razorpay_order_id / payment_id and raw payloads. Target repo currently:
  - Has Plan model and `sub.Controller.verifyPayment` which updates `User` (pushes orderids) and sets subscriptionPlan/subexp.
  - DOES NOT have a dedicated `Transaction` model or `Subscription` model; thus transactions, invoices and reconciliation are not persisted.
- Webhook verification in source uses raw body HMAC; target's webhook already reads `req.rawBody` and does signature verify if RAZORPAY_WEBHOOK_SECRET is set — but we must ensure express.raw is used for the webhook route so verification is robust.

Minimum required changes (what we will implement)

1.  Add `Transaction` Mongoose model (store razorpay ids, amount_cents, currency, planId, userId, status, rawPayload, createdAt)
2.  Add (optional but recommended) `Subscription` model to represent user subscriptions per plan/channel; alternatively continue to set `User.subscriptionPlan` but also link Subscription docs to Transactions.
3.  On `createOrder` (POST /api/v1/sub/create-order): create a Transaction doc with status `created` and razorpay_order_id returned by Razorpay (server stores razorpay_order_id immediately after creating order). Use plan.finalPriceCents as the authoritative amount.
4.  On `verifyPayment` (webhook POST /api/v1/sub/verify-payment): verify signature (if secret present), then update Transaction: set razorpay_payment_id, status (`captured`/`failed`), rawPayload, and perform idempotent activation of Subscription(s) and/or update User.subscriptionPlan. Ensure we respond 200 even on missing/malformed payloads but log for manual reconciliation, except signature failures (403).
5.  Add admin transaction endpoints: GET /api/v1/transactions, GET /api/v1/transactions/:id, GET /api/v1/transactions/incomplete (optional), and optionally POST /api/v1/transactions/:id/refund to trigger refund (later).
6.  Add unit/integration tests: mocked Razorpay for createOrder, webhook signature tests, idempotency tests, admin flows tests.

Detailed schemas (Mongoose) — copy/paste ready

Transaction (new file: `server/src/models/Transaction.js`)

```javascript
import mongoose from 'mongoose'

const TransactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    plan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', default: null },
    amount_cents: { type: Number, required: true }, // amount in paise
    currency: { type: String, default: 'INR' },
    razorpay_order_id: { type: String, required: true, index: true },
    razorpay_payment_id: { type: String, default: null, index: true },
    status: {
      type: String,
      enum: ['created', 'authorized', 'captured', 'failed', 'refunded'],
      default: 'created',
    },
    raw_payload: { type: Object }, // raw webhook payload for audit
    metadata: { type: Object, default: {} }, // notes/receipt/channel info
  },
  { timestamps: true }
)

export const Transaction = mongoose.model('Transaction', TransactionSchema)
```

Notes:

- Store `amount_cents` (integer) to avoid floating errors. When creating a Razorpay order use `amount_cents` directly.
- `metadata` should include planId, planSlug, userId, channelId, receiptId.

Subscription (recommended) `server/src/models/Subscription.js`

```javascript
import mongoose from 'mongoose'

const SubscriptionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    plan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', required: true },
    transaction: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction', default: null },
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true, index: true },
    status: { type: String, enum: ['active', 'expired', 'revoked', 'pending'], default: 'active' },
    meta: { type: Object, default: {} },
  },
  { timestamps: true }
)

export const Subscription = mongoose.model('Subscription', SubscriptionSchema)
```

Mapping to existing user model

- Keep `User.subscriptionPlan` for quick checks, but also create Subscription docs and set `User.subscriptionPlan = subscription.plan` and `User.subon/subexp` consistent with subscription start/end. This gives both fast checks and historical records.

Endpoint changes and additions

Existing endpoints to update

- POST /api/v1/sub/create-order (createOrder)
  - After creating Razorpay order (or mocking failure), create a Transaction doc with fields: user, plan, amount_cents, razorpay_order_id, status:'created', metadata: notes. Return order to client as before.
- POST /api/v1/sub/verify-payment (verifyPayment webhook)
  - Verify signature using `req.rawBody` + RAZORPAY_WEBHOOK_SECRET. On `payment.captured` do:
    1.  Find Transaction by razorpay_order_id.
    2.  If not found: create a Transaction with status 'captured' (but log this as 'orphan').
    3.  If found and status already 'captured', return 200 (idempotent).
    4.  Else update transaction. Save raw_payload.
    5.  Create Subscription document(s) or extend existing subscription and link it to Transaction.
    6.  Update User.subscriptionPlan/subon/subexp to reflect the canonical plan.

New endpoints to add

- GET /api/v1/transactions (admin) — list transactions with filters (status, user, plan, date range)
- GET /api/v1/transactions/:id — transaction detail including raw_payload
- POST /api/v1/transactions/:id/refund — create refund (optional)
- (Optional) POST /api/v1/sub/admin/assign — admin assign a plan to a user (creates Subscription & Transaction record with admin_note)

Security and webhook wiring

- Add `express.raw({ type: 'application/json' })` middleware specifically for the webhook route OR mount a small express app/route before `express.json()` to capture raw buffer. Example:

```js
// in server/src/app.js (or routes/webhooks.js)
app.post(
  '/api/v1/sub/verify-payment',
  express.raw({ type: 'application/json' }),
  subController.verifyPayment
)
```

- verify signature in `verifyPayment` using HMAC-SHA256 over `req.body` raw buffer. Use `crypto.timingSafeEqual` and a known-length hex digest.
- Reject with 403 on signature mismatch.

Data flow: client -> server -> Razorpay -> webhook -> server

- Client requests order from server: POST /api/v1/sub/create-order { planId }
- Server: validates plan, creates Razorpay order using plan.finalPriceCents (paise), persist Transaction with razorpay_order_id and status 'created'. Return order.id and keyId to client.
- Client opens Razorpay Checkout with order id and completes payment.
- Razorpay auto-captures (payment_capture: 1). Razorpay posts webhook payment.captured to server.
- Server verifies signature, locates Transaction by order id, updates payment id/status, stores raw payload, activates subscription (creates Subscription doc and updates User). Return 200.

Tests to add (minimum)

1.  createOrder unit tests
    - Mock Razorpay.orders.create to return order.id. Assert Transaction created with correct fields and status 'created'.
    - Missing planId and inactive plan => 400.
2.  verifyPayment signature tests
    - Valid signature and payment.captured => Transaction updated, Subscription created, User updated.
    - Invalid signature => 403 and no DB changes.
3.  verifyPayment idempotency
    - Replay payment.captured webhook (same order id) => no duplicate Subscription created, Transaction unchanged.
4.  Admin endpoints
    - Revoke subscription => Subscription.status='revoked' and User fields updated.
5.  Integration test for full flow (mocked Razorpay SDK but real DB using mongodb-memory-server): create order -> simulate webhook -> assert subscription created and transaction recorded.

E2E considerations (optional)

- If you want true E2E with Razorpay sandbox, reserve it for a staging environment using test API keys; do not run in CI.
- For CI/unit, always mock the Razorpay SDK.

Migration & data backfill (if you already have users and orderids)

- Create Transaction records for existing `User.orderids` entries: parse user.orderids array (which currently holds objects with razorpay ids) and create Transaction docs mapping to users and plans if notes exist. Mark status based on presence of payment id.
- Create Subscription docs from existing `User.subscriptionPlan` and `subon/subexp` if present; link these Subscriptions to a synthetic Transaction record with `metadata.source='migration'`.

Implementation plan (priority-ordered tasks)

1.  Add Transaction and Subscription models. (small)
2.  Update `createOrder` controller to persist Transaction after creating Razorpay order. Add tests mocking Razorpay. (medium)
3.  Update `verifyPayment` webhook flow:
    - Ensure route uses express.raw and validate signature.
    - Update Transaction, store raw_payload, idempotent activation of Subscription and update User. (medium)
4.  Add admin endpoints for transactions and subscription management and tests. (small)
5.  Add integration tests (mongodb-memory-server) to cover the full create-order -> webhook flow. (medium)
6.  Optional: add refund endpoint and reconciliation jobs. (low)

Estimated time (developer with repo knowledge)

- Models & small wiring: 1-2 hours
- createOrder persistence and unit tests: 1-2 hours
- webhook signature wiring & subscription activation: 2-4 hours
- admin endpoints + tests: 1-2 hours
- integration tests: 1-2 hours
- total: ~6-12 hours (spread across 1-2 days with testing and review)

Example code snippets

HMAC verification snippet (use req.rawBody):

```javascript
import crypto from 'crypto'

function verifySignature(rawBody, signature, secret) {
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
  return (
    Buffer.from(expected).length === Buffer.from(signature).length &&
    crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
  )
}
```

createOrder (controller sketch):

```javascript
// assumes razorpay instance available
const options = { amount: plan.finalPriceCents, currency: plan.currency || 'INR', receipt, notes }
const order = await razorpay.orders.create(options)
const tx = await Transaction.create({
  user,
  plan: plan._id,
  amount_cents: options.amount,
  razorpay_order_id: order.id,
  status: 'created',
  metadata: notes,
})
res.json({ order, txId: tx._id })
```

verifyPayment (webhook sketch):

```javascript
// receives express.raw body
if (!verifySignature(req.body, sigHeader, process.env.RAZORPAY_WEBHOOK_SECRET))
  return res.status(403).end()
const payload = JSON.parse(req.body.toString())
if (payload.event === 'payment.captured') {
  const orderId = payload.payload.payment.entity.order_id
  const paymentId = payload.payload.payment.entity.id
  const tx = await Transaction.findOne({ razorpay_order_id: orderId })
  if (!tx) {
    // create orphan tx and flag for manual reconciliation
  } else if (tx.status === 'captured') {
    return res.status(200).end() // idempotent
  } else {
    tx.razorpay_payment_id = paymentId
    tx.status = 'captured'
    tx.raw_payload = payload
    await tx.save()
    // create subscription linked to tx
  }
}
res.status(200).json({ ok: true })
```

Deliverable checklist (what I will deliver if you ask me to implement)

- `server/src/models/Transaction.js` and `server/src/models/Subscription.js`
- Controller updates to `createOrder` and `verifyPayment` with transaction persistence and signature verification
- New admin endpoints for transactions and subscription management
- Unit + integration Jest tests (mocked Razorpay + mongodb-memory-server)
- Migration script to backfill Transaction and Subscription from existing User.orderids and subscription fields
- A short README `docs/pg/RAZORPAY_README.md` describing env vars and how to run tests locally and in CI

Next immediate action

- If you want I will implement tasks 1–3 in a single PR: add models, update createOrder to persist Transaction, and update verifyPayment to update Transaction & create Subscription with signature verification and tests. Confirm and I will start implementing.

---

End of plan
