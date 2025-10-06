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

| Term         | Definition                                                             |
| ------------ | ---------------------------------------------------------------------- |
| Coverage     | Proportion of wrong answers tagged with a reason (30d trailing)        |
| Rollup       | Aggregated stats row for a question type/category                      |
| Radar Target | Fixed benchmark (default 0.80) displayed for comparative visualization |
| MFR          | Marked-For-Review – user flagged question to revisit before submitting |

---

## 22. Revision Log

| Date       | Change Summary                                                                                        |
| ---------- | ----------------------------------------------------------------------------------------------------- |
| 2025-09-30 | Initial broader plan (superseded)                                                                     |
| 2025-10-01 | Added reason loop, immutability, breadcrumbs, explicit feedback, theme overhaul items                 |
| 2025-10-02 | Trimmed to concrete backlog only (prior iteration)                                                    |
| 2025-10-02 | Narrative expansion: converted tables to descriptive chapters, locked palette, added endpoint catalog |

End of Narrative Guide.
