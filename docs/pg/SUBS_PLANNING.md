I. Final Plan schema (Mongoose) — exact fields and types

File: server/src/models/Plan.js

- Schema (Mongoose)
  {
  name: { type: String, required: true }, // "Weekly", "Till CAT 2026"
  slug: { type: String, required: true, unique: true }, // "weekly", "till-cat-2026"
  description: { type: String, default: '' },

  active: { type: Boolean, default: true }, // admin can toggle active/inactive

  currency: { type: String, default: 'INR' }, // currency code
  priceCents: { type: Number, required: true }, // price in smallest unit (paise)
  originalPriceCents: { type: Number, default: null }, // optional MRP/strike-through
  discountPercent: { type: Number, default: null }, // optional convenience

  // Billing / access semantics (no recurring for now)
  // Billing types:
  // - 'one_time' -> no duration defined; admin may use metadata
  // - 'duration_days' -> access for N days after purchase or extension
  // - 'till_date' -> access until a specific calendar date (accessUntil)
  billingType: { type: String, enum: ['one_time','duration_days','till_date'], required: true },

  durationDays: { type: Number, default: null }, // used when billingType === 'duration_days'
  accessUntil: { type: Date, default: null }, // used when billingType === 'till_date' (interpreted as end-of-day IST)

  // Structured feature metadata (data-driven)
  features: {
  type: Object,
  default: {},
  // Example validation performed in controller or a mongoose pre-validate hook
  },

  metadata: { type: Object, default: {} }, // free-form JSON for promotions/bonusMonths etc.

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  version: { type: Number, default: 1 },

  timestamps: true
  }

Important notes:

- Use paise (cents) integers for price to avoid rounding errors.
- `slug` is a stable key used in UIs/notes; `ObjectId` is authoritative.
- `active` controls visibility in the public list; admin can "deactivate" a plan, not delete free.

---

II. User schema changes (how Plan connects to User)

File: User.js (changes only)

- Add fields:
  subscriptionPlan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', default: null }
  // pointer to the canonical Plan the user currently holds (null for free)

subscriptionSnapshot: {
slug: String,
priceCents: Number,
billingType: String,
version: Number,
purchasedAt: Date
} // small embedded snapshot for audit and to avoid stale references

// Keep existing fields for compatibility
subon: Date, // start timestamp
subexp: Date, // expiry timestamp
issubexp: Boolean

orderids: [
{
razorpay_order_id: String,
razorpay_payment_id: String,
createdAt: Date
}
]

Notes:

- During migration we will populate `subscriptionPlan` and `subscriptionSnapshot`.
- `subscription` string field may be kept during transition for backward compatibility but will be deprecated.

---

III. Feature metadata: types and examples

Goal: Admin will select feature options when creating/editing a plan. Each feature is a typed object. The server will interpret these types via `planAccess` helper.

Core feature keys (initial set):

- archive
- analysis
- leaderboard
- attempt_history

Shapes:

1. archive

- attempted-only:
  { type: 'attempted-only' }
  Semantics: user sees only RCs they attempted (plus today’s RC if scheduled today).
- window:
  { type: 'window', windowDays: Number, includeAttempted: true|false }
  Semantics: user sees RCs created between subon (inclusive) and subon + windowDays (inclusive). Always include attempted RCs if includeAttempted true.
- all:
  { type: 'all' }

2. analysis

- boolean:
  { type: 'boolean', allowed: true|false }
  Semantics: whether deep analysis view is accessible.

3. leaderboard

- tier:
  { type: 'tier', level: 'free'|'standard'|'premium' }
  Semantics: allow access to specific leaderboard tiers.

4. attempt_history

- days:
  { type: 'days', historyDays: Number }
  Semantics: how many calendar days of attempt records are visible.

Admin UI will present these feature keys with human-friendly option choices. Each option will show its metadata (e.g., windowDays = 7) so admins understand effects.

---

IV. Timezone & timestamp rules (India-first)

- Store timestamps in DB as UTC (standard).
- For day-level logic and UI display, use IST (UTC+5:30). The project already has `startOfIST` and `endOfIST` utilities — continue using them for comparisons.
- For `accessUntil` (till-date) plans:
  - Admin provides calendar date (e.g., 2026-03-31). We will internally convert it to IST end-of-day (23:59:59.999 IST) then convert to UTC and store in `accessUntil`. This avoids ambiguity about which time zone the "till" refers to.
