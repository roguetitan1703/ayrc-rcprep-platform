<!-- IMPLEMENTATION-FOCUSED SPEC (Trimmed of narrative / fluff per request) -->

# ARC Next‑Gen Build Spec (Actionable)

Last Updated: 2025-10-02  
Theme: "Crimson Trust" (locked)  
Reference: `design-system.md` (keep for rationale; this file = build contract)

---

## 1. Color Tokens (Implemented)

Reference Palette: https://coolors.co/f7f8fc-273043-d33f49-1a2a6c-f6b26b  
Tailwind Tokens (already applied in `tailwind.config.js`):

| Semantic Role       | Token / Class    | Hex     | Notes                                       |
| ------------------- | ---------------- | ------- | ------------------------------------------- |
| App Canvas          | `background`     | #F7F8FC | Never pure white to soften contrast fatigue |
| Muted Surface       | `surface-muted`  | #EEF1FA | Alternating sections, zebra rows            |
| Elevated Surface    | `card-surface`   | #FFFFFF | Cards, panels, dropdowns                    |
| Primary Text        | `text-primary`   | #273043 | Headings, high emphasis copy                |
| Secondary Text      | `text-secondary` | #5C6784 | Body, helper text                           |
| Primary Action      | `primary`        | #D33F49 | Buttons, active state icons                 |
| Primary Hover       | `primary-light`  | #E25C62 | Hovers, subtle fills                        |
| Primary Active      | `primary-dark`   | #B32F3A | Pressed states                              |
| Info Accent         | `info-blue`      | #3B82F6 | Analytical lines, secondary actions         |
| Warm Accent (Alt)   | `warm-orange`    | #FB923C | Gradient stop, secondary highlight          |
| Warning / Highlight | `accent-amber`   | #F6B26B | KPIs, attention banners                     |
| Success             | `success-green`  | #23A094 | Positive deltas, confirmations              |
| Error / Danger      | `error-red`      | #E4572E | Destructive buttons, validation             |
| Neutral / Disabled  | `neutral-grey`   | #A9B2C3 | Placeholders, disabled icons                |
| Soft Border         | `border-soft`    | #D8DEE9 | Card outlines, subtle dividers              |
| Focus Outline       | `focus-ring`     | #1A2A6C | Universal focus styles                      |

Gradients (utility classes): `bg-gradient-primary`, `bg-gradient-accent`, `bg-gradient-warm`.

Palette Decision Rationale:

- Crimson chosen over generic blue to create memorability & differentiate from exam-prep commodity UIs.
- Deep oxford blue retained strictly for analytical affordances & focus ring (a11y clarity).
- Amber & warm orange deployed sparingly to avoid semantic overload (one is stable token, the other gradient stop).

Quality Gate: Any additional color introduction requires design review + token addition (no inline hex).

---

## 2. Reason Taxonomy & Capture Loop

Goal: Attach a single structured reason to each wrong answer (optional but encouraged) to power dashboards & radar deltas.

Data Additions:

```ts
// Attempt.wrongReasons (Mongo subdocument array)
{
	questionIndex: Number,        // index referencing original attempt question order
	code: String,                 // enum key defined in reasonCodes.js
	createdAt: Date               // auto-set at insertion
}
```

`reasonCodes.js` Example Skeleton:

```js
export const REASON_CODES = {
  MISREAD: { label: 'Misread / Skimmed', description: 'Rushed or skipped a key qualifier.' },
  INFERENCE_GAP: { label: 'Inference Gap', description: 'Could not bridge implicit logical step.' },
  VOCAB_AMBIGUITY: { label: 'Vocabulary Ambiguity', description: 'Confusion due to word meaning.' },
  TRAP_ANSWER: { label: 'Attractive Distractor', description: 'Picked plausible but unsupported.' },
  RUSH_TIMING: { label: 'Timing Pressure', description: 'Decision driven by expiring time.' },
  // Keep < 12 initial codes for cognitive manageability
}
```

Capture Endpoint:

