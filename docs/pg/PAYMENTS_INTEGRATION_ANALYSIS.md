# Payments Integration Analysis — Razorpay

Date: 2025-10-26
Repository: GiRi_sub_back (source)

## Executive summary

This repository implements a server-side Razorpay integration for subscriptions and single payments using Razorpay Orders (server-side order creation), auto-capture (payment_capture: 1), webhook processing, and local transaction/subscription persistence. The integration covers: creating Razorpay orders from server endpoints (subscription and transaction flows), handling Razorpay webhooks (payment.captured, payment.failed) to update Transaction records and activate or extend Subscriptions, and basic reconciliation/invoice lookup utilities.

Primary components:

- Frontend checkout (not tightly coupled here) uses server-provided orderId and keyId to render Razorpay Checkout.
- Server order creation: `paymentService.createRazorpayOrder` is the single point creating Razorpay orders (wrapper around `razorpay.orders.create`).
- Webhook handling: `transactionController.handleRazorpayWebhook` consumes webhook events and updates `Transaction` records and invokes `activateSubscription` to create/extend subscriptions.
- DB models: `Transaction`, `Subscription`, `Plan`, and `User` store transaction and subscription state.

## Code provenance & mapping (read-first list)

Ordered by importance (file path — one line description + key excerpt):

1. backend/src/services/paymentService.js — Razorpay SDK wrapper; creates orders, fetches invoices, placeholder for payouts.

Excerpt (createRazorpayOrder):

```js
// services/paymentService.js
exports.createRazorpayOrder = async (
  amount,
  currency = "INR",
  receiptId,
  notes
) => {
  // Razorpay expects amount in smallest currency unit (paise for INR)
  const amountInPaise = Math.round(amount * 100);
  const options = {
    amount: amountInPaise,
    currency: "INR",
    receipt: receiptId,
    payment_capture: 1,
    notes,
  };
  const order = await razorpayInstance.orders.create(options);
  return order;
};
```

File: `backend/src/services/paymentService.js` (see full file for init and extra helpers).

2. backend/src/controllers/transactionController.js — Webhook handler, transaction lifecycle, activateSubscription (creates/extends subscriptions, generates invoice).

Excerpt (webhook switch handling payment.captured):

```js
// controllers/transactionController.js
case "payment.captured":
  const orderId = payload?.payment?.entity?.order_id;
  const paymentId = payload?.payment?.entity?.id;
  const transaction = await Transaction.findOneAndUpdate(
    { razorpay_order_id: orderId },
    { razorpay_payment_id: paymentId, status: "captured" }
  );
  await activateSubscription(transaction, action);
```

Also contains: `activateSubscription(transaction, action)` which creates/extends Subscription documents, generates invoice via `assetService.generateInvoice`, and updates Transaction with subscription references and invoice URL.

3. backend/src/controllers/subscriptionController.js — endpoints to initiate upgrades/renewals. Calls `paymentService.createRazorpayOrder` and inserts `Transaction` documents with `status: 'created'` and `razorpay_order_id`.

Excerpt (creating order & transaction):

```js
const notes = {
  userid: userId,
  planid: new_plan_id,
  comboid: new_combo_id,
  subscriptionid: subscriptionId,
  action,
};
const receiptId = `upgrade_${Date.now()}`;
const razorpayOrder = await paymentService.createRazorpayOrder(
  upgradeCost,
  currency,
  receiptId,
  notes
);
await Transaction.create({
  user_id: userId,
  amount: upgradeCost,
  currency,
  razorpay_order_id: razorpayOrder.id,
  status: "created",
  subscription_id: subscription._id,
  subscriptions: subTransaction.subscriptions,
});
```

4. backend/src/routes/webhookRoutes.js — mounts `/webhooks/razorpay` -> `transactionController.handleRazorpayWebhook`.

Excerpt:

```js
// routes/webhookRoutes.js
router.post("/razorpay", transactionController.handleRazorpayWebhook);
```

5. backend/src/models/Transaction.js — Transaction schema (Mongoose). Key fields: razorpay_order_id, razorpay_payment_id, amount, currency, status, subscription refs.

