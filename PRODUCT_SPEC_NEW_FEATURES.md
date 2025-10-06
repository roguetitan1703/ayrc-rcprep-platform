# ARC RC Prep Platform — New Features & Changes Specification

**Document Version:** 1.0  
**Date:** October 2, 2025  
**Status:** Ready for Implementation  
**Target Audience:** Development Team (Frontend, Backend, UI/UX)

---

## Document Purpose

This specification outlines **new features, modifications, and improvements** to the existing ARC RC Prep platform. The development team should use this as the authoritative source for understanding what to build or change in the next development cycle.

**Important:** This document describes ONLY the changes and additions. Existing features that are not mentioned here remain unchanged.

---

## 0. DESIGN SYSTEM FOUNDATION

### 0.1 `[MODIFICATION]` Complete Theme System Overhaul

**Concept:** Replace the current dark theme with a finalized light theme called "Crimson Trust" using a semantic token system.

**Goal (Current Problem):** The existing implementation uses a dark palette with ad-hoc color values and raw hex codes scattered throughout components. This creates:

- Inconsistent visual appearance across pages
- Difficulty maintaining or changing colors globally
- No preparation for future dark mode support
- Accessibility issues with contrast ratios

**Specification/Example:**

_Before:_ Components use raw hex values like `#3b82f6`, `#fb923c`, or arbitrary Tailwind utilities like `border-white/10`.

_After:_ All colors reference semantic tokens from `tailwind.config.js`:

**Color Token Reference (Finalized):**

```
Palette: https://coolors.co/f7f8fc-273043-d33f49-1a2a6c-f6b26b

background: #F7F8FC (light canvas)
card-surface: #FFFFFF (elevated cards)
surface-muted: #EEF1FA (alternating sections)
text-primary: #273043 (headings)
text-secondary: #5C6784 (body text)
primary: #D33F49 (crimson - main actions)
primary-light: #E25C62 (hover states)
primary-dark: #B32F3A (active/pressed)
info-blue: #3B82F6 (analytics, links)
warm-orange: #FB923C (gradient accents)
accent-amber: #F6B26B (warnings, highlights)
success-green: #23A094 (positive states)
error-red: #E4572E (errors, destructive)
neutral-grey: #A9B2C3 (disabled, placeholders)
border-soft: #D8DEE9 (subtle dividers)
focus-ring: #1A2A6C (accessibility outlines)
```

**Implementation Requirements:**

1. Update `tailwind.config.js` with all tokens above (already completed)
2. Refactor ALL components to use token classes (e.g., `bg-card-surface`, `text-text-secondary`)
3. Remove all raw hex values from component files
4. Replace `border-white/10` with `border-soft`
5. Add pre-commit hook to prevent future raw hex usage

**User Impact:** Users see a cohesive, professional light interface with improved readability and contrast.

---

### 0.2 `[NEW FEATURE]` Pre-commit Design Enforcement Script

**Concept:** Automated validation that prevents developers from committing code with raw hex color values.

**Goal:** Enforce the token-based design system and prevent design drift over time.

**Specification/Example:**

Create a pre-commit git hook script that:

1. Searches for pattern `#[0-9a-fA-F]{3,6}` in all files under `/client/src`
2. Excludes `tailwind.config.js`, test files, and snapshots
3. Fails the commit if any raw hex is found
4. Outputs: "❌ Raw hex color found in [filename]. Use semantic tokens instead."

**User Impact:** Developers get immediate feedback, ensuring long-term design consistency.

---

## 1. WRONG ANSWER REASON LOOP `[NEW FEATURE SET]`

### 1.1 `[NEW FEATURE]` Reason Taxonomy System

**Concept:** Introduce a structured vocabulary of standardized "reason codes" that users can assign to explain why they missed each question.

**Goal:** Transform passive answer review into active metacognitive reflection. Instead of just reading explanations, users explicitly categorize their mistakes, building awareness of recurring error patterns.

**Specification/Example:**

**Create `server/src/utils/reasonCodes.js`:**

```javascript
export const REASON_CODES = {
  MISREAD: {
    label: 'Misread / Skimmed',
    description: 'Rushed reading or skipped a key qualifier in the question or passage',
  },
  INFERENCE_GAP: {
    label: 'Inference Gap',
    description: 'Could not bridge an implicit logical step required by the question',
  },
  VOCAB_AMBIGUITY: {
    label: 'Vocabulary Confusion',
    description: 'Misunderstood a key word or phrase meaning',
  },
  TRAP_ANSWER: {
    label: 'Attractive Distractor',
    description: 'Picked a plausible but unsupported answer choice',
  },
  RUSH_TIMING: {
    label: 'Time Pressure',
    description: 'Decision driven by running out of time',
  },
  ATTENTION_SLIP: {
    label: 'Attention Lapse',
    description: 'Lost focus or got distracted during this question',
  },
  CALCULATION_ERROR: {
    label: 'Logic/Calculation Error',
    description: 'Made an error in reasoning through the answer',
  },
}
```

**Design Constraint:** Keep taxonomy to ≤12 codes for cognitive manageability.

**User Impact:** Users can quickly tag why they missed questions from a focused list rather than free-form notes.

---

### 1.2 `[NEW FEATURE]` Attempt Schema Extension (wrongReasons)

**Concept:** Extend the Attempt data model to store reason codes associated with each wrong answer.

**Goal:** Capture structured mistake metadata that can power analytics dashboards and trend detection.

**Specification/Example:**

**Modify `server/src/models/Attempt.js`:**

Add new field:

```javascript
wrongReasons: [
  {
    questionIndex: Number, // References position in questions array
    code: String, // Must match a key from REASON_CODES
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
]
```

**Validation Rules:**

- `questionIndex` must be within valid range (0 to questions.length - 1)
- `code` must exist in REASON_CODES enum
- Array is sparse (only contains wrong answer entries)
- Multiple submissions for same questionIndex → latest entry overwrites (idempotent)

**User Impact:** Users' reason selections are permanently saved and can inform future analytics.

---

### 1.3 `[NEW FEATURE]` Attempt Schema Extension (analysisNotes)

**Concept:** Add a free-form text field for qualitative reflections beyond structured reasons.

**Goal:** Allow users to capture open-ended insights that don't fit into predefined categories.

**Specification/Example:**

**Modify `server/src/models/Attempt.js`:**

Add:

```javascript
analysisNotes: {
  type: String,
  maxlength: 2000,
  default: ''
}
```