- For `durationDays`: compute subexp by adding durationDays to the start time:
  - Extension policy uses existing `subexp` (if active) as starting anchor; otherwise start from now (UTC).
  - For comparisons like "is RC in subscription window", convert RC's createdAt to IST day boundaries and compare with user's subon/subexp in IST.

---

V. API routes & controller methods (final list + signatures)

A. Public/client routes

1. GET /api/v1/sub/plans

- Purpose: list active plans for client with feature summaries and both price fields.
- Query params: ?active=true|false (default true)
- Response: { ok: true, data: [ { _id, name, slug, description, priceCents, originalPriceCents, discountPercent, billingType, durationDays, accessUntil, featuresSummary, metadata } ] }
- Controller: planController.listPublicPlans(req,res)

2. POST /api/v1/sub/create-order

- Purpose: create a Razorpay order for selected plan.
- Auth: required
- Body: { planId: "<ObjectId>" }
- Server behavior:
  - Lookup plan by planId; require plan.active === true
  - amount = plan.priceCents
  - create Razorpay order with notes: { planId, planSlug, userId }
  - return { ok: true, order }
- Response: 200 { ok: true, order }
- Controller: subController.createOrderWithPlan(req,res)

B. Webhook 3) POST /api/v1/sub/verify-payment

- Purpose: webhook from Razorpay; verify & assign plan
- Auth: none (but verify signature)
- Body: raw JSON as Razorpay sends (we verify using RAZORPAY_WEBHOOK_SECRET and req.rawBody)
- Behavior:
  - If event === 'payment.captured' -> extract notes.planId, lookup Plan
  - If plan not found -> log and exit (or mark as manual)
  - Compute new subon/subexp based on billingType/plan fields
  - Apply extension vs replace policy
  - Set user.subscriptionPlan = plan.\_id, set subscriptionSnapshot, update subon/subexp/issubexp, push orderids entry
  - Return 200 success
- Controller: subController.verifyPaymentAndAssignPlan(req,res)

C. Admin routes (RBAC: admin only) 4) GET /api/v1/admin/plans

- Return all plans (active/inactive) with full features and metadata
- Controller: planController.adminListPlans(req,res)

5. POST /api/v1/admin/plans

- Body: Plan create payload
- Behavior: create plan, return created plan
- Controller: planController.createPlan(req,res)

6. PATCH /api/v1/admin/plans/:id

- Body: partial plan fields to update (increment version automatically)
- Behavior: update plan, increment version
- Controller: planController.updatePlan(req,res)

7. PATCH /api/v1/admin/plans/:id/deactivate

- Behavior: set active=false (soft-deactivate). If slug === 'free', reject.
- Controller: planController.deactivatePlan(req,res)

8. DELETE /api/v1/admin/plans/:id

- Behavior: optional hard-delete; by default disallowed for `slug === 'free'` and recommended only in dev if admin explicitly allows.
- Controller: planController.deletePlan(req,res)

9. POST /api/v1/admin/users/:id/assign-plan

- Body: { planId, startsAt? (ISO string), endsAt? (ISO string) }
- Behavior: admin can directly assign a plan to a user (useful for gifts/manual grants). This should create subscriptionSnapshot and update subon/subexp accordingly.
- Controller: adminController.assignPlanToUser(req,res)

10. Keep existing admin endpoints:

- PATCH /api/v1/sub/revoke/:userId — updated to also clear subscriptionPlan and snapshot
- PATCH /api/v1/sub/extend/:userId — keep as admin convenience (but make it understand plan semantics)

---

VI. Controller behaviors in more detail (pseudocode / edge rules)

createOrderWithPlan(req, res)

- parse planId
- plan = Plan.findById(planId)
- if !plan || !plan.active -> 400 error
- amount = plan.priceCents
- options = { amount, currency: plan.currency || 'INR', receipt: `receipt_${Date.now()}`, notes: { planId: plan.\_id.toString(), planSlug: plan.slug, userId: req.user.id } }
- order = razorpay.orders.create(options)
- return order

verifyPaymentAndAssignPlan(req, res)