Excerpt (schema fields):

```js
amount: { type: Number, required: true, min: 0 },
currency: { type: String, default: "INR", uppercase: true, required: true },
razorpay_order_id: { type: String, required: true, index: true },
razorpay_payment_id: { type: String, index: true, default: null },
status: { type: String, required: true, enum: ["created","authorized","captured","failed"], default: "created" }
```

File: `backend/src/models/Transaction.js`.

6. backend/src/models/Subscription.js — Subscription schema. Key fields: user_id, plan_id, channel_id, start_date, end_date, status. Hooks to mark expired and to add channel to User on save.

Excerpt:

```js
start_date: { type: Date, required: true },
end_date: { type: Date, required: true, index: true },
status: { type: String, required: true, enum: ["active","expired","pending","revoked","kycSub","agsign"], default: "kycSub" },
```

7. backend/src/models/Plan.js — Plan schema (price fields, channel mapping via channel_id).

Excerpt:

```js
markup_price: { type: Number, min: 0, required: true },
discounted_price: { type: Number, default: null },
validity_days: { type: Number, required: true, min: 1 },
channel_id: { type: mongoose.Schema.Types.ObjectId, ref: "Channel", required: true }
```

8. backend/src/utils/webhookHelper.js — helper to verify Razorpay webhook signatures (HMAC SHA256 + timingSafeEqual). Not clearly wired in controller code (see discussion below).

Excerpt:

```js
const hmac = crypto.createHmac("sha256", secret);
hmac.update(rawBody);
const generatedSignature = hmac.digest("hex");
return crypto.timingSafeEqual(
  Buffer.from(generatedSignature),
  Buffer.from(signature)
);
```

9. backend/server.js — Express app; note: webhook routes are mounted after `express.json()` in the current file, which would break raw-body signature verification if raw body logic is required; `project_structure.json` mentions alternate ordering to mount express.raw for `/api/v1/webhooks/razorpay` before express.json.

Excerpt:

```js
app.use(express.json({ limit: "10kb" }));
// ...
app.use(`${apiBase}/webhooks`, webhookRoutes);
```

10. backend/test/webhooks.test.mjs — tests for webhook flows; stubs `webhookHelper.verifyRazorpaySignature` and tests idempotency and payment.captured & payment.failed logic.

Excerpt (test uses signature header):

```js
const res = await request(app)
  .post("/api/v1/webhooks/razorpay")
  .set("X-Razorpay-Signature", signature)
  .set("Content-Type", "application/json")
  .send(payload)
  .expect(200);
```

---

## Automated search checklist (matches)

Below are repository-wide matches for the tokens requested (only backend paths shown where applicable). Each line: filePath : lineNumber : matched code line excerpt.

(Note: these are the most relevant hits; tests and docs also reference these tokens.)

- "razorpay"

  - backend/src/services/paymentService.js : (multiple) e.g. `const Razorpay = require("razorpay");` and `razorpayInstance = new Razorpay({ key_id: keyId, key_secret: keySecret });`
  - backend/src/controllers/subscriptionController.js : `const razorpayOrder = await paymentService.createRazorpayOrder(...)`
  - backend/src/controllers/transactionController.js : logs like `WEBHOOK_RAZORPAY_*` and webhook handling for razorpay events.
  - backend/config.env : RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET present (example/test values).
  - backend/package.json : lists dependency "razorpay".

- "orders.create" / "orders.create"

  - backend/src/services/paymentService.js : `const order = await razorpayInstance.orders.create(options);` (order creation)

- "payments.create"

  - None exact; the code uses `razorpayInstance.payments.fetch(...)` and mentions `payments.capture` in comments but no server-side capture calls are present (see capture section below).

- "capture"

  - backend/src/services/paymentService.js : uses `payment_capture: 1` when creating order -> auto-capture
  - No explicit `razorpay.payments.capture` calls found in codebase (search returned none).

- "payment.captured" and other webhook events

  - backend/src/controllers/transactionController.js : `case "payment.captured":` (handles captured) and `case "payment.failed":`

