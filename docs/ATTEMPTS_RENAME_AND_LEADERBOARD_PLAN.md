ATTEMPTS rename + Leaderboard consolidation — Change Plan

## Purpose

This document lists every change required to rename the frontend feature folder "results" → "attempts", consolidate leaderboard routes, and align breadcrumbs and copy. It is a step-by-step, line-level migration checklist to be applied atomically.

## Scope

- Move: client/src/features/results → client/src/features/attempts (preserve internal relative imports)
- Update import paths across the codebase that reference the old folder
- Replace UI copy where user-facing label "Results" should become "Attempts"
- Consolidate leaderboard routes: standardize on /leaderboard (remove or hide /leaderboard/local)
- Update breadcrumbs TITLE_MAP and improve breadcrumb behavior for attempt pages
- Run smoke checks and fix remaining import/runtime issues

## Atomic strategy

1. Move the folder in the workspace (git mv style) so relative internal imports remain valid.
2. Replace all imports that reference './features/results/...' → './features/attempts/...'.
3. Update AppRoutes and Sidebar to use a single leaderboard path /leaderboard.
4. Update breadcrumbs TITLE_MAP and add explicit mapping for 'analysis'.
5. Update static/help copy strings.
6. Run a dev build (vite) and resolve any import/runtime errors.
7. Optionally: set up redirects or short aliases for external links (not covered here).

## Files to move

Move entire directory (preserve nested paths):

- client/src/features/results/
  - ResultsPage.jsx
  - AttemptDetail.jsx
  - components/
    - CategoryAccuracyTable.jsx
    - ReasonTagSelect.jsx
    - CoverageMeter.jsx
    - AttemptScoreCard.jsx
    - StatsPanel.jsx

**Status:** DONE — files copied to `client/src/features/attempts` and originals removed in batch 1.

(If additional files exist in the folder, move them too.)

## Exact import changes (find-and-replace)

Make these path substitutions across repo files that import from the results folder.

1. client/src/AppRoutes.jsx

- Replace imports:

  - import ResultsPage from './features/results/ResultsPage'
  - import Results from './features/results/ResultsPage'
  - import AttemptDetail from './features/results/AttemptDetail'

  With:

  - import ResultsPage from './features/attempts/ResultsPage'
  - import Results from './features/attempts/ResultsPage'
  - import AttemptDetail from './features/attempts/AttemptDetail'

- Route registrations: leave route paths (/attempts, /attempts/:id, /attempts/:id/analysis) as-is. Update leaderboard routes (see section below).

2. client/src/features/analysis/Analysis.jsx

- Replace imports:

  - import { CoverageMeter } from '../results/components/CoverageMeter'
  - import { CategoryAccuracyTable } from '../results/components/CategoryAccuracyTable'
  - import { ReasonTagSelect } from '../results/components/ReasonTagSelect'

  With:

  - import { CoverageMeter } from '../attempts/components/CoverageMeter'
  - import { CategoryAccuracyTable } from '../attempts/components/CategoryAccuracyTable'
  - import { ReasonTagSelect } from '../attempts/components/ReasonTagSelect'

3. Search/Replace across repo: any path that contains /features/results/ → /features/attempts/

- Candidate files discovered in scan:
  - client/src/AppRoutes.jsx (handled)
  - client/src/features/analysis/Analysis.jsx (handled)
  - client/src/features/results/\* (these files are moving)

Status: PARTIAL — AppRoutes.jsx and Analysis.jsx imports updated to point to `features/attempts`. Remaining: run a repo-wide replace to catch any additional references and remove old files.

Note: Relative imports internal to the moved folder (e.g. './components/..') are preserved and should not be changed.

## UI copy and content updates (user-facing)

Update wording where appropriate. Files identified:

- client/src/features/dashboard/Dashboard.jsx

  - Button: change text
    - "View Results" → "View attempt details" (recommended)

- client/src/content/static.json

  - Example: "Receive immediate results with detailed explanations for every question. Learn from your mistakes instantly."
    - Suggested: "Receive instant attempt summaries with detailed explanations for every question. Learn from your mistakes instantly."

- client/src/content/help.json

  - Title: "Results & history" → "Attempts & history"
  - Content mentioning "Results lists past attempts..." → "Attempts list past runs with date, score, duration, topics, and quick stats."

- client/src/features/static/Home/Overview.jsx

  - Update description strings referencing "results" to use "attempts" or "attempt summaries" as preferred.

- Admin strings (optional): you may keep admin-facing strings as-is or update them for consistency.

## Leaderboard consolidation

Goal: canonical global leaderboard at /leaderboard.

1. client/src/AppRoutes.jsx

- Replace route manifest entries:

  - Remove { path: '/leaderboard/global' } and { path: '/leaderboard/local' }
  - Add or keep { path: '/leaderboard' }