**User Impact:** Users can type general observations like "Need to slow down on inference transitions."

---

### 1.4 `[NEW FEATURE]` Reason Capture API Endpoint

**Concept:** Create a PATCH endpoint allowing users to add or update a reason for a specific wrong answer.

**Goal:** Provide a simple, idempotent API for the frontend to call when a user selects a reason tag.

**Specification/Example:**

**Create route in `server/src/routes/attempts.js`:**

```
PATCH /api/attempts/:id/reasons
```

**Request Body:**

```json
{
  "questionIndex": 2,
  "code": "INFERENCE_GAP"
}
```

**Response (200):**

```json
{
  "wrongReasons": [
    { "questionIndex": 1, "code": "MISREAD", "createdAt": "2025-10-02T10:15:00Z" },
    { "questionIndex": 2, "code": "INFERENCE_GAP", "createdAt": "2025-10-02T10:20:00Z" }
  ]
}
```

**Error Responses:**

- 400 `{ "errorCode": "INVALID_REASON_CODE", "message": "Reason code not recognized" }`
- 400 `{ "errorCode": "INVALID_QUESTION_INDEX", "message": "Question index out of range" }`
- 404 `{ "errorCode": "ATTEMPT_NOT_FOUND", "message": "Attempt not found" }`

**Business Logic:**

- If questionIndex already has a reason → overwrite with new code
- Authentication required (must be attempt owner)
- Auto-set createdAt to current timestamp

**User Impact:** Frontend can optimistically update UI immediately after user selection.

---

### 1.5 `[NEW FEATURE]` Results Page — Reason Tag Interface

**Concept:** Add a reason selection dropdown to each incorrect question block on the Results page.

**Goal:** Make reason tagging frictionless and contextual—users tag mistakes immediately after reading the explanation.

**Specification/Example:**

**Modify Results Page (`client/src/features/results/Results.jsx`):**

**Component: `<IncorrectQuestionBlock />`**

_Before:_ Shows only: user's answer, correct answer, explanation.

_After:_ Add below explanation:

```jsx
<div className="mt-4 pt-4 border-t border-soft">
  <label className="text-sm text-text-secondary">
    Why did you miss this? (optional, but powerful)
  </label>
  <ReasonTagSelect
    questionIndex={index}
    attemptId={attemptId}
    currentReason={attempt.wrongReasons?.find((r) => r.questionIndex === index)?.code}
    onReasonSelected={(code) => handleReasonTag(index, code)}
  />
</div>
```

**Component: `<ReasonTagSelect />`** (NEW)

Props:

- `questionIndex: number`
- `attemptId: string`
- `currentReason?: string` (pre-selected if already tagged)
- `onReasonSelected: (code: string) => void`

Behavior:

1. Renders dropdown with options from REASON_CODES
2. On selection → calls `PATCH /api/attempts/:id/reasons` with optimistic update
3. Shows subtle checkmark icon when successfully saved
4. On failure → rolls back and shows error toast

**User Impact:** Users can immediately classify mistakes without leaving the results context.

---

### 1.6 `[NEW FEATURE]` Coverage Metric & Progress Bar

**Concept:** Introduce a "Reason Coverage" metric that tracks what percentage of wrong answers have been tagged with reasons.

**Goal:**

- Encourage users to build the tagging habit through visible progress
- Gamify reflection lightly without extrinsic points

**Specification/Example:**

**Calculation:**

```
coverage = taggedWrong / totalWrong (trailing 30 days)
```

**Where to Display:**

1. **Results Page** — Add `<CoverageMeter />` component at top:

```jsx
<div className="mb-6">
  <div className="flex justify-between text-sm mb-2">
    <span className="text-text-secondary">Reason Coverage</span>
    <span className="text-text-primary font-semibold">58% / 70% target</span>
  </div>
  <div className="h-2 bg-surface-muted rounded-full overflow-hidden">
    <div
      className="h-full bg-primary transition-all duration-500"
      style={{ width: `${coverage * 100}%` }}
    />
  </div>
</div>
```

2. **Dashboard** — Show in `<DashboardStatsRow />` as third metric tile

**Conditional Reinforcement:**

- If coverage increases by ≥10 percentage points in a single session → show toast:
  ```
  "Great reflection session — tagging accelerates improvement!"
  ```

**User Impact:** Users see tangible progress toward a coverage goal, encouraging continued tagging.

---

### 1.7 `[NEW FEATURE]` Weekly Reason Summary API

**Concept:** Create an endpoint that aggregates the user's most frequent mistake reasons over the past 7 days.

**Goal:** Power a dashboard widget showing friction patterns at a glance.

**Specification/Example:**

**Create endpoint:**

```
GET /api/users/me/reasons/week
```

**Response (200):**

```json
{
  "top": [
    { "code": "MISREAD", "count": 5 },
    { "code": "INFERENCE_GAP", "count": 3 }
  ],
  "taggedWrong": 8,
  "totalWrong": 12,
  "coverage": 0.67
}
```

**Logic:**

1. Query all user attempts from last 7 days
2. Flatten all wrongReasons arrays
3. Count occurrences of each code
4. Return top 2 (or all if ≤2 exist)
5. Calculate coverage: tagged / total wrong answers

**User Impact:** Users get a weekly snapshot of their most common mistake types without manual analysis.

---

### 1.8 `[NEW FEATURE]` Dashboard Reason Summary Widget

**Concept:** Display a small card on the Dashboard showing the user's top 2 mistake reasons from the past week.

**Goal:** Surface friction patterns where users spend most time (Dashboard) to drive targeted practice.

**Specification/Example:**

**Add to Dashboard (`client/src/features/dashboard/Dashboard.jsx`):**

**Component: `<ReasonSummaryWidget />`**

Layout:

```jsx
<div className="bg-card-surface border border-soft rounded-xl p-6">
  <h3 className="text-lg font-semibold text-text-primary mb-3">Top Friction Points (7 days)</h3>

  {top.length > 0 ? (
    <>
      <div className="flex gap-2 mb-3">
        {top.map((reason) => (
          <div key={reason.code} className="px-3 py-1 bg-surface-muted rounded-md text-sm">
            {REASON_CODES[reason.code].label} ({reason.count})
          </div>
        ))}
      </div>
      <Link to="/performance" className="text-sm text-info-blue hover:underline">
        View full analytics →
      </Link>
    </>
  ) : (
    <p className="text-text-secondary text-sm">
      Tag reasons on your results page to unlock insights
    </p>
  )}
</div>
```