```
PATCH /api/attempts/:id/reasons
Body: { questionIndex: Number, code: String }
Responses:
 200 { wrongReasons: [...] }
 400 { errorCode: 'INVALID_REASON_CODE' }
 404 { errorCode: 'ATTEMPT_NOT_FOUND' }
Rules: idempotent per questionIndex (overwrites prior entry for that index)
```

Client Trigger Points:

1. Results → `IncorrectQuestionBlock` expands → select `<ReasonTagSelect />`.
2. Future (optional): Inline quick tag from question card before submit (NOT in scope now).

Coverage Metric: `taggedWrong / totalWrong` (trailing 30 days). This avoids volatility from a single session.

Edge Cases: invalid index; unknown code; rapid double submit (latest wins).

---

## 3. Analytics Architecture

Service Module: `src/server/services/analytics.service.js`
Exports (pure + memoized per user + range):

- `buildQuestionRollups(userId, range)` → array `{ category, questionType, attempts, correct, accuracy }`
- `buildProgressTimeline(userId, range)` → array `{ date, attempts, accuracy }` (missing days filled)
- `buildRadarDataset(userId, range)` → array `{ metric: questionType, actual, target }`
- `buildAttemptHistory(userId, limit)` → array minimal attempt summaries
- `buildReasonsSummary(userId, days=7)` → `{ top: [ {code,count} ], taggedWrong, totalWrong }`

Normalization Step (Performance Studio contract assembler):

```js
export function assemblePerformancePayload(parts) {
  return {
    callouts: {
      overallAccuracy: parts.rollupsTotals.correct / parts.rollupsTotals.attempts,
      attempts7d: parts.recentAttemptsCount,
      topicBreadth: parts.rollups.length,
    },
    radar: parts.radar,
    questionTypeTable: parts.rollups,
    timeline: { range: parts.range, points: parts.timeline },
    attemptHistory: parts.history,
  }
}
```

Caching Strategy:

- In-memory LRU keyed `userId:range` with TTL 60s (acceptable mild staleness for analytics).
- Bust on new attempt creation.

Perf Targets: warm <50ms, cold P95 @10k attempts <250ms.

---

## 4. Dashboard (Page Components & Data)

Components:

- `<DashboardGreeting />` props: `{ name, streakDays }`
- `<DashboardStatsRow />` props: `{ attempts7d, accuracy7d, coverage }`
- `<ReasonSummaryWidget />` props: `{ top:[{code,count}], coverage }`
- `<ProgressPreview />` props: timeline subset `[ { date, attempts, accuracy } ]`
- `<QuickActions />` (optional) props: derived CTAs (e.g. weakest category)

Bundle Endpoint: `GET /api/dashboard` returns:

```json
{
  "greeting": { "name": "Asha", "streakDays": 4 },
  "stats": { "attempts7d": 6, "accuracy7d": 0.74, "coverage": 0.42 },
  "reasons": { "top": [{ "code": "MISREAD", "count": 5 }], "coverage": 0.42 },
  "progressPreview": [{ "date": "2025-09-25", "attempts": 1, "accuracy": 0.6 }]
}
```

Error Handling: On reasons fetch failure → hide widget; log warn (no global fail).

---

## 5. Performance Studio (Page Components)

Components:

- `<PerfRangeSelector />` (range state: 7|30|90)
- `<PerfCallouts />` `{ overallAccuracy, attempts7d, topicBreadth }`
- `<RadarChart />` data: `[ { metric, actual, target } ]`
- `<QuestionTypeTable />` data: rollups
- `<TimelineChart />` points: `[ { date, attempts, accuracy } ]`
- `<AttemptHistoryList />` list: attempts (id, date, score, isPersonalBest)
- `<ExportButton />` uses current normalized payload → CSV

Color Logic (table cell accuracy): `<0.6 error-red`, `0.6–0.75 accent-amber`, `>=0.75 success-green`.

---

## 6. Test Page & MFR Guard

Layout: Two-column at `lg` breakpoint (55% passage / 45% questions), collapsing to vertical stack below.