- "x-razorpay-signature" / "X-Razorpay-Signature"

  - test/webhooks.test.mjs : sets header `X-Razorpay-Signature`
  - utils/webhookHelper.js expects a signature value; but wiring is ambiguous (see Webhook verification section).

- "order_id" and "payment_id" usage

  - backend/src/controllers/transactionController.js : `const orderId = payload?.payment?.entity?.order_id; const paymentId = payload?.payment?.entity?.id;`
  - backend/src/services/paymentService.js : `receipt: receiptId` used when creating order
  - backend/src/models/Transaction.js : fields `razorpay_order_id` and `razorpay_payment_id`.

- "receipt" and "notes" in order creation

  - backend/src/services/paymentService.js : options include `receipt` and `notes` and sample notes passed from subscriptionController/transaction flows.

- "transaction", "transactions", "txn", "payments" as DB model names

  - backend/src/models/Transaction.js : Transaction schema
  - transactionController and transactionRoutes provide endpoints for creating orders and viewing transactions.

- "subscription" + "plan" + "channel"
  - subscriptionController.js: references plan_id, combo_id, channel_id, and passes these values into notes when creating orders to preserve context.
  - Plan model has `channel_id` field linking Plan -> Channel.

(If you need the complete machine parse of all matched files and lines, see the JSON summary produced alongside this document.)

## DB schema extraction

Below are the Mongoose model fields relevant to payments/orders/subscriptions (extracted verbatim from model files).

1. Transaction (file: `backend/src/models/Transaction.js`)

- user_id: ObjectId -> User (required, indexed)
- subscription_id: ObjectId -> Subscription (index, default: null)
- combo_id: ObjectId -> Combo (default: null)
- subscriptions: [ObjectId] -> array of Subscription refs
- plan_id: ObjectId -> Plan (optional)
- channel_id: ObjectId -> Channel (optional)
- referralCode: String
- amount: Number (required, min:0) — stored as units (e.g., rupees), code uses paise when talking to Razorpay
- currency: String (default INR, uppercase)
- razorpay_order_id: String (required, index) — holds RZP order id
- razorpay_payment_id: String (index, default null) — holds RZP payment id
- razorpay_invoice_id: String (default null) — optional RZP invoice id
- status: String enum ["created","authorized","captured","failed"] (default: "created")
- invoice_url: String (optional)
- timestamps: createdAt, updatedAt

Razorpay IDs fields: razorpay_order_id, razorpay_payment_id, razorpay_invoice_id
Amounts: `amount` (stored in currency units), while createRazorpayOrder multiplies by 100 to paise.
Subscription/plan/channel references: subscription_id, subscriptions[], plan_id, combo_id, channel_id.

2. Subscription (file: `backend/src/models/Subscription.js`)

- user_id: ObjectId -> User (required)
- plan_id: ObjectId -> Plan
- channel_id: ObjectId -> Channel (required)
- combo_id: ObjectId -> Combo (default null)
- link_id: ObjectId -> Link (default null)
- start_date: Date (required)
- end_date: Date (required)
- status: String enum ["active","expired","pending","revoked","kycSub","agsign"] default 'kycSub'
- from_subscription_id: ObjectId -> Subscription (previous subscription link)
- telegramUser_id: String
- digio_document_id, digio_signing_url: Strings
- timestamps: createdAt, updatedAt

Razorpay IDs: Not stored directly on Subscription — Transaction stores razorpay ids and Subscription references transaction via `subscription_id`.

3. Plan (file: `backend/src/models/Plan.js`)

- name: String
- markup_price: Number (required) — canonical price in currency units
- discounted_price: Number (nullable)
- validity_days: Number (required)
- description: String
- is_active: Boolean
- channel_id: ObjectId -> Channel (required)
- virtuals: discount_percentage

Plan -> Channel link: `channel_id`.

4. User (file: `backend/src/models/User.js`)

- channels: [ObjectId] — list of Channel ids the user belongs to; subscription post-save hook adds channel on active subscription
- other user identity fields (phone, telegram_id, referralCode)