- Replace Route elements inside Shell:
  - Replace:
    <Route path="/leaderboard/global" element={<Leaderboard />} />
    <Route path="/leaderboard/local" element={<LeaderboardLocal />} />
  - With:
    <Route path="/leaderboard" element={<Leaderboard />} />

2. client/src/components/layout/Sidebar.jsx

- Replace links:
  - to="/leaderboard/global" → to="/leaderboard"
  - Remove the local (cohort) link (it is currently commented; ensure only the global link remains and points to /leaderboard)

3. client/src/features/help/Help.jsx and other help/content files

- Update any hard-coded link to /leaderboard/global or /leaderboard/local to /leaderboard

4. client/src/features/community/LeaderboardLocal.jsx

- Option A (safer): keep file in place (unused) but remove route/link.
- Option B (clean): remove the file if you want to fully delete the local leaderboard feature.

5. client/src/lib/aggregation.js

- No change required (uses /all/leaderboard API).

Status: PARTIAL — AppRoutes and Sidebar updated to use `/leaderboard`. Help/content links updated. Remaining: decide whether to remove `LeaderboardLocal.jsx` file and add optional redirect from `/leaderboard/global` to `/leaderboard` for external compatibility.

## Breadcrumbs and TopBar back behavior

File: client/src/lib/breadcrumbs.jsx

1. TITLE_MAP changes

- Remove or alias 'results: "Results"' to avoid duplication/ambiguity.
- Ensure 'attempts: "Attempts"' remains present.
- Add explicit mapping:
  - analysis: 'Analysis'

Status: DONE — 'results' key removed and 'analysis' label added to TITLE_MAP in `client/src/lib/breadcrumbs.jsx`.

2. Dynamic ID crumb handling

- Current behavior: 24/32 hex ids render as 'Details'.
- Recommendations (pick one):
  - Quick: keep 'Details' for ID segments but make the parent crumb more descriptive (e.g., 'Attempt Details' for `/attempts/:id`). Implement by detecting when last segment is an ID and adjusting previous crumb label.
  - Preferred UX: show the RC title in the crumb. To implement, when navigating to the attempt detail or analysis pages, include `state: { title: rc.title }` in navigate() and prefer `location.state.title` for final crumb label.

3. TopBar Back

- Make Back deterministic: use breadcrumbs as the back target. Implementation:
  - If crumbs length > 1, navigate to crumbs[crumbs.length - 2].href (use replace: false or true depending on desired history behavior).
  - Else fallback to history.back().

## Files referencing attempts (no change to paths but to check)

- client/src/features/test/Test.jsx (POST /attempts; nav to `/attempts/${attemptId}`) — no path change required. Ensure imports referencing moved files updated if present.
- client/src/features/test/Today.jsx (links to `/attempts/${rc.id}/analysis`) — no path change.
- client/src/features/performance/components/RecentAttempts.jsx (to={`/attempts/${rcId}/analysis`}) — no path change.
- client/src/features/archive/Archive.jsx (links to attempts analysis) — no path change.

## Validation & smoke-check

After applying changes:

1. In the `client` directory run:

```powershell
npm ci
npm run build
# or for a dev-hot reload check
npm run dev
```

2. Confirm the app compiles and the dev server starts. If build fails, fix missing imports (common pattern: a leftover `features/results` import somewhere).
3. Test flows manually in browser:

- Sidebar → Attempts → open attempt → click "View full analysis"
- Submit a test (Test.jsx) and ensure it navigates to `/attempts/:id` and does not leave duplicate history entries (the Test.jsx earlier was already updated to use `navigate('/attempts/${id}', { replace: true })`).
- Sidebar → Leaderboard (should point to `/leaderboard` and render the global component)

## Quality gates to report after migration

- Build: PASS/FAIL (Vite build)
- Lint/type errors: PASS/FAIL (run project's lint or tsc if present)
- Smoke test: PASS/FAIL (manual route checks above)

## Edge cases & notes

- External bookmarks/links to `/leaderboard/global` will 404 after change; consider adding a small redirect route that maps `/leaderboard/global` → `/leaderboard` with a <Navigate to="/leaderboard" replace /> if you expect external links.
- Breadcrumbs that show 'Details' for attempt ids are less friendly; for best UX include attempt title in navigation state when you `nav()` to detail pages.
- If server-side rendering or SSG exists, ensure imports are consistent and the folder move is reflected where necessary.
- Admin/legacy references to the string "Results" may exist in docs or emails — those are out-of-scope for this code-only migration.

## Patch application strategy

- I will apply the move+imports update in a single atomic change (one patch). Then run the build and fix any misses.
- If you want a preview before applying, I will produce the patch and wait for your approval.

## Follow-ups (after this migration)

- Consider updating breadcrumbs to display friendly attempt titles by passing `state.title` on navigate or by adding a small client-side cache of last-opened attempt titles.
- Optionally add a route redirect from `/leaderboard/global` to `/leaderboard` for safety.
- Update any external docs or marketing copy that refer to "Results" to avoid mismatch.

End of plan