**Empty State Logic:**

- If no reasons tagged yet → show encouragement message
- If coverage = 0 → hide widget entirely (optional)

**User Impact:** Users immediately see their recurring mistakes when they log in, driving awareness.

---

## 2. ANALYTICS PIPELINE & PERFORMANCE STUDIO `[NEW FEATURE SET]`

### 2.1 `[NEW FEATURE]` Analytics Service Architecture

**Concept:** Create a centralized backend service that performs expensive aggregations once and caches results, feeding multiple frontend surfaces.

**Goal:** Avoid repeated heavy MongoDB queries. A single analytics computation should power the Dashboard, Performance Studio, and future surfaces.

**Specification/Example:**

**Create `server/src/services/analytics.service.js`:**

**Exported Functions:**

1. **`buildQuestionRollups(userId, range)`**

   - Aggregates attempts by questionType/category
   - Returns: `[{ category, questionType, attempts, correct, accuracy }]`
   - Used by: Performance Studio table & radar

2. **`buildProgressTimeline(userId, range)`**

   - Creates daily buckets of attempts + accuracy
   - Fills missing days with `attempts: 0`
   - Returns: `[{ date, attempts, accuracy }]`
   - Used by: Dashboard sparkline, Performance timeline chart

3. **`buildRadarDataset(userId, range)`**

   - Transforms rollups into radar-friendly shape
   - Returns: `[{ metric: 'Inference', actual: 0.72, target: 0.8 }]`
   - Default target = 0.80 for all categories

4. **`buildAttemptHistory(userId, limit)`**

   - Returns recent attempts with personal best flag
   - Returns: `[{ id, date, score, isPersonalBest }]`

5. **`buildReasonsSummary(userId, days)`**

   - Already described in 1.7
   - Returns: `{ top, taggedWrong, totalWrong, coverage }`

6. **`assemblePerformancePayload(parts)`**
   - Normalizes all above outputs into single response shape
   - Returns unified object consumed by Performance Studio

**Caching Strategy:**

- In-memory LRU cache keyed by `userId:range`
- TTL: 60 seconds
- Bust cache on new attempt creation for that user

**Performance Target:**

- Warm cache: <50ms
- Cold compute P95 @10k attempts: <250ms

**User Impact:** Users experience fast load times even with extensive attempt history.

---

### 2.2 `[NEW FEATURE]` Performance Studio Page

**Concept:** Create a dedicated analytics page (`/performance`) that consolidates all performance insights into a single, calm analytical workspace.

**Goal:** Replace scattered stats across the app with one authoritative surface. Emphasize variance, trend, and distribution over vanity totals.

**Specification/Example:**

**New Route:** `/performance`

**Page Layout (6 sections):**

**Section 1: Range Selector**

- Component: `<PerfRangeSelector />`
- Pills: "7 days" | "30 days" | "90 days"
- Active state: `bg-primary text-white`
- Updates all sections below when clicked

**Section 2: Callout Metrics**

- Component: `<PerfCallouts />`
- Three tiles:
  - Overall Accuracy: 78%
  - Attempts (selected range): 6
  - Topic Breadth: 12 categories attempted
- Styling: `bg-card-surface border border-soft rounded-xl p-6`

**Section 3: Radar Chart**

- Component: `<RadarChart />`
- Displays each questionType accuracy vs fixed target (80%)
- Visual: Crimson fill (40% opacity) for actual, dashed blue ring for target
- Grid rings at 40%, 60%, 80%
- Accessibility: Provide hidden `<table>` with same data for screen readers

**Section 4: Question Type Table**

- Component: `<QuestionTypeTable />`
- Columns: Type | Attempts | Correct | Accuracy %
- Default sort: Attempts descending
- Color coding:
  - <60%: `text-error-red`
  - 60-74%: `text-accent-amber`
  - ≥75%: `text-success-green`
- Sortable columns (click header to toggle)

**Section 5: Timeline Chart**

- Component: `<TimelineChart />`
- Dual-axis: bars (attempts) + line (accuracy)
- X-axis: dates in selected range
- Zero-attempt days: show bar at height 0 but keep grid tick
- Bars: `fill-info-blue`, Line: `stroke-primary`

**Section 6: Attempt History**

- Component: `<AttemptHistoryList />`
- Reverse chronological list
- Columns: Date | Score | Passage Title | Personal Best Badge
- Personal Best: Small `<PersonalBestBadge />` (crimson) next to score if `isPersonalBest === true`

**Section 7: Export Button**

- Component: `<ExportButton />`
- On click → transforms current normalized payload to CSV
- Downloads as `performance_${range}.csv`
- No additional API call (uses in-memory data)

**Data Source:**

```
GET /api/performance?range=30
```

**User Impact:** Users can diagnose performance comprehensively in one place instead of hunting across multiple pages.

---

### 2.3 `[NEW FEATURE]` Performance Detail API Endpoint

**Concept:** Single endpoint returning all normalized analytics data for Performance Studio.

**Goal:** Minimize frontend orchestration and reduce latency through one optimized query.

**Specification/Example:**

**Endpoint:**

```
GET /api/performance?range={7|30|90}
```

**Response (200):**

```json
{
  "callouts": {
    "overallAccuracy": 0.78,
    "attempts7d": 6,
    "topicBreadth": 12
  },
  "radar": [
    { "metric": "Inference", "actual": 0.72, "target": 0.8 },
    { "metric": "Main Idea", "actual": 0.84, "target": 0.8 }
  ],
  "questionTypeTable": [{ "type": "Inference", "attempts": 34, "correct": 24, "accuracy": 0.706 }],
  "timeline": {
    "range": "30",
    "points": [{ "date": "2025-09-05", "attempts": 1, "accuracy": 0.6 }]
  },
  "attemptHistory": [
    { "id": "abc123", "date": "2025-10-01", "score": 0.79, "isPersonalBest": true }
  ]
}
```

**Caching:** Uses analytics service cache (see 2.1)

**User Impact:** Performance Studio loads in <1.2s even with extensive history.

---

### 2.4 `[MODIFICATION]` Dashboard Bundle Endpoint

**Concept:** Create a unified endpoint that returns all Dashboard data in one call instead of multiple requests.

**Goal (Current Problem):** If Dashboard widgets currently make separate API calls for greeting, stats, reasons, and progress preview, this creates waterfall delays and slower perceived performance.

**Specification/Example:**