No SQL/migration DDL found; repository uses Mongoose models only.

## Webhook & idempotency logic

1. Signature verification implementation

- There is a helper at `backend/src/utils/webhookHelper.js` which computes HMAC-SHA256 of the raw request body with the configured secret and compares to the `X-Razorpay-Signature` header via `crypto.timingSafeEqual`.

Exact code excerpt:

```js
// utils/webhookHelper.js
const hmac = crypto.createHmac("sha256", secret);
hmac.update(rawBody);
const generatedSignature = hmac.digest("hex");
return crypto.timingSafeEqual(
  Buffer.from(generatedSignature),
  Buffer.from(signature)
);
```

- Ambiguity: I did not find code that calls `verifyRazorpaySignature` inside `transactionController.handleRazorpayWebhook` or webhookRoutes; the tests stub `webhookHelper.verifyRazorpaySignature` and expect verification to be applied. The Express `server.js` currently applies `express.json()` globally and mounts webhook routes after it, which will not provide raw request body buffer for HMAC unless changed to use `express.raw()` on the webhook route or a signature middleware is installed earlier. There is a `project_structure.json` note suggesting the correct order (apply `express.raw({ type: 'application/json' })` for `/api/v1/webhooks/razorpay` before `app.use(express.json())`). So currently verification wiring is 'ambiguous / not found' — tests stub the verification helper but the application's runtime code path does not show an actual call, therefore recommend adding explicit verification middleware for `/webhooks/razorpay`.

Recommendation (minimal secure behavior):

- Ensure app mounts express.raw for `/api/v1/webhooks/razorpay` before express.json, or in `webhookRoutes` use a wrapper route that reads rawBody and runs verifyRazorpaySignature. Example (pseudo):

```js
app.post(
  "/api/v1/webhooks/razorpay",
  express.raw({ type: "application/json" }),
  (req, res, next) => {
    const sig = req.get("X-Razorpay-Signature");
    if (
      !webhookHelper.verifyRazorpaySignature(
        req.body,
        sig,
        process.env.RAZORPAY_WEBHOOK_SECRET
      )
    )
      return res.status(403).end();
    // Parse JSON: const payload = JSON.parse(req.body.toString()); set req.body = payload; next();
  },
  webhookController.handleRazorpayWebhook
);
```

2. Raw body used for HMAC

- `webhookHelper.verifyRazorpaySignature` assumes the raw request body (Buffer or string) is used as input to HMAC. This is the correct approach.

3. Idempotency logic

- `transactionController.handleRazorpayWebhook` demonstrates idempotency checks:
  - For payment.captured: it does `findOneAndUpdate({ razorpay_order_id: orderId }, { razorpay_payment_id: paymentId, status: 'captured' })`. If transaction not found it logs; activation proceeds only if transaction exists.
  - Tests simulate idempotency by pre-marking a transaction as captured and ensuring webhook processing doesn't overwrite `razorpay_payment_id` or create a new subscription.
  - For `payment.failed`: the handler uses `findOneAndUpdate({ razorpay_order_id: failedOrderId, status: { $ne: "failed" } }, { $set: { status: "failed", razorpay_payment_id: failedPaymentId }}, { new: true })` — this avoids marking an already-failed tx again.

4. Retries/queueing

- No explicit retry or queuing logic found. The webhook handler returns HTTP 200 quickly after processing; errors are caught and logged. Recommendation: for heavy operations (activateSubscription, invoice generation), consider pushing to a job queue to ensure deterministic retries.

## Payment capture and transaction recording

1. Auto-capture vs manual capture

- Order creation uses `payment_capture: 1` (see `createRazorpayOrder` in `paymentService.js`), which instructs Razorpay to auto-capture payments. There is no explicit server-side `razorpay.payments.capture` call in codebase. Therefore the integration expects Razorpay to auto-capture.

2. Where payment capture is handled

- Razorpay will auto-capture; the webhook handler specifically listens for `payment.captured` events. When a `payment.captured` webhook arrives, the server updates the `Transaction` and invokes `activateSubscription` to create/extend subscriptions.