Keyboard Map:

- Arrow Up/Down → cycle focused question container (aria-selected).
- 1–4 → select answer within focused question (announce via `aria-live=polite`).
- M → toggle marked-for-review state (adds ring-focus-ring outline + label).

MFR Guard Modal: `<MFRConfirmModal />` props: `{ markedCount, unansweredCount, onConfirm, onCancel }`.

Timing Display: Timer updates accessibility region every 60s (not every second) to reduce noise.

Passage Container: `max-h-[calc(100vh-160px)] overflow-y-auto` to prevent layout shift.

---

## 7. Results Page

Components:

- IncorrectQuestionBlock – Lazy-mount reason select to keep TTI low.
- CoverageMeter – Horizontal progress with label: “Reason Coverage 58% (target 70%)”. Colors: track `surface-muted`, fill `primary`.
- Notes Textarea – Debounced 800ms updates `analysisNotes`; optimistic echo; char limit 2,000.
- CategoryAccuracyTable – Derived rollups sorted by attempts.

Optional Reinforcement: if coverage delta >=0.1 in session → toast (non-blocking).

---

## 8. Security Layer (Concrete Items)

Elements:

- Secure Cookies: Set `httpOnly secure sameSite=strict` when `NODE_ENV=production`.
- Sanitization: On passage/question/explanation create/update run HTML sanitizer stripping `<script>` & event handlers.
- Admin Field Whitelist: Explicit allow-list to prevent accidental schema drift.
- Error Codes Enum: Central `ERROR_CODES.js`; each thrown error attaches machine code consumed by toast map.
- Rate Limiting (Auth): Sliding window 10 attempts / 15 min by IP + user key.

Standard Error JSON: `{ "errorCode": STRING, "message": STRING }`

---

## 9. Accessibility & Navigation

Breadcrumb: Auto-derive from route segments except exclude `/test` for immersion. Provide `aria-label="Breadcrumb"`.
Focus Ring: All interactive elements enforce `ring-2 ring-focus-ring ring-offset-2 ring-offset-background` on keyboard focus.
Charts: Provide offscreen summary node listing top & lowest accuracy metrics.

---

## 10. Admin & Content Operations

Duplicate Detection: When adding new passage, fuzzy compare (Levenshtein threshold or simple trigram similarity) against last N (e.g. 200) passages. If >0.85 similarity present non-blocking warning.
Validation Order (fail-fast):

1. Option count (>=4)
2. Unique options
3. Explanation min length
4. Passage min length

Schedule UI: `<SchedulePlanner />` suggests earliest free slot.

---

## 11. Archive Page

Purpose: Retrieval of historical attempts for pattern review.
Filters: topic (multi-select), score range (min/max), date range.
Indexes: `{ userId:1, topic:1 }` and partial `{ userId:1, score:-1 }`.

Query Example: `/api/archive?topics=Inference,Science&minScore=0.6&from=2025-09-01&to=2025-10-01&page=1`

---

## 12. Personal Best

Definition: Attempt score strictly greater than all prior attempts → flagged `isPersonalBest = true` at creation.
Display: Badge in Attempt History & subtle radial glow on Results hero card.
No leaderboard; solitary indicator only.

---

## 13. (Deferred) Pacing Insight Stub

Heuristic: Compare per-question mean answer time vs session median. If >30% slower on >40% of inference questions → emit pacing insight: “Inference items absorbing disproportionate time – consider skimming strategies.”
Shape: `{ code: 'INFERENCE_PACING_DRIFT', affectedQuestions: number[] }`

---

## 14. Design System Enforcement

Guardrails:

1. Pre-commit script greps for `#[0-9a-fA-F]{3,6}` excluding config & tests – fails if found.
2. ESLint custom rule (later) ensuring only allowed Tailwind class prefixes for color (e.g. `bg-`, `text-`, `border-` using our tokens).
3. Visual Sandbox route enumerating core components to spot drift quickly.

Migration Pattern Example: `border border-white/10` → `border border-soft`.