**New Endpoint:**

```
GET /api/dashboard
```

**Response (200):**

```json
{
  "greeting": {
    "name": "Asha",
    "streakDays": 4
  },
  "stats": {
    "attempts7d": 6,
    "accuracy7d": 0.74,
    "coverage": 0.42
  },
  "reasons": {
    "top": [{ "code": "MISREAD", "count": 5 }],
    "coverage": 0.42
  },
  "progressPreview": [{ "date": "2025-09-25", "attempts": 1, "accuracy": 0.6 }]
}
```

_Before:_ Dashboard makes 3-4 separate API calls → slow initial paint

_After:_ Single call → all widgets render simultaneously from one payload

**Error Handling:** If reasons fetch fails internally → return empty array for `top`, log warning (don't fail entire request)

**User Impact:** Dashboard loads faster with less API overhead.

---

### 2.5 `[NEW FEATURE]` Dashboard Greeting Component

**Concept:** Personalized salutation showing user's name and current streak.

**Goal:** Increase daily re-entry motivation through light social reinforcement.

**Specification/Example:**

**Component: `<DashboardGreeting />`**

Props: `{ name: string, streakDays: number }`

Display logic:

- Derive time-of-day: "Morning" (5am-12pm), "Afternoon" (12pm-6pm), "Evening" (6pm+)
- Format: `"${timeOfDay}, ${name} — Streak: ${streakDays} days"`
- Example: "Morning, Asha — Streak: 4 days"

Styling: Large heading, `text-text-primary`, `font-bold`

**User Impact:** Users feel recognized and see progress at a glance.

---

### 2.6 `[NEW FEATURE]` Dashboard Stats Row

**Concept:** Three-tile KPI row showing volume, accuracy, and reflection coverage.

**Goal:** Provide quick orientation on recent momentum.

**Specification/Example:**

**Component: `<DashboardStatsRow />`**

Props: `{ attempts7d: number, accuracy7d: number, coverage: number }`

Layout: Three equal-width tiles side-by-side (responsive stack on mobile)

Tiles:

1. Attempts (7d): `{attempts7d}`
2. Accuracy (7d): `{accuracy7d * 100}%`
3. Reason Coverage (30d): `{coverage * 100}% / 70% target`

Skeleton state: Show `<SkeletonBlock />` on initial load

**User Impact:** Users quickly assess if they're on track with practice goals.

---

### 2.7 `[NEW FEATURE]` Progress Preview Sparkline

**Concept:** Mini timeline chart showing recent attempts + accuracy trend.

**Goal:** Visual micro-reinforcement of consistency and improvement.

**Specification/Example:**

**Component: `<ProgressPreview />`**

Props: `{ points: [{ date, attempts, accuracy }] }`

Rendering:

- Inline SVG (no heavy chart library)
- Bars for attempts (height scaled to max in range)
- Line overlay for accuracy (0-100% scale)
- Width: full container, Height: ~80px

Empty state:

- Show message: "Complete your first attempt to unlock trends"
- CTA button: "Start First RC" → links to `/test`

**User Impact:** Users see visual momentum-building without navigating to Performance Studio.

---

## 3. TEST EXPERIENCE ENHANCEMENTS `[MODIFICATION + NEW FEATURES]`

### 3.1 `[NEW FEATURE]` Marked-For-Review (MFR) System

**Concept:** Allow users to flag questions during a test that they want to revisit before submitting, without committing to an answer.

**Goal:** Support time allocation strategies where users answer easy questions first then return to harder ones.

**Specification/Example:**

**Test Page Modifications:**

**Component: `<QuestionCard />`** (Existing)

_Add:_

- "Mark for Review" button/flag icon in question header
- Keyboard shortcut: Press `M` to toggle MFR state
- Visual indicator: Add `ring-2 ring-focus-ring` outline + small "MFR" pill when marked

**Data Tracking:**

- Store MFR state in local component state (not persisted to DB)
- Array: `markedForReview: number[]` (question indices)

**Component: `<QuestionNavigator />`** (Existing)

_Modify:_

- Question number buttons show visual state:
  - Unanswered: `border border-neutral-grey`
  - Answered: `bg-primary-light text-white`
  - Marked for Review: `ring-2 ring-focus-ring`
  - Current question: `ring-2 ring-primary-dark`

**User Impact:** Users can strategically defer difficult questions without losing track.

---

### 3.2 `[NEW FEATURE]` MFR Submit Guard Modal

**Concept:** Before final submission, if any questions are marked for review, show a confirmation modal listing them.

**Goal:** Reduce accidental submissions when user intended to revisit flagged questions.

**Specification/Example:**

**Component: `<MFRConfirmModal />`**

Trigger: User clicks "Submit Test" AND `markedForReview.length > 0`

Modal content:

```jsx
<Modal>
  <h3>You marked {markedCount} questions for review</h3>
  <p>Questions: {markedForReview.join(', ')}</p>
  <p>Do you want to submit anyway?</p>

  <div className="flex gap-3">
    <Button variant="ghost" onClick={onCancel}>
      Review Questions
    </Button>
    <Button variant="primary" onClick={onConfirm}>
      Submit Anyway
    </Button>
  </div>
</Modal>
```

Behavior:

- Cancel → closes modal, stays on test page
- Confirm → proceeds with submission

**User Impact:** Users avoid premature submissions, improving answer quality.

---

### 3.3 `[IMPROVEMENT]` Test Layout Optimization

**Concept:** Adjust two-column layout proportions and add scroll constraints.

**Goal (Current Problem):** If passage column is too narrow or questions don't auto-scroll into view, users lose context or experience awkward navigation.

**Specification/Example:**

_Before:_ Passage and questions might be 50/50 split or have no constrained scroll.

_After:_

- ≥1280px: Passage 55% left, Questions 45% right
- <1024px: Stack vertically (passage full width above questions)
- Passage container: `max-h-[calc(100vh-160px)] overflow-y-auto` to prevent page jump
- When user navigates to question → auto-scroll that question card into view

**User Impact:** Better reading ergonomics and smoother question navigation.

---

### 3.4 `[NEW FEATURE]` Keyboard Navigation Enhancements

**Concept:** Support full keyboard control for test-taking without mouse.

**Goal:** Improve accessibility and speed for power users.

**Specification/Example:**

**Keyboard Map:**

- `↑` / `↓` → Move focus to previous/next question
- `1`, `2`, `3`, `4` → Select answer choice for focused question
- `M` → Toggle marked-for-review state
- `Enter` → Jump to next unanswered question

**Accessibility:**

- Announce question focus changes via `aria-live="polite"`
- Timer updates aria region every 60s (not per second to reduce noise)

**User Impact:** Experienced users can complete tests faster; screen reader users gain full control.

---

### 3.5 `[NEW FEATURE]` Keyboard Shortcuts Legend

**Concept:** Add a help popover listing all keyboard shortcuts.

**Goal:** Improve discoverability of keyboard features.

**Specification/Example:**

**Component: `<KeyboardShortcutsModal />`**

Trigger: Click keyboard icon in test header OR press `?` key

Modal content: Table of shortcuts with icons and descriptions

**User Impact:** Users discover navigation shortcuts without guessing.

---

## 4. RESULTS PAGE ENHANCEMENTS `[MODIFICATIONS + NEW FEATURES]`

### 4.1 `[NEW FEATURE]` Attempt Score Card Hero

**Concept:** High-level summary card at top of Results page showing key attempt metrics.

**Goal:** Provide immediate context before deep detail dive.

**Specification/Example:**

**Component: `<AttemptScoreCard />`**

Layout: Large card at page top

Display:

- Score: 79% (large primary text)
- Correct: 19/24
- Duration: e.g., "12 min 34 sec"
- Personal Best Badge (if `isPersonalBest === true`)

Styling: `bg-card-surface border border-soft rounded-xl p-8`

Optional: Radial gradient glow around card if personal best

**User Impact:** Users get instant gratification or clear signal of performance before detailed review.

---

### 4.2 `[MODIFICATION]` Incorrect Question Blocks — Collapsed by Default

**Concept:** Change incorrect question blocks to start collapsed instead of expanded.

**Goal (Current Problem):** If all wrong answers show expanded by default, the page is overwhelming and slow to render, especially for users who missed many questions.

**Specification/Example:**

_Before:_ All incorrect questions show full explanation immediately (heavy DOM)

_After:_

- Show collapsed: Question text + "Expand to see explanation"
- On expand → lazy-mount explanation + reason selector
- Benefits: Faster TTI, less visual overwhelm

**User Impact:** Results page loads faster; users choose which mistakes to deep-dive.

---

### 4.3 `[NEW FEATURE]` Category Accuracy Table

**Concept:** Add a table showing user's accuracy broken down by question category.

**Goal:** Help users identify systematic weaknesses at a category level.

**Specification/Example:**

**Component: `<CategoryAccuracyTable />`**

Data source: Derive from rollup aggregator (same as Performance Studio)

Columns: Category | Attempts | Correct | Accuracy %

Sorting: By attempts descending (default)

Display location: Below incorrect questions section

**User Impact:** Users see immediately which category needs targeted practice.

---

### 4.4 `[NEW FEATURE]` Analysis Notes Textarea

**Concept:** Add a free-form text field for users to write qualitative reflections.

**Goal:** Complement structured reason tagging with open-ended insights.

**Specification/Example:**

**Component: `<AnalysisNotesTextarea />`**

Location: Bottom of Results page

Behavior:

- Debounced save (800ms) via PATCH to `analysisNotes` field
- Optimistic UI update (show "Saving..." indicator)
- Max length: 2000 characters
- Placeholder: "What pattern did you notice in this attempt?"

**User Impact:** Users capture nuanced reflections beyond predefined tags.

---

## 5. ARCHIVE PAGE IMPROVEMENTS `[NEW FEATURE]`

### 5.1 `[NEW FEATURE]` Archive Filters

**Concept:** Add filtering controls to narrow down historical attempt list.

**Goal:** Improve retrieval speed for large attempt histories.

**Specification/Example:**

**Component: `<ArchiveFilters />`**

Controls:

1. **Topics:** Multi-select dropdown (e.g., Inference, Science, History)
2. **Score Range:** Min/max slider (0-100%)
3. **Date Range:** Start/end date pickers

Query example:

```
GET /api/archive?topics=Inference,Science&minScore=0.6&from=2025-09-01&to=2025-10-01&page=1
```

**Backend Changes:**

- Add query param parsing in archive controller
- Add compound index: `{ userId: 1, topic: 1 }` and partial index: `{ userId: 1, score: -1 }`

**User Impact:** Users quickly find specific attempts without scrolling through full history.

---

## 6. PERSONAL BEST SYSTEM `[NEW FEATURE]`

### 6.1 `[NEW FEATURE]` Personal Best Detection

**Concept:** Automatically flag attempts that represent a user's highest score to date.

**Goal:** Provide motivational milestone recognition without leaderboards or social comparison.

**Specification/Example:**

**Logic:**

- On attempt creation → compare `score` to all prior attempts for that user
- If strictly greater than previous max → set `isPersonalBest = true`
- Only one attempt can be personal best at a time (later high scores unset prior flag)

**Display Locations:**

1. Results page: Large badge "🎉 Personal Best!" on AttemptScoreCard
2. Performance Studio attempt history: Small badge next to score
3. Archive: Badge in score column

**Styling:** Use `primary-light` background with white text

**User Impact:** Users get positive reinforcement for genuine improvement without extrinsic gamification.

---

## 7. ADMIN ENHANCEMENTS `[NEW FEATURES]`

### 7.1 `[NEW FEATURE]` Duplicate Passage Detection

**Concept:** When admin creates or edits a passage, run fuzzy similarity check against recent passages.

**Goal:** Prevent accidental content duplication and maintain content freshness.

**Specification/Example:**

**Implementation:**

- On passage save (pre-publish) → compare against last 200 passages
- Use Levenshtein distance or trigram similarity
- If similarity score >0.85 → show non-blocking warning

**Component: `<DuplicateWarningCard />`**

Display:

```jsx
<div className="bg-accent-amber/10 border border-accent-amber rounded p-4">
  <p>⚠️ Possible duplicate of Passage #1234 (88% similar)</p>
  <Link to="/admin/passage/1234">Review existing passage</Link>
</div>
```

User action: Can dismiss and proceed, or review and cancel

**User Impact:** Admins avoid publishing near-duplicate content.

---

### 7.2 `[NEW FEATURE]` Schedule Planner UI

**Concept:** Visual calendar interface for assigning passages to dates.

**Goal:** Streamline content scheduling with visual confirmation of coverage.

**Specification/Example:**

**Component: `<SchedulePlanner />`**

Layout:

- Left panel: Unscheduled passages list
- Right panel: Calendar showing next 30 days with assigned passages
- Suggest earliest free slot button

Interaction:

- Drag passage from list → drop on calendar date
- OR click "Schedule Next Available" → auto-assigns to earliest empty date

**User Impact:** Admins schedule faster with fewer gaps.

---

### 7.3 `[NEW FEATURE]` Admin Dashboard Health Panel

**Concept:** Simple operational status panel showing key system metrics.

**Goal:** Quick integrity check without needing external monitoring tools.

**Specification/Example:**

**Component: `<AdminDashboard />`**

Tiles:

1. Health Status (from `/api/health` endpoint)
2. Total Passages
3. Scheduled Next 7 Days
4. Pending Drafts Count

Health check endpoint:

```
GET /api/health
Response: { uptime: 12345, db: { ok: true } }
```

**User Impact:** Admins spot issues quickly (e.g., DB connection failure).

---

## 8. SECURITY & HARDENING `[IMPROVEMENTS]`

### 8.1 `[IMPROVEMENT]` Secure Cookie Configuration

**Concept:** Harden session cookies with secure flags.

**Goal (Current Problem):** If cookies are not set with security flags, they're vulnerable to XSS and CSRF attacks in production.

**Specification/Example:**

_Before:_ Cookies may be set without security flags

_After:_ When `NODE_ENV=production`, set:

```javascript
{
  httpOnly: true,
  secure: true,
  sameSite: 'strict'
}
```

**User Impact:** User sessions are more secure against common web attacks.

---

### 8.2 `[NEW FEATURE]` HTML Sanitization

**Concept:** Strip dangerous HTML from user/admin inputs before storing.

**Goal:** Prevent stored XSS attacks through passage content or user notes.

**Specification/Example:**

**Implementation:**

- Install sanitizer library (e.g., `sanitize-html`)
- Apply on create/update routes for:
  - Passage body
  - Question text
  - Explanation text
  - Analysis notes

Strip: `<script>` tags, event handlers (`onerror`, `onclick`, etc.)

**User Impact:** Platform is protected from malicious content injection.

---

### 8.3 `[NEW FEATURE]` Error Code Enum

**Concept:** Standardize error responses with machine-readable codes.

**Goal:** Enable consistent frontend error handling and localization.

**Specification/Example:**

**Create `server/src/utils/ERROR_CODES.js`:**

```javascript
export const ERROR_CODES = {
  INVALID_REASON_CODE: 'INVALID_REASON_CODE',
  INVALID_QUESTION_INDEX: 'INVALID_QUESTION_INDEX',
  ATTEMPT_NOT_FOUND: 'ATTEMPT_NOT_FOUND',
  RATE_LIMIT: 'RATE_LIMIT',
  ADMIN_FIELD_FORBIDDEN: 'ADMIN_FIELD_FORBIDDEN',
  // ... more codes
}
```

**Response Format:**

```json
{
  "errorCode": "RATE_LIMIT",
  "message": "Too many attempts. Try again shortly."
}
```

**Frontend Mapping:**

- Toast component maps `errorCode` → user-friendly message
- Allows future i18n without backend changes

**User Impact:** Users see consistent, clear error messages.

---

### 8.4 `[IMPROVEMENT]` Auth Rate Limiting

**Concept:** Throttle login attempts to prevent brute force attacks.

**Goal (Current Problem):** Unlimited login attempts enable password guessing.

**Specification/Example:**

_Before:_ No login throttling

_After:_ Implement sliding window: 10 attempts per 15 minutes per IP + user combo

On exceed: Return 429 with error:

```json
{
  "errorCode": "RATE_LIMIT",
  "message": "Too many login attempts. Try again in 15 minutes."
}
```

**User Impact:** Legitimate users unaffected; attackers blocked.

---

### 8.5 `[NEW FEATURE]` Admin Field Whitelist

**Concept:** Create explicit allow-list for fields admin can modify on passages.

**Goal:** Prevent accidental schema drift or unauthorized field updates.

**Specification/Example:**

**Implementation:**

- Define allowed fields array in controller
- Filter request body to only include allowed keys
- Reject attempts to modify locked fields with 400 error:

```json
{
  "errorCode": "ADMIN_FIELD_FORBIDDEN",
  "message": "Cannot modify locked field"
}
```

**User Impact:** System integrity protected from misconfigured admin requests.

---

## 9. USER PREFERENCES & PROFILE `[NEW FEATURES]`

### 9.1 `[NEW FEATURE]` User Preferences Schema

**Concept:** Extend User model to store personalization settings.

**Goal:** Allow customization of reading experience and goal tracking.

**Specification/Example:**

**Modify `server/src/models/User.js`:**

Add field:

```javascript
preferences: {
  type: Object,
  default: {},
  goalType: { type: String, enum: ['score', 'consistency'], default: 'score' },
  examDate: { type: Date },
  focusDefault: { type: String, enum: ['passage-first', 'balanced'], default: 'passage-first' },
  fontScale: { type: Number, min: 0.8, max: 1.4, default: 1.0 },
  theme: { type: String, enum: ['light'], default: 'light' } // dark mode deferred
}
```

**User Impact:** Users can tailor the app to their needs.

---

### 9.2 `[NEW FEATURE]` Profile Preferences Form

**Concept:** UI for editing user preferences.

**Goal:** Give users control over their experience.

**Specification/Example:**

**Component: `<PreferencesForm />`**

Location: `/profile` page

Sections:

1. **Reading Preferences**

   - Font Scale slider (80% - 140%)
   - Focus Layout select (passage-first | balanced)

2. **Goal Settings**

   - Goal Type radio (Score Growth | Consistency)
   - Exam Date picker (optional)

3. **Theme** (locked for now)
   - "Light Theme (Dark Mode Coming Soon)" — disabled toggle

Save: PATCH `/api/users/me/preferences` (batch update)

**User Impact:** Users customize reading comfort and motivation framing.

---

### 9.3 `[NEW FEATURE]` Onboarding Flow

**Concept:** Lightweight 3-step wizard for new users to set initial preferences.

**Goal:** Personalize experience immediately after registration.

**Specification/Example:**

**Flow:**

1. **Step 1: Goal Style** → Radio: Score Growth vs Consistency
2. **Step 2: Exam Date** → Date picker (skippable)
3. **Step 3: Reading Preference** → Passage-first vs Balanced layout

On complete → PATCH preferences, redirect to Dashboard

**User Impact:** Users feel onboarded with personalized defaults.

---

## 10. FEEDBACK SYSTEM `[MODIFICATION]`

### 10.1 `[MODIFICATION]` Explicit Feedback Selection

**Concept:** Remove pre-selected values from feedback form ratings.

**Goal (Current Problem):** If rating dropdowns have default selections, user might accidentally submit without intentional rating, biasing data.

**Specification/Example:**

_Before:_ Clarity and Usefulness ratings might default to middle value (e.g., 3/5)

_After:_

- Both dropdowns start with placeholder: "Select rating..."
- Submit button disabled until BOTH rated
- On attempt to submit before selection → show validation message

**User Impact:** Feedback data is more accurate and intentional.

---

## 11. CONTACT PAGE `[NEW FEATURE]`

### 11.1 `[NEW FEATURE]` Contact Form with Spam Protection

**Concept:** Simple contact form with honeypot anti-spam.

**Goal:** Provide support channel while blocking bots.

**Specification/Example:**

**Component: `<ContactForm />`**

Fields:

- Name (required)
- Email (required, validated)
- Message (required, textarea)
- **Honeypot:** Hidden field `nickname` (CSS `display:none`)

Backend behavior:

- If `nickname` is filled → return 204 (silent discard, don't store)
- Otherwise → save to `contacts` collection with `ipHash: SHA256(ip)`

Data retention: Purge contacts older than 180 days via CRON

**User Impact:** Users can reach support; spam is filtered silently.

---

## 12. STATIC PAGE IMPROVEMENTS `[MODIFICATIONS]`

### 12.1 `[MODIFICATION]` About Page Theme Refactor

**Concept:** Replace raw hex gradient stops with semantic tokens.

**Goal (Current Problem):** About page currently uses hardcoded `#3b82f6` and `#fb923c` in gradient definitions, violating token system.

**Specification/Example:**

_Before:_

```jsx
gradient: 'from-accent-amber to-[#fb923c]'
gradient: 'from-success-green to-[#3b82f6]'
```

_After:_

```jsx
gradient: 'from-accent-amber to-warm-orange'
gradient: 'from-success-green to-info-blue'
```

Also replace any `border-white/10` with `border-soft`

**User Impact:** About page styling is now maintainable through design system.

---

### 12.2 `[MODIFICATION]` Terms Page Typo Fix

**Concept:** Fix className typo in Terms page.

**Goal (Current Problem):** One paragraph has `xlassName` instead of `className`, breaking styling.

**Specification/Example:**

_Before:_

```jsx
<p xlassName='text-text-secondary'>
```

_After:_

```jsx
<p className='text-text-secondary'>
```

**User Impact:** Text renders with correct styling.

---

## 13. GLOBAL UI COMPONENTS `[NEW FEATURES]`

### 13.1 `[NEW FEATURE]` Toast Notification System

**Concept:** Centralized ephemeral messaging for success/error/status updates.

**Goal:** Consistent user feedback across all interactions.

**Specification/Example:**

**Component: `<ToastHost />`**

Location: Top-level App component

Behavior:

- Stacks toasts at top-right
- Max 3 concurrent
- Auto-dismiss after 4 seconds (except destructive actions)
- Maps error codes to friendly messages

Props per toast: `{ type: 'success'|'error'|'info', message: string, errorCode?: string }`

**User Impact:** Users get consistent feedback without blocking UI.

---

### 13.2 `[NEW FEATURE]` Breadcrumb Navigation

**Concept:** Auto-generated breadcrumb trail showing current location.

**Goal:** Reduce navigation confusion in deep page hierarchies.

**Specification/Example:**

**Component: `<Breadcrumb />`**

Location: Layout header (all pages except `/test`)

Auto-derive from route:

- `/performance` → "Home / Performance"
- `/archive` → "Home / Archive"
- `/admin/schedule` → "Home / Admin / Schedule"

Last segment: not a link (current page)

**User Impact:** Users maintain orientation and can jump back easily.

---

### 13.3 `[NEW FEATURE]` Loading Skeleton Components

**Concept:** Unified skeleton placeholders for async data loading.

**Goal:** Consistent perceived performance and polish.

**Specification/Example:**

**Component: `<SkeletonBlock />`**

Variants:

- `<SkeletonCard />` — full card shape
- `<SkeletonRow />` — table row
- `<SkeletonStat />` — metric tile

Styling: `animate-pulse bg-surface-muted rounded`

**User Impact:** App feels faster and more refined during loads.

---

### 13.4 `[NEW FEATURE]` Modal Shell Component

**Concept:** Reusable modal container with consistent styling.

**Goal:** DRY principle for all modal dialogs.

**Specification/Example:**

**Component: `<ModalShell />`**

Props: `{ isOpen, onClose, children }`

Styling:

- Overlay: `bg-background/60 backdrop-blur-xs`
- Container: `max-w-lg p-6 bg-card-surface border border-soft shadow-card rounded-2xl`

**User Impact:** All modals have consistent look/feel.

---

### 13.5 `[MODIFICATION]` Focus Ring Standardization

**Concept:** Apply consistent focus styles to all interactive elements.

**Goal (Current Problem):** Focus states may be inconsistent or missing on some elements, hurting keyboard navigation.

**Specification/Example:**

_Before:_ Ad-hoc or missing focus styles

_After:_ Global utility class or styled-component:

```css
focus:outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-2 focus:ring-offset-background
```

Apply to: buttons, links, inputs, select, question navigator items

**User Impact:** Keyboard users see clear focus indicators everywhere.

---

## 14. PERFORMANCE BUDGETS `[NEW REQUIREMENTS]`

### 14.1 `[NEW REQUIREMENT]` API Response Time Targets

**Concept:** Establish measurable latency goals for key endpoints.

**Goal:** Ensure app remains responsive under load.

**Specification/Example:**

Targets:

- Dashboard bundle: P95 <200ms (cold <350ms)
- Performance detail: P95 <250ms @10k attempts
- Reason capture PATCH: P95 <100ms

Instrumentation: Add `x-response-time` header + logging middleware

**User Impact:** Users experience consistently fast interactions.

---

### 14.2 `[NEW REQUIREMENT]` Client Rendering Targets

**Concept:** Frame-rate budgets for chart rendering.

**Goal:** Smooth interactions without jank.

**Specification/Example:**

Targets:

- Radar chart render: ≤24ms/frame
- Timeline chart render: ≤16ms/frame

Measurement: Use Performance API `mark()` / `measure()`

**User Impact:** Animations and transitions feel fluid.

---

### 14.3 `[NEW REQUIREMENT]` CSV Export Performance

**Concept:** Fast data export without blocking UI.

**Goal:** Support offline analysis without perceived lag.

**Specification/Example:**

Target: <1.5 seconds for 90-day dataset

Implementation: Pre-format rows in memory (no streaming needed at current scale)

**User Impact:** Users get exports instantly.

---

## 15. METRICS & SUCCESS CRITERIA `[NEW REQUIREMENTS]`

### 15.1 `[NEW METRIC]` Reason Coverage Target

**Concept:** Track what percentage of wrong answers get tagged.

**Goal:** Measure adoption of reflective learning loop.

**Specification/Example:**

Formula: `taggedWrong / totalWrong (trailing 30 days)`

Target: ≥70% within 30 days of feature launch

Display: Dashboard stats row + Results page meter

**User Impact:** Users see progress toward reflection goal.

---

### 15.2 `[NEW METRIC]` Performance Studio Adoption

**Concept:** Track weekly active users who open Performance Studio.

**Goal:** Validate value of consolidated analytics surface.

**Specification/Example:**

Formula: `uniqueUsersPerformanceView / weeklyActiveUsers`

Target: ≥60% weekly

Instrumentation: Log page view events

**User Impact:** (Internal metric; informs future prioritization)

---

### 15.3 `[NEW METRIC]` Category Accuracy Spread

**Concept:** Measure consistency across question types.

**Goal:** Detect unbalanced practice patterns.

**Specification/Example:**

Formula: Standard deviation of category accuracy percentages

Target: ≤12 percentage points

Use: Internal health metric; could trigger future personalized recommendations

**User Impact:** (Internal; may drive future "Practice Inference" CTAs)

---

## 16. DEFERRED / FUTURE FEATURES (NOT IN SCOPE)

The following were discussed but explicitly deferred:

### 16.1 `[DEFERRED]` Dark Mode

- Wait until light theme fully adopted
- Will re-map tokens to deep slate backgrounds

### 16.2 `[DEFERRED]` Pacing Insights Engine

- Per-question timing analysis
- "You spend 30% more time on Inference questions" banner
- Behind feature flag initially

### 16.3 `[DEFERRED]` AI-Powered Coach

- Not discussed in depth; future exploration

### 16.4 `[DEFERRED]` Payments / Premium Features

- Platform remains free during this cycle

---

## 17. IMPLEMENTATION PRIORITY GUIDE

Suggested order (optimized for dependency management):

**Phase 1: Foundation (Week 1-2)**

1. Theme token system finalization (0.1)
2. Schema extensions (Attempt.wrongReasons, analysisNotes, User.preferences) (1.2, 1.3, 9.1)
3. Reason taxonomy file (1.1)
4. Error code enum (8.3)
5. Pre-commit hook (0.2)

**Phase 2: Reason Loop (Week 2-3)** 6. Reason capture endpoint (1.4) 7. Results page reason tagging UI (1.5) 8. Coverage metric + meter (1.6) 9. Weekly reason summary endpoint (1.7)

**Phase 3: Analytics Core (Week 3-4)** 10. Analytics service module (2.1) 11. Performance detail endpoint (2.3) 12. Dashboard bundle endpoint (2.4)

**Phase 4: UI Surfaces (Week 4-6)** 13. Performance Studio page + components (2.2) 14. Dashboard enhancements (greeting, stats, reason widget) (2.5, 2.6, 2.7, 1.8) 15. Results page enhancements (score card, category table, notes) (4.1, 4.3, 4.4)

**Phase 5: Test Experience (Week 6-7)** 16. MFR system + submit guard (3.1, 3.2) 17. Keyboard navigation (3.4, 3.5) 18. Layout optimization (3.3)

**Phase 6: Secondary Features (Week 7-8)** 19. Personal best logic (6.1) 20. Archive filters (5.1) 21. Admin enhancements (7.1, 7.2, 7.3) 22. Preferences + onboarding (9.2, 9.3)

**Phase 7: Polish (Week 8-9)** 23. Security hardening (8.1, 8.2, 8.4, 8.5) 24. Global components (13.1, 13.2, 13.3, 13.4, 13.5) 25. Feedback modifications (10.1) 26. Static page fixes (12.1, 12.2) 27. Contact form (11.1)

**Phase 8: Performance & Metrics (Week 9-10)** 28. Instrumentation (14.1, 14.2, 14.3) 29. Metrics tracking (15.1, 15.2, 15.3) 30. Performance validation against budgets

---

## 18. TESTING REQUIREMENTS

For each feature:

**Backend:**

- Unit tests for new service functions
- Integration tests for new endpoints
- Validation tests for schema constraints

**Frontend:**

- Component tests for new UI components
- E2E tests for critical flows (reason tagging, MFR submission)
- Visual regression tests for theme consistency

**Performance:**

- Load test analytics endpoints with 10k attempt dataset
- Measure client chart render times
- Validate cache hit/miss behavior

---

## 19. DOCUMENTATION UPDATES NEEDED

1. **API Documentation**

   - Document new endpoints with request/response examples
   - Update error code reference table

2. **Component Library**

   - Storybook stories for all new components
   - Props documentation

3. **User Guide**

   - How to use reason tagging
   - How to read Performance Studio charts
   - Keyboard shortcuts reference

4. **Admin Guide**
   - Duplicate detection workflow
   - Schedule planner usage

---

## 20. ROLLOUT & MONITORING

**Rollout Strategy:**

- Phase 1-3: Internal testing
- Phase 4: Beta with select users (collect feedback on reason taxonomy clarity)
- Phase 5-8: Full rollout

**Monitoring:**

- Track reason coverage metric weekly
- Monitor API latencies (alert if P95 exceeds targets)
- Watch error rates (especially INVALID_REASON_CODE)
- Collect user feedback on Performance Studio clarity

**Success Criteria:**

- ≥70% reason coverage by week 4
- ≥60% Performance Studio adoption by week 8
- API P95 within targets
- Zero raw hex violations after Phase 1

---

## END OF SPECIFICATION

This document represents the complete scope of new work discussed. Anything not listed here is either unchanged or explicitly deferred to future cycles.

For questions or clarifications, refer to:

- `design-system.md` (color token rationale)
- `NEXT_GEN_SPRINT_PLAN.md` (technical build spec)
- Conversation history (product context)