3. Transaction persistence: which fields saved

- On order creation: Transaction doc created with fields: user_id, plan_id/combo_id, channel_id, referralCode, amount (currency units), currency, razorpay_order_id, status: "created".
- On webhook capture: Transaction updated with razorpay_payment_id and status: "captured". Later, `activateSubscription` updates Transaction with: subscriptions (array), subscription_id (single for single-plan), razorpay_invoice_id (set to razorpay_order_id as placeholder), invoice_url (generated invoice URL).

4. Reconciliation/admin UI

- There are endpoints to get transactions: GET `/api/v1/transactions` (admin), GET `/api/v1/transactions/incomplete`, GET `/api/v1/transactions/:id`, and GET `/api/v1/transactions/:id/invoice` (redirects to invoice_url if present). There is also `getReconciliationData` which collects local transactions and would fetch Razorpay payouts (not implemented yet) — placeholder.

## Plan/channel model & mapping

- Channels are represented by a `Channel` model (not fully listed here) and Plans reference a `channel_id` (Plan.channel_id). Combo model supports multiple included channels (Combo.included_channels). `Plan` has `channel_id` linking a plan to a specific channel.
- Order creation includes `notes` containing `userid`, `planid`, `comboid`, `subscriptionid`, `action` so the webhook can identify plan/channel context when processing.
- SubscriptionController and Transaction flows pass channel context into Transaction documents (channel_id field), which `activateSubscription` uses to create Subscription per-channel or per-combo as needed.

## User and subscription lifecycle

1. How subscriptions are created from webhook

- On `payment.captured`, `transactionController.handleRazorpayWebhook` finds the transaction by `razorpay_order_id`, marks status: captured, sets `razorpay_payment_id`, then calls `activateSubscription(transaction, action)`.
- `activateSubscription` will either:
  - For upgrade: extend end_date on existing subscriptions or set plan_id and extend.
  - For new/renew: create Subscription documents per included channel (for combo) or single channel for plan, set start_date to now, end_date to now + validity_days, set status depending on KYC settings (kycSub/pending/active), create a Link document (invite link) and send notifications.
- After creating subscriptions, `activateSubscription` updates Transaction with `subscriptions` array, `subscription_id` (single plan case), and invoice info.

2. Fields set on Subscription / User

- Subscription: start_date, end_date, status (active/pending/kycSub/etc.), channel_id, plan_id/combo_id, link_id.
- User: On subscription post-save hook, if subscription.status === 'active', `$addToSet` channel_id to User.channels (so channels are recorded on User document).

3. Snapshot vs canonical reference

- The code stores canonical `plan_id` on Subscription (not denormalized snapshot). No denormalized plan snapshot noted. Invoice generation references plan/channel names at activation time.

4. Revoke/extend actions

- Extend: `extendSubscription` adds days to end_date and sets status to active if expired.
- Revoke: `revokeSubscription` sets subscription.status = 'revoked' and triggers a webhook notification to an external n8n endpoint, and logs action.

## Errors, refunds, and reconciliation

- Failed payments: handled in `payment.failed` case — transaction status set to `failed`, razorpay_payment_id stored, and logged.
- Refunds: I did not find explicit refund API calls (e.g., `razorpay.payments.refund`) in code. `paymentService` has placeholders for invoices/payouts and reconciliation but no refund implementation — mark as _not found / optional_.
- Reconciliation: `getReconciliationData` exists but actual Razorpay payout/fetch logic is unimplemented; `paymentService.fetchRazorpayPayouts` is a placeholder. Recommend implementing payouts/settlements fetch and delta comparison.
- Manual reconciliation: Transaction documents store raw invoice_url and payment IDs for manual lookup. `transactionController.getTransactionInvoice` can redirect to stored `invoice_url`.

## Security and config

Environment variables used (observed):

- RAZORPAY_KEY_ID
- RAZORPAY_KEY_SECRET
- RAZORPAY_KEY_ID_PROD
- RAZORPAY_KEY_SECRET_PROD
- (Recommended) RAZORPAY_WEBHOOK_SECRET — helper expects a secret but I did not find it referenced directly; tests compute HMAC using `process.env.RAZORPAY_KEY_SECRET`.