- verify signature (we already added)
- if req.body.event !== 'payment.captured' -> handle other events and return
- notes = req.body.payload.payment.entity.notes
- planId = notes?.planId || notes?.planSlug (fallback)
- plan = Plan.findById(planId) OR Plan.findOne({ slug: planSlug })
- if !plan: log and return 200 (or 400 if you prefer) — do not crash
- currentUser = User.findById(userId) (from notes)
- compute duration:
  - if plan.billingType === 'duration_days': delta = plan.durationDays
  - else if plan.billingType === 'till_date': subexp = plan.accessUntil (use end-of-day IST conversion done at plan creation)
  - else if plan.billingType === 'one_time': if plan.durationDays set -> delta = durationDays else treat as non-expiring or use metadata. (Decide: for now, if one_time + no durationDays => treat as permanent by setting subexp = farFuture or null meaning permanent)
- extension rule:
  - if currentUser.subexp && currentUser.subexp > now && !issubexp -> startFrom = currentUser.subexp else startFrom = now
  - if billingType === 'till_date' -> set subexp = max(plan.accessUntil, startFrom + delta?) APPLY BUSINESS RULE: For till_date, you probably want the plan to give access until that date regardless of start; if startFrom is after accessUntil => treat as expired -> refuse or set expiry = startFrom + delta
- update user:
  - user.subscriptionPlan = plan.\_id
  - user.subscriptionSnapshot = { slug: plan.slug, priceCents: plan.priceCents, billingType: plan.billingType, version: plan.version, purchasedAt: now }
  - user.subon = startFrom
  - user.subexp = computed subexp
  - user.issubexp = false
  - push order id objects
- save

Admin assignPlanToUser(req,res)

- validate plan exists
- if startsAt provided -> subon = startsAt else now
- if endsAt provided -> subexp = endsAt else compute from plan billingType
- set subscriptionPlan and snapshot, update user fields

Revoke

- clear subscriptionPlan and snapshot, set subscription to 'none' (if still present), subon/subexp cleared or set to null, issubexp true

---

VII. Admin UI behavior & UX details

Where:

- Add "Manage Plans" button on AdminSubscriptions.jsx — opens modal or navigates to `/admin/plans`.

AdminPlans page/modal:

- Top: Button "Create Plan"
- Table: list (name, slug, price (strike original if present), billingType, duration/accessUntil, active, actions [Edit, Deactivate, Delete(if allowed), View features])
- Create/Edit modal:
  - Fields: name, slug (auto-generate), description, currency, price (₹ input, converted to paise on submit), originalPrice (optional), discountPercent (optional), billingType (one_time|duration_days|till_date), durationDays (if duration_days), accessUntil (date picker if till_date), features UI (pick feature key and option variant and configure params), metadata JSON editor (optional), active toggle.
- Feature UI:
  - For each feature, show a dropdown with the typed options (for `archive`: Attempted-only, Window (input days), All). Show a brief inline help text for each option and metadata example.
- Prevent deleting free plan:
  - If plan.slug === 'free', hide delete and show only deactivate disabled (must remain active). Server controller enforces this too.
- Versioning:
  - When saving edits, bump plan.version automatically to help snapshot audits.

Client subscription buy flow:

- Replace radio for Monthly/Yearly with plan cards populated from GET /sub/plans.
- Each plan card shows originalPrice (struck-through), price (bold), short feature summary (e.g., "Archives: attempted only" or "Archives: all until 31 Mar 2026"), Buy button sending planId.
- After payment success, client may poll user profile endpoint to show updated subscription. The server webhook is authoritative.

---

VIII. Migration plan & seeding (safe approach)

1. Seed baseline plans script: `server/scripts/seedPlans.js`

- Create plans:
  - Free (slug: 'free'): billingType 'one_time', priceCents 0, features.archive attempted-only, active true (immutable)
  - Weekly: billingType 'duration_days', durationDays 7, priceCents 15000, originalPriceCents optional
  - Till-CAT: billingType 'till_date', accessUntil: end-of-day IST computed for the specified date, priceCents e.g. 170000

2. Dry-run migration script: `server/scripts/migrateSubscriptions.js --dry`

- Purpose: map existing user.subscription strings to plan ids
- Steps:
  - Load plans (free, weekly, till-cat)
  - For each user with non-null old subscription string -> compute targetPlan
  - Show proposed DB updates (userId, old subscription, mappedPlanId, computed new subon/subexp) in a report
  - After manual review, run without --dry to apply changes; backups recommended