---

## 15. API Endpoints

| Endpoint                     | Method | Purpose              | Auth | Params/Body            | Returns                                          |
| ---------------------------- | ------ | -------------------- | ---- | ---------------------- | ------------------------------------------------ | --- | ----------------- |
| `/api/attempts/:id/reasons`  | PATCH  | Add/overwrite reason | Yes  | `{questionIndex,code}` | `{ wrongReasons:[] }`                            |
| `/api/users/me/reasons/week` | GET    | Weekly top reasons   | Yes  | none                   | `{ top:[{code,count}], taggedWrong,totalWrong }` |
| `/api/performance?range=30`  | GET    | Perf Studio data     | Yes  | range=7                | 30                                               | 90  | Normalized object |
| `/api/dashboard`             | GET    | Dashboard bundle     | Yes  | none                   | Greeting + stats + preview                       |
| `/api/archive`               | GET    | Filtered attempts    | Yes  | query filters          | Paginated attempts                               |
| `/api/health`                | GET    | Health check         | No   | none                   | `{ uptime, db:{ ok:true } }`                     |

Future: weekly CRON (log only).

---

## 16. Data Model Examples

Attempt Example (partial):

```json
{
  "_id": "...",
  "score": 0.78,
  "questions": [
    /* omitted */
  ],
  "wrongReasons": [
    { "questionIndex": 1, "code": "MISREAD", "createdAt": "2025-10-02T10:15:00Z" },
    { "questionIndex": 4, "code": "INFERENCE_GAP", "createdAt": "2025-10-02T10:16:30Z" }
  ],
  "analysisNotes": "Need to slow down on inference transitions."
}
```

Radar Example:

```json
[
  { "metric": "Inference", "actual": 0.72, "target": 0.8 },
  { "metric": "Main Idea", "actual": 0.84, "target": 0.8 }
]
```

---

## 17. Performance Budgets

Budgets (same targets, now with test strategy):

- Dashboard bundle API P95 <200ms (cold <350ms) → Measure via seeded load script (10 sequential calls; discard first warmup).
- Performance detail endpoint P95 <250ms @10k attempts → Local synthetic dataset generator.
- Client Radar render ≤24ms/frame → Use Performance API mark/measure around render cycle.
- Timeline render ≤16ms/frame → Avoid heavy chart libs; use inline SVG path + rect bars.
- CSV export <1.5s for 90 days → Pre-format rows while data in memory; streaming not required at current scale.

Instrumentation: simple timing middleware + log field `analytics_latency_ms`.

---

## 18. Key Derived Metrics (Implementation Notes)

Formulas (implementation hints):