Notes:

- The code uses `payment_capture: 1` (auto-capture) so server-side capture calls are not needed.
- Webhook verification: helper exists but not clearly invoked in the live handler; ensure raw-body parsing and verification are in place. Without verification, webhooks are insecure.
- There is no explicit rate-limiting or IP allowlist middleware on webhook endpoint. Consider adding rate limiting and signature verification.

## Tests coverage and CI

- Tests referencing Razorpay/payment flows:

  - backend/test/webhooks.test.mjs — tests for webhook processing including idempotency and signature behavior (stubs verification helper).
  - backend/test/transactions.test.mjs — tests for order creation (`POST /transactions/order`) and `/transactions/verify` flows; stubs `paymentService.createRazorpayOrder`.

- Test strategy used:

  - Razorpay SDK is stubbed in tests (createRazorpayOrder stubbed), webhook signature helper is stubbed in webhooks tests.
  - An in-memory MongoDB (`mongodb-memory-server`) is used for tests.

- CI: No CI config inspected in this analysis (not required), but tests appear runnable with `npm test` (project has tests).

## Concrete minimal extraction for target repo

Priority-ordered minimal items to implement in target repo (small and secure):

1. Persist transactions (Mongoose schema recommended)

- Minimal Mongoose Transaction schema (create in target repo)

```js
const transactionSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    plan_id: { type: mongoose.Schema.Types.ObjectId, ref: "Plan" },
    combo_id: { type: mongoose.Schema.Types.ObjectId, ref: "Combo" },
    channel_id: { type: mongoose.Schema.Types.ObjectId, ref: "Channel" },
    amount: { type: Number, required: true }, // units (INR)
    currency: { type: String, default: "INR" },
    razorpay_order_id: { type: String, required: true, index: true },
    razorpay_payment_id: { type: String, default: null },
    status: {
      type: String,
      enum: ["created", "authorized", "captured", "failed"],
      default: "created",
    },
    subscriptions: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Subscription" },
    ],
    subscription_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      default: null,
    },
    invoice_url: String,
  },
  { timestamps: true }
);
```

2. Persist subscription records (Mongoose schema)

```js
const subscriptionSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    plan_id: { type: mongoose.Schema.Types.ObjectId, ref: "Plan" },
    combo_id: { type: mongoose.Schema.Types.ObjectId, ref: "Combo" },
    channel_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
      required: true,
    },
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    status: {
      type: String,
      enum: ["active", "expired", "pending", "revoked"],
      default: "pending",
    },
  },
  { timestamps: true }
);
```

3. Order creation endpoint (server)

- POST /api/v1/sub/create-order or POST /api/v1/transactions/order
- Request: { plan_id: string, isCombo?: boolean, link_slug?: string }
- Server logic:
  - Validate plan/combo and channel associations
  - Compute amount (plan.discounted_price or markup_price)
  - Create a Transaction document with status='created'
  - Call Razorpay SDK to create order: amountInPaise = Math.round(amount \* 100)
  - Pass `notes` in order with { userid, planid, comboid, channelid }
  - Return { orderId: razorpayOrder.id, amount: razorpayOrder.amount, currency, razorpayKeyId }

Example request & response (minimal):
Request:

```json
{ "plan_id": "64a...", "isCombo": false }
```

Response 201:

```json
{
  "status": "success",
  "data": {
    "orderId": "order_ABC123",
    "amount": 50000,
    "currency": "INR",
    "razorpayKeyId": "rzp_live_xxx"
  }
}
```

4. Webhook handling

- POST /api/v1/webhooks/razorpay (public)
- Security: Use express.raw({type:'application/json'}) for this route (so req.body is Buffer) OR capture raw body in middleware. Then compute HMAC SHA256 as:
  - HMAC input: rawBody (exact bytes sent by Razorpay)
  - Secret: RAZORPAY_WEBHOOK_SECRET (or RAZORPAY_KEY_SECRET if used)
  - HMAC: hex digest
  - Compare to header: `X-Razorpay-Signature` using timingSafeEqual