3. Post-migration:

- Deprecate the `subscription` string field or keep it for read-only reporting for a while. Encourage code to use `subscriptionPlan`.

---

IX. Razorpay notes (adjustments to current code)

- The frontend currently calls createOrder(type) sending 'Monthly'/'Yearly'. Change to posting planId to `/sub/create-order`.
- Server createOrder must compute amount from Plan.priceCents — do not trust client sent price.
- Include notes: planId, planSlug, userId to allow webhook mapping.
- We already added rawBody capture and signature verification in `verifyPayment` — good.
- After webhook updates user, client may poll user profile (GET /api/v1/users/me) to reflect the new subscription. The client should not rely solely on immediate handler response since the webhook confirms the payment.

---

X. Example plan documents (JSON)

Free (seed)
{
\_id: ObjectId("..."),
name: "Free",
slug: "free",
description: "Basic free plan — only RCs you've attempted",
active: true,
currency: "INR",
priceCents: 0,
billingType: "one_time",
features: {
archive: { type: "attempted-only" },
analysis: { type: "boolean", allowed: false }
},
version: 1
}

Weekly (seed)
{
name: "Weekly",
slug: "weekly",
description: "7-day access to weekly archives",
active: true,
currency: "INR",
priceCents: 15000,
originalPriceCents: 20000,
discountPercent: 25,
billingType: "duration_days",
durationDays: 7,
features: {
archive: { type: "window", windowDays: 7, includeAttempted: true },
analysis: { type: "boolean", allowed: false }
},
version: 1
}

Till CAT 2026 (seed)
{
name: "Till CAT 2026",
slug: "till-cat-2026",
active: true,
currency: "INR",
priceCents: 170000,
billingType: "till_date",
accessUntil: "2026-12-31T18:29:59.999Z", // end-of-day IST -> to UTC
features: { archive: { type: "all" }, analysis: { type:"boolean", allowed:true } },
version: 1
}

---

XI. Safety & edge-case decisions I used (confirm or change)

- No recurring plans for now — implemented in schema via `billingType` (no recurring enum).
- Default extension policy: extend from existing `subexp` if active; otherwise start from now. Admin may override per plan via `metadata.forceReplace`.
- `till_date` plans: interpreted as fixed calendar date in IST (converted to UTC end-of-day).
- Free plan: cannot be deleted and should remain active. Admin UI and server controller will enforce this (reject delete for slug === 'free').
- For `one_time` without durationDays: treat as permanent access. (We can instead require durationDays or accessUntil for non-permanent; decide if permanent allowed.)
- Currency: INR by default. Prices stored as paise.

---

XII. Tests to write (short list)

- Plan model validation test (missing required fields, wrong billingType combos)
- createOrderWithPlan test: given a plan, returns order; tests that server uses plan.priceCents and includes notes
- verifyPaymentAndAssignPlan test: simulate signed Razorpay webhook (use HMAC) and assert user updates correctly
- planAccess unit tests: archive types (attempted-only, window, all) and edge windows around midnight IST
- Integration: purchase simulation -> webhook -> user updated -> /rcs/archive behavior matches plan rules

---

XIII. Implementation plan & recommended immediate next step
I can start implementing now. Recommended order (safe, low-risk first):

- (Todo 1) Create `Plan` model + seed script (free, weekly, till-cat). This is non-invasive and gives admin UI something to read.
- (Todo 2) Add public GET /api/v1/sub/plans
- (Todo 4) Update frontend plan selection to fetch plans (UI change)
- (Todo 5) Update createOrder to accept planId
- (Todo 6) Update webhook mapping and snapshot user subscription

Which todo should I implement first? I recommend starting with Todo #1 (Plan model + seed) and #2 (GET /plans) together — that gives the UI and API a stable source-of-truth to consume.

If you confirm, I'll:

- add `server/src/models/Plan.js`,
- add `server/scripts/seedPlans.js` and run a dry-check (no DB actually mutated here; I'll only create files),
- add `server/src/controllers/plan.Controller.js` and `server/src/routes/plans.js` with the public GET endpoint,
- update the server's router registration to mount plans route,
- update the todo list status (mark #1 and #2 in-progress/completed as I go).

Tell me: start with Todo #1 & #2? Or do you want a different next step or any schema tweaks?