- Reason Coverage: Precompute `taggedWrong` and `totalWrong` from attempts in trailing 30d window at dashboard build.
- Category Accuracy Spread: Compute std dev over rollup `accuracy` array.
- Weekly Attempt Consistency: Use ISO week buckets; store previous week cache to avoid recompute inside user request.
- Streak Retention: (# users who had streak last week and maintained) / (users with streak last week).

Optional Nudge: if coverage <0.2 after 5 attempts show inline banner.

---

## 19. Suggested Implementation Order

1. Schema extension: Add `wrongReasons[]`, `analysisNotes` to Attempt; add `preferences` to User (non-breaking default empty object).
2. Create `reasonCodes.js`; wire validation into PATCH endpoint.
3. Implement analytics service pure functions with in-memory dataset first (unit test harness) then connect to Mongo.
4. Build `/api/dashboard` bundle (compose analytics + reasons summary).
5. Implement Performance Studio page consuming normalized payload.
6. Integrate reason capture UI in Results (optimistic pattern) + coverage meter.
7. Refactor static & shared components to tokens (remove residual raw hex if any remain).
8. Enforce pre-commit guard script.
9. Add health endpoint + minimal logging middleware.
10. Layer security & sanitization (cookie flags, sanitizer util) once functional surfaces stable.

Rationale: Build data substrate first → surfaces → polish → enforcement.

---

## 20. Shared Component Inventory (Proposed)

| Component               | Purpose                    | Notes                                |
| ----------------------- | -------------------------- | ------------------------------------ |
| `DashboardGreeting`     | Streak + salutation        | Derive time-of-day label client side |
| `DashboardStatsRow`     | Core KPIs                  | Show skeleton variant                |
| `ReasonSummaryWidget`   | Top 2 reasons + coverage   | Hide if no data & coverage=0         |
| `ProgressPreview`       | Mini timeline sparkline    | SVG inline; no heavy lib             |
| `QuickActions`          | Shortcut CTAs              | Use weakest accuracy category        |
| `ReasonTagSelect`       | Capture reason             | Async PATCH; optimistic              |
| `CoverageMeter`         | Visual coverage %          | Reusable (Dashboard + Results)       |
| `RadarChart`            | Accuracy vs target         | Provide table fallback               |
| `TimelineChart`         | Attempts + accuracy line   | Range-aware scaling                  |
| `QuestionTypeTable`     | Rollups w/ sorting         | Sort by attempts default             |
| `AttemptHistoryList`    | List attempts              | Lazy load beyond first page          |
| `AttemptScoreCard`      | High-level attempt summary | On Results hero                      |
| `QuestionNavigator`     | Jump to question           | Reflect answered / MFR states        |
| `MFRConfirmModal`       | Guard submit               | Blocks final submit                  |
| `PersonalBestBadge`     | Highlights PB attempt      | Passive; no click                    |
| `PacingInsightBanner`   | Future pacing hint         | Deferred feature flag                |
| `DuplicateWarningCard`  | Admin possible duplicate   | Non-blocking                         |
| `SchedulePlanner`       | Admin schedule layout      | Suggest earliest slot                |
| `PassageEditor`         | Admin create/edit passage  | Includes validation messages         |
| `HealthStatusIndicator` | Admin status panel         | Consumes `/api/health`               |
| `ToastHost`             | Top-level toasts           | Map errorCode → message              |
| `SkeletonBlock`         | Generic loading surface    | Variants: card,row,stat              |

---

## 21. Site-Wide Proposed Additions

| Page / Area        | Proposed Elements                                                             | Justification            |
| ------------------ | ----------------------------------------------------------------------------- | ------------------------ |
| Home               | CTA strip linking to first practice, mini stats teaser                        | Immediate engagement     |
| About              | Replace raw gradients w/ tokens (DONE) + add coverage explainer block         | Educate loop             |
| Dashboard          | QuickActions, CoverageMeter reuse, inline weakest-category CTA                | Drives targeted practice |
| Performance        | Export CSV, Range selector pills, Table column sort indicators                | Analyst usability        |
| Test               | Keyboard shortcut legend popover, Sticky progress bar (answered / total)      | Reduce friction          |
| Results            | AttemptScoreCard hero, CoverageMeter, ReasonTagSelect list, PersonalBestBadge | Reinforces reflection    |
| Archive            | Column filters row, Pagination controls, Empty state illustration             | Discoverability          |
| Admin Passage List | DuplicateWarningCard, Bulk publish action (later)                             | Content quality          |
| Admin Schedule     | SchedulePlanner with validation summary panel                                 | Faster scheduling        |
| Profile            | Preferences form (fontScale, goalType, focusDefault)                          | Personalization          |
| Auth               | Throttled error wording + subtle progress bar on async                        | Feedback clarity         |
| Feedback           | Explicit rating selectors (no preselect) + disabled submit until filled       | Accurate data            |
| Contact            | Honeypot + ipHash (privacy) + success toast                                   | Anti-spam                |
| Global             | Breadcrumb (except /test), ToastHost, FocusRing styles                        | Consistency              |

---

## 22. Removal / Defer List

Removed from scope (was noise): strategic narrative prose, extended motivation copy, long-form pacing details (kept stub), glossary (replaced by component inventory), verbose outcome stories.

---

## 23. Revision Log (Minimal)

| Date       | Change                                                                                      |
| ---------- | ------------------------------------------------------------------------------------------- |
| 2025-10-02 | Converted narrative doc → actionable build spec; added component inventory & site additions |

End of Spec.

---

## 24. Numbered Feature Catalog (Expanded: Context + Goal + Spec + Examples)

Legend: Preserves original IDs (G1–G22). Each block has: Goal, Problem, Scope (In/Out), Data / API, UI Components, Example Payload, Edge Cases, Acceptance.

### G1. Reason Taxonomy

Goal: Provide consistent controlled vocabulary for wrong-answer tagging.
Problem: Free‑text feedback is noisy & unaggregatable.
Scope In: Static enum file, labels & descriptions; FE import for select UI.
Scope Out: Per-user custom reasons (future phase).
Data: `reasonCodes.js` (≤12 initial codes).
UI: `<ReasonTagSelect />` consumes `REASON_CODES`.
Example: `{ code:"MISREAD", label:"Misread / Skimmed" }`.
Edge: Unknown code → 400 `INVALID_REASON_CODE`.
Acceptance: File loads <10ms; all codes have label+description.

### G2. Reason Capture

Goal: Persist per-wrong-question reason to build coverage metric.
Problem: No structured reflection today.
Scope In: PATCH endpoint, optimistic UI, overwrite semantics.
Scope Out: Multi-select tagging.
API: `PATCH /api/attempts/:id/reasons {questionIndex,code}` → updated `wrongReasons[]`.
UI: Inline select inside `IncorrectQuestionBlock`.
Edge: Duplicate rapid PATCH → last write wins.
Acceptance: Selecting reason updates coverage meter within 150ms perceived (optimistic).

### G3. Analytics Pipeline Core

Goal: One aggregation pass powering dashboard & performance views.
Problem: Risk of N duplicated Mongo scans per page.
Scope In: Rollups, timeline, radar, attempt history assembly.
Scope Out: Heavy machine learning inference.
Module: `analytics.service.js` with pure functions + memo layer.
Perf: Cold P95 <250ms @10k attempts; warm <50ms.
Acceptance: Unit tests verify deterministic output for seeded dataset.

### G4. Progress Timeline Dataset

Goal: Show attempt volume & accuracy trend.
Scope In: Gap-filling empty days; range filtering (7/30/90).
Out: Streak logic (handled separately).
Data Shape: `[ {date, attempts, accuracy} ]`.
Edge: No attempts → return empty array (client shows empty state).
Acceptance: Gaps correctly filled with attempts=0.

### G5. Error Codes Enum

Goal: Predictable client messaging & localization path.
Data: `ERROR_CODES.js` mapping code→message (server authoritative).
Usage: Controllers attach `res.locals.errorCode` before error handler.
Acceptance: All non-2xx responses (except 500) include `errorCode`.

### G6. Secure Cookies

Goal: Harden session against XSS/session fixation.
Implementation: Set `httpOnly secure sameSite=strict` when `NODE_ENV=production`.
Acceptance: Manual cURL shows flags; local dev unaffected.

### G7. Admin Whitelist

Goal: Prevent unintended field mutation in admin passage edits.
Implementation: Middleware filters body keys against allow-list.
Edge: Attempted forbidden field → 400 `ADMIN_FIELD_FORBIDDEN`.
Acceptance: Test proves forbidden field is excluded & error thrown.

### G8. Sanitization

Goal: Block stored XSS in passage/question/explanation fields.
Implementation: HTML sanitizer (e.g. DOMPurify server-side) stripping scripts/on\* attributes.
Acceptance: Input containing `<script>alert(1)</script>` stored without script tag.

### G9. Breadcrumb

Goal: Orient users on deep pages.
Implementation: Derive from path segments; hide on `/test`.
UI: `<Breadcrumb />` with aria-label.
Acceptance: Lighthouse a11y passes (no missing nav landmarks).

### G10. Feedback Explicit Selection

Goal: Prevent accidental biased default feedback.
Implementation: No pre-selected rating; submit disabled until complete.
Acceptance: Attempted submit early blocked with inline helper.

### G11. Health + Logging

Goal: Basic operational signal.
API: `GET /api/health` returns `{uptime, db:{ok}}`.
Logging: Pino middleware with request id & latency.
Acceptance: Endpoint responds <50ms (local) with 200 when DB up.

### G12. Signature Theme System

Goal: Semantic theme tokens unify visuals.
Implementation: Tailwind tokens (already applied) + component refactor removal of hex.
Acceptance: Grep for hex returns <=5 (excluding config & tests).

### G13. Reason Summary Endpoint

Goal: Provide compact snapshot for dashboard widget.
API: `GET /api/users/me/reasons/week`.
Return: `{ top:[{code,count}], taggedWrong, totalWrong }`.
Acceptance: Top list sorted desc by count; length ≤2.

### G14. Question Taxonomy Rollups

Goal: Provide per-questionType/category accuracy & counts.
Data Shape: `{ category, questionType, attempts, correct, accuracy }`.
Acceptance: Sum(correct)/Sum(attempts) equals overallAccuracy within ±0.5pp.

### G15. Performance Dataset Normaliser

Goal: Single normalized object consumed by all Perf Studio components.
Function: `assemblePerformancePayload(parts)`.
Acceptance: Radar / table / timeline all derive from same source object references (no recompute divergence).

### G16. Analytics Detail Endpoint

Goal: Range-based (7/30/90) analytics fetch.
API: `GET /api/performance?range=30` (default 30 if absent).
Cache: LRU 60s.
Acceptance: Cache hit logs show latency <50ms.

### G17. MFR Submit Guard

Goal: Reduce accidental submission with pending marked for review.
UI: `<MFRConfirmModal />` listing counts & confirm/cancel.
Acceptance: Submit blocked until confirm event.

### G18. Pacing Insights (Stub)

Goal: Future pacing heuristics; stub now for interface stability.
Output (when triggered): `{ code:'INFERENCE_PACING_DRIFT', affectedQuestions:[...] }`.
Acceptance: Feature flag off by default; no user-visible output yet.

### G19. Archive Filters

Goal: Fast retrieval & filtering of historical attempts.
Indexes: `{ userId:1, topic:1 }`, partial `{ userId:1, score:-1 }`.
Acceptance: Filter query (topic+score range) <250ms with seeded dataset.

### G20. Personal Best Flag

Goal: Lightweight motivation without gamification.
Logic: Mark attempt if `score > max(previousScores)`.
Acceptance: Equal score does NOT re-flag; strictly greater only.

### G21. Weekly Reason Report Stub

Goal: Future email/digest foundation.
Process: CRON logs JSON summary (userId, top reasons, coverage%).
Acceptance: Log line present with ISO week id; no user delivery.

### G22. Remove Mistake Bank Code

Goal: Eliminate stale conceptual artifacts.
Action: Delete obsolete files/routes; update docs references.
Acceptance: `grep -i "mistake" src/` returns only historical changelog lines (or zero).

### G23. Quick Actions (Derived CTA Widget)

Goal: Offer immediate targeted practice link.
Input: Lowest accuracy rollup (min attempts threshold ≥5).
UI: `<QuickActions />` displays “Strengthen Inference (24/34 correct • 71%)”.
Acceptance: Hidden if no qualifying rollup.

### G24. Coverage Meter Component

Goal: Visual reinforcement of reflection habit.
Props: `{ value:number (0–1), target?:number=0.7 }`.
UI: Bar + label `58% (target 70%)`.
Acceptance: ARIA role=progressbar with `aria-valuenow`.

### G25. Export Button

Goal: Self-service data portability.
Behavior: Converts in-memory performance object → CSV; triggers download.
Acceptance: CSV generation <100ms for 90-day dataset.

### G26. Skeleton Blocks

Goal: Consistent loading placeholders.
Variants: `card`, `row`, `stat` via prop.
Acceptance: Replace with real data within 50ms after fetch resolve.

### G27. Schedule Planner

Goal: Faster admin scheduling & conflict awareness.
Logic: Suggest earliest unscheduled date slot referencing existing daily max capacity.
Acceptance: Suggestion algorithm returns deterministic slot for fixed seed.

### G28. Duplicate Warning Card

Goal: Prevent near-duplicate content injection.
Heuristic: Similarity score >0.85.
Acceptance: Card shows reference passage id & similarity %.

### G29. Health Status Indicator

Goal: Surface system readiness in admin.
Poll: `/api/health` every 60s.
Acceptance: Status color codes (ok=success-green, fail=error-red).

---

## 25. Glossary (Concise)

| Term         | Definition                                           |
| ------------ | ---------------------------------------------------- |
| Coverage     | Proportion of wrong answers tagged (30d trailing)    |
| Rollup       | Aggregated stats row per questionType/category       |
| Radar Target | Benchmark value (default 0.80) for visual comparison |
| MFR          | Marked-For-Review question state prior to submit     |

---

## 26. Tracking Matrix (Feature → Component / Endpoint)

| G ID | Core Components / Files                 | Key Endpoint(s)                |
| ---- | --------------------------------------- | ------------------------------ |
| G1   | reasonCodes.js                          | (none)                         |
| G2   | ReasonTagSelect, IncorrectQuestionBlock | PATCH /attempts/:id/reasons    |
| G3   | analytics.service.js                    | internal                       |
| G4   | TimelineChart                           | GET /performance               |
| G5   | ERROR_CODES.js, error handler           | all error responses            |
| G6   | auth cookie setter                      | login/logout                   |
| G7   | adminWhitelist middleware               | admin routes                   |
| G8   | sanitize util                           | passage/question create/update |
| G9   | Breadcrumb                              | global layout                  |
| G10  | Feedback form components                | POST /feedback                 |
| G11  | health handler, logging middleware      | GET /health                    |
| G12  | tailwind.config.js, design-system.md    | n/a                            |
| G13  | ReasonSummaryWidget                     | GET /users/me/reasons/week     |
| G14  | QuestionTypeTable                       | GET /performance               |
| G15  | assemblePerformancePayload              | GET /performance               |
| G16  | performance controller                  | GET /performance               |
| G17  | MFRConfirmModal, QuestionNavigator      | submit attempt                 |
| G18  | pacing heuristic (stub)                 | (future)                       |
| G19  | Archive filters UI                      | GET /archive                   |
| G20  | PersonalBestBadge                       | attempt creation               |
| G21  | cron weeklyReasonReport                 | (cron job)                     |
| G22  | removal script/grep                     | n/a                            |
| G23  | QuickActions                            | GET /dashboard                 |
| G24  | CoverageMeter                           | /dashboard /results            |
| G25  | ExportButton                            | GET /performance               |
| G26  | SkeletonBlock                           | all loading states             |
| G27  | SchedulePlanner                         | admin schedule routes          |
| G28  | DuplicateWarningCard                    | passage create (pre-publish)   |
| G29  | HealthStatusIndicator                   | GET /health                    |

---

## 27. Acceptance Summary (Spot Check)

| Metric / Condition            | Target                          |
| ----------------------------- | ------------------------------- |
| Coverage habit                | ≥70% tagged wrong answers (30d) |
| Performance endpoint cold P95 | <250ms @10k attempts            |
| Dashboard bundle cold P95     | <350ms                          |
| Hex leakage (grep)            | ≤5 (non-config)                 |
| Radar adoption                | ≥60% WAU open page/week         |
| Error responses with code     | 100% (4xx)                      |

---

## 28. Next Implementation Step (If Starting Now)

1. Add `reasonCodes.js`.
2. Extend `Attempt` schema + migration script (backfill empty arrays).
3. Implement PATCH reasons endpoint.
4. Stub analytics.service with mock aggregator + unit tests.
5. Build dashboard bundle endpoint returning static mocked structure (replace with real once analytics ready).

This ordering unlocks parallel FE scaffolding.

---

End of Build Catalog.