- On verification failure: return 403
- On success: parse JSON (JSON.parse(rawBody.toString())) and handle `event` values

Example signature computation (JS):

```js
const signature = crypto
  .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
  .update(rawBody)
  .digest("hex");
```

Handle events (idempotent patterns):

- payment.captured: find transaction by razorpay_order_id, if not found log, else if status !== 'captured' update { status: 'captured', razorpay_payment_id } and invoke activation logic (create/extend subscriptions) in idempotent manner (check if subscription already set).
- payment.failed: find transaction with status != 'failed' and set to 'failed' with payment id.

5. Admin endpoints

- Assign/revoke/extend subscription: endpoints similar to `extendSubscription` and `revokeSubscription` in `subscriptionController`.
- Query transactions: `GET /api/v1/transactions` with filters.

6. Tests

- Unit tests: mock Razorpay SDK (stub orders.create) and assert Transaction creation.
- Webhook tests: test signature verification (happy and bad signature), idempotency (replaying captured webhook should not create second subscription or overwrite payment id), payment.failed handling.

## Example webhook payload (trimmed) and HMAC computation

Payload (trimmed):

```json
{
  "event": "payment.captured",
  "payload": {
    "payment": {
      "entity": {
        "id": "pay_123",
        "order_id": "order_abc",
        "amount": 10000,
        "currency": "INR",
        "notes": { "userid": "64a...", "planid": "64b..." }
      }
    }
  }
}
```

HMAC validation (exact):

- rawBody = exact bytes received (do NOT re-stringify parsed object)
- generated = crypto.createHmac('sha256', WEBHOOK_SECRET).update(rawBody).digest('hex')
- compare generated to header `X-Razorpay-Signature` using timingSafeEqual

## Edge cases and tests (recommended)

List of at least 6 test cases the target repo should include:

1. Order creation: valid plan -> creates Transaction (status 'created') and returns Razorpay order info (mock SDK). Assert amount units saved correctly.
2. Verify payment success (/transactions/verify): correct HMAC, existing transaction, status moves to 'captured', subscription created and linked. (Integration test with real DB but with mocked Razorpay SDK).
3. Webhook signature failure: invalid or missing signature -> webhook returns 403 and does not process payload.
4. Webhook idempotency: replay payment.captured after transaction already captured -> must not create duplicate subscription or overwrite original payment id.
5. Payment failed webhook: transaction moved to 'failed' and logs created.
6. Missing plan/channel: order creation should return 404 or 400 when plan not found or plan not active.

Example test payloads are provided in the Postman/curl section below.

## Migration and mapping guidance

If source repo has richer fields (combos, coupons, discounts), decide minimal vs optional:

- Essential fields to migrate: Transaction.{user_id, amount, currency, razorpay_order_id, razorpay_payment_id, status, plan_id/combo_id, channel_id, subscription_id}
- Optional fields: invoice_url, razorpay_invoice_id, referralCode, subscriptions array, raw webhook payload

Migration sketch (pseudocode):

1. Export source Transactions where status in ["captured","created","failed"].
2. For each record, map fields: source.razorpay_order_id -> target.razorpay_order_id, amount (ensure same units), userId mapped -> user_id, planId -> plan_id, channelId -> channel_id, status -> status.
3. Import to target DB with upsert on razorpay_order_id to avoid duplicates.

Mapping table (source -> target):

- source.Transaction.razorpay_order_id -> transactions.razorpay_order_id
- source.Transaction.razorpay_payment_id -> transactions.razorpay_payment_id
- source.Transaction.amount -> transactions.amount
- source.Transaction.currency -> transactions.currency
- source.Transaction.status -> transactions.status
- source.Subscription.start_date/end_date -> subscriptions.start_date/end_date
- source.Plan.markup_price -> plans.markup_price
- source.Plan.channel_id -> plans.channel_id

## Recommended tests & Postman/curl snippets

Recommended test names (Jest or Mocha):

