# 🤖 Agent Handoff: ARC Platform Development

**Date:** October 6, 2025  
**Project:** ARC RC Prep Platform (Reading Comprehension test preparation)  
**Tech Stack:** React + Vite (Frontend), Node + Express + MongoDB (Backend)  
**Theme:** Crimson Trust Design System (Light Mode)

---

## 📋 Your Mission

You are taking over active development of the ARC platform. Your primary goals are:

1. **Implement new features** from the product spec
2. **Follow the design system** religiously (no raw hex values!)
3. **Build components** that are consistent, accessible, and performant
4. **Maintain code quality** while moving fast

---

## 📚 Required Reading (Attached Docs)

Please review these documents in order:

### 1. `docs/design-system.md` ⭐ **START HERE**
   - **Why:** Your bible for styling, components, patterns, and conventions
   - **Key Sections:**
     - §2: Color tokens (Crimson Trust palette)
     - §12: Component patterns with real code examples
     - §13: Layout conventions (Shell pattern, container widths)
     - §17: Accessibility implementation guide
     - §19: Naming conventions and class patterns
     - §20: Component catalog (what's already built)
   - **Critical Rule:** NEVER use raw hex colors. Always use semantic tokens.

### 2. `docs/PRODUCT_SPEC_NEW_FEATURES.md`
   - **Why:** Defines WHAT to build and WHY
   - **Focus Areas:**
     - §1: Wrong Answer Reason Loop (reflection system)
     - §2: Analytics Pipeline & Performance Studio
     - §3: Test Experience Enhancements (MFR, keyboard nav)
     - §4: Results Page Enhancements
     - §17: Implementation Priority Guide (build order)
   - **User Impact:** Each feature explains the problem it solves

### 3. `docs/NEXT_GEN_SPRINT_PLAN.md`
   - **Why:** Technical implementation contract
   - **Key Sections:**
     - §2: Reason taxonomy & data models
     - §3: Analytics service architecture
     - §15: API endpoints reference table
     - §19: Suggested implementation order
   - **Architecture:** Backend service patterns, caching strategy, perf targets

### 4. `docs/DOCS_CLEANUP_RECOMMENDATIONS.md`
   - **Why:** Explains document organization and cross-references
   - **Use:** When you need to know which doc is authoritative for what

---

## 🎯 Current State Summary

### ✅ What's Implemented (Recent Work)

**Mobile & Desktop Navigation:**
- ✅ Left-side mobile drawer with slide animation, swipe-to-close, browser back integration
- ✅ Desktop sidebar (rail/expanded modes) with unlock slide-back transition
- ✅ Focus management (trap, restore) for accessibility
- ✅ Responsive breadcrumbs with conditional back button
- ✅ Test routes hide sidebar completely

**Design System Foundation:**
- ✅ Complete Crimson Trust palette in `tailwind.config.js`
- ✅ Comprehensive design-system.md with 20+ sections
- ✅ Real component patterns extracted from codebase
- ✅ Auth pages (50/50 layout with gradient banner)
- ✅ Results & Analysis pages wrapped in Shell

**Practice Test Flow:**
- ✅ Practice mode local score computation
- ✅ Answer reveal toggle (hidden by default, button to show)
- ✅ Results page navigation from test completion

### 🔄 What Needs Building (Priority Order)

**Phase 1: Reason Loop Foundation (HIGH PRIORITY)**
- [ ] Schema extension: Add `wrongReasons[]` and `analysisNotes` to Attempt model
- [ ] Create `reasonCodes.js` with 7 reason types
- [ ] API endpoint: `PATCH /api/attempts/:id/reasons`
- [ ] UI component: `<ReasonTagSelect />` for Results page
- [ ] Coverage metric calculation (trailing 30 days)
- [ ] `<CoverageMeter />` component

**Phase 2: Dashboard Enhancements**
- [ ] Bundle endpoint: `GET /api/dashboard`
- [ ] `<DashboardGreeting />` with time-of-day and streak
- [ ] `<DashboardStatsRow />` (attempts, accuracy, coverage)
- [ ] `<ReasonSummaryWidget />` showing top 2 friction points
- [ ] `<ProgressPreview />` sparkline chart

**Phase 3: Performance Studio (NEW PAGE)**
- [ ] Analytics service: `analytics.service.js` with caching
- [ ] API endpoint: `GET /api/performance?range={7|30|90}`
- [ ] Page route: `/performance`
- [ ] `<RadarChart />` (accuracy vs target per question type)
- [ ] `<TimelineChart />` (attempts bars + accuracy line)
- [ ] `<QuestionTypeTable />` with sorting and color-coded accuracy
- [ ] CSV export functionality

**Phase 4: Test Experience**
- [ ] Marked-For-Review (MFR) system with visual indicators
- [ ] `<MFRConfirmModal />` submit guard
- [ ] Keyboard navigation (↑↓ for questions, 1-4 for answers, M for MFR)
- [ ] `<KeyboardShortcutsModal />` help popover
- [ ] Layout optimization (55/45 split on desktop)

---

## 🎨 Design System Rules (NON-NEGOTIABLE)

### Color Usage
```jsx
// ✅ DO: Use semantic tokens
<button className="bg-primary hover:bg-primary-light active:bg-primary-dark text-white">

// ❌ DON'T: Raw hex values
<button className="bg-[#D33F49] hover:bg-[#E25C62]">
```

### Component Patterns
```jsx
// ✅ DO: Follow established patterns (see design-system.md §12)

// Navigation item active state
<button className="text-primary bg-primary/15 hover:bg-surface-muted">

// Card container
<Card className="max-w-xl mx-auto">
  <CardHeader>
    <h2 className="text-xl font-semibold text-text-primary">Title</h2>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>

// Primary button (CORRECT - not using Button.jsx which has wrong variant)
<button className="px-3.5 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary-light transition-colors">
  Submit
</button>
```

### Focus & Accessibility
```jsx
// ✅ ALWAYS include focus ring on interactive elements
<button className="focus:outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-2">

// ✅ Icon buttons need aria-label
<button aria-label="Close navigation">
  <X size={18} />
</button>

// ✅ Announce dynamic changes
<div role="status" aria-live="polite">
  {loading ? 'Loading...' : 'Loaded'}
</div>
```

### Responsive Patterns
```jsx
// ✅ Mobile-first approach
<div className="p-4 md:p-6 lg:p-8">
  <h1 className="text-2xl md:text-3xl lg:text-4xl">

// ✅ Hide/show by breakpoint
<button className="md:hidden">Mobile Only</button>
<button className="hidden md:inline-flex">Desktop Only</button>
```

---

## 🏗️ Architecture Patterns

### API Response Format
```javascript
// Success
{
  data: { /* payload */ },
  message: "Success message"
}

// Error (standardized)
{
  errorCode: "INVALID_REASON_CODE",
  message: "Human-readable error"
}
```

### Component Organization
```
features/
  dashboard/
    Dashboard.jsx           // Page component
    DashboardGreeting.jsx   // Feature-specific component
    StatsRow.jsx           // Feature-specific component
components/
  ui/
    Button.jsx             // Reusable primitive
    Card.jsx               // Reusable primitive
  layout/
    Shell.jsx              // Layout wrapper
    Sidebar.jsx            // Navigation
```

### State Management
- **Local state:** `useState` for component-only data
- **Context:** `AuthContext`, `MobileNavContext` for cross-cutting concerns
- **API state:** Direct fetch + local state (no Redux/Tanstack Query yet)
- **Caching:** Backend analytics service uses LRU cache (60s TTL)

---

## 🚨 Common Pitfalls to Avoid

### 1. Button Component Anti-Pattern
**Problem:** Current `Button.jsx` uses `accent-amber` as primary variant (WRONG per design system)

**Solution:** Use inline classes for primary buttons until Button.jsx is refactored:
```jsx
// ✅ Correct primary button
<button className="bg-primary hover:bg-primary-light text-white ...">

// ❌ Don't use <Button variant="primary"> until it's fixed
```

### 2. Shell Wrapping
**Remember:** Test routes (`/test/*`) should NOT be wrapped in Shell (no sidebar)
```jsx
// ✅ Correct route structure
<Route element={<Shell />}>
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/results/:id" element={<Results />} />
</Route>

<Route path="/test/:id" element={<Test />} /> {/* No Shell! */}
```

### 3. Avatar Loading
**Remember:** Use session-level cache to prevent repeated loading skeleton:
```jsx
const avatarLoadedCache = new Set()

const [loaded, setLoaded] = useState(avatarLoadedCache.has(userId))

const handleLoad = () => {
  setLoaded(true)
  avatarLoadedCache.add(userId)
}
```

### 4. Focus Management
**Remember:** Always restore focus when closing overlays:
```jsx
const toggleRef = useRef()

const open = () => {
  toggleRef.current = document.activeElement
  setIsOpen(true)
}

const close = () => {
  setIsOpen(false)
  toggleRef.current?.focus()
}
```

---

## 📊 Performance Targets

- Dashboard bundle API: P95 <200ms (cold <350ms)
- Performance detail endpoint: P95 <250ms @10k attempts
- Client chart renders: ≤24ms/frame (radar), ≤16ms/frame (timeline)
- CSV export: <1.5s for 90 days
- Test page interaction: 60fps (16ms/frame)

**Measurement:** Use Performance API `mark()` / `measure()` for critical paths

---

## 🔧 Development Workflow

### 1. Before Starting a Feature
- [ ] Read design-system.md section relevant to your component
- [ ] Review product spec for user impact and acceptance criteria
- [ ] Check sprint plan for API contracts and data models
- [ ] Sketch component structure on paper/whiteboard

### 2. During Implementation
- [ ] Use semantic tokens exclusively (no raw hex)
- [ ] Follow mobile-first responsive patterns
- [ ] Add focus rings and ARIA attributes
- [ ] Test keyboard navigation
- [ ] Check accessibility with screen reader

### 3. Before Committing
- [ ] Run `npm run lint` (frontend and backend)
- [ ] Test on mobile viewport (Chrome DevTools)
- [ ] Verify focus order and keyboard access
- [ ] Check for console errors/warnings
- [ ] Ensure no raw hex values (pre-commit hook will catch this)

### 4. Component Checklist
Every new component should have:
- [ ] TypeScript props documentation (or JSDoc)
- [ ] Mobile and desktop responsive behavior
- [ ] Focus ring on interactive elements
- [ ] ARIA attributes where needed
- [ ] Loading/error states
- [ ] Semantic token usage only

---

## 🎯 Immediate Next Steps (Suggested Start)

### Option A: Quick Win (2-3 hours)
Build `<DashboardGreeting />` component:
1. Read design-system.md §12.5 (Dashboard patterns)
2. Create component with time-of-day logic
3. Add streak display
4. Style with tokens (bg-card-surface, text-primary)
5. Test responsiveness

### Option B: Foundation Work (1-2 days)
Implement Reason Loop backend:
1. Extend Attempt schema (wrongReasons[], analysisNotes)
2. Create reasonCodes.js with 7 codes
3. Build PATCH /api/attempts/:id/reasons endpoint
4. Write unit tests for validation
5. Test with Postman/curl

### Option C: Full Feature (3-5 days)
Build Performance Studio page:
1. Create analytics.service.js with all aggregations
2. Implement caching (LRU with 60s TTL)
3. Build GET /api/performance endpoint
4. Create /performance route and page layout
5. Build all chart components (Radar, Timeline, Table)
6. Add CSV export

**My Recommendation:** Start with Option B (foundation) → then A (quick win) → then C (full feature)

---

## 📞 Context You Should Know

### Recent Conversation History
The previous agent:
1. Fixed mobile navigation (drawer with swipe-to-close, browser back integration)
2. Implemented desktop sidebar unlock transition
3. Fixed practice test results flow and answer reveal
4. Wrapped Results/Analysis in Shell for proper layout
5. Created comprehensive design-system.md with 20 sections
6. Analyzed and documented all component patterns

### User's Development Style
- Prefers clear, actionable specs over vague descriptions
- Values consistency and maintainability
- Appreciates accessibility being baked in from the start
- Likes seeing real code examples in documentation
- Wants smooth handoffs between agents

### Project Philosophy
- **Quality over speed** - Do it right the first time
- **User experience first** - Every feature should solve a real problem
- **Accessibility is not optional** - Keyboard nav and screen readers matter
- **Design system is law** - No exceptions for raw hex or ad-hoc styling
- **Performance matters** - Target 60fps, <200ms API responses

---

## 🤝 How to Communicate with User

### When Asking Questions
- Be specific: "Should the CoverageMeter show percentage or fraction (e.g., 12/20)?"
- Provide options: "For the RadarChart, should I use Option A (Recharts) or Option B (D3)?"
- Show examples: "Here's a mockup of the layout I'm proposing..."

### When Reporting Progress
- Be clear about status: "✅ Complete: API endpoint | 🔄 In Progress: UI component | ⏳ Next: Tests"
- Mention blockers early: "⚠️ Blocked: Need decision on error handling strategy"
- Show your work: Share code snippets, screenshots, or deployed previews

### When You're Stuck
- State what you've tried: "I tested approaches X, Y, Z..."
- Explain the tradeoff: "Option A is faster but less maintainable vs..."
- Ask specific questions: "Should I prioritize performance or code simplicity here?"

---

## 🎁 Quick Reference Links

**File Paths (Important):**
- Design system: `docs/design-system.md`
- Product spec: `docs/PRODUCT_SPEC_NEW_FEATURES.md`
- Sprint plan: `docs/NEXT_GEN_SPRINT_PLAN.md`
- Tailwind config: `client/tailwind.config.js`
- Sidebar pattern: `client/src/components/layout/Sidebar.jsx`
- Auth pattern: `client/src/components/layout/AuthShell.jsx`
- Results page: `client/src/features/results/Results.jsx`

**Color Tokens (Most Used):**
- Primary action: `bg-primary` (#D33F49 crimson)
- Hover: `hover:bg-primary-light` (#E25C62)
- Active: `active:bg-primary-dark` (#B32F3A)
- Card background: `bg-card-surface` (#FFFFFF)
- Muted surface: `bg-surface-muted` (#EEF1FA)
- Text primary: `text-text-primary` (#273043)
- Text secondary: `text-text-secondary` (#5C6784)
- Border: `border-soft` (#D8DEE9)
- Focus ring: `ring-focus-ring` (#1A2A6C navy)

**Component Imports:**
```jsx
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, PasswordInput } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/components/auth/AuthContext'
```

---

## ✅ Checklist Before You Start Coding

- [ ] I've read design-system.md sections 2, 12, 13, 17, 19, 20
- [ ] I've reviewed the product spec for features I'm building
- [ ] I've checked the sprint plan for API contracts
- [ ] I understand the color token system (no raw hex!)
- [ ] I know the component patterns (navigation, cards, buttons)
- [ ] I understand focus management and accessibility requirements
- [ ] I've looked at existing similar components for patterns
- [ ] I have a clear implementation plan
- [ ] I know where to find answers (which doc is authoritative for what)

---

## 🚀 Ready to Build!

You have everything you need to continue development. The codebase is well-organized, the design system is comprehensive, and the product spec is clear.

**Your goal:** Implement features that are consistent, accessible, performant, and delightful to use.

**When in doubt:** Check design-system.md first, then ask the user.

**Remember:** You're building a platform that helps students improve their reading comprehension skills. Every component you build, every interaction you polish, contributes to that mission.

Good luck, and happy coding! 🎉

---

**Last Updated:** October 6, 2025  
**Handoff From:** GitHub Copilot Agent (Design System & Navigation Implementation)  
**Handoff To:** Next Development Agent  
**Status:** Ready for Phase 1 implementation (Reason Loop Foundation)