- transactions.createOrder_should_create_transaction_and_return_order
- transactions.verifyPayment_should_update_transaction_and_create_subscription
- webhooks.razorpay_signature_invalid_should_return_403
- webhooks.razorpay_payment_captured_idempotency_should_not_create_duplicate_sub
- transactions.createOrder_missing_plan_should_404

Postman / curl examples (minimal):

1. Create Order (server endpoint example)

curl:

```bash
curl -X POST '{{baseUrl}}/api/v1/transactions/order' \
  -H 'Authorization: Bearer <userToken>' \
  -H 'Content-Type: application/json' \
  -d '{"plan_id":"<PLAN_ID>", "channel_id":"<CHANNEL_ID>"}'
```

2. Webhook (simulate payment.captured) — you must compute signature over raw JSON body

Node compute signature sample:

```js
const crypto = require("crypto");
const raw = JSON.stringify(payload); // In tests we use JSON.stringify, in real webhook use raw request bytes
const sig = crypto
  .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
  .update(raw)
  .digest("hex");
// Then send request with header X-Razorpay-Signature: sig
```

curl (test):

```bash
curl -X POST '{{baseUrl}}/api/v1/webhooks/razorpay' \
  -H 'Content-Type: application/json' \
  -H "X-Razorpay-Signature: <computed_signature>" \
  -d '{"event":"payment.captured","payload":{...}}'
```

3. Admin extend subscription (example)

curl:

```bash
curl -X PATCH '{{baseUrl}}/api/v1/subscriptions/<SUB_ID>/extend' \
  -H 'Authorization: Bearer <adminToken>' \
  -H 'Content-Type: application/json' \
  -d '{"extension_days":30}'
```

4. Fetch plans

curl:

```bash
curl -X GET '{{baseUrl}}/api/v1/plans' -H 'Authorization: Bearer <token>'
```

(Embed these into Postman collection if desired — the repo already contains a Postman JSON with Razorpay endpoints references.)

## Files changed / created (artifacts produced)

- ./PAYMENTS_INTEGRATION_ANALYSIS.md — this document (full analysis and recommended minimal implementation).
- ./payments_integration_summary.json — machine-friendly mapping and key items (created alongside this doc).

## Migration checklist (developer checklist for target repo)

- [ ] Add `transactions` collection/schema with fields: user_id, plan_id/combo_id, channel_id, amount, currency, razorpay_order_id, razorpay_payment_id, status, subscriptions[], subscription_id, invoice_url.
- [ ] Add `subscriptions` collection/schema with fields: user_id, plan_id/combo_id, channel_id, start_date, end_date, status.
- [ ] Implement `POST /api/v1/transactions/order` to compute amount and call Razorpay orders.create with `payment_capture:1` and `notes` containing context.
- [ ] Implement `POST /api/v1/webhooks/razorpay` with raw-body HMAC verification using `X-Razorpay-Signature` and `RAZORPAY_WEBHOOK_SECRET` (or key secret) and idempotent processing for `payment.captured` and `payment.failed`.
- [ ] Implement `POST /api/v1/transactions/verify` for client-side verification flows (if Checkout returns signatures) that verifies signature using `key_secret` and updates transaction and subscription accordingly.
- [ ] Add unit/integration tests: order creation (mock RZP), webhook signature (real HMAC compute), idempotency test (replay webhook), failed payment, missing plan.

---

## Final one-line recommendation for target repo

Add a `transactions` collection, a `subscriptions` collection, implement `POST /api/v1/transactions/order` (creates Razorpay order, stores transaction), and `POST /api/v1/webhooks/razorpay` (verify HMAC, update transaction, idempotent subscription activation).

---

Appendix: where to read first (quick):

- `backend/src/services/paymentService.js` — razorpay.orders.create wrapper and config
- `backend/src/controllers/transactionController.js` — webhook handler and activateSubscription flow
- `backend/src/controllers/subscriptionController.js` — server-side order creation for upgrades
- `backend/src/models/Transaction.js` — transaction schema
- `backend/src/utils/webhookHelper.js` — verification helper (must be wired into webhook route)

_End of analysis._
